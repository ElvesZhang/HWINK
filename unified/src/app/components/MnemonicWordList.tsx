/**
 * Numbered list of mnemonic words. Used to display the user's generated
 * Secret Recovery Phrase during activation (paginated 6 per page) or to
 * surface a backup view in settings.
 *
 * Caller passes the slice of words for this page plus the index offset
 * (so the indices in the leftmost column stay continuous across pages).
 */
interface MnemonicWordListProps {
  words: string[];
  /** 1-based index of the first word in `words`. Default 1. */
  startIndex?: number;
  className?: string;
}

export function MnemonicWordList({ words, startIndex = 1, className = '' }: MnemonicWordListProps) {
  return (
    <ol className={`space-y-4 ${className}`} start={startIndex}>
      {words.map((w, i) => (
        <li key={`${startIndex + i}-${w}`} className="flex items-baseline gap-4">
          <span className="text-2xl font-bold text-black w-10 text-right shrink-0 tabular-nums">
            {startIndex + i}.
          </span>
          <span className="text-2xl font-bold text-black">{w}</span>
        </li>
      ))}
    </ol>
  );
}
