import { useState, useRef, useEffect } from 'react';
import { ArrowRight, Check, X, BatteryMedium, Coins, History, KeyRound, Settings } from 'lucide-react';
import type { LabScreen } from '../data';
import { WALLET } from '../data';

/**
 * CLARITY · 标识/清晰 — transit-signage legibility. One unmistakable subject per
 * screen, the largest readable type the 3-inch panel allows, hierarchy by SCALE
 * alone, certainty over mood. Embedded Hanken Grotesk (sturdy, open apertures).
 * 2-tone only (black on #838383); on-screen single-tap Confirm.
 */
const UI = { fontFamily: "'Hanken Grotesk', ui-sans-serif, system-ui, sans-serif" } as const;
const MONO = { fontFamily: "'IBM Plex Mono', ui-monospace, monospace" } as const;

const TX = {
  network: 'Tron', tokenSymbol: 'USDT', amount: '500', fiatValue: '$500.00',
  to: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9', toName: 'My Ledger',
  maxFee: '13.5', gasTokenSymbol: 'TRX', verifyCode: '748392',
};
const shortAddr = (a: string) => `${a.slice(0, 6)}…${a.slice(-6)}`;
const ROWS = [
  { label: 'Assets', sub: 'Balances', icon: Coins, primary: true },
  { label: 'Sign History', sub: 'Signature log', icon: History, primary: false },
  { label: 'Passkey', sub: 'FIDO2 key', icon: KeyRound, primary: false },
  { label: 'Settings', sub: 'Device & security', icon: Settings, primary: false },
];

export function ClarityStyle({ screen }: { screen: LabScreen }) {
  if (screen === 'home') return <Home />;
  if (screen === 'sign') return <Sign />;
  return <Placeholder />;
}

function Placeholder() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8 text-black" style={UI}>
      <div className="text-[16px] font-extrabold uppercase tracking-[0.2em]">Home &amp; Sign</div>
      <div className="text-[14px] font-bold mt-2">本次探索仅含 Home 与 Sign</div>
    </div>
  );
}

function Home() {
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black" style={UI}>
      <div className="h-[52px] px-5 flex items-center justify-between border-b-2 border-black flex-shrink-0">
        <span className="text-[19px] font-extrabold tracking-tight">{WALLET.name}</span>
        <span className="inline-flex items-center gap-1.5 text-[15px] font-bold tabular-nums"><BatteryMedium className="w-5 h-5" strokeWidth={2.5} />{WALLET.battery}%</span>
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        {ROWS.map((r, i) => (
          <button key={r.label} className={`flex-1 flex items-center gap-4 px-5 text-left min-h-0 ${i > 0 ? 'border-t-2 border-black' : ''} ${r.primary ? 'bg-black text-[#838383] active:bg-[#838383] active:text-black' : 'active:bg-black active:text-[#838383]'}`}>
            <r.icon className="w-9 h-9 flex-shrink-0" strokeWidth={2.25} />
            <div className="flex-1 min-w-0">
              <div className="text-[30px] font-extrabold leading-[0.95] truncate">{r.label}</div>
              <div className="text-[13px] font-bold uppercase tracking-[0.12em] mt-0.5 truncate">{r.sub}</div>
            </div>
            <ArrowRight className="w-8 h-8 flex-shrink-0" strokeWidth={2.5} />
          </button>
        ))}
      </div>
    </div>
  );
}

function ConfirmBar({ onReject, onConfirm }: { onReject: () => void; onConfirm: () => void }) {
  return (
    <div className="flex border-t-2 border-black flex-shrink-0">
      <button onClick={onReject} aria-label="Reject" className="w-[88px] h-[72px] border-r-2 border-black flex items-center justify-center active:bg-black active:text-[#838383]">
        <X className="w-8 h-8" strokeWidth={2.75} />
      </button>
      <button onClick={onConfirm} className="flex-1 h-[72px] bg-black text-[#838383] flex items-center justify-center gap-2.5 active:bg-[#838383] active:text-black">
        <Check className="w-7 h-7" strokeWidth={2.75} />
        <span className="text-xl font-extrabold uppercase tracking-wide">Confirm</span>
      </button>
    </div>
  );
}

function Sign() {
  const [showOverview, setShowOverview] = useState(false);
  const [status, setStatus] = useState<'idle' | 'signing' | 'success' | 'rejected'>('idle');
  const timer = useRef<number | null>(null);
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);
  const confirm = () => { setStatus('signing'); timer.current = window.setTimeout(() => setStatus('success'), 1400); };
  const reject = () => setStatus('rejected');
  const reset = () => { setStatus('idle'); setShowOverview(false); };

  if (status === 'signing') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 text-black" style={UI}>
        <div className="text-[15px] font-bold uppercase tracking-[0.3em]">Processing</div>
        <div className="text-[46px] font-extrabold tracking-tight mt-2">Signing…</div>
      </div>
    );
  }
  if (status === 'success' || status === 'rejected') {
    const ok = status === 'success';
    return (
      <div className="flex-1 flex flex-col min-h-0 text-black" style={UI}>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <div className={`w-[88px] h-[88px] flex items-center justify-center ${ok ? 'bg-black' : 'border-[4px] border-black'}`}>
            {ok ? <Check className="w-12 h-12 text-[#838383]" strokeWidth={3} /> : <X className="w-12 h-12 text-black" strokeWidth={3} />}
          </div>
          <div className="text-[40px] font-extrabold tracking-tight mt-5">{ok ? 'Signed' : 'Rejected'}</div>
          <div className="text-[15px] font-bold mt-2">{ok ? `${TX.amount} ${TX.tokenSymbol} → ${TX.toName}` : 'Nothing was sent'}</div>
        </div>
        <button onClick={reset} className="h-[64px] w-full border-t-2 border-black text-lg font-extrabold uppercase tracking-[0.15em] active:bg-black active:text-[#838383]">Again</button>
      </div>
    );
  }

  // Verify-code — the code is the single giant sign (the safety checkpoint)
  if (!showOverview) {
    return (
      <div className="flex-1 flex flex-col min-h-0 text-black" style={UI}>
        <div className="h-[52px] px-5 flex items-center justify-between border-b-2 border-black flex-shrink-0">
          <span className="text-[15px] font-extrabold uppercase tracking-[0.2em]">Verify Code</span>
          <span className="text-[14px] font-bold">{TX.network} · {TX.tokenSymbol}</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-5 min-h-0">
          <div className="text-[72px] font-bold tracking-[0.14em] leading-none" style={MONO}>{TX.verifyCode}</div>
          <p className="text-[16px] font-bold text-center leading-snug mt-7 px-2">Make sure this matches the code in the SafePal app.</p>
        </div>
        <button onClick={() => setShowOverview(true)} className="h-[56px] px-5 flex items-center justify-between border-t-2 border-black flex-shrink-0 active:bg-black active:text-[#838383]">
          <span className="text-[16px] font-bold uppercase tracking-wide">Transaction details</span>
          <ArrowRight className="w-6 h-6" strokeWidth={2.5} />
        </button>
        <ConfirmBar onReject={reject} onConfirm={confirm} />
      </div>
    );
  }

  // Overview — amount is the sign; only the essentials below it
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black" style={UI}>
      <div className="h-[52px] px-5 flex items-center border-b-2 border-black flex-shrink-0">
        <button onClick={() => setShowOverview(false)} aria-label="Back" className="text-[16px] font-bold uppercase tracking-wide active:bg-black active:text-[#838383] -mx-1 px-1">← Send</button>
      </div>
      <div className="px-5 pt-4 pb-4 border-b-2 border-black flex-shrink-0">
        <div className="text-[14px] font-bold uppercase tracking-[0.2em]">Amount</div>
        <div className="flex items-baseline gap-2.5 mt-1">
          <span className="text-[64px] font-extrabold leading-[0.85] tracking-tight">{TX.amount}</span>
          <span className="text-2xl font-extrabold uppercase">{TX.tokenSymbol}</span>
        </div>
        <div className="text-[17px] font-bold mt-1">{TX.fiatValue}</div>
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        {([
          ['To', `${TX.toName}  ${shortAddr(TX.to)}`],
          ['Network', TX.network],
          ['Fee', `${TX.maxFee} ${TX.gasTokenSymbol}`],
        ] as const).map(([k, v], i) => (
          <div key={k} className={`flex-1 flex items-center justify-between gap-3 px-5 min-h-0 ${i > 0 ? 'border-t border-black' : ''}`}>
            <span className="text-[14px] font-bold uppercase tracking-[0.15em] flex-shrink-0">{k}</span>
            <span className="text-[18px] font-bold text-right truncate">{v}</span>
          </div>
        ))}
      </div>
      <ConfirmBar onReject={reject} onConfirm={confirm} />
    </div>
  );
}
