import { useState } from 'react';
import { ChevronLeft, AlertTriangle, Trash2, Check } from 'lucide-react';
import { PINKeypad } from './PINKeypad';

interface ResetDevicePageProps {
  onBack: () => void;
}

type Step = 'warning' | 'pin' | 'confirm-popup' | 'resetting';

export function ResetDevicePage({ onBack }: ResetDevicePageProps) {
  const [step, setStep] = useState<Step>('warning');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleProceedToPin = () => {
    setStep('pin');
  };

  const handlePinSubmit = () => {
    // Simulate PIN verification (in real app, this would verify against actual PIN)
    if (pin === '123456') {
      setStep('confirm-popup');
      setError('');
    } else {
      setError('Incorrect PIN');
      setPin('');
    }
  };

  const handleConfirmReset = () => {
    setStep('resetting');
    // In real app, this would trigger factory reset
    setTimeout(() => {
      // Reset complete, return to previous screen
      onBack();
    }, 2000);
  };

  const handleCancelReset = () => {
    setPin('');
    setStep('pin');
  };

  // Resetting screen
  if (step === 'resetting') {
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <div className="h-[45px] px-5 flex items-center border-b-2 border-black flex-shrink-0">
          <span className="text-lg font-bold text-black uppercase tracking-wide">Resetting Device</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-5">
          <Trash2 className="w-16 h-16 text-black mb-4" strokeWidth={1.5} />

          <div className="text-2xl font-bold text-black mb-1 text-center">
            Factory Reset
          </div>
          <div className="text-lg font-light text-black text-center">
            Device is resetting...
          </div>

          <div className="h-[2px] bg-black w-full my-3.5" />

          <div className="w-full">
            <div className="text-lg font-light text-black uppercase tracking-wide leading-none mb-1.5">Please Wait</div>
            <ul className="space-y-1 text-lg text-black leading-snug">
              <li>• Erasing all data</li>
              <li>• Restoring factory settings</li>
              <li>• Device will restart</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // PIN input screen
  if (step === 'pin' || step === 'confirm-popup') {
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col relative">
        {/* Header */}
        <div className="h-[45px] px-5 flex items-center border-b-2 border-black flex-shrink-0">
          <button 
            onClick={() => setStep('warning')}
            className="flex items-center gap-2 active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
            <span className="text-lg font-bold text-black uppercase tracking-wide">Reset Device</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 flex flex-col">
          {/* Title */}
          <div className="mb-2">
            <h2 className="text-xl font-bold text-black">Enter PIN to Confirm</h2>
          </div>
          {/* Fixed-height feedback slot: keypad stays put when error appears. */}
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
              value={pin} 
              onValueChange={(value) => {
                setPin(value);
                setError('');
              }}
              randomized={true}
              maxLength={6}
              onConfirm={handlePinSubmit}
              showConfirm={true}
            />
          </div>
        </div>

        {/* Confirmation Popup */}
        {step === 'confirm-popup' && (
          <div className="absolute inset-0 bg-[#838383] flex items-center justify-center p-5 z-50">
            <div className="border-4 border-black rounded-sm bg-[#838383] p-4 w-full max-w-[340px]">
              {/* Dialog hero row — left-aligned, same grammar as the warning screen. */}
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-9 h-9 text-black flex-shrink-0" strokeWidth={2} />
                <div className="text-2xl font-bold text-black tracking-tight leading-tight">Final Confirmation</div>
              </div>

              <div className="h-[2px] bg-black my-3" />

              <div className="mb-3">
                <div className="text-lg font-light text-black uppercase tracking-wide leading-none mb-1.5">This will erase</div>
                <ul className="space-y-1 text-lg text-black leading-snug">
                  <li>• All wallets and keys</li>
                  <li>• Recovery phrase</li>
                  <li>• All device data</li>
                </ul>
              </div>

              <div className="text-lg font-bold text-black mb-3">
                This CANNOT be undone!
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleConfirmReset}
                  className="w-full h-12 border-2 border-black rounded-sm bg-black text-[#838383] hover:bg-[#838383] hover:text-black active:scale-95 transition-all font-bold text-lg uppercase"
                >
                  Yes, Reset Device
                </button>
                <button
                  onClick={handleCancelReset}
                  className="w-full h-12 border-2 border-black rounded-sm bg-[#838383] hover:bg-black hover:text-[#838383] active:scale-95 transition-all font-bold text-lg uppercase"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main reset warning screen
  return (
    <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
      {/* Header */}
      <div className="h-[45px] px-5 flex items-center border-b-2 border-black flex-shrink-0">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
          <span className="text-lg font-bold text-black uppercase tracking-wide">Reset Device</span>
        </button>
      </div>

      {/* Content — signing-screen grammar: left-aligned hero, 2px section
          dividers, label/content rhythm, bottom action bar. */}
      <div className="flex-1 px-5 pt-4 flex flex-col min-h-0">
        {/* Hero — what this screen does, sized like a signing hero. */}
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-9 h-9 text-black flex-shrink-0" strokeWidth={2} />
          <div className="text-3xl font-bold text-black tracking-tight leading-tight">Factory Reset</div>
        </div>

        <div className="h-[2px] bg-black flex-shrink-0 my-3.5" />

        <div>
          <div className="text-lg font-light text-black uppercase tracking-wide leading-none mb-1.5">This will permanently delete</div>
          <ul className="space-y-1 text-lg text-black leading-snug">
            <li>• All wallets and keys</li>
            <li>• Recovery phrase and PIN</li>
            <li>• Transaction history</li>
            <li>• All settings</li>
          </ul>
        </div>

        <div className="h-[2px] bg-black flex-shrink-0 my-3.5" />

        <div>
          <div className="text-lg font-light text-black uppercase tracking-wide leading-none mb-1.5">Before Proceeding</div>
          <ul className="space-y-1 text-lg text-black leading-snug">
            <li className="flex items-center gap-1.5">
              <Check className="w-4 h-4 flex-shrink-0" strokeWidth={3} /> Backup recovery phrase
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="w-4 h-4 flex-shrink-0" strokeWidth={3} /> Record wallet addresses
            </li>
          </ul>
        </div>

        <div className="flex-1" />

        <p className="text-lg font-light text-black">Enter your PIN to confirm.</p>
      </div>

      {/* Action bar — same inset divider as the signing screens. */}
      <div className="mx-4 mt-3 mb-4 pt-3 border-t-2 border-black flex-shrink-0">
        <button
          onClick={handleProceedToPin}
          className="w-full h-[60px] bg-black text-[#838383] rounded-sm hover:bg-[#222] active:scale-[0.97] transition-all font-bold text-lg uppercase tracking-wide"
        >
          Proceed to Reset
        </button>
      </div>
    </div>
  );
}