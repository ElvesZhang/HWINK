import { ChevronLeft } from 'lucide-react';
import { SettingsCard } from './SettingsCard';
import { PageDebugId } from './PageDebugId';

interface SettingsPageProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
  showDebugId?: boolean;
}

export function SettingsPage({ onBack, onNavigate, showDebugId }: SettingsPageProps) {
  return (
    <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
      <PageDebugId page="settings" showDebugId={showDebugId} />
      {/* Header */}
      <div className="h-[45px] px-5 flex items-center border-b-2 border-black flex-shrink-0">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
          <span className="text-lg font-bold text-black uppercase tracking-wide">Settings</span>
        </button>
      </div>

      {/* Settings Categories - 2x2 Grid */}
      <div className="flex-1 p-5">
        <div className="grid grid-cols-2 gap-4 h-full">
          <SettingsCard
            title="Security"
            icon="shield"
            summary="PIN & recovery"
            onClick={() => onNavigate?.('security')}
          />
          <SettingsCard
            title="Wireless"
            icon="radio"
            summary="Bluetooth & NFC"
            onClick={() => onNavigate?.('connectivity')}
          />
          <SettingsCard
            title="General"
            icon="globe"
            summary="Language & storage"
            onClick={() => onNavigate?.('general')}
          />
          <SettingsCard
            title="About"
            icon="info"
            summary="Firmware & reset"
            onClick={() => onNavigate?.('about')}
          />
        </div>
      </div>
    </div>
  );
}
