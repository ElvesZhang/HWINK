import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PageDebugId } from './PageDebugId';
import { SettingsItem } from './SettingsItem';

interface AboutSettingsProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
  showDebugId?: boolean;
}

export function AboutSettings({ onBack, onNavigate, showDebugId }: AboutSettingsProps) {
  return (
    <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
      <PageDebugId page="about" showDebugId={showDebugId} />
      {/* Header */}
      <div className="h-[45px] px-5 flex items-center border-b-2 border-black flex-shrink-0">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
          <span className="text-lg font-bold text-black uppercase tracking-wide">About</span>
        </button>
      </div>

      {/* Settings List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          <SettingsItem 
            title="Firmware Info" 
            subtitle="Device model and version"
            onClick={() => onNavigate('firmware-info')}
          />
          <SettingsItem 
            title="Check for Updates" 
            subtitle="Update to latest firmware"
            onClick={() => onNavigate('firmware-update')}
          />
          <SettingsItem 
            title="Download Pairing App" 
            subtitle="Get mobile companion app"
            onClick={() => onNavigate('download-app')}
          />
          <SettingsItem 
            title="Reset Device" 
            subtitle="Factory reset" 
            variant="danger"
            onClick={() => onNavigate('reset-device')}
          />
        </div>
      </div>
    </div>
  );
}