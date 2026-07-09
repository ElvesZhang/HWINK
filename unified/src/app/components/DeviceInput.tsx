import { type ReactNode } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * DeviceInput — the device's ONE standard text field. It owns the three things
 * every input shares, so they look and behave identically:
 *   1. box style  — the original bordered, slightly-rounded #838383 box
 *   2. clear-all  — optional ✕ pinned at the right of the box
 *   3. label/hint — label above the box, hint below in a fixed-height row
 * An optional prev/next stepper (used by recovery verify) sits in the hint row,
 * hidden at boundaries. 2-tone, no animation — matches CONSTRAINTS.
 */
const PRESS = 'active:bg-black active:text-[#838383]';

interface DeviceInputProps {
  value: string;
  /** Heading above the box. */
  label?: string;
  /** Helper text under the box (fixed-height row). */
  hint?: ReactNode;
  /** Clear-all. When set, a ✕ shows at the right of the box. */
  onClear?: () => void;
  /** Optional stepper — prev/next sit in the hint row, hidden at boundaries. */
  onPrev?: () => void;
  onNext?: () => void;
}

export function DeviceInput({ value, label, hint, onClear, onPrev, onNext }: DeviceInputProps) {
  const stepper = onPrev !== undefined || onNext !== undefined;

  const stepBtn = (dir: 'prev' | 'next', onClick: () => void) => (
    <button onClick={onClick} aria-label={dir === 'prev' ? 'Previous' : 'Next'} className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-sm ${PRESS}`}>
      {dir === 'prev'
        ? <ChevronLeft className="w-6 h-6 text-black" strokeWidth={2.5} />
        : <ChevronRight className="w-6 h-6 text-black" strokeWidth={2.5} />}
    </button>
  );

  return (
    <div>
      {label && <h2 className="text-xl font-bold text-black mb-2">{label}</h2>}

      <div className="relative">
        <div className="min-h-14 border-2 border-black rounded-sm bg-[#838383] flex items-start px-3 py-2 pr-12">
          <span className="text-lg font-bold text-black flex-1 break-all">{value || ' '}</span>
        </div>
        {onClear && value && (
          <button
            onClick={onClear}
            aria-label="Clear"
            className={`absolute inset-y-0 my-auto right-2 w-8 h-8 rounded-full border-2 border-black bg-[#838383] flex items-center justify-center ${PRESS}`}
          >
            <X className="w-4 h-4" strokeWidth={3} />
          </button>
        )}
      </div>

      {(hint !== undefined || stepper) && (
        <div className="mt-3 flex items-center justify-center gap-3 min-h-[32px]">
          {onPrev ? stepBtn('prev', onPrev) : (stepper ? <span className="w-8 flex-shrink-0" /> : null)}
          {hint !== undefined && <span className="text-lg text-black text-center">{hint}</span>}
          {onNext ? stepBtn('next', onNext) : (stepper ? <span className="w-8 flex-shrink-0" /> : null)}
        </div>
      )}
    </div>
  );
}
