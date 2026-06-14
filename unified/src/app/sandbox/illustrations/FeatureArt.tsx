/**
 * Large full-screen-grade feature illustrations for the carousel home concept.
 * Each is a single-tone line+fill drawing on a ~120 viewbox, sized via `size`.
 * Drawn with currentColor so they invert cleanly on a black hero.
 *
 * These are intentionally bolder / more pictorial than the small Lucide icons —
 * the whole point of the carousel concept is "one big picture per feature".
 */
interface FeatureArtProps {
  id: 'assets' | 'history' | 'passkey' | 'settings';
  size?: number;
  className?: string;
}

export function FeatureArt({ id, size = 120, className = '' }: FeatureArtProps) {
  const wrap = (children: React.ReactNode) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label={`${id} illustration`}
    >
      {children}
    </svg>
  );

  switch (id) {
    case 'assets':
      // Stacked coins forming a portfolio.
      return wrap(
        <>
          <ellipse cx="60" cy="40" rx="34" ry="13" stroke="currentColor" strokeWidth="3" />
          <path d="M26 40 V58 C26 65 41 71 60 71 C79 71 94 65 94 58 V40" stroke="currentColor" strokeWidth="3" />
          <path d="M26 58 V76 C26 83 41 89 60 89 C79 89 94 83 94 76 V58" stroke="currentColor" strokeWidth="3" />
          <circle cx="60" cy="40" r="6" fill="currentColor" />
        </>
      );
    case 'history':
      // Document with signed lines + a check seal.
      return wrap(
        <>
          <rect x="30" y="20" width="50" height="66" rx="4" stroke="currentColor" strokeWidth="3" />
          <line x1="38" y1="34" x2="72" y2="34" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <line x1="38" y1="46" x2="72" y2="46" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <line x1="38" y1="58" x2="60" y2="58" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <circle cx="78" cy="78" r="18" fill="currentColor" />
          <path d="M70 78 L76 84 L87 71" stroke="#838383" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
    case 'passkey':
      // Key with a shield bow.
      return wrap(
        <>
          <path d="M52 22 L52 22 C40 22 32 31 32 43 C32 53 39 61 48 63 L48 92 L58 92 L58 84 L66 84 L66 76 L58 76 L58 63 C67 61 74 53 74 43 C74 31 64 22 52 22 Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="53" cy="42" r="7" fill="currentColor" />
        </>
      );
    case 'settings':
      // Gear.
      return wrap(
        <>
          <circle cx="60" cy="60" r="16" stroke="currentColor" strokeWidth="3" />
          <circle cx="60" cy="60" r="5" fill="currentColor" />
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i * Math.PI) / 4;
            const x1 = 60 + Math.cos(a) * 24;
            const y1 = 60 + Math.sin(a) * 24;
            const x2 = 60 + Math.cos(a) * 34;
            const y2 = 60 + Math.sin(a) * 34;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="4" strokeLinecap="round" />;
          })}
        </>
      );
  }
}
