/**
 * INFOGRAPHIC · 图表式 — information-as-diagram.
 *
 * Every screen turns its data into a DIAGRAM, not a list.
 *
 * Home:    hub-and-spoke — wallet illustration at centre, 4 entry nodes on
 *          radiating lines, each labelled with a small line illustration + tag.
 * Sign:    transfer-wire diagram — big IllTransfer hero, amount/token/fee as
 *          leader-line annotations, address as a measured dimension callout.
 * History: each row is a mini FROM→TO glyph (person→checkmark for signed,
 *          person→X for rejected), thin connector, title/sub beside it.
 *          Detail: annotated diagram with IllLedger accent.
 * Seed:    IllKey accent above a numbered ledger grid; prefix input; keyboard.
 * Verify:  IllShield accent; numbered grid; input; keyboard; result diagram.
 *
 * E-ink rules: colours #838383 (page) and black only. No opacity-*, rounded*,
 * shadow*, border-dashed, emoji, random. SVG curves fine. w-[400px] h-[600px].
 */
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, X, Delete, Bluetooth, BatteryMedium } from 'lucide-react';
import type { LabScreen } from '../data';
import { WALLET, HOME_ITEMS, HIST, SIGN, SEED } from '../data';
import { useSeedEntry, useVerifyFlow, useReviewPage, KEY_ROWS } from '../seedEngine';
import {
  IllCoins, IllLedger, IllShield, IllKey, IllTransfer, IllDevice,
} from '../illus';

const PRESS = 'active:bg-black active:text-[#838383]';
const MONO = { fontFamily: 'ui-monospace, monospace' } as const;

/* ── thin rule helpers ── */
function HRule({ className = '' }: { className?: string }) {
  return <div className={`h-px bg-black ${className}`} />;
}
function VRule({ className = '' }: { className?: string }) {
  return <div className={`w-px bg-black ${className}`} />;
}

/* ── small label tag (inverted chip, infographic annotation style) ── */
function Tag({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center bg-black text-[#838383] font-sans text-[10px] font-bold tracking-[0.14em] uppercase px-1.5 py-0.5 ${className}`}>
      {children}
    </span>
  );
}

/* ── leader-line annotation: a labelled callout line ── */
function Annotation({ label, value, align = 'left', mono = false }: { label: string; value: string; align?: 'left' | 'right'; mono?: boolean }) {
  return (
    <div className={`flex flex-col ${align === 'right' ? 'items-end text-right' : 'items-start text-left'}`}>
      <span className="font-sans text-[9px] font-bold uppercase tracking-[0.18em] text-black">{label}</span>
      <div className="flex items-center gap-1 mt-0.5">
        {align === 'right' && <div className="h-px w-4 bg-black flex-shrink-0" />}
        <span className="font-sans text-[12px] font-bold text-black truncate" style={mono ? MONO : undefined}>{value}</span>
        {align === 'left' && <div className="h-px w-4 bg-black flex-shrink-0" />}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   HOME — hub-and-spoke diagram
   Wallet at centre (IllDevice), 4 spokes to entry nodes
   ══════════════════════════════════════════════ */

/** The four entry illustrations mapped to HOME_ITEMS ids */
const ENTRY_ILLU: Record<string, React.ReactNode> = {
  assets:   <IllCoins  size={32} filled={false} />,
  history:  <IllLedger size={32} filled={false} />,
  passkey:  <IllKey    size={32} filled={false} />,
  settings: <IllShield size={32} filled={false} />,
};

function Home() {
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      {/* status bar */}
      <div className="bg-black text-[#838383] px-4 py-2 flex items-center justify-between flex-shrink-0">
        <span className="font-sans text-[11px] font-bold uppercase tracking-[0.2em]">{WALLET.name}</span>
        <span className="inline-flex items-center gap-3 font-sans text-[10px] font-bold">
          <span className="inline-flex items-center gap-1">
            <BatteryMedium className="w-4 h-4" strokeWidth={2.25} />
            {WALLET.battery}%
          </span>
          <Bluetooth className="w-4 h-4" strokeWidth={2.25} />
        </span>
      </div>
      <HRule />

      {/* sub-identity row */}
      <div className="px-4 py-1.5 flex items-center justify-between flex-shrink-0">
        <span className="font-sans text-[10px] font-bold uppercase tracking-[0.18em]">{WALLET.model}</span>
        <span className="font-sans text-[10px] tracking-wide">{WALLET.networks} net · {WALLET.tokens} tok</span>
      </div>
      <HRule />

      {/* hub-and-spoke diagram area */}
      <div className="flex-1 flex min-h-0">
        {/* left column: Assets (top) + History (bottom) */}
        <div className="flex-1 flex flex-col min-h-0">
          {HOME_ITEMS.slice(0, 2).map((item, i) => (
            <button
              key={item.id}
              className={`flex-1 flex flex-col items-center justify-center gap-1 border-black text-center ${PRESS} ${i === 0 ? 'border-b' : ''}`}
            >
              <div className="flex flex-col items-center gap-1">
                {ENTRY_ILLU[item.id]}
                <span className="font-sans text-[11px] font-bold uppercase tracking-[0.12em]">{item.label}</span>
                <span className="font-sans text-[9px] tracking-wide leading-tight max-w-[90px]">{item.sub}</span>
              </div>
            </button>
          ))}
        </div>

        {/* centre column: connector lines + hub */}
        <div className="w-[110px] flex-shrink-0 flex flex-col items-center justify-center relative border-l border-r border-black">
          {/* top spoke to Assets */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center" style={{ top: '10%', height: '22%' }}>
            <div className="flex-1 w-px bg-black" />
            <div className="w-1.5 h-1.5 bg-black flex-shrink-0" style={{ transform: 'rotate(45deg)' }} />
          </div>
          {/* bottom spoke to History */}
          <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center" style={{ top: '68%', height: '22%' }}>
            <div className="w-1.5 h-1.5 bg-black flex-shrink-0" style={{ transform: 'rotate(45deg)' }} />
            <div className="flex-1 w-px bg-black" />
          </div>

          {/* hub: device illustration */}
          <div className="flex flex-col items-center gap-1 z-10 bg-[#838383] px-2 py-2">
            <IllDevice size={56} filled={false} />
            <Tag>WALLET</Tag>
          </div>
        </div>

        {/* right column: Passkey (top) + Settings (bottom) */}
        <div className="flex-1 flex flex-col min-h-0">
          {HOME_ITEMS.slice(2, 4).map((item, i) => (
            <button
              key={item.id}
              className={`flex-1 flex flex-col items-center justify-center gap-1 border-black text-center ${PRESS} ${i === 0 ? 'border-b' : ''}`}
            >
              <div className="flex flex-col items-center gap-1">
                {ENTRY_ILLU[item.id]}
                <span className="font-sans text-[11px] font-bold uppercase tracking-[0.12em]">{item.label}</span>
                <span className="font-sans text-[9px] tracking-wide leading-tight max-w-[90px]">{item.sub}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <HRule />
      {/* dimension callout bar */}
      <div className="px-4 py-1.5 flex items-center justify-between flex-shrink-0">
        <span className="font-sans text-[9px] font-bold uppercase tracking-[0.18em]">SAFEPAL DEVICE</span>
        <span className="font-sans text-[9px] tracking-wide">NET {WALLET.networks} — TOK {WALLET.tokens}</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SIGN — transfer-wire diagram with leader-line annotations
   Summary does NOT show verify code; tap "Full details" to open SignDetail.
   ══════════════════════════════════════════════ */

/** Full signature detail page — all fields including verify code */
function SignDetail({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      {/* header */}
      <div className="bg-black text-[#838383] px-3 py-2 flex items-center gap-2 flex-shrink-0">
        <button onClick={onBack} aria-label="Back" className="flex items-center active:bg-[#838383] active:text-black">
          <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
        </button>
        <span className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] flex-1">Signature Details</span>
        <Tag className="bg-[#838383] text-black">{SIGN.network}</Tag>
      </div>
      <HRule />

      {/* detail rows as annotated dimension lines */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Amount */}
        <div className="flex-1 flex items-center gap-3 px-4 border-b border-black">
          <span className="font-sans text-[9px] font-bold uppercase tracking-[0.14em] flex-shrink-0 w-[72px]">Amount</span>
          <div className="flex-1 flex items-center gap-1 min-w-0">
            <div className="h-px flex-shrink-0 w-3 bg-black" />
            <span className="font-sans text-[12px] font-bold truncate flex-1">{SIGN.amount} {SIGN.token}</span>
          </div>
        </div>
        {/* Value */}
        <div className="flex-1 flex items-center gap-3 px-4 border-b border-black">
          <span className="font-sans text-[9px] font-bold uppercase tracking-[0.14em] flex-shrink-0 w-[72px]">Value</span>
          <div className="flex-1 flex items-center gap-1 min-w-0">
            <div className="h-px flex-shrink-0 w-3 bg-black" />
            <span className="font-sans text-[12px] font-bold truncate flex-1">{SIGN.fiat}</span>
          </div>
        </div>
        {/* To */}
        <div className="flex-1 flex items-center gap-3 px-4 border-b border-black">
          <span className="font-sans text-[9px] font-bold uppercase tracking-[0.14em] flex-shrink-0 w-[72px]">To</span>
          <div className="flex-1 flex items-center gap-1 min-w-0">
            <div className="h-px flex-shrink-0 w-3 bg-black" />
            <span className="font-sans text-[12px] font-bold truncate flex-1">{SIGN.to}</span>
          </div>
        </div>
        {/* Address */}
        <div className="flex-1 flex items-center gap-3 px-4 border-b border-black">
          <span className="font-sans text-[9px] font-bold uppercase tracking-[0.14em] flex-shrink-0 w-[72px]">Address</span>
          <div className="flex-1 flex items-center gap-1 min-w-0">
            <div className="h-px flex-shrink-0 w-3 bg-black" />
            <span className="font-sans text-[12px] font-bold truncate flex-1" style={MONO}>{SIGN.address}</span>
          </div>
        </div>
        {/* Network */}
        <div className="flex-1 flex items-center gap-3 px-4 border-b border-black">
          <span className="font-sans text-[9px] font-bold uppercase tracking-[0.14em] flex-shrink-0 w-[72px]">Network</span>
          <div className="flex-1 flex items-center gap-1 min-w-0">
            <div className="h-px flex-shrink-0 w-3 bg-black" />
            <span className="font-sans text-[12px] font-bold truncate flex-1">{SIGN.network}</span>
          </div>
        </div>
        {/* Network fee */}
        <div className="flex-1 flex items-center gap-3 px-4 border-b border-black">
          <span className="font-sans text-[9px] font-bold uppercase tracking-[0.14em] flex-shrink-0 w-[72px]">Network fee</span>
          <div className="flex-1 flex items-center gap-1 min-w-0">
            <div className="h-px flex-shrink-0 w-3 bg-black" />
            <span className="font-sans text-[12px] font-bold truncate flex-1">{SIGN.fee}</span>
          </div>
        </div>
        {/* Verify code — emphasised, inverted block */}
        <div className="flex-1 flex items-center gap-3 px-4 bg-black">
          <span className="font-sans text-[9px] font-bold uppercase tracking-[0.14em] flex-shrink-0 w-[72px] text-[#838383]">Verify code</span>
          <div className="flex-1 flex items-center gap-1 min-w-0">
            <div className="h-px flex-shrink-0 w-3 bg-[#838383]" />
            <span className="font-sans text-[22px] font-black tabular-nums tracking-[0.12em] text-[#838383]" style={MONO}>{SIGN.verify}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Sign() {
  const [detail, setDetail] = useState(false);
  if (detail) return <SignDetail onBack={() => setDetail(false)} />;
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      {/* header */}
      <div className="bg-black text-[#838383] px-4 py-2 flex items-center justify-between flex-shrink-0">
        <span className="font-sans text-[11px] font-bold uppercase tracking-[0.2em]">Sign Transaction</span>
        <Tag className="bg-[#838383] text-black">{SIGN.network}</Tag>
      </div>
      <HRule />

      {/* diagram area: big IllTransfer hero with annotations */}
      <div className="flex-1 flex flex-col min-h-0 px-4 pt-3 pb-2 gap-2">

        {/* amount/token display — measured callout style */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <IllCoins size={44} filled={false} />
          <div className="flex flex-col">
            <span className="font-sans text-[9px] font-bold uppercase tracking-[0.2em]">Amount</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-sans text-[38px] font-black leading-none tabular-nums tracking-tight">{SIGN.amount}</span>
              <span className="font-sans text-[18px] font-bold leading-none">{SIGN.token}</span>
              <span className="font-sans text-[11px] ml-1">≈ {SIGN.fiat}</span>
            </div>
          </div>
        </div>

        <HRule />

        {/* the big transfer diagram */}
        <div className="flex-1 flex flex-col items-center justify-center gap-2 min-h-0">
          {/* FROM / TO annotations */}
          <div className="w-full flex justify-between px-2">
            <Annotation label="From" value="This Device" align="left" />
            <Annotation label="To" value={SIGN.to} align="right" />
          </div>

          {/* IllTransfer hero */}
          <div className="relative flex items-center justify-center">
            <IllTransfer size={160} filled={false} />
          </div>

          {/* callout: fee below the wire */}
          <div className="w-full flex justify-center">
            <div className="flex flex-col items-center gap-0.5">
              <div className="h-4 w-px bg-black" />
              <Tag>FEE {SIGN.fee}</Tag>
            </div>
          </div>
        </div>

        <HRule />

        {/* address dimension callout — NO verify code here */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <span className="font-sans text-[9px] font-bold uppercase tracking-[0.18em]">Address</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="h-px w-3 bg-black flex-shrink-0" />
              <span className="font-sans text-[11px] font-bold truncate" style={MONO}>{SIGN.address}</span>
              <div className="h-px flex-1 bg-black" />
            </div>
          </div>
        </div>

        {/* full-details drill affordance */}
        <button
          onClick={() => setDetail(true)}
          className={`flex items-center gap-2 py-1.5 flex-shrink-0 ${PRESS}`}
        >
          <div className="flex items-center gap-1 flex-shrink-0">
            <div className="h-px w-3 bg-black" />
            <div className="w-1.5 h-1.5 bg-black" style={{ transform: 'rotate(45deg)' }} />
          </div>
          <span className="font-sans text-[10px] font-bold uppercase tracking-[0.16em] flex-1">Full details &amp; verify code</span>
          <ChevronRight className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
        </button>
      </div>

      <HRule />

      {/* action row */}
      <div className="flex flex-shrink-0">
        <button className={`w-[72px] h-16 flex items-center justify-center border-r border-black ${PRESS}`} aria-label="Reject">
          <X className="w-7 h-7" strokeWidth={2.5} />
        </button>
        <button className="flex-1 h-16 bg-black text-[#838383] flex items-center justify-center gap-2.5 active:bg-[#838383] active:text-black">
          <Check className="w-6 h-6" strokeWidth={2.75} />
          <span className="font-sans text-[14px] font-bold uppercase tracking-[0.18em]">Confirm Transfer</span>
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   HISTORY — mini from→to glyphs per row
   ══════════════════════════════════════════════ */

/** Inline mini transfer glyph: person circle → arrow → check/X */
function MiniTransferGlyph({ ok }: { ok: boolean }) {
  return (
    <svg width="52" height="28" viewBox="0 0 52 28" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {/* from: person circle */}
      <circle cx="8" cy="14" r="7" strokeWidth="1.8" />
      <circle cx="8" cy="11" r="2.5" strokeWidth="1.5" />
      <path d="M3 20 q5 -4 10 0" strokeWidth="1.5" />
      {/* connector wire with arrow */}
      <line x1="17" y1="14" x2="35" y2="14" strokeWidth="1.5" strokeDasharray="2 3" />
      <path d="M33 10 L38 14 L33 18" strokeWidth="1.8" fill="none" />
      {/* to: check or X */}
      <circle cx="44" cy="14" r="7" strokeWidth="1.8" />
      {ok
        ? <path d="M40 14 L43 17 L49 10" strokeWidth="2" fill="none" />
        : <><line x1="40" y1="10" x2="48" y2="18" strokeWidth="2" /><line x1="48" y1="10" x2="40" y2="18" strokeWidth="2" /></>
      }
    </svg>
  );
}

function HistoryDetail({ e, onBack }: { e: typeof HIST[number]; onBack: () => void }) {
  const monoKeys = /address|hash|tx/i;
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      {/* header */}
      <div className="bg-black text-[#838383] px-3 py-2 flex items-center gap-2 flex-shrink-0">
        <button onClick={onBack} aria-label="Back" className={`flex items-center active:bg-[#838383] active:text-black`}>
          <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
        </button>
        <span className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] flex-1">Signature</span>
        <Tag className={e.ok ? 'bg-[#838383] text-black' : ''}>{e.ok ? 'SIGNED' : 'REJECTED'}</Tag>
      </div>
      <HRule />

      {/* diagram accent + summary */}
      <div className="px-4 pt-3 pb-2 flex items-center gap-4 flex-shrink-0">
        <IllLedger size={52} filled={false} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-sans text-[28px] font-black leading-none tabular-nums">{e.idx}</span>
            <div className="flex flex-col min-w-0">
              <span className="font-sans text-[14px] font-bold leading-tight truncate">{e.title}</span>
              <span className="font-sans text-[10px] tracking-wide truncate">{e.type} · {e.sub}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <Tag>{e.date}</Tag>
            <Tag>{e.time}</Tag>
          </div>
        </div>
      </div>
      <HRule />

      {/* detail rows as annotated dimension lines */}
      <div className="flex-1 flex flex-col min-h-0">
        {e.detail.map(([k, v]) => (
          <div key={k} className="flex-1 flex items-center gap-3 px-4 border-b border-black last:border-b-0">
            <span className="font-sans text-[9px] font-bold uppercase tracking-[0.14em] flex-shrink-0 w-[72px]">{k}</span>
            <div className="flex-1 flex items-center gap-1 min-w-0">
              <div className="h-px flex-shrink-0 w-3 bg-black" />
              <span
                className="font-sans text-[12px] font-bold truncate flex-1"
                style={monoKeys.test(k) ? MONO : undefined}
              >{v}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function History() {
  const [sel, setSel] = useState<typeof HIST[number] | null>(null);
  const rows = HIST.slice(0, 4);

  if (sel) return <HistoryDetail e={sel} onBack={() => setSel(null)} />;

  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      {/* header */}
      <div className="bg-black text-[#838383] px-4 py-2 flex items-center justify-between flex-shrink-0">
        <span className="font-sans text-[11px] font-bold uppercase tracking-[0.2em]">Sign History</span>
        <Tag className="bg-[#838383] text-black">{HIST.length} records</Tag>
      </div>
      <HRule />

      {/* rows — each a mini diagram */}
      <div className="flex-1 flex flex-col min-h-0">
        {rows.map((e) => (
          <button
            key={e.idx}
            onClick={() => setSel(e)}
            className={`flex-1 flex items-center gap-3 px-3 border-b border-black last:border-b-0 text-left ${PRESS}`}
          >
            {/* mini glyph */}
            <div className="flex-shrink-0">
              <MiniTransferGlyph ok={e.ok} />
            </div>

            {/* connector tick mark */}
            <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
              <div className="h-3 w-px bg-black" />
              <div className="w-1 h-1 bg-black" style={{ transform: 'rotate(45deg)' }} />
              <div className="h-3 w-px bg-black" />
            </div>

            {/* label block */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-sans text-[11px] font-black tabular-nums">#{e.idx}</span>
                <Tag>{e.type}</Tag>
                <span className="font-sans text-[9px] tracking-wide">{e.date} {e.time}</span>
              </div>
              <div className="font-sans text-[14px] font-bold leading-tight mt-0.5 truncate">{e.title}</div>
              <div className="font-sans text-[10px] tracking-wide truncate">{e.sub}</div>
            </div>

            {/* status + chevron */}
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="font-sans text-[9px] font-bold uppercase tracking-wide">{e.ok ? 'SIGNED' : 'REJECTED'}</span>
              <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SEED — IllKey accent, numbered ledger grid, prefix input, keyboard
   ══════════════════════════════════════════════ */
function Seed() {
  const s = useSeedEntry(SEED.count);

  if (s.done) {
    return (
      <div className="flex-1 flex flex-col min-h-0 text-black">
        <div className="bg-black text-[#838383] px-4 py-2 flex-shrink-0">
          <span className="font-sans text-[11px] font-bold uppercase tracking-[0.2em]">Recovery Phrase</span>
        </div>
        <HRule />
        <div className="flex-1 flex flex-col items-center justify-center px-8 gap-4">
          <IllKey size={72} filled={false} />
          {/* completion diagram: numbered steps joined by line */}
          <div className="flex items-center gap-2">
            {Array.from({ length: SEED.count }, (_, i) => (
              <div key={i} className="flex items-center">
                <div className="w-1.5 h-1.5 bg-black" style={{ transform: 'rotate(45deg)' }} />
                {i < SEED.count - 1 && <div className="w-3 h-px bg-black" />}
              </div>
            ))}
          </div>
          <div className="text-center">
            <div className="font-sans text-[18px] font-bold uppercase tracking-[0.18em]">Phrase Complete</div>
            <div className="font-sans text-[11px] tracking-wide mt-1">All {SEED.count} words entered</div>
          </div>
          <button onClick={s.reset} className={`px-6 h-10 border-2 border-black font-sans text-[11px] font-bold uppercase tracking-[0.18em] ${PRESS}`}>
            Restart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      {/* header bar */}
      <div className="bg-black text-[#838383] px-4 py-2 flex items-center justify-between flex-shrink-0">
        <span className="font-sans text-[11px] font-bold uppercase tracking-[0.2em]">Recovery</span>
        <span className="font-sans text-[10px] font-bold tracking-[0.15em]">
          WORD {String(s.words.length + 1).padStart(2, '0')} / {s.count}
        </span>
      </div>
      <HRule />

      {/* IllKey accent + entered-words ledger in one row */}
      <div className="flex items-start gap-3 px-3 pt-2 pb-1.5 flex-shrink-0 border-b border-black">
        <IllKey size={36} filled={false} className="flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          {s.words.length === 0
            ? <span className="font-sans text-[11px] tracking-wide">Enter your {s.count}-word recovery phrase.</span>
            : (
              <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                {s.words.map((w, i) => (
                  <span key={i} className="font-sans text-[10px]">
                    <span className="font-bold tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                    {' '}{w}
                  </span>
                ))}
              </div>
            )
          }
        </div>
      </div>

      {/* input field — prefix + cursor */}
      <div className="px-3 py-2 flex-shrink-0">
        <div className="h-10 border-2 border-black flex items-center px-3 gap-0.5">
          <span className="font-sans text-[18px] font-bold tracking-wide" style={MONO}>{s.prefix}</span>
          <span className="w-0.5 h-5 bg-black" />
        </div>
      </div>

      {/* suggestions — up to 3, as labelled diagram nodes */}
      <div className="flex-1 min-h-0 flex flex-col border-t border-black">
        {s.suggestions.length > 0
          ? s.suggestions.map((w) => (
              <button
                key={w}
                onClick={() => s.commit(w)}
                className={`flex-1 w-full flex items-center gap-3 px-4 border-b border-black last:border-b-0 text-left ${PRESS}`}
              >
                {/* small node glyph */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <div className="h-px w-4 bg-black" />
                  <div className="w-2 h-2 border-2 border-black" />
                </div>
                <span className="font-sans text-[18px] font-bold lowercase">{w}</span>
              </button>
            ))
          : (
            <div className="flex-1 flex items-center px-4 font-sans text-[11px] tracking-wide">
              {s.prefix ? 'No matching word' : 'Type to search BIP39'}
            </div>
          )
        }
      </div>

      {/* keyboard */}
      <div className="px-1.5 pb-2 pt-1.5 flex flex-col gap-1 flex-shrink-0 border-t-2 border-black">
        {KEY_ROWS.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1">
            {row.split('').map((k) => {
              const enabled = s.validNext.has(k);
              return (
                <button
                  key={k}
                  disabled={!enabled}
                  onClick={() => s.type(k)}
                  className={`font-sans h-9 flex-1 max-w-[34px] border-2 border-black text-[12px] font-bold uppercase ${enabled ? PRESS : ''}`}
                >
                  <span className={enabled ? '' : 'invisible'}>{k}</span>
                </button>
              );
            })}
          </div>
        ))}
        <div className="flex justify-center gap-1">
          {s.words.length > 0 && (
            <button
              onClick={s.backWord}
              className={`font-sans h-9 px-3 border-2 border-black text-[10px] font-bold uppercase tracking-wide ${PRESS}`}
            >
              Back word
            </button>
          )}
          <button
            onClick={s.backspace}
            disabled={!s.prefix}
            className={`h-9 px-4 border-2 border-black flex items-center justify-center ${s.prefix ? PRESS : ''}`}
            aria-label="Backspace"
          >
            <Delete className={`w-4 h-4 ${s.prefix ? '' : 'invisible'}`} strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   VERIFY — IllShield accent; numbered grid; input; keyboard; result
   ══════════════════════════════════════════════ */
function Verify() {
  const v = useVerifyFlow();
  const rp = useReviewPage(v.idx, v.count);

  /* select-length — two choices as annotated diagram nodes */
  if (v.step === 'select-length') {
    return (
      <div className="flex-1 flex flex-col min-h-0 text-black">
        <div className="bg-black text-[#838383] px-4 py-2 flex-shrink-0">
          <span className="font-sans text-[11px] font-bold uppercase tracking-[0.2em]">Verify Recovery</span>
        </div>
        <HRule />

        {/* IllShield + description */}
        <div className="flex items-center gap-4 px-4 pt-3 pb-3 flex-shrink-0">
          <IllShield size={56} filled={false} />
          <div className="flex-1 min-w-0">
            <div className="font-sans text-[14px] font-bold leading-tight">Confirm your recovery phrase</div>
            <div className="font-sans text-[11px] tracking-wide mt-1">Re-enter every word to prove your backup is correct.</div>
          </div>
        </div>
        <HRule />

        {/* length picker — two nodes on a horizontal diagram line */}
        <div className="flex-1 flex flex-col min-h-0">
          {([12, 24] as const).map((n) => (
            <button
              key={n}
              onClick={() => v.pickLength(n)}
              className={`flex-1 flex items-center gap-4 px-4 border-b border-black last:border-b-0 text-left ${PRESS}`}
            >
              {/* node glyph */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="h-px w-5 bg-black" />
                <div className="w-3 h-3 border-2 border-black bg-[#838383]" />
                <div className="h-px w-3 bg-black" />
              </div>
              <span className="font-sans text-[44px] font-black leading-none tabular-nums w-[56px] flex-shrink-0">{n}</span>
              <div className="flex-1 min-w-0">
                <div className="font-sans text-[14px] font-bold leading-tight">words</div>
                <div className="font-sans text-[10px] tracking-wide mt-0.5">{n === 12 ? 'Standard phrase' : 'Extended phrase'}</div>
              </div>
              <ChevronRight className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* result */
  if (v.step === 'result') {
    return (
      <div className="flex-1 flex flex-col min-h-0 text-black">
        <div className="bg-black text-[#838383] px-4 py-2 flex-shrink-0">
          <span className="font-sans text-[11px] font-bold uppercase tracking-[0.2em]">Verify Recovery</span>
        </div>
        <HRule />
        <div className="flex-1 flex flex-col items-center justify-center gap-5 px-8">
          {/* result diagram: shield → connector → check/X */}
          <div className="flex items-center gap-3">
            <IllShield size={64} filled={v.ok} />
            <div className="flex items-center gap-1">
              <div className="h-px w-8 bg-black" />
              <div className={`w-10 h-10 border-2 border-black flex items-center justify-center ${v.ok ? 'bg-black' : ''}`}>
                {v.ok
                  ? <Check className="w-6 h-6 text-[#838383]" strokeWidth={2.75} />
                  : <X className="w-6 h-6 text-black" strokeWidth={2.75} />
                }
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="font-sans text-[22px] font-bold uppercase tracking-[0.12em]">{v.ok ? 'Verified' : 'No Match'}</div>
            <div className="font-sans text-[11px] tracking-wide mt-1.5 max-w-[260px]">
              {v.ok
                ? 'Your recovery phrase is correct — this backup is valid.'
                : 'That phrase does not match this wallet. Check your backup and try again.'
              }
            </div>
          </div>
          {v.ok
            ? <div className="font-sans text-[10px] tracking-[0.2em] uppercase">Returning…</div>
            : (
              <button onClick={v.reset} className={`px-6 h-10 border-2 border-black font-sans text-[11px] font-bold uppercase tracking-[0.18em] ${PRESS}`}>
                Try Again
              </button>
            )
          }
        </div>
      </div>
    );
  }

  /* input step */
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      {/* header */}
      <div className="bg-black text-[#838383] px-4 py-2 flex items-center justify-between flex-shrink-0">
        <span className="font-sans text-[11px] font-bold uppercase tracking-[0.2em]">Verify Recovery</span>
        <span className="font-sans text-[10px] font-bold tracking-[0.15em]">
          WORD {String(v.idx + 1).padStart(2, '0')} / {v.count}
        </span>
      </div>
      <HRule />

      {/* IllShield accent + word counter */}
      <div className="flex items-center gap-3 px-3 pt-2 pb-2 flex-shrink-0 border-b border-black">
        <IllShield size={32} filled={false} className="flex-shrink-0" />
        <div className="flex-1 flex items-center justify-between min-w-0">
          <span className="font-sans text-[11px] font-bold uppercase tracking-[0.14em]">
            {v.editing ? 'Edit word' : 'Word'}{' '}
            <span className="font-sans text-[15px] font-black">{String(v.idx + 1).padStart(2, '0')}</span>
            {' '}/ {v.count}
          </span>
          {rp.pages > 1 && (
            <span className="font-sans text-[10px] font-bold tracking-[0.15em]">{rp.page + 1}/{rp.pages}</span>
          )}
        </div>
      </div>

      {/* review grid — numbered cells; active = inverted */}
      <div className="px-2 pt-2 pb-1.5 flex-shrink-0">
        <div className="grid grid-cols-2 gap-1" style={{ height: '108px', gridTemplateRows: 'repeat(3, minmax(0,1fr))' }}>
          {rp.slots.map((i) => {
            const filled = i < v.words.length;
            const active = i === v.idx;
            return (
              <button
                key={i}
                onClick={() => v.goToWord(i)}
                disabled={i > v.words.length}
                className={`flex items-center gap-2 px-2.5 border-2 border-black text-left overflow-hidden ${active ? 'bg-black text-[#838383]' : ''} ${i <= v.words.length ? PRESS : ''}`}
              >
                {/* node dot */}
                <div className={`w-1.5 h-1.5 flex-shrink-0 ${active ? 'bg-[#838383]' : 'bg-black'}`} style={{ transform: 'rotate(45deg)' }} />
                <span className="font-sans text-[9px] font-bold tabular-nums flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <span className="font-sans text-[12px] font-bold lowercase truncate">{filled ? v.words[i] : ''}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* input field */}
      <div className="px-3 pb-1 flex-shrink-0">
        <div className="h-9 border-2 border-black flex items-center px-3 gap-0.5">
          <span className="font-sans text-[16px] font-bold tracking-wide" style={MONO}>{v.prefix}</span>
          <span className="w-0.5 h-5 bg-black" />
        </div>
      </div>

      {/* suggestion bar — up to 3 across */}
      <div className="h-[42px] flex items-stretch gap-1 px-2 flex-shrink-0">
        {v.suggestions.length > 0
          ? v.suggestions.map((w) => (
              <button
                key={w}
                onClick={() => v.commit(w)}
                className={`flex-1 min-w-0 border-2 border-black flex items-center justify-center px-1 gap-1.5 ${PRESS}`}
              >
                <div className="w-1.5 h-1.5 bg-black flex-shrink-0" style={{ transform: 'rotate(45deg)' }} />
                <span className="font-sans text-[13px] font-bold lowercase truncate">{w}</span>
              </button>
            ))
          : (
            <div className="flex-1 flex items-center justify-center font-sans text-[11px] tracking-wide">
              {v.prefix ? 'No matching word' : 'Type the word'}
            </div>
          )
        }
      </div>

      {/* keyboard */}
      <div className="px-1.5 pb-2 pt-1 flex flex-col gap-1 flex-shrink-0 border-t-2 border-black">
        {KEY_ROWS.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1">
            {row.split('').map((k) => {
              const enabled = v.validNext.has(k);
              return (
                <button
                  key={k}
                  disabled={!enabled}
                  onClick={() => v.type(k)}
                  className={`font-sans h-9 flex-1 max-w-[34px] border-2 border-black text-[12px] font-bold uppercase ${enabled ? PRESS : ''}`}
                >
                  <span className={enabled ? '' : 'invisible'}>{k}</span>
                </button>
              );
            })}
          </div>
        ))}
        <div className="flex justify-center">
          <button
            onClick={v.backspace}
            disabled={!v.prefix}
            className={`h-9 px-5 border-2 border-black flex items-center justify-center ${v.prefix ? PRESS : ''}`}
            aria-label="Backspace"
          >
            <Delete className={`w-4 h-4 ${v.prefix ? '' : 'invisible'}`} strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   EXPORT
   ══════════════════════════════════════════════ */
export function InfographicStyle({ screen }: { screen: LabScreen }) {
  if (screen === 'home')    return <Home />;
  if (screen === 'sign')    return <Sign />;
  if (screen === 'history') return <History />;
  if (screen === 'seed')    return <Seed />;
  if (screen === 'verify')  return <Verify />;
  return null;
}
