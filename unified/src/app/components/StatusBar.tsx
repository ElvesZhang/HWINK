import { Battery, BatteryCharging, Bluetooth, Nfc, Lock } from 'lucide-react';

interface StatusBarProps {
  walletName: string;
  batteryLevel: number;
  isCharging: boolean;
  nfcEnabled: boolean;
  bluetoothConnected: boolean;
}

export function StatusBar({ 
  walletName, 
  batteryLevel, 
  isCharging,
  nfcEnabled,
  bluetoothConnected 
}: StatusBarProps) {
  return (
    <div className="h-[45px] px-5 flex items-center justify-between border-b-2 border-black flex-shrink-0">
      {/* Left: Wallet Name — 18px spec, icon sized to the header chevron (w-5). */}
      <div className="flex items-center gap-2">
        <Lock className="w-5 h-5 text-black" strokeWidth={2.5} />
        <div className="text-lg font-bold text-black uppercase tracking-wide">{walletName}</div>
      </div>

      {/* Right: Status Icons */}
      <div className="flex items-center gap-3">
        {/* NFC Status */}
        {nfcEnabled ? (
          <Nfc className="w-5 h-5 text-black" strokeWidth={2.5} />
        ) : (
          <Nfc className="w-5 h-5 text-black" strokeWidth={1} />
        )}

        {/* Bluetooth Status */}
        {bluetoothConnected ? (
          <Bluetooth className="w-5 h-5 text-black" strokeWidth={2.5} />
        ) : (
          <Bluetooth className="w-5 h-5 text-black" strokeWidth={1} />
        )}

        {/* Battery */}
        <div className="flex items-center gap-1">
          {isCharging ? (
            <BatteryCharging className="w-5 h-5 text-black" strokeWidth={2.5} />
          ) : (
            <Battery className="w-5 h-5 text-black" strokeWidth={2.5} />
          )}
          <span className="text-lg font-bold text-black tabular-nums">{batteryLevel}%</span>
        </div>
      </div>
    </div>
  );
}