import { RefreshCw, CheckCircle, BatteryFull, BatteryLow, Fingerprint, Lock } from 'lucide-react';

export type FirmwareOutcome = 'success' | 'fail-transfer' | 'fail-verify';
export type FirmwareConnect = 'success' | 'fail-ble' | 'fail-info';

/**
 * Dev-only toggles for the Firmware Update flow (prototype simulation
 * switches). Fixed at App root outside the zoomed device frame, like the
 * Sign page's SecondFactorToggle / SignTypeSwitcher.
 *
 *  - hasUpdate  : does the app report a newer firmware once linked?
 *                 true  → "Update available" (confirm) screen
 *                 false → "Up to date" (no update) screen
 *  - batteryOk  : does the on-entry battery check pass?
 *                 true  → proceed to the waiting-for-app screen
 *                 false → "Battery too low" failure screen
 *  - enrolled   : device has a fingerprint enrolled? Drives the second factor
 *                 on "Update" (fingerprint scan vs PIN keypad).
 *  - connect    : how the waiting-for-app phase ends (link up + info received
 *                 / no BLE link at all / linked but info never arrives).
 *  - outcome    : how the transfer/verify phases end (success / BLE drop
 *                 mid-transfer / signature verification failure).
 */
export function FirmwareUpdateToggle({
  hasUpdate,
  onHasUpdateChange,
  batteryOk,
  onBatteryOkChange,
  enrolled,
  onEnrolledChange,
  connect,
  onConnectChange,
  outcome,
  onOutcomeChange,
}: {
  hasUpdate: boolean;
  onHasUpdateChange: (v: boolean) => void;
  batteryOk: boolean;
  onBatteryOkChange: (v: boolean) => void;
  enrolled: boolean;
  onEnrolledChange: (v: boolean) => void;
  connect: FirmwareConnect;
  onConnectChange: (v: FirmwareConnect) => void;
  outcome: FirmwareOutcome;
  onOutcomeChange: (v: FirmwareOutcome) => void;
}) {
  const CONNECTS: { value: FirmwareConnect; label: string }[] = [
    { value: 'success', label: '成功' },
    { value: 'fail-ble', label: '蓝牙连不上' },
    { value: 'fail-info', label: '连接后中断' },
  ];
  const OUTCOMES: { value: FirmwareOutcome; label: string }[] = [
    { value: 'success', label: '成功' },
    { value: 'fail-transfer', label: '传输中断' },
    { value: 'fail-verify', label: '校验失败' },
  ];
  return (
    <div className="fixed top-6 left-6 z-40 bg-white border-2 border-gray-300 rounded-lg shadow-2xl p-3 w-[190px]">
      <div className="text-xs font-bold text-gray-700 mb-2 pb-2 border-b border-gray-200">固件升级模拟</div>

      <div className="text-[10px] text-gray-500 mb-1">版本检查结果</div>
      <button
        onClick={() => onHasUpdateChange(!hasUpdate)}
        className={`w-full h-9 px-2.5 rounded text-xs font-bold flex items-center justify-center gap-2 transition-all ${hasUpdate ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        title="切换是否检查到新版本"
      >
        {hasUpdate ? <RefreshCw className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
        <span>{hasUpdate ? '有新版本' : '已是最新'}</span>
      </button>

      <div className="text-[10px] text-gray-500 mt-3 mb-1">进入页面时的电量检查</div>
      <button
        onClick={() => onBatteryOkChange(!batteryOk)}
        className={`w-full h-9 px-2.5 rounded text-xs font-bold flex items-center justify-center gap-2 transition-all ${batteryOk ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-black text-white'}`}
        title="切换电量检查是否通过"
      >
        {batteryOk ? <BatteryFull className="w-4 h-4" /> : <BatteryLow className="w-4 h-4" />}
        <span>{batteryOk ? '电量充足（通过）' : '电量不足（失败）'}</span>
      </button>

      <div className="text-[10px] text-gray-500 mt-3 mb-1">点击 Update 后的二次验证</div>
      <button
        onClick={() => onEnrolledChange(!enrolled)}
        className={`w-full h-9 px-2.5 rounded text-xs font-bold flex items-center justify-center gap-2 transition-all ${enrolled ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        title="切换设备是否已录入指纹"
      >
        {enrolled ? <Fingerprint className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
        <span>{enrolled ? '指纹验证' : 'PIN 验证'}</span>
      </button>

      <div className="text-[10px] text-gray-500 mt-3 mb-1">蓝牙连接结果</div>
      <div className="flex flex-col gap-1">
        {CONNECTS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onConnectChange(value)}
            className={`w-full h-8 px-2.5 rounded text-xs font-bold transition-all ${connect === value ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="text-[10px] text-gray-500 mt-3 mb-1">传输/校验结果</div>
      <div className="flex flex-col gap-1">
        {OUTCOMES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onOutcomeChange(value)}
            className={`w-full h-8 px-2.5 rounded text-xs font-bold transition-all ${outcome === value ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
