import { useState, useEffect, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { UniversalKeyboard } from './UniversalKeyboard';
import { WordCountSelector } from './WordCountSelector';

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
}

type Step = 'select-length' | 'input' | 'result';

const PRESS = 'active:bg-black active:text-[#838383]';
const BTN_BASE = `h-14 border-2 border-black rounded-sm bg-[#838383] hover:bg-black hover:text-[#838383] ${PRESS} font-bold text-lg`;

// Entered-words review grid: 6 per page (2 cols × 3 rows). 12 words = 2 pages,
// 24 words = 4 pages. Fixed page size keeps chips large + height stable.
const WORDS_PER_REVIEW_PAGE = 6;

/**
 * Operational header: back arrow + page title + bottom divider. Verify Recovery
 * is reached from Security settings (a "I navigated here to manage X" context),
 * so per CONSTRAINTS § 4.2 it uses the titled operational header rather than the
 * naked BackOnlyHeader — the title aids orientation across the multi-step flow.
 */
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

export function VerifyRecoveryPageNew({ onBack }: VerifyRecoveryPageNewProps) {
  const [step, setStep] = useState<Step>('select-length');
  const [wordCount, setWordCount] = useState<12 | 24>(12);
  const [words, setWords] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  // Which page of the entered-words review grid is showing. Follows the word
  // currently being entered/edited so the active word is always on-screen.
  const [reviewPage, setReviewPage] = useState(0);
  useEffect(() => {
    setReviewPage(Math.floor(currentIndex / WORDS_PER_REVIEW_PAGE));
  }, [currentIndex]);

  // Mock verification — real device would compare against the stored seed.
  const verifyWords = (inputWords: string[]) =>
    inputWords.length === wordCount && inputWords.every(w => w.length > 0);

  const handleWordConfirm = (word?: string) => {
    const finalWord = word || currentWord;
    if (finalWord.length === 0) return;

    // Editing a previously-entered word (jumped back via a chip or the back
    // arrow): replace it in place, keep every other word, then return to the
    // frontier (the next not-yet-entered word) so the user resumes where they
    // left off.
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
      // All words entered → run verification
      const valid = verifyWords(newWords);
      setIsCorrect(valid);
      setStep('result');
      if (valid) setTimeout(() => onBack(), 2000);
    }
  };

  /** Jump to a previously-entered word to edit it in place. The rest of the
   *  entered words are preserved; confirming the edit returns to the frontier
   *  (see handleWordConfirm). */
  const goToWord = (targetIdx: number) => {
    if (targetIdx < 0 || targetIdx >= words.length) return;
    setCurrentIndex(targetIdx);
    setCurrentWord(words[targetIdx]);
  };

  // === SELECT LENGTH (matches Activation create-length style) ===
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

  // === RESULT ===
  if (step === 'result') {
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <OperationalHeader title="Verify Recovery Phrase" onBack={onBack} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 mx-auto ${
              isCorrect ? 'bg-black' : 'border-[3px] border-black'
            }`}
          >
            {isCorrect
              ? <Check className="w-11 h-11 text-[#838383]" strokeWidth={3} />
              : <X className="w-11 h-11 text-black" strokeWidth={3} />}
          </div>
          <div className="text-2xl font-bold text-black mb-3">
            {isCorrect ? 'Verification successful' : 'Verification failed'}
          </div>
          <div className="text-lg text-black leading-relaxed">
            {isCorrect
              ? 'Your recovery phrase is valid and has been verified.'
              : 'The recovery phrase you entered is invalid. Please try again.'}
          </div>

          {!isCorrect && (
            <button
              onClick={() => {
                setStep('select-length');
                setWords([]);
                setCurrentWord('');
                setCurrentIndex(0);
              }}
              className={`mt-6 px-6 ${BTN_BASE}`}
            >
              Try again
            </button>
          )}
        </div>
      </div>
    );
  }

  // === INPUT (per-word entry, matches Activation create-verify visual rhythm) ===
  return (
    <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col relative">
      <OperationalHeader
        title="Verify Recovery Phrase"
        onBack={() => setStep('select-length')}
        right={
          /* Progress lives in the header (same slot as the detail-page number)
             so the content column has room for the full 6-chip review grid. */
          <span className="text-lg font-bold text-black tabular-nums whitespace-nowrap">
            {currentIndex + 1}/{wordCount}
          </span>
        }
      />

      {/* pb reserves the keyboard: keys (~208) + BIP39 suggestion row (~58). */}
      <div className="flex-1 px-6 pt-3 pb-[270px] flex flex-col">
        {/* Input display */}
        <div className="min-h-14 border-2 border-black rounded-sm bg-[#838383] flex items-center px-3 mb-3">
          <span className="text-lg font-bold text-black break-all">{currentWord || ' '}</span>
        </div>

        {/* Entered-words review — fixed-height paginated 2-col grid. Touch-
           friendly chips (large tap targets for a 3" e-ink screen); fixed
           height so 24 words never push/cover the keyboard. Each chip is
           tappable to edit that word in place. Pure black-on-grey (no opacity
           / no grayscale — 2-tone e-ink). Page count is bounded so there is no
           scroll (CONSTRAINTS §1) and boundary arrows hide (§3.2). */}
        {words.length > 0 && (() => {
          const totalReviewPages = Math.ceil(words.length / WORDS_PER_REVIEW_PAGE);
          const page = Math.min(reviewPage, totalReviewPages - 1);
          const start = page * WORDS_PER_REVIEW_PAGE;
          const pageWords = words.slice(start, start + WORDS_PER_REVIEW_PAGE);
          return (
            <div className="mb-2">
              {/* Pagination header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg text-black uppercase tracking-wide">Entered</span>
                  {totalReviewPages > 1 && (
                    <span className="text-lg text-black font-bold">({page + 1}/{totalReviewPages})</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {page > 0 && (
                    <button
                      onClick={() => setReviewPage(page - 1)}
                      aria-label="Previous page"
                      className="h-8 w-8 flex items-center justify-center rounded-sm active:bg-black active:text-[#838383]"
                    >
                      <ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
                    </button>
                  )}
                  {page < totalReviewPages - 1 && (
                    <button
                      onClick={() => setReviewPage(page + 1)}
                      aria-label="Next page"
                      className="h-8 w-8 flex items-center justify-center rounded-sm active:bg-black active:text-[#838383]"
                    >
                      <ChevronRight className="w-5 h-5 text-black" strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              </div>

              {/* Fixed-height 2-col grid (3 rows × 6 per page). Each chip is
                 tappable to edit that word in place; the word currently being
                 edited is shown inverted (black fill). */}
              <div className="grid grid-cols-2 gap-2 h-[150px] content-start">
                {pageWords.map((w, i) => {
                  const globalIdx = start + i;
                  const editing = globalIdx === currentIndex;
                  return (
                    <button
                      key={globalIdx}
                      onClick={() => goToWord(globalIdx)}
                      className={`h-10 px-3 border-2 border-black rounded-sm text-lg font-bold flex items-center gap-1.5 ${
                        editing
                          ? 'bg-black text-[#838383]'
                          : `bg-[#838383] text-black ${PRESS}`
                      }`}
                      aria-label={`Edit word ${globalIdx + 1}: ${w}`}
                    >
                      <span className="tabular-nums shrink-0">{globalIdx + 1}</span>
                      <span className="truncate">{w}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Spacer */}
        <div className="flex-1" />
      </div>

      <UniversalKeyboard
        value={currentWord}
        onChange={setCurrentWord}
        onConfirm={handleWordConfirm}
        mode="bip39"
        bip39Words={BIP39_WORDS}
      />
    </div>
  );
}
