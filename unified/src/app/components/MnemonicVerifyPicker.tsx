/**
 * Multiple-choice verification picker for a single mnemonic word.
 *
 * The activation create flow asks the user to pick the correct word for
 * each position (1-based `currentIndex`) from a list of distractors plus
 * the true word. This is faster than typing every word back and still
 * confirms the user wrote the phrase down.
 *
 * Caller is responsible for:
 *   - Shuffling the options
 *   - Advancing to the next index on correct pick
 *   - Showing an error / re-display on incorrect pick
 *
 * Visually: title + 4 stacked BTN_BASE buttons. No pill shapes — we keep
 * the same vocabulary as the rest of the product (see Guidelines.md §1.5).
 */
const PRESS = 'active:bg-black active:text-[#838383]';
const BTN_BASE = `h-14 border-2 border-black rounded-sm bg-[#838383] hover:bg-black hover:text-[#838383] ${PRESS} font-bold text-lg`;

interface MnemonicVerifyPickerProps {
  currentIndex: number; // 1-based
  options: string[];
  onPick: (word: string) => void;
}

export function MnemonicVerifyPicker({ currentIndex, options, onPick }: MnemonicVerifyPickerProps) {
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-bold text-black text-center mb-6">
        Select word no.{currentIndex}
      </h2>
      <div className="space-y-3 flex-1 flex flex-col justify-center">
        {options.map((word) => (
          <button key={word} onClick={() => onPick(word)} className={`w-full ${BTN_BASE}`}>
            {word}
          </button>
        ))}
      </div>
    </div>
  );
}
