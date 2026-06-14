import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { PageDebugId } from './PageDebugId';
import { SettingsItem } from './SettingsItem';

interface ConnectivitySettingsProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
  showDebugId?: boolean;
}

export function ConnectivitySettings({ onBack, onNavigate, showDebugId }: ConnectivitySettingsProps) {
  return (
    <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
      <PageDebugId page="connectivity" showDebugId={showDebugId} />
      {/* Header */}
      <div className="h-[45px] px-5 flex items-center border-b-2 border-black flex-shrink-0">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
          <span className="text-lg font-bold text-black uppercase tracking-wide">Wireless</span>
        </button>
      </div>

      {/* Settings List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          <SettingsItem 
            title="Bluetooth" 
            subtitle="Pairing and device management" 
            onClick={() => onNavigate('bluetooth')}
          />
          <SettingsItem 
            title="NFC Management" 
            subtitle="Backup to NFC card"
            onClick={() => onNavigate('nfc')}
          />
          {/* Wireless Charging card removed */}
        </div>
      </div>
    </div>
  );
}