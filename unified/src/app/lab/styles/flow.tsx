import { useState, useRef, useEffect } from 'react';
import { Check, X, ArrowRight, BatteryMedium } from 'lucide-react';
import type { LabScreen } from '../data';
import { WALLET } from '../data';

/**
 * FLOW · 流向图/蓝图 — an engineering-schematic voice. The transaction is drawn as
 * a FROM → TO flow: the connector + amount is the hero (relational hierarchy),
 * supporting facts hang off it as leader-line annotations. IBM Plex Sans + Mono.
 * 2-tone only; single-tap Confirm.
 */
const UI = { fontFamily: "'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif" } as const;
const MONO = { fontFamily: "'IBM Plex Mono', ui-monospace, monospace" } as const;
const TX = {
  network: 'Tron', tokenSymbol: 'USDT', amount: '500', fiatValue: '$500.00',
  from: 'TJYeasTPa6gpEEfYqv8q3qyq3qLZ8nLb9p',
  to: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9', toName: 'My Ledger',
  maxFee: '13.5', gasTokenSymbol: 'TRX', verifyCode: '748392',
};
const shortAddr = (a: string) => `${a.slice(0, 5)}…${a.slice(-5)}`;
const NAV = [['AST', 'Assets'], ['HIS', 'History'], ['KEY', 'Passkey'], ['SET', 'Settings']];

export function FlowStyle({ screen }: { screen: LabScreen }) {
  if (screen === 'home') return <Home />;
  if (screen === 'sign') return <Sign />;
  return <Placeholder />;
}
function Placeholder() {
  return <div className="flex-1 flex items-center justify-center text-black text-[14px] font-bold uppercase tracking-[0.2em]" style={UI}>Home &amp; Sign</div>;
}
function ConfirmBar({ onReject, onConfirm }: { onReject: () => void; onConfirm: () => void }) {
  return (
    <div className="flex border-t-2 border-black flex-shrink-0">
      <button onClick={onReject} aria-label="Reject" className="w-[84px] h-[66px] border-r-2 border-black flex items-center justify-center active:bg-black active:text-[#838383]"><X className="w-7 h-7" strokeWidth={2.75} /></button>
      <button onClick={onConfirm} className="flex-1 h-[66px] bg-black text-[#838383] flex items-center justify-center gap-2.5 active:bg-[#838383] active:text-black"><Check className="w-6 h-6" strokeWidth={2.75} /><span className="text-lg font-bold uppercase tracking-wide">Confirm</span></button>
    </div>
  );
}
function Anno({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="font-bold" style={MONO}>└─</span>
      <span className="text-[12px] font-bold uppercase tracking-[0.12em]">{k}</span>
      <span className="ml-auto text-[15px] font-bold" style={mono ? MONO : UI}>{v}</span>
    </div>
  );
}

function Home() {
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black" style={UI}>
      {/* drawing title block */}
      <div className="border-b-2 border-black flex-shrink-0">
        <div className="flex">
          <div className="flex-1 px-4 py-2">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em]" style={MONO}>Device</div>
            <div className="text-[24px] font-bold tracking-tight leading-none">{WALLET.name}</div>
          </div>
          <div className="w-[96px] border-l-2 border-black px-3 py-2 flex flex-col justify-center">
            <div className="text-[10px] font-bold" style={MONO}>BAT</div>
            <div className="text-[16px] font-bold inline-flex items-center gap-1" style={MONO}><BatteryMedium className="w-4 h-4" strokeWidth={2.25} />{WALLET.battery}</div>
          </div>
        </div>
      </div>
      <div className="flex-1 grid grid-cols-2 grid-rows-2 min-h-0">
        {NAV.map(([code, label], i) => (
          <button key={label} className={`flex flex-col justify-between p-4 text-left ${i % 2 === 1 ? 'border-l border-black' : ''} ${i >= 2 ? 'border-t border-black' : ''} active:bg-black active:text-[#838383]`}>
            <span className="text-[11px] font-bold" style={MONO}>REF·{code}</span>
            <span className="text-[22px] font-bold leading-tight">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Sign() {
  const [status, setStatus] = useState<'idle' | 'signing' | 'success' | 'rejected'>('idle');
  const timer = useRef<number | null>(null);
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);
  const confirm = () => { setStatus('signing'); timer.current = window.setTimeout(() => setStatus('success'), 1400); };
  const reject = () => setStatus('rejected');
  const reset = () => setStatus('idle');

  if (status === 'signing') return <div className="flex-1 flex flex-col items-center justify-center text-center text-black" style={UI}><div className="text-[11px] font-bold uppercase tracking-[0.3em]" style={MONO}>Processing</div><div className="text-[36px] font-bold mt-2">Signing…</div></div>;
  if (status === 'success' || status === 'rejected') {
    const ok = status === 'success';
    return (
      <div className="flex-1 flex flex-col min-h-0 text-black" style={UI}>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <div className={`w-[80px] h-[80px] border-2 border-black flex items-center justify-center ${ok ? 'bg-black' : ''}`}>{ok ? <Check className="w-11 h-11 text-[#838383]" strokeWidth={3} /> : <X className="w-11 h-11 text-black" strokeWidth={3} />}</div>
          <div className="text-[30px] font-bold tracking-tight mt-4">{ok ? 'Signed' : 'Rejected'}</div>
          <div className="text-[13px] mt-2" style={MONO}>{ok ? `${TX.amount} ${TX.tokenSymbol} → ${TX.toName}` : 'Nothing was sent'}</div>
        </div>
        <button onClick={reset} className="h-[60px] w-full border-t-2 border-black text-base font-bold uppercase tracking-[0.18em] active:bg-black active:text-[#838383]">Again</button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 text-black" style={UI}>
      <div className="h-[42px] px-4 flex items-center justify-between border-b-2 border-black flex-shrink-0">
        <span className="text-[13px] font-bold uppercase tracking-[0.18em]">Confirm Send</span>
        <span className="text-[11px] font-bold" style={MONO}>NET:{TX.network}</span>
      </div>
      {/* flow diagram — hero */}
      <div className="flex-1 flex flex-col justify-center px-4 min-h-0">
        <div className="flex items-stretch gap-2">
          <div className="border-2 border-black px-2.5 py-2 flex flex-col justify-center min-w-[78px]">
            <div className="text-[10px] font-bold" style={MONO}>FROM</div>
            <div className="text-[15px] font-bold leading-tight">You</div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-[34px] font-extrabold leading-none">{TX.amount}</div>
            <div className="text-[13px] font-bold uppercase">{TX.tokenSymbol}</div>
            <div className="w-full flex items-center mt-1"><div className="flex-1 h-[3px] bg-black" /><ArrowRight className="w-6 h-6 -ml-1" strokeWidth={3} /></div>
          </div>
          <div className="border-2 border-black px-2.5 py-2 flex flex-col justify-center min-w-[78px]">
            <div className="text-[10px] font-bold" style={MONO}>TO</div>
            <div className="text-[15px] font-bold leading-tight truncate">{TX.toName}</div>
          </div>
        </div>
        <div className="flex justify-between text-[11px] mt-1.5" style={MONO}><span>{shortAddr(TX.from)}</span><span>{shortAddr(TX.to)}</span></div>
        {/* annotations */}
        <div className="mt-6 flex flex-col gap-2.5">
          <Anno k="Network" v={TX.network} />
          <Anno k="Fee" v={`${TX.maxFee} ${TX.gasTokenSymbol}`} mono />
          <Anno k="Verify" v={TX.verifyCode} mono />
        </div>
      </div>
      <ConfirmBar onReject={reject} onConfirm={confirm} />
    </div>
  );
}
