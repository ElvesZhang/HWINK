import { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Bluetooth, BatteryMedium, X, Check, Fingerprint, Delete } from 'lucide-react';
import type { LabScreen } from '../data';
import { WALLET, HOME_ITEMS, SIGN, HIST, SEED } from '../data';

/**
 * P3 · 克制的编辑感 (Editorial) — literary, ordered, magazine-calm.
 *
 * Governing voice: an agenda poster. SERIF display type carries the content
 * voice; SANS micro-labels carry system metadata — and that split is enforced
 * everywhere. Hierarchy from huge serif numerals + hairline rules + weight. NO
 * shadows, NO rounding, NO containers — structure is drawn with 2px ink lines.
 * Emphasis = the inverted chip (black field, #838383 text), used as the single
 * status/affordance token.
 *
 * Surface semantics (locked): #838383 = page; black = the inverted header band +
 * chips + the one primary action. Numerals index; chips label; rules separate.
 */
const PRESS = 'active:bg-black active:text-[#838383]';

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="font-sans inline-flex items-center bg-black text-[#838383] text-[11px] font-bold leading-none px-2 py-1 tracking-wide">{children}</span>;
}

export function P3Editorial({ screen }: { screen: LabScreen }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black font-serif">
      {screen === 'home' && <Home />}
      {screen === 'sign' && <Sign />}
      {screen === 'history' && <History />}
      {screen === 'seed' && <Seed />}
      {screen === 'verify' && <VerifyRecovery />}
    </div>
  );
}

/* Status vocabulary (locked): full words SIGNED / REJECTED, plain uppercase sans.
   The inverted Chip is reserved for metadata (date/time/network), NOT status. */
function statusLabel(ok: boolean) { return ok ? 'SIGNED' : 'REJECTED'; }

/* ── HOME ── inverted masthead + numbered serif index. ── */
function Home() {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* masthead — inverted band, serif name */}
      <div className="bg-black text-[#838383] px-5 pt-3.5 pb-4 flex-shrink-0">
        <div className="font-sans flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.22em]">
          <span>◆ Wallet</span>
          <span className="inline-flex items-center gap-2.5">
            <Bluetooth className="w-4 h-4" strokeWidth={2.25} />
            <span className="inline-flex items-center gap-1 tabular-nums"><BatteryMedium className="w-5 h-5" strokeWidth={2.25} />{WALLET.battery}%</span>
          </span>
        </div>
        <div className="text-[38px] font-bold tracking-tight leading-none mt-2">{WALLET.name}</div>
        <div className="font-sans text-[11px] tracking-[0.25em] mt-2">{WALLET.model}</div>
      </div>
      {/* numbered index — big serif numerals, hairline rules, sans subs */}
      <div className="flex-1 flex flex-col min-h-0">
        {HOME_ITEMS.map((m, i) => (
          <button key={m.id} className={`flex-1 flex items-center gap-4 px-5 border-t border-black text-left ${PRESS}`}>
            <span className="text-[46px] font-bold leading-none tabular-nums w-[58px] flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
            <div className="flex-1 min-w-0">
              <div className="text-[24px] font-bold leading-tight">{m.label}</div>
              <div className="font-sans text-[12px] tracking-wide mt-0.5 truncate">{m.sub}</div>
            </div>
            <ChevronRight className="w-6 h-6 flex-shrink-0" strokeWidth={2} />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── SIGN ── serif amount + ruled rows + inverted verify bar + hold. ── */
function MetaRow({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex-1 flex items-center justify-between gap-3 px-5 border-t border-black">
      <span className="font-sans text-[11px] font-bold uppercase tracking-[0.15em] flex-shrink-0">{k}</span>
      <span className="text-[18px] font-bold text-right truncate" style={mono ? { fontFamily: 'ui-monospace, monospace' } : undefined}>{v}</span>
    </div>
  );
}

const HOLD_STEPS = 5;
function Sign() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState<null | 'signed' | 'rejected'>(null);
  const timer = useRef<number | null>(null);
  const clear = () => { if (timer.current !== null) { window.clearInterval(timer.current); timer.current = null; } };
  useEffect(() => clear, []);
  const startHold = () => {
    if (done) return; clear();
    timer.current = window.setInterval(() => {
      setProgress(p => { if (p + 1 >= HOLD_STEPS) { clear(); setDone('signed'); return HOLD_STEPS; } return p + 1; });
    }, 150);
  };
  const endHold = () => { clear(); if (!done) setProgress(0); };
  const reset = () => { clear(); setProgress(0); setDone(null); };

  if (done) {
    const ok = done === 'signed';
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
        <div className={`w-[76px] h-[76px] rounded-full flex items-center justify-center ${ok ? 'bg-black' : 'border-[3px] border-black'}`}>
          {ok ? <Check className="w-10 h-10 text-[#838383]" strokeWidth={3} /> : <X className="w-10 h-10 text-black" strokeWidth={3} />}
        </div>
        <div className="text-[30px] font-bold tracking-tight mt-5">{ok ? 'Signed' : 'Rejected'}</div>
        <div className="font-sans text-[12px] tracking-wide mt-2">{ok ? `${SIGN.amount} ${SIGN.token} → ${SIGN.to}` : 'Nothing was sent'}</div>
        <button onClick={reset} className={`mt-7 px-7 h-11 border-2 border-black font-sans text-[13px] font-bold uppercase tracking-widest ${PRESS}`}>Again</button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-5 pt-3.5 pb-2.5 flex items-baseline justify-between border-b-2 border-black flex-shrink-0">
        <span className="text-2xl font-bold tracking-tight">Confirm Send</span>
        <Chip>{SIGN.network}</Chip>
      </div>
      {/* serif amount hero */}
      <div className="px-5 pt-4 pb-3 flex-shrink-0">
        <div className="font-sans text-[11px] font-bold tracking-[0.25em] uppercase">Amount</div>
        <div className="flex items-baseline gap-2.5 mt-1">
          <span className="text-[68px] font-bold leading-[0.78] tabular-nums tracking-tight">{SIGN.amount}</span>
          <span className="text-3xl font-bold">{SIGN.token}</span>
          <span className="font-sans text-[12px] ml-auto self-end">≈ {SIGN.fiat}</span>
        </div>
      </div>
      {/* ruled rows */}
      <div className="flex-1 min-h-0 flex flex-col">
        <MetaRow k="To" v={SIGN.to} />
        <MetaRow k="Address" v={SIGN.address} mono />
        <MetaRow k="Network fee" v={SIGN.fee} />
      </div>
      {/* verify code — inverted full-width readout bar (the emphasis token) */}
      <div className="bg-black text-[#838383] px-5 py-2.5 flex items-center justify-between flex-shrink-0">
        <span className="font-sans text-[11px] font-bold uppercase tracking-[0.2em]">Verify Code</span>
        <span className="text-[22px] font-bold tracking-[0.35em] tabular-nums" style={{ fontFamily: 'ui-monospace, monospace' }}>{SIGN.verify}</span>
      </div>
      {/* action */}
      <div className="flex border-t-2 border-black flex-shrink-0">
        <button onClick={() => setDone('rejected')} className={`w-[76px] h-16 border-r-2 border-black flex items-center justify-center ${PRESS}`} aria-label="Reject">
          <X className="w-7 h-7" strokeWidth={2.25} />
        </button>
        <button onPointerDown={startHold} onPointerUp={endHold} onPointerLeave={endHold} className="relative flex-1 h-16 bg-black overflow-hidden select-none touch-none" aria-label="Hold to sign">
          <div className="absolute inset-0 flex">
            {Array.from({ length: HOLD_STEPS }, (_, i) => (
              <div key={i} className={`flex-1 ${i < progress ? 'bg-[#838383]' : ''} ${i > 0 ? 'border-l border-[#838383]' : ''}`} />
            ))}
          </div>
          <span className="relative z-10 h-full flex items-center justify-center gap-2 font-sans text-[15px] font-bold uppercase tracking-[0.18em] text-[#838383]">
            <Fingerprint className="w-5 h-5" strokeWidth={2.25} />{progress > 0 ? 'Hold…' : 'Hold to Sign'}
          </span>
        </button>
      </div>
    </div>
  );
}

/* ── HISTORY ── paginated agenda ledger (no scroll); tap a row → detail. ── */
const HFILTERS: ['all' | 'sent' | 'signed', string][] = [['all', 'All'], ['sent', 'Sent'], ['signed', 'Signed']];
const PER_PAGE = 3;

function History() {
  const [filter, setFilter] = useState<'all' | 'sent' | 'signed'>('all');
  const [page, setPage] = useState(0);
  const [sel, setSel] = useState<typeof HIST[number] | null>(null);

  const rows = HIST.filter(e => filter === 'all' || e.kind === filter);
  const pages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  const safePage = Math.min(page, pages - 1);
  const pageRows = rows.slice(safePage * PER_PAGE, safePage * PER_PAGE + PER_PAGE);

  if (sel) return <HistoryDetail e={sel} onBack={() => setSel(null)} />;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-5 pt-3.5 pb-2.5 flex-shrink-0">
        <div className="flex items-baseline justify-between">
          <span className="text-[27px] font-bold tracking-tight leading-none">Sign History</span>
          <Chip>{rows.length}</Chip>
        </div>
        {/* filter = SELECT a value (active = inverted), distinct from row = NAVIGATE (chevron) */}
        <div className="flex gap-1.5 mt-2.5">
          {HFILTERS.map(([id, label]) => (
            <button key={id} onClick={() => { setFilter(id); setPage(0); }} className={`font-sans px-3 h-7 text-[12px] font-bold uppercase tracking-wide border-2 border-black ${filter === id ? 'bg-black text-[#838383]' : `text-black ${PRESS}`}`}>{label}</button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col border-t border-black">
        {pageRows.map(e => (
          <button key={e.idx} onClick={() => setSel(e)} className={`flex-1 w-full flex items-center gap-3.5 px-5 border-b border-black last:border-b-0 text-left ${PRESS}`}>
            <span className="text-[40px] font-bold leading-[0.8] tabular-nums w-[52px] flex-shrink-0">{e.idx}</span>
            <div className="flex-1 min-w-0">
              <Chip>{e.date} · {e.time}</Chip>
              <div className="text-[20px] font-bold leading-tight mt-1.5 truncate">{e.title}</div>
              <div className="font-sans text-[12px] tracking-wide mt-0.5 truncate">{e.type} · {e.sub}</div>
            </div>
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <span className="font-sans text-[10px] font-bold tracking-wide">{statusLabel(e.ok)}</span>
              <ChevronRight className="w-5 h-5" strokeWidth={2.25} />
            </div>
          </button>
        ))}
      </div>

      {/* pager — Prev/Next hidden at boundaries (no scroll) */}
      <div className="grid grid-cols-3 items-center border-t-2 border-black h-11 flex-shrink-0">
        <div className="justify-self-start">
          {safePage > 0 && (
            <button onClick={() => setPage(safePage - 1)} className={`font-sans h-11 pl-4 pr-4 flex items-center gap-1 text-[13px] font-bold uppercase tracking-wide ${PRESS}`}>
              <ChevronLeft className="w-5 h-5" strokeWidth={2.25} />Prev
            </button>
          )}
        </div>
        <span className="font-sans justify-self-center text-[12px] font-bold tracking-[0.2em]">{safePage + 1} / {pages}</span>
        <div className="justify-self-end">
          {safePage < pages - 1 && (
            <button onClick={() => setPage(safePage + 1)} className={`font-sans h-11 pr-4 pl-4 flex items-center gap-1 text-[13px] font-bold uppercase tracking-wide ${PRESS}`}>
              Next<ChevronRight className="w-5 h-5" strokeWidth={2.25} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function HistoryDetail({ e, onBack }: { e: typeof HIST[number]; onBack: () => void }) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="h-[46px] px-4 flex items-center gap-2 border-b-2 border-black flex-shrink-0">
        <button onClick={onBack} aria-label="Back" className={`flex items-center px-1 -mx-1 ${PRESS}`}>
          <ChevronLeft className="w-6 h-6" strokeWidth={2.25} />
        </button>
        <span className="text-lg font-bold tracking-tight">Signature</span>
        <span className="font-sans ml-auto text-[11px] font-bold tracking-wide">{statusLabel(e.ok)}</span>
      </div>
      <div className="px-5 pt-4 pb-3 flex-shrink-0">
        <Chip>{e.date} · {e.time}</Chip>
        <div className="flex items-end gap-3 mt-2.5">
          <span className="text-[48px] font-bold leading-[0.75] tabular-nums">{e.idx}</span>
          <div className="pb-1 min-w-0">
            <div className="text-[24px] font-bold leading-none truncate">{e.title}</div>
            <div className="font-sans text-[12px] mt-1.5 truncate">{e.type} · {e.sub}</div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col border-t border-black">
        {e.detail.map(([k, v]) => (
          <div key={k} className="flex-1 flex items-center justify-between gap-3 px-5 border-b border-black last:border-b-0">
            <span className="font-sans text-[11px] font-bold uppercase tracking-[0.12em] flex-shrink-0">{k}</span>
            <span className="text-[16px] font-bold text-right truncate" style={k === 'Address' || k.includes('hash') || k.includes('Tx') ? { fontFamily: 'ui-monospace, monospace' } : undefined}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── SEED ── editorial recovery entry: BIP39 prefix keyboard + ruled suggestions,
   entered words shown as a numbered bounded band (no scroll). ── */
const BIP39_SUBSET = [
  'abandon', 'ability', 'able', 'about', 'access', 'acid', 'across', 'action',
  'bacon', 'badge', 'balance', 'bamboo', 'banana', 'bargain', 'basic', 'beauty',
  'cabin', 'cable', 'cactus', 'cake', 'camera', 'canal', 'cargo', 'castle',
  'damage', 'dance', 'dawn', 'deal', 'debate', 'decide', 'deer', 'desert',
  'eager', 'eagle', 'early', 'earn', 'east', 'echo', 'edit', 'effort',
  'fabric', 'face', 'faculty', 'fade', 'faith', 'famous', 'fancy', 'fault',
  'gadget', 'gain', 'galaxy', 'gallery', 'garden', 'garlic', 'gather', 'gesture',
  'habit', 'hair', 'half', 'hammer', 'happy', 'harbor', 'hazard', 'health',
  'ice', 'icon', 'idea', 'identify', 'idle', 'image', 'impose', 'income',
  'lab', 'label', 'labor', 'ladder', 'lake', 'lamp', 'laptop', 'laundry',
  'machine', 'magic', 'magnet', 'major', 'mango', 'mansion', 'marble', 'march',
  'oak', 'obey', 'object', 'oblige', 'ocean', 'october', 'offer', 'olive',
  'sad', 'saddle', 'safe', 'sail', 'salad', 'salmon', 'sample', 'satisfy',
  'table', 'tackle', 'tag', 'tail', 'talent', 'tank', 'target', 'taste',
];
const KEY_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

function Seed() {
  const [words, setWords] = useState<string[]>([]);
  const [prefix, setPrefix] = useState('');
  const done = words.length >= SEED.count;
  const suggestions = prefix ? BIP39_SUBSET.filter(w => w.startsWith(prefix)).slice(0, 3) : [];
  const validNext = new Set(BIP39_SUBSET.filter(w => w.startsWith(prefix)).map(w => w[prefix.length]).filter(Boolean));
  const commit = (w: string) => { if (words.length >= SEED.count) return; setWords([...words, w]); setPrefix(''); };
  const reset = () => { setWords([]); setPrefix(''); };

  if (done) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
        <div className="w-[76px] h-[76px] rounded-full bg-black flex items-center justify-center">
          <Check className="w-10 h-10 text-[#838383]" strokeWidth={3} />
        </div>
        <div className="text-[28px] font-bold tracking-tight mt-5">Recovery Phrase</div>
        <div className="font-sans text-[12px] tracking-wide mt-2">All {SEED.count} words entered</div>
        <button onClick={reset} className={`mt-7 px-7 h-11 border-2 border-black font-sans text-[13px] font-bold uppercase tracking-widest ${PRESS}`}>Restart</button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-5 pt-3 pb-2 flex items-baseline justify-between border-b-2 border-black flex-shrink-0">
        <span className="text-2xl font-bold tracking-tight">Recovery</span>
        <span className="font-sans text-[12px] font-bold tracking-widest uppercase">Word <span className="text-lg font-bold">{String(words.length + 1).padStart(2, '0')}</span> / {SEED.count}</span>
      </div>

      {/* entered words — numbered, bounded band (no scroll) */}
      <div className="px-5 py-2 flex-shrink-0 h-[44px] overflow-hidden border-b border-black">
        {words.length === 0
          ? <span className="font-sans text-[12px] tracking-wide">Enter your {SEED.count}-word recovery phrase.</span>
          : <div className="flex flex-wrap gap-x-3 gap-y-0.5">{words.map((w, i) => <span key={i} className="font-sans text-[12px]"><span className="font-bold tabular-nums">{String(i + 1).padStart(2, '0')}</span> {w}</span>)}</div>}
      </div>

      {/* input — monospace prefix + cursor */}
      <div className="px-5 py-2 flex-shrink-0">
        <div className="h-11 border-2 border-black flex items-center px-3">
          <span className="text-xl font-bold tracking-wide" style={{ fontFamily: 'ui-monospace, monospace' }}>{prefix}</span>
          <span className="w-0.5 h-6 bg-black ml-1" />
        </div>
      </div>

      {/* ruled suggestions */}
      <div className="flex-1 min-h-0 flex flex-col border-t border-black">
        {suggestions.length > 0 ? suggestions.map(w => (
          <button key={w} onClick={() => commit(w)} className={`flex-1 w-full flex items-center gap-3 px-5 border-b border-black last:border-b-0 text-left ${PRESS}`}>
            <ChevronRight className="w-5 h-5 flex-shrink-0" strokeWidth={3} />
            <span className="text-2xl font-bold lowercase">{w}</span>
          </button>
        )) : (
          <div className="flex-1 flex items-center px-5 font-sans text-[12px] tracking-wide">{prefix ? 'No matching word' : 'Type to search BIP39'}</div>
        )}
      </div>

      {/* keyboard — disabled keys keep their box, content invisible (§3.1) */}
      <div className="px-1.5 pb-2 pt-1.5 flex flex-col gap-1.5 flex-shrink-0 border-t-2 border-black">
        {KEY_ROWS.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1">
            {row.split('').map(k => {
              const enabled = validNext.has(k);
              return (
                <button key={k} disabled={!enabled} onClick={() => setPrefix(prefix + k)} className={`font-sans h-11 flex-1 max-w-[34px] border-2 border-black text-base font-bold uppercase ${enabled ? PRESS : ''}`}>
                  <span className={enabled ? '' : 'invisible'}>{k}</span>
                </button>
              );
            })}
          </div>
        ))}
        <div className="flex justify-center gap-1">
          {words.length > 0 && (
            <button onClick={() => { setWords(words.slice(0, -1)); setPrefix(''); }} className={`font-sans h-11 px-4 border-2 border-black text-[12px] font-bold uppercase tracking-wide ${PRESS}`}>Back word</button>
          )}
          <button onClick={() => setPrefix(prefix.slice(0, -1))} disabled={!prefix} className={`h-11 px-5 border-2 border-black flex items-center justify-center ${prefix ? PRESS : ''}`} aria-label="Backspace">
            <Delete className={`w-6 h-6 ${prefix ? '' : 'invisible'}`} strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── VERIFY RECOVERY ── settings flow, re-skinned in the Editorial language.
   Faithful to the device's VerifyRecoveryPageNew state machine:
   select-length → per-word typed BIP39 (edit-in-place + return-to-frontier) →
   result (success auto-returns, fail offers Try Again). No PIN gate.

   Demo note: EXPECTED[i] = the top suggestion of each word's single starting
   letter, so a passing run = "tap the lit letter → tap the top suggestion",
   while choosing any other word lands on the fail screen. */
const EXPECTED = ['abandon', 'bacon', 'cabin', 'damage', 'eager', 'fabric', 'gadget', 'habit', 'ice', 'lab', 'machine', 'oak', 'sad', 'table', 'ability', 'badge', 'cable', 'dance', 'eagle', 'face', 'gain', 'hair', 'icon', 'label'];
const REVIEW_PER_PAGE = 6;

function VerifyHeader({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <div className="h-[46px] px-4 flex items-center gap-2 border-b-2 border-black flex-shrink-0">
      {onBack
        ? <button onClick={onBack} aria-label="Back" className={`flex items-center px-1 -mx-1 ${PRESS}`}><ChevronLeft className="w-6 h-6" strokeWidth={2.25} /></button>
        : <span className="w-2 flex-shrink-0" />}
      <span className="text-lg font-bold tracking-tight">{title}</span>
    </div>
  );
}

function VerifyRecovery() {
  type Step = 'select-length' | 'input' | 'result';
  const [step, setStep] = useState<Step>('select-length');
  const [count, setCount] = useState(12);
  const [words, setWords] = useState<string[]>([]);
  const [prefix, setPrefix] = useState('');
  const [idx, setIdx] = useState(0);
  const [ok, setOk] = useState(false);
  const [page, setPage] = useState(0);

  const reset = () => { setStep('select-length'); setWords([]); setPrefix(''); setIdx(0); setPage(0); };
  // keep the active word's review page on screen
  useEffect(() => { setPage(Math.floor(idx / REVIEW_PER_PAGE)); }, [idx]);
  // success auto-returns to the start (stands in for onBack to the settings menu)
  useEffect(() => {
    if (step === 'result' && ok) { const t = window.setTimeout(reset, 2200); return () => window.clearTimeout(t); }
  }, [step, ok]);

  if (step === 'select-length') {
    const pick = (n: number) => { setCount(n); setWords([]); setIdx(0); setPrefix(''); setStep('input'); };
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <VerifyHeader title="Verify Recovery" />
        <div className="px-5 pt-4 pb-3 flex-shrink-0">
          <div className="text-[26px] font-bold leading-tight tracking-tight">Confirm your<br />recovery phrase</div>
          <div className="font-sans text-[12px] tracking-wide mt-2">Re-enter every word to prove your backup is correct.</div>
        </div>
        <div className="flex-1 flex flex-col min-h-0 border-t-2 border-black">
          {[12, 24].map((n) => (
            <button key={n} onClick={() => pick(n)} className={`flex-1 flex items-center gap-4 px-5 border-b border-black last:border-b-0 text-left ${PRESS}`}>
              <span className="text-[52px] font-bold leading-none tabular-nums w-[80px] flex-shrink-0">{n}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[20px] font-bold leading-tight">words</div>
                <div className="font-sans text-[12px] tracking-wide mt-0.5">{n === 12 ? 'Standard phrase' : 'Extended phrase'}</div>
              </div>
              <ChevronRight className="w-6 h-6 flex-shrink-0" strokeWidth={2} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 'result') {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <VerifyHeader title="Verify Recovery" />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <div className={`w-[76px] h-[76px] rounded-full flex items-center justify-center ${ok ? 'bg-black' : 'border-[3px] border-black'}`}>
            {ok ? <Check className="w-10 h-10 text-[#838383]" strokeWidth={3} /> : <X className="w-10 h-10 text-black" strokeWidth={3} />}
          </div>
          <div className="text-[28px] font-bold tracking-tight mt-5">{ok ? 'Verified' : 'No Match'}</div>
          <div className="font-sans text-[12px] tracking-wide mt-2 max-w-[260px]">{ok ? 'Your recovery phrase is correct — this backup is valid.' : 'That phrase does not match this wallet. Check your backup and try again.'}</div>
          {ok
            ? <div className="font-sans text-[11px] tracking-[0.2em] uppercase mt-6">Returning…</div>
            : <button onClick={reset} className={`mt-7 px-7 h-11 border-2 border-black font-sans text-[13px] font-bold uppercase tracking-widest ${PRESS}`}>Try Again</button>}
        </div>
      </div>
    );
  }

  // INPUT
  const suggestions = prefix ? BIP39_SUBSET.filter(w => w.startsWith(prefix)).slice(0, 3) : [];
  const validNext = new Set(BIP39_SUBSET.filter(w => w.startsWith(prefix)).map(w => w[prefix.length]).filter(Boolean));
  const editing = idx < words.length;

  const commit = (w: string) => {
    if (editing) { const next = [...words]; next[idx] = w; setWords(next); setPrefix(''); setIdx(next.length); return; }
    const next = [...words, w]; setWords(next); setPrefix('');
    if (next.length >= count) { setOk(next.every((x, i) => x === EXPECTED[i])); setStep('result'); }
    else setIdx(next.length);
  };
  const goToWord = (t: number) => { setIdx(t); setPrefix(words[t] ?? ''); };

  const pages = Math.max(1, Math.ceil(count / REVIEW_PER_PAGE));
  const safePage = Math.min(page, pages - 1);
  const slots = Array.from({ length: REVIEW_PER_PAGE }, (_, i) => safePage * REVIEW_PER_PAGE + i).filter(i => i < count);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <VerifyHeader title="Verify Recovery" onBack={() => setStep('select-length')} />
      <div className="px-5 pt-2.5 pb-2 flex items-baseline justify-between flex-shrink-0">
        <span className="font-sans text-[12px] font-bold tracking-widest uppercase">{editing ? 'Edit word' : 'Word'} <span className="text-lg font-bold">{String(idx + 1).padStart(2, '0')}</span> / {count}</span>
        {pages > 1 && <span className="font-sans text-[11px] font-bold tracking-[0.2em]">{safePage + 1}/{pages}</span>}
      </div>
      {/* review grid — numbered, tap to edit-in-place; active inverted */}
      <div className="px-3 pb-2 flex-shrink-0">
        <div className="grid grid-cols-2 gap-1.5" style={{ height: '118px', gridTemplateRows: 'repeat(3, minmax(0,1fr))' }}>
          {slots.map((i) => {
            const filled = i < words.length;
            const active = i === idx;
            return (
              <button key={i} onClick={() => goToWord(i)} disabled={i > words.length}
                className={`flex items-center gap-2 px-2.5 border-2 border-black text-left overflow-hidden ${active ? 'bg-black text-[#838383]' : ''} ${i <= words.length ? PRESS : ''}`}>
                <span className="font-sans text-[11px] font-bold tabular-nums flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-[15px] font-bold lowercase truncate">{filled ? words[i] : ''}</span>
              </button>
            );
          })}
        </div>
      </div>
      {/* input */}
      <div className="px-5 pb-1.5 flex-shrink-0">
        <div className="h-10 border-2 border-black flex items-center px-3">
          <span className="text-lg font-bold tracking-wide" style={{ fontFamily: 'ui-monospace, monospace' }}>{prefix}</span>
          <span className="w-0.5 h-5 bg-black ml-1" />
        </div>
      </div>
      <div className="flex-1 min-h-0" />
      {/* suggestion bar — 3 across, no scroll (tap = confirm word) */}
      <div className="h-[50px] flex items-stretch gap-1.5 px-3 flex-shrink-0">
        {suggestions.length > 0 ? suggestions.map(w => (
          <button key={w} onClick={() => commit(w)} className={`flex-1 min-w-0 border-2 border-black flex items-center justify-center px-1 ${PRESS}`}>
            <span className="text-[16px] font-bold lowercase truncate">{w}</span>
          </button>
        )) : (
          <div className="flex-1 flex items-center justify-center font-sans text-[12px] tracking-wide">{prefix ? 'No matching word' : 'Type the word'}</div>
        )}
      </div>
      {/* keyboard */}
      <div className="px-1.5 pb-2 pt-2 mt-1.5 flex flex-col gap-1.5 flex-shrink-0 border-t-2 border-black">
        {KEY_ROWS.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1">
            {row.split('').map(k => {
              const enabled = validNext.has(k);
              return (
                <button key={k} disabled={!enabled} onClick={() => setPrefix(prefix + k)} className={`font-sans h-10 flex-1 max-w-[34px] border-2 border-black text-base font-bold uppercase ${enabled ? PRESS : ''}`}>
                  <span className={enabled ? '' : 'invisible'}>{k}</span>
                </button>
              );
            })}
          </div>
        ))}
        <div className="flex justify-center">
          <button onClick={() => setPrefix(prefix.slice(0, -1))} disabled={!prefix} className={`h-10 px-6 border-2 border-black flex items-center justify-center ${prefix ? PRESS : ''}`} aria-label="Backspace">
            <Delete className={`w-5 h-5 ${prefix ? '' : 'invisible'}`} strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </div>
  );
}
