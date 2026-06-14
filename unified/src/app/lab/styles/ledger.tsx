import { useState } from 'react';
import { ChevronRight, ChevronLeft, Bluetooth, BatteryMedium, Check, X, Delete } from 'lucide-react';
import type { LabScreen } from '../data';
import { WALLET, HOME_ITEMS, HIST, SIGN, SEED } from '../data';
import { useSeedEntry, useVerifyFlow, useReviewPage, KEY_ROWS } from '../seedEngine';

/**
 * LEDGER · 账簿 — composition cell: left-rail-meta (as a FULL language).
 * Framing metaphor: a bookkeeper's ledger / index register. A fixed left column
 * of ruled field LABELS runs down EVERY screen; values live in the right column.
 * A few older styles used a left rail only on the Sign screen — this language
 * commits to it everywhere, so the label spine is the constant the eye anchors
 * to. 2-tone; sans labels, mono values.
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

/* ── SEED ── bookkeeper ledger entry: each word is a ruled ledger line.
   Left label column: WORD / ENTERED / INPUT labels; value column carries
   the content. Keyboard runs below the fold; suggestions are ledger rows. */
function Seed() {
  const s = useSeedEntry(SEED.count);

  if (s.done) {
    return (
      <div className="flex-1 flex flex-col min-h-0 text-black">
        <div className="h-[38px] flex items-center px-3 border-b-2 border-black flex-shrink-0">
          <span className="text-[12px] font-black uppercase tracking-[0.25em]">Recovery Phrase</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
          <div className="w-[56px] h-[56px] bg-black flex items-center justify-center flex-shrink-0">
            <Check className="w-8 h-8 text-[#838383]" strokeWidth={3} />
          </div>
          <div className="text-center">
            <div className="text-[22px] font-black uppercase tracking-[0.1em] leading-tight">All {s.count} words</div>
            <div className="text-[12px] font-bold tracking-[0.15em] mt-1">entry complete</div>
          </div>
          <button onClick={s.reset} className={`border-2 border-black px-6 h-10 text-[12px] font-black uppercase tracking-[0.2em] ${PRESS}`}>Restart</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      {/* masthead */}
      <div className="h-[38px] flex items-center justify-between px-3 border-b-2 border-black flex-shrink-0">
        <span className="text-[12px] font-black uppercase tracking-[0.25em]">Recovery Entry</span>
        <span className="text-[11px] font-bold tracking-[0.15em]" style={MONO}>
          WORD {String(s.words.length + 1).padStart(2, '0')} / {s.count}
        </span>
      </div>

      {/* ENTERED — numbered ledger band, bounded height */}
      <div className="flex items-stretch border-t border-black flex-shrink-0" style={{ height: '52px' }}>
        <div className="w-[96px] border-r border-black flex items-center px-3 flex-shrink-0">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] leading-tight">Entered</span>
        </div>
        <div className="flex-1 flex items-center px-3 overflow-hidden min-w-0">
          {s.words.length === 0
            ? <span className="text-[11px] tracking-wide">Enter your {s.count}-word phrase</span>
            : <div className="flex flex-wrap gap-x-2 gap-y-0.5 overflow-hidden" style={{ maxHeight: '38px' }}>
                {s.words.map((w, i) => (
                  <span key={i} className="text-[11px]">
                    <span className="font-black tabular-nums" style={MONO}>{String(i + 1).padStart(2, '0')}</span>
                    {' '}{w}
                  </span>
                ))}
              </div>
          }
        </div>
      </div>

      {/* INPUT — prefix + cursor */}
      <div className="flex items-stretch border-t border-black flex-shrink-0" style={{ height: '44px' }}>
        <div className="w-[96px] border-r border-black flex items-center px-3 flex-shrink-0">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] leading-tight">Input</span>
        </div>
        <div className="flex-1 flex items-center px-3 min-w-0">
          <span className="text-[20px] font-black tracking-wide" style={MONO}>{s.prefix}</span>
          <span className="w-[2px] h-5 bg-black ml-1 flex-shrink-0" />
        </div>
      </div>

      {/* SUGGESTIONS — up to 3 ledger rows (tap = commit); or hint row */}
      <div className="flex flex-col flex-shrink-0 border-t border-black">
        {s.suggestions.length > 0 ? s.suggestions.map((w) => (
          <button key={w} onClick={() => s.commit(w)} className={`flex items-stretch border-b border-black last:border-b-0 text-left ${PRESS}`} style={{ height: '36px' }}>
            <div className="w-[96px] border-r border-black flex items-center px-3 flex-shrink-0">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em]">Word</span>
            </div>
            <div className="flex-1 flex items-center justify-between px-3 min-w-0">
              <span className="text-[15px] font-black lowercase">{w}</span>
              <ChevronRight className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
            </div>
          </button>
        )) : (
          <div className="flex items-stretch border-b border-black" style={{ height: '36px' }}>
            <div className="w-[96px] border-r border-black flex items-center px-3 flex-shrink-0">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em]">Word</span>
            </div>
            <div className="flex-1 flex items-center px-3">
              <span className="text-[11px] tracking-wide">{s.prefix ? 'No match' : 'Type to search BIP39'}</span>
            </div>
          </div>
        )}
      </div>

      {/* KEYBOARD — disabled keys keep box, content invisible */}
      <div className="flex-1 flex flex-col justify-end border-t-2 border-black flex-shrink-0 px-1.5 pt-1.5 pb-1.5 gap-1">
        {KEY_ROWS.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-[3px]">
            {row.split('').map((k) => {
              const enabled = s.validNext.has(k);
              return (
                <button key={k} disabled={!enabled} onClick={() => s.type(k)}
                  className={`h-9 flex-1 max-w-[34px] border border-black text-[13px] font-black uppercase ${enabled ? PRESS : ''}`}>
                  <span className={enabled ? '' : 'invisible'}>{k}</span>
                </button>
              );
            })}
          </div>
        ))}
        <div className="flex justify-center gap-[3px] mt-0.5">
          {s.words.length > 0 && (
            <button onClick={s.backWord} className={`h-9 px-3 border border-black text-[11px] font-black uppercase tracking-[0.1em] ${PRESS}`}>
              Back word
            </button>
          )}
          <button onClick={s.backspace} disabled={!s.prefix} aria-label="Backspace"
            className={`h-9 px-4 border border-black flex items-center justify-center ${s.prefix ? PRESS : ''}`}>
            <Delete className={`w-5 h-5 ${s.prefix ? '' : 'invisible'}`} strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── VERIFY ── three-step ledger flow.
   select-length: two ledger rows (12 / 24).
   input: review grid as a 2-col ledger sub-table; input + suggestions + keyboard below.
   result: a single status ledger row + sub-message. */
function Verify() {
  const v = useVerifyFlow();
  const rp = useReviewPage(v.idx, v.count);

  /* ── step: select-length ── */
  if (v.step === 'select-length') {
    return (
      <div className="flex-1 flex flex-col min-h-0 text-black">
        <div className="h-[38px] flex items-center px-3 border-b-2 border-black flex-shrink-0">
          <span className="text-[12px] font-black uppercase tracking-[0.25em]">Verify Recovery</span>
        </div>
        <Row tag="Action">
          <span className="text-[14px] font-bold">Re-enter every word to confirm backup</span>
        </Row>
        {([12, 24] as const).map((n) => (
          <button key={n} onClick={() => v.pickLength(n)} className={`flex-1 w-full flex items-stretch border-t border-black text-left ${PRESS}`}>
            <div className="w-[96px] border-r border-black flex items-center px-3 flex-shrink-0">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em]">Length</span>
            </div>
            <div className="flex-1 flex items-center justify-between px-3 gap-2 min-w-0">
              <div>
                <span className="text-[32px] font-black leading-none tabular-nums" style={MONO}>{n}</span>
                <span className="text-[13px] font-bold ml-2">{n === 12 ? 'Standard' : 'Extended'}</span>
              </div>
              <ChevronRight className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
            </div>
          </button>
        ))}
      </div>
    );
  }

  /* ── step: result ── */
  if (v.step === 'result') {
    return (
      <div className="flex-1 flex flex-col min-h-0 text-black">
        <div className="h-[38px] flex items-center px-3 border-b-2 border-black flex-shrink-0">
          <span className="text-[12px] font-black uppercase tracking-[0.25em]">Verify Recovery</span>
        </div>
        <Row tag="Result">
          <div className={`w-[32px] h-[32px] flex items-center justify-center flex-shrink-0 ${v.ok ? 'bg-black' : 'border-2 border-black'}`}>
            {v.ok ? <Check className="w-5 h-5 text-[#838383]" strokeWidth={3} /> : <X className="w-5 h-5 text-black" strokeWidth={3} />}
          </div>
          <span className="text-[20px] font-black ml-3">{v.ok ? 'Verified' : 'No Match'}</span>
        </Row>
        <Row tag="Note">
          <span className="text-[12px] font-bold leading-snug">
            {v.ok ? 'Your recovery phrase is correct — backup is valid.' : 'Phrase does not match this wallet. Check your backup.'}
          </span>
        </Row>
        <Row tag="Status">
          {v.ok
            ? <span className="text-[12px] font-bold tracking-[0.2em] uppercase" style={MONO}>Returning…</span>
            : <button onClick={v.reset} className={`border-2 border-black px-5 h-9 text-[11px] font-black uppercase tracking-[0.15em] ${PRESS}`}>Try Again</button>
          }
        </Row>
      </div>
    );
  }

  /* ── step: input ── */
  const wordLabel = v.editing ? 'Edit word' : `Word ${String(v.idx + 1).padStart(2, '0')} / ${v.count}`;

  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      <div className="h-[38px] flex items-stretch border-b-2 border-black flex-shrink-0">
        <button onClick={() => v.reset()} aria-label="Back" className={`w-[96px] border-r border-black flex items-center justify-center gap-1 flex-shrink-0 ${PRESS}`}>
          <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
          <span className="text-[11px] font-bold uppercase tracking-[0.12em]">Back</span>
        </button>
        <div className="flex-1 flex items-center justify-between px-3 gap-2 min-w-0">
          <span className="text-[11px] font-black uppercase tracking-[0.15em]" style={MONO}>{wordLabel}</span>
          {rp.pages > 1 && (
            <span className="text-[11px] font-bold tracking-[0.15em]" style={MONO}>{rp.page + 1}/{rp.pages}</span>
          )}
        </div>
      </div>

      {/* REVIEW GRID — 2-col numbered cells, active = inverted */}
      <div className="flex-shrink-0 border-t border-black">
        <div className="grid grid-cols-2" style={{ height: '108px' }}>
          {rp.slots.map((i) => {
            const filled = i < v.words.length;
            const active = i === v.idx;
            const reachable = i <= v.words.length;
            return (
              <button key={i} onClick={() => v.goToWord(i)} disabled={!reachable}
                className={`flex items-center gap-2 border-b border-r border-black px-2.5 overflow-hidden
                  ${active ? 'bg-black text-[#838383]' : ''}
                  ${reachable ? PRESS : ''}`}>
                <span className="text-[10px] font-black tabular-nums flex-shrink-0" style={MONO}>{String(i + 1).padStart(2, '0')}</span>
                <span className="text-[13px] font-black lowercase truncate">{filled ? v.words[i] : ''}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* INPUT */}
      <div className="flex items-stretch border-t border-black flex-shrink-0" style={{ height: '40px' }}>
        <div className="w-[96px] border-r border-black flex items-center px-3 flex-shrink-0">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em]">Input</span>
        </div>
        <div className="flex-1 flex items-center px-3 min-w-0">
          <span className="text-[17px] font-black tracking-wide" style={MONO}>{v.prefix}</span>
          <span className="w-[2px] h-4 bg-black ml-1 flex-shrink-0" />
        </div>
      </div>

      {/* SUGGESTIONS — up to 3 ledger rows */}
      <div className="flex-shrink-0 border-t border-black">
        {v.suggestions.length > 0 ? v.suggestions.map((w) => (
          <button key={w} onClick={() => v.commit(w)} className={`w-full flex items-stretch border-b border-black last:border-b-0 text-left ${PRESS}`} style={{ height: '32px' }}>
            <div className="w-[96px] border-r border-black flex items-center px-3 flex-shrink-0">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em]">Word</span>
            </div>
            <div className="flex-1 flex items-center justify-between px-3 min-w-0">
              <span className="text-[14px] font-black lowercase">{w}</span>
              <ChevronRight className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
            </div>
          </button>
        )) : (
          <div className="flex items-stretch border-b border-black" style={{ height: '32px' }}>
            <div className="w-[96px] border-r border-black flex items-center px-3 flex-shrink-0">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em]">Word</span>
            </div>
            <div className="flex-1 flex items-center px-3">
              <span className="text-[11px] tracking-wide">{v.prefix ? 'No match' : 'Type the word'}</span>
            </div>
          </div>
        )}
      </div>

      {/* KEYBOARD */}
      <div className="flex-1 flex flex-col justify-end border-t-2 border-black px-1.5 pt-1.5 pb-1.5 gap-1">
        {KEY_ROWS.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-[3px]">
            {row.split('').map((k) => {
              const enabled = v.validNext.has(k);
              return (
                <button key={k} disabled={!enabled} onClick={() => v.type(k)}
                  className={`h-9 flex-1 max-w-[34px] border border-black text-[13px] font-black uppercase ${enabled ? PRESS : ''}`}>
                  <span className={enabled ? '' : 'invisible'}>{k}</span>
                </button>
              );
            })}
          </div>
        ))}
        <div className="flex justify-center gap-[3px] mt-0.5">
          <button onClick={v.backspace} disabled={!v.prefix} aria-label="Backspace"
            className={`h-9 px-4 border border-black flex items-center justify-center ${v.prefix ? PRESS : ''}`}>
            <Delete className={`w-5 h-5 ${v.prefix ? '' : 'invisible'}`} strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </div>
  );
}

/** One ledger line: fixed left label cell + right value cell. */
function Row({ tag, children, onPress, chevron, onClick }: { tag: React.ReactNode; children: React.ReactNode; onPress?: boolean; chevron?: boolean; onClick?: () => void }) {
  const inner = (
    <>
      <div className="w-[96px] border-r border-black flex items-center px-3 flex-shrink-0">
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] leading-tight">{tag}</span>
      </div>
      <div className="flex-1 flex items-center justify-between gap-2 px-3 min-w-0">{children}{chevron && <ChevronRight className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />}</div>
    </>
  );
  return onPress
    ? <button onClick={onClick} className={`flex-1 w-full flex items-stretch border-t border-black text-left ${PRESS}`}>{inner}</button>
    : <div className="flex-1 flex items-stretch border-t border-black">{inner}</div>;
}

export function LedgerStyle({ screen }: { screen: LabScreen }) {
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
      <div className="h-[38px] flex items-center px-3 border-b-2 border-black flex-shrink-0">
        <span className="text-[12px] font-black uppercase tracking-[0.25em]">Account Ledger</span>
      </div>
      <Row tag="Name"><span className="text-[26px] font-black leading-none">{WALLET.name}</span></Row>
      <Row tag="Model"><span className="text-[15px] font-bold uppercase tracking-wide">{WALLET.model}</span></Row>
      <Row tag="Status">
        <span className="text-[14px] font-bold inline-flex items-center gap-3">
          <span className="inline-flex items-center gap-1"><BatteryMedium className="w-4 h-4" strokeWidth={2.5} />{WALLET.battery}%</span>
          <Bluetooth className="w-4 h-4" strokeWidth={2.5} />
          <span style={MONO}>NET {WALLET.networks} · TOK {WALLET.tokens}</span>
        </span>
      </Row>
      {HOME_ITEMS.map((it) => (
        <Row key={it.id} tag={<span style={MONO}>{it.code}</span>} onPress chevron>
          <div className="min-w-0">
            <div className="text-[20px] font-black leading-tight">{it.label}</div>
            <div className="text-[11px] tracking-wide truncate">{it.sub}</div>
          </div>
        </Row>
      ))}
    </div>
  );
}

function SignDetail({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      <div className="h-[38px] flex items-stretch border-b-2 border-black flex-shrink-0">
        <button onClick={onBack} aria-label="Back" className={`w-[96px] border-r border-black flex items-center justify-center gap-1 flex-shrink-0 ${PRESS}`}>
          <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
          <span className="text-[11px] font-bold uppercase tracking-[0.12em]">Back</span>
        </button>
        <div className="flex-1 flex items-center px-3 min-w-0">
          <span className="text-[12px] font-black uppercase tracking-[0.25em]">Signature Detail</span>
        </div>
      </div>
      <Row tag="Amount">
        <span className="flex items-baseline gap-2"><span className="text-[36px] font-black leading-none tabular-nums">{SIGN.amount}</span><span className="text-lg font-black">{SIGN.token}</span></span>
      </Row>
      <Row tag="Value"><span className="text-[18px] font-black ml-auto">{SIGN.fiat}</span></Row>
      <Row tag="To">
        <div className="min-w-0 text-right ml-auto">
          <div className="text-[18px] font-black leading-tight">{SIGN.to}</div>
          <div className="text-[12px] truncate" style={MONO}>{SIGN.address}</div>
        </div>
      </Row>
      <Row tag="Network"><span className="text-[18px] font-black ml-auto">{SIGN.network}</span></Row>
      <Row tag="Fee"><span className="text-[18px] font-black ml-auto">{SIGN.fee}</span></Row>
      <Row tag="Verify"><span className="text-[26px] font-black tracking-[0.1em] ml-auto" style={MONO}>{SIGN.verify}</span></Row>
    </div>
  );
}

function Sign() {
  const [detail, setDetail] = useState(false);
  if (detail) return <SignDetail onBack={() => setDetail(false)} />;
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      <div className="h-[38px] flex items-center justify-between px-3 border-b-2 border-black flex-shrink-0">
        <span className="text-[12px] font-black uppercase tracking-[0.25em]">Confirm Send</span>
        <span className="text-[11px] font-bold tracking-wide" style={MONO}>{SIGN.network}</span>
      </div>
      <Row tag="Amount">
        <span className="flex items-baseline gap-2"><span className="text-[42px] font-black leading-none tabular-nums">{SIGN.amount}</span><span className="text-lg font-black">{SIGN.token}</span><span className="text-[12px] ml-1">{SIGN.fiat}</span></span>
      </Row>
      <Row tag="To">
        <div className="min-w-0 text-right ml-auto">
          <div className="text-[18px] font-black leading-tight">{SIGN.to}</div>
          <div className="text-[12px] truncate" style={MONO}>{SIGN.address}</div>
        </div>
      </Row>
      <Row tag="Network"><span className="text-[18px] font-black ml-auto">{SIGN.network}</span></Row>
      <Row tag="Fee"><span className="text-[18px] font-black ml-auto">{SIGN.fee}</span></Row>
      <Row tag={<span style={MONO}>Detail</span>} onPress chevron onClick={() => setDetail(true)}>
        <span className="text-[13px] font-bold">完整详情 / Full details &amp; verify code</span>
      </Row>
      <div className="flex border-t-2 border-black flex-shrink-0">
        <button className={`w-[76px] h-16 border-r-2 border-black flex items-center justify-center ${PRESS}`} aria-label="Reject">
          <X className="w-7 h-7" strokeWidth={2.5} />
        </button>
        <button className="flex-1 h-16 bg-black text-[#838383] flex items-center justify-center gap-2.5 active:bg-[#838383] active:text-black">
          <Check className="w-6 h-6" strokeWidth={2.75} />
          <span className="text-[18px] font-black uppercase tracking-[0.15em]">Post Entry</span>
        </button>
      </div>
    </div>
  );
}

function History() {
  const [sel, setSel] = useState<typeof HIST[number] | null>(null);

  if (sel) {
    const isMono = (k: string) => k === 'Address' || k.includes('hash') || k.includes('Tx') || k === 'Contract';
    return (
      <div className="flex-1 flex flex-col min-h-0 text-black">
        {/* header row — back + title + status in ledger Row style */}
        <div className="h-[38px] flex items-stretch border-b-2 border-black flex-shrink-0">
          <button onClick={() => setSel(null)} aria-label="Back" className={`w-[96px] border-r border-black flex items-center justify-center gap-1 flex-shrink-0 ${PRESS}`}>
            <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
            <span className="text-[11px] font-bold uppercase tracking-[0.12em]">Back</span>
          </button>
          <div className="flex-1 flex items-center justify-between px-3 gap-2 min-w-0">
            <span className="text-[12px] font-black uppercase tracking-[0.2em]">Signature</span>
            <span className="text-[11px] font-bold tracking-[0.15em]" style={MONO}>{sel.ok ? 'SIGNED' : 'REJECTED'}</span>
          </div>
        </div>
        {/* summary rows */}
        <Row tag="Ref"><span className="text-[22px] font-black leading-none tabular-nums" style={MONO}>{sel.idx}</span></Row>
        <Row tag="Date"><span className="text-[14px] font-bold">{sel.date} · {sel.time}</span></Row>
        <Row tag="Title"><span className="text-[15px] font-black truncate">{sel.title}</span></Row>
        <Row tag="Type"><span className="text-[13px] font-bold">{sel.type} · {sel.sub}</span></Row>
        {/* detail rows — key left, value right; mono for Address/hash/Tx */}
        {sel.detail.map(([k, v]) => (
          <Row key={k} tag={k}>
            <span className="text-[13px] font-bold truncate text-right ml-auto" style={isMono(k) ? MONO : undefined}>{v}</span>
          </Row>
        ))}
      </div>
    );
  }

  const rows = HIST.slice(0, 5);
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      <div className="h-[38px] flex items-center justify-between px-3 border-b-2 border-black flex-shrink-0">
        <span className="text-[12px] font-black uppercase tracking-[0.25em]">Sign Ledger</span>
        <span className="text-[11px] font-bold tracking-wide">{HIST.length} ENTRIES</span>
      </div>
      {rows.map((e) => (
        <button key={e.idx} onClick={() => setSel(e)} className={`flex-1 w-full flex items-stretch border-t border-black text-left ${PRESS}`}>
          <div className="w-[96px] border-r border-black flex flex-col justify-center px-3 flex-shrink-0">
            <span className="text-[18px] font-black leading-none tabular-nums" style={MONO}>{e.idx}</span>
            <span className="text-[10px] font-bold uppercase tracking-wide mt-0.5">{e.date} {e.time}</span>
          </div>
          <div className="flex-1 flex items-center justify-between gap-2 px-3 min-w-0">
            <div className="min-w-0">
              <div className="text-[17px] font-black leading-tight truncate">{e.title}</div>
              <div className="text-[11px] truncate">{e.type} · {e.sub}</div>
            </div>
            <span className="text-[10px] font-bold tracking-wide flex-shrink-0">{e.ok ? 'SIGNED' : 'REJECTED'}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
