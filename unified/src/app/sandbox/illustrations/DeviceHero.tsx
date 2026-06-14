/**
 * Monochrome line-art of the SafePal Obsidian hardware wallet — used as a
 * hero illustration. Drawn with currentColor so the caller controls the
 * tone (black on grey, or grey on a black hero card via text-[#838383]).
 *
 * Deliberately a clean single-weight line drawing (Trezor-style product
 * illustration) rather than a filled silhouette: reads as "premium device"
 * at hero sizes on e-ink.
 */
interface DeviceHeroProps {
  width?: number;
  className?: string;
}

export function DeviceHero({ width = 72, className = '' }: DeviceHeroProps) {
  const height = Math.round((width * 116) / 80);
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 80 116"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="SafePal Obsidian device"
    >
      {/* Body */}
      <rect x="6" y="3" width="68" height="110" rx="10" stroke="currentColor" strokeWidth="2.5" />
      {/* Screen */}
      <rect x="15" y="13" width="50" height="58" rx="4" stroke="currentColor" strokeWidth="2" />
      {/* Screen content — a few abstract "lines of UI" */}
      <rect x="21" y="21" width="24" height="3" rx="1.5" fill="currentColor" />
      <rect x="21" y="30" width="38" height="2" rx="1" fill="currentColor" />
      <rect x="21" y="36" width="32" height="2" rx="1" fill="currentColor" />
      {/* Screen check mark motif */}
      <circle cx="40" cy="55" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M35.5 55 L38.5 58 L44.5 51.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Round confirm button */}
      <circle cx="40" cy="90" r="11" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="40" cy="90" r="3.5" fill="currentColor" />
      {/* Side button */}
      <rect x="74" y="34" width="4" height="18" rx="2" fill="currentColor" />
    </svg>
  );
}
