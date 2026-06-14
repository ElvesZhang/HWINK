import { Check } from 'lucide-react';

interface PINKeypadProps {
  value: string;
  onValueChange: (value: string) => void;
  maxLength?: number;
  randomized?: boolean;
  onConfirm?: () => void;
  showConfirm?: boolean;
}

const PRESS = 'active:bg-black active:text-[#838383]';

export function PINKeypad({
  value,
  onValueChange,
  maxLength = 6,
  randomized = false,
  onConfirm,
  showConfirm = true,
}: PINKeypadProps) {
  const numbers = randomized
    ? ['7', '2', '9', '4', '1', '6', '3', '8', '5', '0']
    : ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  const handleNumberClick = (num: string) => {
    if (value.length < maxLength) {
      onValueChange(value + num);
    }
  };

  const handleBackspace = () => {
    onValueChange(value.slice(0, -1));
  };

  const canConfirm = value.length === maxLength && !!onConfirm;

  return (
    <div className="flex flex-col gap-4">
      {/* PIN Display */}
      <div className="h-16 border-2 border-black rounded-sm bg-[#838383] flex items-center justify-center gap-3 px-4">
        {Array.from({ length: maxLength }).map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 border-2 border-black rounded-sm ${
              i < value.length ? 'bg-black' : 'bg-[#838383]'
            }`}
          />
        ))}
      </div>

      {/* Keypad Grid */}
      <div className="grid grid-cols-3 gap-3">
        {numbers.slice(0, 9).map((num) => (
          <button
            key={num}
            onClick={() => handleNumberClick(num)}
            className={`h-16 border-2 border-black rounded-sm bg-[#838383] hover:bg-black hover:text-[#838383] ${PRESS} font-bold text-3xl`}
          >
            {num}
          </button>
        ))}

        {/* Bottom Row: Backspace, 0, Confirm. Disabled = solid border + INVISIBLE
           content (keeps both the button size AND the inner glyph slot stable). */}
        <button
          onClick={handleBackspace}
          disabled={value.length === 0}
          aria-label="Backspace"
          className={`h-16 border-2 border-black rounded-sm bg-[#838383] font-bold text-xl ${
            value.length === 0
              ? 'cursor-default'
              : `hover:bg-black hover:text-[#838383] ${PRESS}`
          }`}
        >
          <span className={value.length === 0 ? 'invisible' : ''}>←</span>
        </button>
        <button
          onClick={() => handleNumberClick(numbers[9])}
          className={`h-16 border-2 border-black rounded-sm bg-[#838383] hover:bg-black hover:text-[#838383] ${PRESS} font-bold text-3xl`}
        >
          {numbers[9]}
        </button>
        {showConfirm && onConfirm ? (
          <button
            onClick={() => canConfirm && onConfirm()}
            disabled={!canConfirm}
            aria-label="Confirm"
            className={`h-16 border-2 border-black rounded-sm flex items-center justify-center ${
              canConfirm
                ? `bg-black text-[#838383] hover:bg-[#838383] hover:text-black active:bg-[#838383] active:text-black`
                : 'bg-[#838383] cursor-default'
            }`}
          >
            <Check className={`w-8 h-8 ${canConfirm ? '' : 'invisible'}`} strokeWidth={3} />
          </button>
        ) : (
          <div className="h-16" />
        )}
      </div>
    </div>
  );
}
