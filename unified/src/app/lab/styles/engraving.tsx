/**
 * engraving.tsx — BANKNOTE / STAMP ENGRAVING aesthetic for the e-ink Lab.
 *
 * Governing metaphor: a 19th-century security engraving — currency, bond,
 * passport. Every screen is framed in OrnFrame double-rule + corner diamonds;
 * Guilloche rosettes appear as medallion backgrounds; subject illustrations are
 * used in LINE mode (filled=false) as engraved vignettes; Banner ribbons carry
 * inverted titles. Hairline rules divide data columns; monospace serif numerals
 * index the ledger. Formal, currency-secure, utterly illustration-forward.
 */
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, X, Delete, Bluetooth, BatteryMedium } from 'lucide-react';
import type { LabScreen } from '../data';
import { WALLET, HOME_ITEMS, HIST, SIGN, SEED } from '../data';
import { useSeedEntry, useVerifyFlow, useReviewPage, KEY_ROWS } from '../seedEngine';
import {
  Guilloche, OrnFrame, Banner,
  IllVault, IllCoins, IllLedger, IllShield, IllKey, IllTransfer,
} from '../illus';

const PRESS = 'active:bg-black active:text-[#838383]';
const MONO = { fontFamily: 'ui-monospace, monospace' } as const;

/* ── shared sub-components ── */

/** Hairline rule separator */
function Rule({ thick }: { thick?: boolean }) {
  return <div className={`w-full ${thick ? 'h-[2px]' : 'h-[1px]'} bg-black flex-shrink-0`} />;
}

/** Inverted engraving-style label chip */
function Stamp({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center bg-black text-[#838383] text-[9px] font-bold uppercase tracking-[0.22em] px-2 py-0.5 ${className}`}>
      {children}
    </span>
  );
}

/** Micro uppercase sans label */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className="font-sans text-[9px] font-bold uppercase tracking-[0.22em] text-black">{children}</div>;
}

/* ══════════════════════════════════════════════════════════════════════════
   HOME — central Guilloche medallion + vault vignette + framed index entries
   ══════════════════════════════════════════════════════════════════════════ */
function Home() {
  const [assets, hist, passkey, settings] = HOME_ITEMS;
  const illus = [
    <IllVault key="vault" size={28} filled={false} />,
    <IllLedger key="ledger" size={28} filled={false} />,
    <IllKey key="key" size={28} filled={false} />,
    <IllShield key="shield" size={28} filled={false} />,
  ];
  const entries = [assets, hist, passkey, settings];

  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      {/* top strip — status bar */}
      <div className="flex items-center justify-between px-4 py-1 flex-shrink-0 border-b border-black">
        <span className="font-sans text-[9px] font-bold uppercase tracking-[0.25em]">{WALLET.model}</span>
        <span className="inline-flex items-center gap-2">
          <Bluetooth className="w-3 h-3" strokeWidth={2.5} />
          <span className="inline-flex items-center gap-0.5 font-sans text-[9px] font-bold tabular-nums">
            <BatteryMedium className="w-3.5 h-3.5" strokeWidth={2.5} />{WALLET.battery}%
          </span>
        </span>
      </div>

      {/* hero medallion band */}
      <div className="relative flex-shrink-0 flex items-center justify-center py-2 border-b-2 border-black overflow-hidden" style={{ height: '148px' }}>
        {/* Guilloche rosette as background medallion */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Guilloche size={148} count={24} className="text-black" />
        </div>
        {/* OrnFrame containing wallet name + vault vignette */}
        <OrnFrame pad="px-5 py-2" className="relative z-10 flex flex-col items-center bg-[#838383]">
          <IllVault size={44} filled={false} className="text-black" />
          <Banner className="mt-1 text-[11px] font-bold tracking-[0.2em] uppercase font-sans">
            {WALLET.name}
          </Banner>
          <div className="font-sans text-[8px] tracking-[0.3em] uppercase mt-0.5 text-black">
            NET {WALLET.networks} · TOK {WALLET.tokens}
          </div>
        </OrnFrame>
      </div>

      {/* entries framed index */}
      <div className="flex-1 flex flex-col min-h-0">
        {entries.map((item, i) => (
          <button
            key={item.id}
            className={`flex-1 flex items-center gap-3 px-4 border-b border-black last:border-b-0 text-left ${PRESS}`}
          >
            {/* engraved vignette */}
            <div className="flex-shrink-0 text-black">{illus[i]}</div>
            {/* vertical hairline */}
            <div className="w-[1px] h-full bg-black self-stretch" />
            {/* text */}
            <div className="flex-1 min-w-0">
              <div className="font-sans text-[8px] font-bold uppercase tracking-[0.25em]">{item.code}</div>
              <div className="font-serif text-[17px] font-black leading-tight">{item.label}</div>
              <div className="font-sans text-[10px] leading-snug mt-0.5 truncate">{item.sub}</div>
            </div>
            <ChevronRight className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   SIGN — amount inside engraved medallion frame + IllCoins/IllTransfer vignette
   Summary screen: NO verify code. Tap "Full details" to drill into SignDetail.
   ══════════════════════════════════════════════════════════════════════════ */
function SignDetail({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      {/* header with back + banner */}
      <div className="flex items-center gap-2 px-3 pt-2 pb-1.5 border-b-2 border-black flex-shrink-0">
        <button
          onClick={onBack}
          aria-label="Back"
          className={`flex items-center gap-1 font-sans text-[10px] font-bold uppercase tracking-[0.18em] ${PRESS}`}
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />Back
        </button>
        <div className="flex-1" />
        <Banner className="text-[10px] font-bold tracking-[0.2em] uppercase font-sans">Signature Details</Banner>
        <div className="flex-1" />
        <Stamp>{SIGN.network}</Stamp>
      </div>

      {/* IllTransfer medallion + to/address hero */}
      <div className="flex items-start gap-3 px-4 py-2 border-b border-black flex-shrink-0">
        <div className="relative flex-shrink-0" style={{ width: '56px', height: '56px' }}>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Guilloche size={56} count={12} className="text-black" />
          </div>
          <div className="relative z-10 h-full flex items-center justify-center bg-[#838383]">
            <IllTransfer size={38} filled={false} className="text-black" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-sans text-[8px] font-bold uppercase tracking-[0.22em]">完整的签名详情</div>
          <div className="font-serif text-[18px] font-black leading-tight truncate">{SIGN.to}</div>
          <div className="font-sans text-[10px] truncate" style={MONO}>{SIGN.address}</div>
        </div>
      </div>

      {/* all fields in OrnFrame ruled rows */}
      <OrnFrame pad="px-3 py-1.5" className="mx-3 mt-2 flex-shrink-0">
        <div className="flex flex-col gap-1">
          {([
            ['Amount', `${SIGN.amount} ${SIGN.token}`, false],
            ['Value', SIGN.fiat, false],
            ['Network', SIGN.network, false],
            ['Network Fee', SIGN.fee, false],
          ] as [string, string, boolean][]).map(([k, v, mono]) => (
            <div key={k} className="flex items-baseline justify-between gap-2">
              <FieldLabel>{k}</FieldLabel>
              <span className="text-[12px] font-bold truncate" style={mono ? MONO : undefined}>{v}</span>
            </div>
          ))}
        </div>
      </OrnFrame>

      {/* verify code — inverted banner, prominent */}
      <div className="mx-3 mt-2 flex-shrink-0 bg-black text-[#838383] flex items-center justify-between px-3 py-1.5">
        <span className="font-sans text-[9px] font-bold uppercase tracking-[0.22em]">Verify Code</span>
        <span className="text-[22px] font-bold tracking-[0.35em] tabular-nums" style={MONO}>{SIGN.verify}</span>
      </div>

      <div className="flex-1" />
    </div>
  );
}

function Sign() {
  const [detail, setDetail] = useState(false);
  if (detail) return <SignDetail onBack={() => setDetail(false)} />;

  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      {/* banner title */}
      <div className="flex items-center justify-between px-4 pt-2 pb-1 border-b-2 border-black flex-shrink-0">
        <Banner className="text-[11px] font-bold tracking-[0.2em] uppercase font-sans">Transaction</Banner>
        <Stamp>{SIGN.network}</Stamp>
      </div>

      {/* engraved medallion + amount */}
      <div className="relative flex-shrink-0 flex items-center gap-4 px-4 py-2 border-b border-black overflow-hidden" style={{ minHeight: '138px' }}>
        {/* Guilloche behind coins vignette */}
        <div className="relative flex-shrink-0 flex items-center justify-center" style={{ width: '110px', height: '110px' }}>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Guilloche size={110} count={20} className="text-black" />
          </div>
          <div className="relative z-10 bg-[#838383] p-1">
            <IllCoins size={64} filled={false} className="text-black" />
          </div>
        </div>
        {/* amount panel */}
        <div className="flex-1 min-w-0">
          <FieldLabel>Confirm Send</FieldLabel>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-serif text-[48px] font-black leading-[0.85] tabular-nums tracking-tight">{SIGN.amount}</span>
            <span className="font-serif text-[22px] font-black">{SIGN.token}</span>
          </div>
          <div className="font-sans text-[11px] mt-1">≈ {SIGN.fiat}</div>
          {/* transfer vignette accent */}
          <div className="mt-1 flex items-center gap-1">
            <IllTransfer size={38} filled={false} className="text-black" />
            <span className="font-serif text-[13px] font-black">{SIGN.to}</span>
          </div>
        </div>
      </div>

      {/* ruled data rows — NO verify code */}
      <OrnFrame pad="px-3 py-1" className="mx-3 mt-2 flex-shrink-0">
        <div className="flex flex-col gap-0.5">
          {([
            ['Address', SIGN.address, true],
            ['Network Fee', SIGN.fee, false],
          ] as [string, string, boolean][]).map(([k, v, mono]) => (
            <div key={k} className="flex items-baseline justify-between gap-2">
              <FieldLabel>{k}</FieldLabel>
              <span className="text-[12px] font-bold truncate" style={mono ? MONO : undefined}>{v}</span>
            </div>
          ))}
        </div>
      </OrnFrame>

      {/* drill affordance — full details & verify code */}
      <button
        onClick={() => setDetail(true)}
        className={`mx-3 mt-2 flex-shrink-0 flex items-center justify-between px-3 py-2 border border-black ${PRESS}`}
      >
        <span className="font-sans text-[10px] font-bold uppercase tracking-[0.18em]">完整详情 / Full details &amp; verify code</span>
        <ChevronRight className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
      </button>

      {/* spacer */}
      <div className="flex-1" />

      {/* action bar */}
      <Rule thick />
      <div className="flex flex-shrink-0">
        <button
          className={`w-[72px] h-14 border-r-2 border-black flex items-center justify-center ${PRESS}`}
          aria-label="Reject"
        >
          <X className="w-6 h-6" strokeWidth={2.5} />
        </button>
        <button className="flex-1 h-14 bg-black text-[#838383] flex items-center justify-center gap-2 active:bg-[#838383] active:text-black">
          <Check className="w-5 h-5" strokeWidth={2.75} />
          <span className="font-sans text-[12px] font-bold uppercase tracking-[0.2em]">Sign &amp; Seal</span>
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   HISTORY LIST + DETAIL drill
   ══════════════════════════════════════════════════════════════════════════ */
function HistoryDetail({ e, onBack }: { e: typeof HIST[number]; onBack: () => void }) {
  const monoKeys = /address|hash|tx/i;
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      {/* header */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b-2 border-black flex-shrink-0">
        <button onClick={onBack} aria-label="Back" className={`flex items-center gap-1 font-sans text-[10px] font-bold uppercase tracking-[0.18em] ${PRESS}`}>
          <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />Back
        </button>
        <div className="flex-1" />
        <Banner className="text-[10px] font-bold tracking-[0.2em] uppercase font-sans">Signature</Banner>
        <div className="flex-1" />
        <Stamp>{e.ok ? 'Signed' : 'Rejected'}</Stamp>
      </div>

      {/* summary with IllLedger vignette */}
      <div className="flex items-start gap-3 px-4 py-2 border-b border-black flex-shrink-0">
        <div className="relative flex-shrink-0" style={{ width: '60px', height: '60px' }}>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Guilloche size={60} count={14} className="text-black" />
          </div>
          <div className="relative z-10 h-full flex items-center justify-center bg-[#838383]">
            <IllLedger size={44} filled={false} className="text-black" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-sans text-[8px] font-bold uppercase tracking-[0.22em]">{e.date} · {e.time} · {e.type}</div>
          <div className="font-serif text-[22px] font-black leading-tight truncate">{e.title}</div>
          <div className="font-sans text-[11px] truncate">{e.sub}</div>
          <Stamp className="mt-0.5">#{e.idx}</Stamp>
        </div>
      </div>

      {/* detail rows */}
      <div className="flex-1 flex flex-col min-h-0">
        {e.detail.map(([k, v]) => (
          <div key={k} className="flex-1 flex items-center gap-3 px-4 border-b border-black last:border-b-0">
            <FieldLabel>{k}</FieldLabel>
            <span
              className="flex-1 text-right text-[12px] font-bold truncate"
              style={monoKeys.test(k) ? MONO : undefined}
            >
              {v}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function History() {
  const [sel, setSel] = useState<typeof HIST[number] | null>(null);

  if (sel) return <HistoryDetail e={sel} onBack={() => setSel(null)} />;

  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      {/* masthead banner */}
      <div className="flex items-center justify-between px-4 pt-2 pb-1.5 border-b-2 border-black flex-shrink-0">
        <Banner className="text-[11px] font-bold tracking-[0.2em] uppercase font-sans">Sign History</Banner>
        <Stamp>{HIST.length} Records</Stamp>
      </div>

      {/* rows */}
      <div className="flex-1 flex flex-col min-h-0">
        {HIST.slice(0, 4).map((e) => (
          <button
            key={e.idx}
            onClick={() => setSel(e)}
            className={`flex-1 flex items-center gap-3 px-4 border-b border-black last:border-b-0 text-left ${PRESS}`}
          >
            {/* numeral index in a mini Guilloche surround */}
            <div className="relative flex-shrink-0" style={{ width: '42px', height: '42px' }}>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Guilloche size={42} count={10} className="text-black" />
              </div>
              <div className="relative z-10 h-full flex items-center justify-center">
                <span className="font-serif text-[16px] font-black tabular-nums leading-none">{e.idx}</span>
              </div>
            </div>
            {/* entry text */}
            <div className="flex-1 min-w-0">
              <div className="font-sans text-[8px] font-bold uppercase tracking-[0.22em]">{e.date} · {e.time} · {e.type}</div>
              <div className="font-serif text-[17px] font-black leading-tight truncate">{e.title}</div>
              <div className="font-sans text-[10px] truncate">{e.sub}</div>
            </div>
            <Stamp>{e.ok ? 'Signed' : 'Rejected'}</Stamp>
            <ChevronRight className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   SEED — recovery phrase entry with IllKey vignette medallion
   ══════════════════════════════════════════════════════════════════════════ */
function Seed() {
  const s = useSeedEntry(SEED.count);

  if (s.done) {
    return (
      <div className="flex-1 flex flex-col min-h-0 text-black items-center justify-center">
        {/* completion medallion */}
        <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: '100px', height: '100px' }}>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Guilloche size={100} count={18} className="text-black" />
          </div>
          <div className="relative z-10 bg-[#838383] p-2">
            <Check className="w-10 h-10 text-black" strokeWidth={2.75} />
          </div>
        </div>
        <Banner className="mt-3 text-[12px] font-bold tracking-[0.22em] uppercase font-sans">Phrase Complete</Banner>
        <div className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] mt-2 text-black">
          All {SEED.count} words entered
        </div>
        <button onClick={s.reset} className={`mt-5 px-6 h-10 border-2 border-black font-sans text-[11px] font-bold uppercase tracking-[0.2em] ${PRESS}`}>
          Restart
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      {/* title bar */}
      <div className="flex items-center justify-between px-3 pt-1.5 pb-1.5 border-b-2 border-black flex-shrink-0">
        <Banner className="text-[10px] font-bold tracking-[0.2em] uppercase font-sans">Recovery</Banner>
        <Stamp>Word {String(s.words.length + 1).padStart(2, '0')} / {SEED.count}</Stamp>
      </div>

      {/* key vignette + entered words ledger side by side */}
      <div className="flex items-start gap-2 px-3 py-1.5 border-b border-black flex-shrink-0" style={{ height: '68px' }}>
        {/* IllKey medallion accent */}
        <div className="relative flex-shrink-0" style={{ width: '52px', height: '52px' }}>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Guilloche size={52} count={12} className="text-black" />
          </div>
          <div className="relative z-10 h-full flex items-center justify-center bg-[#838383]">
            <IllKey size={38} filled={false} className="text-black" />
          </div>
        </div>
        {/* entered words bounded band */}
        <div className="flex-1 min-w-0 h-full overflow-hidden">
          {s.words.length === 0
            ? <span className="font-sans text-[10px] tracking-wide">Enter your {SEED.count}-word recovery phrase.</span>
            : <div className="flex flex-wrap gap-x-2 gap-y-0">
                {s.words.map((w, i) => (
                  <span key={i} className="font-sans text-[10px]">
                    <span className="font-bold tabular-nums">{String(i + 1).padStart(2, '0')}</span> {w}
                  </span>
                ))}
              </div>
          }
        </div>
      </div>

      {/* input — OrnFrame styled, prefix + cursor */}
      <div className="px-3 py-1.5 flex-shrink-0">
        <OrnFrame pad="px-2 py-1.5" className="flex items-center gap-0.5">
          <span className="font-serif text-[18px] font-black tracking-wide" style={MONO}>{s.prefix}</span>
          <span className="w-0.5 h-5 bg-black" />
        </OrnFrame>
      </div>

      {/* suggestions */}
      <div className="flex-1 min-h-0 flex flex-col border-t border-black">
        {s.suggestions.length > 0
          ? s.suggestions.map((w) => (
              <button
                key={w}
                onClick={() => s.commit(w)}
                className={`flex-1 w-full flex items-center gap-3 px-4 border-b border-black last:border-b-0 text-left ${PRESS}`}
              >
                <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.75} />
                <span className="font-serif text-[19px] font-black lowercase">{w}</span>
              </button>
            ))
          : <div className="flex-1 flex items-center px-4 font-sans text-[10px] tracking-wide">
              {s.prefix ? 'No matching word' : 'Type to search BIP39'}
            </div>
        }
      </div>

      {/* keyboard */}
      <Rule thick />
      <div className="px-1.5 pb-1.5 pt-1.5 flex flex-col gap-1 flex-shrink-0">
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
            <Delete className={`w-5 h-5 ${s.prefix ? '' : 'invisible'}`} strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   VERIFY — select-length → input (review grid + keyboard) → result
   ══════════════════════════════════════════════════════════════════════════ */
function Verify() {
  const v = useVerifyFlow();
  const rp = useReviewPage(v.idx, v.count);

  /* select-length */
  if (v.step === 'select-length') {
    return (
      <div className="flex-1 flex flex-col min-h-0 text-black">
        {/* banner */}
        <div className="flex items-center justify-between px-4 pt-2 pb-1.5 border-b-2 border-black flex-shrink-0">
          <Banner className="text-[11px] font-bold tracking-[0.2em] uppercase font-sans">Verify Recovery</Banner>
          <IllShield size={28} filled={false} className="text-black" />
        </div>

        {/* shield medallion hero */}
        <div className="relative flex items-center justify-center py-3 border-b border-black flex-shrink-0" style={{ height: '130px' }}>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Guilloche size={130} count={22} className="text-black" />
          </div>
          <OrnFrame pad="px-6 py-2" className="relative z-10 flex flex-col items-center bg-[#838383]">
            <IllShield size={52} filled={false} className="text-black" />
            <div className="font-sans text-[9px] font-bold uppercase tracking-[0.25em] mt-1 text-black text-center">
              Confirm your recovery phrase
            </div>
          </OrnFrame>
        </div>

        {/* length choices */}
        <div className="flex-1 flex flex-col min-h-0">
          {([12, 24] as const).map((n) => (
            <button
              key={n}
              onClick={() => v.pickLength(n)}
              className={`flex-1 flex items-center gap-4 px-4 border-b border-black last:border-b-0 text-left ${PRESS}`}
            >
              <div className="relative flex-shrink-0" style={{ width: '52px', height: '52px' }}>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <Guilloche size={52} count={10} className="text-black" />
                </div>
                <div className="relative z-10 h-full flex items-center justify-center">
                  <span className="font-serif text-[26px] font-black tabular-nums leading-none">{n}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-serif text-[18px] font-black leading-tight">words</div>
                <div className="font-sans text-[10px] mt-0.5">{n === 12 ? 'Standard phrase' : 'Extended phrase'}</div>
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
      <div className="flex-1 flex flex-col min-h-0 text-black items-center justify-center">
        {/* result medallion */}
        <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: '110px', height: '110px' }}>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Guilloche size={110} count={20} className="text-black" />
          </div>
          <div className={`relative z-10 p-3 ${v.ok ? 'bg-black' : 'bg-[#838383] border-2 border-black'}`}>
            {v.ok
              ? <Check className="w-10 h-10 text-[#838383]" strokeWidth={2.75} />
              : <X className="w-10 h-10 text-black" strokeWidth={2.75} />
            }
          </div>
        </div>
        <Banner className="mt-3 text-[12px] font-bold tracking-[0.22em] uppercase font-sans">
          {v.ok ? 'Verified' : 'No Match'}
        </Banner>
        <div className="font-sans text-[10px] tracking-wide mt-2 text-center max-w-[240px] text-black">
          {v.ok
            ? 'Your recovery phrase is correct — this backup is valid.'
            : 'That phrase does not match this wallet. Check your backup and try again.'
          }
        </div>
        {v.ok
          ? <div className="font-sans text-[10px] tracking-[0.25em] uppercase mt-4 text-black">Returning…</div>
          : <button onClick={v.reset} className={`mt-5 px-6 h-10 border-2 border-black font-sans text-[11px] font-bold uppercase tracking-[0.2em] ${PRESS}`}>Try Again</button>
        }
      </div>
    );
  }

  /* input step */
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      {/* header */}
      <div className="flex items-center justify-between px-3 pt-1.5 pb-1.5 border-b-2 border-black flex-shrink-0">
        <Banner className="text-[10px] font-bold tracking-[0.2em] uppercase font-sans">Verify</Banner>
        <div className="flex items-center gap-2">
          {rp.pages > 1 && (
            <Stamp>{rp.page + 1}/{rp.pages}</Stamp>
          )}
          <Stamp>
            {v.editing ? 'Edit ' : 'Word '}{String(v.idx + 1).padStart(2, '0')} / {v.count}
          </Stamp>
        </div>
      </div>

      {/* review grid — 2 columns, OrnFrame wrapping each cell */}
      <div className="px-2 pt-1.5 pb-1 flex-shrink-0">
        <div className="grid grid-cols-2 gap-1" style={{ height: '108px', gridTemplateRows: 'repeat(3, minmax(0,1fr))' }}>
          {rp.slots.map((i) => {
            const filled = i < v.words.length;
            const active = i === v.idx;
            return (
              <button
                key={i}
                onClick={() => v.goToWord(i)}
                disabled={i > v.words.length}
                className={`flex items-center gap-1.5 px-2 border-2 border-black text-left overflow-hidden ${active ? 'bg-black text-[#838383]' : ''} ${i <= v.words.length ? PRESS : ''}`}
              >
                <span className="font-sans text-[9px] font-bold tabular-nums flex-shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-serif text-[13px] font-black lowercase truncate">
                  {filled ? v.words[i] : ''}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* input — OrnFrame */}
      <div className="px-3 pb-1 flex-shrink-0">
        <OrnFrame pad="px-2 py-1" className="flex items-center gap-0.5">
          <span className="font-serif text-[17px] font-black tracking-wide" style={MONO}>{v.prefix}</span>
          <span className="w-0.5 h-5 bg-black" />
        </OrnFrame>
      </div>

      {/* suggestion bar */}
      <div className="h-[42px] flex items-stretch gap-1 px-3 flex-shrink-0">
        {v.suggestions.length > 0
          ? v.suggestions.map((w) => (
              <button
                key={w}
                onClick={() => v.commit(w)}
                className={`flex-1 min-w-0 border-2 border-black flex items-center justify-center px-1 ${PRESS}`}
              >
                <span className="font-serif text-[14px] font-black lowercase truncate">{w}</span>
              </button>
            ))
          : <div className="flex-1 flex items-center justify-center font-sans text-[10px] tracking-wide">
              {v.prefix ? 'No matching word' : 'Type the word'}
            </div>
        }
      </div>

      {/* keyboard */}
      <Rule thick />
      <div className="px-1.5 pb-1.5 pt-1.5 flex flex-col gap-1 flex-shrink-0">
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
            <Delete className={`w-5 h-5 ${v.prefix ? '' : 'invisible'}`} strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   EXPORT
   ══════════════════════════════════════════════════════════════════════════ */
export function EngravingStyle({ screen }: { screen: LabScreen }) {
  if (screen === 'home') return <Home />;
  if (screen === 'sign') return <Sign />;
  if (screen === 'history') return <History />;
  if (screen === 'seed') return <Seed />;
  if (screen === 'verify') return <Verify />;
  return null;
}
