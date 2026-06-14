import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { HomeConcepts } from './screens/HomeConcepts';
import { RichHistoryVariants } from './screens/RichHistoryVariants';
import { RichTransferSignPage } from './screens/RichTransferSignPage';
import { RichVerifySelectLengthPage } from './screens/RichVerifySelectLengthPage';

interface SandboxPageProps {
  onBack: () => void;
  showDebugId?: boolean;
}

// Isolated design-exploration playground. Home and History each expose four
// stylistic variants (Minimal / Bold / Editorial / Classic) via a second
// switcher row so the directions can be compared side by side.
const SCREENS = [
  { id: 'home', label: 'Home', variants: true },
  { id: 'history', label: 'History', variants: true },
  { id: 'sign', label: 'Sign', variants: false },
  { id: 'verify', label: 'Verify', variants: false },
] as const;

type ScreenId = (typeof SCREENS)[number]['id'];

const VARIANTS = [
  { id: 'minimal', label: 'Min' },
  { id: 'bold', label: 'Bold' },
  { id: 'editorial', label: 'Edit' },
  { id: 'classic', label: 'Class' },
] as const;

export type VariantId = (typeof VARIANTS)[number]['id'];

const PRESS = 'active:bg-black active:text-[#838383]';

export function SandboxPage({ onBack, showDebugId }: SandboxPageProps) {
  const [active, setActive] = useState<ScreenId>('home');
  const [variant, setVariant] = useState<VariantId>('minimal');
  // Global render experiments, applied on top of whatever screen/variant shows.
  const [dither, setDither] = useState(false);
  const [bit, setBit] = useState(false);
  const hasVariants = SCREENS.find(s => s.id === active)!.variants;

  return (
    <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
      {/* Hidden SVG filter powering the true 1-bit preview (threshold to pure B/W). */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <filter id="eink-1bit" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0" />
          <feComponentTransfer>
            <feFuncR type="discrete" tableValues="0 1" />
            <feFuncG type="discrete" tableValues="0 1" />
            <feFuncB type="discrete" tableValues="0 1" />
          </feComponentTransfer>
        </filter>
      </svg>

      {/* Row 1: screen switcher + exit */}
      <div className="h-[42px] px-2 flex items-center justify-between border-b-2 border-black flex-shrink-0">
        <button
          onClick={onBack}
          aria-label="Exit sandbox"
          className={`flex items-center ${PRESS} px-1.5 -mx-1 rounded-sm`}
        >
          <ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
        </button>
        <div className="flex items-center gap-1">
          {SCREENS.map(s => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`px-2 h-7 text-[11px] font-bold uppercase tracking-wide rounded-sm border-2 border-black ${
                active === s.id ? 'bg-black text-[#838383]' : `bg-[#838383] text-black ${PRESS}`
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Render controls: global dither overlay + true 1-bit preview.
         Both layer on top of whatever screen/variant is showing. */}
      <div className="h-[34px] px-2 flex items-center justify-center gap-1.5 border-b-2 border-black flex-shrink-0 bg-[#838383]">
        <span className="text-[10px] font-bold text-black uppercase tracking-widest mr-1">Render</span>
        <button
          onClick={() => setDither(d => !d)}
          className={`px-2.5 h-6 text-[10px] font-bold uppercase tracking-wide rounded-sm border border-black ${
            dither ? 'bg-black text-[#838383]' : `bg-[#838383] text-black ${PRESS}`
          }`}
        >
          Dither
        </button>
        <button
          onClick={() => setBit(b => !b)}
          className={`px-2.5 h-6 text-[10px] font-bold uppercase tracking-wide rounded-sm border border-black ${
            bit ? 'bg-black text-[#838383]' : `bg-[#838383] text-black ${PRESS}`
          }`}
        >
          1-bit
        </button>
      </div>

      {/* Row 2: variant switcher. On Home the four slots are INTERACTION
         PARADIGMS (only 3 used); on History they are visual styles. */}
      {hasVariants && (() => {
        const isHome = active === 'home';
        const items = isHome
          ? [
              { id: 'minimal' as VariantId, label: 'Swipe' },
              { id: 'bold' as VariantId, label: 'Focus' },
              { id: 'editorial' as VariantId, label: 'Panel' },
            ]
          : VARIANTS.map(v => ({ id: v.id as VariantId, label: v.label }));
        return (
          <div className="h-[38px] px-2 flex items-center justify-center gap-1.5 border-b-2 border-black flex-shrink-0 bg-[#838383]">
            <span className="text-[10px] font-bold text-black uppercase tracking-widest mr-1">
              {isHome ? 'Flow' : 'Style'}
            </span>
            {items.map(v => (
              <button
                key={v.id}
                onClick={() => setVariant(v.id)}
                className={`px-2.5 h-6 text-[10px] font-bold uppercase tracking-wide rounded-sm border border-black ${
                  variant === v.id ? 'bg-black text-[#838383]' : `bg-[#838383] text-black ${PRESS}`
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        );
      })()}

      {/* Active screen (+ optional global dither overlay & 1-bit preview) */}
      <div className={`flex-1 min-h-0 relative bg-[#838383] ${dither ? 'eink-dither' : ''} ${bit ? 'bit-preview' : ''}`}>
        {active === 'home' && <HomeConcepts variant={variant} showDebugId={showDebugId} />}
        {active === 'history' && <RichHistoryVariants variant={variant} showDebugId={showDebugId} />}
        {active === 'sign' && <RichTransferSignPage showDebugId={showDebugId} />}
        {active === 'verify' && <RichVerifySelectLengthPage showDebugId={showDebugId} />}
        {dither && <div className="eink-grain" aria-hidden="true" />}
      </div>
    </div>
  );
}
