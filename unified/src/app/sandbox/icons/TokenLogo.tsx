/**
 * Inline monochrome SVG token logos for the sandbox.
 *
 * Each token returns a self-contained <svg> with currentColor strokes/fills,
 * sized via the `size` prop. Style is deliberately simplified to single-tone
 * geometric forms that read at small sizes on e-ink — not exact brand
 * reproductions. Unknown symbols fall back to a filled circle with the first
 * letter of the symbol so callers never need to guard against missing logos.
 */
interface TokenLogoProps {
  symbol: string;
  size?: number;
  /** When true, renders inverted (grey strokes on transparent — useful when
   *  placed on a black hero card). Default: black on transparent. */
  inverted?: boolean;
}

export function TokenLogo({ symbol, size = 40, inverted = false }: TokenLogoProps) {
  const sym = symbol.toUpperCase();
  const color = inverted ? '#838383' : '#000000';
  const bg = inverted ? '#000000' : '#838383';

  // Common <svg> wrapper: 40 viewBox so paths are easy to write.
  const wrap = (children: React.ReactNode) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`${sym} logo`}
    >
      {children}
    </svg>
  );

  switch (sym) {
    case 'USDT':
      // Tether: circle frame + bold T atop a horizontal underline.
      return wrap(
        <>
          <circle cx="20" cy="20" r="19" stroke={color} strokeWidth="2" fill={bg} />
          <rect x="10" y="11" width="20" height="3" fill={color} />
          <rect x="18.5" y="14" width="3" height="16" fill={color} />
          <rect x="11" y="17" width="18" height="2.5" fill={color} />
        </>
      );

    case 'USDC':
      // USD Coin: circle frame + bold $ glyph.
      return wrap(
        <>
          <circle cx="20" cy="20" r="19" stroke={color} strokeWidth="2" fill={bg} />
          <path
            d="M20 9 L20 13 M20 27 L20 31 M14 16 Q14 13 20 13 Q26 13 26 16 Q26 19 20 20 Q14 21 14 24 Q14 27 20 27 Q26 27 26 24"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </>
      );

    case 'ETH':
      // Ethereum diamond: two stacked triangles.
      return wrap(
        <>
          <circle cx="20" cy="20" r="19" stroke={color} strokeWidth="2" fill={bg} />
          <path d="M20 7 L11 21 L20 26 L29 21 Z" fill={color} />
          <path d="M20 28 L11 22.5 L20 33 L29 22.5 Z" fill={color} />
        </>
      );

    case 'BTC':
      // Bitcoin: circle + B with two stems.
      return wrap(
        <>
          <circle cx="20" cy="20" r="19" stroke={color} strokeWidth="2" fill={bg} />
          <rect x="16.5" y="7" width="2" height="26" fill={color} />
          <rect x="21" y="7" width="2" height="26" fill={color} />
          <path
            d="M13 12 H22 Q26 12 26 16 Q26 20 22 20 H13 Z M13 20 H23 Q27 20 27 24 Q27 28 23 28 H13 Z"
            fill={color}
          />
        </>
      );

    case 'TRX':
      // Tron: triangular pyramid silhouette.
      return wrap(
        <>
          <circle cx="20" cy="20" r="19" stroke={color} strokeWidth="2" fill={bg} />
          <path d="M9 13 L31 13 L20 31 Z M9 13 L20 19 L31 13 M20 19 L20 31" stroke={color} strokeWidth="2" strokeLinejoin="round" fill="none" />
        </>
      );

    case 'BNB':
      // Binance: four diamonds in a cross pattern.
      return wrap(
        <>
          <circle cx="20" cy="20" r="19" stroke={color} strokeWidth="2" fill={bg} />
          <path d="M20 10 L25 15 L20 20 L15 15 Z" fill={color} />
          <path d="M20 20 L25 25 L20 30 L15 25 Z" fill={color} />
          <path d="M10 20 L15 15 L20 20 L15 25 Z" fill={color} />
          <path d="M20 20 L25 15 L30 20 L25 25 Z" fill={color} />
        </>
      );

    default:
      // Unknown symbol fallback: filled circle + first letter, large.
      return wrap(
        <>
          <circle cx="20" cy="20" r="19" fill={color} />
          <text
            x="20"
            y="27"
            textAnchor="middle"
            fontSize="20"
            fontWeight="bold"
            fill={bg}
            fontFamily="ui-monospace, monospace"
          >
            {sym.charAt(0)}
          </text>
        </>
      );
  }
}
