import { ChevronLeft, ChevronRight, AlertTriangle, Info, Check, X, ShieldAlert, ArrowUpRight, ArrowDown, Loader2, FileText, ArrowRight, Fingerprint } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { ChangePINPage } from './ChangePINPage';
import { FingerprintVerifyPage } from './FingerprintVerifyPage';
import { DetailListView, PreciseAmount, BoldEndsAddress } from './DetailListView';
import type { DetailField } from './DetailListView';
import type { SignType } from './DebugPanel';

type RiskLevel = 'low' | 'medium' | 'high';

interface TransferRequest {
  type: 'transfer';
  network: string; token: string; tokenSymbol: string;
  from: string; to: string; toName?: string;
  amount: string; fiatValue: string;
  gasLimit: string; maxFee: string; priorityFee: string;
  gasTokenSymbol?: string;
  totalCost: string; totalCostFiat: string;
  contractVerified?: boolean; riskFactors: string[];
  verifyCode?: string; // 6-digit verification code for hardware-software communication
}
interface MessageRequest {
  type: 'message';
  network: string; dapp: string; dappUrl: string;
  message: string; address: string; riskFactors: string[];
  /** When the message originates from a specific contract rather than a dApp,
   *  this holds that contract's address (shown under the requester name). */
  contractAddress?: string;
}
interface BlindRequest {
  type: 'blind';
  network: string; address: string; contractAddress: string;
  rawData: string; methodId: string; riskFactors: string[];
  /** Optional gas — some blind-signed transactions cost gas (shown as a second
   *  column next to Network). Omit for gasless raw-data signatures. */
  maxFee?: string; gasTokenSymbol?: string;
}
interface ContractCallRequest {
  type: 'contractCall';
  network: string; address: string; contractName: string; method: string;
  contractAddress: string;
  tokenIn: string; tokenOut: string; amountIn: string; amountOut: string;
  networkIn: string; networkOut: string;
  maxFee: string; tokenSymbol: string; riskFactors: string[];
}
interface ApproveRequest {
  type: 'approve';
  network: string; token: string; tokenSymbol: string;
  spender: string; spenderName: string;
  amount: string; fiatValue: string;
  isUnlimited: boolean;
  gasLimit: string; maxFee: string; gasTokenSymbol: string;
  address: string; riskFactors: string[];
  /** Absolute expiry (Permit2 style), e.g. "2026-06-30 14:32 UTC". Shown on
   *  the main screen, outside the details view. */
  expiry?: string;
}

type SignRequest = TransferRequest | MessageRequest | BlindRequest | ContractCallRequest | ApproveRequest;

interface SignRequestPageProps {
  onBack: () => void;
  request?: SignRequest;
  signType?: SignType;
  debugNetwork?: string;
  layoutVariant?: 'A' | 'B' | 'C' | 'D' | 'E';
  /** Whether the device has a fingerprint enrolled. Drives the confirm second
   *  factor: true → fingerprint scan, false → PIN keypad. */
  fingerprintEnrolled?: boolean;
  /** Whether the one-time "set up fingerprint?" prompt has already been shown. */
  fingerprintPrompted?: boolean;
  /** Answer to the one-time enrol prompt (enable=true → start using fingerprint). */
  onFingerprintPromptDone?: (enable: boolean) => void;
  showDebugId?: boolean;
}

// ── Mock Data ──

const mockTransfer: TransferRequest = {
  type: 'transfer', network: 'Tron', token: 'USDT', tokenSymbol: 'USDT',
  from: 'TJYeasTPa6gpEEfYqv8q3qyq3qLZ8nLb9p',
  to: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9',
  toName: 'My Ledger', amount: '500', fiatValue: '$500.00',
  gasLimit: '21000', maxFee: '13.5', priorityFee: '0',
  gasTokenSymbol: 'TRX',
  totalCost: '500', totalCostFiat: '$500.00',
  contractVerified: true, riskFactors: [],
};
// Same transfer, but carrying a hardware↔app verification code — lands on the
// dedicated Verify Code screen first. Exposed as its own debug sign type.
const mockTransferVerify: TransferRequest = {
  ...mockTransfer,
  verifyCode: '748392',
};
const mockMessage: MessageRequest = {
  type: 'message', network: 'Ethereum', dapp: 'Uniswap', dappUrl: 'app.uniswap.org',
  message: 'Welcome to Uniswap!\n\nClick to sign in and accept the Uniswap Terms of Service: https://uniswap.org/terms-of-service\n\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nYour authentication status will remain active for 24 hours.\n\nWallet address:\n0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb\n\nNonce: 8f2e9a7b\n\nTimestamp: 2026-05-12T10:30:00Z\n\nChain ID: 1',
  address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', riskFactors: [],
};
const mockBlind: BlindRequest = {
  type: 'blind', network: 'Ethereum',
  address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  contractAddress: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
  // Realistic multicall calldata length — long enough to exercise the
  // whole-page raw-data flipping on the blind-sign screen.
  rawData: '0x5ae401dc0000000000000000000000000000000000000000000000000066156bb4600000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000124b858183f00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000042dac17f958d2ee523a2206206994597c13d831ec70001f4c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20001f46b175474e89094c44da98b954eedeac495271d0f00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000049404b7c0000000000000000000000000000000000000000000000000429d069189e00000000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488d',
  methodId: '0x5ae401dc',
  riskFactors: ['Unable to decode transaction', 'Unknown contract interaction'],
};
const mockContractCall: ContractCallRequest = {
  type: 'contractCall', network: 'Tron',
  address: 'TJYeasTPa6gpEEfYqv8q3qyq3qLZ8nLb9p',
  contractName: 'SunSwap V2 Router',
  contractAddress: 'TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax',
  method: 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
  tokenIn: 'USDT', tokenOut: 'TRX',
  amountIn: '1,234.567890123456789012', amountOut: '6,800.098765432109876543',
  networkIn: 'Tron', networkOut: 'Tron',
  maxFee: '27.5', tokenSymbol: 'TRX', riskFactors: [],
};
const mockApprove: ApproveRequest = {
  type: 'approve', network: 'Ethereum', token: 'USDT', tokenSymbol: 'USDT',
  spender: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
  spenderName: 'Uniswap Universal Router',
  amount: 'UNLIMITED', fiatValue: '',
  isUnlimited: true,
  gasLimit: '65000', maxFee: '0.0015', gasTokenSymbol: 'ETH',
  address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  riskFactors: ['Unlimited approval - spender can transfer any amount'],
};
// Approval capped to a specific amount, with an absolute expiry (Permit2 style).
const mockApproveLimited: ApproveRequest = {
  type: 'approve', network: 'Ethereum', token: 'USDT', tokenSymbol: 'USDT',
  spender: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
  spenderName: 'Uniswap Universal Router',
  // Long amount on purpose — demonstrates the full-precision wrap handling.
  amount: '1,234,567.890123456789', fiatValue: '$1,234,567.89',
  isUnlimited: false,
  gasLimit: '65000', maxFee: '0.0015', gasTokenSymbol: 'ETH',
  address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  expiry: '2026-06-30 14:32 UTC',
  riskFactors: [],
};

const mockByType: Record<string, SignRequest> = {
  transfer: mockTransfer, verifyCode: mockTransferVerify,
  message: mockMessage,
  blind: mockBlind,
  contractCall: mockContractCall,
  approve: mockApprove, approveLimit: mockApproveLimited,
};

// ── Shared UI ──

function PageHeader({ title, onBack, rightIcon }: { title: string; onBack?: () => void; rightIcon?: React.ReactNode }) {
  return (
    <div className="h-[45px] px-5 flex items-center justify-between border-b-2 border-black flex-shrink-0">
      {onBack ? (
        <button onClick={onBack} className="flex items-center gap-2">
          <ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
          <span className="text-lg font-bold text-black uppercase tracking-wide">{title}</span>
        </button>
      ) : (
        <span className="text-lg font-bold text-black uppercase tracking-wide">{title}</span>
      )}
      {rightIcon && <div>{rightIcon}</div>}
    </div>
  );
}

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between py-1.5">
      <span className="text-lg font-light text-black uppercase tracking-wide flex-shrink-0 mr-3">{label}</span>
      <span className={`text-lg font-normal text-black text-right break-all ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}

// BoldEndsAddress now lives in ./DetailListView (shared across detail screens).

// ══════════════════════════════
// ── Main Component ──
// ══════════════════════════════


/** One-time prompt shown after the first successful PIN on a device with no
 *  fingerprint enrolled: offer to start using fingerprint. */
function FingerprintEnrollPrompt({ onEnable, onSkip }: { onEnable: () => void; onSkip: () => void }) {
  return (
    <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
      <div className="h-[45px] px-5 flex items-center border-b-2 border-black flex-shrink-0">
        <span className="text-lg font-bold text-black uppercase tracking-wide">Set Up Fingerprint</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="w-[120px] h-[120px] border-2 border-black rounded-sm flex items-center justify-center mb-6">
          <Fingerprint className="w-20 h-20 text-black" strokeWidth={1.75} />
        </div>
        <div className="text-2xl font-bold text-black">Use fingerprint?</div>
        <p className="text-xl font-bold text-black mt-3 leading-snug">
          Enrol your fingerprint to confirm signatures faster — no PIN next time.
        </p>
      </div>
      <div className="flex border-t-2 border-black flex-shrink-0">
        <button onClick={onSkip} className="flex-1 h-16 border-r-2 border-black flex items-center justify-center active:bg-black active:text-[#838383]">
          <span className="text-lg font-bold uppercase tracking-wide">Not now</span>
        </button>
        <button onClick={onEnable} className="flex-1 h-16 bg-black text-[#838383] flex items-center justify-center gap-2 active:bg-[#838383] active:text-black">
          <Fingerprint className="w-6 h-6" strokeWidth={2.5} />
          <span className="text-lg font-bold uppercase tracking-wide">Enable</span>
        </button>
      </div>
    </div>
  );
}

export function SignRequestPage({ onBack, request, signType, debugNetwork, layoutVariant: externalLayoutVariant, fingerprintEnrolled = false, fingerprintPrompted = false, onFingerprintPromptDone, showDebugId }: SignRequestPageProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [detailsPage, setDetailsPage] = useState(0);
  // Transfer (layout E) gates behind a Verify Code screen; this toggles into
  // the transaction-overview detail view reached from "Transaction Details →".
  const [showTxOverview, setShowTxOverview] = useState(false);
  const [secondFactor, setSecondFactor] = useState<null | 'fingerprint' | 'pin'>(null);
  const [enrollAsk, setEnrollAsk] = useState(false);
  // Set when the first PIN succeeds (no fingerprint, not yet prompted); the
  // enrol offer is then shown after the success screen's Done.
  const [enrollPending, setEnrollPending] = useState(false);
  const [status, setStatus] = useState<'pending' | 'signing' | 'success' | 'rejected'>('pending');
  const layoutVariant = externalLayoutVariant || 'C';
  const [msgExpanded, setMsgExpanded] = useState(false);
  const [contentPage, setContentPage] = useState(0);

  // Message pagination states
  const [messageHeight, setMessageHeight] = useState(0);
  const [messageContentPage, setMessageContentPage] = useState(0);
  const measureRef = useRef<HTMLDivElement>(null);
  // The visible message box flex-fills the remaining space; we measure its
  // height so pagination adapts to the requester height (no action-bar overlap).
  const messageBoxRef = useRef<HTMLDivElement>(null);
  const [messageBoxHeight, setMessageBoxHeight] = useState(0);

  // Blind signing raw data pagination states
  const [rawDataHeight, setRawDataHeight] = useState(0);
  const [rawDataContentPage, setRawDataContentPage] = useState(0);
  const rawDataMeasureRef = useRef<HTMLDivElement>(null);
  // Visible raw-data box flex-fills remaining space; measured for pagination.
  const rawDataBoxRef = useRef<HTMLDivElement>(null);
  const [rawDataBoxHeight, setRawDataBoxHeight] = useState(0);
  // Contract/network block height — page 2+ hides it so raw data gets the full
  // content area (whole-page flipping for long payloads).
  const blindHeadRef = useRef<HTMLDivElement>(null);
  const [blindHeadHeight, setBlindHeadHeight] = useState(0);

  const baseRequest: SignRequest = request || mockByType[signType || 'transfer'];
  const currentRequest: SignRequest = debugNetwork
    ? { ...baseRequest, network: debugNetwork }
    : baseRequest;

  // Measure message content height for pagination
  useEffect(() => {
    if (measureRef.current && currentRequest.type === 'message') {
      const height = measureRef.current.scrollHeight;
      setMessageHeight(height);
    }
  }, [currentRequest]);

  // Measure the visible (flex-filled) message box for pagination
  useEffect(() => {
    if (messageBoxRef.current && currentRequest.type === 'message') {
      setMessageBoxHeight(messageBoxRef.current.clientHeight);
    }
  }, [currentRequest]);

  // Reset message content page when request changes
  useEffect(() => {
    setMessageContentPage(0);
  }, [currentRequest]);

  // Reset transfer verify-code/overview toggle only when the sign type or
  // request actually changes (not on every render — currentRequest is a fresh
  // object each render, which would bounce the user back off the detail view).
  useEffect(() => {
    setShowTxOverview(false);
  }, [signType, request]);

  // Measure blind signing raw data content height for pagination
  useEffect(() => {
    if (rawDataMeasureRef.current && currentRequest.type === 'blind') {
      const height = rawDataMeasureRef.current.scrollHeight;
      setRawDataHeight(height);
    }
  }, [currentRequest]);

  // Measure the visible (flex-filled) raw-data box for pagination. Both run on
  // page 1 (rawDataContentPage resets to 0 per request), where the head exists.
  useEffect(() => {
    if (rawDataBoxRef.current && currentRequest.type === 'blind') {
      setRawDataBoxHeight(rawDataBoxRef.current.clientHeight);
    }
    if (blindHeadRef.current && currentRequest.type === 'blind') {
      setBlindHeadHeight(blindHeadRef.current.offsetHeight);
    }
  }, [currentRequest]);

  // Reset raw data content page when request changes
  useEffect(() => {
    setRawDataContentPage(0);
  }, [currentRequest]);

  const getRiskLevel = (req: SignRequest): RiskLevel => {
    if (req.riskFactors.length >= 2) return 'high';
    if (req.riskFactors.length === 1) return 'medium';
    return 'low';
  };
  const riskLevel = getRiskLevel(currentRequest);

  // ── Second-factor verification (required for EVERY confirm) ──
  const onSecondFactorSuccess = () => { setSecondFactor(null); setStatus('signing'); setTimeout(() => setStatus('success'), 1500); };
  // First successful PIN on a device with no fingerprint → sign as normal
  // (signing → success), then offer to enrol when the user taps Done (asked once).
  const onPinSuccess = () => {
    if (!fingerprintEnrolled && !fingerprintPrompted) setEnrollPending(true);
    onSecondFactorSuccess();
  };
  // Enable → the App navigates to the Settings fingerprint page; Not now → home.
  const answerEnroll = (enable: boolean) => { setEnrollAsk(false); onFingerprintPromptDone?.(enable); if (!enable) onBack(); };
  if (secondFactor === 'fingerprint') {
    return <FingerprintVerifyPage onBack={() => setSecondFactor(null)} onVerifySuccess={onSecondFactorSuccess} showDebugId={showDebugId} />;
  }
  if (secondFactor === 'pin') {
    return (
      <ChangePINPage onBack={() => setSecondFactor(null)} randomized={true} mode="verify"
        onVerifySuccess={onPinSuccess} showDebugId={showDebugId}
      />
    );
  }
  if (enrollAsk) {
    return <FingerprintEnrollPrompt onEnable={() => answerEnroll(true)} onSkip={() => answerEnroll(false)} />;
  }

  // ── Result ──
  if (status === 'success' || status === 'rejected') {
    const ok = status === 'success';
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <PageHeader title={ok ? 'Complete' : 'Rejected'} />
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 ${ok ? 'bg-black' : 'border-3 border-black'}`}>
            {ok ? <Check className="w-11 h-11 text-[#838383]" strokeWidth={3} /> : <X className="w-11 h-11 text-black" strokeWidth={3} />}
          </div>
          <div className="text-lg font-bold text-black uppercase tracking-wide mb-1.5 text-center">{ok ? 'Signed Successfully' : 'Signature Rejected'}</div>
          <div className="text-xs text-black text-center leading-relaxed">{ok ? 'Transaction signed and broadcast' : 'You declined this request'}</div>
        </div>
        <div className="px-5 pb-5">
          <button
            onClick={() => { if (ok && enrollPending) { setEnrollPending(false); setEnrollAsk(true); } else { onBack(); } }}
            className="w-full h-[56px] border-2 border-black rounded-sm hover:bg-black group active:scale-[0.98] transition-all flex items-center justify-center">
            <span className="text-lg font-bold text-black group-hover:text-[#838383] uppercase tracking-wide">Done</span>
          </button>
        </div>
      </div>
    );
  }

  // ── Signing ──
  if (status === 'signing') {
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <PageHeader title="Signing" />
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="w-20 h-20 border-3 border-black rounded-full flex items-center justify-center mb-5 animate-pulse">
            <div className="w-10 h-10 border-3 border-black border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="text-lg font-bold text-black uppercase tracking-wide mb-1.5">Processing</div>
          <div className="text-xs text-black text-center">Generating signature...</div>
        </div>
      </div>
    );
  }

  const handleConfirm = () => { setSecondFactor(fingerprintEnrolled ? 'fingerprint' : 'pin'); };
  const handleReject = () => { setStatus('rejected'); };

  // ── Shared Elements ──
  const actionButtons = (
    <div className="mx-4 mt-3 mb-4 pt-3 border-t-2 border-black flex gap-2 flex-shrink-0">
      <button onClick={handleReject} className="w-[80px] h-[60px] border-2 border-black rounded-sm hover:bg-black group active:scale-[0.97] transition-all flex items-center justify-center flex-shrink-0">
        <X className="w-5 h-5 text-black group-hover:text-[#838383]" strokeWidth={2.5} />
      </button>
      <button onClick={handleConfirm} className="flex-1 h-[60px] bg-black rounded-sm hover:bg-[#222] active:scale-[0.97] transition-all flex items-center justify-center gap-2">
        <Check className="w-5 h-5 text-[#838383]" strokeWidth={2.5} />
        <span className="text-lg font-bold text-[#838383] uppercase tracking-wide">
          Confirm
        </span>
      </button>
    </div>
  );

  const riskBanner = riskLevel !== 'low' ? (
    <div className={`mx-4 mt-2 rounded-sm p-2.5 flex-shrink-0 ${riskLevel === 'high' ? 'bg-black' : 'border-2 border-black'}`}>
      <div className={`text-xs space-y-0.5 ${riskLevel === 'high' ? 'text-[#838383]' : 'text-black'}`}>
        {currentRequest.riskFactors.map((f, i) => <div key={i}>• {f}</div>)}
      </div>
    </div>
  ) : null;

  const openDetails = () => { setShowDetails(true); setDetailsPage(0); };

  // ══════════════════════════════════════════
  // ── TRANSFER DETAILS VIEW ──
  // ══════════════════════════════════════════
  if (showDetails && currentRequest.type === 'transfer') {
    const r = currentRequest;
    const fields: DetailField[] = [
      { label: 'From', value: <BoldEndsAddress addr={r.from} className="text-xl text-black font-mono break-all leading-snug" /> },
      { label: 'To', value: (
        <>
          {r.toName && <div className="text-xl font-normal text-black break-all leading-snug mb-1">{r.toName}</div>}
          <BoldEndsAddress addr={r.to} className="text-xl text-black font-mono break-all leading-snug" />
        </>
      ) },
      { label: 'Amount', value: <div className="text-2xl font-normal text-black break-all tabular-nums">{r.amount}</div> },
      { label: 'Token', value: <div className="text-2xl font-normal text-black">{r.token} ({r.network})</div> },
      { label: 'Gas Limit', value: <div className="text-2xl font-normal text-black font-mono">{r.gasLimit}</div> },
      { label: 'Network Fee', value: <div className="text-2xl font-normal text-black font-mono break-all">{r.maxFee} {r.gasTokenSymbol || r.tokenSymbol}</div> },
    ];
    return <DetailListView title="Transaction Details" onBack={() => setShowDetails(false)} fields={fields} dataKey={`transfer:${debugNetwork || ''}`} />;
  }

  // ── MESSAGE DETAILS ──
  if (showDetails && currentRequest.type === 'message') {
    const r = currentRequest;
    const fields: DetailField[] = [
      { label: 'DApp', value: <div className="text-2xl font-normal text-black break-all">{r.dapp}</div> },
      { label: 'URL', value: <div className="text-xl font-normal text-black break-all leading-snug">{r.dappUrl}</div> },
      { label: 'Network', value: <div className="text-2xl font-normal text-black">{r.network}</div> },
      { label: 'Signing Address', value: <BoldEndsAddress addr={r.address} className="text-xl text-black font-mono break-all leading-snug" /> },
      { label: 'Message', flow: true, value: <div className="text-xl font-normal text-black font-mono whitespace-pre-wrap break-all leading-snug">{r.message}</div> },
    ];
    return <DetailListView title="Message Details" onBack={() => setShowDetails(false)} fields={fields} dataKey={`message:${debugNetwork || ''}`} />;
  }

  // ── BLIND DETAILS ──
  if (showDetails && currentRequest.type === 'blind') {
    const r = currentRequest;
    const fields: DetailField[] = [
      { label: 'Network', value: <div className="text-2xl font-normal text-black">{r.network}</div> },
      { label: 'Method ID', value: <div className="text-2xl font-normal text-black font-mono break-all">{r.methodId}</div> },
      { label: 'Contract', value: <BoldEndsAddress addr={r.contractAddress} className="text-xl text-black font-mono break-all leading-snug" /> },
      { label: 'Raw Data', flow: true, value: <div className="text-xl font-normal text-black font-mono break-all leading-snug">{r.rawData}</div> },
    ];
    return <DetailListView title="Blind Details" onBack={() => setShowDetails(false)} fields={fields} dataKey={`blind:${debugNetwork || ''}`} />;
  }

  // ── CONTRACT CALL (SWAP) DETAILS ──
  if (showDetails && currentRequest.type === 'contractCall') {
    const r = currentRequest;
    const fields: DetailField[] = [
      { label: 'Pay', value: <PreciseAmount amount={r.amountIn} token={r.tokenIn} network={r.networkIn} /> },
      { label: 'Receive', value: <PreciseAmount amount={r.amountOut} token={r.tokenOut} network={r.networkOut} /> },
      { label: 'From', value: <BoldEndsAddress addr={r.address} className="text-xl text-black font-mono break-all leading-snug" /> },
      { label: 'Contract', value: (
        <>
          <div className="text-xl font-normal text-black break-all leading-snug mb-1">{r.contractName}</div>
          <BoldEndsAddress addr={r.contractAddress} className="text-xl text-black font-mono break-all leading-snug" />
        </>
      ) },
      { label: 'Method', value: <div className="text-xl font-normal text-black break-all leading-snug">{r.method}</div> },
      { label: 'Network Fee', value: <div className="text-2xl font-normal text-black font-mono break-all">{r.maxFee} {r.tokenSymbol}</div> },
    ];
    return <DetailListView title="Swap Details" onBack={() => setShowDetails(false)} fields={fields} dataKey={`swap:${debugNetwork || ''}`} />;
  }

  // ── APPROVE DETAILS ──
  if (showDetails && currentRequest.type === 'approve') {
    const r = currentRequest;
    const fields: DetailField[] = [
      { label: 'Approved Amount', value: <div className="text-2xl font-normal text-black break-all tabular-nums">{r.isUnlimited ? 'UNLIMITED' : `${r.amount} ${r.tokenSymbol}`}</div> },
      { label: 'Token', value: <div className="text-2xl font-normal text-black">{r.token} ({r.network})</div> },
      { label: 'Spender', value: (
        <>
          {r.spenderName && <div className="text-xl font-normal text-black break-all leading-snug mb-1">{r.spenderName}</div>}
          <BoldEndsAddress addr={r.spender} className="text-xl text-black font-mono break-all leading-snug" />
        </>
      ) },
      { label: 'Your Address', value: <BoldEndsAddress addr={r.address} className="text-xl text-black font-mono break-all leading-snug" /> },
      { label: 'Gas Limit', value: <div className="text-2xl font-normal text-black font-mono">{r.gasLimit}</div> },
      { label: 'Network Fee', value: <div className="text-2xl font-normal text-black font-mono break-all">{r.maxFee} {r.gasTokenSymbol}</div> },
    ];
    return <DetailListView title="Approve Details" onBack={() => setShowDetails(false)} fields={fields} dataKey={`approve:${debugNetwork || ''}`} />;
  }

  // ══════════════════════════════════════════════════
  // ══════ TRANSFER MAIN VIEWS ══════════════════════
  // ══════════════════════════════════════════════════
  if (currentRequest.type === 'transfer') {
    // ── VARIANT A ──
    if (layoutVariant === 'A') {
      return (
        <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
          <PageHeader title="Confirm Send" onBack={onBack} />
          {riskBanner}
          <div className="mx-4 mt-2 bg-black rounded-sm flex-shrink-0">
            <div className="px-4 pt-4 pb-3 flex items-center justify-between">
              <div>
                <div className="text-xs text-[#838383] uppercase tracking-widest mb-1.5">Sending</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-[#838383] tracking-tight leading-none">{currentRequest.amount}</span>
                  <span className="text-lg font-bold text-[#838383] uppercase">{currentRequest.tokenSymbol}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-[#838383]">{currentRequest.fiatValue}</div>
                <div className="text-xs text-[#838383] uppercase mt-1">{currentRequest.network}</div>
              </div>
            </div>
            <div className="mx-4 border-t border-[#838383]" />
            <div className="px-4 py-2.5 flex items-center gap-4">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs text-[#838383] uppercase">Gas</span>
                <span className="text-xs font-bold text-[#838383] font-mono">{currentRequest.maxFee} {currentRequest.tokenSymbol}</span>
              </div>
              <div className="w-px h-3 bg-[#838383] flex-shrink-0" />
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs text-[#838383] uppercase">Total</span>
                <span className="text-xs font-bold text-[#838383] font-mono">{currentRequest.totalCost} {currentRequest.tokenSymbol}</span>
              </div>
              <button onClick={openDetails} className="ml-auto text-xs font-bold text-[#838383] uppercase tracking-wide active:scale-[0.98]">Details →</button>
            </div>
          </div>
          <div className="mx-4 mt-2 flex-1 min-h-0">
            <div className="flex h-full">
              <div className="flex flex-col items-center mr-3 py-2.5">
                <div className="w-3 h-3 rounded-full border-2 border-black bg-[#838383] flex-shrink-0" />
                <div className="w-0.5 flex-1 bg-black my-1" />
                <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[7px] border-l-transparent border-r-transparent border-t-black flex-shrink-0" />
                <div className="w-3 h-3 rounded-full bg-black mt-1 flex-shrink-0" />
              </div>
              <div className="flex-1 flex flex-col gap-2 min-w-0 h-full">
                <div className="border-2 border-black rounded-sm px-3 py-3 flex-1 flex flex-col justify-center">
                  <div className="text-xs text-black uppercase tracking-wide mb-1">From</div>
                  <div className="text-xs font-bold text-black font-mono truncate">{currentRequest.from.slice(0, 18)}...{currentRequest.from.slice(-10)}</div>
                </div>
                <div className="border-2 border-black rounded-sm px-3 py-3 flex-1 flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-black uppercase tracking-wide">To</span>
                    {currentRequest.toName && <span className="text-xs font-bold text-black">{currentRequest.toName}</span>}
                  </div>
                  <div className="text-xs font-bold text-black font-mono truncate">{currentRequest.to.slice(0, 18)}...{currentRequest.to.slice(-10)}</div>
                </div>
              </div>
            </div>
          </div>
          {actionButtons}
        </div>
      );
    }

    // ── VARIANT B (Mondrian) ──
    if (layoutVariant === 'B') {
      return (
        <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
          <PageHeader title="Confirm Send" onBack={onBack} />
          {riskBanner}
          <div className="mx-4 mt-2 flex-1 min-h-0 flex flex-col gap-[4px]">
            <div className="flex gap-[4px] flex-1 min-h-0">
              <div className="flex-[3] bg-black rounded-sm p-4 flex flex-col justify-between min-w-0">
                <div className="text-xs text-[#838383] uppercase tracking-widest">Sending</div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-[#838383] tracking-tight leading-none">{currentRequest.amount}</span>
                    <span className="text-lg font-bold text-[#838383] uppercase">{currentRequest.tokenSymbol}</span>
                  </div>
                  <div className="text-xl font-bold text-[#838383] mt-2">{currentRequest.fiatValue}</div>
                </div>
              </div>
              <div className="flex-[2] flex flex-col gap-[4px] min-w-0">
                <div className="bg-black rounded-sm px-3 py-2.5 flex-1 flex flex-col justify-center">
                  <div className="text-xs text-[#838383] uppercase tracking-wide mb-0.5">Network</div>
                  <div className="text-xl font-bold text-[#838383]">{currentRequest.network}</div>
                </div>
                <div className="bg-[#838383] border-2 border-black rounded-sm px-3 py-2.5 flex-1 flex flex-col justify-center">
                  <div className="text-xs text-black uppercase tracking-wide mb-0.5">Gas</div>
                  <div className="text-xs font-bold text-black font-mono">{currentRequest.maxFee} {currentRequest.tokenSymbol}</div>
                </div>
                <div className="bg-[#838383] border-2 border-black rounded-sm px-3 py-2.5 flex-1 flex flex-col justify-center">
                  <div className="text-xs text-black uppercase tracking-wide mb-0.5">Total</div>
                  <div className="text-xs font-bold text-black font-mono">{currentRequest.totalCost} {currentRequest.tokenSymbol}</div>
                </div>
              </div>
            </div>
            <div className="flex gap-[4px] flex-1 min-h-0">
              <div className="flex-[2] bg-[#838383] border-2 border-black rounded-sm px-3 py-3 flex flex-col justify-center min-w-0">
                <div className="text-xs text-black uppercase tracking-wide mb-1">From</div>
                <div className="text-xs font-bold text-black font-mono truncate">{currentRequest.from.slice(0, 10)}...{currentRequest.from.slice(-6)}</div>
              </div>
              <div className="flex-[3] bg-black rounded-sm px-3 py-3 flex flex-col justify-center min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[#838383] uppercase tracking-wide">To</span>
                  {currentRequest.toName && <span className="text-xs font-bold text-[#838383]">{currentRequest.toName}</span>}
                </div>
                <div className="text-xs font-bold text-[#838383] font-mono truncate">{currentRequest.to.slice(0, 14)}...{currentRequest.to.slice(-8)}</div>
              </div>
            </div>
            <div className="flex gap-[4px] h-[44px] flex-shrink-0">
              <div className="flex-[1] bg-black rounded-sm flex items-center justify-center"><ArrowDown className="w-5 h-5 text-[#838383]" strokeWidth={2.5} /></div>
              <div className="flex-[3] bg-[#838383] border-2 border-black rounded-sm flex items-center px-3">
                <span className="text-xs text-black uppercase tracking-wide mr-2">Value</span>
                <span className="text-xl font-bold text-black">{currentRequest.totalCostFiat}</span>
              </div>
              <button onClick={openDetails} className="flex-[1] bg-black rounded-sm flex items-center justify-center hover:bg-[#222] active:scale-[0.97] transition-all">
                <Info className="w-4 h-4 text-[#838383]" strokeWidth={2.5} />
              </button>
            </div>
          </div>
          {actionButtons}
        </div>
      );
    }

    // ── VARIANT C (Kandinsky) ──
    if (layoutVariant === 'C') {
      const gasSymbol = currentRequest.gasTokenSymbol || currentRequest.tokenSymbol;
      return (
        <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
          <PageHeader title="Confirm Send" onBack={onBack} />
          {riskBanner}
          <div className="flex-1 flex flex-col items-center justify-center px-6 min-h-0">

            {/* ── Central Circle with floating network badge ── */}
            <div className="relative flex-shrink-0">
              <div className="w-[168px] h-[168px] rounded-full bg-black flex flex-col items-center justify-center">
                <div className="text-[9px] text-[#838383] uppercase tracking-[0.25em] mb-1">Sending</div>
                <span className="text-[38px] font-bold text-[#838383] tracking-tight leading-none">{currentRequest.amount}</span>
                <span className="text-lg font-bold text-[#838383] uppercase mt-1">{currentRequest.tokenSymbol}</span>
                <div className="w-12 border-t border-[#838383] my-1.5" />
                <span className="text-[11px] font-bold text-[#838383]">{currentRequest.fiatValue}</span>
              </div>
              {/* Network badge — crown on top of circle */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black px-3 py-1 max-w-[160px]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#838383] flex-shrink-0" />
                <span className="text-[10px] text-[#838383] uppercase tracking-[0.15em] truncate">{currentRequest.network}</span>
                {currentRequest.contractVerified && <Check className="w-2.5 h-2.5 text-[#838383] flex-shrink-0" strokeWidth={3} />}
              </div>
              {/* Kandinsky accents */}
              <div className="absolute -right-2 top-8 w-2.5 h-2.5 bg-black" />
              <div className="absolute -left-3 bottom-8 w-1.5 h-1.5 rounded-full border-2 border-black" />
            </div>

            {/* ── Connector: circle → gas ── */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-px h-3 bg-black" />
              <div className="w-1.5 h-1.5 rounded-full border-[1.5px] border-black" />
            </div>

            {/* ── Gas Axis Line ── */}
            <div className="w-full flex items-center flex-shrink-0 my-0.5">
              <div className="w-3 h-px bg-black" />
              <div className="w-1.5 h-1.5 bg-black flex-shrink-0" />
              <div className="flex-1 h-px bg-black" />
              <div className="flex items-center gap-1 px-2.5">
                <span className="text-[10px] text-black uppercase tracking-wide">Gas</span>
                <span className="text-[11px] font-bold text-black font-mono">{currentRequest.maxFee}</span>
                <span className="text-[10px] text-black uppercase">{gasSymbol}</span>
              </div>
              <div className="flex-1 h-px bg-black" />
              <div className="w-1.5 h-1.5 rounded-full bg-black flex-shrink-0" />
              <div className="w-3 h-px bg-black" />
            </div>

            {/* ── Connector: gas → addresses ── */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-black" />
              <div className="w-px h-3 bg-black" />
            </div>

            {/* ── From Address ── */}
            <div className="w-full border-2 border-black rounded-sm px-3 py-2 flex-shrink-0">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-1.5 h-1.5 rounded-full border-[1.5px] border-black flex-shrink-0" />
                <span className="text-[10px] text-black uppercase tracking-[0.15em]">From</span>
              </div>
              <div className="text-[11px] font-bold text-black font-mono leading-[1.5] break-all">{currentRequest.from}</div>
            </div>

            {/* ── Arrow connector ── */}
            <div className="flex flex-col items-center flex-shrink-0 py-0.5">
              <div className="w-px h-1 bg-black" />
              <ArrowDown className="w-3.5 h-3.5 text-black" strokeWidth={2.5} />
              <div className="w-px h-1 bg-black" />
            </div>

            {/* ── To Address ── */}
            <div className="w-full bg-black rounded-sm px-3 py-2 flex-shrink-0">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#838383] flex-shrink-0" />
                <span className="text-[10px] text-[#838383] uppercase tracking-[0.15em]">To</span>
                {currentRequest.toName && <span className="text-[10px] font-bold text-[#838383] ml-auto">{currentRequest.toName}</span>}
              </div>
              <div className="text-[11px] font-bold text-[#838383] font-mono leading-[1.5] break-all">{currentRequest.to}</div>
            </div>

            {/* ── Bottom Detail Link ── */}
            <div className="w-full flex items-center gap-2 mt-3 flex-shrink-0">
              <div className="flex-1 h-px bg-black" />
              <div className="w-1 h-1 bg-black" />
              <button onClick={openDetails} className="text-[10px] font-bold text-black uppercase tracking-[0.15em] active:scale-[0.97]">Full Details →</button>
              <div className="w-1 h-1 rounded-full bg-black" />
              <div className="flex-1 h-px bg-black" />
            </div>

          </div>
          {actionButtons}
        </div>
      );
    }

    // ── VARIANT D (Traditional Card Layout) - single-screen summary ──
    if (layoutVariant === 'D') {
      const gasSymbol = currentRequest.gasTokenSymbol || currentRequest.tokenSymbol;
      return (
        <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
          <PageHeader title="Confirm Send" onBack={onBack} />
          {riskBanner}

          <div className="flex-1 px-5 pt-3 pb-2 flex flex-col gap-2 min-h-0">

            {/* Amount Card */}
            <div className="bg-black rounded-sm px-4 py-3 flex-shrink-0">
              <div className="text-[10px] text-[#838383] uppercase tracking-wide mb-1">{currentRequest.network}</div>
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-[#838383] tracking-tight leading-none">{currentRequest.amount}</span>
                  <span className="text-lg font-bold text-[#838383] uppercase">{currentRequest.tokenSymbol}</span>
                </div>
                <span className="text-xl font-bold text-[#838383]">{currentRequest.fiatValue}</span>
              </div>
            </div>

            {/* Address Card — From → To merged */}
            <div className="border-2 border-black rounded-sm flex-shrink-0">
              {/* From row */}
              <div className="px-4 py-2">
                <div className="text-[10px] text-black uppercase tracking-wide mb-0.5">From</div>
                <div className="text-[11px] font-bold text-black font-mono break-all leading-snug">{currentRequest.from}</div>
              </div>
              {/* Divider with arrow */}
              <div className="flex items-center px-4">
                <div className="flex-1 h-px bg-black" />
                <div className="px-2">
                  <ArrowDown className="w-3.5 h-3.5 text-black" strokeWidth={2.5} />
                </div>
                <div className="flex-1 h-px bg-black" />
              </div>
              {/* To row */}
              <div className="px-4 py-2">
                <div className="flex items-baseline justify-between mb-0.5">
                  <span className="text-[10px] text-black uppercase tracking-wide">To</span>
                  {currentRequest.toName && <span className="text-[10px] font-bold text-black">{currentRequest.toName}</span>}
                </div>
                <div className="text-[11px] font-bold text-black font-mono break-all leading-snug">{currentRequest.to}</div>
              </div>
            </div>

            {/* Gas & Total row */}
            <div className="flex gap-2 flex-shrink-0">
              <div className="flex-1 border-2 border-black rounded-sm px-3 py-2">
                <div className="text-[10px] text-black uppercase tracking-wide mb-0.5">Network Fee</div>
                <div className="text-xs font-bold text-black font-mono">{currentRequest.maxFee} {gasSymbol}</div>
              </div>
              <div className="flex-1 bg-black rounded-sm px-3 py-2">
                <div className="text-[10px] text-[#838383] uppercase tracking-wide mb-0.5">Total Cost</div>
                <div className="text-xs font-bold text-[#838383] font-mono">{currentRequest.totalCost} {currentRequest.tokenSymbol}</div>
                <div className="text-[10px] font-bold text-[#838383]">{currentRequest.totalCostFiat}</div>
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Full Details Button */}
            <button
              onClick={openDetails}
              className="w-full border-2 border-black rounded-sm py-2.5 flex items-center justify-center gap-2 flex-shrink-0 hover:bg-black group transition-all active:scale-[0.98]"
            >
              <FileText className="w-3.5 h-3.5 text-black group-hover:text-[#838383]" strokeWidth={2.5} />
              <span className="text-[10px] font-bold text-black group-hover:text-[#838383] uppercase tracking-wide">View Full Details</span>
              <ArrowRight className="w-3 h-3 text-black group-hover:text-[#838383]" strokeWidth={2.5} />
            </button>
          </div>

          {actionButtons}
        </div>
      );
    }

    // ── VARIANT E (Typography Only) - no borders or backgrounds, pure layout ──
    // When the request carries a verifyCode, the Verify Code screen is the
    // primary confirm screen: the user matches the 6-digit code against the
    // SafePal app, drills into the transaction via "Transaction Details →",
    // and confirms/cancels here. The overview below becomes that detail view.
    const hasVerify = !!currentRequest.verifyCode;

    if (hasVerify && !showTxOverview) {
      return (
        <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
          <PageHeader title="Confirm Send" onBack={onBack} />
          {riskBanner}

          <div className="flex-1 px-7 pt-5 pb-0 flex flex-col min-h-0">
            {/* Verify Code — hero, vertically centred in the available space */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="text-lg font-light text-black uppercase tracking-widest leading-none mb-4 text-center">Verify Code</div>
              <div className="text-6xl font-bold text-black font-mono tracking-[0.2em] leading-none text-center">
                {currentRequest.verifyCode}
              </div>
              <p className="text-lg text-black leading-snug text-center mt-6 px-2">
                Make sure this code matches the one shown in the SafePal app before confirming.
              </p>
            </div>

            {/* Entry into the transaction specifics, pinned above the actions */}
            <div className="h-[2px] bg-black flex-shrink-0" />
            <button
              onClick={() => setShowTxOverview(true)}
              className="flex items-center justify-between pt-3 flex-shrink-0 -mx-7 px-7 text-black active:bg-black active:text-[#838383]"
            >
              <span className="text-lg uppercase tracking-wide">Transaction Details</span>
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>

          {actionButtons}
        </div>
      );
    }

    // Transaction overview — the human-readable specifics. Identical to the
    // previous single-screen layout (minus the Verify Code bar, now its own
    // screen) and keeps the bottom action bar. When reached from the Verify
    // Code screen, back returns there; otherwise it exits.
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <PageHeader
          title="Confirm Send"
          onBack={hasVerify ? () => setShowTxOverview(false) : onBack}
        />
        {riskBanner}

        {/* Single-screen overview. Spacing rhythm: label↔value tight (mb-1),
            field↔field medium (mt-4), section↔section generous (divider my-5). */}
        <div className="flex-1 px-7 pt-5 pb-3 flex flex-col min-h-0">

          {/* Amount — hero section */}
          <div className="flex-shrink-0">
            <div className="text-lg font-light text-black uppercase tracking-widest leading-none mb-1">Amount</div>
            <div className="flex items-baseline gap-x-2.5 gap-y-1 flex-wrap">
              <span className={`font-bold text-black tracking-tight break-all tabular-nums ${
                currentRequest.amount.length > 20 ? 'text-2xl leading-tight' :
                currentRequest.amount.length > 12 ? 'text-3xl leading-tight' :
                currentRequest.amount.length > 10 ? 'text-4xl leading-none' :
                currentRequest.amount.length > 6 ? 'text-5xl leading-none' : 'text-6xl leading-none'
              }`}>{currentRequest.amount}</span>
              <span className="text-xl font-bold text-black uppercase whitespace-nowrap">{currentRequest.tokenSymbol} ({currentRequest.network})</span>
            </div>
          </div>

          <div className="h-[2px] bg-black flex-shrink-0 my-3.5" />

          {/* Parties — From + To grouped (field gap = mt-4 between them) */}
          <div className="flex-shrink-0">
            <div className="text-lg font-light text-black uppercase tracking-wide leading-none mb-1">From</div>
            <BoldEndsAddress addr={currentRequest.from} className="text-xl text-black font-mono break-all leading-snug" />
            <div className="flex items-baseline justify-between gap-3 mb-1 mt-2.5">
              <span className="text-lg font-light text-black uppercase tracking-wide leading-none">To</span>
              {currentRequest.toName && <span className="text-xl font-bold text-black truncate">{currentRequest.toName}</span>}
            </div>
            <BoldEndsAddress addr={currentRequest.to} className="text-xl text-black font-mono break-all leading-snug" />
          </div>

          <div className="h-[2px] bg-black flex-shrink-0 my-3.5" />

          {/* Network & Gas — side by side */}
          <div className="flex justify-between items-start gap-4 flex-shrink-0">
            <div className="flex-1 min-w-0">
              <div className="text-lg font-light text-black uppercase tracking-wide leading-none mb-1">Network</div>
              <div className="text-xl font-bold text-black leading-tight">{currentRequest.network}</div>
            </div>
            <div className="text-right flex-1 min-w-0">
              <div className="text-lg font-light text-black uppercase tracking-wide leading-none mb-1">Network Fee</div>
              <div className="text-xl font-bold text-black font-mono leading-tight">{currentRequest.maxFee} {currentRequest.gasTokenSymbol || currentRequest.tokenSymbol}</div>
            </div>
          </div>

          {/* Spacer + details link */}
          <div className="flex-1" />
          <div className="text-right flex-shrink-0">
            <button onClick={openDetails} className="text-lg font-light text-black uppercase tracking-wide leading-none">
              Full Details →
            </button>
          </div>
        </div>

        {actionButtons}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════
  // ══════ MESSAGE SIGNING ══════════════════
  // ══════════════════════════════════════════════════════
  if (currentRequest.type === 'message') {
    // ── VARIANT E (Typography Only) ──
    if (layoutVariant === 'E') {
      // The message box fills the remaining space (height measured into
      // messageBoxHeight), so pagination adapts to the requester height and the
      // box never overlaps the action bar.
      const boxH = messageBoxHeight > 0 ? messageBoxHeight : 280;
      const messagePages = messageHeight > boxH ? Math.ceil(messageHeight / boxH) : 1;
      const messageOffset = -messageContentPage * boxH;

      return (
        <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
          {/* Hidden element for measuring message height */}
          <div
            ref={measureRef}
            className="absolute opacity-0 pointer-events-none text-xl font-bold text-black font-mono whitespace-pre-wrap break-all"
            style={{
              width: '330px', // Account for padding
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
              left: '-9999px',
              top: '-9999px',
              lineHeight: '1.6'
            }}
          >
            {currentRequest.message}
          </div>

          <PageHeader title="Sign Message" onBack={onBack} />
          {riskBanner}

          <div className="flex-1 px-7 pt-5 pb-3 flex flex-col min-h-0 space-y-4">
            {/* DApp/Requester - prominent. When a contract address is present,
               the requester is a specific contract: show its address (first/last
               6 bold) instead of a dApp URL. */}
            <div className="flex-shrink-0">
              <div className="text-lg font-light text-black uppercase tracking-widest leading-none mb-2">Requested By</div>
              <div className="text-3xl font-bold text-black tracking-tight leading-tight mb-2">{currentRequest.dapp}</div>
              {currentRequest.contractAddress ? (
                <BoldEndsAddress addr={currentRequest.contractAddress} className="text-xl text-black font-mono break-all leading-snug" />
              ) : (
                <div className="text-lg text-black leading-snug">{currentRequest.dappUrl}</div>
              )}
            </div>

            <div className="h-[2px] bg-black flex-shrink-0" />

            {/* Message content — box fills remaining space so it never overlaps
                the action bar (requester height varies per request). */}
            <div className="flex-1 min-h-0 flex flex-col">
              <div className="flex items-center justify-between mb-3 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-light text-black uppercase tracking-wide leading-none">Message</span>
                  {messagePages > 1 && (
                    <span className="text-lg text-black font-bold">({messageContentPage + 1}/{messagePages})</span>
                  )}
                </div>
                {messagePages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setMessageContentPage(p => Math.max(0, p - 1))}
                      disabled={messageContentPage === 0}
                      className="w-7 h-7 flex items-center justify-center active:bg-black active:text-[#838383] transition-colors disabled:invisible"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4 text-black" strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={() => setMessageContentPage(p => Math.min(messagePages - 1, p + 1))}
                      disabled={messageContentPage === messagePages - 1}
                      className="w-7 h-7 flex items-center justify-center active:bg-black active:text-[#838383] transition-colors disabled:invisible"
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-4 h-4 text-black" strokeWidth={2.5} />
                    </button>
                  </div>
                )}
              </div>

              <div ref={messageBoxRef} className="flex-1 min-h-0 relative overflow-hidden">
                <div
                  className="text-xl font-bold text-black font-mono whitespace-pre-wrap break-all transition-transform duration-200"
                  style={{ overflowWrap: 'break-word', wordBreak: 'break-word', lineHeight: '1.6', transform: `translateY(${messageOffset}px)` }}
                >
                  {currentRequest.message}
                </div>
              </div>
            </div>
          </div>

          {actionButtons}
        </div>
      );
    }

    // ── Non-E fallback (variant is always E in this product) ──
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <PageHeader title="Sign Message" onBack={onBack} />
        {riskBanner}
        <div className="flex-1 p-5 overflow-hidden">
          <div className="text-lg font-light text-black uppercase tracking-wide leading-none mb-2">{currentRequest.dapp}</div>
          <div className="text-xl font-bold text-black font-mono whitespace-pre-wrap break-all leading-snug">{currentRequest.message}</div>
        </div>
        {actionButtons}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════
  // ══════ BLIND SIGNING ════════════════════
  // ══════════════════════════════════════════════════════
  if (currentRequest.type === 'blind') {
    // ── VARIANT E (Typography Only) ──
    if (layoutVariant === 'E') {
      // Whole-page flipping for long payloads: page 1 keeps contract/network +
      // the start of the data; pages 2+ hide the head so raw data gets the FULL
      // content area. Page capacities therefore differ (h0 vs hFull).
      const rawBoxH = rawDataBoxHeight > 0 ? rawDataBoxHeight : 220;          // page-1 window
      const rawBoxHFull = rawBoxH + (blindHeadHeight > 0 ? blindHeadHeight + 34 : 0); // + head + divider/gaps
      const rawDataPages = rawDataHeight > rawBoxH
        ? 1 + Math.ceil((rawDataHeight - rawBoxH) / rawBoxHFull)
        : 1;
      const onFirstRawPage = rawDataContentPage === 0;
      const rawDataOffset = onFirstRawPage ? 0 : -(rawBoxH + (rawDataContentPage - 1) * rawBoxHFull);

      return (
        <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
          {/* Hidden element for measuring raw data height */}
          <div
            ref={rawDataMeasureRef}
            className="absolute opacity-0 pointer-events-none text-xl font-bold text-black font-mono break-all leading-[1.6]"
            style={{
              width: '330px',
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
              left: '-9999px',
              top: '-9999px'
            }}
          >
            {currentRequest.rawData}
          </div>

          <PageHeader title="Sign Raw Data" onBack={onBack} />

          <div className="flex-1 px-7 pt-5 pb-3 flex flex-col min-h-0">
            {/* Contract address + network — page 1 only; later pages give the
                whole content area to the raw data. Rhythm: label↔value mb-1,
                field↔field mt-2.5, section divider my-4. */}
            {onFirstRawPage && (
              <>
                <div ref={blindHeadRef} className="flex-shrink-0">
                  <div className="text-lg font-light text-black uppercase tracking-widest leading-none mb-1">Contract</div>
                  <BoldEndsAddress addr={currentRequest.contractAddress} className="text-xl text-black font-mono break-all leading-[1.5]" />
                  <div className="text-lg font-light text-black uppercase tracking-wide leading-none mt-2.5 mb-1">Network</div>
                  <div className="text-xl font-bold text-black leading-tight">{currentRequest.network}</div>
                </div>

                <div className="h-[2px] bg-black flex-shrink-0 my-3.5" />
              </>
            )}

            {/* Raw Data — box fills remaining space so it never overlaps the bar. */}
            <div className="flex-1 min-h-0 flex flex-col">
              <div className="flex items-center justify-between mb-3 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-light text-black uppercase tracking-wide leading-none">Raw Data</span>
                  {rawDataPages > 1 && (
                    <span className="text-lg text-black font-bold">({rawDataContentPage + 1}/{rawDataPages})</span>
                  )}
                </div>
                {/* Inline pagination arrows */}
                {rawDataPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setRawDataContentPage(p => Math.max(0, p - 1))}
                      disabled={rawDataContentPage === 0}
                      className="w-7 h-7 flex items-center justify-center hover:bg-black hover:text-[#838383] active:scale-95 transition-colors disabled:invisible"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4 text-black" strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={() => setRawDataContentPage(p => Math.min(rawDataPages - 1, p + 1))}
                      disabled={rawDataContentPage === rawDataPages - 1}
                      className="w-7 h-7 flex items-center justify-center hover:bg-black hover:text-[#838383] active:scale-95 transition-colors disabled:invisible"
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-4 h-4 text-black" strokeWidth={2.5} />
                    </button>
                  </div>
                )}
              </div>

              {/* Raw data content viewport — fills remaining space; tapping the
                  data flips to the next page (wraps), arrows still work. */}
              <div
                ref={rawDataBoxRef}
                onClick={() => { if (rawDataPages > 1) setRawDataContentPage(p => (p + 1) % rawDataPages); }}
                role={rawDataPages > 1 ? 'button' : undefined}
                aria-label={rawDataPages > 1 ? 'Next data page' : undefined}
                className="flex-1 min-h-0 relative overflow-hidden">
                <div
                  className="text-xl font-bold text-black font-mono break-all transition-transform duration-200"
                  style={{
                    overflowWrap: 'break-word',
                    wordBreak: 'break-word',
                    lineHeight: '1.6',
                    transform: `translateY(${rawDataOffset}px)`
                  }}
                >
                  {currentRequest.rawData}
                </div>
              </div>
            </div>
          </div>

          {actionButtons}
        </div>
      );
    }

    // ── ORIGINAL KANDINSKY VERSION ──
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <PageHeader title="Blind Signing" onBack={onBack} />

        {/* Warning strip */}
        <div className="bg-black px-5 py-2.5 flex items-center gap-3 flex-shrink-0">
          <ShieldAlert className="w-5 h-5 text-[#838383] flex-shrink-0" strokeWidth={2.5} />
          <div className="text-xs text-[#838383] space-y-0.5">
            {currentRequest.riskFactors.map((f, i) => <div key={i}>• {f}</div>)}
          </div>
        </div>

        <div className="flex-1 flex flex-col px-5 min-h-0 pt-3">
          {/* Network + method anchors */}
          <div className="flex items-center gap-2 mb-3 flex-shrink-0">
            <div className="w-2 h-2 bg-black flex-shrink-0" />
            <span className="text-xs text-black uppercase tracking-widest">{currentRequest.network}</span>
            <div className="flex-1" />
            <span className="text-xs font-bold text-black font-mono">{currentRequest.methodId}</span>
            <div className="w-2 h-2 bg-black flex-shrink-0" />
          </div>

          {/* Contract block */}
          <div className="border-2 border-dashed border-black rounded-sm px-4 py-3 flex-shrink-0 mb-2">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-2.5 h-2.5 bg-black flex-shrink-0" />
              <span className="text-xs text-black uppercase tracking-wide">Contract</span>
            </div>
            <div className="text-xs font-bold text-black font-mono break-all leading-relaxed">{currentRequest.contractAddress}</div>
          </div>

          {/* Dashed connector with Calldata label */}
          <div className="flex items-center gap-3 my-1 flex-shrink-0">
            <div className="flex-1" style={{ borderTop: '2px dashed black', height: 0 }} />
            <div className="w-3 h-3 bg-black flex-shrink-0" />
            <span className="text-xs text-black uppercase tracking-wide">Calldata</span>
            <div className="w-3 h-3 bg-black flex-shrink-0" />
            <div className="flex-1" style={{ borderTop: '2px dashed black', height: 0 }} />
          </div>

          {/* Raw data box */}
          <div className="border-2 border-dashed border-black rounded-sm px-4 py-3 flex-1 min-h-0 overflow-hidden mb-2">
            <div className="text-xs text-black font-mono break-all leading-relaxed">{currentRequest.rawData}</div>
          </div>

          {/* From address + Detail */}
          <div className="flex items-center gap-2 my-2 flex-shrink-0">
            <div className="flex-1" style={{ borderTop: '2px dashed black', height: 0 }} />
            <div className="w-2 h-2 border-2 border-black flex-shrink-0" />
            <span className="text-xs text-black font-mono">{currentRequest.address.slice(0, 8)}...{currentRequest.address.slice(-6)}</span>
            <div className="w-2 h-2 bg-black flex-shrink-0" />
            <button onClick={openDetails} className="text-xs font-bold text-black uppercase">Detail →</button>
            <div className="flex-1" style={{ borderTop: '2px dashed black', height: 0 }} />
          </div>
        </div>

        {/* Blind sign buttons */}
        <div className="mx-4 mt-3 mb-4 pt-3 border-t-2 border-black flex gap-2 flex-shrink-0">
          <button onClick={handleReject} className="flex-1 h-[60px] border-2 border-black rounded-sm hover:bg-black group active:scale-[0.97] transition-all flex items-center justify-center gap-2">
            <X className="w-5 h-5 text-black group-hover:text-[#838383]" strokeWidth={2.5} />
            <span className="text-lg font-bold text-black group-hover:text-[#838383] uppercase tracking-wide">Reject</span>
          </button>
          <button onClick={handleConfirm} className="w-[120px] h-[60px] bg-black rounded-sm hover:bg-[#222] active:scale-[0.97] transition-all flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#838383]" strokeWidth={2.5} />
            <span className="text-lg font-bold text-[#838383] uppercase tracking-wide">Sign</span>
          </button>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════
  // ══════ CONTRACT CALL / SWAP ═════════════
  // ══════════════════════════════════════════════════════
  if (currentRequest.type === 'contractCall') {
    // ── VARIANT E (Typography Only) ──
    if (layoutVariant === 'E') {
      return (
        <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
          <PageHeader title="Confirm Swap" onBack={onBack} />
          {riskBanner}

          {/* Rhythm: label↔value mb-1, From/To split by arrow (my-2.5), section divider my-4. */}
          <div className="flex-1 px-7 pt-5 pb-3 flex flex-col min-h-0">
            {/* Swap Flow */}
            <div className="flex-shrink-0">
              {/* From Token */}
              <div>
                <div className="text-lg font-light text-black uppercase tracking-wide leading-none mb-1">From</div>
                <div className="flex items-baseline gap-x-2 gap-y-0.5 flex-wrap">
                  <span className={`font-bold text-black tracking-tight break-all tabular-nums leading-tight ${
                    currentRequest.amountIn.length > 18 ? 'text-lg' :
                    currentRequest.amountIn.length > 12 ? 'text-xl' : 'text-2xl'
                  }`}>{currentRequest.amountIn}</span>
                  <span className="text-lg font-bold text-black leading-tight whitespace-nowrap">{currentRequest.tokenIn} ({currentRequest.networkIn})</span>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex items-center gap-3 my-2.5">
                <div className="flex-1 h-[1px] bg-black" />
                <ArrowDown className="w-5 h-5 text-black" strokeWidth={2.5} />
                <div className="flex-1 h-[1px] bg-black" />
              </div>

              {/* To Token */}
              <div>
                <div className="text-lg font-light text-black uppercase tracking-wide leading-none mb-1">To</div>
                <div className="flex items-baseline gap-x-2 gap-y-0.5 flex-wrap">
                  <span className={`font-bold text-black tracking-tight break-all tabular-nums leading-tight ${
                    currentRequest.amountOut.length > 18 ? 'text-lg' :
                    currentRequest.amountOut.length > 12 ? 'text-xl' : 'text-2xl'
                  }`}>{currentRequest.amountOut}</span>
                  <span className="text-lg font-bold text-black leading-tight whitespace-nowrap">{currentRequest.tokenOut} ({currentRequest.networkOut})</span>
                </div>
              </div>
            </div>

            <div className="h-[2px] bg-black flex-shrink-0 my-3.5" />

            {/* Contract — name + address (one tight block) */}
            <div className="flex-shrink-0">
              <div className="text-lg font-light text-black uppercase tracking-wide leading-none mb-1">Contract</div>
              <div className="text-xl font-bold text-black leading-tight break-all mb-1">{currentRequest.contractName}</div>
              <BoldEndsAddress addr={currentRequest.contractAddress} className="text-xl text-black font-mono break-all leading-snug" />
            </div>

            <div className="h-[2px] bg-black flex-shrink-0 my-3.5" />

            {/* Network Fee (network is shown inline with the swap amounts above) */}
            <div className="flex-shrink-0">
              <div className="text-lg font-light text-black uppercase tracking-wide leading-none mb-1">Network Fee</div>
              <div className="text-xl font-bold text-black font-mono leading-tight break-all">{currentRequest.maxFee} {currentRequest.tokenSymbol}</div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Details link */}
            <div className="text-right flex-shrink-0">
              <button onClick={openDetails} className="text-lg font-light text-black uppercase tracking-wide leading-none">
                Full Details →
              </button>
            </div>
          </div>

          {actionButtons}
        </div>
      );
    }

    // ── ORIGINAL KANDINSKY VERSION ──
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <PageHeader title="Confirm Swap" onBack={onBack} />
        {riskBanner}

        <div className="flex-1 flex flex-col px-5 min-h-0 pt-3">
          {/* Anchors */}
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-black" />
              <span className="text-xs text-black uppercase tracking-widest">{currentRequest.network}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-black uppercase">{currentRequest.contractName}</span>
              <div className="w-2 h-2 rounded-full bg-black" />
            </div>
          </div>

          {/* Token IN */}
          <div className="bg-black rounded-sm px-4 py-4 flex items-center justify-between flex-shrink-0">
            <div>
              <div className="text-xs text-[#838383] uppercase tracking-widest mb-1">You Send</div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[#838383] tracking-tight leading-none">{currentRequest.amountIn}</span>
                <span className="text-lg font-bold text-[#838383] uppercase">{currentRequest.tokenIn}</span>
              </div>
              <div className="text-xs text-[#838383] mt-1">{currentRequest.networkIn}</div>
            </div>
            <div className="w-12 h-12 rounded-full border-2 border-[#838383] flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-[#838383]">{currentRequest.tokenIn}</span>
            </div>
          </div>

          {/* Flow connector */}
          <div className="flex items-center self-center flex-shrink-0">
            <div className="flex flex-col items-center py-1">
              <div className="w-0.5 h-3 bg-black" />
              <div className="w-6 h-6 bg-[#838383] border-2 border-black flex items-center justify-center">
                <ArrowDown className="w-3.5 h-3.5 text-black" strokeWidth={3} />
              </div>
              <div className="w-0.5 h-3 bg-black" />
            </div>
          </div>

          {/* Token OUT */}
          <div className="border-2 border-black rounded-sm px-4 py-4 flex items-center justify-between flex-shrink-0">
            <div>
              <div className="text-xs text-black uppercase tracking-widest mb-1">You Receive</div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-black tracking-tight leading-none">{currentRequest.amountOut}</span>
                <span className="text-lg font-bold text-black uppercase">{currentRequest.tokenOut}</span>
              </div>
              <div className="text-xs text-black mt-1">{currentRequest.networkOut}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-[#838383]">{currentRequest.tokenOut}</span>
            </div>
          </div>

          {/* Rate bar */}
          <div className="flex items-center gap-2 my-3 flex-shrink-0">
            <div className="flex-1 h-0.5 bg-black" />
            <div className="w-1.5 h-1.5 rounded-full bg-black" />
            <span className="text-xs text-black uppercase">1 {currentRequest.tokenIn} ≈ {(parseFloat(currentRequest.amountOut.replace(/,/g, '')) / parseFloat(currentRequest.amountIn)).toFixed(2)} {currentRequest.tokenOut}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-black" />
            <div className="flex-1 h-0.5 bg-black" />
          </div>

          {/* Gas + From address */}
          <div className="flex gap-[4px] flex-shrink-0">
            <div className="flex-1 bg-black rounded-sm px-3 py-2.5">
              <div className="text-xs text-[#838383] uppercase tracking-wide">Gas</div>
              <div className="text-xs font-bold text-[#838383] font-mono mt-0.5">{currentRequest.maxFee} {currentRequest.tokenSymbol}</div>
            </div>
            <div className="flex-1 border-2 border-black rounded-sm px-3 py-2.5">
              <div className="text-xs text-black uppercase tracking-wide">From</div>
              <div className="text-xs font-bold text-black font-mono mt-0.5 truncate">{currentRequest.address.slice(0, 10)}...{currentRequest.address.slice(-4)}</div>
            </div>
          </div>

          <div className="flex-1" />

          {/* Detail bar */}
          <div className="flex items-center gap-2 my-2 flex-shrink-0">
            <div className="flex-1 h-0.5 bg-black" />
            <div className="w-2 h-2 rounded-full border-2 border-black flex-shrink-0" />
            <button onClick={openDetails} className="text-xs font-bold text-black uppercase">Detail →</button>
            <div className="flex-1 h-0.5 bg-black" />
          </div>
        </div>

        {actionButtons}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════
  // ══════ APPROVE / TOKEN ALLOWANCE ═══════════
  // ══════════════════════════════════════════════════════
  if (currentRequest.type === 'approve') {
    // ── VARIANT E (Typography Only) ──
    if (layoutVariant === 'E') {
      return (
        <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
          <PageHeader title="Approve Token" onBack={onBack} />
          {/* Only show risk banner for limited approvals */}
          {!currentRequest.isUnlimited && riskBanner}

          {/* Rhythm: label↔value mb-1, field↔field mt-2.5, section divider my-4. */}
          <div className="flex-1 px-7 pt-5 pb-3 flex flex-col min-h-0">

            {/* Approved Amount — hero section */}
            <div className="flex-shrink-0">
              <div className="text-lg font-light text-black uppercase tracking-widest leading-none mb-1">Approved Amount</div>
              {currentRequest.isUnlimited ? (
                <div className="text-6xl font-bold text-black tracking-tight leading-none">UNLIMITED</div>
              ) : (
                /* Full amount always shown: size ladder steps down with length,
                   break-all wraps extreme amounts, the token chip stays whole. */
                <div className="flex items-baseline gap-x-2.5 gap-y-1 flex-wrap">
                  <span className={`font-bold text-black tracking-tight break-all tabular-nums ${
                    currentRequest.amount.length > 20 ? 'text-2xl leading-tight' :
                    currentRequest.amount.length > 12 ? 'text-3xl leading-tight' :
                    currentRequest.amount.length > 10 ? 'text-4xl leading-none' :
                    currentRequest.amount.length > 6 ? 'text-5xl leading-none' : 'text-6xl leading-none'
                  }`}>{currentRequest.amount}</span>
                  <span className="text-xl font-bold text-black whitespace-nowrap">{currentRequest.tokenSymbol} ({currentRequest.network})</span>
                </div>
              )}
            </div>

            <div className="h-[2px] bg-black flex-shrink-0 my-3.5" />

            {/* Spender — name + address (one tight block) */}
            <div className="flex-shrink-0">
              <div className="text-lg font-light text-black uppercase tracking-wide leading-none mb-1">Approved Spender</div>
              {currentRequest.spenderName && (
                <div className="text-xl font-bold text-black mb-1">{currentRequest.spenderName}</div>
              )}
              <BoldEndsAddress addr={currentRequest.spender} className="text-xl text-black font-mono break-all leading-snug" />
            </div>

            <div className="h-[2px] bg-black flex-shrink-0 my-3.5" />

            {currentRequest.expiry ? (
              /* Limited: network is inline in the amount → Expires + Network Fee row. */
              <div className="flex justify-between items-start gap-4 flex-shrink-0">
                <div className="flex-1 min-w-0">
                  <div className="text-lg font-light text-black uppercase tracking-wide leading-none mb-1">Expires</div>
                  <div className="text-xl font-bold text-black leading-tight break-all">{currentRequest.expiry}</div>
                </div>
                <div className="text-right flex-1 min-w-0">
                  <div className="text-lg font-light text-black uppercase tracking-wide leading-none mb-1">Network Fee</div>
                  <div className="text-xl font-bold text-black font-mono leading-tight">{currentRequest.maxFee} {currentRequest.gasTokenSymbol}</div>
                </div>
              </div>
            ) : (
              /* Unlimited: the Token line already carries the network name
                 (e.g. "USDT (Ethereum)"), so there is no standalone Network
                 field — only Token + Network Fee. */
              <div className="flex-shrink-0">
                <div className="text-lg font-light text-black uppercase tracking-wide leading-none mb-1">Token</div>
                <div className="text-xl font-bold text-black leading-tight">{currentRequest.token} ({currentRequest.network})</div>
                <div className="mt-2.5">
                  <div className="text-lg font-light text-black uppercase tracking-wide leading-none mb-1">Network Fee</div>
                  <div className="text-xl font-bold text-black font-mono leading-tight">{currentRequest.maxFee} {currentRequest.gasTokenSymbol}</div>
                </div>
              </div>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Details link */}
            <div className="text-right flex-shrink-0">
              <button onClick={openDetails} className="text-lg font-light text-black uppercase tracking-wide leading-none">
                Full Details →
              </button>
            </div>
          </div>

          {actionButtons}
        </div>
      );
    }

    // ── DEFAULT VERSION (if not E) ──
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <PageHeader title="Approve Token" onBack={onBack} />
        {riskBanner}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <div className="text-lg text-black uppercase mb-2">Approve request not fully styled</div>
            <div className="text-xs text-black">Switch to Variant E to see styled version</div>
          </div>
        </div>
        {actionButtons}
      </div>
    );
  }

  // ── Fallback ──
  return (
    <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
      <PageHeader title="Sign Request" onBack={onBack} />
      <div className="flex-1 flex items-center justify-center">
        <span className="text-lg text-black">Unknown request type</span>
      </div>
    </div>
  );
}