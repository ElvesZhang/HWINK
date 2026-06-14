import { X, Bug } from 'lucide-react';
import { useState } from 'react';
import { PAGE_IDS, type PageKey } from '../config/pageIds';
import type { ActivationStep } from './ActivationPage';

export type SignType = 'transfer' | 'verifyCode' | 'message' | 'blind' | 'contractCall' | 'approve' | 'approveLimit';

type Page = 'home' | 'settings' | 'security' | 'connectivity' | 'general' | 'about'
  | 'change-pin' | 'passphrase' | 'verify-recovery' | 'fingerprint'
  | 'language' | 'lock-screen' | 'auto-lock' | 'storage' | 'bluetooth' | 'nfc'
  | 'firmware-info' | 'firmware-update' | 'download-app' | 'reset-device' | 'history' | 'sign-request' | 'passkey'
  | 'keyboard-showcase' | 'activation' | 'sandbox' | 'lab' | 'lab-gallery' | 'sign-test';

interface DebugPanelProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  statusBarState: {
    walletName: string;
    batteryLevel: number;
    isCharging: boolean;
    nfcEnabled: boolean;
    bluetoothConnected: boolean;
  };
  onStatusBarChange: (state: {
    walletName: string;
    batteryLevel: number;
    isCharging: boolean;
    nfcEnabled: boolean;
    bluetoothConnected: boolean;
  }) => void;
  signType: SignType;
  onSignTypeChange: (type: SignType) => void;
  debugNetwork: string;
  onDebugNetworkChange: (network: string) => void;
  zoomLevel: number;
  onZoomLevelChange: (level: number) => void;
  showDebugId: boolean;
  onShowDebugIdChange: (show: boolean) => void;
  /** Jump to a specific step inside the activation flow. */
  onNavigateActivation: (step: ActivationStep) => void;
  /** Current step inside ActivationPage (used to highlight the matching button). */
  currentActivationStep: ActivationStep;
}

// Pages are rendered in declaration order. Activation steps are inserted
// between 'Main' and the rest (special-cased in the render below) so they
// sit at the front of the panel alongside sign-related entries. Settings
// groups are pushed toward the back since they're touched less often
// during day-to-day prototype work.
const pageGroups = {
  'Main': ['home', 'history', 'sign-request', 'passkey'],
  // Standalone sign-function test harness (a full copy of Sign Request, evolved separately).
  'Sign Test': ['sign-test'],
  // 'Activation' is rendered as a special block, not via this dict —
  // it doesn't map to single Page values but to ActivationPage substeps.
  'Debug Tools': ['keyboard-showcase', 'sandbox', 'lab', 'lab-gallery'],
  'Settings': ['settings', 'security', 'connectivity', 'general', 'about'],
  'Security': ['change-pin', 'passphrase', 'verify-recovery', 'fingerprint'],
  'General': ['language', 'lock-screen', 'auto-lock', 'storage'],
  'Connectivity': ['bluetooth', 'nfc'],
  'About': ['firmware-info', 'firmware-update', 'download-app', 'reset-device'],
};

// Full activation flow step list — kept in chronological order so the
// DebugPanel buttons read like the user's journey. Each click jumps to
// the corresponding step in ActivationPage via onNavigateActivation.
const ACTIVATION_STEPS: ActivationStep[] = [
  'splash',
  'welcome-1',
  'welcome-2',
  'scan-to-connect',
  'choose-path',
  'create-intro',
  'create-length',
  'create-display',
  'create-verify-intro',
  'create-verify',
  'create-done',
  'naming',
  'pin-explain',
  'pin-set',
  'pin-confirm',
  'done',
];

const pageLabels: Record<Page, string> = {
  'home': 'Home',
  'settings': 'Settings Menu',
  'security': 'Security Settings',
  'connectivity': 'Connectivity Settings',
  'general': 'General Settings',
  'about': 'About Settings',
  'change-pin': 'Change PIN',
  'passphrase': 'Passphrase',
  'verify-recovery': 'Verify Recovery',
  'fingerprint': 'Fingerprint',
  'language': 'Language',
  'lock-screen': 'Lock Screen',
  'auto-lock': 'Auto Lock',
  'storage': 'Storage',
  'bluetooth': 'Bluetooth',
  'nfc': 'NFC',
  'firmware-info': 'Firmware Info',
  'firmware-update': 'Firmware Update',
  'download-app': 'Download App',
  'reset-device': 'Reset Device',
  'history': 'Sign History',
  'sign-request': 'Sign Request',
  'passkey': 'Passkey',
  'sign-test': '签名功能测试',
  'keyboard-showcase': 'Keyboard Showcase',
  'sandbox': 'Design Sandbox',
  'lab': 'Design Lab',
  'lab-gallery': 'Lab ▦ Gallery',
  'activation': 'Activation Flow',
};

export function DebugPanel({ currentPage, onNavigate, statusBarState, onStatusBarChange, signType, onSignTypeChange, debugNetwork, onDebugNetworkChange, zoomLevel, onZoomLevelChange, showDebugId, onShowDebugIdChange, onNavigateActivation, currentActivationStep }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'pages' | 'status'>('pages');

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-black text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-colors z-50"
        title="Open Debug Panel"
      >
        <Bug className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-bold text-gray-900">Debug Panel</h2>
            <span className="text-sm text-gray-500">• Current: {pageLabels[currentPage]}</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('pages')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              activeTab === 'pages'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Pages Navigation
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              activeTab === 'status'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Status Bar Controls
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'pages' ? (
            <div className="space-y-3">
              {/* Main group always rendered first */}
              <div>
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Main</h3>
                <div className="grid grid-cols-3 gap-1">
                  {pageGroups['Main'].map((page) => {
                    const pageId = PAGE_IDS[page as PageKey];
                    return (
                      <button
                        key={page}
                        onClick={() => {
                          onNavigate(page as Page);
                          setIsOpen(false);
                        }}
                        title={`#${pageId} — ${pageLabels[page as Page]}`}
                        className={`px-2 py-1 text-left text-xs font-medium rounded border truncate transition-colors ${
                          currentPage === page
                            ? 'bg-blue-100 border-blue-500 text-blue-900'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-[10px] font-mono text-gray-400 mr-1">#{pageId}</span>
                        {pageLabels[page as Page]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Activation flow steps — each step is its own jump target.
                  Buttons set currentPage='activation' AND initialStep=<step> so
                  designers can land in the middle of the flow for review.
                  Highlight uses currentActivationStep (not currentPage) since
                  every step shares the same page value. */}
              <div>
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Activation
                </h3>
                <div className="grid grid-cols-3 gap-1">
                  {ACTIVATION_STEPS.map((step) => {
                    const isCurrent = currentPage === 'activation' && currentActivationStep === step;
                    return (
                      <button
                        key={step}
                        onClick={() => {
                          onNavigateActivation(step);
                          setIsOpen(false);
                        }}
                        title={`activation: ${step}`}
                        className={`px-2 py-1 text-left text-xs font-mono rounded border truncate transition-colors ${
                          isCurrent
                            ? 'bg-blue-100 border-blue-500 text-blue-900'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                        }`}
                      >
                        {step}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Remaining groups (Debug Tools, Settings, Security, etc.) in pageGroups declaration order */}
              {Object.entries(pageGroups).filter(([k]) => k !== 'Main').map(([groupName, pages]) => (
                <div key={groupName}>
                  <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                    {groupName}
                  </h3>
                  <div className="grid grid-cols-3 gap-1">
                    {pages.map((page) => {
                      const pageId = PAGE_IDS[page as PageKey];
                      return (
                        <button
                          key={page}
                          onClick={() => {
                            onNavigate(page as Page);
                            setIsOpen(false);
                          }}
                          title={`#${pageId} — ${pageLabels[page as Page]}`}
                          className={`px-2 py-1 text-left text-xs font-medium rounded border truncate transition-colors ${
                            currentPage === page
                              ? 'bg-blue-100 border-blue-500 text-blue-900'
                              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-[10px] font-mono text-gray-400 mr-1">#{pageId}</span>
                          {pageLabels[page as Page]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Network Name Override */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Network Override <span className="text-gray-400 normal-case">(sign request)</span>
                </h3>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {([
                    { value: '', label: 'Default' },
                    { value: 'BSC', label: 'BSC' },
                    { value: 'Ethereum', label: 'Ethereum' },
                    { value: 'Polygon', label: 'Polygon' },
                    { value: 'Arbitrum One', label: 'Arbitrum One' },
                    { value: 'Avalanche C-Chain', label: 'Avalanche C' },
                    { value: 'Polygon zkEVM', label: 'Polygon zkEVM' },
                    { value: 'BNB Smart Chain', label: 'BNB Smart Chain' },
                  ]).map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => onDebugNetworkChange(value)}
                      className={`p-1.5 text-center text-xs font-medium rounded border-2 transition-all truncate ${
                        debugNetwork === value
                          ? 'bg-teal-100 border-teal-500 text-teal-900'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-teal-50 hover:border-teal-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Custom network name..."
                  value={debugNetwork}
                  onChange={(e) => onDebugNetworkChange(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border-2 border-gray-300 rounded focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Wallet Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Wallet Name
                </label>
                <input
                  type="text"
                  value={statusBarState.walletName}
                  onChange={(e) => onStatusBarChange({ ...statusBarState, walletName: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Battery Level */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Battery Level: {statusBarState.batteryLevel}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={statusBarState.batteryLevel}
                  onChange={(e) => onStatusBarChange({ ...statusBarState, batteryLevel: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex gap-2 mt-2">
                  {[10, 25, 50, 75, 100].map((level) => (
                    <button
                      key={level}
                      onClick={() => onStatusBarChange({ ...statusBarState, batteryLevel: level })}
                      className="flex-1 py-1 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
                    >
                      {level}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle Switches */}
              <div className="space-y-3">
                {/* Charging */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded border-2 border-gray-200">
                  <span className="text-sm font-semibold text-gray-700">Charging</span>
                  <button
                    onClick={() => onStatusBarChange({ ...statusBarState, isCharging: !statusBarState.isCharging })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      statusBarState.isCharging ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        statusBarState.isCharging ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* NFC */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded border-2 border-gray-200">
                  <span className="text-sm font-semibold text-gray-700">NFC Enabled</span>
                  <button
                    onClick={() => onStatusBarChange({ ...statusBarState, nfcEnabled: !statusBarState.nfcEnabled })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      statusBarState.nfcEnabled ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        statusBarState.nfcEnabled ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* Bluetooth */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded border-2 border-gray-200">
                  <span className="text-sm font-semibold text-gray-700">Bluetooth Connected</span>
                  <button
                    onClick={() => onStatusBarChange({ ...statusBarState, bluetoothConnected: !statusBarState.bluetoothConnected })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      statusBarState.bluetoothConnected ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        statusBarState.bluetoothConnected ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* Show Debug ID */}
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded border-2 border-purple-300">
                  <span className="text-sm font-semibold text-gray-700">Show Debug ID</span>
                  <button
                    onClick={() => onShowDebugIdChange(!showDebugId)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      showDebugId ? 'bg-purple-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        showDebugId ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Quick Presets */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quick Presets
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onStatusBarChange({
                      walletName: 'Elves-5DW',
                      batteryLevel: 78,
                      isCharging: false,
                      nfcEnabled: true,
                      bluetoothConnected: false,
                    })}
                    className="p-2 text-sm font-medium bg-green-50 hover:bg-green-100 border-2 border-green-300 rounded"
                  >
                    Default State
                  </button>
                  <button
                    onClick={() => onStatusBarChange({
                      walletName: 'TestWallet',
                      batteryLevel: 15,
                      isCharging: true,
                      nfcEnabled: false,
                      bluetoothConnected: true,
                    })}
                    className="p-2 text-sm font-medium bg-orange-50 hover:bg-orange-100 border-2 border-orange-300 rounded"
                  >
                    Low Battery + Charging
                  </button>
                  <button
                    onClick={() => onStatusBarChange({
                      walletName: 'Full-Connect',
                      batteryLevel: 100,
                      isCharging: false,
                      nfcEnabled: true,
                      bluetoothConnected: true,
                    })}
                    className="p-2 text-sm font-medium bg-blue-50 hover:bg-blue-100 border-2 border-blue-300 rounded"
                  >
                    All Connected
                  </button>
                  <button
                    onClick={() => onStatusBarChange({
                      walletName: 'Airplane',
                      batteryLevel: 50,
                      isCharging: false,
                      nfcEnabled: false,
                      bluetoothConnected: false,
                    })}
                    className="p-2 text-sm font-medium bg-gray-50 hover:bg-gray-100 border-2 border-gray-300 rounded"
                  >
                    All Disconnected
                  </button>
                </div>
              </div>

              {/* Zoom Level */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Zoom Level: {zoomLevel}%
                </label>
                <input
                  type="range"
                  min="30"
                  max="200"
                  value={zoomLevel}
                  onChange={(e) => onZoomLevelChange(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex gap-2 mt-2">
                  {[50, 75, 100, 125, 150, 175, 200].map((level) => (
                    <button
                      key={level}
                      onClick={() => onZoomLevelChange(level)}
                      className="flex-1 py-1 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
                    >
                      {level}%
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    onClick={() => onZoomLevelChange(100)}
                    className="p-2 text-sm font-medium bg-blue-50 hover:bg-blue-100 border-2 border-blue-300 rounded"
                  >
                    💻 Normal (100%)
                  </button>
                  <button
                    onClick={() => onZoomLevelChange(40)}
                    className="p-2 text-sm font-medium bg-amber-50 hover:bg-amber-100 border-2 border-amber-400 rounded"
                  >
                    📱 ~3" Physical (40%)
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Use 40% to approximate the actual 3-inch screen size
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}