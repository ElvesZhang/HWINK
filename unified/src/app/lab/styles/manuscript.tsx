import { useState } from 'react';
import { ChevronRight, ChevronLeft, Bluetooth, BatteryMedium, Check, X, Delete } from 'lucide-react';
import type { LabScreen } from '../data';
import { WALLET, HOME_ITEMS, HIST, SIGN, SEED } from '../data';
import { useSeedEntry, useVerifyFlow, useReviewPage, KEY_ROWS } from '../seedEngine';

/**
 * MANUSCRIPT · 手稿 — composition cell: margin-notes.
 * Framing metaphor: an annotated book page. The primary content sits in a
 * centered serif body column; all system metadata is demoted to a narrow
 * side margin as annotations (the way a scholar pencils notes in the gutter).
 * This is the ONLY language that pushes metadata fully into a side margin,
 * so the body breathes and the eye reads content first, notes second.
 * 2-tone only; serif body, sans margin notes, mono machine values.
 */
const PRESS = 'active:bg-black active:text-[#838383]';

function Placeholder() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8 text-black font-serif">
      <div className="text-[15px] font-bold tracking-[0.2em] uppercase">Home · Sign · History</div>
      <div className="text-[14px] mt-2">本次探索仅含 首页 / 签名 / 列表</div>
    </div>
  );
}

/** A single pencilled margin note: tiny sans label over value. */
function Note({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="font-sans">
      <div className="text-[9px] font-bold uppercase tracking-[0.18em] leading-none">{label}</div>
      <div className="text-[13px] font-bold leading-tight mt-0.5">{children}</div>
    </div>
  );
}

export function ManuscriptStyle({ screen }: { screen: LabScreen }) {
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
      {/* gutter margin — annotations only */}
      <aside className="w-[66px] border-r border-black flex flex-col justify-between px-2 py-3 flex-shrink-0">
        <Note label="Power"><span className="inline-flex items-center gap-1"><BatteryMedium className="w-3.5 h-3.5" strokeWidth={2.5} />{WALLET.battery}</span></Note>
        <Note label="Link"><Bluetooth className="w-3.5 h-3.5" strokeWidth={2.5} /></Note>
        <Note label="Nets">{WALLET.networks}</Note>
        <Note label="Tokens">{WALLET.tokens}</Note>
      </aside>
      {/* body column */}
      <main className="flex-1 flex flex-col min-h-0">
        <div className="px-5 pt-5 pb-4 text-center flex-shrink-0">
          <div className="font-serif text-[40px] font-black leading-none tracking-tight">{WALLET.name}</div>
          <div className="font-sans text-[11px] font-bold uppercase tracking-[0.28em] mt-2">{WALLET.model}</div>
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          {HOME_ITEMS.map((it, i) => (
            <button key={it.id} className={`flex-1 flex items-center gap-3 px-5 border-t border-black text-left ${PRESS}`}>
              <span className="font-serif text-[22px] font-black tabular-nums w-7 flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
              <div className="flex-1 min-w-0">
                <div className="font-serif text-[24px] font-black leading-tight">{it.label}</div>
                <div className="font-sans text-[12px] tracking-wide">{it.sub}</div>
              </div>
              <ChevronRight className="w-6 h-6 flex-shrink-0" strokeWidth={2.5} />
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

/** Full signature detail page — all fields including verify code. */
function SignDetail({ onBack }: { onBack: () => void }) {
  const MONO = { fontFamily: 'ui-monospace, monospace' } as const;
  const fields: [string, string, boolean?][] = [
    ['Amount', `${SIGN.amount} ${SIGN.token}`],
    ['Value', SIGN.fiat],
    ['To', SIGN.to],
    ['Address', SIGN.address, true],
    ['Network', SIGN.network],
    ['Network fee', SIGN.fee],
    ['Verify code', SIGN.verify, true],
  ];
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      {/* colophon header — back control + title */}
      <div className="h-[46px] px-3 flex items-center gap-2 border-b-2 border-black flex-shrink-0">
        <button onClick={onBack} aria-label="Back" className={`flex items-center px-1 -mx-1 ${PRESS}`}>
          <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
        </button>
        <span className="font-serif text-[18px] font-black tracking-tight flex-1">Signature details</span>
      </div>
      {/* field rows — left gutter key annotation, body serif value */}
      <div className="flex-1 flex flex-col min-h-0">
        {fields.map(([k, v, mono]) => (
          <div key={k} className="flex-1 flex min-h-0 border-b border-black last:border-b-0">
            <div className="w-[66px] border-r border-black flex flex-col justify-center px-2 flex-shrink-0">
              <span className="font-sans text-[9px] font-bold uppercase tracking-[0.18em] leading-tight">{k}</span>
            </div>
            <div className="flex-1 flex items-center px-4 min-w-0">
              <span
                className={`font-serif font-black leading-snug truncate ${k === 'Verify code' ? 'text-[20px]' : 'text-[14px]'}`}
                style={mono ? { ...MONO, fontWeight: 700 } : undefined}
              >{v}</span>
            </div>
          </div>
        ))}
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
        {/* left gutter — recipient & network notes */}
        <aside className="w-[66px] border-r border-black flex flex-col justify-center gap-5 px-2 flex-shrink-0">
          <Note label="To">{SIGN.to}</Note>
          <Note label="Net">{SIGN.network}</Note>
        </aside>
        {/* body — amount as centered manuscript headline */}
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4 min-h-0">
          <div className="font-sans text-[11px] font-bold uppercase tracking-[0.25em]">Confirm Send</div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-serif text-[72px] font-black leading-[0.8] tracking-tight tabular-nums">{SIGN.amount}</span>
            <span className="font-serif text-3xl font-black">{SIGN.token}</span>
          </div>
          <div className="font-serif text-[15px] mt-2">{SIGN.fiat}</div>
          <div className="text-[13px] mt-4" style={{ fontFamily: 'ui-monospace, monospace' }}>{SIGN.address}</div>
          {/* drill affordance — siblings with actions, not a wrapper button */}
          <button
            onClick={() => setDetail(true)}
            className={`mt-5 flex items-center gap-1 font-sans text-[11px] font-bold uppercase tracking-[0.18em] border-b border-black pb-0.5 ${PRESS}`}
          >
            Full details &amp; verify code
            <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} />
          </button>
        </main>
        {/* right gutter — fee footnote only (verify code moved to detail page) */}
        <aside className="w-[66px] border-l border-black flex flex-col justify-center gap-5 px-2 flex-shrink-0">
          <Note label="Fee">{SIGN.fee}</Note>
        </aside>
      </div>
      {/* colophon action bar */}
      <div className="flex border-t-2 border-black flex-shrink-0">
        <button className={`w-[76px] h-16 border-r-2 border-black flex items-center justify-center ${PRESS}`} aria-label="Reject">
          <X className="w-7 h-7" strokeWidth={2.5} />
        </button>
        <button className="flex-1 h-16 bg-black text-[#838383] flex items-center justify-center gap-2.5 active:bg-[#838383] active:text-black">
          <Check className="w-6 h-6" strokeWidth={2.75} />
          <span className="font-serif text-[19px] font-black">Sign</span>
        </button>
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
      <div className="px-5 pt-4 pb-2 flex items-baseline justify-between flex-shrink-0">
        <span className="font-serif text-[28px] font-black tracking-tight">Sign History</span>
        <span className="font-sans text-[11px] font-bold tracking-[0.2em]">{HIST.length} ENTRIES</span>
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        {rows.map((e) => (
          <button key={e.idx} onClick={() => setSel(e)} className={`flex-1 flex min-h-0 border-t border-black w-full text-left ${PRESS}`}>
            {/* left margin — date annotation */}
            <div className="w-[66px] border-r border-black flex flex-col justify-center px-2 flex-shrink-0">
              <Note label={e.date}>{e.time}</Note>
            </div>
            {/* body paragraph */}
            <div className="flex-1 flex flex-col justify-center px-4 min-w-0">
              <div className="font-serif text-[20px] font-black leading-tight truncate">{e.title}</div>
              <div className="font-sans text-[12px] tracking-wide truncate">{e.type} · {e.sub}</div>
            </div>
            {/* right margin — status note */}
            <div className="w-[64px] border-l border-black flex items-center justify-center flex-shrink-0">
              <span className="font-sans text-[10px] font-bold tracking-wide text-center px-1">{e.ok ? 'SIGNED' : 'REJECTED'}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/** Colophon page — detail view for a single history entry. */
function HistoryDetail({ e, onBack }: { e: typeof HIST[number]; onBack: () => void }) {
  const monoKeys = /address|hash|tx/i;
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      {/* colophon header — back control + title + status */}
      <div className="h-[46px] px-3 flex items-center gap-2 border-b-2 border-black flex-shrink-0">
        <button onClick={onBack} aria-label="Back" className={`flex items-center px-1 -mx-1 ${PRESS}`}>
          <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
        </button>
        <span className="font-serif text-[18px] font-black tracking-tight flex-1">Signature</span>
        <span className="font-sans text-[10px] font-bold tracking-[0.18em] uppercase">{e.ok ? 'SIGNED' : 'REJECTED'}</span>
      </div>
      {/* index numeral + title + sub — colophon opening */}
      <div className="flex min-h-0 flex-shrink-0 border-b border-black">
        {/* left gutter — index numeral */}
        <div className="w-[66px] border-r border-black flex flex-col justify-center items-center px-2 flex-shrink-0 py-3">
          <span className="font-serif text-[40px] font-black leading-none tabular-nums">{e.idx}</span>
        </div>
        {/* body — title + meta */}
        <div className="flex-1 flex flex-col justify-center px-4 py-3 min-w-0">
          <div className="font-serif text-[22px] font-black leading-tight truncate">{e.title}</div>
          <div className="font-sans text-[11px] tracking-wide mt-0.5">{e.type} · {e.sub}</div>
          <div className="font-sans text-[10px] tracking-[0.15em] mt-1">{e.date} · {e.time}</div>
        </div>
      </div>
      {/* detail rows — sans key + serif value; mono for Address/hash/Tx */}
      <div className="flex-1 flex flex-col min-h-0">
        {e.detail.map(([k, v]) => (
          <div key={k} className="flex-1 flex min-h-0 border-b border-black last:border-b-0">
            {/* left gutter — sans key annotation */}
            <div className="w-[66px] border-r border-black flex flex-col justify-center px-2 flex-shrink-0">
              <span className="font-sans text-[9px] font-bold uppercase tracking-[0.18em] leading-tight">{k}</span>
            </div>
            {/* body — serif value, mono for address/hash/tx */}
            <div className="flex-1 flex items-center px-4 min-w-0">
              <span
                className="font-serif text-[14px] font-black leading-snug truncate"
                style={monoKeys.test(k) ? { fontFamily: 'ui-monospace, monospace', fontWeight: 700 } : undefined}
              >{v}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── SEED ── title-page recovery entry: numbered manuscript ledger + ruled input
   + indented glosses (suggestions) + keyboard. ── */
function Seed() {
  const s = useSeedEntry(SEED.count);

  if (s.done) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 text-black">
        {/* completion — centered Check in a bordered square, manuscript style */}
        <div className="w-[68px] h-[68px] border-2 border-black flex items-center justify-center flex-shrink-0">
          <Check className="w-9 h-9" strokeWidth={2.75} />
        </div>
        <div className="font-serif text-[26px] font-black tracking-tight mt-5">Recovery Phrase</div>
        <div className="font-sans text-[12px] tracking-wide mt-2">All {SEED.count} words entered</div>
        <button onClick={s.reset} className={`mt-7 px-7 h-11 border-2 border-black font-sans text-[13px] font-bold uppercase tracking-widest ${PRESS}`}>Restart</button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      {/* title-page header: "Recovery" + "WORD nn / count" */}
      <div className="flex flex-shrink-0 border-b-2 border-black">
        <div className="flex-1 px-5 pt-3 pb-2">
          <div className="font-serif text-[26px] font-black tracking-tight leading-none">Recovery</div>
        </div>
        <div className="w-[66px] border-l border-black flex flex-col justify-center items-center px-2 flex-shrink-0">
          <Note label="Word">
            <span className="tabular-nums">{String(s.words.length + 1).padStart(2, '0')}/{SEED.count}</span>
          </Note>
        </div>
      </div>

      {/* numbered manuscript ledger — bounded, no scroll */}
      <div className="flex-shrink-0 border-b border-black px-5 py-2" style={{ height: '48px', overflow: 'hidden' }}>
        {s.words.length === 0
          ? <span className="font-sans text-[12px] tracking-wide">Enter your {SEED.count}-word recovery phrase.</span>
          : <div className="flex flex-wrap gap-x-3 gap-y-0.5">
              {s.words.map((w, i) => (
                <span key={i} className="font-sans text-[12px]">
                  <span className="font-bold tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  {' '}{w}
                </span>
              ))}
            </div>
        }
      </div>

      {/* ruled input line — prefix + blinking cursor */}
      <div className="px-5 py-2 flex-shrink-0 border-b border-black">
        <div className="h-10 border-b-2 border-black flex items-center px-1 gap-1">
          <span className="font-serif text-[20px] font-black tracking-wide" style={{ fontFamily: 'ui-monospace, monospace' }}>{s.prefix}</span>
          <span className="w-0.5 h-5 bg-black" />
        </div>
      </div>

      {/* indented glosses — suggestions with a leading chevron, flex-1 distributed */}
      <div className="flex-1 min-h-0 flex flex-col border-b border-black">
        {s.suggestions.length > 0
          ? s.suggestions.map((w) => (
              <button key={w} onClick={() => s.commit(w)} className={`flex-1 w-full flex items-center gap-2 px-5 border-b border-black last:border-b-0 text-left ${PRESS}`}>
                <ChevronRight className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
                <span className="font-serif text-[20px] font-black lowercase">{w}</span>
              </button>
            ))
          : <div className="flex-1 flex items-center px-5 font-sans text-[12px] tracking-wide">
              {s.prefix ? 'No matching word' : 'Type to search BIP39'}
            </div>
        }
      </div>

      {/* keyboard — disabled keys keep their box, content wrapped invisible */}
      <div className="px-1.5 pb-2 pt-1.5 flex flex-col gap-1 flex-shrink-0 border-t-2 border-black">
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
            <button onClick={s.backWord} className={`font-sans h-10 px-3 border-2 border-black text-[11px] font-bold uppercase tracking-wide ${PRESS}`}>
              Back word
            </button>
          )}
          <button onClick={s.backspace} disabled={!s.prefix}
            className={`h-10 px-4 border-2 border-black flex items-center justify-center ${s.prefix ? PRESS : ''}`}
            aria-label="Backspace">
            <Delete className={`w-5 h-5 ${s.prefix ? '' : 'invisible'}`} strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── VERIFY ── edition picker → per-word re-entry → result (colophon). ── */
function Verify() {
  const v = useVerifyFlow();
  const rp = useReviewPage(v.idx, v.count);

  /* ── select-length: two "editions" ── */
  if (v.step === 'select-length') {
    return (
      <div className="flex-1 flex flex-col min-h-0 text-black">
        <div className="px-5 pt-3 pb-2 border-b-2 border-black flex-shrink-0">
          <div className="font-serif text-[26px] font-black tracking-tight leading-none">Verify Recovery</div>
          <div className="font-sans text-[12px] tracking-wide mt-1.5">Select the edition of your phrase.</div>
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          {([12, 24] as const).map((n) => (
            <button key={n} onClick={() => v.pickLength(n)}
              className={`flex-1 flex items-center border-t border-black px-5 text-left ${PRESS}`}>
              {/* left gutter — numeral annotation */}
              <div className="w-[66px] flex-shrink-0 flex flex-col justify-center">
                <span className="font-serif text-[46px] font-black leading-none tabular-nums">{n}</span>
              </div>
              <div className="flex-1 flex flex-col justify-center pl-3 border-l border-black min-w-0">
                <div className="font-serif text-[20px] font-black leading-tight">words</div>
                <div className="font-sans text-[11px] tracking-wide mt-0.5">{n === 12 ? 'Standard phrase' : 'Extended phrase'}</div>
              </div>
              <ChevronRight className="w-5 h-5 flex-shrink-0 ml-2" strokeWidth={2.5} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* ── result: colophon outcome ── */
  if (v.step === 'result') {
    return (
      <div className="flex-1 flex flex-col min-h-0 text-black">
        <div className="h-[46px] px-5 flex items-center border-b-2 border-black flex-shrink-0">
          <span className="font-serif text-[18px] font-black tracking-tight">Verify Recovery</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <div className="w-[68px] h-[68px] border-2 border-black flex items-center justify-center flex-shrink-0">
            {v.ok
              ? <Check className="w-9 h-9" strokeWidth={2.75} />
              : <X className="w-9 h-9" strokeWidth={2.75} />}
          </div>
          <div className="font-serif text-[26px] font-black tracking-tight mt-5">{v.ok ? 'Verified' : 'No Match'}</div>
          <div className="font-sans text-[12px] tracking-wide mt-2 max-w-[260px]">
            {v.ok
              ? 'Your recovery phrase is correct — this backup is valid.'
              : 'That phrase does not match this wallet. Check your backup and try again.'}
          </div>
          {v.ok
            ? <div className="font-sans text-[11px] tracking-[0.2em] uppercase mt-6">Returning…</div>
            : <button onClick={v.reset} className={`mt-7 px-7 h-11 border-2 border-black font-sans text-[13px] font-bold uppercase tracking-widest ${PRESS}`}>Try Again</button>}
        </div>
      </div>
    );
  }

  /* ── input: review grid + ruled input + glosses + keyboard ── */
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      {/* header with back */}
      <div className="h-[46px] px-3 flex items-center gap-2 border-b-2 border-black flex-shrink-0">
        <button onClick={() => v.reset()} aria-label="Back" className={`flex items-center px-1 -mx-1 ${PRESS}`}>
          <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
        </button>
        <span className="font-serif text-[18px] font-black tracking-tight flex-1">Verify Recovery</span>
        <span className="font-sans text-[11px] font-bold tracking-[0.18em] uppercase">
          {v.editing ? 'Edit word' : `Word ${String(v.idx + 1).padStart(2,'0')} / ${v.count}`}
        </span>
        {rp.pages > 1 && (
          <span className="font-sans text-[10px] font-bold tracking-[0.18em] ml-2">{rp.page + 1}/{rp.pages}</span>
        )}
      </div>

      {/* review grid — 2-col, 3-row; active = inverted bg-black text-[#838383] */}
      <div className="px-3 py-2 flex-shrink-0 border-b border-black">
        <div className="grid grid-cols-2 gap-1" style={{ height: '112px', gridTemplateRows: 'repeat(3, minmax(0,1fr))' }}>
          {rp.slots.map((i) => {
            const filled = i < v.words.length;
            const active = i === v.idx;
            const frontier = i === v.words.length;
            return (
              <button key={i} onClick={() => v.goToWord(i)} disabled={i > v.words.length}
                className={`flex items-center gap-2 px-2 border-2 border-black text-left overflow-hidden
                  ${active ? 'bg-black text-[#838383]' : ''}
                  ${(filled || frontier) ? PRESS : ''}`}>
                <span className="font-sans text-[10px] font-bold tabular-nums flex-shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-serif text-[14px] font-black lowercase truncate">
                  {filled ? v.words[i] : ''}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ruled input line */}
      <div className="px-5 py-2 flex-shrink-0 border-b border-black">
        <div className="h-10 border-b-2 border-black flex items-center px-1 gap-1">
          <span className="font-serif text-[20px] font-black" style={{ fontFamily: 'ui-monospace, monospace' }}>{v.prefix}</span>
          <span className="w-0.5 h-5 bg-black" />
        </div>
      </div>

      {/* indented glosses — suggestions */}
      <div className="flex-1 min-h-0 flex flex-col border-b border-black">
        {v.suggestions.length > 0
          ? v.suggestions.map((w) => (
              <button key={w} onClick={() => v.commit(w)}
                className={`flex-1 w-full flex items-center gap-2 px-5 border-b border-black last:border-b-0 text-left ${PRESS}`}>
                <ChevronRight className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
                <span className="font-serif text-[20px] font-black lowercase">{w}</span>
              </button>
            ))
          : <div className="flex-1 flex items-center px-5 font-sans text-[12px] tracking-wide">
              {v.prefix ? 'No matching word' : 'Type the word'}
            </div>
        }
      </div>

      {/* keyboard */}
      <div className="px-1.5 pb-2 pt-1.5 flex flex-col gap-1 flex-shrink-0 border-t-2 border-black">
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
            className={`h-10 px-4 border-2 border-black flex items-center justify-center ${v.prefix ? PRESS : ''}`}
            aria-label="Backspace">
            <Delete className={`w-5 h-5 ${v.prefix ? '' : 'invisible'}`} strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </div>
  );
}
