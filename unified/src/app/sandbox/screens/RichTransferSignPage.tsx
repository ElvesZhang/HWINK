import { ArrowDown, Check, X } from 'lucide-react';
import { TokenLogo } from '../icons/TokenLogo';

interface Props { showDebugId?: boolean }

// Rich-style transfer confirmation. The amount + token + network all live
// inside one black-filled hero card — single most important block on the
// screen. Below it: a separate bordered "From → To" card and a tight
// metadata row. Reject / Confirm pinned at the bottom.
export function RichTransferSignPage(_: Props) {
  // Mock data parallels the main app's mockTransfer (USDT on Tron) so the
  // sandbox screen reads as a real transaction, not a wireframe.
  const tx = {
    tokenSymbol: 'USDT',
    network: 'Tron',
    amount: '500',
    fiatValue: '$500.00',
    from: 'TJYeasTPa6gpEEfYqv8q3qyq3qLZ8nLb9p',
    to: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9',
    toName: 'My Ledger',
    maxFee: '13.5',
    gasTokenSymbol: 'TRX',
  };

  // Bold the first / last 6 characters of an address — same convention as
  // the main app's BoldEndsAddress (hardware-wallet best practice for
  // visual verification).
  const renderAddr = (addr: string) => {
    if (addr.length <= 12) return <span className="font-bold">{addr}</span>;
    return (
      <>
        <span className="font-bold">{addr.slice(0, 6)}</span>
        {addr.slice(6, -6)}
        <span className="font-bold">{addr.slice(-6)}</span>
      </>
    );
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Page title strip — distinct from sandbox nav so the screen reads as
         a real confirmation page. */}
      <div className="px-5 pt-3 pb-2 flex items-center justify-between flex-shrink-0">
        <span className="text-sm font-bold text-black uppercase tracking-wide">Confirm Send</span>
        <span className="text-[10px] text-black uppercase tracking-widest">Tron</span>
      </div>

      <div className="flex-1 px-4 pb-3 space-y-3 overflow-hidden">
        {/* AMOUNT HERO — black-filled card with token logo + amount + meta */}
        <div className="bg-black rounded-sm px-4 py-4">
          <div className="text-[10px] text-[#838383] uppercase tracking-widest mb-2">Amount</div>
          <div className="flex items-center gap-3">
            <TokenLogo symbol={tx.tokenSymbol} size={44} inverted />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-4xl font-bold text-[#838383] tracking-tight leading-none">{tx.amount}</span>
                <span className="text-base font-bold text-[#838383] uppercase">{tx.tokenSymbol}</span>
              </div>
              <div className="text-xs text-[#838383] mt-1">{tx.fiatValue} · on {tx.network}</div>
            </div>
          </div>
        </div>

        {/* FROM → TO CARD — a single bordered container so the flow is one
           cohesive object instead of two scattered text blocks. */}
        <div className="border-2 border-black rounded-sm">
          <div className="px-3 py-2">
            <div className="text-[10px] text-black uppercase tracking-wide mb-0.5">From</div>
            <div className="text-[11px] font-mono text-black break-all leading-snug">
              {renderAddr(tx.from)}
            </div>
          </div>
          <div className="flex items-center px-3 py-1">
            <div className="flex-1 h-px bg-black" />
            <ArrowDown className="w-3.5 h-3.5 text-black mx-2" strokeWidth={2.5} />
            <div className="flex-1 h-px bg-black" />
          </div>
          <div className="px-3 py-2">
            <div className="flex items-baseline justify-between mb-0.5">
              <span className="text-[10px] text-black uppercase tracking-wide">To</span>
              {tx.toName && (
                <span className="text-[10px] font-bold text-black">{tx.toName}</span>
              )}
            </div>
            <div className="text-[11px] font-mono text-black break-all leading-snug">
              {renderAddr(tx.to)}
            </div>
          </div>
        </div>

        {/* META row — single-line gas summary, compact */}
        <div className="flex items-center justify-between px-1 pt-1">
          <span className="text-[10px] text-black uppercase tracking-widest">Network Fee</span>
          <span className="text-xs font-bold text-black font-mono">{tx.maxFee} {tx.gasTokenSymbol}</span>
        </div>
      </div>

      {/* ACTION BAR — same shape as main app: reject (80px wide) + confirm (fills) */}
      <div className="mx-4 mb-3 pt-3 border-t-2 border-black flex gap-2 flex-shrink-0">
        <button className="w-[80px] h-[60px] border-2 border-black rounded-sm flex items-center justify-center active:bg-black active:text-[#838383]">
          <X className="w-5 h-5 text-black" strokeWidth={2.5} />
        </button>
        <button className="flex-1 h-[60px] bg-black rounded-sm flex items-center justify-center gap-2 active:bg-[#838383] active:text-black">
          <Check className="w-5 h-5 text-[#838383]" strokeWidth={2.5} />
          <span className="text-sm font-bold text-[#838383] uppercase tracking-wide">Confirm</span>
        </button>
      </div>
    </div>
  );
}
