import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Fingerprint } from 'lucide-react';
import { PageDebugId } from './PageDebugId';

/**
 * Second-factor fingerprint verification, shown after Confirm on devices that
 * have a fingerprint enrolled. Full-screen (its own device frame), matching
 * ChangePINPage's verify flow. e-ink: 2-tone (#838383 + black), no opacity/shadow.
 *
 * Prototype: there is no real sensor, so the framed fingerprint target is a
 * tap affordance — touching it simulates a successful scan, then calls
 * onVerifySuccess (the parent then shows its signing → success screens).
 */
interface FingerprintVerifyPageProps {
  onBack: () => void;
  onVerifySuccess: () => void;
  showDebugId?: boolean;
  /** Header title — defaults to the signing flow's wording; the Passkey flow
   *  passes its own (FIDO2 user verification). */
  title?: string;
}

export function FingerprintVerifyPage({ onBack, onVerifySuccess, showDebugId, title = 'Verify to Sign' }: FingerprintVerifyPageProps) {
  const [state, setState] = useState<'prompt' | 'scanning'>('prompt');
  const timer = useRef<number | null>(null);

  // If the user backs out mid-scan, the component unmounts and we must cancel
  // the pending success — otherwise it would sign after cancellation.
  useEffect(() => () => { if (timer.current !== null) clearTimeout(timer.current); }, []);

  const scan = () => {
    if (state !== 'prompt') return;
    setState('scanning');
    timer.current = window.setTimeout(() => { onVerifySuccess(); }, 1100);
  };

  const scanning = state === 'scanning';

  return (
    <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
      <PageDebugId page="sign-verify-fingerprint" subPage={state} showDebugId={showDebugId} />

      {/* Header */}
      <div className="h-[45px] px-5 flex items-center border-b-2 border-black flex-shrink-0">
        <button onClick={onBack} className="flex items-center gap-2 active:scale-95 transition-transform">
          <ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
          <span className="text-lg font-bold text-black uppercase tracking-wide">{title}</span>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <button
          onClick={scan}
          disabled={scanning}
          aria-label="Touch the fingerprint sensor"
          className={`w-[150px] h-[150px] border-2 border-black rounded-sm flex items-center justify-center mb-7 transition-all ${scanning ? 'bg-black animate-pulse' : 'active:bg-black group'}`}
        >
          <Fingerprint className={`w-24 h-24 ${scanning ? 'text-[#838383]' : 'text-black group-active:text-[#838383]'}`} strokeWidth={1.75} />
        </button>

        <div className="text-xl font-bold text-black uppercase tracking-wide">
          {scanning ? 'Verifying…' : 'Verify Fingerprint'}
        </div>
        <div className="text-lg font-bold text-black mt-2 leading-snug">
          {scanning ? 'Keep your finger on the sensor' : 'Touch the sensor to sign this request'}
        </div>
      </div>
    </div>
  );
}
