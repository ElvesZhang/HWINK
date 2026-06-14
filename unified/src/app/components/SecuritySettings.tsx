import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PageDebugId } from './PageDebugId';
import { SettingsItem } from './SettingsItem';

interface SecuritySettingsProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
  showDebugId?: boolean;
}

export function SecuritySettings({ onBack, onNavigate, showDebugId }: SecuritySettingsProps) {
  return (
    <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
      <PageDebugId page="security" showDebugId={showDebugId} />
      {/* Header */}
      <div className="h-[45px] px-5 flex items-center border-b-2 border-black flex-shrink-0">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
          <span className="text-lg font-bold text-black uppercase tracking-wide">Security</span>
        </button>
      </div>

      {/* Settings List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          <SettingsItem title="Change PIN" subtitle="Modify your security PIN code" onClick={() => onNavigate('change-pin')} />
          <SettingsItem title="Passphrase" subtitle="Optional password for a separate wallet" onClick={() => onNavigate('passphrase')} />
          <SettingsItem title="Verify Recovery Phrase" subtitle="Confirm your backup words" onClick={() => onNavigate('verify-recovery')} />
          <SettingsItem title="NFC Backup" subtitle="Backup to NFC card" onClick={() => onNavigate('nfc')} />
          <SettingsItem title="Fingerprint" subtitle="Manage biometric unlock" onClick={() => onNavigate('fingerprint')} />
        </div>
      </div>
    </div>
  );
}