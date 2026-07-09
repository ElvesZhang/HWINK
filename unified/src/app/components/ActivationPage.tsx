import { useState } from 'react';
import { ChevronLeft, ChevronRight, QrCode, Check, X as XIcon, AlertTriangle } from 'lucide-react';
import { OnboardingHintBar } from './OnboardingHintBar';
import { WordCountSelector } from './WordCountSelector';
import { MnemonicWordList } from './MnemonicWordList';
import { MnemonicVerifyPicker } from './MnemonicVerifyPicker';
import { UniversalKeyboard } from './UniversalKeyboard';
import { PINKeypad } from './PINKeypad';

// Activation state machine. Phase 3.1 covers the intro & path-choice screens
// (splash → welcome → scan-to-connect → choose-path). Phase 3.2 adds the
// "set up a new wallet" sub-flow: explanation → length pick → display →
// verification → secret reminder. Phase 3.3+ will add restore / PIN / biometric.
//
// `welcome-1` and `welcome-2`: two paragraphs of intro copy that the design
// exposes as separate frames (327:3117 / 327:3126). welcome-2 *adds* a
// paragraph below welcome-1 rather than replacing it.
//
// `scan-to-connect`: QR-code prompt for app pairing (Figma 327:3228). In
// the real device, scanning the QR bridges to the app-mediated path; the
// standalone path advances to choose-path on a physical button. Prototype
// exposes a "tap to skip" affordance.
//
// `create-*` (Phase 3.2, sourced from 327:4432 onwards):
//   create-intro         "SafePal E-ink will generate your Secret Recovery Phrase..."
//   create-length        12-words / 24-words picker
//   create-display       Show the generated phrase, 6 words per page (paginated)
//   create-verify-intro  "Let's confirm that all words are written correctly."
//   create-verify        Multiple-choice (4 options) per word, in sequence
//   create-done          "Your Secret Recovery Phrase is for your eyes only." → onComplete
export type ActivationStep =
  | 'splash' | 'welcome-1' | 'welcome-2' | 'scan-to-connect' | 'choose-path'
  | 'create-intro' | 'create-length' | 'create-display'
  | 'create-verify-intro' | 'create-verify' | 'create-done'
  // Phase 3.2.5: post-mnemonic steps shared by create and restore paths
  | 'naming' | 'pin-explain' | 'pin-set' | 'pin-confirm' | 'done';

// Mock generated phrase for the prototype. Real device draws from BIP39.
// First 6 align with the words shown in Figma 327:4480 ("Rebel/Anger/…").
const MOCK_MNEMONIC_24 = [
  'rebel', 'anger', 'review', 'bulb', 'hockey', 'define',
  'remind', 'dial', 'swift', 'radar', 'smile', 'orphan',
  'acoustic', 'acid', 'bridge', 'cabin', 'camera', 'canvas',
  'captain', 'catalog', 'cattle', 'cause', 'central', 'circle',
];

// Distractor pool for the verify picker. Any BIP39 word that doesn't
// collide with the mnemonic words above works; using a small fixed list
// keeps the prototype deterministic.
const VERIFY_DISTRACTORS = [
  'whip', 'pact', 'such', 'twin', 'wing', 'arch', 'sail', 'crew',
  'oven', 'mist', 'lake', 'piano', 'fence', 'amber', 'pen', 'plug',
  'gym', 'note', 'iron', 'fame', 'task', 'fee', 'hour', 'minor',
];

const WORDS_PER_DISPLAY_PAGE = 6;

// Deterministic-ish shuffle so the verify options don't reshuffle on every
// render (which would feel jittery on e-ink). Seeds off the current index.
function pickOptionsForWord(correct: string, index: number): string[] {
  const distractors = VERIFY_DISTRACTORS.filter((w) => w !== correct).slice(index * 3, index * 3 + 3);
  // Ensure we have 3 distractors even if the slice runs short
  const padded = [...distractors];
  let cursor = 0;
  while (padded.length < 3) {
    const candidate = VERIFY_DISTRACTORS[cursor++ % VERIFY_DISTRACTORS.length];
    if (candidate !== correct && !padded.includes(candidate)) padded.push(candidate);
  }
  const options = [...padded, correct];
  // Place `correct` deterministically based on index so it cycles through positions 0..3
  // rather than landing on the same slot every time.
  const correctSlot = index % 4;
  [options[3], options[correctSlot]] = [options[correctSlot], options[3]];
  return options;
}

interface ActivationPageProps {
  /** Called when the activation flow completes — App clears the firstBoot flag. */
  onComplete: () => void;
  /** Initial step (useful for jumping to a specific screen from DebugPanel). */
  initialStep?: ActivationStep;
  /** Surfaces the current step to the docs panel so it can highlight where we are. */
  onStepChange?: (step: ActivationStep) => void;
}

const PRESS = 'active:bg-black active:text-[#838383]';
const BTN_BASE = `h-14 border-2 border-black rounded-sm bg-[#838383] hover:bg-black hover:text-[#838383] ${PRESS} font-bold text-lg`;

export function ActivationPage({
  onComplete,
  initialStep = 'splash',
  onStepChange,
}: ActivationPageProps) {
  const [step, setStep] = useState<ActivationStep>(initialStep);
  // Create-flow sub-state
  const [wordCount, setWordCount] = useState<12 | 18 | 24>(12);
  const [displayPage, setDisplayPage] = useState(0); // 0-based
  const [verifyIndex, setVerifyIndex] = useState(0); // 0-based word index in the verification loop
  const [verifyError, setVerifyError] = useState(false);
  // Naming + PIN sub-state
  const [walletName, setWalletName] = useState('');
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [pinError, setPinError] = useState('');

  const phrase = MOCK_MNEMONIC_24.slice(0, wordCount);
  const totalDisplayPages = Math.ceil(phrase.length / WORDS_PER_DISPLAY_PAGE);

  const goTo = (next: ActivationStep) => {
    setStep(next);
    onStepChange?.(next);
  };

  // === SPLASH (初次启动) ===
  // Entire screen is tappable; bottom strip shows the affordance.
  if (step === 'splash') {
    return (
      <button
        type="button"
        onClick={() => goTo('welcome-1')}
        className={`w-[400px] h-[600px] bg-[#838383] flex flex-col text-left ${PRESS}`}
        aria-label="Tap to continue"
      >
        {/* Top content area: logo centered + tagline below */}
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <BrandLogo className="mb-8" />
          <p className="text-2xl font-bold text-black text-center leading-tight">
            The most trusted security for your digital assets
          </p>
        </div>

        <OnboardingHintBar />
      </button>
    );
  }

  // === WELCOME 1 / 2 (引导文本) ===
  // The design uses an *additive* reveal: each tap appends a new paragraph
  // rather than replacing the previous one. welcome-1 shows the first
  // paragraph; welcome-2 shows that same paragraph plus a second beneath it.
  // This avoids the "what I just read disappeared" feeling and gives the
  // user a sense of accumulating context.
  if (step === 'welcome-1' || step === 'welcome-2') {
    const isFirst = step === 'welcome-1';

    // Source: Figma frames 327:3117 (welcome-1) and 327:3126 (welcome-2).
    const PARAGRAPHS = [
      'Welcome to SafePal E1, the most secure hardware wallet.',
      'We will guide you to set up this device.',
    ];
    const visibleParagraphs = isFirst ? PARAGRAPHS.slice(0, 1) : PARAGRAPHS;

    const onBack = () => goTo(isFirst ? 'splash' : 'welcome-1');
    const onNext = () => goTo(isFirst ? 'welcome-2' : 'scan-to-connect');

    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        {/* Mini header — back arrow only, no title. */}
        <div className="h-[45px] px-5 flex items-center flex-shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onBack();
            }}
            aria-label="Back"
            className={`flex items-center ${PRESS} px-1 -mx-1 rounded-sm`}
          >
            <ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
          </button>
        </div>

        {/* Three-zone proportional layout: each paragraph gets its own 1/3
           reserved slot, and the bottom 1/3 hosts the tap-to-continue
           affordance. The second paragraph appears in the middle slot when
           the user advances from welcome-1 to welcome-2 — it does NOT push
           the first paragraph up, which preserves visual continuity and
           matches the Figma frame ratios more closely than a single
           top-aligned text block would. */}
        <button
          type="button"
          onClick={onNext}
          className={`flex-1 flex flex-col text-left ${PRESS}`}
        >
          {/* Zone 1: first paragraph (top 1/3) */}
          <div className="basis-1/3 px-6 pt-2">
            <p className="text-3xl font-bold text-black leading-snug">
              {PARAGRAPHS[0]}
            </p>
          </div>

          {/* Zone 2: second paragraph (middle 1/3). Empty in welcome-1, so
             the first paragraph stays anchored at the top and a 1/3 gap
             waits to be filled. */}
          <div className="basis-1/3 px-6">
            {!isFirst && (
              <p className="text-3xl font-bold text-black leading-snug">
                {PARAGRAPHS[1]}
              </p>
            )}
          </div>

          {/* Zone 3: tap-to-continue (bottom 1/3). Hint text sits near the
             bottom of its zone so the whole 1/3 reads as the affordance
             area (consistent with how the user perceives "where to tap"). */}
          <div className="basis-1/3 flex items-end justify-center pb-6">
            <span className="text-base text-black">Tap to continue</span>
          </div>
        </button>
      </div>
    );
  }

  // === SCAN TO CONNECT (独立激活，未连接 app) ===
  // QR code prompts the user to pair the device with the SafePal companion
  // app via Bluetooth. On real hardware, this resolves either by a successful
  // pairing OR by the user pressing a physical button to go standalone. In
  // the prototype we expose an explicit "Skip — activate standalone" hint at
  // the bottom and make the whole screen tappable to advance.
  if (step === 'scan-to-connect') {
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <div className="h-[45px] px-5 flex items-center flex-shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goTo('welcome-2');
            }}
            aria-label="Back"
            className={`flex items-center ${PRESS} px-1 -mx-1 rounded-sm`}
          >
            <ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => goTo('choose-path')}
          className={`flex-1 flex flex-col items-center text-left ${PRESS}`}
        >
          {/* Top 1/3: centred QR placeholder (real product would render the
             pairing token here). */}
          <div className="basis-2/3 flex flex-col items-center justify-center px-8">
            <div
              className="w-48 h-48 bg-[#838383] border-2 border-black rounded-sm flex items-center justify-center mb-6"
              aria-hidden
            >
              <QrCode className="w-40 h-40 text-black" strokeWidth={1.5} />
            </div>
            <p className="text-xl font-bold text-black text-center leading-snug">
              Scan to open the SafePal app and connect
            </p>
          </div>

          {/* Bottom: skip affordance. The "or" prefix keeps it secondary to
             the primary scan-the-QR call-to-action. */}
          <div className="basis-1/3 flex items-end justify-center pb-6">
            <span className="text-base text-black">Or tap to continue without app</span>
          </div>
        </button>
      </div>
    );
  }

  // === CHOOSE PATH (创建钱包 / 恢复) ===
  if (step === 'choose-path') {
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <div className="h-[45px] px-5 flex items-center flex-shrink-0">
          <button
            type="button"
            onClick={() => goTo('scan-to-connect')}
            aria-label="Back"
            className={`flex items-center ${PRESS} px-1 -mx-1 rounded-sm`}
          >
            <ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
          </button>
        </div>

        {/* Three-zone proportional layout, matching the rest of the activation
           flow's "thirds" rhythm: top 1/3 is intentionally empty (visual
           breathing room), middle 1/3 hosts the primary action, bottom 1/3
           hosts the secondary action. Each option is a tall tap target with
           the label vertically centred in its zone. */}
        <div className="flex-1 flex flex-col">
          <div className="basis-1/3" /> {/* empty top zone */}

          <PathRow
            className="basis-1/3"
            label="Set up as a new SafePal E-ink"
            onClick={() => {
              setDisplayPage(0);
              setVerifyIndex(0);
              setVerifyError(false);
              goTo('create-intro');
            }}
          />

          <PathRow
            className="basis-1/3"
            label="Restore"
            onClick={() => {
              // Phase 3.1: ditto — Phase 3.3 will wire the restore sub-flow.
              onComplete();
            }}
          />
        </div>
      </div>
    );
  }

  // === CREATE-INTRO (助记词 - 说明) ===
  // Naked back arrow + big paragraph + tap-to-continue. Same shape as welcome.
  // Source: Figma 327:4432.
  if (step === 'create-intro') {
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <BackOnlyHeader onBack={() => goTo('choose-path')} />
        <button
          type="button"
          onClick={() => goTo('create-length')}
          className={`flex-1 flex flex-col text-left ${PRESS}`}
        >
          <div className="basis-2/3 px-6 pt-2">
            <p className="text-3xl font-bold text-black leading-snug">
              SafePal E-ink will generate your Secret Recovery Phrase, the foundation of your wallet&apos;s security.
            </p>
          </div>
          <div className="basis-1/3 flex items-end justify-center pb-6">
            <span className="text-base text-black">Tap to continue</span>
          </div>
        </button>
      </div>
    );
  }

  // === CREATE-LENGTH (助记词 - 位数选择) ===
  // h2 at top + WordCountSelector pushed to bottom. Source: Figma 327:4520.
  if (step === 'create-length') {
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <BackOnlyHeader onBack={() => goTo('create-intro')} />
        <div className="flex-1 px-6 pt-2 pb-6 flex flex-col">
          <h2 className="text-3xl font-bold text-black leading-snug">
            Pick your Recovery Phrase length
          </h2>
          <div className="mt-auto">
            <WordCountSelector
              counts={[12, 24]}
              onSelect={(count) => {
                setWordCount(count);
                setDisplayPage(0);
                goTo('create-display');
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // === CREATE-DISPLAY (助记词 - 记录) ===
  // Show 6 words at a time, indexed from (page * 6) + 1. Next button advances
  // pages; on the final page Next goes to verify-intro. Source: Figma 327:4480.
  if (step === 'create-display') {
    const startIndex = displayPage * WORDS_PER_DISPLAY_PAGE + 1;
    const pageWords = phrase.slice(
      displayPage * WORDS_PER_DISPLAY_PAGE,
      (displayPage + 1) * WORDS_PER_DISPLAY_PAGE,
    );
    const isLastPage = displayPage === totalDisplayPages - 1;

    const onNext = () => {
      if (isLastPage) {
        goTo('create-verify-intro');
      } else {
        setDisplayPage(displayPage + 1);
      }
    };

    const onBack = () => {
      if (displayPage === 0) {
        goTo('create-length');
      } else {
        setDisplayPage(displayPage - 1);
      }
    };

    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <BackOnlyHeader onBack={onBack} />
        <div className="flex-1 px-6 pt-2 pb-6 flex flex-col">
          <p className="text-base text-black leading-snug mb-5">
            Write down these words on your Recovery Sheet
            {totalDisplayPages > 1 && (
              <span className="ml-1 text-black font-bold">
                ({displayPage + 1}/{totalDisplayPages})
              </span>
            )}
            :
          </p>
          <div className="flex-1 flex flex-col justify-center">
            <MnemonicWordList words={pageWords} startIndex={startIndex} />
          </div>
          <button onClick={onNext} className={BTN_BASE}>
            {isLastPage ? 'Next' : 'Continue'}
          </button>
        </div>
      </div>
    );
  }

  // === CREATE-VERIFY-INTRO (助记词 - 验证 transition) ===
  // Centred big title + two stacked CTAs: Start confirmation / See the words again.
  // Source: Figma 327:4531.
  if (step === 'create-verify-intro') {
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <BackOnlyHeader onBack={() => {
          // Going back from the verify intro returns the user to the last
          // display page so they can re-read their phrase if needed.
          setDisplayPage(totalDisplayPages - 1);
          goTo('create-display');
        }} />
        <div className="flex-1 px-6 pt-2 pb-6 flex flex-col items-center">
          <div className="basis-2/3 flex items-center">
            <h2 className="text-2xl font-bold text-black text-center leading-snug">
              Let&apos;s confirm that all words are written correctly.
            </h2>
          </div>
          <div className="basis-1/3 w-full space-y-3 mt-auto">
            <button
              onClick={() => {
                setVerifyIndex(0);
                setVerifyError(false);
                goTo('create-verify');
              }}
              className={`w-full ${BTN_BASE}`}
            >
              Start confirmation
            </button>
            <button
              onClick={() => {
                setDisplayPage(0);
                goTo('create-display');
              }}
              className={`w-full ${BTN_BASE}`}
            >
              See the words again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // === CREATE-VERIFY (助记词 - 验证 input) ===
  // 4-option multiple-choice for each word. On correct pick → next word
  // (or done when all verified). On wrong pick → briefly flash an error
  // and let the user try again. Source: Figma 327:4540 etc.
  if (step === 'create-verify') {
    const correct = phrase[verifyIndex];
    const options = pickOptionsForWord(correct, verifyIndex);

    const onPick = (word: string) => {
      if (word === correct) {
        setVerifyError(false);
        const next = verifyIndex + 1;
        if (next >= phrase.length) {
          goTo('create-done');
        } else {
          setVerifyIndex(next);
        }
      } else {
        setVerifyError(true);
        // Discrete state: error stays until the next pick. No live animation.
      }
    };

    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <BackOnlyHeader onBack={() => goTo('create-verify-intro')} />
        <div className="flex-1 px-6 pt-2 pb-6 flex flex-col">
          {/* Fixed-height feedback slot above the picker so the option list
             below never shifts when an error appears (e-ink stability — §4.6). */}
          <div className="min-h-[24px] mb-2 text-center">
            {verifyError && (
              <span className="text-sm text-black font-bold inline-flex items-center gap-1">
                <XIcon className="w-4 h-4" strokeWidth={3} /> Wrong word — try again
              </span>
            )}
          </div>
          <MnemonicVerifyPicker
            currentIndex={verifyIndex + 1}
            options={options}
            onPick={onPick}
          />
          {/* Discrete progress hint, doesn't shift layout. */}
          <p className="text-xs text-black text-center mt-3">
            Word {verifyIndex + 1} of {phrase.length}
          </p>
        </div>
      </div>
    );
  }

  // === CREATE-DONE (成功创建 — secret reminder) ===
  // Final reminder before activation completes. Tap to continue → onComplete.
  // Source: Figma 327:4451.
  if (step === 'create-done') {
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <BackOnlyHeader onBack={() => goTo('create-verify')} />
        <button
          type="button"
          onClick={() => goTo('naming')}
          className={`flex-1 flex flex-col text-left ${PRESS}`}
        >
          <div className="basis-2/3 px-6 pt-2">
            <div className="flex items-center gap-2 mb-3">
              <Check className="w-8 h-8 text-black" strokeWidth={3} />
              <span className="text-sm font-bold text-black uppercase tracking-wide">
                Wallet created
              </span>
            </div>
            <p className="text-3xl font-bold text-black leading-snug">
              Your Secret Recovery Phrase is for your eyes only.
            </p>
          </div>
          <div className="basis-1/3 flex items-end justify-center pb-6">
            <span className="text-base text-black">Tap to continue</span>
          </div>
        </button>
      </div>
    );
  }

  // === NAMING (命名 - 未输入 / 有输入) ===
  // Onboarding-flavoured wallet name input. h2 at top + text input + keyboard
  // at bottom. The keyboard's built-in ✓ confirms (disabled when empty —
  // see UniversalKeyboard) so we don't need a separate "Confirm name" CTA.
  // Source: Figma 327:2858 / 327:2987.
  if (step === 'naming') {
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col relative">
        <BackOnlyHeader onBack={() => goTo('create-done')} />
        <div className="flex-1 px-6 pt-2 pb-[220px] flex flex-col">
          <h2 className="text-xl font-bold text-black text-center leading-snug mb-5">
            Set a unique name for your wallet
          </h2>

          {/* Input field with inline X clear, vertically centred (§ design system §7.4) */}
          <div className="relative mb-3">
            <div className="min-h-14 border-2 border-black rounded-sm bg-[#838383] flex items-start px-3 py-2 pr-12">
              <span className="text-lg font-bold text-black flex-1 break-all">{walletName || ' '}</span>
            </div>
            {walletName && (
              <button
                onClick={() => setWalletName('')}
                aria-label="Clear"
                className={`absolute inset-y-0 my-auto right-2 w-8 h-8 rounded-full border-2 border-black bg-[#838383] flex items-center justify-center hover:bg-black hover:text-[#838383] ${PRESS}`}
              >
                <XIcon className="w-4 h-4" strokeWidth={3} />
              </button>
            )}
          </div>
        </div>

        <UniversalKeyboard
          value={walletName}
          onChange={(val) => {
            if (val.length <= 20) setWalletName(val);
          }}
          onConfirm={() => {
            if (walletName.length === 0) return;
            goTo('pin-explain');
          }}
          mode="text"
        />
      </div>
    );
  }

  // === PIN-EXPLAIN (Pin的说明) ===
  // Big paragraph + Tap to continue. Same shape as welcome / create-intro.
  // Source: Figma 327:3158.
  if (step === 'pin-explain') {
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <BackOnlyHeader onBack={() => goTo('naming')} />
        <button
          type="button"
          onClick={() => {
            setPin('');
            setPinConfirm('');
            setPinError('');
            goTo('pin-set');
          }}
          className={`flex-1 flex flex-col text-left ${PRESS}`}
        >
          <div className="basis-2/3 px-6 pt-2">
            <p className="text-3xl font-bold text-black leading-snug">
              Choose your PIN. It&apos;s a 6 digit code that unlocks your SafePal E-ink.
            </p>
          </div>
          <div className="basis-1/3 flex items-end justify-center pb-6">
            <span className="text-base text-black">Tap to continue</span>
          </div>
        </button>
      </div>
    );
  }

  // === PIN-SET (激活成功，设置pin码 — first entry) ===
  // PINKeypad with onConfirm advances to pin-confirm. Not randomized because
  // the user is *choosing* the PIN; randomization is only valuable when the
  // user is *entering an already-set PIN* (shoulder-surf protection).
  // Source: Figma 327:4576.
  if (step === 'pin-set') {
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <BackOnlyHeader onBack={() => goTo('pin-explain')} />
        <div className="flex-1 px-6 pt-2 pb-6 flex flex-col">
          <h2 className="text-xl font-bold text-black text-center leading-snug mb-3">
            Choose your 6 digit PIN
          </h2>
          {/* Fixed-height feedback slot (empty here — present for layout
             stability if we add hints later, and mirrors pin-confirm). */}
          <div className="min-h-[28px] mb-2" />
          <div className="flex-1 flex flex-col justify-center">
            <PINKeypad
              value={pin}
              onValueChange={(v) => setPin(v)}
              maxLength={6}
              onConfirm={() => {
                setPinConfirm('');
                setPinError('');
                goTo('pin-confirm');
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // === PIN-CONFIRM (re-enter to confirm) ===
  // Same PINKeypad. On match → done. On mismatch → fixed-slot error +
  // clear pinConfirm so the user re-enters. Per §4.6 B, the slot above
  // the keypad has a reserved min-height so the keypad doesn't shift
  // when the error appears.
  if (step === 'pin-confirm') {
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <BackOnlyHeader onBack={() => {
          setPinConfirm('');
          setPinError('');
          goTo('pin-set');
        }} />
        <div className="flex-1 px-6 pt-2 pb-6 flex flex-col">
          <h2 className="text-xl font-bold text-black text-center leading-snug mb-3">
            Re-enter your PIN
          </h2>
          <div className="min-h-[28px] mb-2 text-center">
            {pinError && (
              <span className="text-sm text-black font-bold inline-flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" strokeWidth={3} /> {pinError}
              </span>
            )}
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <PINKeypad
              value={pinConfirm}
              onValueChange={(v) => {
                setPinConfirm(v);
                if (pinError) setPinError('');
              }}
              maxLength={6}
              onConfirm={() => {
                if (pinConfirm === pin) {
                  goTo('done');
                } else {
                  setPinError("PINs don't match — try again");
                  setPinConfirm('');
                }
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // === DONE (完成激活) ===
  // Centred SafePal logo + "Now you're in control" + Tap to continue → onComplete.
  // Figma shows no back arrow on this screen — activation is "over" and the
  // user shouldn't be able to step back into the flow. Source: Figma 327:3186.
  if (step === 'done') {
    return (
      <button
        type="button"
        onClick={onComplete}
        className={`w-[400px] h-[600px] bg-[#838383] flex flex-col text-left ${PRESS}`}
        aria-label="Tap to continue"
      >
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <BrandLogo className="mb-6" />
          <p className="text-2xl font-bold text-black text-center leading-tight">
            Now you&apos;re in control
          </p>
        </div>
        <div className="h-20 flex items-center justify-center">
          <span className="text-base text-black">Tap to continue</span>
        </div>
      </button>
    );
  }

  return null;
}

/**
 * Naked back-arrow header used across the activation flow. No title text,
 * no border-bottom — matches the "title bar omitted" rule of §1.5. The
 * arrow itself uses the same w-5 / strokeWidth-2.5 as Operational headers
 * so the two contexts share a visual heritage.
 */
function BackOnlyHeader({ onBack }: { onBack: () => void }) {
  return (
    <div className="h-[45px] px-5 flex items-center flex-shrink-0">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onBack();
        }}
        aria-label="Back"
        className={`flex items-center ${PRESS} px-1 -mx-1 rounded-sm`}
      >
        <ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
      </button>
    </div>
  );
}

/**
 * Placeholder logo: a 96x96 black rounded square with a bold "S" inside.
 * This stands in for the SafePal SVG mark until we wire the real asset.
 * The visual weight matches the Figma reference (logo dominates the upper
 * third) without dragging in an external image dependency.
 */
function BrandLogo({ className = '' }: { className?: string }) {
  return (
    <div
      className={`w-24 h-24 bg-black rounded-2xl flex items-center justify-center ${className}`}
      aria-hidden
    >
      <span className="text-[#838383] text-5xl font-black tracking-tighter">S</span>
    </div>
  );
}

/**
 * Big list row used in the choose-path screen. Title left, chevron right,
 * solid TOP border (separates from previous zone). Press feedback inverts
 * the row (matches our 'instant inversion on touch' rule for e-ink).
 *
 * Vertical height is driven by the caller via `className` (`basis-1/3` on
 * the activation page), so the label vertically centres within the assigned
 * zone — no internal `py-*` needed.
 */
function PathRow({
  label,
  onClick,
  className = '',
}: {
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full px-6 border-t-2 border-black flex items-center justify-between text-left bg-[#838383] hover:bg-black hover:text-[#838383] ${PRESS} ${className}`}
    >
      <span className="text-lg font-bold leading-tight pr-4">{label}</span>
      <ChevronRight className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
    </button>
  );
}
