import { KeyRound } from 'lucide-react';
import { useState } from 'react';

/**
 * Dev-only trigger panel for the Passkey page. On real hardware these requests
 * arrive over BLE/NFC/USB from a host — the device never has buttons that
 * originate them, so they live outside the device frame like the other
 * floating switchers (SignTypeSwitcher / SecondFactorToggle).
 *
 *  - Sign-In / Register : simulate an incoming FIDO2 request
 *  - Clear / Restore    : empty or refill the credential store, to preview the
 *                         "no passkeys yet" state
 */
export function PasskeyDemoSwitcher({
  onSignIn,
  onRegister,
  onClear,
  onRestore,
  hasKeys,
}: {
  onSignIn: () => void;
  onRegister: () => void;
  onClear: () => void;
  onRestore: () => void;
  hasKeys: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-24 right-24 z-40">
      {isExpanded ? (
        <div className="bg-white rounded-lg shadow-2xl p-3 border-2 border-gray-300 w-[200px]">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-semibold text-gray-700">Passkey 模拟</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600 text-sm font-bold ml-3"
              title="Collapse"
            >
              ✕
            </button>
          </div>

          <div className="text-[10px] text-gray-500 mb-1">来访请求（BLE/NFC/USB）</div>
          <div className="flex gap-1.5">
            <button
              onClick={onSignIn}
              disabled={!hasKeys}
              className={`flex-1 h-9 rounded text-xs font-bold transition-all ${
                hasKeys
                  ? 'bg-gray-100 text-gray-700 hover:bg-purple-100'
                  : 'bg-gray-50 text-gray-300 cursor-not-allowed'
              }`}
              title={hasKeys ? '模拟登录请求' : '没有凭据可用于登录'}
            >
              登录
            </button>
            <button
              onClick={onRegister}
              className="flex-1 h-9 rounded text-xs font-bold bg-gray-100 text-gray-700 hover:bg-purple-100 transition-all"
              title="模拟注册请求"
            >
              注册
            </button>
          </div>

          <div className="text-[10px] text-gray-500 mt-3 mb-1">凭据存储</div>
          <button
            onClick={hasKeys ? onClear : onRestore}
            className="w-full h-9 rounded text-xs font-bold bg-gray-100 text-gray-700 hover:bg-purple-100 transition-all"
            title={hasKeys ? '清空以预览空状态' : '恢复演示数据'}
          >
            {hasKeys ? '清空（看空状态）' : '恢复演示数据'}
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-purple-600 text-white px-3 py-2.5 rounded-full shadow-lg hover:bg-purple-700 transition-all flex items-center gap-2 border-2 border-purple-700"
          title="Passkey 模拟请求"
        >
          <KeyRound className="w-5 h-5" />
          <span className="text-xs font-bold">Passkey</span>
        </button>
      )}
    </div>
  );
}
