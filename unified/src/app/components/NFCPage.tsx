import { useState } from 'react';
import { ChevronLeft, CreditCard, Shield, AlertTriangle, Check, X } from 'lucide-react';
import { PageDebugId } from './PageDebugId';

interface NFCPageProps {
  onBack: () => void;
  showDebugId?: boolean;
}

type BackupState = 'idle' | 'warning' | 'scanning' | 'writing' | 'success' | 'error';

export function NFCPage({ onBack, showDebugId }: NFCPageProps) {
  const [nfcEnabled, setNfcEnabled] = useState(true);
  const [backupState, setBackupState] = useState<BackupState>('idle');
  const [hasBackup, setHasBackup] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleToggleNFC = () => {
    setNfcEnabled(!nfcEnabled);
  };

  const handleStartBackup = () => {
    setBackupState('warning');
  };

  const handleConfirmBackup = () => {
    setBackupState('scanning');
    
    // Simulate NFC card scanning
    setTimeout(() => {
      setBackupState('writing');
      setProgress(0);

      // Simulate writing progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setBackupState('success');
            setHasBackup(true);
            
            setTimeout(() => {
              setBackupState('idle');
            }, 2000);
            
            return 100;
          }
          return prev + 10;
        });
      }, 300);
    }, 2000);
  };

  // Warning screen
  if (backupState === 'warning') {
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <PageDebugId page="nfc" subPage="warning" showDebugId={showDebugId} />
        <div className="h-[45px] px-5 flex items-center border-b-2 border-black flex-shrink-0">
          <button 
            onClick={() => setBackupState('idle')}
            className="flex items-center gap-2 active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
            <span className="text-lg font-bold text-black uppercase tracking-wide">Cancel</span>
          </button>
        </div>

        {/* Signing-screen grammar: left hero + section dividers + action bar. */}
        <div className="flex-1 px-5 pt-4 flex flex-col min-h-0">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-9 h-9 text-black flex-shrink-0" strokeWidth={2} />
            <div className="text-3xl font-bold text-black tracking-tight leading-tight">Security Warning</div>
          </div>

          <div className="h-[2px] bg-black flex-shrink-0 my-3.5" />

          <div>
            <div className="text-lg font-light text-black uppercase tracking-wide leading-none mb-1.5">Important</div>
            <ul className="space-y-1 text-lg text-black leading-snug">
              <li>• Your recovery phrase will be written to an NFC card</li>
              <li>• Store the card in a secure location</li>
              <li>• Anyone with the card can access your wallet</li>
              <li>• Do not lose or share this card</li>
            </ul>
          </div>

          <div className="flex-1" />

          <p className="text-lg font-light text-black leading-snug">
            Have a blank NFC card ready. The backup cannot be undone.
          </p>
        </div>

        {/* Action bar — reject square + primary, mirroring the signing screens. */}
        <div className="mx-4 mt-3 mb-4 pt-3 border-t-2 border-black flex gap-2 flex-shrink-0">
          <button
            onClick={() => setBackupState('idle')}
            className="w-[80px] h-[60px] border-2 border-black rounded-sm hover:bg-black group active:scale-[0.97] transition-all flex items-center justify-center flex-shrink-0"
            aria-label="Cancel"
          >
            <X className="w-6 h-6 text-black group-hover:text-[#838383]" strokeWidth={2.5} />
          </button>
          <button
            onClick={handleConfirmBackup}
            className="flex-1 h-[60px] bg-black rounded-sm hover:bg-[#222] active:scale-[0.97] transition-all flex items-center justify-center"
          >
            <span className="text-lg font-bold text-[#838383] uppercase tracking-wide">I Understand</span>
          </button>
        </div>
      </div>
    );
  }

  // Scanning screen
  if (backupState === 'scanning') {
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <PageDebugId page="nfc" subPage="scanning" showDebugId={showDebugId} />
        <div className="h-[45px] px-5 flex items-center border-b-2 border-black flex-shrink-0">
          <button 
            onClick={() => setBackupState('idle')}
            className="flex items-center gap-2 active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
            <span className="text-lg font-bold text-black uppercase tracking-wide">Cancel</span>
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <CreditCard className="w-24 h-24 text-black mb-6 animate-pulse" strokeWidth={1.5} />
          
          <div className="text-xl font-bold text-black uppercase mb-2 text-center">
            Hold NFC Card to Back
          </div>
          <div className="text-lg text-black text-center px-8 leading-relaxed">
            Place your NFC card on the back of the device and keep it steady.
          </div>
        </div>
      </div>
    );
  }

  // Writing screen
  if (backupState === 'writing') {
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <PageDebugId page="nfc" subPage="writing" showDebugId={showDebugId} />
        <div className="h-[45px] px-5 flex items-center border-b-2 border-black flex-shrink-0">
          <span className="text-lg font-bold text-black uppercase tracking-wide">NFC Backup</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <Shield className="w-24 h-24 text-black mb-6" strokeWidth={1.5} />
          
          <div className="text-xl font-bold text-black uppercase mb-2">Writing Backup</div>
          <div className="text-lg text-black mb-6">Do not remove the card</div>

          {/* Progress Bar */}
          <div className="w-64 h-10 border-2 border-black rounded-sm bg-[#838383] mb-2">
            <div 
              className="h-full bg-black transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-lg font-bold text-black">{progress}%</div>
        </div>
      </div>
    );
  }

  // Success screen
  if (backupState === 'success') {
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <PageDebugId page="nfc" subPage="success" showDebugId={showDebugId} />
        <div className="h-[45px] px-5 flex items-center border-b-2 border-black flex-shrink-0">
          <span className="text-lg font-bold text-black uppercase tracking-wide">NFC Backup</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center mb-4 mx-auto">
              <Check className="w-11 h-11 text-[#838383]" strokeWidth={3} />
            </div>
            <div className="text-2xl font-bold text-black">Backup Complete</div>
            <div className="text-lg text-black mt-2">Recovery phrase saved to card</div>
          </div>
        </div>
      </div>
    );
  }

  // Main NFC page
  return (
    <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
      <PageDebugId page="nfc" subPage="main" showDebugId={showDebugId} />
      {/* Header */}
      <div className="h-[45px] px-5 flex items-center border-b-2 border-black flex-shrink-0">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
          <span className="text-lg font-bold text-black uppercase tracking-wide">NFC</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col">
        {/* NFC Toggle */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-black uppercase">NFC</h2>
            <button
              onClick={handleToggleNFC}
              className={`w-12 h-6 border-2 border-black rounded-sm relative transition-colors flex-shrink-0 ${
                nfcEnabled ? 'bg-black' : 'bg-[#838383]'
              }`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-sm transition-all ${
                nfcEnabled ? 'right-0.5 bg-[#838383]' : 'left-0.5 bg-black'
              }`} />
            </button>
          </div>
          <p className="text-lg font-light text-black">
            {nfcEnabled ? 'NFC is ON' : 'NFC is OFF'}
          </p>
        </div>

        {nfcEnabled && (
          <>
            {/* Section divider — sign-screen rhythm carries the structure. */}
            <div className="h-[2px] bg-black flex-shrink-0 mb-3.5" />

            <div>
              <div className="text-lg font-light text-black uppercase tracking-wide leading-none mb-1.5">NFC Backup</div>
              <p className="text-lg text-black leading-snug">
                Write your recovery phrase to a physical NFC card for secure offline backup.
              </p>

              {hasBackup && (
                <div className="mt-2.5">
                  <div className="text-lg font-light text-black uppercase tracking-wide leading-none mb-1.5">Backup Status</div>
                  <div className="text-xl font-normal text-black flex items-center gap-1.5">
                    <Check className="w-4 h-4" strokeWidth={3} /> Last backup: Just now
                  </div>
                </div>
              )}

              <button
                onClick={handleStartBackup}
                className="w-full h-14 border-2 border-black rounded-sm bg-black text-[#838383] hover:bg-[#838383] hover:text-black active:scale-95 transition-all font-bold text-lg uppercase mt-4"
              >
                {hasBackup ? 'Update Backup Card' : 'Create Backup Card'}
              </button>
            </div>

            <div className="h-[2px] bg-black flex-shrink-0 my-3.5" />

            <div>
              <div className="text-lg font-light text-black uppercase tracking-wide leading-none mb-1.5">Requirements</div>
              <ul className="space-y-1 text-lg text-black leading-snug">
                <li>• Compatible blank NFC card (NTAG216 or higher)</li>
                <li>• Secure storage location</li>
                <li>• Physical access protection</li>
              </ul>
            </div>
          </>
        )}

        {!nfcEnabled && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 border-2 border-dashed border-black rounded-sm flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-12 h-12 text-black" strokeWidth={1.5} />
              </div>
              <div className="text-lg font-bold text-black">NFC is disabled</div>
              <div className="text-lg text-black mt-2">Turn on to use NFC backup</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}