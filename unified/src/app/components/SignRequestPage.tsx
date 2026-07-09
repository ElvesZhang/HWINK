import { ChevronLeft, ChevronRight, AlertTriangle, Info, Check, X, ShieldAlert, ArrowUpRight, ArrowDown, Loader2, FileText, ArrowRight, Fingerprint } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { ChangePINPage } from './ChangePINPage';
import { FingerprintVerifyPage } from './FingerprintVerifyPage';
import { DetailListView, BoldEndsAddress } from './DetailListView';
import type { DetailField } from './DetailListView';
import type { SignType } from './DebugPanel';
import type { SignDocsView } from './signDocsContent';
import { VERIFY_FONTS, type VerifyFont } from './VerifyFontSwitcher';

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
  /** Serialized signed payload (raw tx hex). Shown in the Raw Data drawer. */
  rawData: string;
}
interface MessageRequest {
  type: 'message';
  network: string; dapp: string; dappUrl: string;
  message: string; address: string; riskFactors: string[];
  /** When the message originates from a specific contract rather than a dApp,
   *  this holds that contract's address (shown under the requester name). */
  contractAddress?: string;
  /** Raw bytes actually being signed (EIP-191 / typed-data preimage, hex).
   *  Reached via the Raw Data drawer at the end of the message. */
  rawData: string;
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
  /** Serialized signed payload (raw calldata hex). Shown in the Raw Data drawer. */
  rawData: string;
}
interface ApproveRequest {
  type: 'approve';
  network: string; token: string; tokenSymbol: string;
  spender: string; spenderName: string;
  amount: string; fiatValue: string;
  isUnlimited: boolean;
  gasLimit: string; maxFee: string; gasTokenSymbol: string;
  address: string; riskFactors: string[];
  /** Serialized signed payload (raw approve calldata hex). Shown in Raw Data. */
  rawData: string;
}

type SignRequest = TransferRequest | MessageRequest | BlindRequest | ContractCallRequest | ApproveRequest;

/** Network-fee display formatter. The signed AMOUNT must stay exact (you are
 *  authorising precisely that), but the network fee is an upper-bound estimate —
 *  showing 18 decimals is noise. Round to `sig` significant figures (default 6)
 *  and trim trailing zeros so the value stays a sane length on every screen;
 *  callers prefix "Max" to signal it is a ceiling. Falls back to the raw string
 *  if the value can't be parsed. */
function formatFee(value: string, sig = 6): string {
  const n = Number(value);
  if (!isFinite(n) || n === 0) return value;
  let s = n.toPrecision(sig);
  if (s.includes('e') || s.includes('E')) {
    const decimals = Math.min(100, Math.max(0, sig - 1 - Math.floor(Math.log10(Math.abs(n)))));
    s = n.toFixed(decimals);
  }
  if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
  return s;
}

/** Hardware↔app channel verify code. Shown on the universal Verify Code screen
 *  that precedes every signature type (prototype uses a fixed value). */
const VERIFY_CODE = '748392';

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
  /** Reports the current sub-screen so the external docs panel can follow along.
   *  Derived from signType + the sub-screen state, NOT currentRequest.type. */
  onDocsViewChange?: (v: SignDocsView) => void;
  /** Dev-only: which font to render the big Verify Code in (for 1-bit font
   *  comparison). Defaults to the app sans. */
  verifyFont?: VerifyFont;
}

// ── Mock Data ──

const mockTransfer: TransferRequest = {
  type: 'transfer', network: 'Tron', token: 'USDT', tokenSymbol: 'USDT',
  from: 'TJYeasTPa6gpEEfYqv8q3qyq3qLZ8nLb9p',
  to: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9',
  amount: '500', fiatValue: '$500.00',
  gasLimit: '21000', maxFee: '13.5', priorityFee: '0',
  gasTokenSymbol: 'TRX',
  totalCost: '500', totalCostFiat: '$500.00',
  contractVerified: true, riskFactors: [],
  rawData: '0x02f8b00182012d843b9aca0085098bca5a00830186a0948ba1f109551bd432803012645ac136ddd64dba7288016345785d8a000080c080a0d7fe0212b8d4c019ae7663f1d5bc47088e20a9c9f2c71a80b4ed31055c68a924a07fe0212b8d4c019ae7663f1d5bc47088e20a9c9f2c71a80b4ed31055c68a9241',
};
const mockMessage: MessageRequest = {
  type: 'message', network: 'Ethereum', dapp: 'Uniswap', dappUrl: 'app.uniswap.org',
  message: 'Welcome to Uniswap!\n\nClick to sign in and accept the Uniswap Terms of Service: https://uniswap.org/terms-of-service\n\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nYour authentication status will remain active for 24 hours.\n\nWallet address:\n0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb\n\nNonce: 8f2e9a7b\n\nTimestamp: 2026-05-12T10:30:00Z\n\nChain ID: 1',
  address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', riskFactors: [],
  // EIP-191 personal-sign preimage: "\x19Ethereum Signed Message:\n<len>" + the
  // UTF-8 message bytes (what is actually hashed and signed), shown as raw hex.
  rawData: '0x19457468657265756d205369676e6564204d6573736167653a0a32363557656c636f6d6520746f20556e6973776170210a0a436c69636b20746f207369676e20696e20616e64206163636570742074686520556e69737761702054657726d73206f66205365727669636500436861696e2049443a2031',
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
  rawData: '0x38ed1739000000000000000000000000000000000000000000000000016345785d8a000000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000008ba1f109551bd432803012645ac136ddd64dba72',
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
  rawData: '0x095ea7b300000000000000000000000068b3465833fb72a70ecdf485e0e4c7bd8665fc45ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
};
// Approval capped to a specific amount.
const mockApproveLimited: ApproveRequest = {
  type: 'approve', network: 'Ethereum', token: 'USDT', tokenSymbol: 'USDT',
  spender: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
  spenderName: 'Uniswap Universal Router',
  // Long amount on purpose — demonstrates the full-precision wrap handling.
  amount: '1,234,567.890123456789', fiatValue: '$1,234,567.89',
  isUnlimited: false,
  gasLimit: '65000', maxFee: '0.0015', gasTokenSymbol: 'ETH',
  address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  riskFactors: [],
  rawData: '0x095ea7b300000000000000000000000068b3465833fb72a70ecdf485e0e4c7bd8665fc4500000000000000000000000000000000000000000000d3c21bcecceda1000000',
};

const mockByType: Record<string, SignRequest> = {
  transfer: mockTransfer,
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

export function SignRequestPage({ onBack, request, signType, debugNetwork, layoutVariant: externalLayoutVariant, fingerprintEnrolled = false, fingerprintPrompted = false, onFingerprintPromptDone, showDebugId, onDocsViewChange, verifyFont = 'default' }: SignRequestPageProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [detailsPage, setDetailsPage] = useState(0);
  // Universal verify gate: false = showing the shared Verify Code screen (the
  // first screen for EVERY sign type); true = past it, showing the type content.
  const [pastVerify, setPastVerify] = useState(false);
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

  // Measure message content height for pagination. Re-run on `pastVerify`: the
  // message screen mounts only AFTER the universal verify gate, so the refs are
  // null on the initial (verify-screen) pass — without this the measure never
  // fires and the message renders clipped with no pager.
  useEffect(() => {
    if (measureRef.current && currentRequest.type === 'message') {
      const height = measureRef.current.scrollHeight;
      setMessageHeight(height);
    }
  }, [currentRequest, pastVerify]);

  // Measure the visible (flex-filled) message box for pagination
  useEffect(() => {
    if (messageBoxRef.current && currentRequest.type === 'message') {
      setMessageBoxHeight(messageBoxRef.current.clientHeight);
    }
  }, [currentRequest, pastVerify]);

  // Reset message content page when request changes
  useEffect(() => {
    setMessageContentPage(0);
  }, [currentRequest]);

  // Reset to the verify screen when the sign type or request changes (not on
  // every render — currentRequest is a fresh object each render, which would
  // bounce the user back to verify mid-flow).
  useEffect(() => {
    setPastVerify(false);
    setShowDetails(false);
  }, [signType, request]);

  // Measure blind signing raw data content height for pagination. Re-run on
  // `pastVerify` for the same reason as the message measure above (blind screen
  // mounts only after the verify gate).
  useEffect(() => {
    if (rawDataMeasureRef.current && currentRequest.type === 'blind') {
      const height = rawDataMeasureRef.current.scrollHeight;
      setRawDataHeight(height);
    }
  }, [currentRequest, pastVerify]);

  // Measure the visible (flex-filled) raw-data box for pagination. Both run on
  // page 1 (rawDataContentPage resets to 0 per request), where the head exists.
  useEffect(() => {
    if (rawDataBoxRef.current && currentRequest.type === 'blind') {
      setRawDataBoxHeight(rawDataBoxRef.current.clientHeight);
    }
    if (blindHeadRef.current && currentRequest.type === 'blind') {
      setBlindHeadHeight(blindHeadRef.current.offsetHeight);
    }
  }, [currentRequest, pastVerify]);

  // Reset raw data content page when request changes
  useEffect(() => {
    setRawDataContentPage(0);
  }, [currentRequest]);

  // Report the current sub-screen to the docs panel. Derive from signType (NOT
  // currentRequest.type — approve/approveLimit share 'approve') + the sub-screen
  // state. The shared Verify Code screen (!pastVerify) maps to the level-1
  // 'verify' doc for every type. currentRequest is intentionally NOT a dependency
  // (fresh object each render → would loop).
  useEffect(() => {
    if (!onDocsViewChange) return;
    const st = signType || 'transfer';
    let v: SignDocsView;
    if (secondFactor) v = 'confirm/second-factor';
    else if (enrollAsk || status === 'signing' || status === 'success' || status === 'rejected') v = 'confirm/result';
    else if (!pastVerify) v = 'verify';
    else if (showDetails) {
      v = st === 'contractCall' ? 'swap/raw-data'
        : (st === 'approve' || st === 'approveLimit') ? 'approve/raw-data'
        : st === 'message' ? 'message/raw-data'
        : 'transfer/raw-data';
    }
    else if (st === 'message') v = 'message/message';
    else if (st === 'blind') v = 'blind/raw-data';
    else if (st === 'contractCall') v = 'swap/main';
    else if (st === 'approveLimit') v = 'approveLimit/main';
    else if (st === 'approve') v = 'approve/main';
    else v = 'transfer/main';
    onDocsViewChange(v);
  }, [onDocsViewChange, signType, secondFactor, status, enrollAsk, showDetails, pastVerify]);

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

  // ── Result ── tap anywhere to continue (no Done button; matches the
  // activation flow's "Tap to continue" pattern).
  if (status === 'success' || status === 'rejected') {
    const ok = status === 'success';
    const onContinue = () => { if (ok && enrollPending) { setEnrollPending(false); setEnrollAsk(true); } else { onBack(); } };
    return (
      <div
        onClick={onContinue}
        role="button"
        aria-label="Tap to continue"
        className="w-[400px] h-[600px] bg-[#838383] flex flex-col cursor-pointer group active:bg-black active:text-[#838383]"
      >
        <PageHeader title={ok ? 'Complete' : 'Rejected'} />
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 ${ok ? 'bg-black group-active:bg-[#838383]' : 'border-3 border-black group-active:border-[#838383]'}`}>
            {ok
              ? <Check className="w-11 h-11 text-[#838383] group-active:text-black" strokeWidth={3} />
              : <X className="w-11 h-11 text-black group-active:text-[#838383]" strokeWidth={3} />}
          </div>
          <div className="text-lg font-bold text-black group-active:text-[#838383] uppercase tracking-wide mb-1.5 text-center">{ok ? 'Signed Successfully' : 'Signature Rejected'}</div>
          <div className="text-xs text-black group-active:text-[#838383] text-center leading-relaxed">{ok ? 'Transaction signed and broadcast' : 'You declined this request'}</div>
        </div>
        <div className="h-20 flex items-center justify-center flex-shrink-0">
          <span className="text-lg font-light text-black group-active:text-[#838383] uppercase tracking-widest">Tap to continue</span>
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
  // Content screens' back returns to the shared Verify Code screen (verify → content).
  const backToVerify = () => setPastVerify(false);

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
  // ── RAW DATA DRAWER (single second layer) ──
  // ══════════════════════════════════════════
  // The optional drill-in from the summary screen now shows ONLY the raw signed
  // payload (serialized tx / calldata) — not a field-by-field repeat of the
  // summary. Gas Limit / Your Address / Method / signer From are dropped (they
  // live in the raw data). message/blind have no drawer (they page their long
  // content in-screen), so this only triggers for transfer/approve/contractCall.
  const drawerRawData = 'rawData' in currentRequest ? currentRequest.rawData : undefined;
  if (showDetails && drawerRawData) {
    const fields: DetailField[] = [
      { label: 'Raw Data', flow: true, value: <div className="text-xl font-normal text-black break-all leading-snug">{drawerRawData}</div> },
    ];
    return <DetailListView title="Raw Data" onBack={() => setShowDetails(false)} fields={fields} dataKey={`raw:${currentRequest.type}:${debugNetwork || ''}`} />;
  }

  // ══════════════════════════════════════════════════════
  // ══════ UNIVERSAL VERIFY CODE GATE ══════════════════════
  // ══════════════════════════════════════════════════════
  // The shared FIRST screen for every sign type. The user matches the 6-digit
  // code against the SafePal app, then Continue → into the type-specific content
  // (or Confirm directly here). Verify is no longer a separate sign type.
  if (!pastVerify) {
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <PageHeader title="Confirm Signature" onBack={onBack} />

        <div className="flex-1 px-7 pt-5 pb-0 flex flex-col min-h-0">
          {/* Verify Code — hero, vertically centred in the available space */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="text-lg font-light text-black uppercase tracking-widest leading-none mb-4 text-center">Verify Code</div>
            <div className="text-6xl font-bold text-black tracking-[0.2em] leading-none text-center" style={{ fontFamily: VERIFY_FONTS[verifyFont].family, fontWeight: VERIFY_FONTS[verifyFont].codeWeight }}>
              {VERIFY_CODE}
            </div>
            <p className="text-lg text-black leading-snug text-center mt-6 px-2">
              Make sure this code matches the one shown in the SafePal app before confirming.
            </p>
          </div>

          {/* Into the type-specific content, pinned above the actions */}
          <div className="h-[2px] bg-black flex-shrink-0" />
          <button
            onClick={() => setPastVerify(true)}
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
              <button onClick={openDetails} className="text-[10px] font-bold text-black uppercase tracking-[0.15em] active:scale-[0.97]">Raw Data →</button>
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

    // ── VARIANT E (Typography Only) — transaction overview (content). The shared
    // verify-code gate above is the first screen for every type; back returns to it.
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <PageHeader title="Confirm Send" onBack={backToVerify} />
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
              <span className="text-xl font-bold text-black uppercase break-words">{currentRequest.tokenSymbol} ({currentRequest.network})</span>
            </div>
          </div>

          <div className="h-[2px] bg-black flex-shrink-0 my-3.5" />

          {/* Parties — From + To grouped (field gap = mt-4 between them) */}
          <div className="flex-shrink-0">
            <div className="text-lg font-light text-black uppercase tracking-wide leading-none mb-1">From</div>
            <BoldEndsAddress addr={currentRequest.from} className="text-xl text-black break-all leading-snug" />
            <div className="text-lg font-light text-black uppercase tracking-wide leading-none mt-4 mb-1">To</div>
            <BoldEndsAddress addr={currentRequest.to} className="text-xl text-black break-all leading-snug" />
          </div>

          <div className="h-[2px] bg-black flex-shrink-0 my-3.5" />

          {/* Network Fee — full width. The network is already shown in the amount
              chip above, so there is no standalone Network field (avoids a fixed
              2-column row where a long network + long fee would collide). Fee is
              rounded (formatFee) and "Max"-prefixed; it wraps if ever long. */}
          <div className="flex-shrink-0">
            <div className="text-lg font-light text-black uppercase tracking-wide leading-none mb-1">Network Fee</div>
            <div className="text-xl font-bold text-black leading-tight break-all">Max {formatFee(currentRequest.maxFee)} {currentRequest.gasTokenSymbol || currentRequest.tokenSymbol}</div>
          </div>

          {/* Spacer + details link */}
          <div className="flex-1" />
          <div className="text-right flex-shrink-0">
            <button onClick={openDetails} className="text-lg font-light text-black uppercase tracking-wide leading-none">
              Raw Data →
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
      // Flip whole lines, not raw pixels: snap the page step to a multiple of the
      // line height (text-xl 20px × 1.6 = 32px) so a line is never clipped across
      // the page boundary.
      const MSG_LINE_H = 32;
      const linesPerPage = Math.max(1, Math.floor(boxH / MSG_LINE_H));
      const msgStep = linesPerPage * MSG_LINE_H;
      const messagePages = messageHeight > msgStep ? Math.ceil(messageHeight / msgStep) : 1;
      const messageOffset = -messageContentPage * msgStep;

      return (
        <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
          {/* Hidden element for measuring message height */}
          <div
            ref={measureRef}
            className="absolute opacity-0 pointer-events-none text-xl font-bold text-black whitespace-pre-wrap break-all"
            style={{
              width: '344px', // Match the rendered box width (400 − 2×28px px-7) so the measured height equals the real one
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
              left: '-9999px',
              top: '-9999px',
              lineHeight: '1.6'
            }}
          >
            {currentRequest.message}
          </div>

          <PageHeader title="Sign Message" onBack={backToVerify} />
          {riskBanner}

          <div className="flex-1 px-7 pt-5 pb-3 flex flex-col min-h-0 space-y-4">
            {/* DApp/Requester - prominent. When a contract address is present,
               the requester is a specific contract: show its address (first/last
               6 bold) instead of a dApp URL. */}
            <div className="flex-shrink-0">
              <div className="text-lg font-light text-black uppercase tracking-widest leading-none mb-1">Requested By</div>
              <div className="text-3xl font-bold text-black tracking-tight leading-tight mb-3">{currentRequest.dapp}</div>
              {currentRequest.contractAddress ? (
                <BoldEndsAddress addr={currentRequest.contractAddress} className="text-xl text-black break-all leading-snug" />
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
                  className="text-xl font-bold text-black whitespace-pre-wrap break-all transition-transform duration-200"
                  style={{ overflowWrap: 'break-word', wordBreak: 'break-word', lineHeight: '1.6', transform: `translateY(${messageOffset}px)` }}
                >
                  {currentRequest.message}
                </div>
              </div>

              {/* Raw Data entry — the message's raw signed bytes sit at the very
                  end of the request. Revealed once paged to the last page (a
                  single-page message already shows its end, so it shows at once).
                  Height is reserved on every page so paging never shifts the box. */}
              <div className="h-9 mt-2 flex items-center justify-end flex-shrink-0">
                {messageContentPage >= messagePages - 1 && (
                  <button onClick={openDetails} className="text-lg font-light text-black uppercase tracking-wide leading-none active:bg-black active:text-[#838383]">
                    Raw Data →
                  </button>
                )}
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
          <div className="text-xl font-bold text-black whitespace-pre-wrap break-all leading-snug">{currentRequest.message}</div>
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
            className="absolute opacity-0 pointer-events-none text-xl font-bold text-black break-all leading-[1.6]"
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

          <PageHeader title="Sign Raw Data" onBack={backToVerify} />

          <div className="flex-1 px-7 pt-5 pb-3 flex flex-col min-h-0">
            {/* Contract address + network — page 1 only; later pages give the
                whole content area to the raw data. Rhythm: label↔value mb-1,
                field↔field mt-2.5, section divider my-4. */}
            {onFirstRawPage && (
              <>
                <div ref={blindHeadRef} className="flex-shrink-0">
                  <div className="text-lg font-light text-black uppercase tracking-widest leading-none mb-1">Contract</div>
                  <BoldEndsAddress addr={currentRequest.contractAddress} className="text-xl text-black break-all leading-[1.5]" />
                  <div className="text-lg font-light text-black uppercase tracking-wide leading-none mt-4 mb-1">Network</div>
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
                  className="text-xl font-bold text-black break-all transition-transform duration-200"
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
          <PageHeader title="Confirm Swap" onBack={backToVerify} />
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
                  <span className="text-lg font-bold text-black leading-tight break-words">{currentRequest.tokenIn} ({currentRequest.networkIn})</span>
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
                  <span className="text-lg font-bold text-black leading-tight break-words">{currentRequest.tokenOut} ({currentRequest.networkOut})</span>
                </div>
              </div>
            </div>

            <div className="h-[2px] bg-black flex-shrink-0 my-3.5" />

            {/* Contract — name + address (one tight block) */}
            <div className="flex-shrink-0">
              <div className="text-lg font-light text-black uppercase tracking-wide leading-none mb-1">Contract</div>
              <div className="text-xl font-bold text-black leading-tight break-all mb-1">{currentRequest.contractName}</div>
              <BoldEndsAddress addr={currentRequest.contractAddress} className="text-xl text-black break-all leading-snug" />
            </div>

            <div className="h-[2px] bg-black flex-shrink-0 my-3.5" />

            {/* Network Fee (network is shown inline with the swap amounts above) */}
            <div className="flex-shrink-0">
              <div className="text-lg font-light text-black uppercase tracking-wide leading-none mb-1">Network Fee</div>
              <div className="text-xl font-bold text-black leading-tight break-all">Max {formatFee(currentRequest.maxFee)} {currentRequest.tokenSymbol}</div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Details link */}
            <div className="text-right flex-shrink-0">
              <button onClick={openDetails} className="text-lg font-light text-black uppercase tracking-wide leading-none">
                Raw Data →
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
          <PageHeader title="Approve Token" onBack={backToVerify} />

          {/* Rhythm: label↔value mb-1 (4px), field↔field mt-4 (16px), section divider my-3.5 (28px). */}
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
                  <span className="text-xl font-bold text-black break-words">{currentRequest.tokenSymbol} ({currentRequest.network})</span>
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
              <BoldEndsAddress addr={currentRequest.spender} className="text-xl text-black break-all leading-snug" />
            </div>

            <div className="h-[2px] bg-black flex-shrink-0 my-3.5" />

            {currentRequest.isUnlimited ? (
              /* Unlimited: the hero is UNLIMITED (no token), so the Token line
                 carries token + network; then Network Fee. */
              <div className="flex-shrink-0">
                <div className="text-lg font-light text-black uppercase tracking-wide leading-none mb-1">Token</div>
                <div className="text-xl font-bold text-black leading-tight">{currentRequest.token} ({currentRequest.network})</div>
                <div className="mt-4">
                  <div className="text-lg font-light text-black uppercase tracking-wide leading-none mb-1">Network Fee</div>
                  <div className="text-xl font-bold text-black leading-tight break-all">Max {formatFee(currentRequest.maxFee)} {currentRequest.gasTokenSymbol}</div>
                </div>
              </div>
            ) : (
              /* Limited: network is already in the amount chip → just Network Fee
                 (no Expires — approval expiry isn't carried by the request). */
              <div className="flex-shrink-0">
                <div className="text-lg font-light text-black uppercase tracking-wide leading-none mb-1">Network Fee</div>
                <div className="text-xl font-bold text-black leading-tight break-all">Max {formatFee(currentRequest.maxFee)} {currentRequest.gasTokenSymbol}</div>
              </div>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Details link */}
            <div className="text-right flex-shrink-0">
              <button onClick={openDetails} className="text-lg font-light text-black uppercase tracking-wide leading-none">
                Raw Data →
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