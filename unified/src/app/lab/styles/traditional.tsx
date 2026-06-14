import { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, ArrowRight,
  Check, X, Delete, Bluetooth, BatteryMedium, Nfc, Lock,
  Bitcoin, Hexagon, CircleDollarSign, Sparkles, Coins, FileSignature,
} from 'lucide-react';
import type { LabScreen } from '../data';
import { WALLET } from '../data';

/**
 * TRADITIONAL — the *real device pages* (reachable in the Debug Panel) recast in
 * the locked EDITORIAL_DESIGN_LANGUAGE. Per the confirmed brief:
 *   · layout/arrangement & interactions are faithful to the real pages
 *     (#1 Home 2×2, #22 Sign Request transfer/layout-E, #21 Sign History,
 *      #9 Verify Recovery, Activation "re-enter" word picker);
 *   · only the design language changes — bordered CARDS become ink LINES,
 *     content is serif, metadata sans, machine values mono, status in full words.
 */
const PRESS = 'active:bg-black active:text-[#838383]';

/** Operational header (spec §⑦): back + serif title + optional right node. */
function Header({ title, onBack, right }: { title: string; onBack?: () => void; right?: React.ReactNode }) {
  return (
    <div className="h-[45px] px-5 flex items-center justify-between border-b-2 border-black flex-shrink-0">
      {onBack ? (
        <button onClick={onBack} aria-label="Back" className={`flex items-center gap-2 ${PRESS} px-1 -mx-1`}>
          <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
          <span className="text-lg font-bold tracking-tight">{title}</span>
        </button>
      ) : (
        <span className="text-lg font-bold tracking-tight">{title}</span>
      )}
      {right && <span className="font-sans text-xs font-bold">{right}</span>}
    </div>
  );
}

/** Address with first/last 6 chars bold (mono); full address shown (no truncation). */
function BoldEndsAddress({ addr, className = '' }: { addr: string; className?: string }) {
  if (addr.length <= 12) return <span className={`font-bold ${className}`} style={{ fontFamily: 'ui-monospace, monospace' }}>{addr}</span>;
  return (
    <span className={className} style={{ fontFamily: 'ui-monospace, monospace' }}>
      <span className="font-bold">{addr.slice(0, 6)}</span>{addr.slice(6, -6)}<span className="font-bold">{addr.slice(-6)}</span>
    </span>
  );
}

/** Inverted metadata token (date·time / count) — Editorial's single emphasis chip. */
function Chip({ children }: { children: React.ReactNode }) {
  return <span className="font-sans inline-flex items-center bg-black text-[#838383] text-[13px] font-bold leading-none px-2 py-1 tracking-wide">{children}</span>;
}

export type SignVariant = 'asym' | 'tech';
export type ListVariant = 'ledger' | 'agenda' | 'timeline';
export function TraditionalStyle({ screen, variant = 'asym', listVariant = 'ledger' }: { screen: LabScreen; variant?: SignVariant; listVariant?: ListVariant }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black font-serif">
      {screen === 'home' && <Home />}
      {screen === 'sign' && <Sign variant={variant} />}
      {screen === 'history' && <History listVariant={listVariant} />}
      {screen === 'seed' && <Seed />}
      {screen === 'verify' && <VerifyRecovery />}
    </div>
  );
}

/* ════════ HOME ════════ device 2×2 menu, ink rules instead of cards. ════════ */
const ITEMS: { label: string; sub: string }[] = [
  { label: 'Assets', sub: 'Balances & tokens' },
  { label: 'Sign History', sub: 'Signature log' },
  { label: 'Passkey', sub: 'FIDO2 security key' },
  { label: 'Settings', sub: 'Device & security' },
];
function Home() {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="bg-black text-[#838383] px-5 pt-3.5 pb-4 flex-shrink-0">
        <div className="font-sans flex items-center justify-between text-[13px] font-bold uppercase tracking-[0.22em]">
          <span className="inline-flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" strokeWidth={2.5} />Wallet</span>
          <span className="inline-flex items-center gap-2.5">
            <Nfc className="w-4 h-4" strokeWidth={2.25} />
            <Bluetooth className="w-4 h-4" strokeWidth={2.25} />
            <span className="inline-flex items-center gap-1 tabular-nums"><BatteryMedium className="w-5 h-5" strokeWidth={2.25} />{WALLET.battery}%</span>
          </span>
        </div>
        <div className="text-[38px] font-bold tracking-tight leading-none mt-2">{WALLET.name}</div>
        <div className="font-sans text-[13px] tracking-[0.25em] mt-2">{WALLET.model}</div>
      </div>
      <div className="flex-1 grid grid-cols-2 grid-rows-2 border-t-2 border-black min-h-0">
        {ITEMS.map((m, i) => (
          <button key={m.label} className={`flex flex-col justify-between p-4 text-left ${i % 2 === 1 ? 'border-l border-black' : ''} ${i >= 2 ? 'border-t border-black' : ''} ${PRESS}`}>
            <div className="flex justify-end">
              <ChevronRight className="w-6 h-6 flex-shrink-0" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <div className="text-[24px] font-bold leading-[1.05] truncate">{m.label}</div>
              <div className="font-sans text-[13px] tracking-wide mt-1 truncate">{m.sub}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ════════ SIGN ════════ transfer layout E: Verify-Code screen → overview;
   tap Reject/Confirm → signing → result. (Real interaction: single-tap Confirm.) */
const TX = {
  network: 'Tron', tokenSymbol: 'USDT', amount: '500', fiatValue: '$500.00',
  from: 'TJYeasTPa6gpEEfYqv8q3qyq3qLZ8nLb9p',
  to: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9', toName: 'My Ledger',
  maxFee: '13.5', gasTokenSymbol: 'TRX', verifyCode: '748392',
};
function ActionBar({ onReject, onConfirm }: { onReject: () => void; onConfirm: () => void }) {
  return (
    <div className="flex border-t-2 border-black flex-shrink-0">
      <button onClick={onReject} className={`w-[80px] h-[60px] border-r-2 border-black flex items-center justify-center ${PRESS}`} aria-label="Reject">
        <X className="w-6 h-6" strokeWidth={2.5} />
      </button>
      <button onClick={onConfirm} className="flex-1 h-[60px] bg-black text-[#838383] flex items-center justify-center gap-2 active:bg-[#838383] active:text-black">
        <Check className="w-5 h-5" strokeWidth={2.5} />
        <span className="font-sans text-sm font-bold uppercase tracking-wide">Confirm</span>
      </button>
    </div>
  );
}
const MONO = { fontFamily: 'ui-monospace, monospace' } as const;
const CODE_SPACED = TX.verifyCode.replace(/(\d{3})(\d{3})/, '$1 $2');

/** L-shaped crop marks at the four corners (technical/registration texture). */
function CropFrame({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-black" />
      <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-black" />
      <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-black" />
      <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-black" />
      {children}
    </div>
  );
}
/** Hairline ruler with graduated ticks — instrument-scale texture. */
function TickRule({ ticks = 32 }: { ticks?: number }) {
  return (
    <div className="flex items-end h-3 gap-[5px] overflow-hidden">
      {Array.from({ length: ticks }).map((_, i) => <span key={i} className={`w-px bg-black ${i % 4 === 0 ? 'h-3' : 'h-1.5'}`} />)}
    </div>
  );
}

function Sign({ variant }: { variant: SignVariant }) {
  const [showOverview, setShowOverview] = useState(false);
  const [status, setStatus] = useState<'idle' | 'signing' | 'success' | 'rejected'>('idle');
  const timer = useRef<number | null>(null);
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);
  const confirm = () => { setStatus('signing'); timer.current = window.setTimeout(() => setStatus('success'), 1500); };
  const reject = () => setStatus('rejected');
  const reset = () => { setStatus('idle'); setShowOverview(false); };
  const amtSize = TX.amount.length > 10 ? 'text-4xl' : TX.amount.length > 6 ? 'text-5xl' : 'text-6xl';

  if (status === 'signing') {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <Header title="Signing" />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <div className="font-sans text-[13px] font-bold tracking-[0.3em] uppercase mb-2">Processing</div>
          <div className="text-[34px] font-bold tracking-tight">Signing…</div>
          <div className="font-sans text-[14px] tracking-wide mt-3">Generating signature on device</div>
        </div>
      </div>
    );
  }
  if (status === 'success' || status === 'rejected') {
    const ok = status === 'success';
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <Header title="Confirm Send" />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <div className={`w-[76px] h-[76px] rounded-full flex items-center justify-center ${ok ? 'bg-black' : 'border-[3px] border-black'}`}>
            {ok ? <Check className="w-10 h-10 text-[#838383]" strokeWidth={3} /> : <X className="w-10 h-10 text-black" strokeWidth={3} />}
          </div>
          <div className="text-[30px] font-bold tracking-tight mt-5">{ok ? 'Signed' : 'Rejected'}</div>
          <div className="font-sans text-[14px] tracking-wide mt-2">{ok ? `${TX.amount} ${TX.tokenSymbol} → ${TX.toName}` : 'Nothing was sent'}</div>
        </div>
        <button onClick={reset} className={`h-14 w-full border-t-2 border-black font-sans text-[15px] font-bold uppercase tracking-[0.2em] ${PRESS}`}>Again</button>
      </div>
    );
  }

  /* ── Direction ①: editorial asymmetry — ragged-left, offset hero, hanging
     label gutter, whitespace instead of a grid of rules. ───────────────────── */
  if (variant === 'asym') {
    if (!showOverview) {
      return (
        <div className="flex-1 flex flex-col min-h-0">
          <Header title="Confirm Send" />
          <div className="flex-1 px-6 flex flex-col min-h-0">
            <div className="flex-[1.1]" />
            <div className="flex-shrink-0">
              <div className="font-sans text-[13px] font-bold uppercase tracking-[0.28em]">Verify code</div>
              <div className="text-[64px] font-bold leading-[0.85] tracking-[0.04em] mt-2" style={MONO}>{CODE_SPACED}</div>
              <div className="h-[3px] bg-black w-[58%] mt-2.5" />
              <div className="mt-6 pl-14 pr-1">
                <p className="font-sans text-[15px] leading-snug">Match this code against the one shown in the SafePal app before you confirm.</p>
              </div>
            </div>
            <div className="flex-1" />
            <div className="flex items-baseline gap-3 flex-shrink-0 border-t border-black pt-2.5 pb-2.5">
              <span className="font-sans text-[13px] font-bold uppercase tracking-[0.2em]">Sending</span>
              <span className="text-[28px] font-bold leading-none ml-auto">{TX.amount} <span className="font-sans text-base font-bold uppercase">{TX.tokenSymbol}</span></span>
            </div>
          </div>
          <button onClick={() => setShowOverview(true)} className={`flex items-center justify-between px-6 h-11 border-t border-black flex-shrink-0 ${PRESS}`}>
            <span className="font-sans text-base uppercase tracking-wide">Transaction details</span>
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </button>
          <ActionBar onReject={reject} onConfirm={confirm} />
        </div>
      );
    }
    const short = (a: string) => (a.length > 14 ? `${a.slice(0, 6)}…${a.slice(-6)}` : a);
    const ovRows: [string, string, boolean?][] = [
      ['To', TX.toName],
      ['Address', short(TX.to), true],
      ['From', short(TX.from), true],
      ['Network', TX.network],
      ['Gas fee', `${TX.maxFee} ${TX.gasTokenSymbol}`, true],
    ];
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <Header title="Confirm Send" onBack={() => setShowOverview(false)} />
        {/* amount hero — ragged left, network chip drifts right */}
        <div className="px-6 pt-3 pb-3.5 border-b-2 border-black flex-shrink-0">
          <div className="flex items-baseline">
            <span className="font-sans text-[13px] font-bold uppercase tracking-[0.2em]">Amount</span>
            <span className="ml-auto"><Chip>{TX.network}</Chip></span>
          </div>
          <div className="flex items-baseline gap-2.5 mt-1.5">
            <span className={`font-bold tracking-tight leading-[0.8] ${amtSize}`}>{TX.amount}</span>
            <span className="font-sans text-xl font-bold uppercase">{TX.tokenSymbol}</span>
          </div>
          <div className="font-sans text-base font-bold mt-1.5">{TX.fiatValue}</div>
        </div>
        {/* clean ruled ledger — even rows, label left / value right (matches History detail) */}
        <div className="flex-1 flex flex-col min-h-0">
          {ovRows.map(([k, v, mono]) => (
            <div key={k} className="flex-1 flex items-center justify-between gap-3 px-6 border-b border-black last:border-b-0 min-h-0">
              <span className="font-sans text-[13px] font-bold uppercase tracking-[0.15em] flex-shrink-0">{k}</span>
              <span className="text-base font-bold text-right truncate" style={mono ? MONO : undefined}>{v}</span>
            </div>
          ))}
        </div>
        <button className={`flex items-center justify-between px-6 h-11 border-t-2 border-black flex-shrink-0 ${PRESS}`}>
          <span className="font-sans text-base uppercase tracking-wide">Full details</span>
          <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
        </button>
        <ActionBar onReject={reject} onConfirm={confirm} />
      </div>
    );
  }

  /* ── Direction ②: technical registration — crop-mark frames, tick rulers,
     mono micro-labels & indices. Light texture, no solid black fills. ──────── */
  if (!showOverview) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <Header title="Confirm Send" />
        <div className="flex-1 px-5 pt-4 flex flex-col min-h-0">
          <div className="flex items-center justify-between font-sans text-[12px] font-bold uppercase tracking-[0.2em] flex-shrink-0">
            <span>Vrf · Code</span><span style={MONO}>NET:{TX.network}</span>
          </div>
          <CropFrame className="mt-4 py-7 flex-shrink-0">
            <div className="text-[54px] font-bold tracking-[0.18em] leading-none text-center" style={MONO}>{CODE_SPACED}</div>
          </CropFrame>
          <div className="mt-3 flex-shrink-0"><TickRule /></div>
          <p className="font-sans text-[14px] font-bold uppercase tracking-[0.12em] text-center mt-4 flex-shrink-0">Match this code in the SafePal app</p>
          <div className="flex-1" />
          <div className="flex items-center justify-between border-t border-black py-2.5 flex-shrink-0">
            <span className="font-sans text-[12px] font-bold uppercase tracking-[0.2em]">Send</span>
            <span className="text-lg font-bold" style={MONO}>{TX.amount} {TX.tokenSymbol}</span>
          </div>
        </div>
        <button onClick={() => setShowOverview(true)} className={`flex items-center justify-between px-5 h-11 border-t-2 border-black flex-shrink-0 ${PRESS}`}>
          <span className="font-sans text-[14px] font-bold uppercase tracking-[0.18em]" style={MONO}>Details</span>
          <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
        </button>
        <ActionBar onReject={reject} onConfirm={confirm} />
      </div>
    );
  }
  const SPEC: [string, string, React.ReactNode][] = [
    ['01', 'To', <><span className="font-sans text-sm font-bold">{TX.toName}</span><BoldEndsAddress addr={TX.to} className="block text-[14px] break-all leading-snug" /></>],
    ['02', 'From', <BoldEndsAddress addr={TX.from} className="block text-[14px] break-all leading-snug" />],
    ['03', 'Gas', <span className="text-sm font-bold" style={MONO}>{TX.maxFee} {TX.gasTokenSymbol}</span>],
    ['04', 'Net', <span className="text-sm font-bold">{TX.network}</span>],
  ];
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Header title="Confirm Send" onBack={() => setShowOverview(false)} />
      <div className="flex-1 px-5 pt-4 flex flex-col min-h-0">
        <div className="flex items-center justify-between font-sans text-[12px] font-bold uppercase tracking-[0.2em] flex-shrink-0">
          <span>Tx · Amount</span><span style={MONO}>NET:{TX.network}</span>
        </div>
        <CropFrame className="mt-3 py-4 px-3 flex-shrink-0">
          <div className="flex items-baseline gap-2.5">
            <span className={`font-bold tracking-tight leading-none ${amtSize}`}>{TX.amount}</span>
            <span className="font-sans text-lg font-bold uppercase">{TX.tokenSymbol}</span>
          </div>
          <div className="font-sans text-[15px] font-bold mt-1">{TX.fiatValue}</div>
        </CropFrame>
        <div className="mt-3 flex-shrink-0"><TickRule /></div>
        <div className="flex-1 flex flex-col min-h-0 mt-1">
          {SPEC.map(([i, k, v]) => (
            <div key={i} className="flex-1 flex items-center gap-3 px-1 border-t border-black min-h-0">
              <span className="font-sans text-[13px] font-bold tabular-nums w-5 flex-shrink-0" style={MONO}>{i}</span>
              <span className="font-sans text-[12px] font-bold uppercase tracking-[0.15em] w-12 flex-shrink-0">{k}</span>
              <div className="flex-1 min-w-0">{v}</div>
            </div>
          ))}
        </div>
      </div>
      <button className={`flex items-center justify-between px-5 h-11 border-t-2 border-black flex-shrink-0 ${PRESS}`}>
        <span className="font-sans text-[14px] font-bold uppercase tracking-[0.18em]" style={MONO}>Full details</span>
        <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
      </button>
      <ActionBar onReject={reject} onConfirm={confirm} />
    </div>
  );
}

/* ════════ HISTORY ════════ Fully Editorial: ruled ledger (4/page), inverted
   date·time chip, serif primary / sans metadata, status as full words
   (SIGNED/REJECTED), chevron-to-navigate, Editorial paginator → ruled detail.
   All original info elements preserved (coin, network, amount, USD, type, time). */
type Rec = { id: string; type: 'transfer' | 'approve' | 'sign'; coin: string; network: string; amount: string; usdValue: string; timestamp: string; status: 'completed' | 'rejected'; requestedByName?: string };
const RECORDS: Rec[] = [
  { id: '1', type: 'transfer', coin: 'BTC', network: 'Bitcoin', amount: '0.0234', usdValue: '2,145.67', timestamp: '2026-02-28 14:23:15', status: 'completed' },
  { id: '2', type: 'sign', coin: 'ETH', network: 'Ethereum', amount: '0', usdValue: '0', timestamp: '2026-02-28 13:05:22', status: 'completed', requestedByName: 'OpenSea' },
  { id: '3', type: 'approve', coin: 'GOVERNANCE', network: 'Polygon zkEVM', amount: '123,456.789012', usdValue: '9,876,543.21', timestamp: '2026-02-28 12:18:45', status: 'completed' },
  { id: '4', type: 'transfer', coin: 'WBTC', network: 'Optimism', amount: '0.045', usdValue: '4,125.50', timestamp: '2026-02-28 11:45:32', status: 'completed' },
  { id: '5', type: 'sign', coin: 'BTC', network: 'Bitcoin', amount: '0', usdValue: '0', timestamp: '2026-02-27 20:33:18', status: 'rejected', requestedByName: 'Uniswap' },
  { id: '6', type: 'transfer', coin: 'USDT', network: 'Ethereum', amount: '500.00', usdValue: '500.00', timestamp: '2026-02-27 18:12:08', status: 'completed' },
  { id: '7', type: 'approve', coin: 'CURVE', network: 'Arbitrum One', amount: '50,000.12345', usdValue: '125,000.50', timestamp: '2026-02-27 09:34:21', status: 'completed' },
  { id: '8', type: 'transfer', coin: 'BTC', network: 'Bitcoin', amount: '0.0089', usdValue: '816.43', timestamp: '2026-02-26 16:55:47', status: 'rejected' },
  { id: '9', type: 'transfer', coin: 'USDC', network: 'Polygon', amount: '1,000.00', usdValue: '1,000.00', timestamp: '2026-02-25 13:22:19', status: 'completed' },
  { id: '10', type: 'approve', coin: 'UNI', network: 'Ethereum', amount: '50.00', usdValue: '425.50', timestamp: '2026-02-24 10:08:33', status: 'completed' },
];
const formatAmount = (a: string): string => {
  const n = parseFloat(a.replace(/,/g, ''));
  if (isNaN(n)) return a;
  if (n >= 1000000) return (n / 1000000).toFixed(2) + 'M';
  if (n >= 10000) return (n / 1000).toFixed(2) + 'K';
  if (n < 1) return n.toFixed(6).replace(/\.?0+$/, '');
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
};
function coinIcon(coin: string) {
  const c = 'w-8 h-8';
  if (coin === 'BTC') return <Bitcoin className={c} strokeWidth={2} />;
  if (coin === 'ETH') return <Hexagon className={c} strokeWidth={2} />;
  if (coin === 'USDT' || coin === 'USDC') return <CircleDollarSign className={c} strokeWidth={2} />;
  if (coin === 'UNI') return <Sparkles className={c} strokeWidth={2} />;
  return <Coins className={c} strokeWidth={2} />;
}
const typeLabel = (t: string) => (t === 'transfer' ? 'Transfer' : t === 'approve' ? 'Approve' : 'Sign');
const fmtTs = (ts: string) => { const [d, t] = ts.split(' '); return `${d} · ${(t || '').slice(0, 5)}`; };
const statusWord = (s: 'completed' | 'rejected') => (s === 'completed' ? 'SIGNED' : 'REJECTED');

function History({ listVariant = 'ledger' }: { listVariant?: ListVariant }) {
  const [page, setPage] = useState(0);
  const [sel, setSel] = useState<Rec | null>(null);
  const perPage = 4;
  const totalPages = Math.ceil(RECORDS.length / perPage);
  const safePage = Math.min(page, totalPages - 1);
  const rows = RECORDS.slice(safePage * perPage, safePage * perPage + perPage);

  if (sel) return <HistoryDetail r={sel} onBack={() => setSel(null)} listVariant={listVariant} />;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* masthead — serif title + count token */}
      <div className="px-5 pt-3.5 pb-2.5 flex items-baseline justify-between border-b-2 border-black flex-shrink-0">
        <span className="text-[26px] font-bold tracking-tight leading-none">Sign History</span>
        <Chip>{RECORDS.length} records</Chip>
      </div>
      <div className="flex-1 min-h-0 flex flex-col">
        {rows.map((r, i) => {
          const absIdx = safePage * perPage + i;
          const primary = r.amount !== '0' ? `${formatAmount(r.amount)} ${r.coin}` : (r.requestedByName || 'Unknown');
          const sub = r.type === 'sign'
            ? `Sign · ${r.network}`
            : `${typeLabel(r.type)} · ${r.network}${r.usdValue !== '0' ? ` · $${formatAmount(r.usdValue)}` : ''}`;
          const status = <span className="font-sans text-[12px] font-bold tracking-[0.1em]">{statusWord(r.status)}</span>;

          // ① 分区 (was 数字锚点) — de-numbered per critique: the list reuses the
          //    ledger row below; the distinctive grouping lives in its sectioned detail.
          void absIdx;

          // ② 左侧时间轴 — continuous rail with a node per entry
          if (listVariant === 'timeline') {
            const [d, t] = r.timestamp.split(' ');
            const railPos = rows.length === 1 ? 'hidden'
              : i === 0 ? 'top-1/2 bottom-0'
              : i === rows.length - 1 ? 'top-0 bottom-1/2'
              : 'top-0 bottom-0';
            return (
              <button key={r.id} onClick={() => setSel(r)} className={`flex-1 w-full flex items-stretch gap-3 pr-5 text-left min-h-0 ${PRESS}`}>
                <div className="relative w-11 flex-shrink-0 flex items-center justify-center">
                  <div className={`absolute w-[2px] bg-black left-1/2 -translate-x-1/2 ${railPos}`} />
                  <div className={`relative z-10 w-3.5 h-3.5 rounded-full ${r.status === 'completed' ? 'bg-black' : 'bg-[#838383] border-2 border-black'}`} />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center py-2">
                  <div className="font-sans text-[13px] tracking-wide"><span className="font-bold tabular-nums">{(t || '').slice(0, 5)}</span> · {d}</div>
                  <div className="text-[20px] font-bold leading-tight truncate mt-0.5">{primary}</div>
                  <div className="font-sans text-[14px] tracking-wide truncate mt-0.5">{sub}</div>
                </div>
                <div className="flex flex-col items-end justify-center gap-1.5 flex-shrink-0">{status}<ChevronRight className="w-5 h-5" strokeWidth={2.25} /></div>
              </button>
            );
          }

          // ledger (default) — even ruled rows, coin glyph anchor
          return (
            <button key={r.id} onClick={() => setSel(r)} className={`flex-1 w-full flex items-center gap-3.5 px-5 text-left min-h-0 ${i > 0 ? 'border-t border-black' : ''} ${PRESS}`}>
              <div className="flex-shrink-0">{r.type === 'sign' ? <FileSignature className="w-8 h-8" strokeWidth={2} /> : coinIcon(r.coin)}</div>
              <div className="flex-1 min-w-0">
                <Chip>{fmtTs(r.timestamp)}</Chip>
                <div className="text-[21px] font-bold leading-tight truncate mt-1.5">{primary}</div>
                <div className="font-sans text-[14px] tracking-wide truncate mt-0.5">{sub}</div>
              </div>
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">{status}<ChevronRight className="w-5 h-5" strokeWidth={2.25} /></div>
            </button>
          );
        })}
      </div>
      {/* Editorial paginator — boundary-hidden Prev/Next, centred index */}
      {totalPages > 1 && (
        <div className="grid grid-cols-3 items-center border-t-2 border-black h-11 flex-shrink-0">
          <div className="justify-self-start">
            {safePage > 0 && (
              <button onClick={() => setPage(safePage - 1)} className={`font-sans h-11 px-4 flex items-center gap-1 text-[15px] font-bold uppercase tracking-wide ${PRESS}`}>
                <ChevronLeft className="w-5 h-5" strokeWidth={2.25} />Prev
              </button>
            )}
          </div>
          <span className="font-sans justify-self-center text-[14px] font-bold tracking-[0.2em]">{safePage + 1} / {totalPages}</span>
          <div className="justify-self-end">
            {safePage < totalPages - 1 && (
              <button onClick={() => setPage(safePage + 1)} className={`font-sans h-11 px-4 flex items-center gap-1 text-[15px] font-bold uppercase tracking-wide ${PRESS}`}>
                Next<ChevronRight className="w-5 h-5" strokeWidth={2.25} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
function HistoryDetail({ r, onBack, listVariant = 'ledger' }: { r: Rec; onBack: () => void; listVariant?: ListVariant }) {
  const fee = r.coin === 'BTC' ? '0.0001 BTC' : '0.0015 ETH';
  const hash = r.status === 'completed' ? '0x9f2c…a1b2' : '—';
  const sections: { head: string; rows: [string, string, boolean?][] }[] = r.type === 'transfer'
    ? [
        { head: 'Asset', rows: [['Coin', r.coin], ['Network', r.network]] },
        { head: 'Amount', rows: [['Amount', `${r.amount} ${r.coin}`], ['Value', `$${r.usdValue}`]] },
        { head: 'Settlement', rows: [['To', '0x8Ba1…dBA72', true], ['Network fee', fee], ['Tx hash', hash, true]] },
      ]
    : r.type === 'approve'
      ? [
          { head: 'Token', rows: [['Token', r.coin], ['Network', r.network]] },
          { head: 'Allowance', rows: [['Spender', 'Uniswap Router'], ['Allowance', r.amount]] },
          { head: 'Settlement', rows: [['Network fee', '0.0015 ETH'], ['Tx hash', '0x77ab…9c3d', true]] },
        ]
      : [
          { head: 'Request', rows: [['Requested by', r.requestedByName || 'Unknown'], ['Network', r.network]] },
          { head: 'Message', rows: [['Type', 'Message'], ['Result', r.status === 'completed' ? 'Signed' : 'Rejected']] },
        ];
  const heroPrimary = r.amount !== '0' ? `${formatAmount(r.amount)} ${r.coin}` : (r.requestedByName || r.coin);
  const header = <Header title={typeLabel(r.type)} onBack={onBack} right={r.status === 'completed' ? 'SIGNED' : 'REJECTED'} />;
  const hero = (
    <div className="px-5 pt-3 pb-3 border-b-2 border-black flex-shrink-0">
      <Chip>{fmtTs(r.timestamp)}</Chip>
      <div className="text-[34px] font-bold leading-none tracking-tight truncate mt-1.5">{heroPrimary}</div>
      <div className="font-sans text-[13px] mt-1 truncate">{typeLabel(r.type)} · {r.network}</div>
    </div>
  );

  // ① 分区系 — named sections (no numbers), heavy section rules + hairline field rows
  if (listVariant === 'agenda') {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        {header}{hero}
        <div className="flex-1 flex flex-col min-h-0">
          {sections.map((sec, si) => (
            <div key={sec.head} className="contents">
              <div className={`flex items-center gap-2.5 px-5 h-8 flex-shrink-0 ${si > 0 ? 'border-t-2 border-black' : ''}`}>
                <span className="w-2 h-2 bg-black flex-shrink-0" />
                <span className="font-sans text-[13px] font-bold uppercase tracking-[0.22em]">{sec.head}</span>
              </div>
              {sec.rows.map(([k, v, mono]) => (
                <div key={k} className="flex-1 flex items-center justify-between gap-3 px-5 border-t border-black min-h-0">
                  <span className="font-sans text-[13px] font-bold uppercase tracking-[0.12em] flex-shrink-0">{k}</span>
                  <span className="text-[15px] font-bold text-right truncate" style={mono ? MONO : undefined}>{v}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ② 时间轴系 — each group is a node on a connecting rail, fields hang to the right
  if (listVariant === 'timeline') {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        {header}{hero}
        <div className="flex-1 flex flex-col min-h-0">
          {sections.map((sec, si) => {
            const railPos = sections.length === 1 ? 'hidden' : si === 0 ? 'top-1/2 bottom-0' : si === sections.length - 1 ? 'top-0 bottom-1/2' : 'top-0 bottom-0';
            return (
              <div key={sec.head} className="flex-1 flex items-stretch gap-3 pr-5 min-h-0">
                <div className="relative w-11 flex-shrink-0 flex items-center justify-center">
                  <div className={`absolute w-[2px] bg-black left-1/2 -translate-x-1/2 ${railPos}`} />
                  <div className="relative z-10 w-3.5 h-3.5 rounded-full bg-black" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center py-2.5">
                  <div className="font-sans text-[12px] font-bold uppercase tracking-[0.22em] mb-2">{sec.head}</div>
                  <div className="flex flex-col gap-1.5">
                    {sec.rows.map(([k, v, mono]) => (
                      <div key={k} className="flex items-baseline justify-between gap-3">
                        <span className="font-sans text-[13px] tracking-wide flex-shrink-0">{k}</span>
                        <span className="text-[15px] font-bold text-right truncate" style={mono ? MONO : undefined}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ledger (default) — flat even ruled rows, coin glyph hero
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {header}
      <div className="px-5 pt-4 pb-3 flex-shrink-0 flex items-center gap-3">
        <div className="flex-shrink-0">{r.type === 'sign' ? <FileSignature className="w-9 h-9" strokeWidth={2} /> : coinIcon(r.coin)}</div>
        <div className="min-w-0">
          <div className="text-2xl font-bold leading-none truncate">{r.type === 'sign' ? (r.requestedByName || 'Unknown') : r.coin}</div>
          <div className="font-sans text-[14px] mt-1 truncate">{r.timestamp}</div>
        </div>
      </div>
      <div className="flex-1 flex flex-col border-t border-black">
        {sections.flatMap(s => s.rows).map(([k, v, mono]) => (
          <div key={k} className="flex-1 flex items-center justify-between gap-3 px-5 border-b border-black last:border-b-0">
            <span className="font-sans text-[13px] font-bold uppercase tracking-[0.12em] flex-shrink-0">{k}</span>
            <span className="text-[15px] font-bold text-right truncate" style={mono ? MONO : undefined}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════ shared BIP39 (Verify keyboard + Seed picker) ════════ */
const BIP39 = [
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

/* ════════ VERIFY ════════ VerifyRecoveryPageNew: select-length → per-word typed
   entry (input + paginated editable grid) → result. ════════ */
const WORDS_PER_REVIEW_PAGE = 6;
function VerifyRecovery() {
  type Step = 'select-length' | 'input' | 'result';
  const [step, setStep] = useState<Step>('select-length');
  const [wordCount, setWordCount] = useState<12 | 24>(12);
  const [words, setWords] = useState<string[]>([]);
  const [prefix, setPrefix] = useState('');
  const [idx, setIdx] = useState(0);
  const [ok, setOk] = useState(false);
  const [reviewPage, setReviewPage] = useState(0);
  useEffect(() => { setReviewPage(Math.floor(idx / WORDS_PER_REVIEW_PAGE)); }, [idx]);

  const restart = () => { setStep('select-length'); setWords([]); setPrefix(''); setIdx(0); };
  const confirmWord = (w: string) => {
    if (!w) return;
    if (idx < words.length) { const n = [...words]; n[idx] = w; setWords(n); setIdx(n.length); setPrefix(''); return; }
    const n = [...words, w]; setWords(n); setPrefix('');
    if (idx + 1 < wordCount) setIdx(idx + 1);
    else { const valid = n.length === wordCount && n.every(x => x.length > 0); setOk(valid); setStep('result'); }
  };

  if (step === 'select-length') {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <Header title="Verify Recovery Phrase" />
        <div className="flex-1 px-6 pt-5 flex flex-col min-h-0">
          <h2 className="text-[28px] font-bold leading-snug flex-shrink-0">Pick your Recovery Phrase length</h2>
          <div className="font-sans text-sm tracking-wide mt-2 flex-shrink-0">Choose how many words you wrote down.</div>
          <div className="flex-1 flex flex-col border-t-2 border-black mt-5 min-h-0">
            {([12, 24] as const).map(n => (
              <button key={n} onClick={() => { setWordCount(n); setStep('input'); }} className={`flex-1 w-full flex items-center justify-between px-2 border-b border-black last:border-b-0 ${PRESS}`}>
                <span className="text-[52px] font-bold tabular-nums leading-none">{n}</span>
                <span className="font-sans text-base font-bold uppercase tracking-[0.2em] flex items-center gap-2">words<ChevronRight className="w-5 h-5" strokeWidth={2.25} /></span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (step === 'result') {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <Header title="Verify Recovery Phrase" />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${ok ? 'bg-black' : 'border-[3px] border-black'}`}>
            {ok ? <Check className="w-11 h-11 text-[#838383]" strokeWidth={3} /> : <X className="w-11 h-11 text-black" strokeWidth={3} />}
          </div>
          <div className="text-2xl font-bold mt-4">{ok ? 'Verification successful' : 'Verification failed'}</div>
          <div className="font-sans text-base leading-relaxed mt-2 max-w-[280px]">{ok ? 'Your recovery phrase is valid and has been verified.' : 'The recovery phrase you entered is invalid. Please try again.'}</div>
        </div>
        {!ok && <button onClick={restart} className={`h-14 w-full border-t-2 border-black font-sans text-[15px] font-bold uppercase tracking-[0.2em] ${PRESS}`}>Try again</button>}
      </div>
    );
  }

  // INPUT
  const suggestions = prefix ? BIP39.filter(w => w.startsWith(prefix)).slice(0, 3) : [];
  const validNext = new Set(BIP39.filter(w => w.startsWith(prefix)).map(w => w[prefix.length]).filter(Boolean));
  const totalReviewPages = Math.max(1, Math.ceil(words.length / WORDS_PER_REVIEW_PAGE));
  const rp = Math.min(reviewPage, totalReviewPages - 1);
  const slots = words.slice(rp * WORDS_PER_REVIEW_PAGE, rp * WORDS_PER_REVIEW_PAGE + WORDS_PER_REVIEW_PAGE);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Header title="Verify Recovery Phrase" onBack={() => setStep('select-length')} right={<Chip>{idx + 1} / {wordCount}</Chip>} />
      <div className="flex-1 px-6 pt-4 flex flex-col min-h-0">
        {/* underline field — word N */}
        <div className="flex items-end gap-3 border-b-2 border-black pb-2 flex-shrink-0">
          <span className="font-sans text-[13px] font-bold uppercase tracking-[0.18em] mb-1.5 flex-shrink-0">Word {idx + 1}</span>
          <span className="flex-1 text-2xl font-bold break-all leading-none" style={{ fontFamily: 'ui-monospace, monospace' }}>{prefix}<span className="inline-block w-0.5 h-6 bg-black ml-0.5 align-middle" /></span>
        </div>
        {/* entered review grid — hairline rows, edit-in-place */}
        {words.length > 0 && (
          <div className="mt-3 flex-shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-sans text-base uppercase tracking-wide">Entered {totalReviewPages > 1 && <span className="text-xs font-bold">({rp + 1}/{totalReviewPages})</span>}</span>
              <div className="flex items-center gap-1">
                {rp > 0 && <button onClick={() => setReviewPage(rp - 1)} className={`h-8 w-8 flex items-center justify-center ${PRESS}`} aria-label="Prev"><ChevronLeft className="w-5 h-5" strokeWidth={2.5} /></button>}
                {rp < totalReviewPages - 1 && <button onClick={() => setReviewPage(rp + 1)} className={`h-8 w-8 flex items-center justify-center ${PRESS}`} aria-label="Next"><ChevronRight className="w-5 h-5" strokeWidth={2.5} /></button>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-5 h-[120px] content-start">
              {slots.map((w, i) => {
                const g = rp * WORDS_PER_REVIEW_PAGE + i;
                const editing = g === idx;
                return (
                  <button key={g} onClick={() => { setIdx(g); setPrefix(words[g] ?? ''); }} className={`flex items-center gap-2 py-1.5 px-1 border-b border-black ${editing ? 'bg-black text-[#838383]' : PRESS}`}>
                    <span className="font-sans text-xs font-bold tabular-nums w-5 shrink-0">{g + 1}</span>
                    <span className="text-base font-bold lowercase truncate">{w}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <div className="flex-1" />
      </div>
      {/* suggestion bar — ruled segments; tapping commits the word */}
      <div className="h-[44px] flex items-stretch border-t border-black flex-shrink-0">
        {suggestions.length > 0 ? suggestions.map((w, si) => (
          <button key={w} onClick={() => confirmWord(w)} className={`flex-1 min-w-0 flex items-center justify-center px-1 ${si > 0 ? 'border-l border-black' : ''} ${PRESS}`}>
            <span className="text-[15px] font-bold lowercase truncate">{w}</span>
          </button>
        )) : <div className="flex-1 flex items-center justify-center font-sans text-[14px] tracking-wide">{prefix ? 'No matching word' : 'Type the word'}</div>}
      </div>
      {/* keyboard — hairline keys, invalid letters blanked (bip39 prefix filter) */}
      <div className="px-1.5 pb-2 pt-2 flex flex-col gap-1.5 flex-shrink-0 border-t-2 border-black">
        {KEY_ROWS.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1">
            {row.split('').map(k => {
              const en = validNext.has(k);
              return <button key={k} disabled={!en} onClick={() => setPrefix(prefix + k)} className={`font-sans h-10 flex-1 max-w-[34px] border border-black text-base font-bold uppercase ${en ? PRESS : ''}`}><span className={en ? '' : 'invisible'}>{k}</span></button>;
            })}
          </div>
        ))}
        <div className="flex justify-center">
          <button onClick={() => setPrefix(prefix.slice(0, -1))} disabled={!prefix} className={`h-10 px-6 border border-black flex items-center justify-center ${prefix ? PRESS : ''}`} aria-label="Backspace"><Delete className={`w-5 h-5 ${prefix ? '' : 'invisible'}`} strokeWidth={2.25} /></button>
        </div>
      </div>
    </div>
  );
}

/* ════════ SEED ════════ Activation "re-enter": multiple-choice picker — for each
   position, "Select word no.N" + 4 options (correct + 3 distractors). ════════ */
const PHRASE = ['abandon', 'bacon', 'cabin', 'damage', 'eager', 'fabric', 'gadget', 'habit', 'ice', 'label', 'machine', 'oak'];
const DISTRACTORS = ['ability', 'badge', 'cable', 'dance', 'eagle', 'face', 'gain', 'hair', 'icon', 'lake', 'magic', 'object', 'safe', 'table', 'access', 'balance', 'cargo', 'deer', 'early', 'faith'];
function pickOptions(correct: string, index: number): string[] {
  const ds = DISTRACTORS.filter(w => w !== correct).slice((index * 3) % DISTRACTORS.length, (index * 3) % DISTRACTORS.length + 3);
  while (ds.length < 3) ds.push(DISTRACTORS[(ds.length + index) % DISTRACTORS.length]);
  const opts = [correct, ...ds];
  // deterministic placement of the correct word
  const pos = index % 4;
  [opts[0], opts[pos]] = [opts[pos], opts[0]];
  return opts;
}
function Seed() {
  const [index, setIndex] = useState(0);
  const [error, setError] = useState(false);
  const [done, setDone] = useState(false);
  const count = PHRASE.length;

  if (done) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <Header title="Confirm Recovery Phrase" />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center"><Check className="w-11 h-11 text-[#838383]" strokeWidth={3} /></div>
          <div className="text-2xl font-bold mt-4">All words confirmed</div>
          <div className="font-sans text-base leading-relaxed mt-2 max-w-[280px]">You've written down your recovery phrase correctly.</div>
        </div>
        <button onClick={() => { setIndex(0); setDone(false); setError(false); }} className={`h-14 w-full border-t-2 border-black font-sans text-[15px] font-bold uppercase tracking-[0.2em] ${PRESS}`}>Restart</button>
      </div>
    );
  }

  const correct = PHRASE[index];
  const options = pickOptions(correct, index);
  const pick = (w: string) => {
    if (w === correct) { setError(false); if (index + 1 >= count) setDone(true); else setIndex(index + 1); }
    else { setError(true); }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Header title="Confirm Recovery Phrase" right={<Chip>{index + 1} / {count}</Chip>} />
      <div className="flex-1 px-6 pt-4 pb-4 flex flex-col min-h-0">
        {/* numeral anchor + prompt */}
        <div className="flex items-baseline gap-3 flex-shrink-0">
          <span className="text-[52px] font-bold leading-none tabular-nums">{String(index + 1).padStart(2, '0')}</span>
          <div className="min-w-0">
            <div className="font-sans text-[13px] font-bold uppercase tracking-[0.2em]">Word</div>
            <div className="text-lg font-bold leading-tight">Pick the word at this position</div>
          </div>
        </div>
        <div className="font-sans text-[13px] font-bold uppercase tracking-[0.15em] h-5 mt-2 flex-shrink-0">{error ? 'No match · try again' : ''}</div>
        {/* options — lettered ruled rows */}
        <div className="flex-1 flex flex-col border-t-2 border-black mt-1 min-h-0">
          {options.map((w, oi) => (
            <button key={w} onClick={() => pick(w)} className={`flex-1 flex items-center gap-4 px-1 text-left border-b border-black ${PRESS}`}>
              <span className="font-sans text-sm font-bold w-6 text-center flex-shrink-0">{'ABCD'[oi]}</span>
              <span className="text-[26px] font-bold lowercase truncate">{w}</span>
            </button>
          ))}
        </div>
        {/* progress ticks */}
        <div className="flex gap-1 flex-shrink-0 mt-4">
          {Array.from({ length: count }).map((_, i) => <div key={i} className={`flex-1 h-1.5 ${i < index ? 'bg-black' : 'border border-black'}`} />)}
        </div>
      </div>
    </div>
  );
}
