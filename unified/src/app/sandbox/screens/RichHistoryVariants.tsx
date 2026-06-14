import { ArrowUpRight, Shield, FileSignature, Repeat, ShieldAlert, Check, X as XIcon } from 'lucide-react';
import { TokenLogo } from '../icons/TokenLogo';
import type { VariantId } from '../SandboxPage';

interface Props { variant: VariantId; showDebugId?: boolean }

type Entry = {
  id: string;
  type: 'Transfer' | 'Approve' | 'Sign' | 'Swap' | 'Blind';
  token?: string;
  amount?: string;
  detail: string;
  time: string;
  group: 'today' | 'older';
  ok: boolean;
};

const ENTRIES: Entry[] = [
  { id: '1', type: 'Transfer', token: 'USDT', amount: '500',   detail: 'To My Ledger',   time: '14:32', group: 'today', ok: true },
  { id: '2', type: 'Approve',  token: 'USDT', amount: '1,000', detail: 'Uniswap Router', time: '14:01', group: 'today', ok: true },
  { id: '3', type: 'Sign',     detail: 'Uniswap login',                                  time: '12:47', group: 'today', ok: false },
  { id: '4', type: 'Swap',     token: 'USDT', amount: '1,000', detail: 'USDT to TRX',    time: 'Mar 14', group: 'older', ok: true },
  { id: '5', type: 'Blind',    detail: 'Raw transaction',                                time: 'Mar 12', group: 'older', ok: true },
];

const TYPE_ICON: Record<Entry['type'], typeof ArrowUpRight> = {
  Transfer: ArrowUpRight, Approve: Shield, Sign: FileSignature, Swap: Repeat, Blind: ShieldAlert,
};

const primary = (e: Entry) => (e.amount ? `${e.amount} ${e.token}` : e.type);

export function RichHistoryVariants({ variant }: Props) {
  if (variant === 'minimal')   return <Minimal />;
  if (variant === 'bold')      return <Bold />;
  if (variant === 'editorial') return <Editorial />;
  return <Classic />;
}

// ── MINIMAL — flat rows, hairline dividers, tiny status dot ──
function Minimal() {
  return (
    <div className="flex-1 flex flex-col px-6 pt-6">
      <div className="text-3xl font-bold text-black leading-none mb-6">History</div>
      <div className="flex flex-col">
        {ENTRIES.map((e, i) => (
          <div key={e.id} className={`flex items-center gap-3 py-3.5 ${i > 0 ? 'border-t border-black' : ''}`}>
            <div className="flex-1 min-w-0">
              <div className="text-base text-black truncate">{primary(e)}</div>
              <div className="text-[11px] text-black truncate mt-0.5">{e.type} · {e.detail}</div>
            </div>
            <span className="text-[11px] text-black flex-shrink-0">{e.time}</span>
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${e.ok ? 'bg-black' : 'border border-black'}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── BOLD — heavy black type, big amounts, status as a filled chip ──
function Bold() {
  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-black px-5 py-4 flex-shrink-0">
        <div className="text-3xl font-bold text-[#838383] leading-none">History</div>
      </div>
      <div className="flex-1 px-3 py-3 flex flex-col gap-2 overflow-hidden">
        {ENTRIES.slice(0, 4).map((e) => {
          const Icon = TYPE_ICON[e.type];
          return (
            <div key={e.id} className="flex items-center gap-3 px-3 py-2.5 bg-[#838383] border-2 border-black rounded-sm">
              <Icon className="w-7 h-7 text-black flex-shrink-0" strokeWidth={2.5} />
              <div className="flex-1 min-w-0">
                <div className="text-xl font-bold text-black leading-none truncate">{primary(e)}</div>
                <div className="text-[11px] text-black uppercase tracking-wide mt-1">{e.type}</div>
              </div>
              <div className={`px-2 h-6 flex items-center rounded-sm ${e.ok ? 'bg-black' : 'border-2 border-black'}`}>
                <span className={`text-[10px] font-bold uppercase ${e.ok ? 'text-[#838383]' : 'text-black'}`}>{e.ok ? 'OK' : 'No'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── EDITORIAL — magazine list: big numerals, ruled rows, type as eyebrow ──
function Editorial() {
  return (
    <div className="flex-1 flex flex-col px-5 pt-4">
      <div className="flex items-baseline justify-between pb-3 border-b-2 border-black">
        <span className="text-2xl font-bold text-black">History</span>
        <span className="text-[11px] text-black uppercase tracking-widest">{ENTRIES.length} items</span>
      </div>
      <div className="flex flex-col">
        {ENTRIES.map((e) => {
          const Icon = TYPE_ICON[e.type];
          return (
            <div key={e.id} className="flex items-center gap-3 py-3 border-b border-black">
              <Icon className="w-5 h-5 text-black flex-shrink-0" strokeWidth={2} />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-black uppercase tracking-[0.15em]">{e.type} · {e.time}</div>
                <div className="text-lg font-bold text-black leading-tight truncate">{primary(e)}</div>
                <div className="text-[11px] text-black truncate">{e.detail}</div>
              </div>
              {e.ok
                ? <Check className="w-4 h-4 text-black flex-shrink-0" strokeWidth={3} />
                : <XIcon className="w-4 h-4 text-black flex-shrink-0" strokeWidth={3} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── CLASSIC — current rich version: grouped, badged cards, big status circle ──
function Classic() {
  const groups = (['today', 'older'] as const)
    .map(g => ({ key: g, label: g === 'today' ? 'Today' : 'Earlier', items: ENTRIES.filter(e => e.group === g) }))
    .filter(g => g.items.length > 0);
  return (
    <div className="flex-1 flex flex-col">
      <div className="px-5 pt-4 pb-3 flex-shrink-0">
        <div className="text-2xl font-bold text-black leading-tight">History</div>
        <div className="text-xs text-black mt-0.5">{ENTRIES.length} signatures</div>
      </div>
      <div className="flex-1 px-3 pb-3 overflow-hidden">
        {groups.map((g, gi) => (
          <div key={g.key} className={gi > 0 ? 'mt-3' : ''}>
            <div className="flex items-center gap-2.5 px-1 mb-2">
              <span className="text-[11px] font-bold text-black uppercase tracking-widest">{g.label}</span>
              <div className="flex-1 h-[2px] bg-black" />
            </div>
            <div className="flex flex-col gap-2">
              {g.items.map((e) => {
                const Icon = TYPE_ICON[e.type];
                return (
                  <div key={e.id} className="flex items-center gap-3 px-3 h-[64px] border-2 border-black rounded-sm bg-[#838383]">
                    <div className="w-11 h-11 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                      <Icon className="w-[22px] h-[22px] text-[#838383]" strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {e.token && <TokenLogo symbol={e.token} size={18} />}
                        <span className="text-base font-bold text-black truncate">{primary(e)}</span>
                      </div>
                      <div className="text-xs text-black truncate leading-tight mt-1">{e.detail}</div>
                    </div>
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${e.ok ? 'bg-black' : 'border-2 border-black'}`}>
                        {e.ok ? <Check className="w-4 h-4 text-[#838383]" strokeWidth={3} /> : <XIcon className="w-4 h-4 text-black" strokeWidth={3} />}
                      </div>
                      <span className="text-[10px] text-black leading-none">{e.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
