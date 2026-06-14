import { useState } from 'react';
import { ChevronRight, ChevronLeft, Bluetooth, BatteryMedium, Check, X, Delete } from 'lucide-react';
import type { LabScreen } from '../data';
import { WALLET, HOME_ITEMS, HIST, SIGN, SEED } from '../data';
import { QrBlock, Barcode } from '../atoms';
import { useSeedEntry, useVerifyFlow, useReviewPage, KEY_ROWS } from '../seedEngine';

/**
 * TICKET · 车票 — composition cell: split-5050.
 * Framing metaphor: a travel ticket / boarding pass. Every screen is split by a
 * perforation line into a MAIN body (the journey) and a narrow STUB (the
 * detachable counterfoil holding codes & status). No other language uses a
 * tear-line split, so the eye reads "primary | keepsake". 1-bit safe (the
 * perforation is solid dots, never a dashed border). Sans + mono.
 */
const PRESS = 'active:bg-black active:text-[#838383]';

function Placeholder() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8 text-black">
      <div className="text-[15px] font-bold tracking-[0.2em] uppercase">Home · Sign · History</div>
      <div className="text-[14px] mt-2">本次探索仅含 首页 / 签名 / 列表</div>
    </div>
  );
}

/* ── SEED ── boarding-pass split: main body = input + suggestions + keyboard;
   stub = WORD nn/12 counter + entered word count bar. ── */
function Seed() {
  const s = useSeedEntry(SEED.count);

  if (s.done) {
    return (
      <div className="flex-1 flex min-h-0 text-black">
        <main className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="w-[60px] h-[60px] bg-black flex items-center justify-center flex-shrink-0">
            <Check className="w-9 h-9 text-[#838383]" strokeWidth={2.75} />
          </div>
          <div className="text-[22px] font-black uppercase tracking-tight mt-4">Recovery Loaded</div>
          <div className="text-[12px] mt-1.5">All {SEED.count} words entered</div>
          <button onClick={s.reset} className={`mt-6 px-6 h-11 border-2 border-black text-[12px] font-bold uppercase tracking-widest ${PRESS}`}>Restart</button>
        </main>
        <Perf />
        <aside className="w-[84px] flex flex-col items-center justify-center gap-2 px-2 flex-shrink-0">
          <div className="text-[9px] font-bold uppercase tracking-[0.15em]">Words</div>
          <div className="text-[28px] font-black tabular-nums leading-none">{SEED.count}</div>
          <div className="text-[9px] font-bold uppercase tracking-[0.15em]">Complete</div>
        </aside>
      </div>
    );
  }

  return (
    <div className="flex-1 flex min-h-0 text-black">
      {/* main body — journey: ledger + input + suggestions + keyboard */}
      <main className="flex-1 flex flex-col min-h-0">
        {/* pass header */}
        <div className="px-3 pt-2.5 pb-1.5 border-b-2 border-black flex-shrink-0">
          <div className="text-[9px] font-bold uppercase tracking-[0.25em]">Recovery Phrase</div>
          <div className="text-[18px] font-black leading-none tracking-tight mt-0.5">Enter Seed</div>
        </div>
        {/* entered-words ledger — bounded band, no scroll */}
        <div className="px-3 py-1.5 border-b border-black flex-shrink-0 h-[40px] overflow-hidden">
          {s.words.length === 0
            ? <span className="text-[11px] tracking-wide">Enter your {SEED.count}-word phrase</span>
            : <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                {s.words.map((w, i) => (
                  <span key={i} className="text-[11px]">
                    <span className="font-bold tabular-nums" style={{ fontFamily: 'ui-monospace, monospace' }}>{String(i + 1).padStart(2, '0')}</span> {w}
                  </span>
                ))}
              </div>}
        </div>
        {/* input field — prefix + cursor */}
        <div className="px-3 py-1.5 flex-shrink-0 border-b border-black">
          <div className="h-9 border-2 border-black flex items-center px-2.5">
            <span className="text-[17px] font-black tracking-wide" style={{ fontFamily: 'ui-monospace, monospace' }}>{s.prefix}</span>
            <span className="w-0.5 h-5 bg-black ml-1 flex-shrink-0" />
          </div>
        </div>
        {/* suggestions — up to 3, tap to commit */}
        <div className="flex gap-1 px-2 py-1.5 flex-shrink-0 border-b border-black h-[44px]">
          {s.suggestions.length > 0 ? s.suggestions.map(w => (
            <button key={w} onClick={() => s.commit(w)} className={`flex-1 min-w-0 border-2 border-black flex items-center justify-center px-1 ${PRESS}`}>
              <span className="text-[14px] font-black lowercase truncate">{w}</span>
            </button>
          )) : (
            <div className="flex-1 flex items-center text-[11px] px-1">{s.prefix ? 'No match' : 'Type to search'}</div>
          )}
        </div>
        {/* keyboard — disabled keys keep box, content invisible */}
        <div className="flex-1 flex flex-col justify-end pb-1.5 pt-1 px-1 gap-1 flex-shrink-0">
          {KEY_ROWS.map((row, ri) => (
            <div key={ri} className="flex justify-center gap-0.5">
              {row.split('').map(k => {
                const enabled = s.validNext.has(k);
                return (
                  <button key={k} disabled={!enabled} onClick={() => s.type(k)} className={`h-9 flex-1 max-w-[30px] border-2 border-black text-[13px] font-bold uppercase ${enabled ? PRESS : ''}`}>
                    <span className={enabled ? '' : 'invisible'}>{k}</span>
                  </button>
                );
              })}
            </div>
          ))}
          <div className="flex justify-center gap-1 mt-0.5">
            {s.words.length > 0 && (
              <button onClick={s.backWord} className={`h-9 px-3 border-2 border-black text-[11px] font-bold uppercase tracking-wide ${PRESS}`}>Back word</button>
            )}
            <button onClick={s.backspace} disabled={!s.prefix} className={`h-9 px-4 border-2 border-black flex items-center justify-center ${s.prefix ? PRESS : ''}`} aria-label="Backspace">
              <Delete className={`w-5 h-5 ${s.prefix ? '' : 'invisible'}`} strokeWidth={2.25} />
            </button>
          </div>
        </div>
      </main>
      <Perf />
      {/* stub — WORD counter + filled bar */}
      <aside className="w-[84px] flex flex-col items-center justify-between py-3 px-2 flex-shrink-0">
        <div className="text-center">
          <div className="text-[9px] font-bold uppercase tracking-[0.15em]">Word</div>
          <div className="text-[28px] font-black tabular-nums leading-none mt-0.5">{String(s.words.length + 1).padStart(2, '0')}</div>
          <div className="text-[9px] font-bold uppercase tracking-[0.12em] mt-0.5">of {SEED.count}</div>
        </div>
        <div className="w-full flex flex-col gap-[3px]">
          {Array.from({ length: SEED.count }, (_, i) => (
            <div key={i} className={`h-[4px] w-full border border-black ${i < s.words.length ? 'bg-black' : ''}`} />
          ))}
        </div>
        <div className="text-[9px] font-bold uppercase tracking-[0.12em]">{s.words.length}/{SEED.count}</div>
      </aside>
    </div>
  );
}

/* ── VERIFY ── boarding-pass split: main body = review grid + input + keyboard;
   stub = step label + progress. Result state fills the full ticket. ── */
function Verify() {
  const v = useVerifyFlow();
  const rp = useReviewPage(v.idx, v.count);

  if (v.step === 'select-length') {
    return (
      <div className="flex-1 flex min-h-0 text-black">
        <main className="flex-1 flex flex-col min-h-0">
          <div className="px-3 pt-2.5 pb-1.5 border-b-2 border-black flex-shrink-0">
            <div className="text-[9px] font-bold uppercase tracking-[0.25em]">Verify Recovery</div>
            <div className="text-[18px] font-black leading-none tracking-tight mt-0.5">Select Length</div>
          </div>
          <div className="px-3 pt-2 pb-1.5 flex-shrink-0 border-b border-black">
            <div className="text-[12px]">Re-enter every word to confirm your backup.</div>
          </div>
          <div className="flex-1 flex flex-col min-h-0">
            {[12, 24].map(n => (
              <button key={n} onClick={() => v.pickLength(n)} className={`flex-1 flex items-center gap-3 px-4 border-b border-black last:border-b-0 text-left ${PRESS}`}>
                <span className="text-[40px] font-black tabular-nums leading-none w-[56px] flex-shrink-0">{n}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[16px] font-black leading-tight">words</div>
                  <div className="text-[11px] mt-0.5">{n === 12 ? 'Standard phrase' : 'Extended phrase'}</div>
                </div>
                <ChevronRight className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
              </button>
            ))}
          </div>
        </main>
        <Perf />
        <aside className="w-[84px] flex flex-col items-center justify-center gap-2 px-2 flex-shrink-0">
          <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-center">Phrase<br />Length</div>
          <div className="text-[9px] font-bold uppercase tracking-[0.15em] mt-2">12 / 24</div>
        </aside>
      </div>
    );
  }

  if (v.step === 'result') {
    return (
      <div className="flex-1 flex min-h-0 text-black">
        <main className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className={`w-[56px] h-[56px] flex items-center justify-center border-2 border-black ${v.ok ? 'bg-black' : ''}`}>
            {v.ok
              ? <Check className="w-8 h-8 text-[#838383]" strokeWidth={2.75} />
              : <X className="w-8 h-8 text-black" strokeWidth={2.75} />}
          </div>
          <div className="text-[22px] font-black uppercase tracking-tight mt-4">{v.ok ? 'Verified' : 'No Match'}</div>
          <div className="text-[12px] mt-1.5 max-w-[200px]">{v.ok ? 'Your backup is valid.' : 'Phrase does not match. Check your backup.'}</div>
          {v.ok
            ? <div className="text-[11px] font-bold uppercase tracking-[0.2em] mt-5">Returning…</div>
            : <button onClick={v.reset} className={`mt-5 px-6 h-10 border-2 border-black text-[12px] font-bold uppercase tracking-widest ${PRESS}`}>Try Again</button>}
        </main>
        <Perf />
        <aside className="w-[84px] flex flex-col items-center justify-center gap-2 px-2 flex-shrink-0">
          <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-center">Result</div>
          <div className="text-[13px] font-black uppercase tracking-wide mt-1">{v.ok ? 'PASS' : 'FAIL'}</div>
        </aside>
      </div>
    );
  }

  // INPUT step
  return (
    <div className="flex-1 flex min-h-0 text-black">
      <main className="flex-1 flex flex-col min-h-0">
        {/* pass header */}
        <div className="px-3 pt-2 pb-1.5 border-b-2 border-black flex-shrink-0">
          <div className="text-[9px] font-bold uppercase tracking-[0.25em]">Verify Recovery</div>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-[15px] font-black leading-none">{v.editing ? 'Edit word' : 'Word'} {String(v.idx + 1).padStart(2, '0')} / {v.count}</span>
            {rp.pages > 1 && <span className="text-[10px] font-bold tracking-[0.15em]">{rp.page + 1}/{rp.pages}</span>}
          </div>
        </div>
        {/* review grid */}
        <div className="px-2 py-1.5 flex-shrink-0 border-b border-black">
          <div className="grid grid-cols-2 gap-1" style={{ height: '108px', gridTemplateRows: 'repeat(3, minmax(0,1fr))' }}>
            {rp.slots.map(i => {
              const filled = i < v.words.length;
              const active = i === v.idx;
              return (
                <button key={i} onClick={() => v.goToWord(i)} disabled={i > v.words.length}
                  className={`flex items-center gap-1.5 px-2 border-2 border-black text-left overflow-hidden ${active ? 'bg-black text-[#838383]' : ''} ${i <= v.words.length ? PRESS : ''}`}>
                  <span className="text-[10px] font-bold tabular-nums flex-shrink-0" style={{ fontFamily: 'ui-monospace, monospace' }}>{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-[13px] font-black lowercase truncate">{filled ? v.words[i] : ''}</span>
                </button>
              );
            })}
          </div>
        </div>
        {/* input */}
        <div className="px-3 py-1.5 flex-shrink-0 border-b border-black">
          <div className="h-9 border-2 border-black flex items-center px-2.5">
            <span className="text-[16px] font-black tracking-wide" style={{ fontFamily: 'ui-monospace, monospace' }}>{v.prefix}</span>
            <span className="w-0.5 h-5 bg-black ml-1 flex-shrink-0" />
          </div>
        </div>
        {/* suggestions */}
        <div className="flex gap-1 px-2 py-1.5 flex-shrink-0 border-b border-black h-[42px]">
          {v.suggestions.length > 0 ? v.suggestions.map(w => (
            <button key={w} onClick={() => v.commit(w)} className={`flex-1 min-w-0 border-2 border-black flex items-center justify-center px-1 ${PRESS}`}>
              <span className="text-[13px] font-black lowercase truncate">{w}</span>
            </button>
          )) : (
            <div className="flex-1 flex items-center text-[11px] px-1">{v.prefix ? 'No match' : 'Type the word'}</div>
          )}
        </div>
        {/* keyboard */}
        <div className="flex-1 flex flex-col justify-end pb-1.5 pt-1 px-1 gap-1 flex-shrink-0">
          {KEY_ROWS.map((row, ri) => (
            <div key={ri} className="flex justify-center gap-0.5">
              {row.split('').map(k => {
                const enabled = v.validNext.has(k);
                return (
                  <button key={k} disabled={!enabled} onClick={() => v.type(k)} className={`h-9 flex-1 max-w-[30px] border-2 border-black text-[13px] font-bold uppercase ${enabled ? PRESS : ''}`}>
                    <span className={enabled ? '' : 'invisible'}>{k}</span>
                  </button>
                );
              })}
            </div>
          ))}
          <div className="flex justify-center mt-0.5">
            <button onClick={v.backspace} disabled={!v.prefix} className={`h-9 px-4 border-2 border-black flex items-center justify-center ${v.prefix ? PRESS : ''}`} aria-label="Backspace">
              <Delete className={`w-5 h-5 ${v.prefix ? '' : 'invisible'}`} strokeWidth={2.25} />
            </button>
          </div>
        </div>
      </main>
      <Perf />
      {/* stub — step + progress */}
      <aside className="w-[84px] flex flex-col items-center justify-between py-3 px-2 flex-shrink-0">
        <div className="text-center">
          <div className="text-[9px] font-bold uppercase tracking-[0.15em]">Verify</div>
          <div className="text-[24px] font-black tabular-nums leading-none mt-0.5">{String(v.idx + 1).padStart(2, '0')}</div>
          <div className="text-[9px] font-bold uppercase tracking-[0.12em] mt-0.5">of {v.count}</div>
        </div>
        <div className="w-full flex flex-col gap-[3px]">
          {Array.from({ length: v.count }, (_, i) => (
            <div key={i} className={`h-[4px] w-full border border-black ${i < v.words.length ? 'bg-black' : ''}`} />
          ))}
        </div>
        <div className="text-[9px] font-bold uppercase tracking-[0.12em]">{v.words.length}/{v.count}</div>
      </aside>
    </div>
  );
}

/** Vertical perforation (solid dots — NOT a dashed border, e-ink safe). */
function Perf() {
  return (
    <div
      className="w-[3px] self-stretch flex-shrink-0"
      aria-hidden="true"
      style={{ backgroundImage: 'repeating-linear-gradient(180deg, currentColor 0 3px, transparent 3px 7px)' }}
    />
  );
}

export function TicketStyle({ screen }: { screen: LabScreen }) {
  if (screen === 'home') return <Home />;
  if (screen === 'sign') return <Sign />;
  if (screen === 'history') return <History />;
  if (screen === 'seed') return <Seed />;
  if (screen === 'verify') return <Verify />;
  return <Placeholder />;
}

function Home() {
  return (
    <div className="flex-1 flex min-h-0 text-black">
      {/* main body — the pass */}
      <main className="flex-1 flex flex-col min-h-0">
        <div className="px-4 pt-3 pb-2.5 border-b-2 border-black flex-shrink-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.25em]">Wallet Pass</div>
          <div className="text-[30px] font-black leading-none tracking-tight mt-1">{WALLET.name}</div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] mt-1">{WALLET.model}</div>
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          {HOME_ITEMS.map((it) => (
            <button key={it.id} className={`flex-1 flex items-center gap-3 px-4 border-b border-black text-left ${PRESS}`}>
              <span className="text-[10px] font-bold uppercase tracking-wide w-[52px] flex-shrink-0" style={{ fontFamily: 'ui-monospace, monospace' }}>{it.code}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[20px] font-black leading-tight">{it.label}</div>
                <div className="text-[11px] tracking-wide truncate">{it.sub}</div>
              </div>
              <ChevronRight className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
            </button>
          ))}
        </div>
      </main>
      <Perf />
      {/* stub — counterfoil */}
      <aside className="w-[84px] flex flex-col items-center justify-between py-3 px-2 flex-shrink-0">
        <div className="text-center">
          <div className="text-[9px] font-bold uppercase tracking-[0.15em]">Power</div>
          <div className="text-[16px] font-black inline-flex items-center gap-1"><BatteryMedium className="w-4 h-4" strokeWidth={2.5} />{WALLET.battery}</div>
        </div>
        <div className="text-center"><Bluetooth className="w-5 h-5 mx-auto" strokeWidth={2.5} /><div className="text-[9px] font-bold uppercase tracking-wide mt-0.5">Link</div></div>
        <div className="text-center text-[10px] font-bold uppercase tracking-wide leading-tight">NET {WALLET.networks}<br />TOK {WALLET.tokens}</div>
        <QrBlock size={56} seed={WALLET.name} className="text-black" />
      </aside>
    </div>
  );
}

/* ── SIGN DETAIL — full boarding-pass page with all fields + verify code ── */
function SignDetail({ onBack }: { onBack: () => void }) {
  const MONO = { fontFamily: 'ui-monospace, monospace' } as const;
  const fields: [string, string, boolean][] = [
    ['Amount',      `${SIGN.amount} ${SIGN.token}`, false],
    ['Value',       SIGN.fiat,                       false],
    ['To',          SIGN.to,                         false],
    ['Address',     SIGN.address,                    true],
    ['Network',     SIGN.network,                    false],
    ['Network fee', SIGN.fee,                        false],
  ];
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      {/* header — back + title */}
      <div className="px-3 pt-3 pb-2 flex items-center gap-2 border-b-2 border-black flex-shrink-0">
        <button onClick={onBack} aria-label="Back" className={`flex items-center -ml-1 px-1 ${PRESS}`}>
          <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
        </button>
        <span className="text-[18px] font-black uppercase tracking-tight leading-none">Full Details</span>
      </div>
      <div className="flex flex-1 min-h-0">
        {/* main body — field rows */}
        <main className="flex-1 flex flex-col min-h-0">
          {fields.map(([label, value, mono]) => (
            <div key={label} className="flex-1 flex items-center justify-between gap-2 px-4 border-b border-black last:border-b-0 min-h-0">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] flex-shrink-0">{label}</span>
              <span className="text-[13px] font-black text-right truncate" style={mono ? MONO : undefined}>{value}</span>
            </div>
          ))}
        </main>
        <Perf />
        {/* stub — verify code counterfoil */}
        <aside className="w-[96px] flex flex-col items-center justify-center gap-3 px-2 py-4 flex-shrink-0">
          <div className="text-center">
            <div className="text-[9px] font-bold uppercase tracking-[0.18em]">Verify Code</div>
            <div className="text-[26px] font-black tracking-[0.08em] leading-none mt-1" style={{ fontFamily: 'ui-monospace, monospace' }}>{SIGN.verify}</div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Sign() {
  const [detail, setDetail] = useState(false);
  if (detail) return <SignDetail onBack={() => setDetail(false)} />;
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      <div className="flex flex-1 min-h-0">
        {/* main body — the journey (NO verify code here) */}
        <main className="flex-1 flex flex-col min-h-0 px-4 py-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] flex-shrink-0">Confirm Send</div>
          <div className="flex-1 flex flex-col justify-center min-h-0">
            <div className="flex items-baseline gap-2">
              <span className="text-[64px] font-black leading-[0.78] tracking-tight tabular-nums">{SIGN.amount}</span>
              <span className="text-2xl font-black">{SIGN.token}</span>
            </div>
            <div className="text-[13px] mt-1">{SIGN.fiat}</div>
            <div className="text-[22px] font-black mt-5">→ {SIGN.to}</div>
            <div className="text-[12px] mt-1" style={{ fontFamily: 'ui-monospace, monospace' }}>{SIGN.address}</div>
          </div>
          <div className="flex items-end gap-3 flex-shrink-0">
            <Barcode className="h-7 flex-1 text-black" />
            <span className="text-[11px] font-bold uppercase tracking-wide">{SIGN.network}</span>
          </div>
        </main>
        <Perf />
        {/* stub — fee + drill to full details */}
        <aside className="w-[96px] flex flex-col items-center justify-between py-4 px-2 flex-shrink-0">
          <div className="text-center">
            <div className="text-[9px] font-bold uppercase tracking-[0.18em]">Fee</div>
            <div className="text-[15px] font-black mt-0.5">{SIGN.fee}</div>
          </div>
          <button
            onClick={() => setDetail(true)}
            className={`w-full flex flex-col items-center gap-1 py-2 border-2 border-black ${PRESS}`}
            aria-label="Full details and verify code"
          >
            <span className="text-[9px] font-bold uppercase tracking-[0.12em] leading-tight text-center">Full details<br />&amp; verify</span>
            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </aside>
      </div>
      <div className="flex border-t-2 border-black flex-shrink-0">
        <button className={`w-[76px] h-16 border-r-2 border-black flex items-center justify-center ${PRESS}`} aria-label="Reject">
          <X className="w-7 h-7" strokeWidth={2.5} />
        </button>
        <button className="flex-1 h-16 bg-black text-[#838383] flex items-center justify-center gap-2.5 active:bg-[#838383] active:text-black">
          <Check className="w-6 h-6" strokeWidth={2.75} />
          <span className="text-[18px] font-black uppercase tracking-[0.15em]">Sign</span>
        </button>
      </div>
    </div>
  );
}

function History() {
  const [sel, setSel] = useState<typeof HIST[number] | null>(null);
  const rows = HIST.slice(0, 5);

  if (sel) return <HistoryDetail e={sel} onBack={() => setSel(null)} />;

  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      <div className="px-4 pt-3.5 pb-2 flex items-baseline justify-between border-b-2 border-black flex-shrink-0">
        <span className="text-[24px] font-black tracking-tight uppercase">Stubs</span>
        <span className="text-[11px] font-bold tracking-[0.2em]">{HIST.length} ISSUED</span>
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        {rows.map((e) => (
          <button key={e.idx} onClick={() => setSel(e)} className={`flex-1 flex items-center border-t border-black min-h-0 w-full text-left ${PRESS}`}>
            {/* stub left — number & date */}
            <div className="w-[78px] flex flex-col justify-center px-3 flex-shrink-0">
              <div className="text-[18px] font-black leading-none tabular-nums" style={{ fontFamily: 'ui-monospace, monospace' }}>{e.idx}</div>
              <div className="text-[9px] font-bold uppercase tracking-wide mt-0.5">{e.date} {e.time}</div>
            </div>
            <Perf />
            {/* body */}
            <div className="flex-1 flex items-center gap-2 px-3 min-w-0">
              <div className="flex-1 min-w-0">
                <div className="text-[17px] font-black leading-tight truncate">{e.title}</div>
                <div className="text-[11px] truncate">{e.type} · {e.sub}</div>
              </div>
              <span className="text-[10px] font-bold tracking-wide flex-shrink-0">{e.ok ? 'SIGNED' : 'REJECTED'}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function HistoryDetail({ e, onBack }: { e: typeof HIST[number]; onBack: () => void }) {
  const isMono = (k: string) => k === 'Address' || k.includes('hash') || k.includes('Tx');
  return (
    <div className="flex-1 flex min-h-0 text-black">
      {/* main body — ticket face: summary + detail rows */}
      <main className="flex-1 flex flex-col min-h-0">
        {/* header — back + title */}
        <div className="px-3 pt-3 pb-2 flex items-center gap-2 border-b-2 border-black flex-shrink-0">
          <button onClick={onBack} aria-label="Back" className={`flex items-center -ml-1 px-1 ${PRESS}`}>
            <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
          </button>
          <span className="text-[18px] font-black uppercase tracking-tight leading-none">Signature</span>
        </div>
        {/* summary band */}
        <div className="px-4 pt-2.5 pb-2 flex-shrink-0 border-b border-black">
          <div className="text-[28px] font-black leading-none tabular-nums">{e.idx}</div>
          <div className="text-[16px] font-black leading-tight mt-1 truncate">{e.title}</div>
          <div className="text-[11px] mt-0.5 truncate">{e.type} · {e.sub}</div>
        </div>
        {/* detail rows */}
        <div className="flex-1 flex flex-col min-h-0">
          {e.detail.map(([k, v]) => (
            <div key={k} className="flex-1 flex items-center justify-between gap-2 px-4 border-b border-black last:border-b-0 min-h-0">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] flex-shrink-0">{k}</span>
              <span className="text-[13px] font-black text-right truncate" style={isMono(k) ? { fontFamily: 'ui-monospace, monospace' } : undefined}>{v}</span>
            </div>
          ))}
        </div>
      </main>
      <Perf />
      {/* stub — status + date */}
      <aside className="w-[84px] flex flex-col items-center justify-center gap-3 px-2 py-3 flex-shrink-0">
        <div className="text-center">
          <div className="text-[9px] font-bold uppercase tracking-[0.15em]">Status</div>
          <div className="text-[13px] font-black uppercase tracking-wide mt-0.5">{e.ok ? 'SIGNED' : 'REJECTED'}</div>
          {e.ok
            ? <Check className="w-5 h-5 mx-auto mt-1" strokeWidth={2.5} />
            : <X className="w-5 h-5 mx-auto mt-1" strokeWidth={2.5} />}
        </div>
        <div className="w-8 h-px bg-black" />
        <div className="text-center">
          <div className="text-[9px] font-bold uppercase tracking-[0.15em]">Date</div>
          <div className="text-[11px] font-black mt-0.5">{e.date}</div>
          <div className="text-[11px] font-black">{e.time}</div>
        </div>
      </aside>
    </div>
  );
}
