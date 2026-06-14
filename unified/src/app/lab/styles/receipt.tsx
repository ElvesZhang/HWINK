import { useState, useRef, useEffect } from 'react';
import { Check, X, Delete } from 'lucide-react';
import type { LabScreen } from '../data';
import { WALLET } from '../data';
import { RECORDS, type Rec, recPrimary, recSub, PHRASE, pickOptions, BIP39, KEY_ROWS } from '../exdata';

/**
 * RECEIPT · 票据/凭证 — thermal-receipt voice: monospace, centered, perforated zone
 * dividers, total-first hierarchy, stamped codes. Type sized up for the 3-inch
 * panel (content ≥ 18px). IBM Plex Mono. 2-tone only; single-tap Confirm.
 */
const MONO = { fontFamily: "'IBM Plex Mono', ui-monospace, monospace" } as const;
const TX = {
  network: 'Tron', tokenSymbol: 'USDT', amount: '500', fiatValue: '$500.00',
  from: 'TJYeasTPa6gpEEfYqv8q3qyq3qLZ8nLb9p',
  to: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9', toName: 'My Ledger',
  maxFee: '13.5', gasTokenSymbol: 'TRX', verifyCode: '748392',
};
const NAV = ['Assets', 'History', 'Settings'];

function Perf() {
  return <div className="flex justify-center items-center gap-[5px] h-3 flex-shrink-0 overflow-hidden">{Array.from({ length: 26 }).map((_, i) => <span key={i} className="w-[3px] h-[3px] bg-black" />)}</div>;
}
function Line({ k, v }: { k: string; v: string }) {
  return <div className="flex items-baseline justify-between gap-3"><span className="text-[16px] font-bold">{k}</span><span className="text-[20px] font-bold text-right">{v}</span></div>;
}
function ConfirmBar({ onReject, onConfirm }: { onReject: () => void; onConfirm: () => void }) {
  return (
    <div className="flex border-t-2 border-black flex-shrink-0" style={MONO}>
      <button onClick={onReject} aria-label="Reject" className="w-[84px] h-[66px] border-r-2 border-black flex items-center justify-center active:bg-black active:text-[#838383]"><X className="w-7 h-7" strokeWidth={2.75} /></button>
      <button onClick={onConfirm} className="flex-1 h-[66px] bg-black text-[#838383] flex items-center justify-center gap-2.5 active:bg-[#838383] active:text-black"><Check className="w-6 h-6" strokeWidth={2.75} /><span className="text-lg font-bold uppercase tracking-[0.15em]">Confirm</span></button>
    </div>
  );
}

export function ReceiptStyle({ screen }: { screen: LabScreen }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black" style={MONO}>
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
      <div className="text-center pt-4 pb-2 flex-shrink-0">
        <div className="text-[14px] font-bold tracking-[0.25em]">SAFEPAL · OBSIDIAN</div>
        <div className="text-[14px] tracking-[0.2em] mt-0.5">BATTERY {WALLET.battery}%</div>
      </div>
      <Perf />
      <div className="text-center px-5 py-5 flex-shrink-0">
        <div className="text-[14px] font-bold tracking-[0.25em]">WALLET</div>
        <div className="text-[36px] font-bold tracking-tight mt-1">{WALLET.name}</div>
      </div>
      <Perf />
      <div className="flex-1 flex flex-col min-h-0">
        {NAV.map((n, i) => (
          <button key={n} className={`flex-1 flex items-center justify-between px-6 ${i > 0 ? 'border-t border-black' : ''} active:bg-black active:text-[#838383]`}>
            <span className="text-[22px] font-bold">{n}</span><span className="text-[20px] font-bold">›</span>
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

  if (status === 'signing') return <div className="flex-1 flex flex-col items-center justify-center text-center"><div className="text-[14px] font-bold tracking-[0.3em]">PROCESSING</div><div className="text-[38px] font-bold mt-2">SIGNING…</div></div>;
  if (status === 'success' || status === 'rejected') {
    const ok = status === 'success';
    return (
      <>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <div className={`w-[80px] h-[80px] border-2 border-black flex items-center justify-center ${ok ? 'bg-black' : ''}`}>{ok ? <Check className="w-11 h-11 text-[#838383]" strokeWidth={3} /> : <X className="w-11 h-11 text-black" strokeWidth={3} />}</div>
          <div className="text-[32px] font-bold tracking-tight mt-4">{ok ? 'SIGNED' : 'REJECTED'}</div>
          <div className="text-[16px] mt-2">{ok ? `${TX.amount} ${TX.tokenSymbol} → ${TX.toName}` : 'NOTHING WAS SENT'}</div>
        </div>
        <button onClick={reset} className="h-[62px] w-full border-t-2 border-black text-[17px] font-bold uppercase tracking-[0.18em] active:bg-black active:text-[#838383]">Again</button>
      </>
    );
  }
  return (
    <>
      <div className="text-center pt-3 pb-1.5 flex-shrink-0 text-[14px] font-bold tracking-[0.25em]">SAFEPAL · SIGN</div>
      <Perf />
      <div className="text-center px-5 py-3 flex-shrink-0">
        <div className="text-[14px] font-bold tracking-[0.2em]">AMOUNT</div>
        <div className="text-[58px] font-bold leading-none mt-1">{TX.amount}</div>
        <div className="text-[20px] font-bold">{TX.tokenSymbol}</div>
        <div className="text-[18px] mt-1">{TX.fiatValue}</div>
      </div>
      <Perf />
      <div className="flex-1 px-6 py-3 min-h-0 flex flex-col justify-center gap-2">
        <Line k="PAYEE" v={TX.toName} />
        <div className="break-all text-[16px] leading-snug">{TX.to}</div>
        <Line k="NETWORK" v={TX.network} />
        <Line k="FEE" v={`${TX.maxFee} ${TX.gasTokenSymbol}`} />
      </div>
      <Perf />
      <div className="px-6 py-2.5 flex items-center justify-between flex-shrink-0">
        <span className="text-[16px] font-bold tracking-[0.2em]">AUTH</span>
        <span className="text-[30px] font-bold tracking-[0.15em] border-2 border-black px-3 py-0.5">{TX.verifyCode}</span>
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
      <div className="text-center pt-3 pb-1.5 flex-shrink-0 text-[14px] font-bold tracking-[0.25em]">SAFEPAL · LOG &nbsp;({RECORDS.length})</div>
      <Perf />
      <div className="flex-1 flex flex-col min-h-0">
        {rows.map((r, i) => (
          <button key={r.id} onClick={() => setSel(r)} className={`flex-1 px-5 text-left flex flex-col justify-center min-h-0 ${i > 0 ? 'border-t border-black' : ''} active:bg-black active:text-[#838383]`}>
            <div className="flex items-baseline justify-between gap-2"><span className="text-[20px] font-bold truncate">{recPrimary(r)}</span><span className="text-[14px] font-bold flex-shrink-0">{r.status === 'completed' ? 'SIGNED' : 'REJECTED'}</span></div>
            <div className="text-[15px] truncate mt-0.5">{recSub(r)}</div>
            <div className="text-[13px] mt-0.5">{r.timestamp}</div>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 items-center border-t-2 border-black h-12 flex-shrink-0 text-[15px] font-bold uppercase">
        <button onClick={() => setPage(Math.max(0, sp - 1))} className={`h-full ${sp > 0 ? 'active:bg-black active:text-[#838383]' : 'invisible'}`}>‹ Prev</button>
        <span className="text-center tracking-[0.15em]">{sp + 1}/{pages}</span>
        <button onClick={() => setPage(Math.min(pages - 1, sp + 1))} className={`h-full ${sp < pages - 1 ? 'active:bg-black active:text-[#838383]' : 'invisible'}`}>Next ›</button>
      </div>
    </>
  );
}
function Detail({ r, onBack }: { r: Rec; onBack: () => void }) {
  return (
    <>
      <div className="h-[46px] px-4 flex items-center gap-2 border-b-2 border-black flex-shrink-0">
        <button onClick={onBack} aria-label="Back" className="text-[20px] font-bold active:bg-black active:text-[#838383] px-1">←</button>
        <span className="text-[16px] font-bold uppercase tracking-[0.18em]">{r.status === 'completed' ? 'Signed' : 'Rejected'}</span>
      </div>
      <Perf />
      <div className="flex-1 px-6 py-3 flex flex-col justify-center gap-2.5 min-h-0">
        <Line k="ITEM" v={recPrimary(r)} />
        <Line k="TYPE" v={r.type.toUpperCase()} />
        <Line k="NETWORK" v={r.network} />
        {r.usdValue !== '0' && <Line k="VALUE" v={`$${r.usdValue}`} />}
        <div className="text-[15px] mt-1">{r.timestamp}</div>
      </div>
      <Perf />
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
          <div className="w-[80px] h-[80px] bg-black border-2 border-black flex items-center justify-center"><Check className="w-11 h-11 text-[#838383]" strokeWidth={3} /></div>
          <div className="text-[28px] font-bold mt-4">ALL CONFIRMED</div>
          <div className="text-[16px] mt-2">Phrase written down correctly.</div>
        </div>
        <button onClick={() => { setI(0); setDone(false); setErr(false); }} className="h-[60px] w-full border-t-2 border-black text-[16px] font-bold uppercase tracking-[0.18em] active:bg-black active:text-[#838383]">Restart</button>
      </>
    );
  }
  const correct = PHRASE[i]; const opts = pickOptions(correct, i);
  const pick = (w: string) => { if (w === correct) { setErr(false); i + 1 >= count ? setDone(true) : setI(i + 1); } else setErr(true); };
  return (
    <>
      <div className="text-center pt-3 pb-1.5 flex-shrink-0 text-[14px] font-bold tracking-[0.2em]">CONFIRM PHRASE · {i + 1}/{count}</div>
      <Perf />
      <div className="text-center pt-3 flex-shrink-0 text-[20px] font-bold">SELECT WORD No.{i + 1}</div>
      <div className="text-center h-6 mt-1 flex-shrink-0 text-[14px] font-bold tracking-[0.15em]">{err ? 'NO MATCH · TRY AGAIN' : ''}</div>
      <div className="flex-1 flex flex-col min-h-0 mt-1">
        {opts.map((w, oi) => (
          <button key={w} onClick={() => pick(w)} className={`flex-1 flex items-center gap-4 px-6 text-left min-h-0 border-t border-black active:bg-black active:text-[#838383]`}>
            <span className="text-[16px] font-bold w-6">{'ABCD'[oi]}</span><span className="text-[24px] font-bold lowercase">{w}</span>
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
        <div className="text-center pt-4 pb-2 flex-shrink-0 text-[14px] font-bold tracking-[0.2em]">VERIFY PHRASE</div>
        <Perf />
        <div className="text-center pt-5 flex-shrink-0 text-[20px] font-bold px-6">PHRASE LENGTH?</div>
        <div className="flex-1 flex flex-col justify-center gap-4 px-8 min-h-0">
          {[12, 24].map(n => (
            <button key={n} onClick={() => { setCount(n); setStep('input'); }} className="h-[64px] border-2 border-black flex items-center justify-between px-6 active:bg-black active:text-[#838383]">
              <span className="text-[40px] font-bold">{n}</span><span className="text-[18px] font-bold uppercase tracking-[0.15em]">words ›</span>
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
          <div className="w-[80px] h-[80px] bg-black border-2 border-black flex items-center justify-center"><Check className="w-11 h-11 text-[#838383]" strokeWidth={3} /></div>
          <div className="text-[28px] font-bold mt-4">VERIFIED</div>
          <div className="text-[16px] mt-2">All {count} words entered.</div>
        </div>
        <button onClick={() => { setStep('len'); setWords([]); setPrefix(''); }} className="h-[60px] w-full border-t-2 border-black text-[16px] font-bold uppercase tracking-[0.18em] active:bg-black active:text-[#838383]">Again</button>
      </>
    );
  }
  const sugg = prefix ? BIP39.filter(w => w.startsWith(prefix)).slice(0, 3) : [];
  const valid = new Set(BIP39.filter(w => w.startsWith(prefix)).map(w => w[prefix.length]).filter(Boolean));
  return (
    <>
      <div className="h-[44px] px-4 flex items-center justify-between border-b-2 border-black flex-shrink-0 text-[15px] font-bold uppercase tracking-[0.15em]"><span>WORD {idx + 1}</span><span>{idx + 1}/{count}</span></div>
      <div className="px-5 pt-4 flex-shrink-0">
        <div className="border-b-2 border-black pb-2 flex items-center"><span className="text-[26px] font-bold break-all">{prefix}</span><span className="w-0.5 h-7 bg-black ml-1" /></div>
      </div>
      <div className="flex-1 min-h-0" />
      <div className="h-[46px] flex items-stretch border-t border-black flex-shrink-0">
        {sugg.length ? sugg.map((w, si) => <button key={w} onClick={() => commit(w)} className={`flex-1 flex items-center justify-center ${si > 0 ? 'border-l border-black' : ''} active:bg-black active:text-[#838383]`}><span className="text-[18px] font-bold lowercase">{w}</span></button>) : <div className="flex-1 flex items-center justify-center text-[14px] font-bold">{prefix ? 'NO MATCH' : 'TYPE THE WORD'}</div>}
      </div>
      <div className="px-1.5 pb-2 pt-2 flex flex-col gap-1.5 flex-shrink-0 border-t-2 border-black">
        {KEY_ROWS.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1">
            {row.split('').map(k => { const en = valid.has(k); return <button key={k} disabled={!en} onClick={() => setPrefix(prefix + k)} className={`h-11 flex-1 max-w-[36px] border border-black text-[18px] font-bold uppercase ${en ? 'active:bg-black active:text-[#838383]' : ''}`}><span className={en ? '' : 'invisible'}>{k}</span></button>; })}
          </div>
        ))}
        <div className="flex justify-center"><button onClick={() => setPrefix(prefix.slice(0, -1))} disabled={!prefix} className={`h-11 px-7 border border-black flex items-center justify-center ${prefix ? 'active:bg-black active:text-[#838383]' : ''}`} aria-label="Backspace"><Delete className={`w-6 h-6 ${prefix ? '' : 'invisible'}`} strokeWidth={2.25} /></button></div>
      </div>
    </>
  );
}
