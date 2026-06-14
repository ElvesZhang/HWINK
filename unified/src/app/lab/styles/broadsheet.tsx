import { useState } from 'react';
import { ChevronRight, ChevronLeft, Bluetooth, BatteryMedium, Check, X, Delete } from 'lucide-react';
import type { LabScreen } from '../data';
import { WALLET, HOME_ITEMS, HIST, SIGN, SEED } from '../data';
import { useSeedEntry, useVerifyFlow, useReviewPage, KEY_ROWS } from '../seedEngine';

/**
 * BROADSHEET · 头版 — composition cell: masthead-band.
 * Framing metaphor: a broadsheet newspaper front page. A bold inverted MASTHEAD
 * band dominates the top of every screen; beneath it the content is set as a
 * lead story + ruled column briefs (kicker / headline / dek). The masthead band
 * is the recurring structural element no other language commits to. Serif
 * headlines, sans kickers & deks, mono machine values; 2-tone only.
 */
const PRESS = 'active:bg-black active:text-[#838383]';
const MONO = { fontFamily: 'ui-monospace, monospace' } as const;

function Placeholder() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8 text-black font-serif">
      <div className="text-[15px] font-bold tracking-[0.2em] uppercase">Home · Sign · History</div>
      <div className="text-[14px] mt-2">本次探索仅含 首页 / 签名 / 列表</div>
    </div>
  );
}

/** Inverted masthead band — title left, edition meta right. */
function Masthead({ title, meta }: { title: string; meta: React.ReactNode }) {
  return (
    <div className="bg-black text-[#838383] px-4 pt-2.5 pb-2 flex-shrink-0">
      <div className="flex items-baseline justify-between">
        <span className="font-serif text-[26px] font-black leading-none tracking-tight">{title}</span>
        <span className="font-sans text-[10px] font-bold uppercase tracking-[0.18em]">{meta}</span>
      </div>
      <div className="h-[2px] bg-[#838383] mt-1.5" />
    </div>
  );
}

export function BroadsheetStyle({ screen }: { screen: LabScreen }) {
  if (screen === 'home') return <Home />;
  if (screen === 'sign') return <Sign />;
  if (screen === 'history') return <History />;
  if (screen === 'seed') return <Seed />;
  if (screen === 'verify') return <Verify />;
  return <Placeholder />;
}

function Home() {
  const [lead, ...briefs] = HOME_ITEMS;
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      <Masthead title="THE LEDGER" meta={<span className="inline-flex items-center gap-2"><span className="inline-flex items-center gap-1"><BatteryMedium className="w-3.5 h-3.5" strokeWidth={2.5} />{WALLET.battery}%</span><Bluetooth className="w-3.5 h-3.5" strokeWidth={2.5} /></span>} />
      {/* sub-banner: wallet identity as the dateline */}
      <div className="px-4 py-1.5 border-b-2 border-black flex items-baseline justify-between flex-shrink-0">
        <span className="font-serif text-[15px] font-black">{WALLET.name}</span>
        <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em]">NET {WALLET.networks} · TOK {WALLET.tokens}</span>
      </div>
      {/* lead story */}
      <button className={`flex-[1.3] flex flex-col justify-center px-4 border-b-2 border-black text-left ${PRESS}`}>
        <div className="font-sans text-[10px] font-bold uppercase tracking-[0.2em]">{lead.code}</div>
        <div className="font-serif text-[34px] font-black leading-[0.95] mt-1">{lead.label}</div>
        <div className="font-sans text-[12px] tracking-wide mt-1 flex items-center gap-1">{lead.sub}<ChevronRight className="w-4 h-4" strokeWidth={2.5} /></div>
      </button>
      {/* column briefs */}
      <div className="flex-1 flex min-h-0">
        {briefs.map((it, i) => (
          <button key={it.id} className={`flex-1 flex flex-col justify-center px-3 text-left ${i > 0 ? 'border-l border-black' : ''} ${PRESS}`}>
            <div className="font-sans text-[9px] font-bold uppercase tracking-[0.15em]">{it.code}</div>
            <div className="font-serif text-[19px] font-black leading-tight mt-0.5">{it.label}</div>
            <div className="font-sans text-[10px] leading-snug mt-0.5">{it.sub}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── SIGN DETAIL — full signature page with verify code ── */
function SignDetail({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      <Masthead title="FULL DETAILS" meta={`EDITION · ${SIGN.network}`} />
      {/* back control */}
      <div className="px-4 py-2 border-b border-black flex-shrink-0">
        <button onClick={onBack} aria-label="Back" className={`flex items-center gap-1 font-sans text-[10px] font-bold uppercase tracking-[0.18em] ${PRESS}`}>
          <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />Back
        </button>
        <div className="font-sans text-[9px] font-bold uppercase tracking-[0.15em] mt-1.5">Signature detail — verify before signing</div>
      </div>
      {/* detail rows */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex items-center gap-3 px-4 border-b border-black">
          <span className="font-sans text-[9px] font-bold uppercase tracking-[0.15em] flex-shrink-0">Amount</span>
          <span className="flex-1 text-right font-serif text-[18px] font-black truncate">{SIGN.amount} {SIGN.token}</span>
        </div>
        <div className="flex-1 flex items-center gap-3 px-4 border-b border-black">
          <span className="font-sans text-[9px] font-bold uppercase tracking-[0.15em] flex-shrink-0">Value</span>
          <span className="flex-1 text-right font-serif text-[18px] font-black truncate">{SIGN.fiat}</span>
        </div>
        <div className="flex-1 flex items-center gap-3 px-4 border-b border-black">
          <span className="font-sans text-[9px] font-bold uppercase tracking-[0.15em] flex-shrink-0">To</span>
          <span className="flex-1 text-right font-serif text-[18px] font-black truncate">{SIGN.to}</span>
        </div>
        <div className="flex-1 flex items-center gap-3 px-4 border-b border-black">
          <span className="font-sans text-[9px] font-bold uppercase tracking-[0.15em] flex-shrink-0">Address</span>
          <span className="flex-1 text-right text-[12px] font-bold break-all leading-snug" style={MONO}>{SIGN.address}</span>
        </div>
        <div className="flex-1 flex items-center gap-3 px-4 border-b border-black">
          <span className="font-sans text-[9px] font-bold uppercase tracking-[0.15em] flex-shrink-0">Network</span>
          <span className="flex-1 text-right font-serif text-[18px] font-black truncate">{SIGN.network}</span>
        </div>
        <div className="flex-1 flex items-center gap-3 px-4 border-b border-black">
          <span className="font-sans text-[9px] font-bold uppercase tracking-[0.15em] flex-shrink-0">Network Fee</span>
          <span className="flex-1 text-right font-serif text-[18px] font-black truncate">{SIGN.fee}</span>
        </div>
        {/* verify code — emphasised, inverted panel */}
        <div className="flex-1 flex flex-col justify-center px-4 bg-black">
          <div className="font-sans text-[9px] font-bold uppercase tracking-[0.15em] text-[#838383]">Verify Code</div>
          <div className="text-[32px] font-black tracking-[0.1em] leading-none mt-1 text-[#838383]" style={MONO}>{SIGN.verify}</div>
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
      <Masthead title="TRANSACTION" meta={`EDITION · ${SIGN.network}`} />
      {/* headline — amount + recipient, NO verify code */}
      <div className="px-4 py-3 border-b-2 border-black flex-shrink-0">
        <div className="font-sans text-[10px] font-bold uppercase tracking-[0.2em]">Confirm Send</div>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="font-serif text-[58px] font-black leading-[0.8] tracking-tight tabular-nums">{SIGN.amount}</span>
          <span className="font-serif text-2xl font-black">{SIGN.token}</span>
        </div>
        <div className="font-serif text-[20px] font-black mt-1.5">→ {SIGN.to} <span className="font-sans text-[12px] font-bold">({SIGN.fiat})</span></div>
      </div>
      {/* column briefs — address + fee only, NO verify code column */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex flex-col justify-center px-4 border-b border-black min-w-0">
          <div className="font-sans text-[9px] font-bold uppercase tracking-[0.15em]">Address</div>
          <div className="text-[12px] font-bold break-all leading-snug mt-1" style={MONO}>{SIGN.address}</div>
          <div className="font-sans text-[9px] font-bold uppercase tracking-[0.15em] mt-3">Network Fee</div>
          <div className="font-serif text-[18px] font-black mt-0.5">{SIGN.fee}</div>
        </div>
        {/* full-details affordance — leads to verify code */}
        <button onClick={() => setDetail(true)} className={`flex-1 flex items-center gap-3 px-4 border-b border-black text-left ${PRESS}`}>
          <div className="flex-1 min-w-0">
            <div className="font-sans text-[9px] font-bold uppercase tracking-[0.15em]">Signature Detail</div>
            <div className="font-serif text-[18px] font-black leading-tight mt-0.5">Full details &amp; verify code</div>
          </div>
          <ChevronRight className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
        </button>
      </div>
      <div className="flex border-t-2 border-black flex-shrink-0">
        <button className={`w-[76px] h-16 border-r-2 border-black flex items-center justify-center ${PRESS}`} aria-label="Reject">
          <X className="w-7 h-7" strokeWidth={2.5} />
        </button>
        <button className="flex-1 h-16 bg-black text-[#838383] flex items-center justify-center gap-2.5 active:bg-[#838383] active:text-black">
          <Check className="w-6 h-6" strokeWidth={2.75} />
          <span className="font-serif text-[20px] font-black">Go to Press</span>
        </button>
      </div>
    </div>
  );
}

function HistoryDetail({ e, onBack }: { e: typeof HIST[number]; onBack: () => void }) {
  const monoKeys = /address|hash|tx/i;
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      <Masthead title="SIGNATURE" meta={e.ok ? 'SIGNED' : 'REJECTED'} />
      {/* back control + headline + dateline */}
      <div className="px-4 py-2 border-b-2 border-black flex-shrink-0">
        <button onClick={onBack} aria-label="Back" className={`flex items-center gap-1 font-sans text-[10px] font-bold uppercase tracking-[0.18em] mb-1.5 ${PRESS}`}>
          <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />Back
        </button>
        <div className="font-sans text-[9px] font-bold uppercase tracking-[0.18em]">{e.date} · {e.time} · {e.type}</div>
        <div className="font-serif text-[26px] font-black leading-tight">{e.title}</div>
        <div className="font-sans text-[11px]">{e.sub}</div>
      </div>
      {/* column briefs — detail [k, v] rows */}
      <div className="flex-1 flex flex-col min-h-0">
        {e.detail.map(([k, v]) => (
          <div key={k} className="flex-1 flex items-center gap-3 px-4 border-b border-black last:border-b-0">
            <span className="font-sans text-[9px] font-bold uppercase tracking-[0.15em] flex-shrink-0">{k}</span>
            <span className="flex-1 text-right text-[13px] font-bold truncate" style={monoKeys.test(k) ? MONO : undefined}>{v}</span>
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
      <Masthead title="SIGN HISTORY" meta={`${HIST.length} REPORTS`} />
      <div className="flex-1 flex flex-col min-h-0">
        {rows.map((e) => (
          <button key={e.idx} onClick={() => setSel(e)} className={`flex-1 flex items-center gap-3 px-4 border-b border-black text-left ${PRESS}`}>
            <span className="font-serif text-[36px] font-black leading-none tabular-nums w-[48px] flex-shrink-0">{e.idx}</span>
            <div className="flex-1 min-w-0">
              <div className="font-sans text-[9px] font-bold uppercase tracking-[0.18em]">{e.date} · {e.time} · {e.type}</div>
              <div className="font-serif text-[20px] font-black leading-tight truncate">{e.title}</div>
              <div className="font-sans text-[11px] truncate">{e.sub}</div>
            </div>
            <span className="font-sans text-[10px] font-bold tracking-wide flex-shrink-0">{e.ok ? 'SIGNED' : 'REJECTED'}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── SEED ── masthead "RECOVERY" + entered-words ledger + input + suggestions + keyboard ── */
function Seed() {
  const s = useSeedEntry(SEED.count);

  if (s.done) {
    return (
      <div className="flex-1 flex flex-col min-h-0 text-black">
        <Masthead title="RECOVERY" meta={`${SEED.count} WORDS`} />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <div className="w-[72px] h-[72px] bg-black flex items-center justify-center flex-shrink-0">
            <Check className="w-10 h-10 text-[#838383]" strokeWidth={2.75} />
          </div>
          <div className="font-serif text-[28px] font-black leading-tight mt-4">Phrase Complete</div>
          <div className="font-sans text-[12px] font-bold uppercase tracking-[0.2em] mt-2">All {SEED.count} words entered</div>
          <button onClick={s.reset} className={`mt-6 px-7 h-11 border-2 border-black font-sans text-[12px] font-bold uppercase tracking-[0.18em] ${PRESS}`}>
            Restart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      <Masthead title="RECOVERY" meta={`WORD ${String(s.words.length + 1).padStart(2, '0')} / ${SEED.count}`} />

      {/* entered-words ledger — bounded column (no scroll) */}
      <div className="px-4 py-2 h-[44px] border-b border-black flex-shrink-0 overflow-hidden">
        {s.words.length === 0
          ? <span className="font-sans text-[11px] tracking-wide">Enter your {SEED.count}-word recovery phrase.</span>
          : <div className="flex flex-wrap gap-x-3 gap-y-0.5">
              {s.words.map((w, i) => (
                <span key={i} className="font-sans text-[11px]">
                  <span className="font-bold tabular-nums">{String(i + 1).padStart(2, '0')}</span> {w}
                </span>
              ))}
            </div>
        }
      </div>

      {/* input field — prefix + cursor */}
      <div className="px-4 py-2 flex-shrink-0">
        <div className="h-10 border-2 border-black flex items-center px-3 gap-0.5">
          <span className="font-serif text-[20px] font-black tracking-wide" style={MONO}>{s.prefix}</span>
          <span className="w-0.5 h-6 bg-black" />
        </div>
      </div>

      {/* suggestions — up to 3, each a tappable lead headline */}
      <div className="flex-1 min-h-0 flex flex-col border-t border-black">
        {s.suggestions.length > 0
          ? s.suggestions.map((w) => (
              <button key={w} onClick={() => s.commit(w)} className={`flex-1 w-full flex items-center gap-3 px-4 border-b border-black last:border-b-0 text-left ${PRESS}`}>
                <ChevronRight className="w-4 h-4 flex-shrink-0" strokeWidth={2.75} />
                <span className="font-serif text-[22px] font-black lowercase">{w}</span>
              </button>
            ))
          : <div className="flex-1 flex items-center px-4 font-sans text-[11px] tracking-wide">
              {s.prefix ? 'No matching word' : 'Type to search BIP39'}
            </div>
        }
      </div>

      {/* keyboard — disabled keys keep box, content wrapped invisible */}
      <div className="px-1.5 pb-2 pt-1.5 flex flex-col gap-1.5 flex-shrink-0 border-t-2 border-black">
        {KEY_ROWS.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1">
            {row.split('').map((k) => {
              const enabled = s.validNext.has(k);
              return (
                <button key={k} disabled={!enabled} onClick={() => s.type(k)}
                  className={`font-sans h-10 flex-1 max-w-[34px] border-2 border-black text-[13px] font-bold uppercase ${enabled ? PRESS : ''}`}>
                  <span className={enabled ? '' : 'invisible'}>{k}</span>
                </button>
              );
            })}
          </div>
        ))}
        <div className="flex justify-center gap-1">
          {s.words.length > 0 && (
            <button onClick={s.backWord} className={`font-sans h-10 px-4 border-2 border-black text-[11px] font-bold uppercase tracking-wide ${PRESS}`}>
              Back word
            </button>
          )}
          <button onClick={s.backspace} disabled={!s.prefix}
            className={`h-10 px-5 border-2 border-black flex items-center justify-center ${s.prefix ? PRESS : ''}`}
            aria-label="Backspace">
            <Delete className={`w-5 h-5 ${s.prefix ? '' : 'invisible'}`} strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── VERIFY ── masthead "VERIFY"; length-picker as two leads; review grid; result ── */
function Verify() {
  const v = useVerifyFlow();
  const rp = useReviewPage(v.idx, v.count);

  /* select-length — two lead choices (12 / 24 words) */
  if (v.step === 'select-length') {
    return (
      <div className="flex-1 flex flex-col min-h-0 text-black">
        <Masthead title="VERIFY" meta="RECOVERY PHRASE" />
        <div className="px-4 py-3 border-b border-black flex-shrink-0">
          <div className="font-sans text-[9px] font-bold uppercase tracking-[0.2em]">Confirm your recovery phrase</div>
          <div className="font-serif text-[22px] font-black leading-tight mt-0.5">Re-enter every word to prove your backup is correct.</div>
        </div>
        <div className="flex-1 flex flex-col min-h-0 border-t border-black">
          {([12, 24] as const).map((n) => (
            <button key={n} onClick={() => v.pickLength(n)} className={`flex-1 flex items-center gap-4 px-4 border-b border-black last:border-b-0 text-left ${PRESS}`}>
              <span className="font-serif text-[52px] font-black leading-none tabular-nums w-[76px] flex-shrink-0">{n}</span>
              <div className="flex-1 min-w-0">
                <div className="font-serif text-[20px] font-black leading-tight">words</div>
                <div className="font-sans text-[11px] mt-0.5">{n === 12 ? 'Standard phrase' : 'Extended phrase'}</div>
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
        <Masthead title="VERIFY" meta={v.ok ? 'VERIFIED' : 'NO MATCH'} />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <div className={`w-[72px] h-[72px] flex items-center justify-center flex-shrink-0 border-2 border-black ${v.ok ? 'bg-black' : ''}`}>
            {v.ok
              ? <Check className="w-10 h-10 text-[#838383]" strokeWidth={2.75} />
              : <X className="w-10 h-10 text-black" strokeWidth={2.75} />
            }
          </div>
          <div className="font-serif text-[30px] font-black leading-tight mt-4">{v.ok ? 'Verified' : 'No Match'}</div>
          <div className="font-sans text-[12px] tracking-wide mt-2 max-w-[260px]">
            {v.ok
              ? 'Your recovery phrase is correct — this backup is valid.'
              : 'That phrase does not match this wallet. Check your backup and try again.'
            }
          </div>
          {v.ok
            ? <div className="font-sans text-[11px] tracking-[0.2em] uppercase mt-5">Returning…</div>
            : <button onClick={v.reset} className={`mt-6 px-7 h-11 border-2 border-black font-sans text-[12px] font-bold uppercase tracking-[0.18em] ${PRESS}`}>Try Again</button>
          }
        </div>
      </div>
    );
  }

  /* input step */
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      <Masthead title="VERIFY" meta={`WORD ${String(v.idx + 1).padStart(2, '0')} / ${v.count}`} />

      {/* word progress line + optional page indicator */}
      <div className="px-4 py-1.5 border-b border-black flex items-baseline justify-between flex-shrink-0">
        <span className="font-sans text-[10px] font-bold uppercase tracking-[0.18em]">
          {v.editing ? 'Edit word' : 'Word'} <span className="font-serif text-[16px] font-black">{String(v.idx + 1).padStart(2, '0')}</span> / {v.count}
        </span>
        {rp.pages > 1 && (
          <span className="font-sans text-[10px] font-bold tracking-[0.15em]">{rp.page + 1}/{rp.pages}</span>
        )}
      </div>

      {/* review grid — 2 columns, tappable; active cell inverted */}
      <div className="px-3 pt-2 pb-1.5 flex-shrink-0">
        <div className="grid grid-cols-2 gap-1" style={{ height: '108px', gridTemplateRows: 'repeat(3, minmax(0,1fr))' }}>
          {rp.slots.map((i) => {
            const filled = i < v.words.length;
            const active = i === v.idx;
            return (
              <button key={i} onClick={() => v.goToWord(i)} disabled={i > v.words.length}
                className={`flex items-center gap-2 px-2.5 border-2 border-black text-left overflow-hidden ${active ? 'bg-black text-[#838383]' : ''} ${i <= v.words.length ? PRESS : ''}`}>
                <span className="font-sans text-[10px] font-bold tabular-nums flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <span className="font-serif text-[14px] font-black lowercase truncate">{filled ? v.words[i] : ''}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* input field */}
      <div className="px-4 pb-1.5 flex-shrink-0">
        <div className="h-10 border-2 border-black flex items-center px-3 gap-0.5">
          <span className="font-serif text-[18px] font-black tracking-wide" style={MONO}>{v.prefix}</span>
          <span className="w-0.5 h-5 bg-black" />
        </div>
      </div>

      {/* suggestion bar — up to 3 across */}
      <div className="h-[46px] flex items-stretch gap-1.5 px-3 flex-shrink-0">
        {v.suggestions.length > 0
          ? v.suggestions.map((w) => (
              <button key={w} onClick={() => v.commit(w)} className={`flex-1 min-w-0 border-2 border-black flex items-center justify-center px-1 ${PRESS}`}>
                <span className="font-serif text-[15px] font-black lowercase truncate">{w}</span>
              </button>
            ))
          : <div className="flex-1 flex items-center justify-center font-sans text-[11px] tracking-wide">
              {v.prefix ? 'No matching word' : 'Type the word'}
            </div>
        }
      </div>

      {/* keyboard */}
      <div className="px-1.5 pb-2 pt-1.5 flex flex-col gap-1.5 flex-shrink-0 border-t-2 border-black">
        {KEY_ROWS.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1">
            {row.split('').map((k) => {
              const enabled = v.validNext.has(k);
              return (
                <button key={k} disabled={!enabled} onClick={() => v.type(k)}
                  className={`font-sans h-10 flex-1 max-w-[34px] border-2 border-black text-[13px] font-bold uppercase ${enabled ? PRESS : ''}`}>
                  <span className={enabled ? '' : 'invisible'}>{k}</span>
                </button>
              );
            })}
          </div>
        ))}
        <div className="flex justify-center">
          <button onClick={v.backspace} disabled={!v.prefix}
            className={`h-10 px-6 border-2 border-black flex items-center justify-center ${v.prefix ? PRESS : ''}`}
            aria-label="Backspace">
            <Delete className={`w-5 h-5 ${v.prefix ? '' : 'invisible'}`} strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </div>
  );
}
