import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, FileSignature, Bitcoin, ArrowLeftRight, FileCode } from 'lucide-react';
import { useState } from 'react';
import { TransferDetailPage } from './TransferDetailPage';
import type { TransferDetail } from './TransferDetailPage';
import { ApproveDetailPage } from './ApproveDetailPage';
import type { ApproveDetail } from './ApproveDetailPage';
import { SignMessageDetailPage } from './SignMessageDetailPage';
import type { SignMessageDetail } from './SignMessageDetailPage';
import { SwapDetailPage } from './SwapDetailPage';
import type { SwapDetail } from './SwapDetailPage';
import { BlindDetailPage } from './BlindDetailPage';
import type { BlindDetail } from './BlindDetailPage';

interface SignatureRecord {
  id: string;
  type: 'transfer' | 'approve' | 'sign' | 'swap' | 'blind';
  coin: string;
  network: string;
  amount: string;
  usdValue: string;
  timestamp: string;
  status: 'completed' | 'rejected';
  requestedByName?: string; // For sign type
}

interface SignatureHistoryPageProps {
  onBack: () => void;
}

// Monochrome crypto marks — recognisable coin logos drawn 1-bit (currentColor so
// they invert with the row), with a generic coin as the fallback for tokens we
// don't have a clean mark for.
// ETH — the classic double diamond: upper rhombus with a centre split, lower
// shard. Proportions follow the real mark (upper ~2/3, lower ~1/3).
const EthMark = ({ className = 'w-8 h-8' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round">
    <path d="M12 1.8 L18.6 12 L12 15.9 L5.4 12 Z" />
    <path d="M12 1.8 V15.9" />
    <path d="M5.9 13.7 L12 22.2 L18.1 13.7 L12 17.4 Z" />
    <path d="M12 17.4 V22.2" />
  </svg>
);
// USDT — Tether's real ₮ glyph: a T with a DOUBLE top bar, inside the disc
// (the official logo is exactly this symbol knocked out of a circle).
const UsdtMark = ({ className = 'w-8 h-8' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9.25" />
    <path d="M7 7 H17" />
    <path d="M7 9.8 H17" />
    <path d="M12 7 V17.4" />
  </svg>
);

// UNI — Uniswap's unicorn head, simplified to a 1-bit line mark: horn, curled
// muzzle, jaw, mane and ear. Bare glyph (no ring), same family as BTC/ETH.
const UniMark = ({ className = 'w-8 h-8' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    {/* horn */}
    <path d="M5.5 2.5 L10 8.2" />
    {/* forehead → muzzle with the curled nose */}
    <path d="M10 8.2 C7.8 9.2 6.2 11.2 5.4 13.8 C5 15.4 6 16.6 7.4 16.2 C8.4 15.9 8.8 14.9 8.4 14" />
    {/* jaw → chest */}
    <path d="M8.4 14 C9.6 13.4 10.8 13.6 11.8 14.4 C13.6 15.8 14.2 18.4 13.8 21.5" />
    {/* crown → mane → back of neck */}
    <path d="M10 8.2 C12.8 7 15.6 7.6 17.4 9.8 C19.4 12.4 19.8 16.6 18.6 21.5" />
    {/* ear */}
    <path d="M13.4 7.4 L14.8 4.6 L16.4 7.9" />
    {/* eye */}
    <circle cx="13.2" cy="11" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);
// USDC — the broken ring (gaps top and bottom) around a dollar sign.
const UsdcMark = ({ className = 'w-8 h-8' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.4 21.2 A9.6 9.6 0 0 1 9.4 2.8" />
    <path d="M14.6 2.8 A9.6 9.6 0 0 1 14.6 21.2" />
    <path d="M12 5.7 V18.3" />
    <path d="M14.8 9.2 C14.8 7.9 13.6 7.1 12 7.1 C10.4 7.1 9.2 7.9 9.2 9.3 C9.2 12.3 14.8 11.1 14.8 14.5 C14.8 15.9 13.6 16.9 12 16.9 C10.4 16.9 9.2 16 9.2 14.7" />
  </svg>
);

// Fallback for tokens without a dedicated mark — a monogram disc (ring + first
// letter), the standard unknown-token treatment. Same "circle + symbol" family
// as the USDT/USDC marks, so every token in the list gets a distinct icon.
const LetterMark = ({ coin, className = 'w-8 h-8' }: { coin: string; className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.5}>
    <circle cx="12" cy="12" r="9.25" />
    <text
      x="12" y="12.5"
      textAnchor="middle" dominantBaseline="central"
      fill="currentColor" stroke="none"
      fontSize="11" fontWeight="700" fontFamily="inherit"
    >
      {(coin || '?').charAt(0).toUpperCase()}
    </text>
  </svg>
);

const CryptoIcon = ({ coin, className = 'w-8 h-8' }: { coin: string; className?: string }) => {
  const c = (coin || '').toUpperCase();
  if (c === 'BTC' || c === 'WBTC') return <Bitcoin className={className} strokeWidth={2} />;
  if (c === 'ETH' || c === 'WETH') return <EthMark className={className} />;
  if (c === 'USDT') return <UsdtMark className={className} />;
  if (c === 'USDC' || c === 'DAI') return <UsdcMark className={className} />;
  if (c === 'UNI') return <UniMark className={className} />;
  return <LetterMark coin={coin} className={className} />;
};

// Helper function to format large numbers
const formatAmount = (amount: string): string => {
  const num = parseFloat(amount.replace(/,/g, ''));
  if (isNaN(num)) return amount;
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M';
  } else if (num >= 10000) {
    return (num / 1000).toFixed(2) + 'K';
  }
  
  // For small numbers, limit decimal places
  if (num < 1) {
    return num.toFixed(6).replace(/\.?0+$/, '');
  }
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
};

export function SignatureHistoryPage({ onBack }: SignatureHistoryPageProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedRecord, setSelectedRecord] = useState<SignatureRecord | null>(null);
  
  // Mock data
  const records: SignatureRecord[] = [
    {
      id: '1',
      type: 'transfer',
      coin: 'BTC',
      network: 'Bitcoin',
      amount: '0.0234',
      usdValue: '2,145.67',
      timestamp: '2026-02-28 14:23:15',
      status: 'completed'
    },
    {
      id: '2',
      type: 'transfer',
      coin: 'USDT',
      network: 'Tron',
      amount: '1,000.50',
      usdValue: '1,000.50',
      timestamp: '2026-02-28 13:05:22',
      status: 'completed'
    },
    {
      id: '11',
      type: 'swap',
      coin: 'USDT→TRX',
      network: 'Tron',
      amount: '1,000',
      usdValue: '1,000',
      timestamp: '2026-02-28 12:40:03',
      status: 'completed'
    },
    {
      id: '3',
      type: 'approve',
      coin: 'GOVERNANCE',
      network: 'Polygon zkEVM Mainnet',
      amount: '123,456.789012345678901234',
      usdValue: '9,876,543.21',
      timestamp: '2026-02-28 12:18:45',
      status: 'completed'
    },
    {
      id: '4',
      type: 'transfer',
      coin: 'WBTC',
      network: 'Optimism Mainnet',
      amount: '0.045',
      usdValue: '4,125.50',
      timestamp: '2026-02-28 11:45:32',
      status: 'completed'
    },
    {
      id: '5',
      type: 'sign',
      coin: 'BTC',
      network: 'Bitcoin',
      amount: '0',
      usdValue: '0',
      timestamp: '2026-02-27 20:33:18',
      status: 'completed',
      requestedByName: 'Uniswap'
    },
    {
      id: '6',
      type: 'transfer',
      coin: 'USDT',
      network: 'Ethereum',
      amount: '500.00',
      usdValue: '500.00',
      timestamp: '2026-02-27 18:12:08',
      status: 'completed'
    },
    {
      id: '7',
      type: 'approve',
      coin: 'CURVE',
      network: 'Arbitrum One',
      amount: '50,000.12345',
      usdValue: '125,000.50',
      timestamp: '2026-02-27 09:34:21',
      status: 'completed'
    },
    {
      id: '12',
      type: 'blind',
      coin: 'RAW DATA',
      network: 'Ethereum',
      amount: '0',
      usdValue: '0',
      timestamp: '2026-02-26 22:41:09',
      status: 'completed'
    },
    {
      id: '8',
      type: 'transfer',
      coin: 'BTC',
      network: 'Bitcoin',
      amount: '0.0089',
      usdValue: '816.43',
      timestamp: '2026-02-26 16:55:47',
      status: 'rejected'
    },
    {
      id: '9',
      type: 'transfer',
      coin: 'USDC',
      network: 'Polygon',
      amount: '1,000.00',
      usdValue: '1,000.00',
      timestamp: '2026-02-25 13:22:19',
      status: 'completed'
    },
    {
      id: '10',
      type: 'approve',
      coin: 'UNI',
      network: 'Ethereum',
      amount: '50.00',
      usdValue: '425.50',
      timestamp: '2026-02-24 10:08:33',
      status: 'completed'
    },
  ];

  // Rejected signatures are not listed — the history shows signed requests only,
  // so a row carries no status concept at all.
  const visibleRecords = records.filter(r => r.status !== 'rejected');

  const itemsPerPage = 4;
  const totalPages = Math.ceil(visibleRecords.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const currentRecords = visibleRecords.slice(startIndex, startIndex + itemsPerPage);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'transfer': return 'Transfer';
      case 'approve': return 'Approve';
      case 'sign': return 'Sign';
      case 'swap': return 'Swap';
      case 'blind': return 'Blind Sign';
      default: return type;
    }
  };

  // Convert record to transfer detail
  const getTransferDetail = (record: SignatureRecord): TransferDetail | null => {
    if (record.type !== 'transfer') return null;
    
    // Mock detailed data
    const gasFee = record.coin === 'BTC' ? '0.0001' : '0.0015';
    const gasFeeUsd = record.coin === 'BTC' ? '9.20' : '3.75';
    const amount = parseFloat(record.amount.replace(/,/g, ''));
    const total = (amount + parseFloat(gasFee)).toFixed(record.coin === 'BTC' ? 4 : 4);
    const totalUsd = (parseFloat(record.usdValue.replace(/,/g, '')) + parseFloat(gasFeeUsd)).toFixed(2);
    
    return {
      id: record.id,
      coin: record.coin,
      network: record.network,
      from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      to: '0x8Ba1f109551bD432803012645Ac136ddd64DBA72',
      amount: record.amount,
      usdValue: record.usdValue,
      gasLimit: record.coin === 'BTC' ? '21000' : '21000',
      gasFee: gasFee,
      gasFeeUsd: gasFeeUsd,
      totalAmount: total,
      totalUsd: totalUsd,
      timestamp: record.timestamp,
      status: record.status,
      txHash: '0xfc4122630deafb53b46d2e1539a4cc14e6e9d1f9840a85d5af5bf1d1762f925b',
    };
  };

  // Convert record to approve detail
  const getApproveDetail = (record: SignatureRecord): ApproveDetail | null => {
    if (record.type !== 'approve') return null;

    // Mock detailed data
    const gasFee = '0.0015';
    const gasFeeUsd = '3.75';

    // Mock spender addresses based on coin
    const getSpenderInfo = (coin: string) => {
      switch (coin) {
        case 'UNI':
          return {
            spender: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
            spenderName: 'Uniswap V3 Router'
          };
        case 'CURVE':
          return {
            spender: '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7',
            spenderName: 'Curve 3pool'
          };
        case 'GOVERNANCE':
          return {
            spender: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
            spenderName: 'Governance Contract'
          };
        default:
          return {
            spender: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
            spenderName: 'DeFi Protocol'
          };
      }
    };

    const { spender, spenderName } = getSpenderInfo(record.coin);
    const amount = parseFloat(record.amount.replace(/,/g, ''));
    const isUnlimited = amount > 1000000; // If amount is very large, treat as unlimited

    return {
      id: record.id,
      coin: record.coin,
      network: record.network,
      spender: spender,
      spenderName: spenderName,
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      amount: record.amount,
      usdValue: record.usdValue,
      gasLimit: '65000',
      gasFee: gasFee,
      gasFeeUsd: gasFeeUsd,
      totalUsd: gasFeeUsd,
      timestamp: record.timestamp,
      status: record.status,
      txHash: '0x24c9997adaa68b3465833fb72a70ecdf485e0e4c7bd8665fc45bebc44782c7db',
      isUnlimited: isUnlimited,
    };
  };

  // Convert record to sign message detail
  const getSignMessageDetail = (record: SignatureRecord): SignMessageDetail | null => {
    if (record.type !== 'sign') return null;

    // Mock different types of messages based on requestedByName
    const mockMessagesMap: Record<string, { requestedBy: string; url: string; rawMessage: string; messageType: 'text' | 'hex' }> = {
      'OpenSea': {
        requestedBy: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        url: 'opensea.io',
        rawMessage: 'Welcome to OpenSea!\n\nClick to sign in and accept the OpenSea Terms of Service.\n\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nWallet address:\n0x742d35cc6634c0532925a3b844bc9e7595f0beb\n\nNonce:\n8f3a2c1b9e4d7a6f',
        messageType: 'text',
      },
      'Uniswap': {
        requestedBy: '0x8Ba1f109551bD432803012645Ac136ddd64DBA72',
        url: 'app.uniswap.org',
        rawMessage: '0x19457468657265756d205369676e6564204d6573736167653a0a33321f9840a85d5af5bf1d1762f925bdaddc4201f984068b3465833fb72a70ecdf485e0e4c7bd8665fc45bebc44782c7db0a1a60cb6fe97d0b483032ff1c78ba1f109551bd432803012645ac136ddd64dba72742d35cc6634c0532925a3b844bc9e7595f0beb2b8d4c019ae7663f1d5bc47088e20a9c9f2c71a80b4ed31055c68a924d7fe021e4107bc923d6f58a0c1e92b76a44d8037a55d2c480fe19b36c0d81e54f2a9b67',
        messageType: 'hex',
      },
    };

    const messageData = mockMessagesMap[record.requestedByName || 'OpenSea'] || mockMessagesMap['OpenSea'];

    return {
      id: record.id,
      network: record.network,
      requestedBy: messageData.requestedBy,
      requestedByName: record.requestedByName,
      url: messageData.url,
      timestamp: record.timestamp,
      rawMessage: messageData.rawMessage,
      messageType: messageData.messageType,
      status: record.status,
      txHash: '0xac0caf8537ed31055c68a924d7fe0212b8d4c019ae7663f1d5bc47088e20a9c1',
    };
  };

  // Convert record to swap detail — mirrors the signing-time swap mock data.
  const getSwapDetail = (record: SignatureRecord): SwapDetail | null => {
    if (record.type !== 'swap') return null;
    return {
      id: record.id,
      tokenIn: 'USDT',
      tokenOut: 'TRX',
      amountIn: '1,000',
      amountOut: '6,800.098765432109876543',
      network: record.network,
      from: 'TJYeasTPa6gpEEfYqv8q3qyq3qLZ8nLb9p',
      contractName: 'SunSwap V2 Router',
      contractAddress: 'TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax',
      method: 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
      fee: '27.5',
      feeToken: 'TRX',
      timestamp: record.timestamp,
      txHash: '0x55c68a924d7fe0212b8d4c019ae7663f1d5bc47088e20a9c9f2c71a80b4ed310',
    };
  };

  // Convert record to blind detail — mirrors the signing-time blind mock data.
  const getBlindDetail = (record: SignatureRecord): BlindDetail | null => {
    if (record.type !== 'blind') return null;
    return {
      id: record.id,
      network: record.network,
      methodId: '0x5ae401dc',
      contractAddress: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      rawData: '0x5ae401dc0000000000000000000000000000000000000000000000000000000065f0c8e000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000e404e45aaf0000000000000000000000001f9840a85d5af5bf1d1762f925bdaddc4201f984000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      timestamp: record.timestamp,
      txHash: '0x88e20a9c9f2c71a80b4ed31055c68a924d7fe0212b8d4c019ae7663f1d5bc470',
    };
  };

  // Show detail page if a swap record is selected
  if (selectedRecord && selectedRecord.type === 'swap') {
    const detail = getSwapDetail(selectedRecord);
    if (detail) {
      return <SwapDetailPage onBack={() => setSelectedRecord(null)} detail={detail} />;
    }
  }

  // Show detail page if a blind record is selected
  if (selectedRecord && selectedRecord.type === 'blind') {
    const detail = getBlindDetail(selectedRecord);
    if (detail) {
      return <BlindDetailPage onBack={() => setSelectedRecord(null)} detail={detail} />;
    }
  }

  // Show detail page if a transfer record is selected
  if (selectedRecord && selectedRecord.type === 'transfer') {
    const detail = getTransferDetail(selectedRecord);
    if (detail) {
      return <TransferDetailPage onBack={() => setSelectedRecord(null)} detail={detail} />;
    }
  }

  // Show detail page if an approve record is selected
  if (selectedRecord && selectedRecord.type === 'approve') {
    const detail = getApproveDetail(selectedRecord);
    if (detail) {
      return <ApproveDetailPage onBack={() => setSelectedRecord(null)} detail={detail} />;
    }
  }

  // Show detail page if a sign message record is selected
  if (selectedRecord && selectedRecord.type === 'sign') {
    const detail = getSignMessageDetail(selectedRecord);
    if (detail) {
      return <SignMessageDetailPage onBack={() => setSelectedRecord(null)} detail={detail} />;
    }
  }

  return (
    <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
      {/* Header */}
      <div className="h-[45px] px-5 flex items-center justify-between border-b-2 border-black flex-shrink-0">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
          <span className="text-lg font-bold text-black uppercase tracking-wide">Sign History</span>
        </button>
        {totalPages > 1 && (
          <span className="text-lg font-bold text-black tabular-nums">
            {currentPage + 1}/{totalPages}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-5 overflow-hidden">
        {records.length === 0 ? (
          // Empty State
          <div className="flex-1 flex flex-col items-center justify-center">
            <FileSignature className="w-16 h-16 text-black mb-3" strokeWidth={1.5} />
            <div className="text-base font-bold text-black uppercase mb-2">No History</div>
            <div className="text-xs text-black text-center">
              Signature records will appear here
            </div>
          </div>
        ) : (
          <>
            {/* Records List */}
            <div className="flex-1 space-y-2.5 overflow-hidden">
              {currentRecords.map((record) => {
                return (
                  <div
                    key={record.id}
                    className="border-2 border-black rounded-sm p-3 bg-[#838383] hover:bg-black hover:text-[#838383] active:scale-[0.98] transition-all cursor-pointer"
                    onClick={() => setSelectedRecord(record)}
                  >
                    {/* Top: icon + "COIN (Network)" ··· amount + drill-in chevron.
                        One line, mirroring the signing screens' token format.
                        Content is normal weight (size carries rank: 20px primary,
                        18px secondary); the list abbreviates the amount — full
                        precision lives in the detail page. The merged line
                        truncates; the detail page carries the full names. */}
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          {record.type === 'sign' ? (
                            <FileSignature className="w-7 h-7" strokeWidth={2} />
                          ) : record.type === 'swap' ? (
                            <ArrowLeftRight className="w-7 h-7" strokeWidth={2} />
                          ) : record.type === 'blind' ? (
                            <FileCode className="w-7 h-7" strokeWidth={2} />
                          ) : (
                            <CryptoIcon coin={record.coin} className="w-7 h-7" />
                          )}
                        </div>
                        <div className="text-xl font-normal uppercase truncate">
                          {record.type === 'sign' ? (record.requestedByName || 'Unknown') : record.coin} ({record.network})
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {record.amount !== '0' && (
                          <div className="text-xl font-normal tabular-nums" title={record.amount}>
                            {formatAmount(record.amount)}
                          </div>
                        )}

                        {/* Drill-in affordance — the whole card is tappable; the
                            chevron says "opens a detail page". */}
                        <ChevronRight className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
                      </div>
                    </div>

                    {/* Bottom: type (normal) + timestamp (light) — 18px metadata. */}
                    <div className="flex items-center justify-between pt-2 border-t-2 border-black">
                      <span className="text-lg font-normal uppercase">{getTypeLabel(record.type)}</span>
                      <span className="text-lg font-light">{record.timestamp}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center gap-3 mt-2.5 pt-2.5 border-t-2 border-black">
                {currentPage > 0 && (
                  <button
                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                    className="flex-1 h-12 border-2 border-black rounded-sm bg-[#838383] hover:bg-black hover:text-[#838383] active:scale-95 transition-all flex items-center justify-center gap-2 font-bold text-lg uppercase tracking-wide"
                  >
                    <ChevronUp className="w-4 h-4" strokeWidth={2.5} />
                    Prev
                  </button>
                )}

                {currentPage < totalPages - 1 && (
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                    className="flex-1 h-12 border-2 border-black rounded-sm bg-[#838383] hover:bg-black hover:text-[#838383] active:scale-95 transition-all flex items-center justify-center gap-2 font-bold text-lg uppercase tracking-wide"
                  >
                    Next
                    <ChevronDown className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}