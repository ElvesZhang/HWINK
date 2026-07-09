/**
 * Recovery phrase length picker — 12 vs 24 words.
 *
 * Used by:
 *   - Activation create flow (decide how long the generated phrase will be)
 *   - Activation restore flow (declare how long the phrase you're entering is)
 *   - VerifyRecoveryPageNew (post-activation: verify a known-length phrase)
 *
 * Stays visually consistent with the rest of the product: BTN_BASE
 * rectangles, no pill shapes, no new CTA inventions. Two equal-weight
 * options stacked at the bottom of the screen (caller controls the wrapper).
 */
const PRESS = 'active:bg-black active:text-[#838383]';
const BTN_BASE = `h-14 border-2 border-black rounded-sm bg-[#838383] hover:bg-black hover:text-[#838383] ${PRESS} font-bold text-lg`;

export type WordCount = 12 | 18 | 24;

interface WordCountSelectorProps {
  onSelect: (count: WordCount) => void;
  /** Which lengths to offer. Defaults to 12 / 18 / 24. Callers that should stay
   *  at two options (e.g. Activation create/restore) pass their own list. */
  counts?: WordCount[];
}

export function WordCountSelector({ onSelect, counts = [12, 18, 24] }: WordCountSelectorProps) {
  return (
    <div className="space-y-3">
      {counts.map((c) => (
        <button key={c} onClick={() => onSelect(c)} className={`w-full ${BTN_BASE}`}>
          {c} words
        </button>
      ))}
    </div>
  );
}
