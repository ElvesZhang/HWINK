import { useState, useRef, useEffect } from 'react';
import { Check, X, BatteryMedium, ArrowRight } from 'lucide-react';
import type { LabScreen } from '../data';
import { WALLET } from '../data';

/**
 * POSTER · 海报/粗野 — extreme scale contrast as hierarchy. The amount is a poster
 * headline (≈half the screen); recipient is the bold sub; everything else shrinks
 * to a fine-print footer. Verify code kept as a clear second focus, not buried.
 * Heavy Hanken Grotesk. 2-tone only; single-tap Confirm.
 */
const UI = { fontFamily: "'Hanken Grotesk', ui-sans-serif, system-ui, sans-serif" } as const;
const MONO = { fontFamily: "'IBM Plex Mono', ui-monospace, monospace" } as const;
const TX = {
  network: 'Tron', tokenSymbol: 'USDT', amount: '500', fiatValue: '$500.00',
  from: 'TJYeasTPa6gpEEfYqv8q3qyq3qLZ8nLb9p',
  to: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9', toName: 'My Ledger',
  maxFee: '13.5', gasTokenSymbol: 'TRX', verifyCode: '748392',
};
const NAV = ['Assets', 'History', 'Settings'];

export function PosterStyle({ screen }: { screen: LabScreen }) {
  if (screen === 'home') return <Home />;
  if (screen === 'sign') return <Sign />;
  return <Placeholder />;
}
function Placeholder() {
  return <div className="flex-1 flex items-center justify-center text-black text-[15px] font-extrabold uppercase tracking-[0.2em]" style={UI}>Home &amp; Sign</div>;
}
function ConfirmBar({ onReject, onConfirm }: { onReject: () => void; onConfirm: () => void }) {
  return (
    <div className="flex border-t-2 border-black flex-shrink-0">
      <button onClick={onReject} aria-label="Reject" className="w-[84px] h-[70px] border-r-2 border-black flex items-center justify-center active:bg-black active:text-[#838383]"><X className="w-8 h-8" strokeWidth={2.75} /></button>
      <button onClick={onConfirm} className="flex-1 h-[70px] bg-black text-[#838383] flex items-center justify-center gap-2.5 active:bg-[#838383] active:text-black"><Check className="w-7 h-7" strokeWidth={2.75} /><span className="text-xl font-extrabold uppercase tracking-wide">Confirm</span></button>
    </div>
  );
}

function Home() {
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black" style={UI}>
      <div className="h-[44px] px-5 flex items-center justify-between flex-shrink-0">
        <span className="text-[13px] font-extrabold uppercase tracking-[0.25em]">Wallet</span>
        <span className="text-[13px] font-bold inline-flex items-center gap-1.5 tabular-nums"><BatteryMedium className="w-5 h-5" strokeWidth={2.5} />{WALLET.battery}%</span>
      </div>
      <div className="flex-1 flex flex-col justify-end px-5 pb-5 min-h-0">
        <div className="text-[66px] font-extrabold leading-[0.82] tracking-tighter break-words">{WALLET.name}</div>
        <div className="text-[14px] font-bold uppercase tracking-[0.22em] mt-2">{WALLET.model}</div>
      </div>
      <div className="flex border-t-2 border-black flex-shrink-0 h-[60px]">
        {NAV.map((n, i) => (
          <button key={n} className={`flex-1 flex items-center justify-center ${i > 0 ? 'border-l-2 border-black' : ''} text-[15px] font-extrabold uppercase tracking-wide active:bg-black active:text-[#838383]`}>{n}</button>
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

  if (status === 'signing') return <div className="flex-1 flex flex-col items-center justify-center text-center text-black" style={UI}><div className="text-[15px] font-bold uppercase tracking-[0.3em]">Processing</div><div className="text-[52px] font-extrabold tracking-tight mt-2">Signing…</div></div>;
  if (status === 'success' || status === 'rejected') {
    const ok = status === 'success';
    return (
      <div className="flex-1 flex flex-col min-h-0 text-black" style={UI}>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <div className={`w-[88px] h-[88px] flex items-center justify-center ${ok ? 'bg-black' : 'border-[4px] border-black'}`}>{ok ? <Check className="w-12 h-12 text-[#838383]" strokeWidth={3} /> : <X className="w-12 h-12 text-black" strokeWidth={3} />}</div>
          <div className="text-[44px] font-extrabold tracking-tight mt-5">{ok ? 'Signed' : 'Rejected'}</div>
          <div className="text-[15px] font-bold mt-2">{ok ? `${TX.amount} ${TX.tokenSymbol} → ${TX.toName}` : 'Nothing was sent'}</div>
        </div>
        <button onClick={reset} className="h-[64px] w-full border-t-2 border-black text-lg font-extrabold uppercase tracking-[0.15em] active:bg-black active:text-[#838383]">Again</button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 text-black" style={UI}>
      <div className="px-5 pt-3 flex items-baseline justify-between flex-shrink-0">
        <span className="text-[14px] font-extrabold uppercase tracking-[0.25em]">Send</span>
        <span className="text-[13px] font-bold uppercase">{TX.network}</span>
      </div>
      {/* HERO — amount as poster headline */}
      <div className="flex-1 flex flex-col justify-center px-5 min-h-0">
        <div className="flex items-end gap-2">
          <span className="text-[116px] font-extrabold leading-[0.78] tracking-tighter">{TX.amount}</span>
          <span className="text-[30px] font-extrabold uppercase leading-none pb-3">{TX.tokenSymbol}</span>
        </div>
        <div className="text-[18px] font-bold mt-3">{TX.fiatValue} &nbsp;·&nbsp; → {TX.toName}</div>
      </div>
      {/* verify code — second focus */}
      <div className="flex items-center justify-between px-5 h-[50px] border-t-2 border-black flex-shrink-0">
        <span className="text-[12px] font-extrabold uppercase tracking-[0.2em]">Verify</span>
        <span className="text-[28px] font-bold tracking-[0.12em]" style={MONO}>{TX.verifyCode}</span>
      </div>
      {/* fine print */}
      <div className="px-5 py-2 border-t border-black flex-shrink-0 text-[11px] font-bold leading-relaxed" style={MONO}>
        <div className="break-all">TO {TX.to}</div>
        <div>NET {TX.network} · FEE {TX.maxFee} {TX.gasTokenSymbol}</div>
      </div>
      <ConfirmBar onReject={reject} onConfirm={confirm} />
    </div>
  );
}
