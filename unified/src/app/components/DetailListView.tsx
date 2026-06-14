import { ChevronLeft, ChevronUp, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect, type ReactNode } from 'react';

// ════════════════════════════════════════════════════════════════════════
//  DetailListView — reusable 1-bit "information list" page.
//
//  One pattern for every detail / info-list screen on the e-ink wallet:
//   • Peer-level fields — no field is framed as a hero (the screen that opens
//     the detail already owns the hero). The only hierarchy is WITHIN a field:
//     a quiet label over a prominent value.
//   • Full content, never truncated — values wrap (security: an amount or
//     address must never be clipped).
//   • Overflow flips WHOLE pages: short fields pack on a field boundary; a
//     single `flow` field (long message / raw calldata) scrolls its value across
//     pages so it is never clipped either. Page number top-right, Prev/Next
//     pager at the bottom (Sign History style).
//
//  See DETAIL_LIST_SPEC.md for the full spec and the rules other list-type
//  features should follow.
// ════════════════════════════════════════════════════════════════════════

export interface DetailField {
  label: string;
  /** Fully-styled value node. Use the value classes from the spec:
   *  plain → text-2xl font-normal; long/mono → text-xl font-mono; amounts →
   *  <PreciseAmount/>; addresses → <BoldEndsAddress/>. */
  value: ReactNode;
  /** Long text block (full message, raw calldata). At most one per view and it
   *  must be the LAST field. Its value flows across pages via internal scroll
   *  instead of being packed whole, so it is never clipped; its label is kept as
   *  a header on every page it spans. */
  flow?: boolean;
}

/** Quiet 18px label — light weight + uppercase + tracking carry the
 *  "de-emphasis" (size can't drop below the 18px floor); leading-none keeps it
 *  visually tight to its value so the label↔value gap reads as ~half the
 *  field↔field gap. */
const LABEL = 'text-lg font-light text-black uppercase tracking-wide leading-none mb-1.5';
const LABEL_MB = 6; // mb-1.5 below the label (not counted in offsetHeight)

/** Full-precision amount. A signing screen must never round, so every decimal
 *  stays visible — the number renders as one uniform value-style span (24px
 *  normal, same as other detail values) and wraps via break-all when long. */
export function PreciseAmount({ amount, token, network }: { amount: string; token?: string; network?: string }) {
  return (
    <div className="flex items-baseline gap-x-2 flex-wrap leading-tight tabular-nums">
      <span className="text-2xl font-normal text-black tracking-tight break-all">{amount}</span>
      {token && (
        <span className="text-lg font-normal text-black uppercase whitespace-nowrap">
          {token}{network ? ` (${network})` : ''}
        </span>
      )}
    </div>
  );
}

/** Renders an address with its first 6 and last 6 characters bold, the middle at
 *  normal weight — mirrors how hardware wallets emphasise the ends users verify.
 *  Full address always shown (no truncation — security). Caller supplies
 *  font-size/mono via className; this only controls weight. */
export function BoldEndsAddress({ addr, className = '' }: { addr: string; className?: string }) {
  if (addr.length <= 12) {
    return <span className={`font-bold ${className}`}>{addr}</span>;
  }
  const head = addr.slice(0, 6);
  const mid = addr.slice(6, -6);
  const tail = addr.slice(-6);
  return (
    <span className={className}>
      <span className="font-bold">{head}</span>{mid}<span className="font-bold">{tail}</span>
    </span>
  );
}

interface DetailListViewProps {
  title: string;
  onBack: () => void;
  fields: DetailField[];
  /** Changes to this string trigger a re-measure + reset to page 1. Pass a value
   *  that captures the data identity (e.g. `${type}:${network}`). */
  dataKey?: string;
}

export function DetailListView({ title, onBack, fields, dataKey }: DetailListViewProps) {
  const [page, setPage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<number[][]>([]);                           // field-boundary mode
  const [flow, setFlow] = useState<{ total: number; fixedPages: number[][]; vp0: number; vp1: number } | null>(null); // flow mode

  const flowIndex = fields.findIndex(f => f.flow);
  const hasFlow = flowIndex >= 0;
  const fixedFields = hasFlow ? fields.filter(f => !f.flow) : fields;
  const flowField = hasFlow ? fields[flowIndex] : null;

  const renderField = (f: DetailField, i: number) => (
    <div key={i}>
      <div className={LABEL}>{f.label}</div>
      {f.value}
    </div>
  );

  // Measure once laid out (hidden pass) and compute the page model. Available
  // height is derived from the device root (600 − header − padding) so it is
  // independent of whether the pager bar is mounted (avoids double subtraction).
  useEffect(() => {
    setPage(0);
    if (!measureRef.current || !containerRef.current) return;
    const GAP = 16;  // gap-4 between fields
    const BAR = 90;  // bottom pager bar, only when paginating
    const rootEl = containerRef.current.parentElement; // w-400 h-600 device root
    const full = (rootEl ? rootEl.clientHeight : 555) - 45 - 32; // device − header − p-4
    const kids = Array.from(measureRef.current.children) as HTMLElement[];

    if (hasFlow) {
      // Measure children: [0..n-1] = fixed fields, [n] = flow label, [n+1] = flow value.
      const n = fixedFields.length;
      const fixedH = kids.slice(0, n).map(k => k.offsetHeight);
      const hLabel = (kids[n]?.offsetHeight || 0) + LABEL_MB;
      const hValue = kids[n + 1]?.offsetHeight || 0;
      const sumFixed = fixedH.reduce((a, b) => a + b, 0) + GAP * Math.max(0, n - 1);
      if (sumFixed + (n > 0 ? GAP : 0) + hLabel + hValue <= full) {
        setFlow({ total: 1, fixedPages: [], vp0: 0, vp1: 0 }); // everything fits on one page
      } else {
        const avail = full - BAR;
        // Boundary-pack the fixed fields (they may span several pages), then let
        // the flow START in the leftover space of the LAST fixed page (no
        // near-empty pages), continuing by whole viewports on later pages.
        const fixedPages: number[][] = [];
        let curF: number[] = [];
        let accF = 0;
        fixedH.forEach((h, i) => {
          if (curF.length && accF + GAP + h > avail) { fixedPages.push(curF); curF = []; accF = 0; }
          accF += (curF.length ? GAP : 0) + h;
          curF.push(i);
        });
        if (curF.length) fixedPages.push(curF);
        if (!fixedPages.length) fixedPages.push([]);            // flow-only view
        const lastLen = fixedPages[fixedPages.length - 1].length;
        const room = avail - accF - (lastLen ? GAP : 0) - hLabel - 4;
        const vp0 = room >= 100 ? room : 0;                     // flow start on the last fixed page
        const vp1 = Math.max(60, avail - hLabel - 4);           // flow viewport on later pages
        const rest = Math.max(0, hValue - vp0);
        const extra = vp0 > 0 ? Math.ceil(rest / vp1) : Math.max(1, Math.ceil(hValue / vp1));
        setFlow({ total: fixedPages.length + extra, fixedPages, vp0, vp1 });
      }
      setPages([]);
    } else {
      const total = kids.reduce((a, k) => a + k.offsetHeight, 0) + GAP * Math.max(0, kids.length - 1);
      const avail = total > full ? full - BAR : full;
      const result: number[][] = [];
      let cur: number[] = [];
      let acc = 0;
      kids.forEach((k, i) => {
        const h = k.offsetHeight;
        if (cur.length && acc + GAP + h > avail) { result.push(cur); cur = []; acc = 0; }
        acc += (cur.length ? GAP : 0) + h;
        cur.push(i);
      });
      if (cur.length) result.push(cur);
      setPages(result.length ? result : [kids.map((_, i) => i)]);
      setFlow(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataKey, fields.length, hasFlow]);

  const totalPages = hasFlow ? (flow?.total || 1) : (pages.length || 1);
  const safePage = Math.min(page, totalPages - 1);

  // ── visible content for the current page ──
  let content: ReactNode;
  if (hasFlow && flowField) {
    const fp = flow?.fixedPages || [];
    const vp0 = flow?.vp0 || 0;
    const vp1 = flow?.vp1 || 0;
    const flowHeader = <div className={LABEL}>{flowField.label}</div>;
    if ((flow?.total || 1) <= 1) {
      content = (<>{fixedFields.map(renderField)}<div>{flowHeader}{flowField.value}</div></>);
    } else if (safePage < fp.length - 1) {
      // A full fixed-field page.
      content = fp[safePage].map(i => renderField(fixedFields[i], i));
    } else if (safePage === fp.length - 1) {
      // Last fixed page — the flow starts here when there is room (vp0).
      content = (
        <>
          {fp[safePage].map(i => renderField(fixedFields[i], i))}
          {vp0 > 0 && (
            <div>
              {flowHeader}
              <div className="overflow-hidden" style={{ height: vp0 }}>
                <div style={{ transform: 'translateY(0px)' }}>{flowField.value}</div>
              </div>
            </div>
          )}
        </>
      );
    } else {
      // Flow continuation pages — scrolled past vp0, then whole vp1 viewports.
      const offset = vp0 + (safePage - fp.length) * vp1;
      content = (
        <div>
          {flowHeader}
          <div className="overflow-hidden" style={{ height: vp1 }}>
            <div style={{ transform: `translateY(-${offset}px)` }}>{flowField.value}</div>
          </div>
        </div>
      );
    }
  } else {
    const pageList = pages.length ? pages : [fields.map((_, i) => i)];
    content = (pageList[safePage] || []).map(i => renderField(fields[i], i));
  }

  return (
    <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
      {/* Header — back (left) + page number (top-right). */}
      <div className="h-[45px] px-5 flex items-center justify-between border-b-2 border-black flex-shrink-0">
        <button onClick={onBack} className="flex items-center gap-2 active:scale-95 transition-transform">
          <ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
          <span className="text-lg font-bold text-black uppercase tracking-wide">{title}</span>
        </button>
        {totalPages > 1 && (
          <span className="text-lg font-bold text-black tabular-nums pr-1">{safePage + 1}/{totalPages}</span>
        )}
      </div>

      {/* Content area — hidden measuring pass overlays the visible current page;
          both share the same p-4 width. */}
      <div ref={containerRef} className="flex-1 overflow-hidden relative">
        <div ref={measureRef} className="absolute inset-0 py-4 px-5 flex flex-col gap-4 opacity-0 pointer-events-none" aria-hidden="true">
          {hasFlow && flowField ? (
            <>
              {fixedFields.map(renderField)}
              <div className={LABEL}>{flowField.label}</div>
              <div>{flowField.value}</div>
            </>
          ) : (
            fields.map(renderField)
          )}
        </div>
        <div className="h-full py-4 px-5 flex flex-col gap-4">
          {content}
        </div>
      </div>

      {/* Bottom Prev/Next pager — Sign History style; line inset (mx-4) to match
          the outer signing page's action bar. Page number lives in the header. */}
      {totalPages > 1 && (
        <div className="flex items-center gap-3 mx-4 mt-3 mb-4 pt-3 border-t-2 border-black flex-shrink-0">
          {safePage > 0 && (
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              className="flex-1 h-12 border-2 border-black rounded-sm bg-[#838383] hover:bg-black hover:text-[#838383] active:scale-95 transition-all flex items-center justify-center gap-2 font-bold text-lg uppercase tracking-wide"
            >
              <ChevronUp className="w-5 h-5" strokeWidth={2.5} />
              Prev
            </button>
          )}
          {safePage < totalPages - 1 && (
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              className="flex-1 h-12 border-2 border-black rounded-sm bg-[#838383] hover:bg-black hover:text-[#838383] active:scale-95 transition-all flex items-center justify-center gap-2 font-bold text-lg uppercase tracking-wide"
            >
              Next
              <ChevronDown className="w-5 h-5" strokeWidth={2.5} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
