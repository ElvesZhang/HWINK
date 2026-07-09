import { Type } from 'lucide-react';
import { useState } from 'react';

/** Candidate fonts for comparing 1-bit legibility — all already embedded, so
 *  they can be tried without downloading anything.
 *   • `family` is applied at the device screen root, so ALL screen text (header,
 *     labels, paragraph, buttons AND the big code) switches together. `undefined`
 *     = keep the app default (Noto Sans).
 *   • `codeWeight` is an optional weight just for the big Verify Code numerals
 *     (the body text keeps its own designed weights). */
export type VerifyFont = 'default' | 'plexmono' | 'hanken' | 'plexsans';

export const VERIFY_FONTS: Record<VerifyFont, { label: string; hint: string; family?: string; codeWeight?: number }> = {
  default:  { label: 'Noto Sans', hint: '当前默认' },
  plexmono: { label: 'Plex Mono', hint: '等宽·机械', family: "'IBM Plex Mono', ui-monospace, monospace", codeWeight: 600 },
  hanken:   { label: 'Hanken 800', hint: '超粗黑体', family: "'Hanken Grotesk', sans-serif", codeWeight: 800 },
  plexsans: { label: 'Plex Sans', hint: '几何无衬线', family: "'IBM Plex Sans', sans-serif", codeWeight: 700 },
};

const ORDER: VerifyFont[] = ['default', 'plexmono', 'hanken', 'plexsans'];

interface VerifyFontSwitcherProps {
  currentFont: VerifyFont;
  onFontChange: (font: VerifyFont) => void;
}

/** Floating dev control (outside the device) to swap the Verify Code font live —
 *  pair with the 1-bit preview to judge which numerals alias best on the panel. */
export function VerifyFontSwitcher({ currentFont, onFontChange }: VerifyFontSwitcherProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-6 left-6 z-40">
      {isExpanded ? (
        <div className="bg-white rounded-lg shadow-2xl p-3 border-2 border-gray-300 w-[188px]">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-semibold text-gray-700">Screen Font</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600 text-sm font-bold ml-3"
              title="Collapse"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            {ORDER.map((font) => (
              <button
                key={font}
                onClick={() => onFontChange(font)}
                className={`
                  px-2 py-1.5 rounded text-xs font-bold transition-all flex items-baseline justify-between gap-2
                  ${currentFont === font
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-purple-100'}
                `}
                title={`Switch to ${VERIFY_FONTS[font].label}`}
              >
                <span>{VERIFY_FONTS[font].label}</span>
                <span className={`text-[10px] font-normal ${currentFont === font ? 'text-purple-100' : 'text-gray-400'}`}>
                  {VERIFY_FONTS[font].hint}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-2 pt-2 border-t border-gray-100 text-[10px] text-gray-500 text-center leading-snug">
            换整屏文本+校验码;配合 1-bit 预览看锯齿
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-purple-600 text-white px-3 py-2.5 rounded-full shadow-lg hover:bg-purple-700 transition-all flex items-center gap-2 border-2 border-purple-700"
          title={`Screen Font (Current: ${VERIFY_FONTS[currentFont].label})`}
        >
          <Type className="w-5 h-5" />
          <span className="text-xs font-bold">{VERIFY_FONTS[currentFont].label}</span>
        </button>
      )}
    </div>
  );
}
