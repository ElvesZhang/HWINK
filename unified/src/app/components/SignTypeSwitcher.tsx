import { FileSignature } from 'lucide-react';
import { useState } from 'react';
import type { SignType } from './DebugPanel';

interface SignTypeSwitcherProps {
  currentType: SignType;
  onTypeChange: (type: SignType) => void;
}

const signTypeLabels: Record<SignType, string> = {
  transfer: 'Transfer',
  approve: 'Approve',
  approveLimit: 'Approve Limit',
  message: 'Message',
  blind: 'Blind Sign',
  contractCall: 'Swap',
};

export function SignTypeSwitcher({ currentType, onTypeChange }: SignTypeSwitcherProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const signTypes: SignType[] = ['transfer', 'approve', 'approveLimit', 'message', 'blind', 'contractCall'];

  return (
    <div className="fixed bottom-24 right-24 z-40">
      {isExpanded ? (
        <div className="bg-white rounded-lg shadow-2xl p-3 border-2 border-gray-300">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <FileSignature className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-semibold text-gray-700">Sign Request Type</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600 text-sm font-bold ml-3"
              title="Collapse"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {signTypes.map((type) => (
              <button
                key={type}
                onClick={() => onTypeChange(type)}
                className={`
                  px-2 py-1.5 rounded text-xs font-bold transition-all whitespace-nowrap
                  ${currentType === type
                    ? 'bg-purple-600 text-white shadow-md scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-purple-100 hover:scale-105'}
                `}
                title={`Switch to ${signTypeLabels[type]}`}
              >
                {signTypeLabels[type]}
              </button>
            ))}
          </div>

          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-500 text-center">
              Current: <span className="font-bold text-gray-700">{signTypeLabels[currentType]}</span>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-purple-600 text-white px-3 py-2.5 rounded-full shadow-lg hover:bg-purple-700 transition-all flex items-center gap-2 border-2 border-purple-700"
          title={`Sign Type (Current: ${signTypeLabels[currentType]})`}
        >
          <FileSignature className="w-5 h-5" />
          <span className="text-xs font-bold">{signTypeLabels[currentType]}</span>
        </button>
      )}
    </div>
  );
}
