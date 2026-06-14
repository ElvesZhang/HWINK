import { Layers } from 'lucide-react';
import { useState } from 'react';

interface VariantSwitcherProps {
  currentVariant: 'A' | 'B' | 'C' | 'D' | 'E';
  onVariantChange: (variant: 'A' | 'B' | 'C' | 'D' | 'E') => void;
  availableVariants: readonly ('A' | 'B' | 'C' | 'D' | 'E')[];
  description?: string;
}

export function VariantSwitcher({ 
  currentVariant, 
  onVariantChange, 
  availableVariants,
  description = 'Design Variants'
}: VariantSwitcherProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (availableVariants.length <= 1) {
    return null; // Don't show if there's only one variant
  }

  return (
    <div className="fixed bottom-6 right-24 z-40">
      {isExpanded ? (
        <div className="bg-white rounded-lg shadow-2xl p-3 border-2 border-gray-300">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-semibold text-gray-700">{description}</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600 text-sm font-bold ml-3"
              title="Collapse"
            >
              ✕
            </button>
          </div>
          
          <div className="flex gap-1.5">
            {availableVariants.map((variant) => (
              <button
                key={variant}
                onClick={() => onVariantChange(variant)}
                className={`
                  w-8 h-8 rounded font-bold text-sm transition-all
                  ${currentVariant === variant 
                    ? 'bg-black text-white shadow-md scale-110' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'}
                `}
                title={`Switch to Variant ${variant}`}
              >
                {variant}
              </button>
            ))}
          </div>

          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-500 text-center">
              Current: <span className="font-bold text-gray-700">Variant {currentVariant}</span>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-indigo-600 text-white px-3 py-2.5 rounded-full shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2 border-2 border-indigo-700"
          title={`Design Variants (Current: ${currentVariant})`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-sm font-bold">{currentVariant}</span>
        </button>
      )}
    </div>
  );
}
