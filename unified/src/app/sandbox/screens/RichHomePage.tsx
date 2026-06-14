import { Coins, FileSignature, KeyRound, Settings, ChevronRight, Bluetooth, BatteryMedium } from 'lucide-react';
import { DeviceHero } from '../illustrations/DeviceHero';

interface Props { showDebugId?: boolean }

const MENU = [
  { icon: Coins,         title: 'Assets',       sub: '3 networks' },
  { icon: FileSignature, title: 'Sign History', sub: '6 records' },
  { icon: KeyRound,      title: 'Passkey',      sub: 'FIDO2' },
  { icon: Settings,      title: 'Settings',     sub: 'Device & security' },
];

// Rich Home — a black hero card pairing the device illustration with wallet
// identity, then a vertical list of large, tappable menu rows (each with a
// big icon badge). Large type throughout for a 3" screen.
export function RichHomePage(_: Props) {
  return (
    <div className="flex-1 flex flex-col">
      {/* HERO — black card: device illustration + wallet identity + status */}
      <div className="bg-black px-5 pt-4 pb-5 flex items-center gap-4 flex-shrink-0">
        <DeviceHero width={64} className="text-[#838383] flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-[11px] text-[#838383] uppercase tracking-widest mb-1">Wallet</div>
          <div className="text-2xl font-bold text-[#838383] leading-tight truncate">Elves-5DW</div>
          <div className="flex items-center gap-3 mt-2 text-[#838383]">
            <span className="flex items-center gap-1 text-xs">
              <BatteryMedium className="w-4 h-4" strokeWidth={2} /> 78%
            </span>
            <span className="flex items-center gap-1 text-xs">
              <Bluetooth className="w-4 h-4" strokeWidth={2} /> On
            </span>
          </div>
        </div>
      </div>

      {/* MENU — large rows, each with an icon badge + chevron affordance */}
      <div className="flex-1 px-3 py-3 flex flex-col gap-2.5 overflow-hidden">
        {MENU.map(({ icon: Icon, title, sub }) => (
          <button
            key={title}
            className="flex items-center gap-3.5 px-3 h-[68px] border-2 border-black rounded-sm bg-[#838383] active:bg-black active:text-[#838383] group"
          >
            {/* icon badge */}
            <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center flex-shrink-0 group-active:bg-[#838383]">
              <Icon className="w-6 h-6 text-[#838383] group-active:text-black" strokeWidth={2} />
            </div>
            {/* labels — large title */}
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
