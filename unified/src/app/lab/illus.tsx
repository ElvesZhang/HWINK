/**
 * illus.tsx — a 1-bit ILLUSTRATION KIT for the e-ink Lab.
 *
 * Everything here is monochrome-native: line-art (stroke), solid silhouettes
 * (fill currentColor with #838383 carved detail), guilloché rosettes, and
 * hatching via repeating-linear-gradient. NO opacity / CSS-rounding / shadow /
 * gradients-with-grey — only the two inks (black + #838383). SVG curves are
 * fine (the e-ink ban is on CSS container chrome, not illustration paths).
 *
 * Subjects accept `filled`:
 *   filled=false → line art (outline in currentColor, no fill)
 *   filled=true  → solid silhouette in currentColor, detail carved in #838383
 * They assume a #838383 page behind them (the carved detail = page colour).
 *
 * Used by the illustration languages: engraving, pictograph, woodcut, infographic.
 */
import type { CSSProperties } from 'react';

const PAPER = '#838383';

type IllProps = { size?: number; filled?: boolean; className?: string; stroke?: number };

function Svg({ size = 96, className = '', children }: { size?: number; className?: string; children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeLinejoin="round" strokeLinecap="round">
      {children}
    </svg>
  );
}

/* helper: pick silhouette + detail colours for the two variants */
function inks(filled: boolean) {
  return {
    body: filled ? 'currentColor' : 'none', // silhouette fill
    edge: filled ? 'none' : 'currentColor',  // silhouette outline (line mode)
    det: filled ? PAPER : 'currentColor',    // carved / drawn detail
  };
}

/* ════════════════ PRIMITIVES ════════════════ */

/** Guilloché rosette — layered rotated ellipses (banknote/engraving signature). */
export function Guilloche({ size = 120, count = 18, className = '' }: { size?: number; count?: number; className?: string }) {
  const ell = Array.from({ length: count }, (_, i) => (
    <ellipse key={i} cx="50" cy="50" rx="44" ry="15" transform={`rotate(${(i * 180) / count} 50 50)`} stroke="currentColor" strokeWidth="0.5" />
  ));
  return (
    <Svg size={size} className={className}>
      <circle cx="50" cy="50" r="47" strokeWidth="1" />
      {ell}
      <circle cx="50" cy="50" r="12" strokeWidth="1" />
    </Svg>
  );
}

/** Engraved ornamental frame: double rule + corner diamonds. Wraps content. */
export function OrnFrame({ children, className = '', pad = 'p-3' }: { children: React.ReactNode; className?: string; pad?: string }) {
  const corner = 'absolute w-2 h-2 bg-black rotate-45';
  return (
    <div className={`relative border-2 border-black ${pad} ${className}`}>
      <div className="absolute inset-[3px] border border-black pointer-events-none" aria-hidden="true" />
      <span className={`${corner} -top-1 -left-1`} aria-hidden="true" />
      <span className={`${corner} -top-1 -right-1`} aria-hidden="true" />
      <span className={`${corner} -bottom-1 -left-1`} aria-hidden="true" />
      <span className={`${corner} -bottom-1 -right-1`} aria-hidden="true" />
      <div className="relative">{children}</div>
    </div>
  );
}

/** Hatching fill (woodcut / engraving shading). Give it a sized parent. */
export function Hatch({ className = '', angle = 45, gap = 5, cross = false }: { className?: string; angle?: number; gap?: number; cross?: boolean }) {
  const line = `repeating-linear-gradient(${angle}deg, currentColor 0 1.2px, transparent 1.2px ${gap}px)`;
  const style: CSSProperties = { backgroundImage: cross ? `${line}, repeating-linear-gradient(${angle + 90}deg, currentColor 0 1.2px, transparent 1.2px ${gap}px)` : line };
  return <div className={className} aria-hidden="true" style={style} />;
}

/** Double-pointed engraved ribbon banner (inverted). */
export function Banner({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`inline-flex items-center justify-center bg-black text-[#838383] px-5 py-1.5 ${className}`}
      style={{ clipPath: 'polygon(10px 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 10px 100%, 0 50%)' }}
    >
      {children}
    </div>
  );
}

/* ════════════════ SUBJECT ILLUSTRATIONS ════════════════ */

/** Vault / safe door — security & storage (Home). */
export function IllVault({ size = 96, filled = false, className = '', stroke = 3.2 }: IllProps) {
  const { body, edge, det } = inks(filled);
  const spokes = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4;
    return <line key={i} x1={50 + Math.cos(a) * 8} y1={50 + Math.sin(a) * 8} x2={50 + Math.cos(a) * 17} y2={50 + Math.sin(a) * 17} stroke={det} strokeWidth={2} />;
  });
  return (
    <Svg size={size} className={className}>
      <rect x="9" y="11" width="82" height="78" fill={body} stroke={edge} strokeWidth={stroke} />
      <rect x="17" y="19" width="66" height="62" fill="none" stroke={det} strokeWidth="2" />
      <circle cx="50" cy="50" r="18" fill="none" stroke={det} strokeWidth="2.4" />
      {spokes}
      <circle cx="50" cy="50" r="5" fill={det} stroke="none" />
      <line x1="68" y1="50" x2="84" y2="50" stroke={det} strokeWidth="3" />
      {[[24, 26], [76, 26], [24, 74], [76, 74]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2" fill={det} stroke="none" />)}
    </Svg>
  );
}

/** Coin stack — value / amount (Sign). */
export function IllCoins({ size = 96, filled = false, className = '', stroke = 3.2 }: IllProps) {
  const { body, edge, det } = inks(filled);
  const star = (Array.from({ length: 4 }, (_, i) => {
    const a = (i * Math.PI) / 2;
    return <line key={i} x1={56 + Math.cos(a) * 11} y1={58 + Math.sin(a) * 11} x2={56 - Math.cos(a) * 11} y2={58 - Math.sin(a) * 11} stroke={det} strokeWidth="2.4" />;
  }));
  return (
    <Svg size={size} className={className}>
      {/* back stack edges */}
      <ellipse cx="40" cy="34" rx="26" ry="8" fill={body} stroke={filled ? 'none' : 'currentColor'} strokeWidth={2.4} />
      <ellipse cx="40" cy="44" rx="26" ry="8" fill={body} stroke={filled ? 'none' : 'currentColor'} strokeWidth={2.4} />
      <line x1="14" y1="34" x2="14" y2="44" stroke={edge === 'none' ? det : 'currentColor'} strokeWidth="2.4" />
      <line x1="66" y1="34" x2="66" y2="44" stroke={edge === 'none' ? det : 'currentColor'} strokeWidth="2.4" />
      {/* front coin */}
      <circle cx="56" cy="58" r="26" fill={body} stroke={edge} strokeWidth={stroke} />
      <circle cx="56" cy="58" r="19" fill="none" stroke={det} strokeWidth="2" />
      {star}
    </Svg>
  );
}

/** Open ledger / book — records (History). */
export function IllLedger({ size = 96, filled = false, className = '', stroke = 3.2 }: IllProps) {
  const { body, edge, det } = inks(filled);
  const lines = (xOff: number) => [30, 42, 54, 66].map((y, i) => <line key={`${xOff}-${i}`} x1={xOff + 4} y1={y} x2={xOff + 30} y2={y} stroke={det} strokeWidth="2" />);
  return (
    <Svg size={size} className={className}>
      <path d="M8 20 L48 24 L48 84 L8 80 Z" fill={body} stroke={edge} strokeWidth={stroke} />
      <path d="M92 20 L52 24 L52 84 L92 80 Z" fill={body} stroke={edge} strokeWidth={stroke} />
      <line x1="50" y1="24" x2="50" y2="84" stroke={filled ? det : 'currentColor'} strokeWidth="2.6" />
      {lines(12)}
      {lines(52)}
    </Svg>
  );
}

/** Shield with check — verification / safety (Verify). */
export function IllShield({ size = 96, filled = false, className = '', stroke = 3.2 }: IllProps) {
  const { body, edge, det } = inks(filled);
  return (
    <Svg size={size} className={className}>
      <path d="M50 8 L86 22 L86 50 C86 73 70 86 50 92 C30 86 14 73 14 50 L14 22 Z" fill={body} stroke={edge} strokeWidth={stroke} />
      <path d="M34 50 L46 62 L68 36" fill="none" stroke={det} strokeWidth="5" />
    </Svg>
  );
}

/** Key — recovery / seed (Seed). */
export function IllKey({ size = 96, filled = false, className = '', stroke = 3.2 }: IllProps) {
  const { body, edge, det } = inks(filled);
  return (
    <Svg size={size} className={className}>
      <circle cx="30" cy="50" r="20" fill={body} stroke={edge} strokeWidth={stroke} />
      <circle cx="30" cy="50" r="8" fill={PAPER} stroke={det} strokeWidth="2" />
      <line x1="50" y1="50" x2="88" y2="50" stroke={filled ? 'currentColor' : 'currentColor'} strokeWidth={stroke} />
      <line x1="78" y1="50" x2="78" y2="64" stroke="currentColor" strokeWidth={stroke} />
      <line x1="88" y1="50" x2="88" y2="60" stroke="currentColor" strokeWidth={stroke} />
    </Svg>
  );
}

/** From → To transfer diagram with a coin — the signing action (infographic Sign). */
export function IllTransfer({ size = 120, filled = false, className = '', stroke = 3 }: IllProps) {
  const { det } = inks(filled);
  return (
    <Svg size={size} className={className}>
      {/* from node */}
      <circle cx="16" cy="50" r="11" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={stroke} />
      <circle cx="16" cy="46" r="3.5" fill={filled ? PAPER : 'currentColor'} stroke="none" />
      <path d="M10 56 q6 -5 12 0" fill="none" stroke={filled ? PAPER : 'currentColor'} strokeWidth="2" />
      {/* arrow */}
      <line x1="30" y1="50" x2="70" y2="50" stroke="currentColor" strokeWidth={stroke} strokeDasharray="2 4" />
      <path d="M70 44 L80 50 L70 56" fill="none" stroke="currentColor" strokeWidth={stroke} />
      {/* coin on the wire */}
      <circle cx="50" cy="50" r="10" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.6" />
      <line x1="50" y1="44" x2="50" y2="56" stroke={det} strokeWidth="2" />
      <line x1="44" y1="50" x2="56" y2="50" stroke={det} strokeWidth="2" />
      {/* to node */}
      <circle cx="88" cy="50" r="11" fill="none" stroke="currentColor" strokeWidth={stroke} />
      <path d="M82 50 L87 55 L95 45" fill="none" stroke="currentColor" strokeWidth="2.6" />
    </Svg>
  );
}

/** The hardware device itself — identity (Home alt). */
export function IllDevice({ size = 96, filled = false, className = '', stroke = 3.2 }: IllProps) {
  const { body, edge, det } = inks(filled);
  return (
    <Svg size={size} className={className}>
      <rect x="28" y="8" width="44" height="84" fill={body} stroke={edge} strokeWidth={stroke} />
      <rect x="35" y="18" width="30" height="46" fill={PAPER} stroke={det} strokeWidth="2" />
      <circle cx="50" cy="78" r="6" fill="none" stroke={det} strokeWidth="2.4" />
    </Svg>
  );
}

/** Dispatcher for convenience. */
export type IllName = 'vault' | 'coins' | 'ledger' | 'shield' | 'key' | 'transfer' | 'device';
export function Illus({ name, ...rest }: { name: IllName } & IllProps) {
  switch (name) {
    case 'vault': return <IllVault {...rest} />;
    case 'coins': return <IllCoins {...rest} />;
    case 'ledger': return <IllLedger {...rest} />;
    case 'shield': return <IllShield {...rest} />;
    case 'key': return <IllKey {...rest} />;
    case 'transfer': return <IllTransfer {...rest} />;
    case 'device': return <IllDevice {...rest} />;
  }
}
