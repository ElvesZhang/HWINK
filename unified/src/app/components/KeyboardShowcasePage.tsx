import { useState } from 'react';
import { ChevronLeft, X } from 'lucide-react';
import { PINKeypad } from './PINKeypad';
import { UniversalKeyboard } from './UniversalKeyboard';

const DEMO_BIP39 = [
  'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
  'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
  'across', 'act', 'action', 'actor', 'actual',
];

export type KeyboardVariant = 'pin' | 'text' | 'bip39';

interface KeyboardShowcasePageProps {
  onBack: () => void;
  variant: KeyboardVariant;
  pinRandomized: boolean;
  pinMaxLength: number;
  /** Initial value for the text/bip39 input — used by the showcase to inject prefixes for visual testing. */
  initialTextValue?: string;
}

const PRESS = 'active:bg-black active:text-[#838383]';

export function KeyboardShowcasePage({
  onBack,
  variant,
  pinRandomized,
  pinMaxLength,
  initialTextValue = '',
}: KeyboardShowcasePageProps) {
  const [pinValue, setPinValue] = useState('');
  const [textValue, setTextValue] = useState(initialTextValue);

  const renderHeader = (title: string) => (
    <div className="h-[45px] px-5 flex items-center border-b-2 border-black flex-shrink-0">
      <button
        onClick={onBack}
        className={`flex items-center gap-2 ${PRESS} px-1 -mx-1 rounded-sm`}
      >
        <ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
        <span className="text-lg font-bold text-black uppercase tracking-wide">{title}</span>
      </button>
    </div>
  );

  if (variant === 'pin') {
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        {renderHeader('PIN Keypad')}
        <div className="flex-1 p-5 flex flex-col">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-black">Showcase</h2>
            <p className="text-sm text-black mt-2">
              Enter a {pinMaxLength}-digit PIN. ✓ enables only when full length is reached.
            </p>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <PINKeypad
              value={pinValue}
              onValueChange={setPinValue}
              maxLength={pinMaxLength}
              randomized={pinRandomized}
              onConfirm={() => setPinValue('')}
            />
          </div>
        </div>
      </div>
    );
  }

  // text / bip39 — both use UniversalKeyboard, differ only by mode
  const isBip39 = variant === 'bip39';
  return (
    <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col relative">
      {renderHeader(isBip39 ? 'BIP39 Keyboard' : 'Text Keyboard')}
      <div className="flex-1 p-5 pb-[220px] flex flex-col">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-black">Showcase</h2>
          <p className="text-sm text-black mt-2">
            {isBip39
              ? 'Word suggestions appear above the keys. Invalid next letters are dashed-out.'
              : 'Default uppercase, falls back to lowercase after the first letter.'}
          </p>
        </div>

        <div className="relative mb-3">
          <div className="min-h-14 border-2 border-black rounded-sm bg-[#838383] flex items-start px-3 py-2 pr-12">
            <span className="text-lg font-bold text-black flex-1 break-all">{textValue || ' '}</span>
          </div>
          {textValue && (
            <button
              onClick={() => setTextValue('')}
              aria-label="Clear"
              className={`absolute top-2 right-2 w-8 h-8 rounded-full border-2 border-black bg-[#838383] flex items-center justify-center hover:bg-black hover:text-[#838383] ${PRESS}`}
            >
              <X className="w-4 h-4" strokeWidth={3} />
            </button>
          )}
        </div>

        <div className="mt-auto mb-2 border-2 border-black border-dashed rounded-sm p-3 bg-[#838383]">
          <div className="text-xs font-bold text-black mb-1">Tip</div>
          <p className="text-sm text-black leading-snug">
            {isBip39
              ? 'Type any letter prefix; only letters that can continue a valid word stay solid.'
              : 'Press ↑ to lock uppercase; otherwise it auto-reverts after the first letter.'}
          </p>
        </div>
      </div>

      <UniversalKeyboard
        value={textValue}
        onChange={setTextValue}
        onConfirm={() => setTextValue('')}
        mode={isBip39 ? 'bip39' : 'text'}
        bip39Words={DEMO_BIP39}
      />
    </div>
  );
}
