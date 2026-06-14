import { useState } from 'react';
import {
  Wallet, Coins, History as HistoryIcon, KeyRound, Settings, ShieldCheck,
  ArrowRightLeft, ScrollText, Info, ChevronRight, ChevronLeft, Check, X, Delete,
  Bluetooth, BatteryMedium,
} from 'lucide-react';
import type { LabScreen } from '../data';
import { WALLET, HOME_ITEMS, HIST, SIGN, SEED } from '../data';
import { useSeedEntry, useVerifyFlow, useReviewPage, KEY_ROWS } from '../seedEngine';

/**
 * LINEICON · 线性 — clean lucide-style icon experiment.
 *
 * A reaction to the busy bespoke illustrations: ONE consistent thin-stroke icon
 * per concept (real lucide glyphs), generous whitespace, hairline rules, no
 * decoration. Icons label, they don't illustrate. 2-tone, e-ink-calm.
 *
 * Also the REFERENCE for the new Sign pattern: the confirm screen is a summary
 * and does NOT show the verify code; tapping "Full details" opens the complete
 * signature detail (which carries the verify code). Verify code is a separate
 * page, not always on screen.
 */
const PRESS = 'active:bg-black active:text-[#838383]';
const MONO = { fontFamily: 'ui-monospace, monospace' } as const;

const HOME_ICON: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  assets: Coins, history: HistoryIcon, passkey: KeyRound, settings: Settings,
};

export function LineiconStyle({ screen }: { screen: LabScreen }) {
  if (screen === 'home') return <Home />;
  if (screen === 'sign') return <Sign />;
  if (screen === 'history') return <History />;
  if (screen === 'seed') return <Seed />;
  if (screen === 'verify') return <Verify />;
  return null;
}

function StatusBar() {
  return (
    <div className="h-[44px] px-5 flex items-center justify-between border-b border-black flex-shrink-0">
      <span className="inline-flex items-center gap-2 text-[13px] font-semibold tracking-wide">
        <Wallet className="w-[18px] h-[18px]" strokeWidth={1.75} />{WALLET.name}
      </span>
      <span className="inline-flex items-center gap-2.5 text-[12px] font-semibold tabular-nums">
        <Bluetooth className="w-[17px] h-[17px]" strokeWidth={1.75} />
        <span className="inline-flex items-center gap-1"><BatteryMedium className="w-[19px] h-[19px]" strokeWidth={1.75} />{WALLET.battery}%</span>
      </span>
    </div>
  );
}

/* ── HOME — clean icon list ── */
function Home() {
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      <StatusBar />
      <div className="px-5 pt-5 pb-4 flex-shrink-0">
        <div className="text-[30px] font-semibold tracking-tight leading-none">{WALLET.name}</div>
        <div className="text-[12px] tracking-[0.18em] uppercase mt-1.5 text-black">{WALLET.model}</div>
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        {HOME_ITEMS.map((it) => {
          const Icon = HOME_ICON[it.id] ?? Coins;
          return (
            <button key={it.id} className={`flex-1 flex items-center gap-4 px-5 border-t border-black text-left ${PRESS}`}>
              <Icon className="w-7 h-7 flex-shrink-0" strokeWidth={1.75} />
              <div className="flex-1 min-w-0">
                <div className="text-[19px] font-semibold leading-tight">{it.label}</div>
                <div className="text-[12px] tracking-wide truncate">{it.sub}</div>
              </div>
              <ChevronRight className="w-[22px] h-[22px] flex-shrink-0" strokeWidth={1.75} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── SIGN — summary (NO verify code) + drill to full detail ── */
function DetailRow({ label, value, mono, emph }: { label: string; value: string; mono?: boolean; emph?: boolean }) {
  return (
    <div className="flex-1 flex items-center justify-between gap-3 px-5 border-t border-black">
      <span className="text-[12px] font-semibold uppercase tracking-[0.12em] flex-shrink-0">{label}</span>
      <span className={`${emph ? 'text-[24px] tracking-[0.1em]' : 'text-[16px]'} font-semibold text-right truncate`} style={mono ? MONO : undefined}>{value}</span>
    </div>
  );
}

function SignDetail({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      <div className="h-[46px] px-3 flex items-center gap-2 border-b border-black flex-shrink-0">
        <button onClick={onBack} aria-label="Back" className={`flex items-center px-1 ${PRESS}`}><ChevronLeft className="w-6 h-6" strokeWidth={1.75} /></button>
        <span className="text-[15px] font-semibold tracking-tight">Signature details</span>
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        <DetailRow label="Amount" value={`${SIGN.amount} ${SIGN.token}`} />
        <DetailRow label="Value" value={SIGN.fiat} />
        <DetailRow label="To" value={SIGN.to} />
        <DetailRow label="Address" value={SIGN.address} mono />
        <DetailRow label="Network" value={SIGN.network} />
        <DetailRow label="Network fee" value={SIGN.fee} />
        <DetailRow label="Verify code" value={SIGN.verify} mono emph />
      </div>
    </div>
  );
}

function Sign() {
  const [detail, setDetail] = useState(false);
  if (detail) return <SignDetail onBack={() => setDetail(false)} />;
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      <div className="h-[44px] px-5 flex items-center justify-between border-b border-black flex-shrink-0">
        <span className="text-[14px] font-semibold tracking-tight">Confirm Send</span>
        <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold tracking-wide">{SIGN.network}</span>
      </div>
      {/* amount hero with a clean coins icon */}
      <div className="px-5 pt-5 pb-4 flex items-center gap-3 flex-shrink-0">
        <Coins className="w-9 h-9 flex-shrink-0" strokeWidth={1.5} />
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-[44px] font-semibold leading-none tabular-nums tracking-tight">{SIGN.amount}</span>
            <span className="text-xl font-semibold">{SIGN.token}</span>
          </div>
          <div className="text-[13px] mt-1">{SIGN.fiat}</div>
        </div>
      </div>
      {/* essentials — NO verify code here */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex items-center gap-3 px-5 border-t border-black">
          <ArrowRightLeft className="w-5 h-5 flex-shrink-0" strokeWidth={1.75} />
          <div className="flex-1 min-w-0">
            <div className="text-[17px] font-semibold leading-tight truncate">{SIGN.to}</div>
            <div className="text-[12px] truncate" style={MONO}>{SIGN.address}</div>
          </div>
        </div>
        <DetailRow label="Network" value={SIGN.network} />
        <DetailRow label="Network fee" value={SIGN.fee} />
        {/* drill to the complete detail (which holds the verify code) */}
        <button onClick={() => setDetail(true)} className={`flex-1 w-full flex items-center gap-3 px-5 border-t border-black text-left ${PRESS}`}>
          <Info className="w-5 h-5 flex-shrink-0" strokeWidth={1.75} />
          <span className="flex-1 text-[15px] font-semibold">Full details &amp; verify code</span>
          <ChevronRight className="w-[22px] h-[22px] flex-shrink-0" strokeWidth={1.75} />
        </button>
      </div>
      {/* actions */}
      <div className="flex border-t border-black flex-shrink-0">
        <button className={`w-[80px] h-16 border-r border-black flex items-center justify-center ${PRESS}`} aria-label="Reject">
          <X className="w-7 h-7" strokeWidth={1.75} />
        </button>
        <button className="flex-1 h-16 bg-black text-[#838383] flex items-center justify-center gap-2.5 active:bg-[#838383] active:text-black">
          <Check className="w-6 h-6" strokeWidth={2} />
          <span className="text-[18px] font-semibold tracking-tight">Sign</span>
        </button>
      </div>
    </div>
  );
}

/* ── HISTORY — clean type icons + drill to detail ── */
function HistoryDetail({ e, onBack }: { e: typeof HIST[number]; onBack: () => void }) {
  const monoKeys = /address|hash|tx/i;
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      <div className="h-[46px] px-3 flex items-center gap-2 border-b border-black flex-shrink-0">
        <button onClick={onBack} aria-label="Back" className={`flex items-center px-1 ${PRESS}`}><ChevronLeft className="w-6 h-6" strokeWidth={1.75} /></button>
        <span className="text-[15px] font-semibold tracking-tight flex-1">Signature</span>
        <span className="text-[11px] font-semibold tracking-wide">{e.ok ? 'SIGNED' : 'REJECTED'}</span>
      </div>
      <div className="px-5 pt-3 pb-2.5 flex items-center gap-3 border-b border-black flex-shrink-0">
        <span className="text-[28px] font-semibold tabular-nums leading-none">{e.idx}</span>
        <div className="min-w-0">
          <div className="text-[18px] font-semibold leading-tight truncate">{e.title}</div>
          <div className="text-[12px] truncate">{e.date} · {e.time} · {e.type}</div>
        </div>
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        {e.detail.map(([k, v]) => (
          <div key={k} className="flex-1 flex items-center justify-between gap-3 px-5 border-t border-black first:border-t-0">
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] flex-shrink-0">{k}</span>
            <span className="text-[15px] font-semibold text-right truncate" style={monoKeys.test(k) ? MONO : undefined}>{v}</span>
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
      <div className="h-[44px] px-5 flex items-center justify-between border-b border-black flex-shrink-0">
        <span className="inline-flex items-center gap-2 text-[16px] font-semibold tracking-tight"><HistoryIcon className="w-5 h-5" strokeWidth={1.75} />Sign History</span>
        <span className="text-[12px] font-semibold tracking-wide">{HIST.length}</span>
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        {rows.map((e) => {
          const Icon = e.kind === 'sent' ? Coins : ScrollText;
          return (
            <button key={e.idx} onClick={() => setSel(e)} className={`flex-1 flex items-center gap-3.5 px-5 border-t border-black text-left ${PRESS}`}>
              <Icon className="w-6 h-6 flex-shrink-0" strokeWidth={1.75} />
              <div className="flex-1 min-w-0">
                <div className="text-[16px] font-semibold leading-tight truncate">{e.title}</div>
                <div className="text-[12px] truncate">#{e.idx} · {e.date} · {e.time} · {e.type}</div>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-[10px] font-semibold tracking-wide">{e.ok ? 'SIGNED' : 'REJECTED'}</span>
                <ChevronRight className="w-[18px] h-[18px]" strokeWidth={1.75} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── SEED — KeyRound accent + engine ── */
function Seed() {
  const s = useSeedEntry(SEED.count);
  if (s.done) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 text-black gap-4">
        <KeyRound className="w-14 h-14" strokeWidth={1.5} />
        <div className="text-[22px] font-semibold tracking-tight">Recovery phrase complete</div>
        <div className="text-[13px]">All {SEED.count} words entered</div>
        <button onClick={s.reset} className={`px-7 h-11 border border-black text-[14px] font-semibold ${PRESS}`}>Restart</button>
      </div>
    );
  }
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      <div className="h-[44px] px-5 flex items-center justify-between border-b border-black flex-shrink-0">
        <span className="inline-flex items-center gap-2 text-[15px] font-semibold tracking-tight"><KeyRound className="w-5 h-5" strokeWidth={1.75} />Recovery</span>
        <span className="text-[12px] font-semibold tracking-wide tabular-nums">WORD {String(s.words.length + 1).padStart(2, '0')} / {s.count}</span>
      </div>
      {/* entered ledger (bounded) */}
      <div className="px-5 py-2 h-[44px] border-b border-black flex-shrink-0 overflow-hidden">
        {s.words.length === 0
          ? <span className="text-[12px] tracking-wide">Enter your {s.count}-word recovery phrase.</span>
          : <div className="flex flex-wrap gap-x-3 gap-y-0.5">{s.words.map((w, i) => <span key={i} className="text-[12px]"><span className="font-semibold tabular-nums">{String(i + 1).padStart(2, '0')}</span> {w}</span>)}</div>}
      </div>
      {/* input */}
      <div className="px-5 py-2 flex-shrink-0">
        <div className="h-11 border border-black flex items-center px-3">
          <span className="text-xl font-semibold tracking-wide" style={MONO}>{s.prefix}</span>
          <span className="w-0.5 h-6 bg-black ml-1" />
        </div>
      </div>
      {/* suggestions */}
      <div className="flex-1 min-h-0 flex flex-col border-t border-black">
        {s.suggestions.length > 0 ? s.suggestions.map((w) => (
          <button key={w} onClick={() => s.commit(w)} className={`flex-1 w-full flex items-center gap-3 px-5 border-b border-black last:border-b-0 text-left ${PRESS}`}>
            <ChevronRight className="w-5 h-5 flex-shrink-0" strokeWidth={1.75} /><span className="text-2xl font-semibold lowercase">{w}</span>
          </button>
        )) : <div className="flex-1 flex items-center px-5 text-[12px] tracking-wide">{s.prefix ? 'No matching word' : 'Type to search BIP39'}</div>}
      </div>
      {/* keyboard */}
      <div className="px-1.5 pb-2 pt-1.5 flex flex-col gap-1.5 flex-shrink-0 border-t border-black">
        {KEY_ROWS.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1">
            {row.split('').map((k) => {
              const enabled = s.validNext.has(k);
              return (
                <button key={k} disabled={!enabled} onClick={() => s.type(k)} className={`h-11 flex-1 max-w-[34px] border border-black text-base font-semibold uppercase ${enabled ? PRESS : ''}`}>
                  <span className={enabled ? '' : 'invisible'}>{k}</span>
                </button>
              );
            })}
          </div>
        ))}
        <div className="flex justify-center gap-1">
          {s.words.length > 0 && <button onClick={s.backWord} className={`h-11 px-4 border border-black text-[12px] font-semibold uppercase tracking-wide ${PRESS}`}>Back word</button>}
          <button onClick={s.backspace} disabled={!s.prefix} className={`h-11 px-5 border border-black flex items-center justify-center ${s.prefix ? PRESS : ''}`} aria-label="Backspace">
            <Delete className={`w-6 h-6 ${s.prefix ? '' : 'invisible'}`} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── VERIFY — ShieldCheck accent + engine ── */
function Verify() {
  const v = useVerifyFlow();
  const rp = useReviewPage(v.idx, v.count);

  if (v.step === 'select-length') {
    return (
      <div className="flex-1 flex flex-col min-h-0 text-black">
        <div className="h-[46px] px-5 flex items-center gap-2 border-b border-black flex-shrink-0">
          <ShieldCheck className="w-5 h-5" strokeWidth={1.75} /><span className="text-[15px] font-semibold tracking-tight">Verify Recovery</span>
        </div>
        <div className="px-5 pt-4 pb-3 flex-shrink-0">
          <div className="text-[20px] font-semibold leading-tight">Confirm your recovery phrase</div>
          <div className="text-[12px] tracking-wide mt-1.5">Re-enter every word to prove your backup is correct.</div>
        </div>
        <div className="flex-1 flex flex-col min-h-0 border-t border-black">
          {([12, 24] as const).map((n) => (
            <button key={n} onClick={() => v.pickLength(n)} className={`flex-1 flex items-center gap-4 px-5 border-b border-black last:border-b-0 text-left ${PRESS}`}>
              <span className="text-[44px] font-semibold tabular-nums leading-none w-[66px] flex-shrink-0">{n}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[18px] font-semibold leading-tight">words</div>
                <div className="text-[12px] tracking-wide mt-0.5">{n === 12 ? 'Standard phrase' : 'Extended phrase'}</div>
              </div>
              <ChevronRight className="w-6 h-6 flex-shrink-0" strokeWidth={1.75} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (v.step === 'result') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 text-black gap-4">
        {v.ok ? <ShieldCheck className="w-16 h-16" strokeWidth={1.5} /> : <X className="w-16 h-16" strokeWidth={1.5} />}
        <div className="text-[24px] font-semibold tracking-tight">{v.ok ? 'Verified' : 'No Match'}</div>
        <div className="text-[12px] tracking-wide max-w-[260px]">{v.ok ? 'Your recovery phrase is correct — this backup is valid.' : 'That phrase does not match this wallet. Check your backup and try again.'}</div>
        {v.ok ? <div className="text-[11px] tracking-[0.2em] uppercase">Returning…</div>
              : <button onClick={v.reset} className={`px-7 h-11 border border-black text-[14px] font-semibold ${PRESS}`}>Try Again</button>}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      <div className="h-[46px] px-5 flex items-center justify-between border-b border-black flex-shrink-0">
        <span className="inline-flex items-center gap-2 text-[14px] font-semibold tracking-tight"><ShieldCheck className="w-5 h-5" strokeWidth={1.75} />{v.editing ? 'Edit' : 'Word'} {String(v.idx + 1).padStart(2, '0')} / {v.count}</span>
        {rp.pages > 1 && <span className="text-[11px] font-semibold tracking-wide">{rp.page + 1}/{rp.pages}</span>}
      </div>
      {/* review grid */}
      <div className="px-3 pt-2 pb-1.5 flex-shrink-0">
        <div className="grid grid-cols-2 gap-1.5" style={{ height: '112px', gridTemplateRows: 'repeat(3, minmax(0,1fr))' }}>
          {rp.slots.map((i) => {
            const filled = i < v.words.length;
            const active = i === v.idx;
            return (
              <button key={i} onClick={() => v.goToWord(i)} disabled={i > v.words.length} className={`flex items-center gap-2 px-2.5 border border-black text-left overflow-hidden ${active ? 'bg-black text-[#838383]' : ''} ${i <= v.words.length ? PRESS : ''}`}>
                <span className="text-[11px] font-semibold tabular-nums flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-[15px] font-semibold lowercase truncate">{filled ? v.words[i] : ''}</span>
              </button>
            );
          })}
        </div>
      </div>
      {/* input */}
      <div className="px-5 pb-1.5 flex-shrink-0">
        <div className="h-10 border border-black flex items-center px-3">
          <span className="text-lg font-semibold tracking-wide" style={MONO}>{v.prefix}</span>
          <span className="w-0.5 h-5 bg-black ml-1" />
        </div>
      </div>
      <div className="flex-1 min-h-0" />
      {/* suggestions */}
      <div className="h-[50px] flex items-stretch gap-1.5 px-3 flex-shrink-0">
        {v.suggestions.length > 0 ? v.suggestions.map((w) => (
          <button key={w} onClick={() => v.commit(w)} className={`flex-1 min-w-0 border border-black flex items-center justify-center px-1 ${PRESS}`}>
            <span className="text-[16px] font-semibold lowercase truncate">{w}</span>
          </button>
        )) : <div className="flex-1 flex items-center justify-center text-[12px] tracking-wide">{v.prefix ? 'No matching word' : 'Type the word'}</div>}
      </div>
      {/* keyboard */}
      <div className="px-1.5 pb-2 pt-2 mt-1.5 flex flex-col gap-1.5 flex-shrink-0 border-t border-black">
        {KEY_ROWS.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1">
            {row.split('').map((k) => {
              const enabled = v.validNext.has(k);
              return (
                <button key={k} disabled={!enabled} onClick={() => v.type(k)} className={`h-10 flex-1 max-w-[34px] border border-black text-base font-semibold uppercase ${enabled ? PRESS : ''}`}>
                  <span className={enabled ? '' : 'invisible'}>{k}</span>
                </button>
              );
            })}
          </div>
        ))}
        <div className="flex justify-center">
          <button onClick={v.backspace} disabled={!v.prefix} className={`h-10 px-6 border border-black flex items-center justify-center ${v.prefix ? PRESS : ''}`} aria-label="Backspace">
            <Delete className={`w-5 h-5 ${v.prefix ? '' : 'invisible'}`} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );
}
