import { Coins, FileSignature, KeyRound, Settings, ChevronRight, Bluetooth, BatteryMedium } from 'lucide-react';
import { DeviceHero } from '../illustrations/DeviceHero';
import type { VariantId } from '../SandboxPage';

interface Props { variant: VariantId; showDebugId?: boolean }

const MENU = [
  { icon: Coins,         title: 'Assets',        sub: '3 networks' },
  { icon: FileSignature, title: 'Sign History',  sub: '6 records' },
  { icon: KeyRound,      title: 'Passkey',        sub: 'FIDO2' },
  { icon: Settings,      title: 'Settings',       sub: 'Device & security' },
];

export function RichHomeVariants({ variant }: Props) {
  if (variant === 'minimal')   return <Minimal />;
  if (variant === 'bold')      return <Bold />;
  if (variant === 'editorial') return <Editorial />;
  return <Classic />;
}

// ── MINIMAL — airy, thin lines, small icons, lots of negative space ──
function Minimal() {
  return (
    <div className="flex-1 flex flex-col px-6 pt-6">
      <div className="text-xs text-black uppercase tracking-[0.2em] mb-1">Wallet</div>
      <div className="text-3xl font-bold text-black leading-none mb-1">Elves-5DW</div>
      <div className="text-xs text-black mb-8">78% · Bluetooth on</div>

      <div className="flex flex-col">
        {MENU.map(({ icon: Icon, title }, i) => (
          <button
            key={title}
            className={`flex items-center gap-4 py-4 ${i > 0 ? 'border-t border-black' : ''} active:opacity-100`}
          >
            <Icon className="w-5 h-5 text-black flex-shrink-0" strokeWidth={1.75} />
            <span className="flex-1 text-left text-base text-black">{title}</span>
            <ChevronRight className="w-4 h-4 text-black" strokeWidth={1.75} />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── BOLD — big black hero, oversized type, strong invert blocks ──
function Bold() {
  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-black px-5 pt-5 pb-6 flex-shrink-0">
        <div className="text-[11px] text-[#838383] uppercase tracking-[0.2em] mb-1">Wallet</div>
        <div className="text-4xl font-bold text-[#838383] leading-none">Elves-5DW</div>
        <div className="flex items-center gap-3 mt-3 text-[#838383] text-sm">
          <span className="flex items-center gap-1"><BatteryMedium className="w-4 h-4" strokeWidth={2} />78%</span>
          <span className="flex items-center gap-1"><Bluetooth className="w-4 h-4" strokeWidth={2} />On</span>
        </div>
      </div>
      <div className="flex-1 grid grid-cols-2 gap-2.5 p-3">
        {MENU.map(({ icon: Icon, title }) => (
          <button
            key={title}
            className="border-2 border-black rounded-sm bg-[#838383] active:bg-black active:text-[#838383] group flex flex-col items-start justify-between p-3"
          >
            <Icon className="w-8 h-8" strokeWidth={2} />
            <span className="text-base font-bold uppercase tracking-wide text-left leading-tight mt-2">{title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── EDITORIAL — magazine feel: device illustration, numbered rows, rules ──
function Editorial() {
  return (
    <div className="flex-1 flex flex-col px-5 pt-4">
      <div className="flex items-center gap-4 pb-4 border-b-2 border-black">
        <DeviceHero width={48} className="text-black flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-2xl font-bold text-black leading-none">Elves-5DW</div>
          <div className="text-xs text-black mt-1 uppercase tracking-wider">Obsidian · 78%</div>
        </div>
      </div>

      <div className="flex flex-col">
        {MENU.map(({ icon: Icon, title, sub }, i) => (
          <button key={title} className="flex items-center gap-3 py-3.5 border-b border-black active:bg-black active:text-[#838383] group">
            <span className="text-xs font-bold w-5 text-black group-active:text-[#838383] tabular-nums">{String(i + 1).padStart(2, '0')}</span>
            <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
            <div className="flex-1 text-left">
              <div className="text-base font-bold leading-tight">{title}</div>
              <div className="text-[11px] leading-tight">{sub}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── CLASSIC — the current rich version: black hero card + big badged rows ──
function Classic() {
  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-black px-5 pt-4 pb-5 flex items-center gap-4 flex-shrink-0">
        <DeviceHero width={60} className="text-[#838383] flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-[11px] text-[#838383] uppercase tracking-widest mb-1">Wallet</div>
          <div className="text-2xl font-bold text-[#838383] leading-tight truncate">Elves-5DW</div>
          <div className="flex items-center gap-3 mt-2 text-[#838383] text-xs">
            <span className="flex items-center gap-1"><BatteryMedium className="w-4 h-4" strokeWidth={2} />78%</span>
            <span className="flex items-center gap-1"><Bluetooth className="w-4 h-4" strokeWidth={2} />On</span>
          </div>
        </div>
      </div>
      <div className="flex-1 px-3 py-3 flex flex-col gap-2.5 overflow-hidden">
        {MENU.map(({ icon: Icon, title, sub }) => (
          <button key={title} className="flex items-center gap-3.5 px-3 h-[64px] border-2 border-black rounded-sm bg-[#838383] active:bg-black active:text-[#838383] group">
            <div className="w-11 h-11 rounded-full bg-black flex items-center justify-center flex-shrink-0 group-active:bg-[#838383]">
              <Icon className="w-6 h-6 text-[#838383] group-active:text-black" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-lg font-bold leading-tight">{title}</div>
              <div className="text-xs leading-tight mt-0.5">{sub}</div>
            </div>
            <ChevronRight className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
          </button>
        ))}
      </div>
    </div>
  );
}
