import { useState } from 'react';
import { ChevronLeft, AlertTriangle, Check, Loader2 } from 'lucide-react';
import { UniversalKeyboard } from './UniversalKeyboard';
import { PINKeypad } from './PINKeypad';
import { DeviceInput } from './DeviceInput';

interface PassphrasePageNewProps {
  onBack: () => void;
  /** Called after the NEW-passphrase flow fully completes (success screen).
   *  When provided, takes precedence over onBack at the very end so the user
   *  lands on Home rather than the parent Security page. The string arg is the
   *  newly chosen wallet name so the parent can update the StatusBar. */
  onCompleteToHome?: (newWalletName: string) => void;
  showDebugId?: boolean;
}

// Single flow only:
//   info → pin → input → confirm → display-passphrase → saving → wallet-name → success → onCompleteToHome
//
// There is no "active passphrase" state on the device — a hardware wallet
// can't tell whether it's currently running on a passphrase-derived account
// or the original one (each passphrase deterministically derives a different
// wallet). So we never show a "Status: Active" / Verify / Abandon UI.
// Every entry to this page starts the setup flow from `info`.
type Step =
  | 'info' | 'pin'
  | 'input' | 'confirm' | 'display-passphrase' | 'saving' | 'wallet-name' | 'success';

const PRESS = 'active:bg-black active:text-[#838383]';
const BTN_BASE = `h-14 border-2 border-black rounded-sm bg-[#838383] hover:bg-black hover:text-[#838383] ${PRESS} font-bold text-lg`;

export function PassphrasePageNew({ onBack, onCompleteToHome }: PassphrasePageNewProps) {
  const [step, setStep] = useState<Step>('info');
  const [pin, setPin] = useState('');
  const [walletName, setWalletName] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 'enable' = set a new passphrase; 'restore' = explicitly switch back to the
  // original (empty-passphrase) wallet. Chosen on the info screen.
  const [intent, setIntent] = useState<'enable' | 'restore'>('enable');

  // Simulated async submit — gives the UI a real "verifying..." moment so we
  // can later swap in the real firmware call without changing the visual shape.
  const submitWithPending = (fn: () => void, ms = 450) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setTimeout(() => {
      fn();
      setIsSubmitting(false);
    }, ms);
  };

  // --- Handlers ---

  // Restore the original recovery-phrase wallet (empty passphrase). Same end
  // result as confirming an empty passphrase: brief saving spinner → success
  // ("Original wallet restored") → Home. passphrase stays '' so the success
  // screen renders the original-wallet copy.
  const restoreOriginal = () => {
    setPassphrase('');
    setStep('saving');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        if (onCompleteToHome) onCompleteToHome('');
        else onBack();
      }, 2000);
    }, 2000);
  };

  const handlePINSubmit = () => {
    if (pin.length === 6) {
      submitWithPending(() => {
        setError('');
        if (intent === 'restore') restoreOriginal();
        else setStep('input');
      });
    }
  };

  const handlePassphraseConfirm = (word?: string) => {
    // Empty passphrase is intentionally allowed — it means "use the original
    // recovery-phrase wallet (no extra word)". Proceed to confirm step where
    // the user re-confirms the (possibly empty) value.
    const val = word !== undefined ? word : passphrase;
    if (word !== undefined) setPassphrase(word);
    setStep('confirm');
    setError('');
    // val captured for potential future logging; not used here.
    void val;
  };

  const handleConfirmSubmit = (word?: string) => {
    const val = word !== undefined ? word : confirmPassphrase;
    if (val !== passphrase) {
      setError('Passphrases do not match');
      setConfirmPassphrase('');  // auto-clear so user can retype without manually clearing
      return;
    }
    if (word !== undefined) setConfirmPassphrase(word);
    setError('');

    if (passphrase.length === 0) {
      // EMPTY passphrase path: this is the user opting back into their original
      // recovery-phrase wallet. Skip display-passphrase (nothing to show) and
      // wallet-name (no need to name the original wallet). Go straight through
      // a brief saving spinner to success.
      setStep('saving');
      setTimeout(() => {
        setStep('success');
        setTimeout(() => {
          // '' signals the parent to restore the original wallet name.
          if (onCompleteToHome) onCompleteToHome('');
          else onBack();
        }, 2000);
      }, 2000);
    } else {
      // Non-empty: full flow — show passphrase + reminder, then save, then name.
      setStep('display-passphrase');
    }
  };

  // --- Header helper ---
  const renderHeader = (title: string, onBackClick: () => void) => (
    <div className="h-[45px] px-5 flex items-center border-b-2 border-black flex-shrink-0">
      <button
        onClick={onBackClick}
        className={`flex items-center gap-2 ${PRESS} px-1 -mx-1 rounded-sm`}
      >
        <ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
        <span className="text-lg font-bold text-black uppercase tracking-wide">{title}</span>
      </button>
    </div>
  );

  const renderHeaderStatic = (title: string) => (
    <div className="h-[45px] px-5 flex items-center border-b-2 border-black flex-shrink-0">
      <span className="text-lg font-bold text-black uppercase tracking-wide">{title}</span>
    </div>
  );

  // --- Input field with clear button (shared). No live char counter:
  // continuous updates on an e-ink screen cause flicker / partial refreshes.
  // The clear button is vertically centred (`inset-y-0 my-auto`) so it stays
  // mid-line whether the value is one row or wraps to multiple rows.
  // === SUCCESS SCREENS ===

  if (step === 'success') {
    // Empty passphrase = restored to original wallet (no naming step ran)
    const isOriginalWallet = passphrase.length === 0;
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <Check className="w-20 h-20 mb-6 text-black" strokeWidth={3} />
          <p className="text-2xl font-bold text-black leading-tight">
            {isOriginalWallet ? 'Original wallet restored' : 'New wallet created'}
          </p>
          <p className="text-lg text-black mt-2 break-all">
            {isOriginalWallet
              ? 'No passphrase — your original recovery-phrase wallet'
              : walletName}
          </p>
        </div>
        <div className="h-20" />
      </div>
    );
  }

  // === INFO (entry page) ===

  if (step === 'info') {
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        {renderHeader('Passphrase', onBack)}
        <div className="flex-1 p-5 flex flex-col">
          <h2 className="text-xl font-bold text-black mb-2">Add a passphrase?</h2>
          <p className="text-lg text-black leading-snug">
            An extra secret added to your recovery phrase. Each passphrase opens a separate wallet.
          </p>
          <div className="mt-4 border-2 border-black rounded-sm bg-black text-[#838383] p-4 flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={3} />
            <p className="text-lg leading-snug">If you forget it, that wallet's funds are lost — it can't be recovered.</p>
          </div>

          <div className="mt-auto space-y-3">
            <button
              onClick={() => { setIntent('enable'); setStep('pin'); }}
              className={`w-full ${BTN_BASE}`}
            >
              Enable
            </button>
            <button
              onClick={() => { setIntent('restore'); setStep('pin'); }}
              className={`w-full ${BTN_BASE}`}
            >
              Don't enable
            </button>
          </div>
        </div>
      </div>
    );
  }

  // === PIN verification (for set/change) ===

  if (step === 'pin') {
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        {renderHeader('Verify PIN', () => setStep('info'))}
        <div className="flex-1 p-5 flex flex-col">
          <div className="mb-2">
            <h2 className="text-xl font-bold text-black">Enter your device PIN</h2>
            {intent === 'restore' && (
              <p className="text-lg text-black mt-1">To switch back to your original wallet.</p>
            )}
          </div>
          {/* Fixed-height feedback slot so the keypad below never shifts when
             error / loading state appears (e-ink: avoid moving the focused area). */}
          <div className="min-h-[28px] mb-2">
            {isSubmitting && (
              <p className="text-lg text-black font-bold">Verifying...</p>
            )}
            {!isSubmitting && error && (
              <div className="text-lg text-black font-bold flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" strokeWidth={3} /> {error}
              </div>
            )}
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <PINKeypad
              value={pin}
              onValueChange={setPin}
              maxLength={6}
              onConfirm={handlePINSubmit}
            />
          </div>
        </div>
      </div>
    );
  }

  // === SET/CHANGE: enter passphrase & confirm ===

  if (step === 'input' || step === 'confirm') {
    const currentValue = step === 'input' ? passphrase : confirmPassphrase;
    const setValue = step === 'input' ? setPassphrase : setConfirmPassphrase;
    const handleConfirm = step === 'input' ? handlePassphraseConfirm : handleConfirmSubmit;

    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col relative">
        {renderHeader(
          step === 'input' ? 'Enter Passphrase' : 'Confirm Passphrase',
          () => step === 'input' ? setStep('pin') : setStep('input')
        )}
        <div className="flex-1 p-5 pb-[220px] flex flex-col">
          <DeviceInput
            value={currentValue}
            label={step === 'input' ? 'Enter your passphrase' : 'Confirm your passphrase'}
            hint={error
              ? undefined
              : step === 'input'
                ? 'Up to 60 characters.'
                : 'Re-type it exactly — case and spaces included.'}
            onClear={() => { setValue(''); setError(''); }}
          />

          {error && (
            <div className="mt-3 text-lg text-black font-bold flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" strokeWidth={3} /> {error}
            </div>
          )}
        </div>

        <UniversalKeyboard
          key={step}
          value={currentValue}
          onChange={(val) => {
            if (val.length <= 60) {
              setValue(val);
              setError('');
            }
          }}
          onConfirm={handleConfirm}
          mode="text"
          allowEmpty
        />
      </div>
    );
  }

  // === DISPLAY PASSPHRASE (review + write-it-down reminder) ===
  // Mirrors Activation create-done style: 2/3 hero block + 1/3 "Tap to continue".
  // The whole device area is the affordance — tapping anywhere advances. This
  // matches the onboarding flow's full-screen-button pattern.

  if (step === 'display-passphrase') {
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        {renderHeader('Passphrase', () => setStep('confirm'))}
        <button
          type="button"
          onClick={() => {
            setStep('saving');
            // Simulated 2s device init — replace with real firmware call later.
            setTimeout(() => { setStep('wallet-name'); }, 2000);
          }}
          className={`flex-1 flex flex-col text-center px-6 pt-4 pb-5 ${PRESS}`}
        >
          {/* Hero: label + bordered passphrase, centred. Below it a uniform
             bullet list of the four pieces of meta the user actually needs.
             Single weight throughout the hints (no mixed bold / normal / xs
             jumble); the list sits in a centred max-w block so the bullets
             read as one tidy paragraph centred under the passphrase. */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="text-lg font-bold text-black uppercase tracking-widest mb-3 text-center">
              Your Passphrase
            </div>
            <div className="border-2 border-black rounded-sm bg-[#838383] px-4 py-4 mb-6">
              <p className="text-3xl font-bold text-black leading-snug break-all font-mono text-center">
                {passphrase}
              </p>
            </div>

            <ul className="space-y-1.5 text-lg text-black leading-snug max-w-[300px] mx-auto text-left">
              <li>- Write it down on paper</li>
              <li>- Memorize it if you can</li>
              <li>- Case-sensitive — every character matters</li>
              <li>- Lost = lost funds, no recovery</li>
            </ul>
          </div>

          <div className="flex-shrink-0 text-center">
            <span className="text-lg text-black">Tap to continue</span>
          </div>
        </button>
      </div>
    );
  }

  // === SAVING (transient spinner, ~2s) ===
  // Header has no back button — saving is a one-way transition. After timeout
  // the parent setTimeout from display-passphrase advances to wallet-name.

  if (step === 'saving') {
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        {renderHeaderStatic('Passphrase')}
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="w-16 h-16 text-black animate-spin" strokeWidth={2} />
          <p className="text-lg text-black mt-4">Initializing wallet...</p>
        </div>
      </div>
    );
  }

  // === WALLET NAME (after passphrase confirmed) ===

  if (step === 'wallet-name') {
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col relative">
        {/* Back goes to display-passphrase (skip transient saving step) */}
        {renderHeader('Wallet Name', () => setStep('display-passphrase'))}
        <div className="flex-1 p-5 pb-[220px] flex flex-col">
          <DeviceInput
            value={walletName}
            label="Name your wallet"
            hint={error ? undefined : 'Stored on this device, to tell your wallets apart.'}
            onClear={() => { setWalletName(''); setError(''); }}
          />

          {error && (
            <div className="mt-3 text-lg text-black font-bold flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" strokeWidth={3} /> {error}
            </div>
          )}
        </div>

        <UniversalKeyboard
          value={walletName}
          onChange={(val) => {
            if (val.length <= 20) {
              setWalletName(val);
              setError('');
            }
          }}
          onConfirm={() => {
            if (walletName.length === 0) {
              setError('Wallet name cannot be empty');
              return;
            }
            submitWithPending(() => {
              setStep('success');
              // End of NEW flow: prefer onCompleteToHome (go to device Home +
              // update StatusBar walletName), fall back to onBack if not wired.
              setTimeout(() => {
                if (onCompleteToHome) onCompleteToHome(walletName);
                else onBack();
              }, 2000);
            });
          }}
          mode="text"
        />
      </div>
    );
  }

  return null;
}
