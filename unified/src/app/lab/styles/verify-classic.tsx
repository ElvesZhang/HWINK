import { useState, useEffect, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { UniversalKeyboard } from '../../components/UniversalKeyboard';
import type { LabScreen } from '../data';

/**
 * VERIFY · 旧版存档 — a FROZEN snapshot of the original VerifyRecoveryPageNew
 * (box input + 6-per-page editable "entered" grid + full UniversalKeyboard),
 * preserved here for reference after the real page was rebuilt. Self-contained
 * (inline header + frozen 12/24 selector) so it never tracks later changes.
 * Only the 'verify' screen is implemented; other screens show a placeholder.
 */
const PRESS = 'active:bg-black active:text-[#838383]';
const BTN_BASE = `h-14 border-2 border-black rounded-sm bg-[#838383] hover:bg-black hover:text-[#838383] ${PRESS} font-bold text-lg`;
const WORDS_PER_REVIEW_PAGE = 6;
const BIP39_WORDS = [
  'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
  'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
  'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
  'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance',
  'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent',
  'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album',
];

export function VerifyClassicStyle({ screen }: { screen: LabScreen }) {
  if (screen === 'verify') return <VerifyRecoveryClassic onBack={() => {}} />;
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8 text-black">
      <div className="text-[15px] font-bold uppercase tracking-[0.2em]">Verify · 存档</div>
      <div className="text-[14px] mt-2">仅 Verify 屏（旧版快照）</div>
    </div>
  );
}

function OperationalHeader({ title, onBack, right }: { title: string; onBack: () => void; right?: ReactNode }) {
  return (
    <div className="h-[45px] px-5 flex items-center justify-between border-b-2 border-black flex-shrink-0">
      <button type="button" onClick={onBack} aria-label="Back" className={`flex items-center gap-2 ${PRESS} px-1 -mx-1 rounded-sm`}>
        <ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
        <span className="text-lg font-bold text-black uppercase tracking-wide">{title}</span>
      </button>
      {right}
    </div>
  );
}

function VerifyRecoveryClassic({ onBack }: { onBack: () => void }) {
  type Step = 'select-length' | 'input' | 'result';
  const [step, setStep] = useState<Step>('select-length');
  const [wordCount, setWordCount] = useState<12 | 24>(12);
  const [words, setWords] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [reviewPage, setReviewPage] = useState(0);
  useEffect(() => { setReviewPage(Math.floor(currentIndex / WORDS_PER_REVIEW_PAGE)); }, [currentIndex]);

  const verifyWords = (inputWords: string[]) => inputWords.length === wordCount && inputWords.every(w => w.length > 0);

  const handleWordConfirm = (word?: string) => {
    const finalWord = word || currentWord;
    if (finalWord.length === 0) return;
    if (currentIndex < words.length) {
      const newWords = [...words];
      newWords[currentIndex] = finalWord;
      setWords(newWords);
      setCurrentIndex(newWords.length);
      setCurrentWord('');
      return;
    }
    const newWords = [...words, finalWord];
    setWords(newWords);
    setCurrentWord('');
    if (currentIndex + 1 < wordCount) {
      setCurrentIndex(currentIndex + 1);
    } else {
      const valid = verifyWords(newWords);
      setIsCorrect(valid);
      setStep('result');
      if (valid) setTimeout(() => onBack(), 2000);
    }
  };
  const goToWord = (targetIdx: number) => {
    if (targetIdx < 0 || targetIdx >= words.length) return;
    setCurrentIndex(targetIdx);
    setCurrentWord(words[targetIdx]);
  };

  if (step === 'select-length') {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <OperationalHeader title="Verify Recovery Phrase" onBack={onBack} />
        <div className="flex-1 px-6 pt-5 pb-6 flex flex-col">
          <h2 className="text-3xl font-bold text-black leading-snug">Pick your Recovery Phrase length</h2>
          <div className="mt-auto space-y-3">
            {([12, 24] as const).map(c => (
              <button key={c} onClick={() => { setWordCount(c); setStep('input'); }} className={`w-full ${BTN_BASE}`}>{c} words</button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'result') {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <OperationalHeader title="Verify Recovery Phrase" onBack={onBack} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 mx-auto ${isCorrect ? 'bg-black' : 'border-[3px] border-black'}`}>
            {isCorrect ? <Check className="w-11 h-11 text-[#838383]" strokeWidth={3} /> : <X className="w-11 h-11 text-black" strokeWidth={3} />}
          </div>
          <div className="text-2xl font-bold text-black mb-3">{isCorrect ? 'Verification successful' : 'Verification failed'}</div>
          <div className="text-lg text-black leading-relaxed">{isCorrect ? 'Your recovery phrase is valid and has been verified.' : 'The recovery phrase you entered is invalid. Please try again.'}</div>
          {!isCorrect && (
            <button onClick={() => { setStep('select-length'); setWords([]); setCurrentWord(''); setCurrentIndex(0); }} className={`mt-6 px-6 ${BTN_BASE}`}>Try again</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      <OperationalHeader title="Verify Recovery Phrase" onBack={() => setStep('select-length')} right={<span className="text-lg font-bold text-black tabular-nums whitespace-nowrap">{currentIndex + 1}/{wordCount}</span>} />
      <div className="flex-1 px-6 pt-3 pb-[270px] flex flex-col">
        <div className="min-h-14 border-2 border-black rounded-sm bg-[#838383] flex items-center px-3 mb-3">
          <span className="text-lg font-bold text-black break-all">{currentWord || ' '}</span>
        </div>
        {words.length > 0 && (() => {
          const totalReviewPages = Math.ceil(words.length / WORDS_PER_REVIEW_PAGE);
          const page = Math.min(reviewPage, totalReviewPages - 1);
          const start = page * WORDS_PER_REVIEW_PAGE;
          const pageWords = words.slice(start, start + WORDS_PER_REVIEW_PAGE);
          return (
            <div className="mb-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg text-black uppercase tracking-wide">Entered</span>
                  {totalReviewPages > 1 && <span className="text-lg text-black font-bold">({page + 1}/{totalReviewPages})</span>}
                </div>
                <div className="flex items-center gap-1">
                  {page > 0 && <button onClick={() => setReviewPage(page - 1)} aria-label="Previous page" className="h-8 w-8 flex items-center justify-center rounded-sm active:bg-black active:text-[#838383]"><ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} /></button>}
                  {page < totalReviewPages - 1 && <button onClick={() => setReviewPage(page + 1)} aria-label="Next page" className="h-8 w-8 flex items-center justify-center rounded-sm active:bg-black active:text-[#838383]"><ChevronRight className="w-5 h-5 text-black" strokeWidth={2.5} /></button>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 h-[150px] content-start">
                {pageWords.map((w, i) => {
                  const globalIdx = start + i;
                  const editing = globalIdx === currentIndex;
                  return (
                    <button key={globalIdx} onClick={() => goToWord(globalIdx)} className={`h-10 px-3 border-2 border-black rounded-sm text-lg font-bold flex items-center gap-1.5 ${editing ? 'bg-black text-[#838383]' : `bg-[#838383] text-black ${PRESS}`}`} aria-label={`Edit word ${globalIdx + 1}: ${w}`}>
                      <span className="tabular-nums shrink-0">{globalIdx + 1}</span>
                      <span className="truncate">{w}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })()}
        <div className="flex-1" />
      </div>
      <UniversalKeyboard value={currentWord} onChange={setCurrentWord} onConfirm={handleWordConfirm} mode="bip39" bip39Words={BIP39_WORDS} />
    </div>
  );
}
