import { useState } from 'react';
import { ChevronRight, ChevronLeft, Bluetooth, BatteryMedium, Check, X, Delete } from 'lucide-react';
import type { LabScreen } from '../data';
import { WALLET, HOME_ITEMS, HIST, SIGN, SEED } from '../data';
import { useSeedEntry, useVerifyFlow, useReviewPage, KEY_ROWS } from '../seedEngine';

/**
 * TIMELINE · 时间轴 — composition cell: timeline.
 * Framing metaphor: an itinerary / time spine. A continuous vertical rail with
 * diamond nodes runs down the left of every screen; each item hangs off a node.
 * Only one older variant used a timeline (and only on History) — this language
 * makes the spine the organizing structure on all three screens. 2-tone; nodes
 * are rotated squares (no border-radius), the rail is a solid 2px line.
 */
const PRESS = 'active:bg-black active:text-[#838383]';
const MONO = { fontFamily: 'ui-monospace, monospace' } as const;

function Placeholder() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8 text-black">
      <div className="text-[15px] font-bold tracking-[0.2em] uppercase">Home · Sign · History</div>
      <div className="text-[14px] mt-2">本次探索仅含 首页 / 签名 / 列表</div>
    </div>
  );
}

/** Left rail segment: continuous spine + a diamond node, optional note left of it. */
function Rail({ note, hollow }: { note?: React.ReactNode; hollow?: boolean }) {
  return (
    <div className="w-[60px] relative flex-shrink-0">
      <div className="absolute top-0 bottom-0 right-[12px] w-[2px] bg-black" aria-hidden="true" />
      <div className={`absolute right-[7px] top-1/2 -translate-y-1/2 w-3 h-3 rotate-45 ${hollow ? 'border-2 border-black bg-[#838383]' : 'bg-black'}`} aria-hidden="true" />
      {note && <div className="absolute right-[24px] top-1/2 -translate-y-1/2 text-right text-[10px] font-bold uppercase tracking-wide leading-tight max-w-[40px]">{note}</div>}
    </div>
  );
}

function Step({ note, hollow, onPress, children }: { note?: React.ReactNode; hollow?: boolean; onPress?: boolean; children: React.ReactNode }) {
  const body = (
    <>
      <Rail note={note} hollow={hollow} />
      <div className="flex-1 flex flex-col justify-center px-3 border-t border-black min-w-0">{children}</div>
    </>
  );
  return onPress
    ? <button className={`flex-1 w-full flex items-stretch min-h-0 text-left ${PRESS}`}>{body}</button>
    : <div className="flex-1 flex items-stretch min-h-0">{body}</div>;
}

/** Step that is itself a tappable button — avoids nesting buttons inside a Step's onPress wrapper. */
function StepBtn({ note, hollow, onClick, children }: { note?: React.ReactNode; hollow?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`flex-1 w-full flex items-stretch min-h-0 text-left ${PRESS}`}>
      <Rail note={note} hollow={hollow} />
      <div className="flex-1 flex flex-col justify-center px-3 border-t border-black min-w-0">{children}</div>
    </button>
  );
}

export function TimelineStyle({ screen }: { screen: LabScreen }) {
  if (screen === 'home') return <Home />;
  if (screen === 'sign') return <Sign />;
  if (screen === 'history') return <History />;
  if (screen === 'seed') return <Seed />;
  if (screen === 'verify') return <Verify />;
  return <Placeholder />;
}

function Home() {
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      <div className="px-4 pt-3 pb-2.5 border-b-2 border-black flex-shrink-0 flex items-end justify-between">
        <div>
          <div className="text-[28px] font-black leading-none tracking-tight">{WALLET.name}</div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] mt-1">{WALLET.model}</div>
        </div>
        <div className="text-[12px] font-bold inline-flex items-center gap-2">
          <span className="inline-flex items-center gap-1"><BatteryMedium className="w-4 h-4" strokeWidth={2.5} />{WALLET.battery}%</span>
          <Bluetooth className="w-4 h-4" strokeWidth={2.5} />
        </div>
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        {HOME_ITEMS.map((it) => (
          <Step key={it.id} onPress>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[21px] font-black leading-tight">{it.label}</div>
                <div className="text-[11px] tracking-wide truncate">{it.sub}</div>
              </div>
              <ChevronRight className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
            </div>
          </Step>
        ))}
      </div>
    </div>
  );
}

function SignDetail({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      <div className="h-[42px] px-3 flex items-center gap-2 border-b-2 border-black flex-shrink-0">
        <button onClick={onBack} aria-label="Back" className={`flex items-center ${PRESS}`}>
          <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
        </button>
        <span className="text-[13px] font-black uppercase tracking-[0.18em] flex-1">Signature Details</span>
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        <Step note="Amt">
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-black leading-none tabular-nums">{SIGN.amount}</span>
            <span className="text-base font-black">{SIGN.token}</span>
          </div>
        </Step>
        <Step note="Val"><div className="text-[17px] font-black">{SIGN.fiat}</div></Step>
        <Step note="To">
          <div className="text-[17px] font-black leading-tight">{SIGN.to}</div>
          <div className="text-[12px] truncate" style={MONO}>{SIGN.address}</div>
        </Step>
        <Step note="Net"><div className="text-[17px] font-black">{SIGN.network}</div></Step>
        <Step note="Fee"><div className="text-[17px] font-black">{SIGN.fee}</div></Step>
        <Step note="Code" hollow>
          <div className="text-[24px] font-black tracking-[0.1em]" style={MONO}>{SIGN.verify}</div>
        </Step>
      </div>
    </div>
  );
}

function Sign() {
  const [detail, setDetail] = useState(false);
  if (detail) return <SignDetail onBack={() => setDetail(false)} />;
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      <div className="h-[40px] flex items-center justify-between px-4 border-b-2 border-black flex-shrink-0">
        <span className="text-[13px] font-black uppercase tracking-[0.22em]">Confirm Send</span>
        <span className="text-[11px] font-bold tracking-wide" style={MONO}>{SIGN.network}</span>
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        <Step note="Amt">
          <div className="flex items-baseline gap-2"><span className="text-[40px] font-black leading-none tabular-nums">{SIGN.amount}</span><span className="text-lg font-black">{SIGN.token}</span><span className="text-[12px] ml-1">{SIGN.fiat}</span></div>
        </Step>
        <Step note="To">
          <div className="text-[18px] font-black leading-tight">{SIGN.to}</div>
          <div className="text-[12px] truncate" style={MONO}>{SIGN.address}</div>
        </Step>
        <Step note="Net"><div className="text-[17px] font-black">{SIGN.network}</div></Step>
        <Step note="Fee"><div className="text-[17px] font-black">{SIGN.fee}</div></Step>
        {/* drill to full details + verify code — NO verify code on this summary */}
        <StepBtn note="..." hollow onClick={() => setDetail(true)}>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[13px] font-black uppercase tracking-[0.15em]">Full details &amp; verify code</span>
            <ChevronRight className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
          </div>
        </StepBtn>
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
  if (sel) return <HistoryDetail e={sel} onBack={() => setSel(null)} />;
  const rows = HIST.slice(0, 5);
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      <div className="px-4 pt-3.5 pb-2 flex items-baseline justify-between border-b-2 border-black flex-shrink-0">
        <span className="text-[24px] font-black tracking-tight uppercase">History</span>
        <span className="text-[11px] font-bold tracking-[0.2em]">{HIST.length} · LATEST FIRST</span>
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        {rows.map((e) => (
          <StepBtn key={e.idx} note={<span>{e.date}<br />{e.time}</span>} hollow={!e.ok} onClick={() => setSel(e)}>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[17px] font-black leading-tight truncate">{e.title}</div>
                <div className="text-[11px] truncate">{e.type} · {e.sub}</div>
              </div>
              <span className="text-[10px] font-bold tracking-wide flex-shrink-0">{e.ok ? 'SIGNED' : 'REJECTED'}</span>
            </div>
          </StepBtn>
        ))}
      </div>
    </div>
  );
}

function HistoryDetail({ e, onBack }: { e: typeof HIST[number]; onBack: () => void }) {
  // Build the summary as the first spine node, then each detail [k,v] as subsequent nodes
  const isMono = (k: string) => /address|hash|tx/i.test(k);
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      {/* Header — back + title + status */}
      <div className="h-[42px] px-3 flex items-center gap-2 border-b-2 border-black flex-shrink-0">
        <button onClick={onBack} aria-label="Back" className={`flex items-center ${PRESS}`}>
          <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
        </button>
        <span className="text-[14px] font-black uppercase tracking-[0.18em] flex-1">Signature</span>
        <span className="text-[10px] font-bold tracking-[0.2em]">{e.ok ? 'SIGNED' : 'REJECTED'}</span>
      </div>
      {/* Spine of detail nodes */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Summary node — hollow diamond marks the entry point */}
        <Step note={<span>{e.date}<br />{e.time}</span>} hollow>
          <div>
            <div className="text-[20px] font-black leading-tight truncate">{e.title}</div>
            <div className="text-[11px] tracking-wide truncate">{e.type} · {e.sub} · #{e.idx}</div>
          </div>
        </Step>
        {/* One node per detail field — filled diamonds */}
        {e.detail.map(([k, v]) => (
          <Step key={k} note={<span className="text-[9px] uppercase">{k}</span>}>
            <span
              className="text-[14px] font-black truncate"
              style={isMono(k) ? MONO : undefined}
            >
              {v}
            </span>
          </Step>
        ))}
      </div>
    </div>
  );
}

/* ── SEED ── BIP39 recovery entry, time-spine metaphor.
   Each committed word appears as a filled node on the rail. The current input,
   suggestions, and keyboard hang below the frontier node. ── */
function Seed() {
  const s = useSeedEntry(SEED.count);

  if (s.done) {
    return (
      <div className="flex-1 flex flex-col min-h-0 text-black">
        <div className="h-[42px] px-4 flex items-center border-b-2 border-black flex-shrink-0">
          <span className="text-[14px] font-black uppercase tracking-[0.18em]">Recovery Phrase</span>
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          {/* Single completion node */}
          <Step hollow={false}>
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
              <div>
                <div className="text-[18px] font-black leading-tight">All {s.count} words</div>
                <div className="text-[11px] tracking-wide">Recovery phrase complete</div>
              </div>
            </div>
          </Step>
          {/* Spacer node with restart */}
          <Step hollow>
            <button onClick={s.reset} className={`text-[13px] font-black uppercase tracking-[0.15em] ${PRESS}`}>
              Restart
            </button>
          </Step>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      {/* Header with progress note */}
      <div className="h-[42px] px-4 flex items-center justify-between border-b-2 border-black flex-shrink-0">
        <span className="text-[14px] font-black uppercase tracking-[0.18em]">Recovery</span>
        <span className="text-[11px] font-bold tracking-[0.18em] uppercase">
          Word <span className="text-[15px] font-black">{String(s.words.length + 1).padStart(2, '0')}</span> / {s.count}
        </span>
      </div>

      {/* Entered-words ledger — each word is a spine node (bounded, no scroll) */}
      <div className="flex-shrink-0 overflow-hidden" style={{ maxHeight: '112px' }}>
        {s.words.length === 0 ? (
          <div className="flex items-stretch min-h-0" style={{ minHeight: '40px' }}>
            <div className="w-[60px] relative flex-shrink-0">
              <div className="absolute top-0 bottom-0 right-[12px] w-[2px] bg-black" aria-hidden="true" />
              <div className="absolute right-[7px] top-1/2 -translate-y-1/2 w-3 h-3 rotate-45 border-2 border-black bg-[#838383]" aria-hidden="true" />
            </div>
            <div className="flex-1 flex items-center px-3 border-t border-black">
              <span className="text-[12px] font-bold tracking-wide">Enter your {s.count}-word recovery phrase</span>
            </div>
          </div>
        ) : (
          s.words.map((w, i) => (
            <div key={i} className="flex items-stretch" style={{ minHeight: '22px' }}>
              <div className="w-[60px] relative flex-shrink-0">
                <div className="absolute top-0 bottom-0 right-[12px] w-[2px] bg-black" aria-hidden="true" />
                <div className="absolute right-[7px] top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-black" aria-hidden="true" />
                <div className="absolute right-[24px] top-1/2 -translate-y-1/2 text-right text-[9px] font-bold leading-tight">
                  {String(i + 1).padStart(2, '0')}
                </div>
              </div>
              <div className="flex-1 flex items-center px-3 border-t border-black">
                <span className="text-[13px] font-black">{w}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Current-input node — frontier on the spine */}
      <div className="flex items-stretch flex-shrink-0">
        <div className="w-[60px] relative flex-shrink-0">
          <div className="absolute top-0 bottom-0 right-[12px] w-[2px] bg-black" aria-hidden="true" />
          <div className="absolute right-[5px] top-1/2 -translate-y-1/2 w-4 h-4 rotate-45 bg-black" aria-hidden="true" />
        </div>
        <div className="flex-1 flex items-center px-3 border-t-2 border-black py-2">
          <div className="flex items-center border-2 border-black px-3 h-[38px] flex-1">
            <span className="text-[16px] font-black" style={MONO}>{s.prefix}</span>
            <span className="w-[2px] h-5 bg-black ml-0.5" />
          </div>
          {s.words.length > 0 && (
            <button
              onClick={s.backWord}
              className={`ml-2 h-[38px] px-3 border-2 border-black text-[11px] font-bold uppercase tracking-wide flex-shrink-0 ${PRESS}`}
            >
              Back word
            </button>
          )}
        </div>
      </div>

      {/* Suggestions — each is a mini node on the spine (capped at 3) */}
      <div className="flex-shrink-0">
        {s.suggestions.length > 0 ? s.suggestions.map((w) => (
          <div key={w} className="flex items-stretch" style={{ minHeight: '36px' }}>
            <div className="w-[60px] relative flex-shrink-0">
              <div className="absolute top-0 bottom-0 right-[12px] w-[2px] bg-black" aria-hidden="true" />
              <div className="absolute right-[8px] top-1/2 -translate-y-1/2 w-[10px] h-[10px] rotate-45 border-[2px] border-black bg-[#838383]" aria-hidden="true" />
            </div>
            <button
              onClick={() => s.commit(w)}
              className={`flex-1 flex items-center px-3 border-t border-black text-left ${PRESS}`}
            >
              <span className="text-[16px] font-black">{w}</span>
            </button>
          </div>
        )) : (
          <div className="flex items-stretch" style={{ minHeight: '36px' }}>
            <div className="w-[60px] relative flex-shrink-0">
              <div className="absolute top-0 bottom-0 right-[12px] w-[2px] bg-black" aria-hidden="true" />
            </div>
            <div className="flex-1 flex items-center px-3 border-t border-black">
              <span className="text-[12px] font-bold">{s.prefix ? 'No match' : 'Type to search BIP39'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard — disabled keys keep box, content invisible */}
      <div className="flex-1 flex flex-col justify-end px-1.5 pb-2 pt-1.5 border-t-2 border-black flex-shrink-0">
        {KEY_ROWS.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1 mb-1">
            {row.split('').map((k) => {
              const enabled = s.validNext.has(k);
              return (
                <button
                  key={k}
                  disabled={!enabled}
                  onClick={() => s.type(k)}
                  className={`h-10 flex-1 max-w-[34px] border-2 border-black text-[13px] font-black uppercase ${enabled ? PRESS : ''}`}
                >
                  <span className={enabled ? '' : 'invisible'}>{k}</span>
                </button>
              );
            })}
          </div>
        ))}
        <div className="flex justify-center gap-1">
          <button
            onClick={s.backspace}
            disabled={!s.prefix}
            className={`h-10 px-5 border-2 border-black flex items-center justify-center ${s.prefix ? PRESS : ''}`}
            aria-label="Backspace"
          >
            <Delete className={`w-5 h-5 ${s.prefix ? '' : 'invisible'}`} strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── VERIFY ── verify-recovery, time-spine metaphor.
   select-length: two choices as spine nodes.
   input: the review grid cells become the spine; keyboard + suggestions below.
   result: a single outcome node (Check/X) at the end of the rail. ── */
function Verify() {
  const v = useVerifyFlow();
  const rp = useReviewPage(v.idx, v.count);

  if (v.step === 'select-length') {
    return (
      <div className="flex-1 flex flex-col min-h-0 text-black">
        <div className="h-[42px] px-4 flex items-center border-b-2 border-black flex-shrink-0">
          <span className="text-[14px] font-black uppercase tracking-[0.18em]">Verify Recovery</span>
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          {[12, 24].map((n) => (
            <StepBtn key={n} hollow onClick={() => v.pickLength(n as 12 | 24)}>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-[36px] font-black leading-none">{n}</span>
                  <span className="text-[14px] font-black ml-2">words</span>
                  <div className="text-[11px] tracking-wide mt-0.5">{n === 12 ? 'Standard phrase' : 'Extended phrase'}</div>
                </div>
                <ChevronRight className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
              </div>
            </StepBtn>
          ))}
        </div>
      </div>
    );
  }

  if (v.step === 'result') {
    return (
      <div className="flex-1 flex flex-col min-h-0 text-black">
        <div className="h-[42px] px-4 flex items-center border-b-2 border-black flex-shrink-0">
          <span className="text-[14px] font-black uppercase tracking-[0.18em]">Verify Recovery</span>
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          <Step hollow={!v.ok}>
            <div className="flex items-center gap-3">
              {v.ok
                ? <Check className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
                : <X className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />}
              <div>
                <div className="text-[20px] font-black leading-tight">{v.ok ? 'Verified' : 'No Match'}</div>
                <div className="text-[11px] tracking-wide">
                  {v.ok ? 'Recovery phrase is correct.' : 'Phrase does not match wallet.'}
                </div>
              </div>
            </div>
          </Step>
          <Step hollow>
            {v.ok
              ? <span className="text-[11px] font-bold tracking-[0.2em] uppercase">Returning…</span>
              : (
                <button onClick={v.reset} className={`text-[13px] font-black uppercase tracking-[0.15em] ${PRESS}`}>
                  Try Again
                </button>
              )}
          </Step>
        </div>
      </div>
    );
  }

  // INPUT step
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      {/* Header */}
      <div className="h-[42px] px-3 flex items-center gap-2 border-b-2 border-black flex-shrink-0">
        <button onClick={() => v.reset()} aria-label="Back" className={`flex items-center ${PRESS}`}>
          <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
        </button>
        <span className="text-[11px] font-bold tracking-[0.18em] uppercase flex-1">
          {v.editing ? 'Edit word' : 'Word'}{' '}
          <span className="text-[15px] font-black">{String(v.idx + 1).padStart(2, '0')}</span> / {v.count}
        </span>
        {rp.pages > 1 && (
          <span className="text-[10px] font-bold tracking-[0.2em]">{rp.page + 1}/{rp.pages}</span>
        )}
      </div>

      {/* Review grid — nodes on the spine; active cell = inverted */}
      <div className="flex-shrink-0 overflow-hidden" style={{ maxHeight: '120px' }}>
        {rp.slots.map((i) => {
          const filled = i < v.words.length;
          const active = i === v.idx;
          const disabled = i > v.words.length;
          return (
            <div key={i} className={`flex items-stretch ${active ? 'bg-black text-[#838383]' : ''}`} style={{ minHeight: '20px' }}>
              <div className="w-[60px] relative flex-shrink-0">
                <div
                  className="absolute top-0 bottom-0 right-[12px] w-[2px]"
                  style={{ background: active ? '#838383' : 'black' }}
                  aria-hidden="true"
                />
                <div
                  className={`absolute right-[7px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rotate-45 ${active ? 'bg-[#838383]' : filled ? 'bg-black' : 'border-2 border-black bg-[#838383]'}`}
                  aria-hidden="true"
                />
                <div
                  className={`absolute right-[24px] top-1/2 -translate-y-1/2 text-right text-[9px] font-bold leading-tight`}
                  style={{ color: active ? '#838383' : 'black' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
              </div>
              <button
                onClick={() => !disabled && v.goToWord(i)}
                disabled={disabled}
                className={`flex-1 flex items-center px-3 border-t border-black text-left ${(!disabled && !active) ? PRESS : ''}`}
              >
                <span className="text-[13px] font-black">{filled ? v.words[i] : ''}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Input node — frontier on the spine */}
      <div className="flex items-stretch flex-shrink-0">
        <div className="w-[60px] relative flex-shrink-0">
          <div className="absolute top-0 bottom-0 right-[12px] w-[2px] bg-black" aria-hidden="true" />
          <div className="absolute right-[5px] top-1/2 -translate-y-1/2 w-4 h-4 rotate-45 bg-black" aria-hidden="true" />
        </div>
        <div className="flex-1 flex items-center px-3 border-t-2 border-black py-2">
          <div className="flex items-center border-2 border-black px-3 h-[36px] flex-1">
            <span className="text-[15px] font-black" style={MONO}>{v.prefix}</span>
            <span className="w-[2px] h-5 bg-black ml-0.5" />
          </div>
        </div>
      </div>

      {/* Suggestions — up to 3 hollow nodes */}
      <div className="flex-shrink-0">
        {v.suggestions.length > 0 ? v.suggestions.map((w) => (
          <div key={w} className="flex items-stretch" style={{ minHeight: '34px' }}>
            <div className="w-[60px] relative flex-shrink-0">
              <div className="absolute top-0 bottom-0 right-[12px] w-[2px] bg-black" aria-hidden="true" />
              <div className="absolute right-[8px] top-1/2 -translate-y-1/2 w-[10px] h-[10px] rotate-45 border-[2px] border-black bg-[#838383]" aria-hidden="true" />
            </div>
            <button
              onClick={() => v.commit(w)}
              className={`flex-1 flex items-center px-3 border-t border-black text-left ${PRESS}`}
            >
              <span className="text-[15px] font-black">{w}</span>
            </button>
          </div>
        )) : (
          <div className="flex items-stretch" style={{ minHeight: '34px' }}>
            <div className="w-[60px] relative flex-shrink-0">
              <div className="absolute top-0 bottom-0 right-[12px] w-[2px] bg-black" aria-hidden="true" />
            </div>
            <div className="flex-1 flex items-center px-3 border-t border-black">
              <span className="text-[11px] font-bold">{v.prefix ? 'No match' : 'Type the word'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard */}
      <div className="flex-1 flex flex-col justify-end px-1.5 pb-2 pt-1 border-t-2 border-black flex-shrink-0">
        {KEY_ROWS.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1 mb-1">
            {row.split('').map((k) => {
              const enabled = v.validNext.has(k);
              return (
                <button
                  key={k}
                  disabled={!enabled}
                  onClick={() => v.type(k)}
                  className={`h-10 flex-1 max-w-[34px] border-2 border-black text-[13px] font-black uppercase ${enabled ? PRESS : ''}`}
                >
                  <span className={enabled ? '' : 'invisible'}>{k}</span>
                </button>
              );
            })}
          </div>
        ))}
        <div className="flex justify-center gap-1">
          <button
            onClick={v.backspace}
            disabled={!v.prefix}
            className={`h-10 px-5 border-2 border-black flex items-center justify-center ${v.prefix ? PRESS : ''}`}
            aria-label="Backspace"
          >
            <Delete className={`w-5 h-5 ${v.prefix ? '' : 'invisible'}`} strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </div>
  );
}
