import { Fingerprint, Lock } from 'lucide-react';

/**
 * Dev-only toggle: does the device have a fingerprint enrolled?
 * Drives which second factor the Sign confirm asks for (fingerprint vs PIN).
 * Fixed at App root (outside the zoomed device frame), like the other dev switchers.
 */
export function SecondFactorToggle({ enrolled, onChange }: { enrolled: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="fixed top-6 left-6 z-40 bg-white border-2 border-gray-300 rounded-lg shadow-2xl p-3 w-[168px]">
      <div className="text-xs font-bold text-gray-700 mb-2 pb-2 border-b border-gray-200">设备二次验证</div>
      <button
        onClick={() => onChange(!enrolled)}
        className={`w-full h-9 px-2.5 rounded text-xs font-bold flex items-center justify-center gap-2 transition-all ${enrolled ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        title="切换设备是否已录入指纹"
      >
        {enrolled ? <Fingerprint className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
        <span>{enrolled ? '指纹已录入' : '仅 PIN（无指纹）'}</span>
      </button>
      <div className="text-[10px] text-gray-500 mt-2 leading-snug">
        点击 Confirm 后：{enrolled ? '弹出指纹验证' : '呼出 PIN 键盘'}
      </div>
    </div>
  );
}
