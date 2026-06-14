import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Check, X, AlertTriangle } from 'lucide-react';

/**
 * 签名功能测试 · Sign — VARIANT F  (post-critique revision)
 *
 * e-ink wallet: each screen fits at once (no free scroll). Long content uses a
 * deliberate TWO-screen split, not scrolling:
 *   · Screen 1 = per-scenario HERO  +  From  +  counterparty(+status)  +  network fee  +  actions
 *   · Screen 2 ("More details") = grouped supporting fields
 *
 * Critique fixes applied:
 *   P0 danger hierarchy — high-risk scenarios lead with an inverted RiskBand; an
 *      untrusted counterparty is flagged with an inverted chip next to its address.
 *   P0 confirmation friction — high-risk Confirm is HOLD-to-sign (progress strip);
 *      low-risk stays single-tap.
 *   P1 source visibility — From (signing account) is now a screen-1 base field.
 *   P1 blind clip — raw calldata gets a bounded flexible region (no past-device clip)
 *      and a byte-count label so any space-truncation is disclosed.
 *   P2 screen-2 IA — fields are grouped & titled instead of one equal-weight list.
 *   P2 readability — addresses are 4-char segmented; alignment is unified left
 *      (label on top, value below) on both screens.
 *   P3 copy — eip712 shows an explicit "off-chain, no fee" line; "More details"
 *      announces the field count; hero labels share one "X · Y" cadence.
 *
 * All on-screen fonts are >= 16px (the floating dev scenario switcher is exempt).
 */
const MONO = { fontFamily: 'ui-monospace, monospace' } as const;

type ScenarioId = 'native' | 'erc20' | 'approve' | 'swap' | 'call' | 'eip712' | 'blind';

const SCENARIOS: { id: ScenarioId; tab: string; title: string }[] = [
  { id: 'native', tab: 'Native', title: 'Transfer' },
  { id: 'erc20', tab: 'ERC-20', title: 'ERC-20 transfer' },
  { id: 'approve', tab: 'Approve', title: 'Approve / Permit2' },
  { id: 'swap', tab: 'Swap', title: 'Swap' },
  { id: 'call', tab: 'Call', title: 'Contract call' },
  { id: 'eip712', tab: 'EIP-712', title: 'EIP-712 signature' },
  { id: 'blind', tab: 'Blind', title: 'Blind sign' },
];

// ── addresses / shared mock values ──
const TRON_FROM = 'TJYeasTPa6gpEEfYqv8q3qyq3qLZ8nLb9p';
const TRON_TO = 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9';
const TRON_USDT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
const FROM = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
const TO = '0x8Ba1f109551bD432803012645Ac136ddd64DBA72';
const SPENDER = '0x1111111254EEB25477B68fb85Ed929f73A960582';
const USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
const ROUTER = '0xE592427A0AEce92De3Edee1F18E0157C05861564';
const BLIND_TARGET = '0x44Ab1C3F2E9d70d0Bf6A0C2c1c0F1234560F1234';
const RAW = '0xa9059cbb0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba720000000000000000000000000000000000000000000000000000000077359400';

// Risk model — drives the hero RiskBand and the Confirm friction.
const RISK: Record<ScenarioId, 'low' | 'high'> = {
  native: 'low', erc20: 'low', swap: 'low', call: 'low',
  approve: 'high', eip712: 'high', blind: 'high',
};

// Signing account (source) — now surfaced on screen 1.
const FROM_ADDR: Record<ScenarioId, string> = {
  native: TRON_FROM, erc20: FROM, approve: FROM, swap: FROM, call: FROM, eip712: FROM, blind: FROM,
};

// Counterparty address kept on screen 1, per scenario, with a trust status.
const PARTY: Record<ScenarioId, { k: string; addr: string; status?: string; bad?: boolean }> = {
  native: { k: 'To', addr: TRON_TO, status: 'Not in address book' },
  erc20: { k: 'To', addr: TO, status: 'Not in address book' },
  approve: { k: 'Spender', addr: SPENDER, status: 'Unknown · not in allow-list', bad: true },
  swap: { k: 'Receive to', addr: FROM, status: 'Your account' },
  call: { k: 'Contract', addr: ROUTER, status: 'Uniswap V3 Router · verified' },
  eip712: { k: 'Spender', addr: SPENDER, status: 'Unknown · not in allow-list', bad: true },
  blind: { k: 'Target', addr: BLIND_TARGET, status: 'Unknown contract', bad: true },
};

// Network fee kept on screen 1 (eip712 is off-chain → none).
const FEE: Partial<Record<ScenarioId, string>> = {
  native: '13.5 TRX', erc20: '0.00038 ETH', approve: '0.00051 ETH',
  swap: '0.0006 ETH', call: '0.0006 ETH', blind: '0.0012 ETH',
};

// Everything else → screen 2 ("More details"), now grouped & titled.
type Group = { title: string; rows: [string, string][]; flex?: boolean };
const MORE: Record<ScenarioId, Group[]> = {
  native: [
    { title: 'Token', rows: [['Token contract', TRON_USDT]] },
    { title: 'Network', rows: [['Network', 'Tron'], ['Chain ID', 'Tron Mainnet']] },
  ],
  erc20: [
    { title: 'Security', rows: [['Symbol source', 'Verified (allow-list)']] },
    { title: 'Token', rows: [['Token contract', USDT]] },
    { title: 'Network', rows: [['Network', 'Ethereum'], ['Chain ID', '1 (Ethereum Mainnet)']] },
  ],
  approve: [
    { title: 'Authorization', rows: [['Via', 'Permit2 — gasless approval'], ['Token', 'USDT (Tether USD)']] },
    { title: 'Token', rows: [['Token contract', USDT]] },
    { title: 'Network', rows: [['Network', 'Ethereum'], ['Chain ID', '1 (Ethereum Mainnet)']] },
  ],
  swap: [
    { title: 'Limits', rows: [['Min received', '0.301 ETH'], ['Max slippage', '1.0%']] },
    { title: 'Routing', rows: [['Router', ROUTER]] },
    { title: 'Network', rows: [['Network', 'Ethereum'], ['Chain ID', '1 (Ethereum Mainnet)']] },
  ],
  call: [
    { title: 'Function', rows: [['Function', 'exactInputSingle'], ['amountIn', '500000000'], ['amountOutMin', '301000000000000000'], ['Value (payable)', '0 ETH']] },
    { title: 'Contract', rows: [['Contract name', 'Uniswap V3 Router']] },
    { title: 'Network', rows: [['Chain ID', '1 (Ethereum Mainnet)']] },
  ],
  eip712: [
    { title: 'Message', rows: [['Primary type', 'Permit'], ['value', '2^256-1 (Unlimited)'], ['nonce', '0'], ['deadline', '2026-09-08 14:00 UTC']] },
    { title: 'Verifying contract', rows: [['Contract', USDT], ['Domain chain ID', '1']] },
  ],
  blind: [
    { title: 'Transaction', rows: [['Value', '0 ETH'], ['Chain ID', '1 (Ethereum Mainnet)']] },
    { title: 'Raw data · cannot be decoded', rows: [['Raw calldata · 68 bytes', RAW]], flex: true },
  ],
};

const isMono = (v: string) => /^0x/i.test(v) || /^T[1-9A-HJ-NP-Za-km-z]{25,}/.test(v) || /[0-9a-fA-F]{12,}/.test(v.replace(/\s/g, ''));

// 4-char grouping so addresses can be verified segment-by-segment (and wrap on spaces).
function segAddr(v: string): string {
  if (/^0x/i.test(v)) {
    const groups = v.slice(2).match(/.{1,4}/g) || [];
    return '0x ' + groups.join(' ');
  }
  return (v.match(/.{1,4}/g) || []).join(' ');
}

interface SignTestPageProps { onBack: () => void; showDebugId?: boolean }

export function SignTestPage({ onBack }: SignTestPageProps) {
  const [id, setId] = useState<ScenarioId>('native');
  const [view, setView] = useState<'main' | 'more'>('main');
  const [done, setDone] = useState<null | 'signed' | 'rejected'>(null);
  const [hold, setHold] = useState(0); // 0..100, high-risk hold-to-sign progress
  const holdRef = useRef<number | null>(null);
  const tickRef = useRef(0);

  const meta = SCENARIOS.find(s => s.id === id)!;
  const party = PARTY[id];
  const fee = FEE[id];
  const highRisk = RISK[id] === 'high';
  const moreCount = MORE[id].reduce((n, g) => n + g.rows.length, 0);

  const stopHold = () => {
    if (holdRef.current !== null) { clearInterval(holdRef.current); holdRef.current = null; }
    tickRef.current = 0;
    setHold(0);
  };
  const startHold = () => {
    if (!highRisk || holdRef.current !== null) return;
    tickRef.current = 0;
    holdRef.current = window.setInterval(() => {
      tickRef.current += 1;
      setHold(Math.min(100, (tickRef.current / 12) * 100));
      if (tickRef.current >= 12) { stopHold(); setDone('signed'); }
    }, 60);
  };
  // cleanup on unmount + reset whenever scenario/view changes
  useEffect(() => stopHold, []);
  useEffect(() => { stopHold(); }, [id, view, done]);

  const headerBack = view === 'more' ? () => setView('main') : onBack;
  const title = view === 'more' ? 'More details' : meta.title;

  return (
    <>
      <ScenarioBar id={id} onPick={(n) => { setId(n); setView('main'); setDone(null); }} />

      <div className="flex-1 flex flex-col min-h-0 text-black bg-[#838383]">
        <div className="h-[45px] px-5 flex items-center border-b-2 border-black flex-shrink-0">
          <button onClick={headerBack} aria-label="Back" className="flex items-center gap-2 active:bg-black active:text-[#838383]">
            <ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
            <span className="text-lg font-bold text-black uppercase tracking-wide">{title}</span>
          </button>
        </div>

        {done ? (
          <Result done={done} onAgain={() => setDone(null)} />
        ) : view === 'more' ? (
          <MoreView groups={MORE[id]} />
        ) : (
          <>
            <Hero id={id} />
            {/* mandated on screen 1: source + counterparty(+status) + network fee */}
            <div className="flex-1 flex flex-col min-h-0">
              <AddrRow k="From" addr={FROM_ADDR[id]} />
              <AddrRow k={party.k} addr={party.addr} status={party.status} bad={party.bad} />
              {fee ? (
                <div className="flex-1 flex items-center justify-between gap-3 px-4 border-t border-black min-h-0">
                  <span className="text-[16px] font-bold uppercase tracking-[0.12em] flex-shrink-0">Network fee</span>
                  <span className="text-[18px] font-black text-right" style={MONO}>{fee}</span>
                </div>
              ) : (
                <div className="flex-1 flex items-center px-4 border-t border-black min-h-0">
                  <span className="text-[16px] font-bold">Off-chain signature — no network fee</span>
                </div>
              )}
            </div>
            <button onClick={() => setView('more')} className="h-14 px-4 flex items-center justify-between border-t-2 border-black flex-shrink-0 active:bg-black active:text-[#838383]">
              <span className="text-[16px] font-bold uppercase tracking-[0.12em]">More details · {moreCount} fields</span>
              <ChevronRight className="w-6 h-6" strokeWidth={2.5} />
            </button>
            <div className="flex border-t-2 border-black flex-shrink-0">
              <button onClick={() => setDone('rejected')} aria-label="Reject" className="w-[80px] h-16 border-r-2 border-black flex items-center justify-center active:bg-black active:text-[#838383]"><X className="w-7 h-7" strokeWidth={2.5} /></button>
              {highRisk ? (
                <button
                  onPointerDown={startHold} onPointerUp={stopHold} onPointerLeave={stopHold} onPointerCancel={stopHold}
                  aria-label="Hold to sign"
                  className="relative flex-1 h-16 bg-[#838383] text-black flex items-center justify-center gap-2 overflow-hidden select-none touch-none active:bg-[#838383]">
                  <span className="absolute left-0 bottom-0 h-1.5 bg-black" style={{ width: `${hold}%` }} />
                  <Check className="w-6 h-6" strokeWidth={2.75} />
                  <span className="text-[18px] font-bold uppercase tracking-wide">{hold > 0 ? 'Keep holding…' : 'Hold to sign'}</span>
                </button>
              ) : (
                <button onClick={() => setDone('signed')} className="flex-1 h-16 bg-black text-[#838383] flex items-center justify-center gap-2.5 active:bg-[#838383] active:text-black"><Check className="w-6 h-6" strokeWidth={2.75} /><span className="text-[18px] font-bold uppercase tracking-wide">Confirm</span></button>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

/* ── shared danger band (high-risk scenarios lead with this) ── */
function RiskBand({ text }: { text: string }) {
  return (
    <div className="bg-black text-[#838383] px-4 py-2 flex items-center gap-2">
      <AlertTriangle className="w-5 h-5 flex-shrink-0" strokeWidth={2.75} />
      <span className="text-[16px] font-black uppercase tracking-[0.06em] leading-tight">High risk · {text}</span>
    </div>
  );
}

/* ── per-scenario hero ── */
function Hero({ id }: { id: ScenarioId }) {
  if (id === 'native') return <AmountHero amount="500" token="USDT" network="Tron" fiat="$500.00" />;
  if (id === 'erc20') return <AmountHero amount="500" token="USDT" network="Ethereum" fiat="$500.00" />;
  if (id === 'approve') {
    return (
      <div className="flex-shrink-0 border-b-2 border-black">
        <RiskBand text="Unlimited approval to an unknown spender" />
        <div className="px-4 pt-3 pb-3">
          <div className="text-[16px] font-bold uppercase tracking-[0.12em]">Approve · USDT</div>
          <div className="text-[40px] font-black leading-none mt-1">Unlimited</div>
          <div className="text-[16px] font-bold mt-2">Expires 2026-09-08 14:00 UTC</div>
        </div>
      </div>
    );
  }
  if (id === 'swap') {
    return (
      <HeroBox label="Swap · pay → get">
        <div className="flex items-baseline gap-2 mt-1"><span className="text-[16px] font-bold uppercase tracking-[0.1em] w-[64px] flex-shrink-0">Pay</span><span className="text-[30px] font-black tabular-nums">500 USDT</span></div>
        <div className="flex items-baseline gap-2 mt-1.5"><span className="text-[16px] font-bold uppercase tracking-[0.1em] w-[64px] flex-shrink-0">Get ≈</span><span className="text-[30px] font-black tabular-nums">0.305 ETH</span></div>
      </HeroBox>
    );
  }
  if (id === 'call') {
    return (
      <HeroBox label="Contract · token in → out">
        <div className="flex items-center gap-3 mt-1"><span className="text-[34px] font-black">USDT</span><span className="text-[26px] font-black">→</span><span className="text-[34px] font-black">WETH</span></div>
        <div className="text-[16px] font-bold mt-2">Uniswap V3 Router</div>
      </HeroBox>
    );
  }
  if (id === 'eip712') {
    return (
      <div className="flex-shrink-0 border-b-2 border-black">
        <RiskBand text="Off-chain Permit · unlimited spend" />
        <div className="px-4 pt-3 pb-3">
          <div className="text-[16px] font-bold uppercase tracking-[0.12em]">Signature message</div>
          <div className="text-[26px] font-black leading-tight mt-1">EIP-712 · Permit</div>
          <div className="text-[16px] font-bold mt-2">Allow USDT spend · Unlimited</div>
          <div className="text-[16px] font-bold mt-1">Off-chain message — not a transfer</div>
        </div>
      </div>
    );
  }
  // blind: origin + warning
  return (
    <div className="flex-shrink-0 border-b-2 border-black">
      <RiskBand text="Contents cannot be decoded" />
      <div className="px-4 pt-2.5 pb-3">
        <div className="text-[16px] font-bold uppercase tracking-[0.12em]">Requested by</div>
        <div className="text-[22px] font-black mt-1">app.unknown-dapp.io</div>
      </div>
    </div>
  );
}

function HeroBox({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-4 pt-4 pb-3 border-b-2 border-black flex-shrink-0">
      <div className="text-[16px] font-bold uppercase tracking-[0.12em]">{label}</div>
      {children}
    </div>
  );
}

function AmountHero({ amount, token, network, fiat }: { amount: string; token: string; network: string; fiat: string }) {
  return (
    <HeroBox label={`Amount · ${network}`}>
      <div className="flex items-baseline gap-2 mt-1"><span className="text-[52px] font-black leading-[0.85] tabular-nums">{amount}</span><span className="text-[26px] font-black">{token}</span></div>
      <div className="text-[18px] font-bold mt-2">≈ {fiat}</div>
    </HeroBox>
  );
}

/* ── unified address row: label on top, segmented value below, left-aligned ── */
function AddrRow({ k, addr, status, bad }: { k: string; addr: string; status?: string; bad?: boolean }) {
  return (
    <div className="flex-1 flex flex-col justify-center px-4 border-t border-black min-h-0 overflow-hidden">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[16px] font-bold uppercase tracking-[0.12em]">{k}</span>
        {status && (
          bad
            ? <span className="text-[16px] font-black bg-black text-[#838383] px-1.5 leading-tight">{status}</span>
            : <span className="text-[16px] font-bold">· {status}</span>
        )}
      </div>
      <span className="text-[16px] font-bold break-words whitespace-normal leading-snug mt-1" style={MONO}>{segAddr(addr)}</span>
    </div>
  );
}

/* ── screen 2: grouped, titled, left-aligned (>=16px) ── */
function MoreView({ groups }: { groups: Group[] }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {groups.map((g, gi) => (
        <div key={gi} className={`flex flex-col ${g.flex ? 'flex-1 min-h-0' : 'flex-shrink-0'} ${gi > 0 ? 'border-t-2 border-black' : ''}`}>
          <div className="px-4 pt-2 pb-1 text-[16px] font-black uppercase tracking-[0.1em]">{g.title}</div>
          {g.rows.map(([k, v], ri) => {
            const mono = isMono(v);
            return (
              <div key={ri} className={`px-4 pb-2 ${g.flex ? 'flex-1 min-h-0 overflow-hidden' : ''}`}>
                <div className="text-[16px] font-bold uppercase tracking-[0.06em]">{k}</div>
                <div className="text-[16px] font-bold break-words whitespace-normal leading-snug" style={mono ? MONO : undefined}>{mono ? segAddr(v) : v}</div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function Result({ done, onAgain }: { done: 'signed' | 'rejected'; onAgain: () => void }) {
  const ok = done === 'signed';
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
      <div className={`w-[80px] h-[80px] flex items-center justify-center border-2 border-black ${ok ? 'bg-black' : ''}`}>
        {ok ? <Check className="w-12 h-12 text-[#838383]" strokeWidth={3} /> : <X className="w-12 h-12 text-black" strokeWidth={3} />}
      </div>
      <div className="text-3xl font-black tracking-tight mt-5">{ok ? 'Signed' : 'Rejected'}</div>
      <button onClick={onAgain} className="mt-7 px-7 h-12 border-2 border-black text-[16px] font-black uppercase tracking-wide active:bg-black active:text-[#838383]">Again</button>
    </div>
  );
}

/** Dev-only scenario switcher — portal to <body>, outside the device frame (font rule N/A). */
function ScenarioBar({ id, onPick }: { id: ScenarioId; onPick: (n: ScenarioId) => void }) {
  return createPortal(
    <div className="fixed top-6 left-6 z-40 bg-white border-2 border-gray-300 rounded-lg shadow-2xl p-3 w-[150px]">
      <div className="text-xs font-bold text-gray-700 mb-2 pb-2 border-b border-gray-200">F · 签名场景</div>
      <div className="flex flex-col gap-1">
        {SCENARIOS.map(s => (
          <button key={s.id} onClick={() => onPick(s.id)} title={s.title}
            className={`h-7 px-2.5 rounded text-[11px] font-bold text-left flex items-center justify-between ${id === s.id ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            <span>{s.tab}</span>
            {RISK[s.id] === 'high' && <span className={`text-[9px] ${id === s.id ? 'text-white' : 'text-gray-500'}`}>⚠</span>}
          </button>
        ))}
      </div>
    </div>,
    document.body,
  );
}
