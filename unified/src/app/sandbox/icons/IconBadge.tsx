import type { LucideIcon } from 'lucide-react';

/**
 * Circular black badge with either a Lucide icon or a short label inside.
 * Lifts the existing 80px success-circle pattern (CONSTRAINTS §4.4) and
 * parameterises size and content. Inverted variant flips to a bordered
 * empty circle with a black icon — useful when shown inside a black hero
 * card without losing contrast.
 */
interface IconBadgeProps {
  size?: number;
  icon?: LucideIcon;
  label?: string;
  /** When true: grey-on-black-bordered transparent (for use inside a black
   *  hero so the badge stays visible). Default: filled black with grey
   *  icon, ready for use on the regular grey background. */
  inverted?: boolean;
}

export function IconBadge({ size = 40, icon: Icon, label, inverted = false }: IconBadgeProps) {
  const filled = !inverted;
  const containerClass = filled
    ? 'bg-black flex items-center justify-center rounded-full flex-shrink-0'
    : 'border-2 border-[#838383] flex items-center justify-center rounded-full flex-shrink-0';
  const contentColor = filled ? 'text-[#838383]' : 'text-[#838383]';

  // Sensible icon size relative to the badge.
  const iconSize = Math.round(size * 0.55);

  return (
    <div className={containerClass} style={{ width: size, height: size }}>
      {Icon ? (
        <Icon className={contentColor} style={{ width: iconSize, height: iconSize }} strokeWidth={2.5} />
      ) : label ? (
        <span
          className={`${contentColor} font-bold`}
          style={{ fontSize: Math.round(size * 0.45) }}
        >
          {label}
        </span>
      ) : null}
    </div>
  );
}
