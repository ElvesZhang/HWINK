/** Shared 2-color e-ink "vocabulary" atoms used across Lab styles.
 *  Everything uses currentColor so the same atom works as black-on-paper or
 *  white-on-black (HUD). All 1-bit friendly (solid fills / hard stripes). */

export function Barcode({ className = '' }: { className?: string }) {
  return (
    <div
      className={`w-full h-full ${className}`}
      aria-hidden="true"
      style={{ backgroundImage: 'repeating-linear-gradient(90deg, currentColor 0 2px, transparent 2px 3px, currentColor 3px 4px, transparent 4px 7px, currentColor 7px 9px, transparent 9px 10px, currentColor 10px 11px, transparent 11px 14px, currentColor 14px 15px, transparent 15px 17px)' }}
    />
  );
}

export function QrBlock({ size = 44, seed = 'MHV', className = '' }: { size?: number; seed?: string; className?: string }) {
  const N = 11;
  const s = [...seed].reduce((a, c) => a + c.charCodeAt(0), 0);
  const inBox = (x: number, y: number, bx: number, by: number) => x >= bx && x < bx + 3 && y >= by && y < by + 3;
  const cells = [];
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const finder = inBox(x, y, 0, 0) || inBox(x, y, N - 3, 0) || inBox(x, y, 0, N - 3);
      const on = finder ? true : ((x * 5 + y * 3 + s) % 7) < 3;
      if (on) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="currentColor" />);
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${N} ${N}`} shapeRendering="crispEdges" className={className} aria-hidden="true">
      {cells}
    </svg>
  );
}

export function RegMark({ size = 18, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="7" />
      <path d="M12 1v22M1 12h22" />
    </svg>
  );
}

export function Reticle({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden="true">
      <path d="M3 7V3h4M21 7V3h-4M3 17v4h4M21 17v4h-4" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

export function Gauge({ size = 40, className = '' }: { size?: number; className?: string }) {
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6;
    const x1 = 12 + Math.cos(a) * 9, y1 = 12 + Math.sin(a) * 9;
    const x2 = 12 + Math.cos(a) * 11, y2 = 12 + Math.sin(a) * 11;
    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
  });
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="7" />
      {ticks}
      <path d="M12 12 L17 9" strokeWidth={1.75} />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Four corner brackets around content (HUD frame). */
export function HudFrame({ children, className = '', pad = 'p-3' }: { children: React.ReactNode; className?: string; pad?: string }) {
  const c = 'absolute w-3.5 h-3.5 border-current';
  return (
    <div className={`relative ${pad} ${className}`}>
      <span className={`${c} top-0 left-0 border-t border-l`} />
      <span className={`${c} top-0 right-0 border-t border-r`} />
      <span className={`${c} bottom-0 left-0 border-b border-l`} />
      <span className={`${c} bottom-0 right-0 border-b border-r`} />
      {children}
    </div>
  );
}

export function Pill({ children, filled = false, className = '' }: { children: React.ReactNode; filled?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide leading-none ${filled ? 'bg-black text-[#838383]' : 'border-2 border-black text-black'} ${className}`}>
      {children}
    </span>
  );
}

export function HazardBar({ className = '' }: { className?: string }) {
  return (
    <div
      className={className}
      aria-hidden="true"
      style={{ backgroundImage: 'repeating-linear-gradient(45deg, currentColor 0 5px, transparent 5px 11px)' }}
    />
  );
}

/** Horizontal dotted leader (currentColor dots). Height 1px; give it width via parent. */
export function DotLeader({ className = '' }: { className?: string }) {
  return (
    <div
      className={`h-px ${className}`}
      aria-hidden="true"
      style={{ backgroundImage: 'repeating-linear-gradient(90deg, currentColor 0 1px, transparent 1px 4px)' }}
    />
  );
}

/** ON/OFF pill toggle (Fono dashboard). */
export function Toggle({ on, className = '' }: { on: boolean; className?: string }) {
  return (
    <span className={`relative inline-flex items-center w-[58px] h-7 rounded-full border-2 border-black ${on ? 'bg-black' : 'bg-transparent'} ${className}`}>
      <span className={`absolute top-0.5 w-5 h-5 rounded-full ${on ? 'right-0.5 bg-[#838383]' : 'left-0.5 bg-black'}`} />
      <span className={`absolute text-[9px] font-bold ${on ? 'left-2 text-[#838383]' : 'right-2 text-black'}`}>{on ? 'ON' : 'OFF'}</span>
    </span>
  );
}

/** Circular progress ring with center %.  Thin track + thick arc (1-bit safe). */
export function Ring({ pct = 68, size = 46, className = '' }: { pct?: number; size?: number; className?: string }) {
  const r = 18, c = 2 * Math.PI * r, off = c * (1 - pct / 100);
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" className={className} aria-hidden="true">
      <circle cx="22" cy="22" r={r} fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="22" cy="22" r={r} fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" transform="rotate(-90 22 22)" />
      <text x="22" y="26" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor" fontFamily="ui-monospace, monospace">{pct}%</text>
    </svg>
  );
}

/** Small stack of chevrons ›› used as a divider accent. */
export function ChevStack({ className = '' }: { className?: string }) {
  return (
    <svg width={14} height={20} viewBox="0 0 14 20" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden="true">
      <path d="M2 3l5 4-5 4M7 3l5 4-5 4" />
      <path d="M2 11l5 4-5 4M7 11l5 4-5 4" opacity="0" />
    </svg>
  );
}
