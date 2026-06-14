import { useState } from 'react';
import { ChevronRight, ChevronLeft, Bluetooth, BatteryMedium, Check, X, Delete } from 'lucide-react';
import type { LabScreen } from '../data';
import { WALLET, HOME_ITEMS, HIST, SIGN, SEED } from '../data';
import { useSeedEntry, useVerifyFlow, useReviewPage, KEY_ROWS } from '../seedEngine';

/**
 * DIAL · 转盘 — composition cell: radial.
 * Framing metaphor: a combination-lock dial / instrument face. The primary
 * value lives at the CENTER of a concentric dial; everything else orbits it at
 * compass points or along the rim. No other language arranges information
 * radially — this is the deliberate counterpoint to the stacked/ruled layouts.
 * 2-tone only; sans labels, mono machine values. Hard strokes (1-bit safe).
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

/** Concentric dial face: two rings + 24 rim ticks (every 6th longer). */
function DialFace({ className = '' }: { className?: string }) {
  const ticks = Array.from({ length: 24 }, (_, i) => {
    const a = (i * Math.PI) / 12;
    const long = i % 6 === 0;
    const r1 = long ? 40 : 43;
    const x1 = 50 + Math.cos(a) * r1, y1 = 50 + Math.sin(a) * r1;
    const x2 = 50 + Math.cos(a) * 46, y2 = 50 + Math.sin(a) * 46;
    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={long ? 1.4 : 0.8} />;
  });
  return (
    <svg viewBox="0 0 100 100" className={`absolute inset-0 w-full h-full ${className}`} fill="none" stroke="currentColor" aria-hidden="true">
      <circle cx="50" cy="50" r="46.5" strokeWidth={1} />
      <circle cx="50" cy="50" r="32" strokeWidth={1.6} />
      {ticks}
    </svg>
  );
}

export function DialStyle({ screen }: { screen: LabScreen }) {
  if (screen === 'home') return <Home />;
  if (screen === 'sign') return <Sign />;
  if (screen === 'history') return <History />;
  if (screen === 'seed') return <Seed />;
  if (screen === 'verify') return <Verify />;
  return <Placeholder />;
}

function Home() {
  // compass positions for the 4 entries
  const pos = [
    'top-1 left-1/2 -translate-x-1/2 text-center',
    'right-1 top-1/2 -translate-y-1/2 text-right',
    'bottom-1 left-1/2 -translate-x-1/2 text-center',
    'left-1 top-1/2 -translate-y-1/2 text-left',
  ];
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      <div className="h-[44px] px-4 flex items-center justify-between border-b border-black flex-shrink-0">
        <span className="text-[12px] font-bold uppercase tracking-[0.2em] inline-flex items-center gap-1.5"><BatteryMedium className="w-4 h-4" strokeWidth={2.5} />{WALLET.battery}%</span>
        <span className="text-[12px] font-bold uppercase tracking-[0.2em] inline-flex items-center gap-3"><Bluetooth className="w-4 h-4" strokeWidth={2.5} /><span>NET {WALLET.networks} · TOK {WALLET.tokens}</span></span>
      </div>
      <div className="flex-1 flex items-center justify-center min-h-0">
        <div className="relative w-[300px] h-[300px]">
          <DialFace />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="text-[30px] font-black leading-none tracking-tight">{WALLET.name}</div>
            <div className="text-[9px] font-bold uppercase tracking-[0.24em] mt-1.5">{WALLET.model}</div>
          </div>
          {HOME_ITEMS.map((it, i) => (
            <button key={it.id} className={`absolute ${pos[i]} max-w-[92px] px-1 ${PRESS}`}>
              <div className="text-[17px] font-black leading-none">{it.label}</div>
              <div className="text-[9px] font-bold uppercase tracking-wide mt-0.5">{it.code}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SignDetail({ onBack }: { onBack: () => void }) {
  const MONO = { fontFamily: 'ui-monospace, monospace' } as const;
  const rows: { k: string; v: string; mono?: boolean; emph?: boolean }[] = [
    { k: 'Amount', v: `${SIGN.amount} ${SIGN.token}` },
    { k: 'Value', v: SIGN.fiat },
    { k: 'To', v: SIGN.to },
    { k: 'Address', v: SIGN.address, mono: true },
    { k: 'Network', v: SIGN.network },
    { k: 'Network fee', v: SIGN.fee },
    { k: 'Verify code', v: SIGN.verify, mono: true, emph: true },
  ];
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      <div className="h-[44px] px-3 flex items-center gap-2 border-b-2 border-black flex-shrink-0">
        <button onClick={onBack} aria-label="Back" className={`flex items-center px-1 -mx-1 ${PRESS}`}>
          <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
        </button>
        <span className="text-[13px] font-black uppercase tracking-[0.2em]">Signature details</span>
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        {rows.map(({ k, v, mono, emph }) => (
          <div key={k} className="flex-1 flex items-center justify-between gap-3 px-5 border-b border-black last:border-b-0 min-h-0">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] flex-shrink-0">{k}</span>
            <span
              className={`${emph ? 'text-[20px]' : 'text-[14px]'} font-black text-right truncate`}
              style={mono ? MONO : undefined}
            >{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Sign() {
  const [detail, setDetail] = useState(false);
  if (detail) return <SignDetail onBack={() => setDetail(false)} />;

  const orbitPos = [
    'top-0 left-1/2 -translate-x-1/2 text-center',
    'right-0 top-1/2 -translate-y-1/2 text-right',
    'bottom-0 left-1/2 -translate-x-1/2 text-center',
  ];
  const orbit = [
    { k: 'To', v: SIGN.to },
    { k: 'Net', v: SIGN.network },
    { k: 'Fee', v: SIGN.fee },
  ];
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      <div className="flex-1 flex items-center justify-center min-h-0">
        <div className="relative w-[320px] h-[320px]">
          <DialFace />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-10">
            <div className="text-[10px] font-bold uppercase tracking-[0.25em]">Confirm</div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-[58px] font-black leading-[0.8] tracking-tight tabular-nums">{SIGN.amount}</span>
              <span className="text-xl font-black">{SIGN.token}</span>
            </div>
            <div className="text-[12px] mt-1">{SIGN.fiat}</div>
            <div className="text-[11px] mt-1.5" style={{ fontFamily: 'ui-monospace, monospace' }}>{SIGN.address}</div>
          </div>
          {orbit.map((o, i) => (
            <div key={o.k} className={`absolute ${orbitPos[i]} max-w-[84px] px-1`}>
              <div className="text-[9px] font-bold uppercase tracking-[0.18em] leading-none">{o.k}</div>
              <div className="text-[14px] font-black leading-tight mt-0.5">{o.v}</div>
            </div>
          ))}
          {/* left compass: full-details drill */}
          <button
            onClick={() => setDetail(true)}
            aria-label="Full details and verify code"
            className={`absolute left-0 top-1/2 -translate-y-1/2 text-left max-w-[84px] px-1 ${PRESS}`}
          >
            <div className="text-[9px] font-bold uppercase tracking-[0.18em] leading-none">Details</div>
            <div className="flex items-center gap-0.5 mt-0.5">
              <span className="text-[12px] font-black leading-tight uppercase tracking-wide">More</span>
              <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} />
            </div>
          </button>
        </div>
      </div>
      <div className="flex border-t-2 border-black flex-shrink-0">
        <button className={`w-[76px] h-16 border-r-2 border-black flex items-center justify-center ${PRESS}`} aria-label="Reject">
          <X className="w-7 h-7" strokeWidth={2.5} />
        </button>
        <button className="flex-1 h-16 bg-black text-[#838383] flex items-center justify-center gap-2.5 active:bg-[#838383] active:text-black">
          <Check className="w-6 h-6" strokeWidth={2.75} />
          <span className="text-[18px] font-black uppercase tracking-[0.15em]">Turn to Sign</span>
        </button>
      </div>
    </div>
  );
}

/* ── SEED — combination-dial entry: progress tick near centre, word ledger band,
   standard keyboard with disabled-invisible pattern, 3 suggestion buttons. ── */
function Seed() {
  const s = useSeedEntry(SEED.count);

  if (s.done) {
    return (
      <div className="flex-1 flex flex-col min-h-0 text-black items-center justify-center text-center px-8">
        {/* completion dial */}
        <div className="relative w-[110px] h-[110px]">
          <DialFace />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <Check className="w-7 h-7" strokeWidth={2.5} />
          </div>
        </div>
        <div className="text-[22px] font-black uppercase tracking-[0.12em] mt-4">All {s.count} words</div>
        <div className="text-[11px] font-bold uppercase tracking-[0.2em] mt-1">Recovery phrase entered</div>
        <button onClick={s.reset} className={`mt-6 h-11 px-8 border-2 border-black text-[12px] font-black uppercase tracking-[0.2em] ${PRESS}`}>Restart</button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      {/* header: title + progress reading */}
      <div className="h-[44px] px-4 flex items-center justify-between border-b-2 border-black flex-shrink-0">
        <span className="text-[13px] font-black uppercase tracking-[0.2em]">Recovery</span>
        <span className="text-[11px] font-bold uppercase tracking-[0.15em] tabular-nums">
          Word <span className="text-[16px] font-black">{String(s.words.length + 1).padStart(2, '0')}</span> / {s.count}
        </span>
      </div>

      {/* entered-words ledger: numbered, bounded, no-scroll */}
      <div className="px-4 py-2 flex-shrink-0 h-[42px] overflow-hidden border-b border-black flex items-center">
        {s.words.length === 0
          ? <span className="text-[11px] font-bold uppercase tracking-[0.18em]">Enter your {s.count}-word phrase</span>
          : <div className="flex flex-wrap gap-x-3 gap-y-0.5">
              {s.words.map((w, i) => (
                <span key={i} className="text-[11px] font-bold uppercase tracking-wide tabular-nums">
                  {String(i + 1).padStart(2, '0')} {w}
                </span>
              ))}
            </div>
        }
      </div>

      {/* input field: prefix + cursor */}
      <div className="px-4 py-2 flex-shrink-0 border-b border-black">
        <div className="h-10 border-2 border-black flex items-center px-3 gap-1">
          <span className="text-[18px] font-black tracking-wide" style={{ fontFamily: 'ui-monospace, monospace' }}>{s.prefix}</span>
          <span className="w-[2px] h-5 bg-black" />
        </div>
      </div>

      {/* suggestions: 3 dial-reading buttons */}
      <div className="flex gap-1.5 px-3 pt-2 pb-1 flex-shrink-0" style={{ height: '52px' }}>
        {s.suggestions.length > 0 ? s.suggestions.map((w) => (
          <button key={w} onClick={() => s.commit(w)} className={`flex-1 min-w-0 border-2 border-black flex items-center justify-center px-1 ${PRESS}`}>
            <span className="text-[15px] font-black lowercase truncate">{w}</span>
          </button>
        )) : (
          <div className="flex-1 flex items-center justify-center text-[11px] font-bold uppercase tracking-[0.15em]">
            {s.prefix ? 'No match' : 'Type to search'}
          </div>
        )}
      </div>

      {/* keyboard: disabled keys keep box with invisible content */}
      <div className="px-1.5 pb-2 pt-1 flex flex-col gap-1 flex-shrink-0 border-t-2 border-black">
        {KEY_ROWS.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1">
            {row.split('').map((k) => {
              const enabled = s.validNext.has(k);
              return (
                <button key={k} disabled={!enabled} onClick={() => s.type(k)}
                  className={`h-10 flex-1 max-w-[34px] border-2 border-black text-[13px] font-black uppercase ${enabled ? PRESS : ''}`}>
                  <span className={enabled ? '' : 'invisible'}>{k}</span>
                </button>
              );
            })}
          </div>
        ))}
        {/* bottom row: back-word + backspace */}
        <div className="flex justify-center gap-1.5 mt-0.5">
          {s.words.length > 0 && (
            <button onClick={s.backWord} className={`h-10 px-4 border-2 border-black text-[11px] font-black uppercase tracking-[0.12em] ${PRESS}`}>
              Back word
            </button>
          )}
          <button onClick={s.backspace} disabled={!s.prefix} aria-label="Backspace"
            className={`h-10 px-5 border-2 border-black flex items-center justify-center ${s.prefix ? PRESS : ''}`}>
            <Delete className={`w-5 h-5 ${s.prefix ? '' : 'invisible'}`} strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── VERIFY — combination-dial verify flow:
   select-length = two dial readings; input = review grid + keyboard; result = dial. ── */
function Verify() {
  const v = useVerifyFlow();
  const rp = useReviewPage(v.idx, v.count);

  if (v.step === 'select-length') {
    return (
      <div className="flex-1 flex flex-col min-h-0 text-black">
        <div className="h-[44px] px-4 flex items-center border-b-2 border-black flex-shrink-0">
          <span className="text-[13px] font-black uppercase tracking-[0.2em]">Verify Recovery</span>
        </div>
        {/* two dial-reading length choices */}
        <div className="flex-1 flex flex-col min-h-0">
          {([12, 24] as const).map((n) => (
            <button key={n} onClick={() => v.pickLength(n)}
              className={`flex-1 flex items-center gap-5 px-5 border-b border-black last:border-b-0 text-left ${PRESS}`}>
              <div className="relative w-[72px] h-[72px] flex-shrink-0">
                <DialFace />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[22px] font-black leading-none tabular-nums">{n}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[20px] font-black leading-tight">words</div>
                <div className="text-[11px] font-bold uppercase tracking-[0.15em] mt-0.5">
                  {n === 12 ? 'Standard phrase' : 'Extended phrase'}
                </div>
              </div>
              <ChevronRight className="w-6 h-6 flex-shrink-0" strokeWidth={2.5} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (v.step === 'result') {
    return (
      <div className="flex-1 flex flex-col min-h-0 text-black">
        <div className="h-[44px] px-4 flex items-center border-b-2 border-black flex-shrink-0">
          <span className="text-[13px] font-black uppercase tracking-[0.2em]">Verify Recovery</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <div className="relative w-[110px] h-[110px]">
            <DialFace />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              {v.ok
                ? <Check className="w-7 h-7" strokeWidth={2.5} />
                : <X className="w-7 h-7" strokeWidth={2.5} />}
            </div>
          </div>
          <div className="text-[22px] font-black uppercase tracking-[0.12em] mt-4">{v.ok ? 'Verified' : 'No Match'}</div>
          <div className="text-[11px] font-bold uppercase tracking-[0.15em] mt-1 max-w-[240px]">
            {v.ok ? 'Phrase correct — backup valid' : 'Phrase does not match wallet'}
          </div>
          {v.ok
            ? <div className="text-[10px] font-bold uppercase tracking-[0.2em] mt-5">Returning…</div>
            : <button onClick={v.reset} className={`mt-5 h-11 px-8 border-2 border-black text-[12px] font-black uppercase tracking-[0.2em] ${PRESS}`}>Try Again</button>
          }
        </div>
      </div>
    );
  }

  // INPUT step
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      {/* header */}
      <div className="h-[44px] px-3 flex items-center gap-2 border-b-2 border-black flex-shrink-0">
        <button onClick={() => v.reset()} aria-label="Back" className={`flex items-center px-1 -mx-1 ${PRESS}`}>
          <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
        </button>
        <span className="text-[11px] font-bold uppercase tracking-[0.15em] flex-1 tabular-nums">
          {v.editing ? 'Edit word' : 'Word'} <span className="text-[15px] font-black">{String(v.idx + 1).padStart(2, '0')}</span> / {v.count}
        </span>
        {rp.pages > 1 && (
          <span className="text-[10px] font-bold uppercase tracking-[0.12em]">{rp.page + 1}/{rp.pages}</span>
        )}
      </div>

      {/* review grid: 2-column, 3 rows, tap to edit */}
      <div className="px-3 pt-2 pb-1 flex-shrink-0">
        <div className="grid grid-cols-2 gap-1.5" style={{ height: '112px', gridTemplateRows: 'repeat(3, minmax(0,1fr))' }}>
          {rp.slots.map((i) => {
            const filled = i < v.words.length;
            const active = i === v.idx;
            return (
              <button key={i} onClick={() => v.goToWord(i)} disabled={i > v.words.length}
                className={`flex items-center gap-2 px-2 border-2 border-black text-left overflow-hidden
                  ${active ? 'bg-black text-[#838383]' : ''}
                  ${i <= v.words.length ? PRESS : ''}`}>
                <span className="text-[10px] font-bold tabular-nums flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-[13px] font-black lowercase truncate">{filled ? v.words[i] : ''}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* input field */}
      <div className="px-4 py-1 flex-shrink-0 border-t border-black">
        <div className="h-9 border-2 border-black flex items-center px-3 gap-1">
          <span className="text-[16px] font-black tracking-wide" style={{ fontFamily: 'ui-monospace, monospace' }}>{v.prefix}</span>
          <span className="w-[2px] h-5 bg-black" />
        </div>
      </div>

      {/* suggestions */}
      <div className="flex gap-1.5 px-3 pt-1 pb-1 flex-shrink-0" style={{ height: '48px' }}>
        {v.suggestions.length > 0 ? v.suggestions.map((w) => (
          <button key={w} onClick={() => v.commit(w)} className={`flex-1 min-w-0 border-2 border-black flex items-center justify-center px-1 ${PRESS}`}>
            <span className="text-[14px] font-black lowercase truncate">{w}</span>
          </button>
        )) : (
          <div className="flex-1 flex items-center justify-center text-[10px] font-bold uppercase tracking-[0.15em]">
            {v.prefix ? 'No match' : 'Type the word'}
          </div>
        )}
      </div>

      {/* keyboard */}
      <div className="px-1.5 pb-2 pt-1 flex flex-col gap-1 flex-shrink-0 border-t-2 border-black">
        {KEY_ROWS.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1">
            {row.split('').map((k) => {
              const enabled = v.validNext.has(k);
              return (
                <button key={k} disabled={!enabled} onClick={() => v.type(k)}
                  className={`h-9 flex-1 max-w-[34px] border-2 border-black text-[12px] font-black uppercase ${enabled ? PRESS : ''}`}>
                  <span className={enabled ? '' : 'invisible'}>{k}</span>
                </button>
              );
            })}
          </div>
        ))}
        <div className="flex justify-center gap-1.5 mt-0.5">
          <button onClick={v.backspace} disabled={!v.prefix} aria-label="Backspace"
            className={`h-9 px-5 border-2 border-black flex items-center justify-center ${v.prefix ? PRESS : ''}`}>
            <Delete className={`w-5 h-5 ${v.prefix ? '' : 'invisible'}`} strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </div>
  );
}

/** Tiny rim arc accent for a history row (a dial "reading"). */
function MiniDial({ ok }: { ok: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-8 h-8 flex-shrink-0" fill="none" stroke="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" strokeWidth={1.2} />
      <path d="M12 12 L12 4" strokeWidth={1.6} />
      {ok ? <path d="M12 12 L18 14" strokeWidth={1.6} /> : <path d="M12 12 L6 16" strokeWidth={1.6} />}
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

function HistoryDetail({ e, onBack }: { e: typeof HIST[number]; onBack: () => void }) {
  const isMono = (k: string) => k === 'Address' || k.includes('hash') || k.includes('Tx');
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      {/* header: back + instrument reading */}
      <div className="h-[44px] px-3 flex items-center gap-2 border-b-2 border-black flex-shrink-0">
        <button onClick={onBack} aria-label="Back" className={`flex items-center px-1 -mx-1 ${PRESS}`}>
          <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
        </button>
        <span className="text-[13px] font-black uppercase tracking-[0.2em] flex-1">Signature</span>
        <span className="text-[10px] font-bold tracking-[0.18em]">{e.ok ? 'SIGNED' : 'REJECTED'}</span>
      </div>
      {/* central reading: dial + idx + title */}
      <div className="flex items-center gap-4 px-5 pt-3 pb-3 border-b border-black flex-shrink-0">
        <div className="relative w-[80px] h-[80px] flex-shrink-0">
          <DialFace />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            {e.ok
              ? <Check className="w-5 h-5" strokeWidth={2.5} />
              : <X className="w-5 h-5" strokeWidth={2.5} />}
            <div className="text-[11px] font-black tabular-nums mt-0.5">{e.idx}</div>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em]">{e.date} · {e.time}</div>
          <div className="text-[22px] font-black leading-tight truncate">{e.title}</div>
          <div className="text-[11px] truncate">{e.type} · {e.sub}</div>
        </div>
      </div>
      {/* detail rows */}
      <div className="flex-1 flex flex-col min-h-0">
        {e.detail.map(([k, v]) => (
          <div key={k} className="flex-1 flex items-center justify-between gap-3 px-5 border-b border-black last:border-b-0 min-h-0">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] flex-shrink-0">{k}</span>
            <span
              className="text-[14px] font-black text-right truncate"
              style={isMono(k) ? { fontFamily: 'ui-monospace, monospace' } : undefined}
            >{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function History() {
  const [sel, setSel] = useState<typeof HIST[number] | null>(null);
  if (sel) return <HistoryDetail e={sel} onBack={() => setSel(null)} />;

  const [latest, ...rest] = HIST;
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      {/* central reading = latest signature */}
      <button
        onClick={() => setSel(latest)}
        className={`flex items-center gap-4 px-5 pt-4 pb-4 border-b-2 border-black flex-shrink-0 text-left ${PRESS}`}
      >
        <div className="relative w-[92px] h-[92px] flex-shrink-0">
          <DialFace />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="text-[20px] font-black leading-none tabular-nums">{HIST.length}</div>
            <div className="text-[8px] font-bold uppercase tracking-[0.15em]">signs</div>
          </div>
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em]">Latest · {latest.date} {latest.time}</div>
          <div className="text-[24px] font-black leading-tight truncate">{latest.title}</div>
          <div className="text-[12px] truncate">{latest.type} · {latest.sub}</div>
        </div>
      </button>
      {/* rotary log of the rest */}
      <div className="flex-1 flex flex-col min-h-0">
        {rest.slice(0, 4).map((e) => (
          <button
            key={e.idx}
            onClick={() => setSel(e)}
            className={`flex-1 flex items-center gap-3 px-5 border-t border-black min-h-0 text-left ${PRESS}`}
          >
            <MiniDial ok={e.ok} />
            <div className="flex-1 min-w-0">
              <div className="text-[17px] font-black leading-tight truncate">{e.title}</div>
              <div className="text-[11px] truncate">{e.date} · {e.time} · {e.type}</div>
            </div>
            <span className="text-[10px] font-bold tracking-wide flex-shrink-0">{e.ok ? 'SIGNED' : 'REJ'}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
