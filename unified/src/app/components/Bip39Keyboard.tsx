import { Delete } from 'lucide-react';

/**
 * Bip39Keyboard — a dedicated recovery-phrase keyboard. BIP39 words are all
 * lowercase letters with no spaces or capitals, so this layout has NO shift and
 * NO space; backspace sits at the right end of the bottom (m) row. Invalid next
 * letters are dimmed in place (kept as invisible occupants so the grid never
 * shifts). Candidate words use the original recovery-input tag style and only
 * appear once there is input. Separate from the shared UniversalKeyboard so the
 * passphrase / activation / showcase flows are untouched.
 */
const PRESS = 'active:bg-black active:text-[#838383]';
const KEY_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
const KEY = `h-12 flex-1 max-w-[36px] border-2 border-black rounded-sm bg-[#838383] text-black text-lg font-bold ${PRESS}`;

interface Bip39KeyboardProps {
  value: string;
  onChange: (value: string) => void;
  onConfirm: (word: string) => void;
  bip39Words: string[];
}

export function Bip39Keyboard({ value, onChange, onConfirm, bip39Words }: Bip39KeyboardProps) {
  const prefix = value.toLowerCase();
  const suggestions = prefix ? bip39Words.filter(w => w.startsWith(prefix)).slice(0, 3) : [];

  const validNext = new Set<string>();
  if (prefix) {
    for (const w of bip39Words) {
      if (w.startsWith(prefix) && w.length > prefix.length) validNext.add(w[prefix.length]);
    }
  }
  const isDisabled = (k: string) => prefix.length > 0 && validNext.size > 0 && !validNext.has(k);

  return (
    <div className="flex-shrink-0 border-t-2 border-black">
      {/* Candidate words — original recovery-input tag style; only with input */}
      {suggestions.length > 0 && (
        <div className="border-b-2 border-black px-3 py-2">
          <div className="flex gap-2">
            {suggestions.map(w => (
              <button key={w} onClick={() => onConfirm(w)} className={`h-10 px-3 border-2 border-black rounded-sm bg-[#838383] text-black text-lg font-bold ${PRESS}`}>
                {w}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Letter keys — no shift, no space; backspace at the end of the m row */}
      <div className="p-3 flex flex-col gap-1.5">
        {KEY_ROWS.map((row, ri) => (
          <div key={ri} className="flex gap-1 justify-center">
            {row.split('').map(k => {
              const dis = isDisabled(k);
              return (
                <button key={k} disabled={dis} onClick={() => onChange(value + k)} className={KEY}>
                  <span className={dis ? 'invisible' : ''}>{k}</span>
                </button>
              );
            })}
            {ri === KEY_ROWS.length - 1 && (
              <button
                onClick={() => onChange(value.slice(0, -1))}
                disabled={!value}
                aria-label="Backspace"
                className={`h-12 flex-1 max-w-[52px] border-2 border-black rounded-sm bg-[#838383] flex items-center justify-center ${value ? PRESS : ''}`}
              >
                <Delete className={`w-6 h-6 text-black ${value ? '' : 'invisible'}`} strokeWidth={2.25} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
