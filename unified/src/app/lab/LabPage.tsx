import { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronLeft, X, Delete, Bluetooth, BatteryMedium, Fingerprint, FlaskConical, LayoutGrid } from 'lucide-react';
import type { LabScreen, LabStyle } from './data';
import { LabelStyle } from './styles/label';
import { HudStyle } from './styles/hud';
import { TechwearStyle } from './styles/techwear';import { FonoStyle } from './styles/fono';
import { BentoStyle } from './styles/bento';
import { SerifStyle } from './styles/serif';
import { SketchStyle } from './styles/sketch';
import { ShadowStyle } from './styles/shadow';
import { CompositeStyle } from './styles/composite';
import { P1Instrument } from './styles/p1-instrument';import { P3Editorial } from './styles/p3-editorial';
import { TraditionalStyle } from './styles/traditional';
import { MinimalStyle } from './styles/minimal';
import { PosterStyle } from './styles/poster';
import { ReceiptStyle } from './styles/receipt';
import { FlowStyle } from './styles/flow';
import { SpreadStyle } from './styles/spread';
import { ClarityStyle } from './styles/clarity';import { RefinedStyle } from './styles/refined';
import { ManuscriptStyle } from './styles/manuscript';
import { DialStyle } from './styles/dial';
import { TicketStyle } from './styles/ticket';
import { LedgerStyle } from './styles/ledger';
import { TimelineStyle } from './styles/timeline';
import { BroadsheetStyle } from './styles/broadsheet';
import { PictographStyle } from './styles/pictograph';
import { EngravingStyle } from './styles/engraving';
import { WoodcutStyle } from './styles/woodcut';
import { InfographicStyle } from './styles/infographic';
import { LineiconStyle } from './styles/lineicon';
import { VerifyClassicStyle } from './styles/verify-classic';
import { STYLE_ORDER, STYLE_META, styleNo } from './styleMeta';

/**
 * Design Lab — editorial / typographic redesign surface (clean room).
 *
 * Style reference: black-on-paper agenda poster — huge index numerals, inverted
 * date/time chips, hairline rules, bold mixed CJK+Latin type. Ideal for 1-bit
 * e-ink. Base stays #838383; toggle 1-bit to see the true black-on-white panel.
 *
 * Two e-ink rules honoured here:
 *  - Type is sized UP so it stays legible at the real ~3-inch physical size.
 *  - NO scrolling anywhere. Long lists PAGINATE (Prev/Next, hidden at the
 *    boundaries) and detail is a tap-through full page, not an inline scroll.
 *
 * The device renders ONLY the prototype (LabDevice). All controls live OUTSIDE
 * the device frame (LabControls).
 */

export type { LabScreen, LabStyle };
const PRESS = 'active:bg-black active:text-[#838383]';

/* ---- shared editorial atoms ---- */
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center bg-black text-[#838383] text-[12px] font-bold leading-none px-2 py-1 tracking-wide">
      {children}
    </span>
  );
}

function BitFilter() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true">
      <filter id="eink-1bit" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0" />
        <feComponentTransfer>
          <feFuncR type="discrete" tableValues="0 1" />
          <feFuncG type="discrete" tableValues="0 1" />
          <feFuncB type="discrete" tableValues="0 1" />
        </feComponentTransfer>
      </filter>
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   DEVICE — full-bleed prototype (no controls inside).
   ════════════════════════════════════════════════════════════════════════ */
export function LabDevice({ screen, style }: { screen: LabScreen; style: LabStyle }) {
  return (
    <div className="flex-1 w-full relative bg-[#838383] flex flex-col overflow-hidden">
      {style === 'poster' && <PosterStyle screen={screen} />}
      {style === 'receipt' && <ReceiptStyle screen={screen} />}
      {style === 'flow' && <FlowStyle screen={screen} />}
      {style === 'spread' && <SpreadStyle screen={screen} />}
      {style === 'minimaldrill' && <MinimalStyle screen={screen} flow="drill" />}
      {style === 'minimaldense' && <MinimalStyle screen={screen} flow="dense" />}
      {style === 'clarity' && <ClarityStyle screen={screen} />}
      {style === 'refined' && <RefinedStyle screen={screen} />}
      {style === 'p1' && <P1Instrument screen={screen} />}
      {style === 'p3' && <P3Editorial screen={screen} />}
      {style === 'traditional' && <TraditionalStyle screen={screen} variant="asym" />}
      {style === 'tradtime' && <TraditionalStyle screen={screen} variant="asym" listVariant="timeline" />}
      {style === 'composite' && <CompositeStyle screen={screen} />}
      {style === 'editorial' && <Editorial screen={screen} />}
      {style === 'label' && <LabelStyle screen={screen} />}
      {style === 'techwear' && <TechwearStyle screen={screen} />}
      {style === 'hud' && <HudStyle screen={screen} />}
      {style === 'fono' && <FonoStyle screen={screen} />}
      {style === 'bento' && <BentoStyle screen={screen} />}
      {style === 'serif' && <SerifStyle screen={screen} />}
      {style === 'sketch' && <SketchStyle screen={screen} />}
      {style === 'shadow' && <ShadowStyle screen={screen} />}
      {/* ── 2026-06 new batch ── */}
      {style === 'manuscript' && <ManuscriptStyle screen={screen} />}
      {style === 'dial' && <DialStyle screen={screen} />}
      {style === 'ticket' && <TicketStyle screen={screen} />}
      {style === 'ledger' && <LedgerStyle screen={screen} />}
      {style === 'timeline' && <TimelineStyle screen={screen} />}
      {style === 'broadsheet' && <BroadsheetStyle screen={screen} />}
      {/* ── 2026-06 illustration batch ── */}
      {style === 'pictograph' && <PictographStyle screen={screen} />}
      {style === 'engraving' && <EngravingStyle screen={screen} />}
      {style === 'woodcut' && <WoodcutStyle screen={screen} />}
      {style === 'infographic' && <InfographicStyle screen={screen} />}
      {style === 'lineicon' && <LineiconStyle screen={screen} />}
      {style === 'verifyclassic' && <VerifyClassicStyle screen={screen} />}
    </div>
  );
}

/** Editorial style = the original Lab screens. */
function Editorial({ screen }: { screen: LabScreen }) {
  if (screen === 'home') return <EdHome />;
  if (screen === 'sign') return <EdSign />;
  if (screen === 'history') return <EdHistory />;
  return <EdSeed />;
}

/* ════════════════════════════════════════════════════════════════════════
   CONTROLS — floating dev panel OUTSIDE the device.
   ════════════════════════════════════════════════════════════════════════ */
interface LabControlsProps {
  screen: LabScreen; onScreen: (s: LabScreen) => void;
  style: LabStyle; onStyle: (s: LabStyle) => void;
  /** Open the side-by-side comparison gallery (optional). */
  onOpenGallery?: () => void;
}
const LAB_SCREENS: [LabScreen, string][] = [['home', 'Home'], ['sign', 'Sign'], ['history', 'History'], ['seed', 'Seed'], ['verify', 'Verify']];
// Style list + labels come from styleMeta.ts (single source of truth) — one flat
// numbered list, ordered by #NN.
export function LabControls({ screen, onScreen, style, onStyle, onOpenGallery }: LabControlsProps) {
  const styles = STYLE_ORDER.map((id) => [id, `#${styleNo(id)} ${STYLE_META[id].label}`] as [LabStyle, string]);
  const styleBtn = (id: LabStyle, label: string) => (
    <button
      key={id}
      onClick={() => onStyle(id)}
      className={`h-7 text-[11px] px-2.5 rounded font-bold transition-all text-left ${style === id ? 'bg-black text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
    >
      {label}
    </button>
  );
  return (
    <div className="fixed top-6 left-6 z-40 bg-white rounded-lg shadow-2xl border-2 border-gray-300 p-3 w-[170px]">
      <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-gray-200">
        <FlaskConical className="w-4 h-4 text-gray-600" />
        <span className="text-xs font-bold text-gray-700">Design Lab</span>
      </div>
      {onOpenGallery && (
        <button onClick={onOpenGallery} className="w-full mb-2.5 h-8 rounded bg-black text-white text-[11px] font-bold flex items-center justify-center gap-1.5 hover:bg-gray-800 transition-colors">
          <LayoutGrid className="w-3.5 h-3.5" strokeWidth={2.5} />全部并排对照 Gallery
        </button>
      )}
      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Screen</div>
      <div className="grid grid-cols-2 gap-1.5">
        {LAB_SCREENS.map(([id, label]) => (
          <button
            key={id}
            onClick={() => onScreen(id)}
            className={`h-8 rounded text-xs font-bold transition-all ${screen === id ? 'bg-black text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-2.5 pt-2.5 border-t border-gray-200">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Style · {styles.length}</div>
        <div className="flex flex-col gap-1 max-h-[58vh] overflow-y-auto">
          {styles.map(([id, label]) => styleBtn(id, label))}
        </div>
      </div>
    </div>
  );
}
function ControlToggle({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center justify-between">
      <span className="text-xs font-semibold text-gray-700">{label}</span>
      <span className={`relative w-10 h-5 rounded-full transition-colors ${on ? 'bg-emerald-500' : 'bg-gray-300'}`}>
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </span>
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   HOME — editorial cover + numbered index (4 rows fill the height).
   ════════════════════════════════════════════════════════════════════════ */
const HOME_ITEMS: [string, string][] = [
  ['Assets', '3 networks · 12 tokens'],
  ['History', '6 signatures today'],
  ['Passkey', 'FIDO2 enabled'],
  ['Settings', 'Device & security'],
];
function EdHome() {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="bg-black text-[#838383] px-4 pt-3.5 pb-3.5 flex-shrink-0">
        <div className="flex items-center text-[12px] font-bold uppercase tracking-[0.2em]">
          <span>◆ Wallet</span>
          <span className="ml-auto inline-flex items-center gap-2.5">
            <Bluetooth className="w-4 h-4" strokeWidth={2.5} />
            <span className="inline-flex items-center gap-1"><BatteryMedium className="w-5 h-5" strokeWidth={2.5} />78%</span>
          </span>
        </div>
        <div className="text-[40px] font-black tracking-tight leading-none mt-2">ELVES-5DW</div>
        <div className="text-[12px] tracking-[0.25em] mt-2">SAFEPAL OBSIDIAN</div>
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        {HOME_ITEMS.map(([title, sub], i) => (
          <button key={title} className={`flex-1 flex items-center gap-4 px-4 border-t border-black text-left ${PRESS}`}>
            <span className="text-[52px] font-black leading-none tabular-nums w-[68px] flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
            <div className="flex-1 min-w-0">
              <div className="text-[26px] font-black leading-tight">{title}</div>
              <div className="text-[14px] tracking-wide mt-0.5">{sub}</div>
            </div>
            <ChevronRight className="w-7 h-7 flex-shrink-0" strokeWidth={2.5} />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   HISTORY — paginated agenda ledger (no scroll). Tap a row → detail page.
   ════════════════════════════════════════════════════════════════════════ */
type Hist = { idx: string; date: string; time: string; title: string; sub: string; ok: boolean; kind: 'sent' | 'signed'; detail: [string, string][] };
const HIST: Hist[] = [
  { idx: '01', date: 'Jan 27', time: '14:32', title: '500 USDT', sub: 'Transfer · To My Ledger', ok: true, kind: 'sent', detail: [['To', 'My Ledger'], ['Address', '0x8Ba1…dBA72'], ['Network fee', '0.0008 ETH'], ['Tx hash', '0x9f2c…a1b2']] },
  { idx: '02', date: 'Jan 27', time: '14:01', title: '1,000 USDT', sub: 'Approve · Uniswap Router', ok: true, kind: 'sent', detail: [['Spender', 'Uniswap V3 Router'], ['Allowance', '1,000 USDT'], ['Network fee', '0.0006 ETH'], ['Tx hash', '0x77ab…9c3d']] },
  { idx: '03', date: 'Jan 26', time: '12:47', title: 'Uniswap login', sub: 'Sign · Message', ok: false, kind: 'signed', detail: [['dApp', 'app.uniswap.org'], ['Type', 'Plain message'], ['Result', 'Rejected by user']] },
  { idx: '04', date: 'Mar 14', time: '09:20', title: '1,000 USDT', sub: 'Swap · USDT → TRX', ok: true, kind: 'sent', detail: [['Pair', 'USDT → TRX'], ['Rate', '1 USDT ≈ 7.4 TRX'], ['Network fee', '1.2 TRX'], ['Tx hash', '0x55de…77a0']] },
  { idx: '05', date: 'Mar 12', time: '18:05', title: 'Raw transaction', sub: 'Blind · Contract call', ok: true, kind: 'signed', detail: [['Contract', '0x44Ab…0F12'], ['Method', '0xa9059cbb'], ['Tx hash', '0x22c1…b830']] },
];
const HFILTERS: ['all' | 'sent' | 'signed', string][] = [['all', 'All'], ['sent', 'Sent'], ['signed', 'Signed']];
const PER_PAGE = 3;

function EdHistory() {
  const [filter, setFilter] = useState<'all' | 'sent' | 'signed'>('all');
  const [page, setPage] = useState(0);
  const [sel, setSel] = useState<Hist | null>(null);

  const rows = HIST.filter(e => filter === 'all' || e.kind === filter);
  const pages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  const safePage = Math.min(page, pages - 1);
  const pageRows = rows.slice(safePage * PER_PAGE, safePage * PER_PAGE + PER_PAGE);

  if (sel) return <HistoryDetail e={sel} onBack={() => setSel(null)} />;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-4 pt-3.5 pb-2.5 flex-shrink-0">
        <div className="flex items-baseline justify-between">
          <span className="text-[28px] font-black tracking-tight leading-none">SIGN HISTORY</span>
          <span className="text-[12px] font-bold tracking-[0.2em]">{rows.length}</span>
        </div>
        <div className="flex gap-1.5 mt-2.5">
          {HFILTERS.map(([id, label]) => (
            <button key={id} onClick={() => { setFilter(id); setPage(0); }} className={`px-3 h-7 text-[12px] font-bold uppercase tracking-wide border border-black ${filter === id ? 'bg-black text-[#838383]' : `text-black ${PRESS}`}`}>{label}</button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        {pageRows.map(e => (
          <button key={e.idx} onClick={() => setSel(e)} className={`flex-1 w-full flex items-center gap-3.5 px-4 border-t border-black text-left ${PRESS}`}>
            <span className="text-[44px] font-black leading-[0.8] tabular-nums w-[56px] flex-shrink-0">{e.idx}</span>
            <div className="flex-1 min-w-0">
              <Chip>{e.date} · {e.time}</Chip>
              <div className="text-[21px] font-black leading-tight mt-1.5 truncate">{e.title}</div>
              <div className="text-[13px] tracking-wide mt-0.5 truncate">{e.sub}</div>
            </div>
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <span className="text-[10px] font-bold tracking-wide">{e.ok ? 'SIGNED' : 'REJECTED'}</span>
              <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
            </div>
          </button>
        ))}
      </div>

      {/* pager — Prev/Next hidden at boundaries (no scroll) */}
      <div className="grid grid-cols-3 items-center border-t-2 border-black h-12 flex-shrink-0">
        <div className="justify-self-start">
          {safePage > 0 && (
            <button onClick={() => setPage(safePage - 1)} className={`h-12 pl-3 pr-4 flex items-center gap-1 text-[13px] font-black uppercase tracking-wide ${PRESS}`}>
              <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />Prev
            </button>
          )}
        </div>
        <span className="justify-self-center text-[12px] font-bold tracking-[0.2em]">{safePage + 1} / {pages}</span>
        <div className="justify-self-end">
          {safePage < pages - 1 && (
            <button onClick={() => setPage(safePage + 1)} className={`h-12 pr-3 pl-4 flex items-center gap-1 text-[13px] font-black uppercase tracking-wide ${PRESS}`}>
              Next<ChevronRight className="w-5 h-5" strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function HistoryDetail({ e, onBack }: { e: Hist; onBack: () => void }) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="h-[48px] px-3 flex items-center gap-2 border-b-2 border-black flex-shrink-0">
        <button onClick={onBack} aria-label="Back" className={`flex items-center px-1 -mx-1 ${PRESS}`}>
          <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
        </button>
        <span className="text-base font-black uppercase tracking-wide">Signature</span>
        <span className="ml-auto text-[12px] font-bold tracking-wide">{e.ok ? 'SIGNED' : 'REJECTED'}</span>
      </div>
      <div className="px-4 pt-4 pb-3 flex-shrink-0">
        <Chip>{e.date} · {e.time}</Chip>
        <div className="flex items-end gap-3 mt-2.5">
          <span className="text-[52px] font-black leading-[0.75] tabular-nums">{e.idx}</span>
          <div className="pb-1 min-w-0">
            <div className="text-[26px] font-black leading-none truncate">{e.title}</div>
            <div className="text-[14px] mt-1.5 truncate">{e.sub}</div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        {e.detail.map(([k, v]) => (
          <div key={k} className="flex-1 flex items-center justify-between gap-3 px-4 border-t border-black">
            <span className="text-[12px] font-bold uppercase tracking-[0.12em] flex-shrink-0">{k}</span>
            <span className="text-[16px] font-black text-right truncate">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   SIGN — editorial confirm. Giant amount, ruled rows, press-and-hold confirm.
   ════════════════════════════════════════════════════════════════════════ */
function MetaRow({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex-1 flex items-center justify-between gap-3 px-4 border-t border-black">
      <span className="text-[12px] font-bold uppercase tracking-[0.15em] flex-shrink-0">{k}</span>
      <span className="text-[17px] font-black text-right truncate" style={mono ? { fontFamily: 'ui-monospace, monospace' } : undefined}>{v}</span>
    </div>
  );
}
function EdSign() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState<null | 'signed' | 'rejected'>(null);
  const timer = useRef<number | null>(null);
  const clear = () => { if (timer.current !== null) { window.clearInterval(timer.current); timer.current = null; } };
  useEffect(() => clear, []);
  const startHold = () => {
    if (done) return;
    clear();
    timer.current = window.setInterval(() => {
      setProgress(p => { if (p + 1 >= 5) { clear(); setDone('signed'); return 5; } return p + 1; });
    }, 150);
  };
  const endHold = () => { clear(); if (!done) setProgress(0); };
  const reset = () => { clear(); setProgress(0); setDone(null); };

  if (done) {
    const ok = done === 'signed';
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
        <div className="text-[13px] font-bold tracking-[0.3em] mb-2">{ok ? 'BROADCAST' : 'DISCARDED'}</div>
        <div className="text-6xl font-black tracking-tight">{ok ? 'SIGNED' : 'REJECTED'}</div>
        <div className="w-16 h-px bg-black my-5" />
        <div className="text-[14px] tracking-wide mb-7">{ok ? '500 USDT → My Ledger' : 'Nothing was sent'}</div>
        <button onClick={reset} className={`px-7 h-12 border-2 border-black text-[15px] font-black uppercase tracking-wide ${PRESS}`}>Again</button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-4 pt-3.5 pb-2.5 flex items-center justify-between border-b-2 border-black flex-shrink-0">
        <span className="text-2xl font-black tracking-tight">CONFIRM SEND</span>
        <Chip>TRON</Chip>
      </div>
      <div className="px-4 py-5 flex-shrink-0">
        <div className="text-[12px] font-bold tracking-[0.25em] mb-1.5">AMOUNT</div>
        <div className="flex items-baseline gap-2.5">
          <span className="text-[80px] font-black leading-[0.72] tracking-tighter tabular-nums">500</span>
          <span className="text-3xl font-black">USDT</span>
        </div>
        <div className="text-[14px] tracking-wide mt-2.5">≈ $500.00</div>
      </div>
      <div className="flex-1 min-h-0 flex flex-col">
        <MetaRow k="To" v="My Ledger" />
        <MetaRow k="Address" v="TJYx…Lk9p" mono />
        <MetaRow k="Network fee" v="13.5 TRX" />
      </div>
      <div className="flex border-t-2 border-black flex-shrink-0">
        <button onClick={() => setDone('rejected')} className={`w-[72px] h-16 border-r-2 border-black flex items-center justify-center ${PRESS}`} aria-label="Reject">
          <X className="w-7 h-7" strokeWidth={2.5} />
        </button>
        <button onPointerDown={startHold} onPointerUp={endHold} onPointerLeave={endHold} className="relative flex-1 h-16 bg-black overflow-hidden select-none touch-none" aria-label="Hold to sign">
          <div className="absolute inset-0 flex">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className={`flex-1 ${i < progress ? 'bg-[#838383]' : ''} ${i > 0 ? 'border-l border-[#838383]' : ''}`} />
            ))}
          </div>
          <span className="relative z-10 h-full flex items-center justify-center gap-2 text-[16px] font-black uppercase tracking-[0.2em] text-[#838383]">
            <Fingerprint className="w-6 h-6" strokeWidth={2.5} />
            {progress > 0 ? 'Hold…' : 'Hold to Sign'}
          </span>
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   SEED — editorial recovery entry. BIP39 prefix-filtered keyboard + ruled
   suggestion list. Bounded (no scroll): entered words wrap into a fixed band.
   ════════════════════════════════════════════════════════════════════════ */
const BIP39_SUBSET = [
  'abandon', 'able', 'about', 'access', 'acid', 'across', 'action', 'adjust',
  'bacon', 'badge', 'balance', 'bamboo', 'banana', 'bargain', 'basic', 'beauty',
  'cabin', 'cable', 'cactus', 'cake', 'camera', 'canal', 'cargo', 'castle',
  'damage', 'dance', 'dawn', 'deal', 'debate', 'decide', 'deer', 'desert',
  'eager', 'eagle', 'early', 'earn', 'east', 'echo', 'edit', 'effort',
  'fabric', 'face', 'faculty', 'fade', 'faith', 'famous', 'fancy', 'fault',
  'gadget', 'gain', 'galaxy', 'gallery', 'garden', 'garlic', 'gather', 'gesture',
  'habit', 'hair', 'half', 'hammer', 'happy', 'harbor', 'hazard', 'health',
  'ice', 'icon', 'idea', 'identify', 'idle', 'image', 'impose', 'income',
  'jacket', 'jaguar', 'jar', 'jazz', 'jeans', 'jelly', 'jewel', 'join',
  'keen', 'keep', 'ketchup', 'key', 'kidney', 'kind', 'kingdom', 'kitchen',
  'lab', 'label', 'labor', 'ladder', 'lake', 'lamp', 'laptop', 'laundry',
  'machine', 'mad', 'magic', 'magnet', 'major', 'mango', 'mansion', 'marble',
  'nail', 'name', 'narrow', 'nasty', 'nature', 'near', 'neck', 'nephew',
  'oak', 'obey', 'object', 'oblige', 'ocean', 'october', 'offer', 'olive',
  'pact', 'paddle', 'page', 'pair', 'palace', 'panel', 'paper', 'parrot',
  'quality', 'quantum', 'quarter', 'question', 'quick', 'quit', 'quiz', 'quote',
  'rabbit', 'raccoon', 'race', 'rack', 'radar', 'radio', 'rail', 'rally',
  'sad', 'saddle', 'safe', 'sail', 'salad', 'salmon', 'sample', 'satisfy',
  'table', 'tackle', 'tag', 'tail', 'talent', 'tank', 'target', 'taste',
  'ugly', 'umbrella', 'unable', 'unaware', 'uncle', 'under', 'unfold', 'unique',
  'vacant', 'vacuum', 'vague', 'valid', 'valley', 'value', 'vapor', 'vault',
  'wage', 'wagon', 'wait', 'walk', 'wall', 'walnut', 'want', 'warm',
  'yard', 'year', 'yellow', 'you', 'young', 'youth',
  'zebra', 'zero', 'zone', 'zoo',
];
const WORD_COUNT = 12;
const KEY_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

function EdSeed() {
  const [words, setWords] = useState<string[]>([]);
  const [prefix, setPrefix] = useState('');
  const done = words.length >= WORD_COUNT;
  const suggestions = prefix ? BIP39_SUBSET.filter(w => w.startsWith(prefix)).slice(0, 3) : [];
  const validNext = new Set(BIP39_SUBSET.filter(w => w.startsWith(prefix)).map(w => w[prefix.length]).filter(Boolean));
  const commit = (w: string) => { if (words.length >= WORD_COUNT) return; setWords([...words, w]); setPrefix(''); };
  const reset = () => { setWords([]); setPrefix(''); };

  if (done) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
        <div className="text-[13px] font-bold tracking-[0.3em] mb-2">RECOVERY PHRASE</div>
        <div className="text-6xl font-black tracking-tight">COMPLETE</div>
        <div className="w-16 h-px bg-black my-5" />
        <div className="text-[14px] tracking-wide mb-7">All {WORD_COUNT} words entered</div>
        <button onClick={reset} className={`px-7 h-12 border-2 border-black text-[15px] font-black uppercase tracking-wide ${PRESS}`}>Restart</button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-4 pt-3 pb-2 flex items-baseline justify-between border-b-2 border-black flex-shrink-0">
        <span className="text-2xl font-black tracking-tight">RECOVERY</span>
        <span className="text-[13px] font-bold tracking-widest">WORD <span className="text-xl font-black">{String(words.length + 1).padStart(2, '0')}</span> / {WORD_COUNT}</span>
      </div>

      {/* entered words ledger (bounded band, no scroll) */}
      <div className="px-4 py-2 flex-shrink-0 h-[46px] overflow-hidden">
        {words.length === 0
          ? <span className="text-[13px] tracking-wide">Enter your {WORD_COUNT}-word recovery phrase.</span>
          : <div className="flex flex-wrap gap-x-3 gap-y-0.5">{words.map((w, i) => <span key={i} className="text-[13px]"><span className="font-black tabular-nums">{String(i + 1).padStart(2, '0')}</span> {w}</span>)}</div>}
      </div>

      {/* input */}
      <div className="px-4 pb-1.5 flex-shrink-0">
        <div className="h-12 border-2 border-black flex items-center px-3">
          <span className="text-xl font-black tracking-wide" style={{ fontFamily: 'ui-monospace, monospace' }}>{prefix}</span>
          <span className="w-0.5 h-6 bg-black ml-1" />
        </div>
      </div>

      {/* ruled suggestions */}
      <div className="flex-1 min-h-0 flex flex-col">
        {suggestions.length > 0 ? suggestions.map(w => (
          <button key={w} onClick={() => commit(w)} className={`flex-1 w-full flex items-center gap-3 px-4 border-t border-black text-left ${PRESS}`}>
            <ChevronRight className="w-5 h-5 flex-shrink-0" strokeWidth={3} />
            <span className="text-2xl font-black lowercase">{w}</span>
          </button>
        )) : (
          <div className="flex-1 flex items-center px-4 border-t border-black text-[13px] tracking-wide">{prefix ? 'No matching word' : 'Type to search BIP39'}</div>
        )}
      </div>

      {/* keyboard */}
      <div className="px-1.5 pb-2 pt-1.5 flex flex-col gap-1.5 flex-shrink-0 border-t-2 border-black">
        {KEY_ROWS.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1">
            {row.split('').map(k => {
              const enabled = validNext.has(k);
              return (
                <button key={k} disabled={!enabled} onClick={() => setPrefix(prefix + k)} className={`h-11 flex-1 max-w-[36px] border-2 border-black text-base font-black uppercase ${enabled ? PRESS : ''}`}>
                  <span className={enabled ? '' : 'invisible'}>{k}</span>
                </button>
              );
            })}
          </div>
        ))}
        <div className="flex justify-center gap-1">
          {words.length > 0 && (
            <button onClick={() => { setWords(words.slice(0, -1)); setPrefix(''); }} className={`h-11 px-4 border-2 border-black text-[12px] font-black uppercase tracking-wide ${PRESS}`}>Back word</button>
          )}
          <button onClick={() => setPrefix(prefix.slice(0, -1))} disabled={!prefix} className={`h-11 px-5 border-2 border-black flex items-center justify-center ${prefix ? PRESS : ''}`} aria-label="Backspace">
            <Delete className={`w-6 h-6 ${prefix ? '' : 'invisible'}`} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
