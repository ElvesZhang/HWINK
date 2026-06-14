import {
  ArrowUpRight, Shield, FileSignature, Repeat, ShieldAlert, Check, X as XIcon,
} from 'lucide-react';
import { TokenLogo } from '../icons/TokenLogo';

interface Props { showDebugId?: boolean }

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

// Spans all five sign types so the icon badges read side by side.
const ENTRIES: Entry[] = [
  { id: '1', type: 'Transfer', token: 'USDT', amount: '500',   detail: 'To My Ledger',   time: '14:32', group: 'today', ok: true },
  { id: '2', type: 'Approve',  token: 'USDT', amount: '1,000', detail: 'Uniswap Router', time: '14:01', group: 'today', ok: true },
  { id: '3', type: 'Sign',     detail: 'Uniswap login',                                  time: '12:47', group: 'today', ok: false },
  { id: '4', type: 'Swap',     token: 'USDT', amount: '1,000', detail: 'USDT to TRX',    time: 'Mar 14', group: 'older', ok: true },
  { id: '5', type: 'Blind',    detail: 'Raw transaction',                                time: 'Mar 12', group: 'older', ok: true },
];

const TYPE_ICON: Record<Entry['type'], typeof ArrowUpRight> = {
  Transfer: ArrowUpRight,
  Approve: Shield,
  Sign: FileSignature,
  Swap: Repeat,
  Blind: ShieldAlert,
};

const GROUP_LABEL: Record<'today' | 'older', string> = {
  today: 'Today',
  older: 'Earlier',
};

export function RichSignHistoryPage(_: Props) {
  const groups = (['today', 'older'] as const)
    .map(g => ({ key: g, items: ENTRIES.filter(e => e.group === g) }))
    .filter(g => g.items.length > 0);

  return (
    <div className="flex-1 flex flex-col">
      {/* Page title strip */}
      <div className="px-5 pt-4 pb-3 flex-shrink-0">
        <div className="text-2xl font-bold text-black leading-tight">History</div>
        <div className="text-xs text-black mt-0.5">{ENTRIES.length} signatures</div>
      </div>

      {/* List */}
      <div className="flex-1 px-3 pb-3 overflow-hidden">
        {groups.map((g, gi) => (
          <div key={g.key} className={gi > 0 ? 'mt-3' : ''}>
            {/* Date section header with side rules */}
            <div className="flex items-center gap-2.5 px-1 mb-2">
              <span className="text-[11px] font-bold text-black uppercase tracking-widest">
                {GROUP_LABEL[g.key]}
              </span>
              <div className="flex-1 h-[2px] bg-black" />
            </div>

            {/* Record cards */}
            <div className="flex flex-col gap-2">
              {g.items.map((e) => {
                const Icon = TYPE_ICON[e.type];
                return (
                  <div
                    key={e.id}
                    className="flex items-center gap-3 px-3 h-[66px] border-2 border-black rounded-sm bg-[#838383]"
                  >
                    {/* type icon badge — large left anchor */}
                    <div className="w-11 h-11 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                      <Icon className="w-[22px] h-[22px] text-[#838383]" strokeWidth={2} />
                    </div>

                    {/* middle: primary line (big) + secondary line */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {e.token && <TokenLogo symbol={e.token} size={18} />}
                        <span className="text-base font-bold text-black truncate">
                          {e.amount ? `${e.amount} ${e.token}` : e.type}
                        </span>
                      </div>
                      <div className="text-xs text-black truncate leading-tight mt-1">
                        {e.detail}
                      </div>
                    </div>

                    {/* right: status badge (big) over time */}
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center ${
                          e.ok ? 'bg-black' : 'border-2 border-black'
                        }`}
                      >
                        {e.ok ? (
                          <Check className="w-4 h-4 text-[#838383]" strokeWidth={3} />
                        ) : (
                          <XIcon className="w-4 h-4 text-black" strokeWidth={3} />
                        )}
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
