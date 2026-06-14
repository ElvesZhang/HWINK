import { useState, useRef, useEffect } from 'react';
import { Lock, BatteryMedium, ScanLine, Coins, History, Settings, Check, X, ChevronLeft, ArrowRight } from 'lucide-react';
import type { LabScreen } from '../data';
import { WALLET } from '../data';

/**
 * MINIMAL · 极简 — the minimal visual language (Hanken Grotesk, generous negative
 * space, one big decision, 2-tone) carrying the FULL transaction detail. Several
 * interaction flows reconcile "all the info" with the minimal feel:
 *   · single — one screen, reduced essentials (reference)
 *   · paged  — single-focus wizard: one big fact per screen, advance through all
 *   · drill  — minimal confirm hero + a "Full details" page with every field
 *   · dense  — every field visible on one screen, minimal rows
 * Home is identity + one primary action + a thin secondary nav. Embedded Hanken
 * Grotesk + IBM Plex Mono. 2-tone only; single-tap Confirm.
 */
export type MinimalFlow = 'single' | 'paged' | 'drill' | 'dense';
const UI = { fontFamily: "'Hanken Grotesk', ui-sans-serif, system-ui, sans-serif" } as const;
const MONO = { fontFamily: "'IBM Plex Mono', ui-monospace, monospace" } as const;

const TX = {
  network: 'Tron', tokenSymbol: 'USDT', amount: '500', fiatValue: '$500.00',
  from: 'TJYeasTPa6gpEEfYqv8q3qyq3qLZ8nLb9p',
  to: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9', toName: 'My Ledger',
  maxFee: '13.5', gasTokenSymbol: 'TRX', verifyCode: '748392',
};
const shortAddr = (a: string) => `${a.slice(0, 6)}…${a.slice(-6)}`;
const SECONDARY = [
  { label: 'Assets', icon: Coins },
  { label: 'History', icon: History },
  { label: 'Settings', icon: Settings },
];

export function MinimalStyle({ screen, flow = 'single' }: { screen: LabScreen; flow?: MinimalFlow }) {
  if (screen === 'home') return <Home />;
  if (screen === 'sign') return <Sign flow={flow} />;
  return <Placeholder />;
}
function Placeholder() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8 text-black" style={UI}>
      <div className="text-[15px] font-extrabold uppercase tracking-[0.2em]">Home &amp; Sign</div>
      <div className="text-[14px] font-bold mt-2">本次探索仅含 Home 与 Sign</div>
    </div>
  );
}

function Home() {
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black" style={UI}>
      <div className="h-[46px] px-5 flex items-center justify-between flex-shrink-0">
        <span className="text-[13px] font-bold uppercase tracking-[0.2em] inline-flex items-center gap-1.5"><Lock className="w-4 h-4" strokeWidth={2.5} />Locked</span>
        <span className="text-[13px] font-bold inline-flex items-center gap-1.5 tabular-nums"><BatteryMedium className="w-5 h-5" strokeWidth={2.5} />{WALLET.battery}%</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 min-h-0">
        <div className="text-[46px] font-extrabold tracking-tight leading-none">{WALLET.name}</div>
        <div className="text-[14px] font-bold uppercase tracking-[0.28em] mt-3">{WALLET.model}</div>
      </div>
      <button className="mx-5 mb-4 h-[68px] bg-black text-[#838383] border-2 border-black flex items-center justify-center gap-3 flex-shrink-0 active:bg-[#838383] active:text-black">
        <ScanLine className="w-6 h-6" strokeWidth={2.5} />
        <span className="text-xl font-extrabold uppercase tracking-wide">Scan to Sign</span>
      </button>
      <div className="flex border-t-2 border-black flex-shrink-0 h-[58px]">
        {SECONDARY.map((s, i) => (
          <button key={s.label} className={`flex-1 flex flex-col items-center justify-center gap-1 ${i > 0 ? 'border-l border-black' : ''} active:bg-black active:text-[#838383]`}>
            <s.icon className="w-5 h-5" strokeWidth={2.25} />
            <span className="text-[11px] font-bold uppercase tracking-wide">{s.label}</span>
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

function Sign({ flow }: { flow: MinimalFlow }) {
  const [status, setStatus] = useState<'idle' | 'signing' | 'success' | 'rejected'>('idle');
  const [page, setPage] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const timer = useRef<number | null>(null);
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);
  const confirm = () => { setStatus('signing'); timer.current = window.setTimeout(() => setStatus('success'), 1400); };
  const reject = () => setStatus('rejected');
  const reset = () => { setStatus('idle'); setPage(0); setShowDetails(false); };

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

  if (flow === 'paged') return <Paged page={page} setPage={setPage} onReject={reject} onConfirm={confirm} />;
  if (flow === 'drill') return showDetails ? <DetailsPage onBack={() => setShowDetails(false)} /> : <DrillSummary onDetails={() => setShowDetails(true)} onReject={reject} onConfirm={confirm} />;
  if (flow === 'dense') return <Dense onReject={reject} onConfirm={confirm} />;
  return <Single onReject={reject} onConfirm={confirm} />;
}

function SignHeader({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <div className="h-[46px] px-5 flex items-center justify-center relative border-b-2 border-black flex-shrink-0">
      {onBack && <button onClick={onBack} aria-label="Back" className="absolute left-3 flex items-center active:bg-black active:text-[#838383] px-1"><ChevronLeft className="w-6 h-6" strokeWidth={2.5} /></button>}
      <span className="text-[14px] font-extrabold uppercase tracking-[0.22em]">{title}</span>
    </div>
  );
}

/* ── single — reduced essentials, one screen (reference) ── */
function Single({ onReject, onConfirm }: { onReject: () => void; onConfirm: () => void }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black" style={UI}>
      <SignHeader title="Confirm Send" />
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 min-h-0">
        <div className="flex items-baseline gap-2.5">
          <span className="text-[68px] font-extrabold leading-none tracking-tight">{TX.amount}</span>
          <span className="text-2xl font-extrabold uppercase">{TX.tokenSymbol}</span>
        </div>
        <div className="text-[16px] font-bold mt-1.5">{TX.fiatValue}</div>
        <div className="text-[18px] font-bold mt-7">→ {TX.toName}</div>
        <div className="text-[15px] mt-1" style={MONO}>{shortAddr(TX.to)}</div>
      </div>
      <div className="flex items-center justify-between px-6 h-[56px] border-t-2 border-black flex-shrink-0">
        <span className="text-[13px] font-bold uppercase tracking-[0.18em]">Verify code</span>
        <span className="text-[30px] font-bold tracking-[0.12em] leading-none" style={MONO}>{TX.verifyCode}</span>
      </div>
      <ConfirmBar onReject={onReject} onConfirm={onConfirm} />
    </div>
  );
}

/* ── paged — single-focus wizard: one big fact per screen, advance through all ── */
const PAGES: { label: string; body: React.ReactNode }[] = [
  {
    label: 'Amount',
    body: (
      <>
        <div className="flex items-baseline gap-2.5"><span className="text-[68px] font-extrabold leading-none tracking-tight">{TX.amount}</span><span className="text-2xl font-extrabold uppercase">{TX.tokenSymbol}</span></div>
        <div className="text-[17px] font-bold mt-2">{TX.fiatValue}</div>
      </>
    ),
  },
  { label: 'Recipient', body: (<><div className="text-[34px] font-extrabold leading-tight">{TX.toName}</div><div className="text-[16px] break-all mt-3 px-2 leading-snug" style={MONO}>{TX.to}</div></>) },
  { label: 'From', body: (<div className="text-[16px] break-all px-2 leading-snug" style={MONO}>{TX.from}</div>) },
  { label: 'Network & fee', body: (<><div className="text-[40px] font-extrabold">{TX.network}</div><div className="text-[20px] font-bold mt-3" style={MONO}>{TX.maxFee} {TX.gasTokenSymbol} fee</div></>) },
  { label: 'Verify code', body: (<div className="text-[64px] font-bold tracking-[0.12em] leading-none" style={MONO}>{TX.verifyCode}</div>) },
];
function Paged({ page, setPage, onReject, onConfirm }: { page: number; setPage: (n: number) => void; onReject: () => void; onConfirm: () => void }) {
  const last = PAGES.length - 1;
  const p = Math.min(page, last);
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black" style={UI}>
      <SignHeader title={`Review · ${p + 1}/${PAGES.length}`} onBack={p > 0 ? () => setPage(p - 1) : undefined} />
      <div className="flex-shrink-0 px-6 pt-3 text-center text-[13px] font-bold uppercase tracking-[0.2em]">{PAGES[p].label}</div>
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 min-h-0">{PAGES[p].body}</div>
      <div className="flex gap-1.5 justify-center pb-3 flex-shrink-0">
        {PAGES.map((_, i) => <div key={i} className={`h-1.5 w-1.5 ${i === p ? 'bg-black' : 'border border-black'}`} />)}
      </div>
      {p < last
        ? <button onClick={() => setPage(p + 1)} className="h-[64px] w-full border-t-2 border-black flex items-center justify-center gap-2.5 text-lg font-extrabold uppercase tracking-wide active:bg-black active:text-[#838383]">Next<ArrowRight className="w-6 h-6" strokeWidth={2.75} /></button>
        : <ConfirmBar onReject={onReject} onConfirm={onConfirm} />}
    </div>
  );
}

/* ── drill — minimal confirm hero + a full-details page with every field ── */
function DrillSummary({ onDetails, onReject, onConfirm }: { onDetails: () => void; onReject: () => void; onConfirm: () => void }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black" style={UI}>
      <SignHeader title="Confirm Send" />
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 min-h-0">
        <div className="flex items-baseline gap-2.5"><span className="text-[68px] font-extrabold leading-none tracking-tight">{TX.amount}</span><span className="text-2xl font-extrabold uppercase">{TX.tokenSymbol}</span></div>
        <div className="text-[16px] font-bold mt-1.5">{TX.fiatValue}</div>
        <div className="text-[18px] font-bold mt-7">→ {TX.toName}</div>
        <div className="text-[15px] mt-1" style={MONO}>{shortAddr(TX.to)}</div>
      </div>
      <div className="flex items-center justify-between px-6 h-[52px] border-t-2 border-black flex-shrink-0">
        <span className="text-[13px] font-bold uppercase tracking-[0.18em]">Verify code</span>
        <span className="text-[28px] font-bold tracking-[0.12em] leading-none" style={MONO}>{TX.verifyCode}</span>
      </div>
      <button onClick={onDetails} className="h-[48px] px-6 flex items-center justify-between border-t border-black flex-shrink-0 active:bg-black active:text-[#838383]">
        <span className="text-[14px] font-bold uppercase tracking-wide">Full details</span>
        <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
      </button>
      <ConfirmBar onReject={onReject} onConfirm={onConfirm} />
    </div>
  );
}
function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2.5 border-t border-black">
      <span className="text-[12px] font-bold uppercase tracking-[0.15em] flex-shrink-0">{label}</span>
      <span className="text-[16px] font-bold text-right" style={mono ? MONO : undefined}>{value}</span>
    </div>
  );
}
function AddrField({ label, name, addr }: { label: string; name?: string; addr: string }) {
  return (
    <div className="py-2.5 border-t border-black">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[12px] font-bold uppercase tracking-[0.15em]">{label}</span>
        {name && <span className="text-[15px] font-bold">{name}</span>}
      </div>
      <div className="text-[14px] break-all leading-snug mt-0.5" style={MONO}>{addr}</div>
    </div>
  );
}
function DetailsPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black" style={UI}>
      <SignHeader title="Transaction details" onBack={onBack} />
      <div className="flex-1 flex flex-col min-h-0 px-6 overflow-hidden">
        <Field label="Amount" value={`${TX.amount} ${TX.tokenSymbol}`} />
        <Field label="Value" value={TX.fiatValue} />
        <AddrField label="From" addr={TX.from} />
        <AddrField label="To" name={TX.toName} addr={TX.to} />
        <Field label="Network" value={TX.network} />
        <Field label="Network fee" value={`${TX.maxFee} ${TX.gasTokenSymbol}`} />
        <Field label="Verify code" value={TX.verifyCode} mono />
      </div>
    </div>
  );
}

/* ── dense — every field on one screen, minimal rows, no drill-down ── */
function Dense({ onReject, onConfirm }: { onReject: () => void; onConfirm: () => void }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black" style={UI}>
      <SignHeader title="Confirm Send" />
      <div className="px-6 pt-3 pb-3 border-b-2 border-black flex-shrink-0">
        <div className="flex items-baseline gap-2.5">
          <span className="text-[52px] font-extrabold leading-none tracking-tight">{TX.amount}</span>
          <span className="text-xl font-extrabold uppercase">{TX.tokenSymbol}</span>
        </div>
        <div className="text-[15px] font-bold mt-1">{TX.fiatValue}</div>
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        {([
          ['To', `${TX.toName} · ${shortAddr(TX.to)}`, true],
          ['From', shortAddr(TX.from), true],
          ['Network', TX.network, false],
          ['Fee', `${TX.maxFee} ${TX.gasTokenSymbol}`, true],
          ['Verify code', TX.verifyCode, true],
        ] as const).map(([k, v, mono], i) => (
          <div key={k} className={`flex-1 flex items-center justify-between gap-3 px-6 min-h-0 ${i > 0 ? 'border-t border-black' : ''}`}>
            <span className="text-[12px] font-bold uppercase tracking-[0.15em] flex-shrink-0">{k}</span>
            <span className={`${k === 'Verify code' ? 'text-[22px]' : 'text-[16px]'} font-bold text-right truncate`} style={mono ? MONO : undefined}>{v}</span>
          </div>
        ))}
      </div>
      <ConfirmBar onReject={onReject} onConfirm={onConfirm} />
    </div>
  );
}
