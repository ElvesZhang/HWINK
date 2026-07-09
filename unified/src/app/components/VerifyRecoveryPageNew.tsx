import { useState, useEffect, type ReactNode } from 'react';
import { ChevronLeft, Check, X } from 'lucide-react';
import { Bip39Keyboard } from './Bip39Keyboard';
import { UniversalKeyboard } from './UniversalKeyboard';
import { WordCountSelector } from './WordCountSelector';
import { DeviceInput } from './DeviceInput';

// BIP39 wordlist sample
const BIP39_WORDS = [
  'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
  'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
  'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
  'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance',
  'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent',
  'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album',
];

interface VerifyRecoveryPageNewProps {
  onBack: () => void;
  /** Manual end-state for previewing (driven by VerifyDocsPanel, outside the
   *  device). The mock always "passes", so the failure screen is otherwise
   *  unreachable; this lets a reviewer switch success / fail by hand. */
  outcome?: 'success' | 'fail';
  /** When the words check fails, the user may have used a passphrase. This is the
   *  mock result of that re-check (also an outside switch), so both sub-branches
   *  are previewable. Only consulted after the user enters a passphrase. */
  passphraseOutcome?: 'pass' | 'fail';
  showDebugId?: boolean;
}

type Step = 'select-length' | 'input' | 'result';
// Sub-flow after a failed words check: ask if a passphrase was used → (yes) enter
// it → pass/fail; (no) terminal error. 'passSuccess' = passed with a passphrase.
type FailStage = 'ask' | 'passphrase' | 'error' | 'passSuccess';

const PRESS = 'active:bg-black active:text-[#838383]';
const BTN_BASE = `h-14 border-2 border-black rounded-sm bg-[#838383] hover:bg-black hover:text-[#838383] ${PRESS} font-bold text-lg`;

/** Operational header: back arrow + page title + bottom divider. */
function OperationalHeader({ title, onBack, right }: { title: string; onBack: () => void; right?: ReactNode }) {
  return (
    <div className="h-[45px] px-5 flex items-center justify-between border-b-2 border-black flex-shrink-0">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onBack(); }}
        aria-label="Back"
        className={`flex items-center gap-2 ${PRESS} px-1 -mx-1 rounded-sm`}
      >
        <ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
        <span className="text-lg font-bold text-black uppercase tracking-wide">{title}</span>
      </button>
      {right}
    </div>
  );
}

export function VerifyRecoveryPageNew({ onBack, outcome = 'success', passphraseOutcome = 'pass' }: VerifyRecoveryPageNewProps) {
  const [step, setStep] = useState<Step>('select-length');
  const [wordCount, setWordCount] = useState<12 | 18 | 24>(12);
  const [words, setWords] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  // Fail-branch sub-flow (passphrase re-check). Reset whenever we're back on a
  // success outcome so flipping the outside switch always re-enters cleanly.
  const [failStage, setFailStage] = useState<FailStage>('ask');
  const [passphrase, setPassphrase] = useState('');
  useEffect(() => {
    if (outcome === 'success') { setFailStage('ask'); setPassphrase(''); }
  }, [outcome]);

  const handleWordConfirm = (word?: string) => {
    const finalWord = word || currentWord;
    if (finalWord.length === 0) return;

    // Editing a previously-entered word (navigated back via ‹): replace it in
    // place, keep the rest, then return to the frontier (next not-yet-entered
    // word) so the user resumes where they left off.
    if (currentIndex < words.length) {
      const newWords = [...words];
      newWords[currentIndex] = finalWord;
      setWords(newWords);
      setCurrentIndex(newWords.length);
      setCurrentWord('');
      return;
    }

    // Appending the next new word at the frontier.
    const newWords = [...words, finalWord];
    setWords(newWords);
    setCurrentWord('');

    if (currentIndex + 1 < wordCount) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Outcome is set manually via the outside switch (VerifyDocsPanel); the
      // result screen reads `outcome` directly so it can be flipped live too.
      setFailStage('ask');
      setPassphrase('');
      setStep('result');
    }
  };

  // Step back/forward one word. Going back loads the entered word onto the line
  // so it can be edited (only ever ONE word visible — never the whole phrase).
  const goPrev = () => {
    if (currentIndex <= 0) return;
    const i = currentIndex - 1;
    setCurrentIndex(i);
    setCurrentWord(words[i] ?? '');
  };
  const goNext = () => {
    if (currentIndex >= words.length) return; // frontier: nothing ahead
    const i = currentIndex + 1;
    setCurrentIndex(i);
    setCurrentWord(words[i] ?? '');
  };

  // === SELECT LENGTH (12 / 18 / 24) ===
  if (step === 'select-length') {
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <OperationalHeader title="Verify Recovery Phrase" onBack={onBack} />
        <div className="flex-1 px-6 pt-5 pb-6 flex flex-col">
          <h2 className="text-3xl font-bold text-black leading-snug">
            Pick your Recovery Phrase length
          </h2>
          <div className="mt-auto">
            <WordCountSelector
              onSelect={(count) => {
                setWordCount(count);
                setStep('input');
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // === RESULT (outcome set by the outside switch) ===
  if (step === 'result') {
    const restart = () => {
      setStep('select-length');
      setWords([]);
      setCurrentWord('');
      setCurrentIndex(0);
      setFailStage('ask');
      setPassphrase('');
    };

    // ── SUCCESS ── either the words matched, or they matched once the passphrase
    // was added (passSuccess). ──
    if (outcome === 'success' || failStage === 'passSuccess') {
      const viaPassphrase = failStage === 'passSuccess';
      return (
        <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
          <OperationalHeader title="Verify Recovery Phrase" onBack={onBack} />
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center mb-4 mx-auto">
              <Check className="w-11 h-11 text-[#838383]" strokeWidth={3} />
            </div>
            <div className="text-2xl font-bold text-black mb-3">Verification successful</div>
            <div className="text-lg text-black leading-relaxed">
              {viaPassphrase
                ? 'Your recovery phrase and passphrase are correct.'
                : 'Your recovery phrase is valid and has been verified.'}
            </div>
          </div>
        </div>
      );
    }

    // ── FAIL · step 1: ask whether a passphrase was used ── words alone derive
    // the empty-passphrase wallet, so a mismatch can simply mean the wallet had
    // a passphrase. Offer to re-check with it rather than failing outright. ──
    if (failStage === 'ask') {
      return (
        <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
          <OperationalHeader title="Verify Recovery Phrase" onBack={onBack} />
          <div className="flex-1 flex flex-col items-center justify-center px-7 text-center">
            <div className="w-20 h-20 rounded-full border-[3px] border-black flex items-center justify-center mb-4 mx-auto">
              <X className="w-11 h-11 text-black" strokeWidth={3} />
            </div>
            <div className="text-2xl font-bold text-black mb-3 leading-snug">Recovery phrase doesn’t match</div>
            <div className="text-lg text-black leading-relaxed mb-7">
              Did you set a passphrase for this wallet?
            </div>
            <div className="w-full flex flex-col gap-3">
              <button onClick={() => { setFailStage('passphrase'); setPassphrase(''); }} className={`px-6 ${BTN_BASE}`}>
                Yes, I used a passphrase
              </button>
              <button onClick={() => setFailStage('error')} className={`px-6 ${BTN_BASE}`}>
                No
              </button>
            </div>
          </div>
        </div>
      );
    }

    // ── FAIL · step 2: enter the passphrase (full keyboard) and re-check ── */
    if (failStage === 'passphrase') {
      return (
        <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col relative">
          <OperationalHeader title="Enter Passphrase" onBack={() => setFailStage('ask')} />
          <div className="flex-1 p-5 pb-[220px] flex flex-col">
            <DeviceInput
              value={passphrase}
              label="Enter your passphrase"
              hint="Case and spaces matter."
              onClear={() => setPassphrase('')}
            />
          </div>
          <UniversalKeyboard
            value={passphrase}
            onChange={(val) => { if (val.length <= 60) setPassphrase(val); }}
            onConfirm={() => setFailStage(passphraseOutcome === 'pass' ? 'passSuccess' : 'error')}
            mode="text"
            allowEmpty
          />
        </div>
      );
    }

    // ── FAIL · terminal error ── reached via "No" or a wrong passphrase. ──
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <OperationalHeader title="Verify Recovery Phrase" onBack={onBack} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-20 h-20 rounded-full border-[3px] border-black flex items-center justify-center mb-4 mx-auto">
            <X className="w-11 h-11 text-black" strokeWidth={3} />
          </div>
          <div className="text-2xl font-bold text-black mb-3">Verification failed</div>
          <div className="text-lg text-black leading-relaxed">
            The recovery phrase you entered is invalid. Please try again.
          </div>
          <button onClick={restart} className={`mt-6 px-6 ${BTN_BASE}`}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  // === INPUT (one word at a time: line field + prev/next; no phrase shown) ===
  const atFrontier = currentIndex >= words.length;
  return (
    <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
      <OperationalHeader
        title="Verify Recovery Phrase"
        onBack={() => setStep('select-length')}
        right={
          <span className="text-lg font-bold text-black tabular-nums whitespace-nowrap">
            {currentIndex + 1}/{wordCount}
          </span>
        }
      />

      <div className="flex-1 px-6 flex flex-col min-h-0">
        {/* Line + prev/next + hint anchored at a fixed top offset, with a spacer
           below — so the line never shifts when the candidate tags appear /
           disappear (the keyboard grows into the spacer, not the line). */}
        <div className="flex-shrink-0 pt-14">
          <DeviceInput
            value={currentWord}
            hint={currentWord ? `Word ${currentIndex + 1} of ${wordCount}` : `Enter your word no.${currentIndex + 1}`}
            onPrev={currentIndex > 0 ? goPrev : undefined}
            onNext={!atFrontier ? goNext : undefined}
          />
        </div>
        <div className="flex-1" />
      </div>

      <Bip39Keyboard
        value={currentWord}
        onChange={setCurrentWord}
        onConfirm={handleWordConfirm}
        bip39Words={BIP39_WORDS}
      />
    </div>
  );
}
