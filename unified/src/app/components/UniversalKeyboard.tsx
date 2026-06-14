import { useState } from 'react';
import { Delete, ArrowUp, Check } from 'lucide-react';

interface UniversalKeyboardProps {
  value: string;
  onChange: (value: string) => void;
  onConfirm?: (word?: string) => void;
  placeholder?: string;
  maxLength?: number;
  mode?: 'text' | 'bip39'; // bip39 mode shows word suggestions
  bip39Words?: string[];
  /** If true, the Confirm key is always enabled — even when value is empty.
   *  Default false. Used by passphrase input where an empty passphrase is a
   *  legitimate submission (= load the original recovery-phrase wallet). */
  allowEmpty?: boolean;
}

const PRESS = 'active:bg-black active:text-[#838383]';

export function UniversalKeyboard({
  value,
  onChange,
  onConfirm,
  placeholder = '',
  maxLength = 100,
  mode = 'text',
  bip39Words = [],
  allowEmpty = false,
}: UniversalKeyboardProps) {
  // BIP39 words are all lowercase, so an uppercase default would force the user to
  // un-shift on every word entry. Text mode keeps the "first letter capitalised" idiom.
  const [keyboardMode, setKeyboardMode] = useState<'lowercase' | 'uppercase' | 'numbers' | 'symbols'>(
    mode === 'bip39' ? 'lowercase' : 'uppercase'
  );
  // Tracks whether the current uppercase state was auto-capitalised (vs. user-toggled with shift).
  // Only auto-revert to lowercase when the user did not explicitly choose uppercase.
  const [autoCap, setAutoCap] = useState(mode !== 'bip39');

  const lowercaseKeys = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ];

  const uppercaseKeys = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ];

  const numberKeys = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['-', '/', ':', ';', '(', ')', '$', '&', '@', '"'],
    ['.', ',', '?', '!', "'"]
  ];

  const symbolKeys = [
    ['[', ']', '{', '}', '#', '%', '^', '*', '+', '='],
    ['_', '\\', '|', '~', '<', '>', '€', '£', '¥', '•'],
    ['.', ',', '?', '!', "'"]
  ];

  const getCurrentKeys = () => {
    switch (keyboardMode) {
      case 'uppercase':
        return uppercaseKeys;
      case 'numbers':
        return numberKeys;
      case 'symbols':
        return symbolKeys;
      default:
        return lowercaseKeys;
    }
  };

  const handleKeyPress = (key: string) => {
    if (value.length < maxLength) {
      const newValue = value + key;
      onChange(newValue);

      const isLetter = /^[a-zA-Z]$/.test(key);

      // 1. After typing the first auto-capitalised letter, fall back to lowercase
      //    so the user doesn't have to manually un-shift after each word start.
      if (isLetter && keyboardMode === 'uppercase' && autoCap) {
        setKeyboardMode('lowercase');
        setAutoCap(false);
        return;
      }

      // 2. After a space in lowercase, auto-capitalise the next letter.
      if (key === ' ' && keyboardMode === 'lowercase') {
        setKeyboardMode('uppercase');
        setAutoCap(true);
      }
    }
  };

  const handleBackspace = () => {
    onChange(value.slice(0, -1));
  };

  const handleSpace = () => {
    if (value.length < maxLength && value.length > 0 && !value.endsWith(' ')) {
      onChange(value + ' ');
    }
  };

  const toggleCase = () => {
    if (keyboardMode === 'lowercase') {
      setKeyboardMode('uppercase');
      setAutoCap(false); // user explicitly chose uppercase — do NOT auto-revert
    } else if (keyboardMode === 'uppercase') {
      setKeyboardMode('lowercase');
      setAutoCap(false);
    }
  };

  const toggleMode = () => {
    if (keyboardMode === 'numbers' || keyboardMode === 'symbols') {
      setKeyboardMode('lowercase');
    } else {
      setKeyboardMode('numbers');
    }
  };

  const toggleSymbols = () => {
    if (keyboardMode === 'symbols') {
      setKeyboardMode('numbers');
    } else {
      setKeyboardMode('symbols');
    }
  };

  const currentKeys = getCurrentKeys();
  const isLetterMode = keyboardMode === 'lowercase' || keyboardMode === 'uppercase';

  // BIP39 word suggestions
  const suggestions = mode === 'bip39' && value.length > 0
    ? bip39Words.filter(word => word.startsWith(value.toLowerCase())).slice(0, 3)
    : [];

  // BIP39: compute valid next letters based on current input
  const validNextLetters = new Set<string>();
  if (mode === 'bip39' && isLetterMode) {
    const prefix = value.toLowerCase();
    for (const word of bip39Words) {
      if (word.startsWith(prefix) && word.length > prefix.length) {
        validNextLetters.add(word[prefix.length]);
      }
    }
  }

  const isKeyDisabled = (key: string): boolean => {
    if (mode !== 'bip39' || !isLetterMode) return false;
    if (value.length === 0) return false;
    return validNextLetters.size > 0 && !validNextLetters.has(key.toLowerCase());
  };

  const canConfirm = allowEmpty || value.length > 0;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-[#838383] border-t-2 border-black">
      {/* BIP39 Word Suggestions */}
      {suggestions.length > 0 && (
        <div className="border-b-2 border-black px-3 py-2">
          <div className="flex gap-2">
            {suggestions.map((word) => (
              <button
                key={word}
                onClick={() => {
                  onChange(word);
                  if (onConfirm) onConfirm(word);
                }}
                className={`h-10 px-3 border-2 border-black bg-[#838383] hover:bg-black hover:text-[#838383] ${PRESS} text-lg font-bold rounded-sm`}
              >
                {word}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Keyboard */}
      <div className="p-3 space-y-2">
        {/* Key Rows */}
        {currentKeys.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1 justify-center">
            {row.map((key) => {
              const disabled = isKeyDisabled(key);
              return (
                <button
                  key={key}
                  onClick={() => !disabled && handleKeyPress(key)}
                  disabled={disabled}
                  className={`w-8 h-10 border-2 border-black text-lg font-bold rounded-sm bg-[#838383] ${
                    disabled
                      ? 'cursor-default'
                      : `hover:bg-black hover:text-[#838383] ${PRESS}`
                  }`}
                >
                  <span className={disabled ? 'invisible' : ''}>{key}</span>
                </button>
              );
            })}
          </div>
        ))}

        {/* Bottom Function Row */}
        <div className="flex gap-1 justify-center items-center">
          {/* Mode Toggle (123 / ABC). In BIP39 mode the label is INVISIBLE but
             still occupies space, so the button width never changes. */}
          <button
            onClick={toggleMode}
            disabled={mode === 'bip39'}
            className={`h-10 px-3 border-2 border-black bg-[#838383] text-lg font-bold rounded-sm ${
              mode === 'bip39'
                ? 'cursor-default'
                : `hover:bg-black hover:text-[#838383] ${PRESS}`
            }`}
          >
            <span className={mode === 'bip39' ? 'invisible' : ''}>
              {isLetterMode ? '123' : 'ABC'}
            </span>
          </button>

          {/* Symbol Toggle (only in number mode) */}
          {!isLetterMode && (
            <button
              onClick={toggleSymbols}
              className={`h-10 px-3 border-2 border-black bg-[#838383] hover:bg-black hover:text-[#838383] ${PRESS} text-lg font-bold rounded-sm`}
            >
              {keyboardMode === 'numbers' ? '#+=': '123'}
            </button>
          )}

          {/* Shift (only in letter mode) */}
          {isLetterMode && (
            <button
              onClick={toggleCase}
              className={`h-10 px-3 border-2 border-black hover:bg-black hover:text-[#838383] ${PRESS} text-lg font-bold rounded-sm ${
                keyboardMode === 'uppercase' ? 'bg-black text-[#838383]' : 'bg-[#838383]'
              }`}
              aria-label="Toggle case"
            >
              <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
            </button>
          )}

          {/* Space Bar */}
          <button
            onClick={handleSpace}
            className={`flex-1 h-10 border-2 border-black bg-[#838383] hover:bg-black hover:text-[#838383] ${PRESS} text-lg font-bold rounded-sm`}
          >
            Space
          </button>

          {/* Backspace — disabled = solid border + INVISIBLE content (icon still
             occupies layout space so button width never collapses). */}
          <button
            onClick={handleBackspace}
            disabled={value.length === 0}
            className={`h-10 px-3 border-2 border-black bg-[#838383] flex items-center justify-center rounded-sm ${
              value.length === 0
                ? 'cursor-default'
                : `hover:bg-black hover:text-[#838383] ${PRESS}`
            }`}
            aria-label="Backspace"
          >
            <Delete className={`w-4 h-4 ${value.length === 0 ? 'invisible' : ''}`} strokeWidth={2.5} />
          </button>

          {/* Confirm Button — same invisible pattern. */}
          {onConfirm && (
            <button
              onClick={() => canConfirm && onConfirm()}
              disabled={!canConfirm}
              className={`h-10 px-4 border-2 border-black flex items-center justify-center rounded-sm ${
                canConfirm
                  ? `bg-black text-[#838383] hover:bg-[#838383] hover:text-black active:bg-[#838383] active:text-black`
                  : 'bg-[#838383] cursor-default'
              }`}
              aria-label="Confirm"
            >
              <Check className={`w-5 h-5 ${canConfirm ? '' : 'invisible'}`} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
