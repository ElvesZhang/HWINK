import { useState } from 'react';
import { ChevronLeft, AlertTriangle, Check } from 'lucide-react';
import { PINKeypad } from './PINKeypad';
import { PageDebugId } from './PageDebugId';

interface ChangePINPageProps {
  onBack: () => void;
  randomized?: boolean;
  mode?: 'change' | 'verify';
  onVerifySuccess?: () => void;
  showDebugId?: boolean;
  /** Header label — defaults to "Change PIN". Reusers in a non-PIN-change
   *  context (e.g. Firmware Update 2FA) pass their own. */
  headerTitle?: string;
  /** Title over the keypad in verify mode's single step — defaults to
   *  "Enter Current PIN". */
  verifyTitle?: string;
}

type Step = 'current' | 'new' | 'confirm' | 'success';

export function ChangePINPage({ onBack, randomized = false, mode = 'change', onVerifySuccess, showDebugId, headerTitle = 'Change PIN', verifyTitle = 'Enter Current PIN' }: ChangePINPageProps) {
  const [step, setStep] = useState<Step>('current');
  const [currentPIN, setCurrentPIN] = useState('');
  const [newPIN, setNewPIN] = useState('');
  const [confirmPIN, setConfirmPIN] = useState('');
  const [error, setError] = useState('');

  const handleCurrentPINSubmit = () => {
    // Mock validation - in real app, verify against stored PIN
    if (currentPIN.length === 6) {
      if (mode === 'verify') {
        // For verify mode, call success callback immediately
        if (onVerifySuccess) {
          onVerifySuccess();
        }
      } else {
        // For change mode, continue to new PIN step
        setStep('new');
        setError('');
      }
    }
  };

  const handleNewPINSubmit = () => {
    if (newPIN.length !== 6) {
      setError('PIN must be 6 digits');
      return;
    }
    if (newPIN === currentPIN) {
      setError('New PIN must be different');
      return;
    }
    setStep('confirm');
    setError('');
  };

  const handleConfirmPINSubmit = () => {
    if (confirmPIN !== newPIN) {
      setError('PINs do not match');
      setConfirmPIN('');
      return;
    }
    setStep('success');
    setError('');
    setTimeout(() => {
      onBack();
    }, 1500);
  };

  const handleSubmit = () => {
    if (step === 'current') handleCurrentPINSubmit();
    else if (step === 'new') handleNewPINSubmit();
    else if (step === 'confirm') handleConfirmPINSubmit();
  };

  const getCurrentValue = () => {
    if (step === 'current') return currentPIN;
    if (step === 'new') return newPIN;
    if (step === 'confirm') return confirmPIN;
    return '';
  };

  const handleValueChange = (value: string) => {
    setError('');
    if (step === 'current') setCurrentPIN(value);
    else if (step === 'new') setNewPIN(value);
    else if (step === 'confirm') setConfirmPIN(value);
  };

  const getTitle = () => {
    if (step === 'current') return mode === 'verify' ? verifyTitle : 'Enter Current PIN';
    if (step === 'new') return 'Enter New PIN';
    if (step === 'confirm') return 'Confirm New PIN';
    return 'PIN Changed';
  };

  if (step === 'success') {
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <PageDebugId page="change-pin" subPage="success" showDebugId={showDebugId} />
        <div className="h-[45px] px-5 flex items-center border-b-2 border-black flex-shrink-0">
          <span className="text-lg font-bold text-black uppercase tracking-wide">{headerTitle}</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center mb-4 mx-auto">
              <Check className="w-11 h-11 text-[#838383]" strokeWidth={3} />
            </div>
            <div className="text-2xl font-bold text-black">PIN Changed</div>
            <div className="text-lg text-black mt-2">Successfully Updated</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
      <PageDebugId page="change-pin" subPage={step} showDebugId={showDebugId} />
      {/* Header */}
      <div className="h-[45px] px-5 flex items-center border-b-2 border-black flex-shrink-0">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
          <span className="text-lg font-bold text-black uppercase tracking-wide">{headerTitle}</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col">
        {/* Title */}
        <div className="mb-2">
          <h2 className="text-xl font-bold text-black">{getTitle()}</h2>
        </div>
        {/* Fixed-height feedback slot: keypad below stays put when error appears. */}
        <div className="min-h-[28px] mb-2">
          {error && (
            <div className="text-lg text-black font-bold flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" strokeWidth={3} /> {error}
            </div>
          )}
        </div>

        {/* Keypad */}
        <div className="flex-1 flex flex-col justify-center">
          <PINKeypad
            value={getCurrentValue()}
            onValueChange={handleValueChange}
            randomized={randomized}
            maxLength={6}
            onConfirm={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}