import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PageDebugId } from './PageDebugId';
import { SettingsItem } from './SettingsItem';

interface GeneralSettingsProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
  showDebugId?: boolean;
}

export function GeneralSettings({ onBack, onNavigate, showDebugId }: GeneralSettingsProps) {
  return (
    <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
      <PageDebugId page="general" showDebugId={showDebugId} />
      {/* Header */}
      <div className="h-[45px] px-5 flex items-center border-b-2 border-black flex-shrink-0">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
          <span className="text-lg font-bold text-black uppercase tracking-wide">General</span>
        </button>
      </div>

      {/* Settings List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          <SettingsItem 
            title="Language" 
            subtitle="Select display language" 
            onClick={() => onNavigate('language')}
          />
          <SettingsItem 
            title="Lock Screen Image" 
            subtitle="Customize lock screen" 
            onClick={() => onNavigate('lock-screen')}
          />
          <SettingsItem 
            title="Auto-Lock Timer" 
            subtitle="Set auto-lock timeout" 
            onClick={() => onNavigate('auto-lock')}
          />
          <SettingsItem 
            title="Storage Management" 
            subtitle="Manage device storage" 
            onClick={() => onNavigate('storage')}
          />
        </div>
      </div>
    </div>
  );
}