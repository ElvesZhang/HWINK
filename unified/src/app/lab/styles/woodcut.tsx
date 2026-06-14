/**
 * woodcut.tsx — WOODCUT / STORYBOOK design language.
 *
 * Metaphor: a hand-carved woodblock print. Subject illustrations run in LINE
 * mode (stroke, no fill) so they read like actual inked woodcuts. Hatch panels
 * at gap=5-6 act as carved shading / ground bands. Banner titles cut ribbon
 * shapes across the composition. The whole aesthetic is warm, characterful, and
 * scene-driven — every screen opens with a woodcut "vignette" before the data.
 *
 * Palette: black ink + #838383 paper only. No opacity, no rounding, no shadow.
 */
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, X, Delete, Bluetooth, BatteryMedium } from 'lucide-react';
import type { LabScreen } from '../data';
import { WALLET, HOME_ITEMS, HIST, SIGN, SEED } from '../data';
import { useSeedEntry, useVerifyFlow, useReviewPage, KEY_ROWS } from '../seedEngine';
import {
  Hatch, Banner,
  IllVault, IllCoins, IllLedger, IllKey, IllShield, IllTransfer,
} from '../illus';

const PRESS = 'active:bg-black active:text-[#838383]';
const MONO = { fontFamily: 'ui-monospace, monospace' } as const;

/* ── shared woodcut primitives ─────────────────────────────────────────── */

/** Thick ruled separator — characteristic woodcut press mark. */
function Rule({ thick }: { thick?: boolean }) {
  return <div className={`flex-shrink-0 ${thick ? 'h-[3px]' : 'h-[2px]'} bg-black`} />;
}

/** Scene panel: illustration + Hatch ground band. Fixed height. */
function ScenePanel({
  illus,
  title,
  sub,
  height = 148,
}: {
  illus: React.ReactNode;
  title: React.ReactNode;
  sub?: string;
  height?: number;
}) {
  return (
    <div className="relative flex-shrink-0 bg-[#838383] flex flex-col" style={{ height }}>
      {/* hatch sky band */}
      <div className="relative h-[28px] flex-shrink-0">
        <Hatch className="absolute inset-0" angle={45} gap={6} />
      </div>
      {/* illustration — centred in the open area */}
      <div className="flex-1 flex items-center justify-center relative">
        {illus}
      </div>
      {/* hatch ground band */}
      <div className="relative h-[22px] flex-shrink-0">
        <Hatch className="absolute inset-0" angle={135} gap={5} />
      </div>
      {/* Banner title floating over the ground */}
      <div className="absolute bottom-[8px] left-0 right-0 flex flex-col items-center gap-0.5">
        <Banner className="text-[11px] font-bold uppercase tracking-[0.22em]">{title}</Banner>
        {sub && <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-black">{sub}</span>}
      </div>
    </div>
  );
}

/** Small hatch accent strip — used as section dividers. */
function HatchStrip({ height = 10, angle = 45, gap = 5 }: { height?: number; angle?: number; gap?: number }) {
  return (
    <div className="relative flex-shrink-0" style={{ height }}>
      <Hatch className="absolute inset-0" angle={angle} gap={gap} />
    </div>
  );
}

/* ── HOME ──────────────────────────────────────────────────────────────── */
function Home() {
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      {/* woodcut scene — vault as the device's "soul" */}
      <ScenePanel
        height={150}
        illus={<IllVault size={88} filled={false} />}
        title={<>{WALLET.name} · {WALLET.model}</>}
      />
      <Rule thick />

      {/* status bar */}
      <div className="px-3 py-1.5 flex items-center justify-between flex-shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em]">
          {WALLET.networks} Networks · {WALLET.tokens} Tokens
        </span>
        <span className="flex items-center gap-2 text-[10px] font-bold">
          <Bluetooth className="w-3.5 h-3.5" strokeWidth={2.5} />
          <BatteryMedium className="w-4 h-4" strokeWidth={2.5} />
          {WALLET.battery}%
        </span>
      </div>
      <Rule />
      <HatchStrip height={6} gap={6} angle={90} />
      <Rule />

      {/* menu entries — woodcut row style */}
      <div className="flex-1 flex flex-col min-h-0">
        {HOME_ITEMS.map((item, i) => (
          <button
            key={item.id}
            className={`flex-1 flex items-center gap-3 px-3 border-b border-black last:border-b-0 text-left ${PRESS}`}
          >
            {/* carved index numeral */}
            <span className="text-[28px] font-black leading-none tabular-nums w-[36px] flex-shrink-0">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[18px] font-black leading-tight">{item.label}</div>
              <div className="text-[10px] font-bold tracking-[0.14em] uppercase">{item.sub}</div>
            </div>
            <ChevronRight className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── SIGN ──────────────────────────────────────────────────────────────── */

/** Full signature detail page — opened on demand. Carries the verify code. */
function SignDetail({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      {/* woodcut transfer scene (compact) */}
      <div className="relative flex-shrink-0 bg-[#838383]" style={{ height: 80 }}>
        <Hatch className="absolute inset-0" angle={45} gap={6} />
        <div className="absolute inset-0 flex items-center px-4 gap-4">
          <div className="flex items-center gap-1.5">
            <IllCoins size={44} filled={false} />
            <IllTransfer size={40} filled={false} />
          </div>
          <div className="flex-1 min-w-0">
            <Banner className="text-[10px] font-bold uppercase tracking-[0.18em]">Signature Details</Banner>
          </div>
        </div>
      </div>
      <Rule thick />

      {/* back control */}
      <div className="px-4 pt-2 pb-1.5 flex-shrink-0 border-b border-black">
        <button
          onClick={onBack}
          className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.18em] ${PRESS}`}
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />Back
        </button>
      </div>

      {/* complete field list including verify code */}
      <div className="flex-1 flex flex-col min-h-0">
        {[
          ['Amount', `${SIGN.amount} ${SIGN.token}`, false],
          ['Value', SIGN.fiat, false],
          ['To', SIGN.to, false],
          ['Address', SIGN.address, true],
          ['Network', SIGN.network, false],
          ['Fee', SIGN.fee, false],
          ['Verify code', SIGN.verify, true],
        ].map(([k, v, mono], i) => {
          const isVerify = i === 6;
          return (
            <div
              key={k as string}
              className="flex-1 flex items-center justify-between gap-3 px-4 border-b border-black last:border-b-0"
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] flex-shrink-0">{k}</span>
              <span
                className={`${isVerify ? 'text-[16px]' : 'text-[13px]'} font-black text-right truncate`}
                style={mono ? MONO : undefined}
              >
                {v}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Sign() {
  const [detail, setDetail] = useState(false);
  if (detail) return <SignDetail onBack={() => setDetail(false)} />;
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      {/* woodcut transfer scene */}
      <ScenePanel
        height={118}
        illus={
          <div className="flex items-center gap-2">
            <IllCoins size={64} filled={false} />
            <IllTransfer size={60} filled={false} />
          </div>
        }
        title="Confirm Transfer"
        sub={SIGN.network}
      />
      <Rule thick />

      {/* amount hero — bold carved numerals */}
      <div className="px-4 pt-3 pb-2 flex-shrink-0">
        <div className="text-[10px] font-bold uppercase tracking-[0.22em]">Amount</div>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-[52px] font-black leading-[0.85] tabular-nums">{SIGN.amount}</span>
          <span className="text-[22px] font-black">{SIGN.token}</span>
          <span className="text-[12px] font-bold ml-auto self-end">≈ {SIGN.fiat}</span>
        </div>
      </div>
      <HatchStrip height={7} gap={5} angle={45} />
      <Rule />

      {/* summary rows — NO verify code */}
      <div className="flex-1 flex flex-col min-h-0">
        {[
          ['To', SIGN.to, false],
          ['Address', SIGN.address, true],
          ['Fee', SIGN.fee, false],
        ].map(([k, v, mono]) => (
          <div key={k as string} className="flex-1 flex items-center justify-between gap-3 px-4 border-b border-black last:border-b-0">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] flex-shrink-0">{k}</span>
            <span
              className="text-[14px] font-black text-right truncate"
              style={mono ? MONO : undefined}
            >
              {v}
            </span>
          </div>
        ))}
        {/* drill to full details + verify code */}
        <button
          onClick={() => setDetail(true)}
          className={`flex-1 w-full flex items-center gap-3 px-4 border-b border-black last:border-b-0 text-left ${PRESS}`}
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] flex-shrink-0">Full details</span>
          <span className="flex-1 text-[10px] font-bold uppercase tracking-[0.14em] truncate">& verify code</span>
          <ChevronRight className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
        </button>
      </div>

      {/* action row */}
      <Rule thick />
      <div className="flex flex-shrink-0 h-14">
        <button
          className={`w-[64px] border-r-2 border-black flex items-center justify-center ${PRESS}`}
          aria-label="Reject"
        >
          <X className="w-6 h-6" strokeWidth={2.5} />
        </button>
        <button className="flex-1 bg-black text-[#838383] flex items-center justify-center gap-2 active:bg-[#838383] active:text-black">
          <Check className="w-5 h-5" strokeWidth={2.75} />
          <span className="text-[14px] font-black uppercase tracking-[0.16em]">Sign</span>
        </button>
      </div>
    </div>
  );
}

/* ── HISTORY ──────────────────────────────────────────────────────────── */
function HistoryDetail({ e, onBack }: { e: typeof HIST[number]; onBack: () => void }) {
  const monoKeys = /address|hash|tx/i;
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      {/* mini scene with ledger illustration */}
      <div className="relative flex-shrink-0 bg-[#838383]" style={{ height: 80 }}>
        <div className="absolute inset-0">
          <Hatch className="absolute inset-0" angle={45} gap={6} />
        </div>
        <div className="absolute inset-0 flex items-center px-4 gap-4">
          <IllLedger size={52} filled={false} />
          <div className="flex-1 min-w-0">
            <Banner className="text-[10px] font-bold uppercase tracking-[0.18em]">Signature</Banner>
            <div className="text-[11px] font-black uppercase tracking-[0.14em] mt-1">
              {e.ok ? 'SIGNED' : 'REJECTED'}
            </div>
          </div>
        </div>
      </div>
      <Rule thick />

      {/* back + summary */}
      <div className="px-4 pt-2 pb-2 flex-shrink-0">
        <button
          onClick={onBack}
          className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.18em] mb-2 ${PRESS}`}
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />Back
        </button>
        <div className="text-[10px] font-bold uppercase tracking-[0.14em]">{e.date} · {e.time} · {e.type}</div>
        <div className="text-[22px] font-black leading-tight">{e.title}</div>
        <div className="text-[11px] font-bold">{e.sub}</div>
      </div>
      <HatchStrip height={7} gap={5} angle={135} />
      <Rule />

      {/* detail rows */}
      <div className="flex-1 flex flex-col min-h-0">
        {e.detail.map(([k, v]) => (
          <div
            key={k}
            className="flex-1 flex items-center justify-between gap-3 px-4 border-b border-black last:border-b-0"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] flex-shrink-0">{k}</span>
            <span
              className="text-[13px] font-black text-right truncate"
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

  const rows = HIST.slice(0, 4);
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      {/* woodcut ledger scene */}
      <ScenePanel
        height={120}
        illus={<IllLedger size={76} filled={false} />}
        title="Sign History"
        sub={`${HIST.length} records`}
      />
      <Rule thick />

      <div className="flex-1 flex flex-col min-h-0">
        {rows.map((e) => (
          <button
            key={e.idx}
            onClick={() => setSel(e)}
            className={`flex-1 flex items-center gap-3 px-4 border-b border-black last:border-b-0 text-left ${PRESS}`}
          >
            <span className="text-[32px] font-black leading-none tabular-nums w-[44px] flex-shrink-0">{e.idx}</span>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-[0.14em]">{e.date} · {e.time} · {e.type}</div>
              <div className="text-[16px] font-black leading-tight truncate">{e.title}</div>
              <div className="text-[10px] font-bold truncate">{e.sub}</div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wide flex-shrink-0">
              {e.ok ? 'SIGNED' : 'REJECTED'}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── SEED ──────────────────────────────────────────────────────────────── */
function Seed() {
  const s = useSeedEntry(SEED.count);

  if (s.done) {
    return (
      <div className="flex-1 flex flex-col min-h-0 text-black">
        {/* completion scene */}
        <div className="relative flex-shrink-0 bg-[#838383]" style={{ height: 160 }}>
          <Hatch className="absolute inset-0" angle={45} gap={6} />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <IllKey size={72} filled={false} />
            <Banner className="text-[11px] font-bold uppercase tracking-[0.2em]">Phrase Complete</Banner>
          </div>
        </div>
        <Rule thick />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <div className="text-[24px] font-black">All {SEED.count} words entered</div>
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] mt-1">Recovery phrase saved</div>
          <button
            onClick={s.reset}
            className={`mt-6 px-7 h-11 border-2 border-black text-[12px] font-black uppercase tracking-[0.16em] ${PRESS}`}
          >
            Restart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      {/* compact key scene header */}
      <div className="relative flex-shrink-0 bg-[#838383]" style={{ height: 64 }}>
        <Hatch className="absolute inset-0" angle={45} gap={6} />
        <div className="absolute inset-0 flex items-center px-4 gap-4">
          <IllKey size={44} filled={false} />
          <div className="flex-1 flex items-center justify-between">
            <Banner className="text-[10px] font-bold uppercase tracking-[0.2em]">Recovery</Banner>
            <span className="text-[11px] font-black uppercase tracking-[0.14em]">
              WORD {String(s.words.length + 1).padStart(2, '0')} / {SEED.count}
            </span>
          </div>
        </div>
      </div>
      <Rule thick />

      {/* entered-words ledger band */}
      <div className="px-4 py-1.5 h-[42px] flex-shrink-0 border-b border-black overflow-hidden">
        {s.words.length === 0
          ? <span className="text-[11px] font-bold tracking-wide">Enter your {SEED.count}-word recovery phrase.</span>
          : (
            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
              {s.words.map((w, i) => (
                <span key={i} className="text-[11px] font-bold">
                  <span className="font-black tabular-nums">{String(i + 1).padStart(2, '0')}</span>{' '}{w}
                </span>
              ))}
            </div>
          )
        }
      </div>

      {/* input field */}
      <div className="px-4 py-2 flex-shrink-0">
        <div className="h-10 border-2 border-black flex items-center px-3 gap-0.5">
          <span className="text-[18px] font-black tracking-wide" style={MONO}>{s.prefix}</span>
          <span className="w-0.5 h-5 bg-black" />
        </div>
      </div>

      {/* suggestions — woodcut row style (chevron + carved word) */}
      <div className="flex-1 min-h-0 flex flex-col border-t border-black">
        {s.suggestions.length > 0
          ? s.suggestions.map((w) => (
              <button
                key={w}
                onClick={() => s.commit(w)}
                className={`flex-1 w-full flex items-center gap-3 px-4 border-b border-black last:border-b-0 text-left ${PRESS}`}
              >
                <ChevronRight className="w-4 h-4 flex-shrink-0" strokeWidth={2.75} />
                <span className="text-[20px] font-black lowercase">{w}</span>
              </button>
            ))
          : (
            <div className="flex-1 flex items-center px-4 text-[11px] font-bold tracking-wide">
              {s.prefix ? 'No matching word' : 'Type to search BIP39'}
            </div>
          )
        }
      </div>

      {/* keyboard */}
      <Rule thick />
      <div className="px-1.5 pb-2 pt-1.5 flex flex-col gap-1.5 flex-shrink-0">
        {KEY_ROWS.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1">
            {row.split('').map((k) => {
              const enabled = s.validNext.has(k);
              return (
                <button
                  key={k}
                  disabled={!enabled}
                  onClick={() => s.type(k)}
                  className={`h-9 flex-1 max-w-[34px] border-2 border-black text-[12px] font-black uppercase ${enabled ? PRESS : ''}`}
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
              className={`h-9 px-3 border-2 border-black text-[11px] font-black uppercase tracking-wide ${PRESS}`}
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

/* ── VERIFY ─────────────────────────────────────────────────────────────── */
function Verify() {
  const v = useVerifyFlow();
  const rp = useReviewPage(v.idx, v.count);

  /* select-length */
  if (v.step === 'select-length') {
    return (
      <div className="flex-1 flex flex-col min-h-0 text-black">
        <ScenePanel
          height={130}
          illus={<IllShield size={76} filled={false} />}
          title="Verify Recovery"
        />
        <Rule thick />
        <div className="px-4 pt-3 pb-2 flex-shrink-0">
          <div className="text-[20px] font-black leading-tight">Re-enter every word to prove your backup is correct.</div>
        </div>
        <HatchStrip height={7} gap={5} angle={45} />
        <Rule />
        <div className="flex-1 flex flex-col min-h-0">
          {([12, 24] as const).map((n) => (
            <button
              key={n}
              onClick={() => v.pickLength(n)}
              className={`flex-1 flex items-center gap-4 px-4 border-b border-black last:border-b-0 text-left ${PRESS}`}
            >
              <span className="text-[44px] font-black leading-none tabular-nums w-[64px] flex-shrink-0">{n}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[18px] font-black">words</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.14em]">
                  {n === 12 ? 'Standard phrase' : 'Extended phrase'}
                </div>
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
        {/* result scene */}
        <div className="relative flex-shrink-0 bg-[#838383]" style={{ height: 150 }}>
          <Hatch className="absolute inset-0" angle={45} gap={6} />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <IllShield size={72} filled={false} />
            <Banner className="text-[11px] font-bold uppercase tracking-[0.2em]">
              {v.ok ? 'Verified' : 'No Match'}
            </Banner>
          </div>
        </div>
        <Rule thick />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <div className="w-[60px] h-[60px] border-2 border-black flex items-center justify-center flex-shrink-0"
            style={v.ok ? { background: 'black' } : undefined}>
            {v.ok
              ? <Check className="w-8 h-8 text-[#838383]" strokeWidth={2.75} />
              : <X className="w-8 h-8 text-black" strokeWidth={2.75} />
            }
          </div>
          <div className="text-[26px] font-black mt-4">{v.ok ? 'Verified' : 'No Match'}</div>
          <div className="text-[11px] font-bold tracking-wide mt-2 max-w-[260px]">
            {v.ok
              ? 'Your recovery phrase is correct — this backup is valid.'
              : 'That phrase does not match this wallet. Check your backup and try again.'
            }
          </div>
          {v.ok
            ? <div className="text-[11px] font-black uppercase tracking-[0.22em] mt-5">Returning…</div>
            : (
              <button
                onClick={v.reset}
                className={`mt-6 px-7 h-11 border-2 border-black text-[12px] font-black uppercase tracking-[0.16em] ${PRESS}`}
              >
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
      {/* compact header */}
      <div className="relative flex-shrink-0 bg-[#838383]" style={{ height: 56 }}>
        <Hatch className="absolute inset-0" angle={45} gap={6} />
        <div className="absolute inset-0 flex items-center px-4 gap-3">
          <IllShield size={38} filled={false} />
          <div className="flex-1 flex items-center justify-between">
            <Banner className="text-[10px] font-bold uppercase tracking-[0.18em]">Verify</Banner>
            <span className="text-[11px] font-black uppercase tracking-[0.14em]">
              {v.editing ? 'Edit' : 'Word'} {String(v.idx + 1).padStart(2, '0')} / {v.count}
            </span>
          </div>
          {rp.pages > 1 && (
            <span className="text-[10px] font-bold tracking-[0.14em]">{rp.page + 1}/{rp.pages}</span>
          )}
        </div>
      </div>
      <Rule thick />

      {/* review grid */}
      <div className="px-3 pt-2 pb-1.5 flex-shrink-0">
        <div
          className="grid grid-cols-2 gap-1"
          style={{ height: '104px', gridTemplateRows: 'repeat(3, minmax(0,1fr))' }}
        >
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
                <span className="text-[10px] font-black tabular-nums flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-[13px] font-black lowercase truncate">{filled ? v.words[i] : ''}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* input field */}
      <div className="px-4 pb-1.5 flex-shrink-0">
        <div className="h-10 border-2 border-black flex items-center px-3 gap-0.5">
          <span className="text-[17px] font-black tracking-wide" style={MONO}>{v.prefix}</span>
          <span className="w-0.5 h-5 bg-black" />
        </div>
      </div>

      {/* suggestion bar */}
      <div className="h-[44px] flex items-stretch gap-1.5 px-3 flex-shrink-0">
        {v.suggestions.length > 0
          ? v.suggestions.map((w) => (
              <button
                key={w}
                onClick={() => v.commit(w)}
                className={`flex-1 min-w-0 border-2 border-black flex items-center justify-center px-1 ${PRESS}`}
              >
                <span className="text-[14px] font-black lowercase truncate">{w}</span>
              </button>
            ))
          : (
            <div className="flex-1 flex items-center justify-center text-[11px] font-bold tracking-wide">
              {v.prefix ? 'No matching word' : 'Type the word'}
            </div>
          )
        }
      </div>

      {/* keyboard */}
      <Rule thick />
      <div className="px-1.5 pb-2 pt-1.5 flex flex-col gap-1.5 flex-shrink-0">
        {KEY_ROWS.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1">
            {row.split('').map((k) => {
              const enabled = v.validNext.has(k);
              return (
                <button
                  key={k}
                  disabled={!enabled}
                  onClick={() => v.type(k)}
                  className={`h-9 flex-1 max-w-[34px] border-2 border-black text-[12px] font-black uppercase ${enabled ? PRESS : ''}`}
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

/* ── ROOT ────────────────────────────────────────────────────────────────── */
export function WoodcutStyle({ screen }: { screen: LabScreen }) {
  if (screen === 'home') return <Home />;
  if (screen === 'sign') return <Sign />;
  if (screen === 'history') return <History />;
  if (screen === 'seed') return <Seed />;
  if (screen === 'verify') return <Verify />;
  return null;
}
