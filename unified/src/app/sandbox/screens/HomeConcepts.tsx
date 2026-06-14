import { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Check, Coins, FileSignature, KeyRound, Settings, Bluetooth, BatteryMedium } from 'lucide-react';
import { FeatureArt } from '../illustrations/FeatureArt';
import type { VariantId } from '../SandboxPage';

interface Props { variant: VariantId; showDebugId?: boolean }

type Feature = { id: 'assets' | 'history' | 'passkey' | 'settings'; title: string; sub: string };
const FEATURES: Feature[] = [
  { id: 'assets',   title: 'Assets',   sub: '3 networks · 12 tokens' },
  { id: 'history',  title: 'History',  sub: '6 signatures' },
  { id: 'passkey',  title: 'Passkey',  sub: 'FIDO2 enabled' },
  { id: 'settings', title: 'Settings', sub: 'Device & security' },
];

// The four "Style" buttons are repurposed as four INTERACTION PARADIGMS for
// the home screen (not skins): carousel / focus-list / dashboard-drill /
// (classic falls back to carousel). Each is a working, operable prototype.
export function HomeConcepts({ variant }: Props) {
  if (variant === 'minimal')   return <Carousel />;
  if (variant === 'bold')      return <FocusList />;
  if (variant === 'editorial') return <DashboardDrill />;
  return <Carousel />;
}

// ════════════════════════════════════════════════════════════
// CONCEPT 1 — CAROUSEL: one full-screen feature at a time, swipe through.
// "Min" slot. Big illustration drives the screen; ← → move between features;
// the centre confirm enters. This is the most "Trezor full-art" paradigm.
// ════════════════════════════════════════════════════════════
function Carousel() {
  const [i, setI] = useState(0);
  const [entered, setEntered] = useState<Feature | null>(null);
  const f = FEATURES[i];

  if (entered) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center bg-black">
        <FeatureArt id={entered.id} size={96} className="text-[#838383] mb-5" />
        <div className="text-2xl font-bold text-[#838383] mb-1">{entered.title}</div>
        <div className="text-sm text-[#838383] mb-6">Opened — placeholder screen</div>
        <button onClick={() => setEntered(null)} className="px-5 h-11 border-2 border-[#838383] rounded-sm text-[#838383] text-sm font-bold uppercase tracking-wide active:bg-[#838383] active:text-black">
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* tiny status line */}
      <div className="flex items-center justify-center gap-3 py-1.5 text-black text-[11px] flex-shrink-0">
        <span className="flex items-center gap-1"><BatteryMedium className="w-3.5 h-3.5" strokeWidth={2} />78%</span>
        <span className="flex items-center gap-1"><Bluetooth className="w-3.5 h-3.5" strokeWidth={2} />On</span>
        <span className="font-bold tracking-wide">ELVES-5DW</span>
      </div>

      {/* full-screen feature stage */}
      <div className="flex-1 flex items-center min-h-0">
        {/* left arrow */}
        <button
          onClick={() => setI((i - 1 + FEATURES.length) % FEATURES.length)}
          className="h-full px-1 flex items-center active:bg-black active:text-[#838383]"
          aria-label="Previous"
        >
          <ChevronLeft className="w-7 h-7 text-black" strokeWidth={2.5} />
        </button>

        {/* big art + label, tappable to enter */}
        <button onClick={() => setEntered(f)} className="flex-1 h-full flex flex-col items-center justify-center gap-4 active:bg-black active:text-[#838383] group">
          <FeatureArt id={f.id} size={128} className="text-black group-active:text-[#838383]" />
          <div className="text-center">
            <div className="text-3xl font-bold leading-none">{f.title}</div>
            <div className="text-sm mt-2">{f.sub}</div>
          </div>
        </button>

        {/* right arrow */}
        <button
          onClick={() => setI((i + 1) % FEATURES.length)}
          className="h-full px-1 flex items-center active:bg-black active:text-[#838383]"
          aria-label="Next"
        >
          <ChevronRight className="w-7 h-7 text-black" strokeWidth={2.5} />
        </button>
      </div>

      {/* page dots */}
      <div className="flex items-center justify-center gap-2 py-3 flex-shrink-0">
        {FEATURES.map((_, idx) => (
          <div key={idx} className={`rounded-full ${idx === i ? 'w-2.5 h-2.5 bg-black' : 'w-2 h-2 border border-black'}`} />
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// CONCEPT 2 — FOCUS LIST: vertical list where the focused row expands into a
// big card (art + desc + enter), others collapse to thin rows. Up/Down move
// focus, centre enters. "Bold" slot. Progressive disclosure within a list.
// ════════════════════════════════════════════════════════════
function FocusList() {
  const [focus, setFocus] = useState(0);
  const LUCIDE = { assets: Coins, history: FileSignature, passkey: KeyRound, settings: Settings };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 flex flex-col gap-1.5 p-2.5 min-h-0">
        {FEATURES.map((f, idx) => {
          const Icon = LUCIDE[f.id];
          const isFocus = idx === focus;
          if (isFocus) {
            return (
              <button
                key={f.id}
                onClick={() => { /* enter */ }}
                className="flex-[3] bg-black rounded-sm flex items-center gap-4 px-5 text-left"
              >
                <FeatureArt id={f.id} size={64} className="text-[#838383] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-2xl font-bold text-[#838383] leading-tight">{f.title}</div>
                  <div className="text-sm text-[#838383] mt-1">{f.sub}</div>
                  <div className="inline-flex items-center gap-1 mt-3 text-[11px] font-bold text-[#838383] uppercase tracking-widest">
                    Open <ChevronRight className="w-3.5 h-3.5" strokeWidth={3} />
                  </div>
                </div>
              </button>
            );
          }
          return (
            <button
              key={f.id}
              onClick={() => setFocus(idx)}
              className="flex-1 border-2 border-black rounded-sm bg-[#838383] flex items-center gap-3 px-4 active:bg-black active:text-[#838383]"
            >
              <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
              <span className="text-base font-bold">{f.title}</span>
            </button>
          );
        })}
      </div>

      {/* up/down focus controls */}
      <div className="flex items-center justify-between px-4 py-2 border-t-2 border-black flex-shrink-0">
        <button onClick={() => setFocus((focus - 1 + FEATURES.length) % FEATURES.length)} className="h-8 w-8 flex items-center justify-center active:bg-black active:text-[#838383] rounded-sm" aria-label="Up">
          <ChevronUp className="w-5 h-5 text-black" strokeWidth={2.5} />
        </button>
        <span className="text-[10px] font-bold text-black uppercase tracking-widest">Move focus</span>
        <button onClick={() => setFocus((focus + 1) % FEATURES.length)} className="h-8 w-8 flex items-center justify-center active:bg-black active:text-[#838383] rounded-sm" aria-label="Down">
          <ChevronDown className="w-5 h-5 text-black" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// CONCEPT 3 — DASHBOARD + DRILL: status overview up top, big icon launcher
// row at the bottom, tapping drills in full-screen. "Editorial" slot.
// ════════════════════════════════════════════════════════════
function DashboardDrill() {
  const [drill, setDrill] = useState<Feature | null>(null);
  const LUCIDE = { assets: Coins, history: FileSignature, passkey: KeyRound, settings: Settings };

  if (drill) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center bg-black">
        <FeatureArt id={drill.id} size={104} className="text-[#838383] mb-5" />
        <div className="text-2xl font-bold text-[#838383] mb-1">{drill.title}</div>
        <div className="text-sm text-[#838383] mb-6">{drill.sub}</div>
        <button onClick={() => setDrill(null)} className="px-5 h-11 border-2 border-[#838383] rounded-sm text-[#838383] text-sm font-bold uppercase tracking-wide active:bg-[#838383] active:text-black">
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* big status overview */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center min-h-0">
        <div className="text-[11px] text-black uppercase tracking-[0.2em] mb-1">Wallet</div>
        <div className="text-4xl font-bold text-black leading-none mb-3">Elves-5DW</div>
        <div className="flex items-center gap-4 text-black text-sm">
          <span className="flex items-center gap-1.5"><BatteryMedium className="w-5 h-5" strokeWidth={2} />78%</span>
          <span className="flex items-center gap-1.5"><Bluetooth className="w-5 h-5" strokeWidth={2} />On</span>
        </div>
        <div className="mt-4 px-3 py-1 border-2 border-black rounded-sm text-[11px] font-bold text-black uppercase tracking-wide">
          Firmware up to date
        </div>
      </div>

      {/* bottom launcher row — 4 big icon buttons */}
      <div className="grid grid-cols-4 border-t-2 border-black flex-shrink-0">
        {FEATURES.map((f, idx) => {
          const Icon = LUCIDE[f.id];
          return (
            <button
              key={f.id}
              onClick={() => setDrill(f)}
              className={`h-[88px] flex flex-col items-center justify-center gap-1.5 active:bg-black active:text-[#838383] ${idx > 0 ? 'border-l-2 border-black' : ''}`}
            >
              <Icon className="w-7 h-7 text-black" strokeWidth={2} />
              <span className="text-[10px] font-bold text-black uppercase tracking-wide">{f.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
