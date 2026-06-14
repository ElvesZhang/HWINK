import { useState } from 'react';
import { ChevronLeft, Check } from 'lucide-react';
import { PageDebugId } from './PageDebugId';

interface AutoLockTimerPageProps {
  onBack: () => void;
  showDebugId?: boolean;
}

// Selection-list page — matches the LanguagePage standard: single title bar,
// compact rows, filled-black selected state. All options fit without scrolling.
const OPTIONS = [
  { value: '30', label: '30 Seconds', desc: 'High security' },
  { value: '60', label: '1 Minute', desc: 'Balanced' },
  { value: '120', label: '2 Minutes', desc: 'Recommended' },
  { value: '300', label: '5 Minutes', desc: 'Convenient' },
  { value: '600', label: '10 Minutes', desc: 'Low security' },
  { value: '0', label: 'Never', desc: 'Manual lock only' },
];

export function AutoLockTimerPage({ onBack, showDebugId }: AutoLockTimerPageProps) {
  // Default to a real option value (was '5', which matched nothing → no
  // selection shown). 2 Minutes is the recommended default.
  const [selectedTimer, setSelectedTimer] = useState('120');

  return (
    <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
      <PageDebugId page="auto-lock" showDebugId={showDebugId} />
      {/* Header — standard operational title bar (matches Language) */}
      <div className="h-[45px] px-5 flex items-center border-b-2 border-black flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
          <span className="text-lg font-bold text-black uppercase tracking-wide">Auto Lock</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col">
        <p className="text-lg text-black leading-relaxed mb-4">
          Lock the device automatically after this much inactivity.
        </p>

        <div className="space-y-2">
          {OPTIONS.map((opt) => {
            const selected = selectedTimer === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setSelectedTimer(opt.value)}
                className={`w-full px-4 py-3 border-2 border-black rounded-sm flex items-center justify-between transition-all ${
                  selected
                    ? 'bg-black text-[#838383]'
                    : 'bg-[#838383] text-black hover:bg-black hover:text-[#838383]'
                }`}
              >
                <div className="flex items-baseline gap-3">
                  <span className="text-lg font-bold">{opt.label}</span>
                  <span className="text-lg">{opt.desc}</span>
                </div>
                {selected && <Check className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
