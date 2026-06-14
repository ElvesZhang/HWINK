import { useState } from 'react';
import { Bluetooth, ChevronLeft, Smartphone, Trash2, Loader2 as Loader, Check } from 'lucide-react';
import { PageDebugId } from './PageDebugId';

interface Device {
  id: string;
  name: string;
  connected: boolean;
}

type PairingState = 'idle' | 'scanning' | 'pairing' | 'paired';

const MOCK_DEVICES: Device[] = [
  { id: '1', name: 'SafePal App - iPhone', connected: true },
  { id: '2', name: 'SafePal App - Android', connected: false },
];

const DISCOVERED_DEVICES = [
  { id: 'd1', name: 'Galaxy S24' },
  { id: 'd2', name: 'iPhone 15 Pro' },
];

interface BluetoothPageProps {
  onBack: () => void;
  showDebugId?: boolean;
}

export function BluetoothPage({ onBack, showDebugId }: BluetoothPageProps) {
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true);
  const [devices, setDevices] = useState<Device[]>(MOCK_DEVICES);
  const [pairingState, setPairingState] = useState<PairingState>('idle');
  const [discoveredDevices, setDiscoveredDevices] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleToggleBluetooth = () => {
    setBluetoothEnabled(!bluetoothEnabled);
  };

  const handleStartPairing = () => {
    setPairingState('scanning');
    setDiscoveredDevices([]);

    // Simulate scanning
    setTimeout(() => {
      setDiscoveredDevices(DISCOVERED_DEVICES);
    }, 2000);
  };

  const handlePairDevice = (deviceId: string, deviceName: string) => {
    setSelectedDevice(deviceId);
    setPairingState('pairing');

    // Simulate pairing process
    setTimeout(() => {
      const newDevice: Device = {
        id: `paired-${Date.now()}`,
        name: deviceName,
        connected: true,
      };
      
      setDevices([...devices, newDevice]);
      setPairingState('paired');

      setTimeout(() => {
        setPairingState('idle');
        setDiscoveredDevices([]);
      }, 1500);
    }, 2000);
  };

  const handleDisconnect = (deviceId: string) => {
    setDevices(devices.map(d => 
      d.id === deviceId ? { ...d, connected: false } : d
    ));
  };

  const handleDelete = (deviceId: string) => {
    setDevices(devices.filter(d => d.id !== deviceId));
    setShowDeleteConfirm(null);
  };

  // Delete confirmation screen
  if (showDeleteConfirm) {
    const device = devices.find(d => d.id === showDeleteConfirm);
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <div className="h-[45px] px-5 flex items-center border-b-2 border-black flex-shrink-0">
          <span className="text-lg font-bold text-black uppercase tracking-wide">Confirm Delete</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-5">
          <Trash2 className="w-24 h-24 text-black mb-6" strokeWidth={1.5} />
          
          <div className="text-xl font-bold text-black uppercase mb-2 text-center">
            Remove {device?.name}?
          </div>
          <div className="text-lg text-black mb-6 text-center px-4">
            This device will be unpaired and removed from the list.
          </div>

          <div className="w-full space-y-3">
            <button
              onClick={() => handleDelete(showDeleteConfirm)}
              className="w-full h-14 border-2 border-black rounded-sm bg-black text-[#838383] hover:bg-[#838383] hover:text-black active:scale-95 transition-all font-bold text-lg uppercase"
            >
              Remove
            </button>
            <button
              onClick={() => setShowDeleteConfirm(null)}
              className="w-full h-14 border-2 border-black rounded-sm bg-[#838383] hover:bg-black hover:text-[#838383] active:scale-95 transition-all font-bold text-lg uppercase"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pairing screens
  if (pairingState === 'scanning') {
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <PageDebugId page="bluetooth" subPage="pairing" showDebugId={showDebugId} />
        <div className="h-[45px] px-5 flex items-center border-b-2 border-black flex-shrink-0">
          <button 
            onClick={() => setPairingState('idle')}
            className="flex items-center gap-2 active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
            <span className="text-lg font-bold text-black uppercase tracking-wide">Cancel</span>
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-5">
          <Bluetooth className="w-24 h-24 text-black mb-6" strokeWidth={1.5} />
          
          <div className="text-xl font-bold text-black uppercase mb-2">Scanning...</div>
          <div className="text-lg text-black mb-6">Looking for nearby devices</div>

          <div className="flex items-center gap-2">
            <Loader className="w-5 h-5 text-black animate-spin" strokeWidth={2.5} />
            <span className="text-lg font-bold text-black uppercase">Searching...</span>
          </div>

          {discoveredDevices.length > 0 && (
            <div className="w-full mt-8 space-y-3">
              <div className="text-lg font-bold text-black uppercase">Found Devices:</div>
              {discoveredDevices.map((device) => (
                <button
                  key={device.id}
                  onClick={() => handlePairDevice(device.id, device.name)}
                  className="w-full h-16 border-2 border-black rounded-sm bg-[#838383] hover:bg-black hover:text-[#838383] active:scale-95 transition-all p-4 flex items-center gap-3"
                >
                  <Smartphone className="w-6 h-6 flex-shrink-0" strokeWidth={2} />
                  <div className="flex-1 text-left">
                    <div className="text-lg font-bold">{device.name}</div>
                    <div className="text-lg">Tap to pair</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (pairingState === 'pairing') {
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <div className="h-[45px] px-5 flex items-center border-b-2 border-black flex-shrink-0">
          <span className="text-lg font-bold text-black uppercase tracking-wide">Bluetooth</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <Bluetooth className="w-24 h-24 text-black mb-6 animate-pulse" strokeWidth={1.5} />
          <div className="text-xl font-bold text-black uppercase mb-2">Pairing...</div>
          <div className="text-lg text-black">Connecting to device</div>
        </div>
      </div>
    );
  }

  if (pairingState === 'paired') {
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <PageDebugId page="bluetooth" subPage="paired" showDebugId={showDebugId} />
        <div className="h-[45px] px-5 flex items-center border-b-2 border-black flex-shrink-0">
          <span className="text-lg font-bold text-black uppercase tracking-wide">Bluetooth</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center mb-4 mx-auto">
              <Check className="w-11 h-11 text-[#838383]" strokeWidth={3} />
            </div>
            <div className="text-2xl font-bold text-black">Paired Successfully</div>
            <div className="text-lg text-black mt-2">Device connected</div>
          </div>
        </div>
      </div>
    );
  }

  // Main bluetooth page
  return (
    <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
      <PageDebugId page="bluetooth" subPage="main" showDebugId={showDebugId} />
      {/* Header */}
      <div className="h-[45px] px-5 flex items-center border-b-2 border-black flex-shrink-0">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
          <span className="text-lg font-bold text-black uppercase tracking-wide">Bluetooth</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col">
        {/* Bluetooth Toggle */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-black uppercase">Bluetooth</h2>
            <button
              onClick={handleToggleBluetooth}
              className={`w-12 h-6 border-2 border-black rounded-sm relative transition-colors flex-shrink-0 ${
                bluetoothEnabled ? 'bg-black' : 'bg-[#838383]'
              }`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-sm transition-all ${
                bluetoothEnabled ? 'right-0.5 bg-[#838383]' : 'left-0.5 bg-black'
              }`} />
            </button>
          </div>
          <p className="text-lg text-black">
            {bluetoothEnabled ? 'Bluetooth is ON' : 'Bluetooth is OFF'}
          </p>
        </div>

        {bluetoothEnabled && (
          <>
            {/* Pair New Device Button */}
            <button
              onClick={handleStartPairing}
              className="w-full h-14 border-2 border-black rounded-sm bg-black text-[#838383] hover:bg-[#838383] hover:text-black active:scale-95 transition-all mb-4 flex items-center justify-center gap-2"
            >
              <Bluetooth className="w-5 h-5" strokeWidth={2.5} />
              <span className="font-bold text-lg uppercase">Pair New Device</span>
            </button>

            {/* Paired Devices */}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-black uppercase mb-3">Paired Devices</h3>
              
              {devices.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-lg text-black">No paired devices</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {devices.map((device) => (
                    <div
                      key={device.id}
                      className="border-2 border-black rounded-sm p-3 bg-[#838383]"
                    >
                      {/* Name + status share one line so three paired devices
                          still fit the frame at the 18px floor. */}
                      <div className="flex items-center gap-3 mb-2">
                        <Smartphone className="w-6 h-6 text-black flex-shrink-0" strokeWidth={2} />

                        <div className="flex-1 min-w-0 flex items-baseline gap-2">
                          <div className="text-lg font-bold text-black truncate">{device.name}</div>
                          <div className="text-lg font-light text-black whitespace-nowrap">
                            {device.connected ? 'Connected' : 'Disconnected'}
                          </div>
                        </div>

                        <div className={`w-3 h-3 border-2 border-black ${
                          device.connected ? 'bg-black' : 'bg-[#838383]'
                        }`} />
                      </div>

                      <div className="flex gap-2">
                        {device.connected ? (
                          <button
                            onClick={() => handleDisconnect(device.id)}
                            className="flex-1 h-10 border-2 border-black rounded-sm bg-[#838383] hover:bg-black hover:text-[#838383] active:scale-95 transition-all text-lg font-bold uppercase"
                          >
                            Disconnect
                          </button>
                        ) : (
                          <button
                            className="flex-1 h-10 border-2 border-black rounded-sm bg-[#838383] hover:bg-black hover:text-[#838383] active:scale-95 transition-all text-lg font-bold uppercase"
                          >
                            Connect
                          </button>
                        )}
                        <button
                          onClick={() => setShowDeleteConfirm(device.id)}
                          className="h-10 px-3 border-2 border-black rounded-sm bg-[#838383] hover:bg-black hover:text-[#838383] active:scale-95 transition-all flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {!bluetoothEnabled && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 border-2 border-dashed border-black rounded-sm flex items-center justify-center mx-auto mb-4">
                <Bluetooth className="w-12 h-12 text-black" strokeWidth={1.5} />
              </div>
              <div className="text-lg font-bold text-black">Bluetooth is disabled</div>
              <div className="text-lg text-black mt-2">Turn on to manage devices</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}