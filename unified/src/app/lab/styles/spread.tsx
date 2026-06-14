import { useState, useRef, useEffect } from 'react';
import { Check, X, ChevronRight, ChevronLeft, BatteryMedium, Delete } from 'lucide-react';
import type { LabScreen } from '../data';
import { WALLET } from '../data';
import { RECORDS, type Rec, recPrimary, recSub, fmtTs, PHRASE, pickOptions, BIP39, KEY_ROWS } from '../exdata';

/**
 * SPREAD · 杂志跨页 — editorial magazine voice. A clear lead (headline + dek),
 * supporting facts in an asymmetric layout, varied weights. Newsreader serif
 * content, sans metadata, mono machine values. Sign omits the verify code and
 * re-balances the page into a two-column body. 2-tone only; single-tap Confirm.
 */
const SERIF = { fontFamily: "'Newsreader', ui-serif, Georgia, serif" } as const;
const MONO = { fontFamily: "'IBM Plex Mono', ui-monospace, monospace" } as const;
const TX = {
  network: 'Tron', tokenSymbol: 'USDT', amount: '500', fiatValue: '$500.00',
  from: 'TJYeasTPa6gpEEfYqv8q3qyq3qLZ8nLb9p',
  to: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9', toName: 'My Ledger',
  maxFee: '13.5', gasTokenSymbol: 'TRX',
};
const ITEMS = [
  { label: 'Assets', sub: 'Balances & tokens' },
  { label: 'Sign History', sub: 'Signature log' },
  { label: 'Passkey', sub: 'FIDO2 security key' },
  { label: 'Settings', sub: 'Device & security' },
];
function GLabel({ children }: { children: React.ReactNode }) {
  return <div className="font-sans text-[11px] font-bold uppercase tracking-[0.18em]">{children}</div>;
}
function ConfirmBar({ onReject, onConfirm }: { onReject: () => void; onConfirm: () => void }) {
  return (
    <div className="flex border-t-2 border-black flex-shrink-0">
      <button onClick={onReject} aria-label="Reject" className="w-[80px] h-[64px] border-r-2 border-black flex items-center justify-center active:bg-black active:text-[#838383]"><X className="w-7 h-7" strokeWidth={2.5} /></button>
      <button onClick={onConfirm} className="flex-1 h-[64px] bg-black text-[#838383] flex items-center justify-center gap-2.5 active:bg-[#838383] active:text-black"><Check className="w-6 h-6" strokeWidth={2.5} /><span className="font-sans text-base font-bold uppercase tracking-wide">Confirm</span></button>
    </div>
  );
}
function Head({ title, onBack, right }: { title: string; onBack?: () => void; right?: React.ReactNode }) {
  return (
    <div className="h-[46px] px-5 flex items-center gap-2 border-b-2 border-black flex-shrink-0">
      {onBack && <button onClick={onBack} aria-label="Back" className="flex items-center active:bg-black active:text-[#838383] px-1 -mx-1"><ChevronLeft className="w-6 h-6" strokeWidth={2.5} /></button>}
      <span className="text-[20px] font-semibold tracking-tight">{title}</span>
      {right && <span className="ml-auto font-sans text-[12px] font-bold uppercase tracking-wide">{right}</span>}
    </div>
  );
}

export function SpreadStyle({ screen }: { screen: LabScreen }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black" style={SERIF}>
      {screen === 'home' && <Home />}
      {screen === 'sign' && <Sign />}
      {screen === 'history' && <History />}
      {screen === 'seed' && <Seed />}
      {screen === 'verify' && <Verify />}
    </div>
  );
}

function Home() {
  return (
    <>
      <div className="bg-black text-[#838383] px-5 pt-3.5 pb-4 flex-shrink-0">
        <div className="font-sans flex items-center justify-between text-[12px] font-bold uppercase tracking-[0.22em]">
          <span>The Wallet</span>
          <span className="inline-flex items-center gap-1.5 tabular-nums"><BatteryMedium className="w-5 h-5" strokeWidth={2.25} />{WALLET.battery}%</span>
        </div>
        <div className="text-[44px] font-semibold tracking-tight leading-none mt-2">{WALLET.name}</div>
        <div className="font-sans text-[12px] tracking-[0.25em] mt-2">{WALLET.model}</div>
      </div>
      <div className="px-5 pt-2.5 pb-1 flex-shrink-0"><GLabel>Contents</GLabel></div>
      <div className="flex-1 flex flex-col min-h-0">
        {ITEMS.map(m => (
          <button key={m.label} className="flex-1 flex items-center gap-4 px-5 text-left min-h-0 border-t border-black active:bg-black active:text-[#838383]">
            <div className="flex-1 min-w-0"><div className="text-[25px] font-semibold leading-tight truncate">{m.label}</div><div className="font-sans text-[12px] tracking-wide mt-0.5 truncate">{m.sub}</div></div>
            <ChevronRight className="w-6 h-6 flex-shrink-0" strokeWidth={2} />
          </button>
        ))}
      </div>
    </>
  );
}

function Sign() {
  const [status, setStatus] = useState<'idle' | 'signing' | 'success' | 'rejected'>('idle');
  const timer = useRef<number | null>(null);
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);
  const confirm = () => { setStatus('signing'); timer.current = window.setTimeout(() => setStatus('success'), 1400); };
  const reject = () => setStatus('rejected');
  const reset = () => setStatus('idle');

  if (status === 'signing') return <div className="flex-1 flex flex-col items-center justify-center text-center"><div className="font-sans text-[11px] font-bold uppercase tracking-[0.3em]">Processing</div><div className="text-[40px] font-semibold mt-2">Signing…</div></div>;
  if (status === 'success' || status === 'rejected') {
    const ok = status === 'success';
    return (
      <>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <div className={`w-[80px] h-[80px] rounded-full flex items-center justify-center ${ok ? 'bg-black' : 'border-[3px] border-black'}`}>{ok ? <Check className="w-11 h-11 text-[#838383]" strokeWidth={3} /> : <X className="w-11 h-11 text-black" strokeWidth={3} />}</div>
          <div className="text-[34px] font-semibold tracking-tight mt-4">{ok ? 'Signed' : 'Rejected'}</div>
          <div className="font-sans text-[13px] mt-2">{ok ? `${TX.amount} ${TX.tokenSymbol} → ${TX.toName}` : 'Nothing was sent'}</div>
        </div>
        <button onClick={reset} className="font-sans h-[60px] w-full border-t-2 border-black text-[14px] font-bold uppercase tracking-[0.2em] active:bg-black active:text-[#838383]">Again</button>
      </>
    );
  }
  return (
    <>
      <Head title="Confirm Send" />
      <div className="flex-1 px-6 flex flex-col min-h-0">
        {/* lead */}
        <div className="pt-4 flex-shrink-0">
          <GLabel>Amount</GLabel>
          <div className="flex items-baseline gap-2 mt-0.5"><span className="text-[64px] font-semibold leading-[0.82] tracking-tight">{TX.amount}</span><span className="font-sans text-2xl font-bold uppercase">{TX.tokenSymbol}</span></div>
          <div className="text-[21px] mt-1.5">to <span className="font-semibold">{TX.toName}</span> · {TX.fiatValue}</div>
        </div>
        <div className="h-[2px] bg-black my-3.5 flex-shrink-0" />
        {/* two-column body fills the page without the code */}
        <div className="flex-1 grid grid-cols-2 gap-x-5 min-h-0 pb-3">
          <div className="flex flex-col justify-center gap-6">
            <div><GLabel>From</GLabel><div className="text-[14px] break-all leading-snug mt-1" style={MONO}>{TX.from}</div></div>
            <div><GLabel>To · {TX.toName}</GLabel><div className="text-[14px] break-all leading-snug mt-1" style={MONO}>{TX.to}</div></div>
          </div>
          <div className="flex flex-col justify-center gap-6">
            <div><GLabel>Network</GLabel><div className="text-[22px] font-semibold leading-tight mt-0.5">{TX.network}</div></div>
            <div><GLabel>Network fee</GLabel><div className="text-[22px] font-semibold leading-tight mt-0.5" style={MONO}>{TX.maxFee} {TX.gasTokenSymbol}</div></div>
            <div><GLabel>Value</GLabel><div className="text-[22px] font-semibold leading-tight mt-0.5">{TX.fiatValue}</div></div>
          </div>
        </div>
      </div>
      <ConfirmBar onReject={reject} onConfirm={confirm} />
    </>
  );
}

function History() {
  const [page, setPage] = useState(0);
  const [sel, setSel] = useState<Rec | null>(null);
  const per = 4; const pages = Math.ceil(RECORDS.length / per); const sp = Math.min(page, pages - 1);
  const rows = RECORDS.slice(sp * per, sp * per + per);
  if (sel) return <Detail r={sel} onBack={() => setSel(null)} />;
  return (
    <>
      <div className="px-5 pt-3.5 pb-2.5 flex items-baseline justify-between border-b-2 border-black flex-shrink-0">
        <span className="text-[26px] font-semibold tracking-tight leading-none">Sign History</span>
        <span className="font-sans text-[12px] font-bold uppercase tracking-wide">{RECORDS.length} entries</span>
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        {rows.map(r => (
          <button key={r.id} onClick={() => setSel(r)} className="flex-1 flex items-center gap-3 px-5 text-left min-h-0 border-t border-black active:bg-black active:text-[#838383]">
            <div className="flex-1 min-w-0">
              <div className="text-[22px] font-semibold leading-tight truncate">{recPrimary(r)}</div>
              <div className="font-sans text-[12px] tracking-wide truncate mt-0.5">{recSub(r)} · {fmtTs(r.timestamp)}</div>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0"><span className="font-sans text-[11px] font-bold tracking-wide">{r.status === 'completed' ? 'SIGNED' : 'REJECTED'}</span><ChevronRight className="w-5 h-5" strokeWidth={2.25} /></div>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 items-center border-t-2 border-black h-11 flex-shrink-0 font-sans text-[13px] font-bold uppercase tracking-wide">
        <button onClick={() => setPage(Math.max(0, sp - 1))} className={`h-full pl-4 text-left ${sp > 0 ? 'active:bg-black active:text-[#838383]' : 'invisible'}`}>‹ Prev</button>
        <span className="text-center tracking-[0.2em]">{sp + 1} / {pages}</span>
        <button onClick={() => setPage(Math.min(pages - 1, sp + 1))} className={`h-full pr-4 text-right ${sp < pages - 1 ? 'active:bg-black active:text-[#838383]' : 'invisible'}`}>Next ›</button>
      </div>
    </>
  );
}
function Detail({ r, onBack }: { r: Rec; onBack: () => void }) {
  return (
    <>
      <Head title="Signature" onBack={onBack} right={r.status === 'completed' ? 'Signed' : 'Rejected'} />
      <div className="px-5 pt-4 pb-3 border-b-2 border-black flex-shrink-0">
        <div className="text-[34px] font-semibold leading-none">{recPrimary(r)}</div>
        <div className="font-sans text-[12px] mt-1.5">{fmtTs(r.timestamp)}</div>
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        {([['Type', r.type], ['Network', r.network], ...(r.usdValue !== '0' ? [['Value', `$${r.usdValue}`]] : []), ['Result', r.status === 'completed' ? 'Signed' : 'Rejected']] as [string, string][]).map(([k, v]) => (
          <div key={k} className="flex-1 flex items-center justify-between gap-3 px-5 border-t border-black min-h-0 first:border-t-0">
            <GLabel>{k}</GLabel><span className="text-[18px] font-semibold capitalize">{v}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function Seed() {
  const [i, setI] = useState(0); const [err, setErr] = useState(false); const [done, setDone] = useState(false);
  const count = PHRASE.length;
  if (done) {
    return (
      <>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <div className="w-[80px] h-[80px] rounded-full bg-black flex items-center justify-center"><Check className="w-11 h-11 text-[#838383]" strokeWidth={3} /></div>
          <div className="text-[30px] font-semibold mt-4">All confirmed</div>
          <div className="font-sans text-[14px] mt-2">Your recovery phrase is correct.</div>
        </div>
        <button onClick={() => { setI(0); setDone(false); setErr(false); }} className="font-sans h-[60px] w-full border-t-2 border-black text-[14px] font-bold uppercase tracking-[0.2em] active:bg-black active:text-[#838383]">Restart</button>
      </>
    );
  }
  const correct = PHRASE[i]; const opts = pickOptions(correct, i);
  const pick = (w: string) => { if (w === correct) { setErr(false); i + 1 >= count ? setDone(true) : setI(i + 1); } else setErr(true); };
  return (
    <>
      <Head title="Confirm Phrase" right={`${i + 1} / ${count}`} />
      <div className="px-6 pt-4 flex-shrink-0">
        <div className="text-[26px] font-semibold">Select word no.{i + 1}</div>
        <div className="font-sans text-[12px] font-bold uppercase tracking-[0.15em] h-5 mt-1">{err ? 'No match · try again' : 'Pick the next word'}</div>
      </div>
      <div className="flex-1 flex flex-col min-h-0 border-t-2 border-black mt-2">
        {opts.map(w => (
          <button key={w} onClick={() => pick(w)} className="flex-1 flex items-center px-6 text-left min-h-0 border-b border-black last:border-b-0 active:bg-black active:text-[#838383]">
            <span className="text-[27px] font-semibold lowercase">{w}</span>
          </button>
        ))}
      </div>
    </>
  );
}

function Verify() {
  type Step = 'len' | 'input' | 'result';
  const [step, setStep] = useState<Step>('len');
  const [count, setCount] = useState(12);
  const [words, setWords] = useState<string[]>([]);
  const [prefix, setPrefix] = useState('');
  const idx = words.length;
  const commit = (w: string) => { const n = [...words, w]; setWords(n); setPrefix(''); if (n.length >= count) setStep('result'); };

  if (step === 'len') {
    return (
      <>
        <Head title="Verify Phrase" />
        <div className="px-6 pt-5 flex-shrink-0"><h2 className="text-[27px] font-semibold leading-snug">Pick your phrase length</h2></div>
        <div className="flex-1 flex flex-col border-t-2 border-black mt-5 min-h-0">
          {[12, 24].map(n => (
            <button key={n} onClick={() => { setCount(n); setStep('input'); }} className="flex-1 w-full flex items-center justify-between px-6 border-b border-black last:border-b-0 active:bg-black active:text-[#838383]">
              <span className="text-[48px] font-semibold tabular-nums">{n}</span><span className="font-sans text-base font-bold uppercase tracking-[0.2em]">words ›</span>
            </button>
          ))}
        </div>
      </>
    );
  }
  if (step === 'result') {
    return (
      <>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <div className="w-[80px] h-[80px] rounded-full bg-black flex items-center justify-center"><Check className="w-11 h-11 text-[#838383]" strokeWidth={3} /></div>
          <div className="text-[30px] font-semibold mt-4">Verified</div>
          <div className="font-sans text-[14px] mt-2">All {count} words entered.</div>
        </div>
        <button onClick={() => { setStep('len'); setWords([]); setPrefix(''); }} className="font-sans h-[60px] w-full border-t-2 border-black text-[14px] font-bold uppercase tracking-[0.2em] active:bg-black active:text-[#838383]">Again</button>
      </>
    );
  }
  const sugg = prefix ? BIP39.filter(w => w.startsWith(prefix)).slice(0, 3) : [];
  const valid = new Set(BIP39.filter(w => w.startsWith(prefix)).map(w => w[prefix.length]).filter(Boolean));
  return (
    <>
      <Head title={`Word ${idx + 1}`} right={`${idx + 1} / ${count}`} />
      <div className="px-6 pt-4 flex-shrink-0">
        <div className="border-b-2 border-black pb-2 flex items-end"><span className="flex-1 text-[28px] font-semibold break-all" style={MONO}>{prefix}</span><span className="w-0.5 h-7 bg-black ml-1 mb-1" /></div>
      </div>
      <div className="flex-1 min-h-0" />
      <div className="h-[46px] flex items-stretch border-t border-black flex-shrink-0">
        {sugg.length ? sugg.map((w, si) => <button key={w} onClick={() => commit(w)} className={`flex-1 flex items-center justify-center ${si > 0 ? 'border-l border-black' : ''} active:bg-black active:text-[#838383]`}><span className="text-[19px] font-semibold lowercase">{w}</span></button>) : <div className="flex-1 flex items-center justify-center font-sans text-[13px] tracking-wide">{prefix ? 'No matching word' : 'Type the word'}</div>}
      </div>
      <div className="px-1.5 pb-2 pt-2 flex flex-col gap-1.5 flex-shrink-0 border-t-2 border-black">
        {KEY_ROWS.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1">
            {row.split('').map(k => { const en = valid.has(k); return <button key={k} disabled={!en} onClick={() => setPrefix(prefix + k)} className={`font-sans h-11 flex-1 max-w-[36px] border border-black text-[18px] font-bold uppercase ${en ? 'active:bg-black active:text-[#838383]' : ''}`}><span className={en ? '' : 'invisible'}>{k}</span></button>; })}
          </div>
        ))}
        <div className="flex justify-center"><button onClick={() => setPrefix(prefix.slice(0, -1))} disabled={!prefix} className={`h-11 px-7 border border-black flex items-center justify-center ${prefix ? 'active:bg-black active:text-[#838383]' : ''}`} aria-label="Backspace"><Delete className={`w-6 h-6 ${prefix ? '' : 'invisible'}`} strokeWidth={2.25} /></button></div>
      </div>
    </>
  );
}
