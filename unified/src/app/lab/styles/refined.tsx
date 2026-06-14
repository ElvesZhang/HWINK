import { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Check, X, BatteryMedium } from 'lucide-react';
import type { LabScreen } from '../data';
import { WALLET } from '../data';

/**
 * REFINED · 精炼编辑 — keeps the editorial soul but rebuilt on a screen-optimized
 * serif (Newsreader, sturdier than system Georgia on 1-bit e-ink) with hierarchy
 * recalibrated for the 3-inch physical size and NO decorative numbering. Serif
 * content / sans metadata / mono machine values. 2-tone only; single-tap Confirm.
 */
const SERIF = { fontFamily: "'Newsreader', ui-serif, Georgia, serif" } as const;
const MONO = { fontFamily: "'IBM Plex Mono', ui-monospace, monospace" } as const;

const TX = {
  network: 'Tron', tokenSymbol: 'USDT', amount: '500', fiatValue: '$500.00',
  to: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9', toName: 'My Ledger',
  maxFee: '13.5', gasTokenSymbol: 'TRX', verifyCode: '748392',
};
const shortAddr = (a: string) => `${a.slice(0, 6)}…${a.slice(-6)}`;
const ITEMS = [
  { label: 'Assets', sub: 'Balances & tokens' },
  { label: 'Sign History', sub: 'Signature log' },
  { label: 'Passkey', sub: 'FIDO2 security key' },
  { label: 'Settings', sub: 'Device & security' },
];

export function RefinedStyle({ screen }: { screen: LabScreen }) {
  if (screen === 'home') return <Home />;
  if (screen === 'sign') return <Sign />;
  return <Placeholder />;
}
function Placeholder() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8 text-black" style={SERIF}>
      <div className="font-sans text-[15px] font-bold uppercase tracking-[0.2em]">Home &amp; Sign</div>
      <div className="text-[16px] mt-2">本次探索仅含 Home 与 Sign</div>
    </div>
  );
}

function Home() {
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black" style={SERIF}>
      <div className="bg-black text-[#838383] px-5 pt-3.5 pb-4 flex-shrink-0">
        <div className="font-sans flex items-center justify-between text-[12px] font-bold uppercase tracking-[0.22em]">
          <span>Wallet</span>
          <span className="inline-flex items-center gap-1.5 tabular-nums"><BatteryMedium className="w-5 h-5" strokeWidth={2.25} />{WALLET.battery}%</span>
        </div>
        <div className="text-[40px] font-semibold tracking-tight leading-none mt-2">{WALLET.name}</div>
        <div className="font-sans text-[12px] tracking-[0.25em] mt-2">{WALLET.model}</div>
      </div>
      <div className="flex-1 flex flex-col border-t-2 border-black min-h-0">
        {ITEMS.map((m, i) => (
          <button key={m.label} className={`flex-1 flex items-center gap-4 px-5 text-left min-h-0 ${i > 0 ? 'border-t border-black' : ''} active:bg-black active:text-[#838383]`}>
            <div className="flex-1 min-w-0">
              <div className="text-[27px] font-semibold leading-tight truncate">{m.label}</div>
              <div className="font-sans text-[13px] tracking-wide mt-0.5 truncate">{m.sub}</div>
            </div>
            <ChevronRight className="w-6 h-6 flex-shrink-0" strokeWidth={2} />
          </button>
        ))}
      </div>
    </div>
  );
}

function Header({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <div className="h-[46px] px-5 flex items-center gap-2 border-b-2 border-black flex-shrink-0">
      {onBack && <button onClick={onBack} aria-label="Back" className="active:bg-black active:text-[#838383] px-1 -mx-1 flex items-center"><ChevronLeft className="w-6 h-6" strokeWidth={2.5} /></button>}
      <span className="text-[20px] font-semibold tracking-tight">{title}</span>
    </div>
  );
}
function ConfirmBar({ onReject, onConfirm }: { onReject: () => void; onConfirm: () => void }) {
  return (
    <div className="flex border-t-2 border-black flex-shrink-0">
      <button onClick={onReject} aria-label="Reject" className="w-[80px] h-[64px] border-r-2 border-black flex items-center justify-center active:bg-black active:text-[#838383]">
        <X className="w-7 h-7" strokeWidth={2.5} />
      </button>
      <button onClick={onConfirm} className="flex-1 h-[64px] bg-black text-[#838383] flex items-center justify-center gap-2.5 active:bg-[#838383] active:text-black">
        <Check className="w-6 h-6" strokeWidth={2.5} />
        <span className="font-sans text-base font-bold uppercase tracking-wide">Confirm</span>
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
      <div className="flex-1 flex flex-col min-h-0 text-black" style={SERIF}>
        <Header title="Signing" />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <div className="font-sans text-[11px] font-bold uppercase tracking-[0.3em]">Processing</div>
          <div className="text-[40px] font-semibold tracking-tight mt-2">Signing…</div>
        </div>
      </div>
    );
  }
  if (status === 'success' || status === 'rejected') {
    const ok = status === 'success';
    return (
      <div className="flex-1 flex flex-col min-h-0 text-black" style={SERIF}>
        <Header title="Confirm Send" />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <div className={`w-[80px] h-[80px] rounded-full flex items-center justify-center ${ok ? 'bg-black' : 'border-[3px] border-black'}`}>
            {ok ? <Check className="w-11 h-11 text-[#838383]" strokeWidth={3} /> : <X className="w-11 h-11 text-black" strokeWidth={3} />}
          </div>
          <div className="text-[34px] font-semibold tracking-tight mt-4">{ok ? 'Signed' : 'Rejected'}</div>
          <div className="font-sans text-[13px] mt-2">{ok ? `${TX.amount} ${TX.tokenSymbol} → ${TX.toName}` : 'Nothing was sent'}</div>
        </div>
        <button onClick={reset} className="font-sans h-[60px] w-full border-t-2 border-black text-[14px] font-bold uppercase tracking-[0.2em] active:bg-black active:text-[#838383]">Again</button>
      </div>
    );
  }

  if (!showOverview) {
    return (
      <div className="flex-1 flex flex-col min-h-0 text-black" style={SERIF}>
        <Header title="Confirm Send" />
        <div className="flex-1 flex flex-col justify-center px-6 min-h-0">
          <div className="font-sans text-[13px] font-bold uppercase tracking-[0.22em] text-center">Verify Code</div>
          <div className="text-[62px] font-semibold tracking-[0.14em] leading-none text-center mt-4" style={MONO}>{TX.verifyCode}</div>
          <p className="text-[18px] leading-snug text-center mt-6 px-1">Make sure this code matches the one shown in the SafePal app.</p>
        </div>
        <div className="flex items-baseline justify-between px-6 py-3 border-t border-black flex-shrink-0">
          <span className="font-sans text-[12px] font-bold uppercase tracking-[0.15em]">Sending</span>
          <span className="text-[24px] font-semibold leading-none">{TX.amount} <span className="font-sans text-base font-bold uppercase">{TX.tokenSymbol}</span></span>
        </div>
        <button onClick={() => setShowOverview(true)} className="h-[48px] px-6 flex items-center justify-between border-t-2 border-black flex-shrink-0 active:bg-black active:text-[#838383]">
          <span className="font-sans text-[14px] uppercase tracking-wide">Transaction details</span>
          <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
        </button>
        <ConfirmBar onReject={reject} onConfirm={confirm} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 text-black" style={SERIF}>
      <Header title="Confirm Send" onBack={() => setShowOverview(false)} />
      <div className="px-6 pt-3 pb-3.5 border-b-2 border-black flex-shrink-0">
        <div className="font-sans text-[12px] font-bold uppercase tracking-[0.2em]">Amount</div>
        <div className="flex items-baseline gap-2.5 mt-1">
          <span className="text-[60px] font-semibold tracking-tight leading-[0.85]">{TX.amount}</span>
          <span className="font-sans text-xl font-bold uppercase">{TX.tokenSymbol}</span>
        </div>
        <div className="font-sans text-[15px] font-bold mt-1">{TX.fiatValue}</div>
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        {([
          ['To', `${TX.toName}  ${shortAddr(TX.to)}`, true],
          ['Network', TX.network, false],
          ['Fee', `${TX.maxFee} ${TX.gasTokenSymbol}`, true],
        ] as const).map(([k, v, mono], i) => (
          <div key={k} className={`flex-1 flex items-center justify-between gap-3 px-6 min-h-0 ${i > 0 ? 'border-t border-black' : ''}`}>
            <span className="font-sans text-[12px] font-bold uppercase tracking-[0.15em] flex-shrink-0">{k}</span>
            <span className="text-[18px] font-semibold text-right truncate" style={mono ? MONO : undefined}>{v}</span>
          </div>
        ))}
      </div>
      <button className="h-[48px] px-6 flex items-center justify-between border-t-2 border-black flex-shrink-0 active:bg-black active:text-[#838383]">
        <span className="font-sans text-[14px] uppercase tracking-wide">Full details</span>
        <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
      </button>
      <ConfirmBar onReject={reject} onConfirm={confirm} />
    </div>
  );
}
