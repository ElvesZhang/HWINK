import { ChevronLeft, Trash2 } from 'lucide-react';
import { PageDebugId } from './PageDebugId';

interface StorageManagementPageProps {
  onBack: () => void;
  showDebugId?: boolean;
}

const BREAKDOWN = [
  { name: 'Firmware', desc: 'System files', size: '1.2 GB' },
  { name: 'Wallet Data', desc: 'Keys & accounts', size: '0.8 GB' },
  { name: 'Lock Screens', desc: 'Custom images', size: '0.4 GB' },
];

// Detail-list label/value classes (same as the Sign History details).
const LABEL = 'text-lg font-light text-black uppercase tracking-wide leading-none mb-1.5';

/** Storage as a peer-field list — same pattern as the Sign History details
 *  (quiet light label over a normal-weight value, no boxed cards). The usage
 *  bar and the Clear Cache action are kept. */
export function StorageManagementPage({ onBack, showDebugId }: StorageManagementPageProps) {
  return (
    <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
      <PageDebugId page="storage" showDebugId={showDebugId} />
      {/* Header */}
      <div className="h-[45px] px-5 flex items-center border-b-2 border-black flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
          <span className="text-lg font-bold text-black uppercase tracking-wide">Storage</span>
        </button>
      </div>

      {/* Content — flat fields, gap-4 rhythm */}
      <div className="flex-1 py-4 px-5 flex flex-col gap-4">
        {/* Usage */}
        <div>
          <div className={LABEL}>Used</div>
          <div className="text-2xl font-normal text-black tabular-nums">2.4 GB of 16 GB</div>
          <div className="w-full h-4 border-2 border-black rounded-sm overflow-hidden bg-[#838383] mt-2">
            <div className="h-full bg-black" style={{ width: '15%' }} />
          </div>
          <div className="text-lg font-light text-black mt-1.5">15% used · 13.6 GB free</div>
        </div>

        {/* Breakdown — one field per category */}
        {BREAKDOWN.map(({ name, desc, size }) => (
          <div key={name}>
            <div className={LABEL}>{name}</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-normal text-black tabular-nums">{size}</span>
              <span className="text-lg font-light text-black truncate">{desc}</span>
            </div>
          </div>
        ))}

        {/* Clear Cache — pinned to the bottom */}
        <button className="w-full h-14 border-2 border-black rounded-sm bg-[#838383] hover:bg-black hover:text-[#838383] active:scale-95 transition-all font-bold text-lg uppercase flex items-center justify-center gap-2 mt-auto">
          <Trash2 className="w-5 h-5" strokeWidth={2} />
          Clear Cache
        </button>
      </div>
    </div>
  );
}
