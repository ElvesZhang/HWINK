import { Battery, Wifi } from 'lucide-react';
import { MenuCard } from './components/MenuCard';
import { DeviceFrame } from './components/DeviceFrame';
import { StatusBar } from './components/StatusBar';
import { SettingsPage } from './components/SettingsPage';
import { SecuritySettings } from './components/SecuritySettings';
import { ConnectivitySettings } from './components/ConnectivitySettings';
import { GeneralSettings } from './components/GeneralSettings';
import { AboutSettings } from './components/AboutSettings';
import { ChangePINPage } from './components/ChangePINPage';
import { PassphrasePageNew } from './components/PassphrasePageNew';
import { VerifyRecoveryPageNew } from './components/VerifyRecoveryPageNew';
import { FingerprintManagePage } from './components/FingerprintManagePage';
import { LanguagePage } from './components/LanguagePage';
import { LockScreenImagePage } from './components/LockScreenImagePage';
import { AutoLockTimerPage } from './components/AutoLockTimerPage';
import { StorageManagementPage } from './components/StorageManagementPage';
import { BluetoothPage } from './components/BluetoothPage';
import { NFCPage } from './components/NFCPage';
import { FirmwareInfoPage } from './components/FirmwareInfoPage';
import { FirmwareUpdatePage } from './components/FirmwareUpdatePage';
import { DownloadAppPage } from './components/DownloadAppPage';
import { ResetDevicePage } from './components/ResetDevicePage';
import { SignatureHistoryPage } from './components/SignatureHistoryPage';
import { SignRequestPage } from './components/SignRequestPage';
import { PasskeyPage } from './components/PasskeyPage';
import { SignTestPage } from './components/SignTestPage';
import { DebugPanel } from './components/DebugPanel';
import type { SignType } from './components/DebugPanel';
import { useState, useEffect } from 'react';
import { PageDebugId } from './components/PageDebugId';
import { VariantSwitcher } from './components/VariantSwitcher';
import { SignTypeSwitcher } from './components/SignTypeSwitcher';
import { VerifyFontSwitcher, VERIFY_FONTS, type VerifyFont } from './components/VerifyFontSwitcher';
import { SecondFactorToggle } from './components/SecondFactorToggle';
import { FirmwareUpdateToggle, type FirmwareOutcome, type FirmwareConnect } from './components/FirmwareUpdateToggle';
import { KeyboardShowcasePage, type KeyboardVariant } from './components/KeyboardShowcasePage';
import { KeyboardDocsPanel } from './components/KeyboardDocsPanel';
// import { PassphraseDocsPanel } from './components/PassphraseDocsPanel'; // temporarily removed per request
import { SignDetailDocsPanel } from './components/SignDetailDocsPanel';
import type { SignDocsView } from './components/signDocsContent';
import { ActivationPage, type ActivationStep } from './components/ActivationPage';
import { ActivationDocsPanel } from './components/ActivationDocsPanel';
import { VerifyDocsPanel } from './components/VerifyDocsPanel';
import { SandboxPage } from './sandbox/SandboxPage';
import { LabDevice, LabControls, type LabScreen, type LabStyle } from './lab/LabPage';
import { LabGallery } from './lab/LabGallery';

type Page = 'home' | 'settings' | 'security' | 'connectivity' | 'general' | 'about'
  | 'change-pin' | 'passphrase' | 'verify-recovery' | 'fingerprint'
  | 'language' | 'lock-screen' | 'auto-lock' | 'storage' | 'bluetooth' | 'nfc' | 'firmware-info' | 'firmware-update' | 'download-app' | 'reset-device' | 'history' | 'sign-request' | 'passkey'
  | 'keyboard-showcase' | 'activation' | 'sandbox' | 'lab' | 'lab-gallery' | 'sign-test';

/** Dev-only: seed initial state from URL query (?page=lab&lscreen=sign&lstyle=traditional)
 *  so headless screenshots can target a specific Lab screen. No effect when absent. */
function urlInit<T extends string>(key: string, fallback: T): T {
  try { return (new URLSearchParams(window.location.search).get(key) as T) || fallback; }
  catch { return fallback; }
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>(() => urlInit<Page>('page', 'home'));
  // Manual end-state for the Verify Recovery flow (driven by VerifyDocsPanel,
  // outside the device). Mock always passes, so this is how the failure screen
  // is reached for preview.
  const [verifyOutcome, setVerifyOutcome] = useState<'success' | 'fail'>('success');
  // Mock result of the passphrase re-check shown after a failed words check.
  const [verifyPassphraseOutcome, setVerifyPassphraseOutcome] = useState<'pass' | 'fail'>('pass');
  const [nfcBackPage, setNfcBackPage] = useState<'security' | 'connectivity'>('security');
  
  // The wallet's "original" name (no passphrase derived). Used to restore the
  // StatusBar label when the user goes through the passphrase flow with an
  // empty value (= load the bare recovery-phrase wallet, no extra word).
  const ORIGINAL_WALLET_NAME = 'Elves-5DW';

  // Status Bar State
  const [statusBarState, setStatusBarState] = useState({
    walletName: ORIGINAL_WALLET_NAME,
    batteryLevel: 78,
    isCharging: false,
    nfcEnabled: true,
    bluetoothConnected: false,
  });

  const [signType, setSignType] = useState<SignType>(() => urlInit<SignType>('stype', 'transfer'));
  // Current sign screen, mirrored up from SignRequestPage / SignatureHistoryPage
  // so the docs panel documents exactly the screen on the device.
  const [docsView, setDocsView] = useState<SignDocsView | null>(null);
  const [debugNetwork, setDebugNetwork] = useState('');
  const [signLayoutVariant, setSignLayoutVariant] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('E');
  // Device has a fingerprint enrolled? Drives the Sign confirm second factor
  // (fingerprint scan vs PIN keypad). Toggle via the dev SecondFactorToggle.
  const [fingerprintEnrolled, setFingerprintEnrolled] = useState(true);
  // Has the one-time "set up fingerprint?" prompt (after first PIN) been shown?
  const [fingerprintPrompted, setFingerprintPrompted] = useState(false);

  // Firmware Update dev sim (FirmwareUpdateToggle): the app's version-check
  // result, the on-entry battery check, and how the transfer/verify phases
  // end. All default to the "happy path".
  const [firmwareHasUpdate, setFirmwareHasUpdate] = useState(true);
  const [firmwareBatteryOk, setFirmwareBatteryOk] = useState(true);
  const [firmwareConnect, setFirmwareConnect] = useState<FirmwareConnect>('success');
  const [firmwareOutcome, setFirmwareOutcome] = useState<FirmwareOutcome>('success');
  
  // Zoom State (100% = normal, 40% ≈ 3-inch physical size)
  const [zoomLevel, setZoomLevel] = useState(100);

  // True 1-bit preview: threshold the screen to pure black/white, approximating
  // the 2-color e-ink panel (no anti-aliasing). Toggle in DebugPanel or ?bit=1.
  const [bitPreview, setBitPreview] = useState<boolean>(() => urlInit('bit', '') === '1');

  // Dev-only: font for the big Verify Code, for comparing 1-bit legibility.
  const [verifyFont, setVerifyFont] = useState<VerifyFont>(() => urlInit<VerifyFont>('vfont', 'default'));

  // Debug ID visibility
  const [showDebugId, setShowDebugId] = useState(true);

  // Design Lab (editorial redesign) — controls live OUTSIDE the device frame.
  const [labScreen, setLabScreen] = useState<LabScreen>(() => urlInit<LabScreen>('lscreen', 'home'));
  const [labStyle, setLabStyle] = useState<LabStyle>(() => urlInit<LabStyle>('lstyle', 'traditional'));

  // Preview controls (test harness, outside the device frame)

  // Keyboard showcase test-harness state (only used on the keyboard-showcase page)
  const [keyboardVariant, setKeyboardVariant] = useState<KeyboardVariant>('pin');
  const [pinRandomized, setPinRandomized] = useState(false);
  const [pinMaxLength, setPinMaxLength] = useState(6);
  // Prefix injection counter — bumping this remounts the showcase so the keyboard
  // resets with a fresh starting value (used by the BIP39 docs panel to demo
  // disabled-letter + suggestion behaviour without making the user type first).
  const [bip39Prefix, setBip39Prefix] = useState('');
  const [bip39PrefixNonce, setBip39PrefixNonce] = useState(0);

  // Activation flow (first-boot) state. When `firstBoot` is true, the renderer
  // intercepts navigation and forces the Activation page regardless of currentPage.
  // `activationStep` is surfaced from the page so the docs panel can highlight
  // which sub-step is currently visible.
  const [firstBoot, setFirstBoot] = useState(false);
  const [activationStep, setActivationStep] = useState<ActivationStep>('splash');
  // Bump to force ActivationPage to remount when firstBoot toggles OR when
  // DebugPanel jumps to a specific step. Mounted state restarts with
  // `activationInitialStep` as the entry point.
  const [activationNonce, setActivationNonce] = useState(0);
  const [activationInitialStep, setActivationInitialStep] = useState<ActivationStep>('splash');

  const handleActivationNavigate = (step: ActivationStep) => {
    setActivationInitialStep(step);
    setActivationStep(step);
    setActivationNonce((n) => n + 1);
    setCurrentPage('activation');
  };
  
  // When firstBoot is on, intercept all navigation and force the activation
  // page. The user (or DebugPanel) can still set currentPage to whatever they
  // want, but the screen always shows ActivationPage until firstBoot clears.
  const effectivePage: Page = firstBoot ? 'activation' : currentPage;

  // Clear the docs view when leaving the sign-request / history pages so the
  // panel doesn't flash a stale screen's docs on re-entry.
  useEffect(() => {
    if (effectivePage !== 'sign-request' && effectivePage !== 'history') setDocsView(null);
  }, [effectivePage]);

  const renderPage = () => {
    switch (effectivePage) {
      case 'settings':
        return <SettingsPage onBack={() => setCurrentPage('home')} onNavigate={(page) => setCurrentPage(page as Page)} showDebugId={showDebugId} />;
      case 'security':
        return <SecuritySettings onBack={() => setCurrentPage('settings')} onNavigate={(page) => {
          if (page === 'nfc') {
            setNfcBackPage('security');
          }
          setCurrentPage(page as Page);
        }} showDebugId={showDebugId} />;
      case 'connectivity':
        return <ConnectivitySettings onBack={() => setCurrentPage('settings')} onNavigate={(page) => {
          if (page === 'nfc') {
            setNfcBackPage('connectivity');
          }
          setCurrentPage(page as Page);
        }} showDebugId={showDebugId} />;
      case 'general':
        return <GeneralSettings onBack={() => setCurrentPage('settings')} onNavigate={(page) => setCurrentPage(page as Page)} showDebugId={showDebugId} />;
      case 'about':
        return <AboutSettings onBack={() => setCurrentPage('settings')} onNavigate={(page) => setCurrentPage(page as Page)} showDebugId={showDebugId} />;
      case 'change-pin':
        return <ChangePINPage onBack={() => setCurrentPage('security')} randomized={true} showDebugId={showDebugId} />;
      case 'passphrase':
        return (
          <PassphrasePageNew
            onBack={() => setCurrentPage('security')}
            onCompleteToHome={(newWalletName) => {
              // Device cannot know "is a passphrase active" — each setup just
              // derives a new wallet name in the StatusBar and routes home.
              // Empty string from child = "load original recovery-phrase wallet"
              // → restore the StatusBar label to ORIGINAL_WALLET_NAME.
              setStatusBarState(s => ({
                ...s,
                walletName: newWalletName.length === 0 ? ORIGINAL_WALLET_NAME : newWalletName,
              }));
              setCurrentPage('home');
            }}
            showDebugId={showDebugId}
          />
        );
      case 'verify-recovery':
        return <VerifyRecoveryPageNew onBack={() => setCurrentPage('security')} outcome={verifyOutcome} passphraseOutcome={verifyPassphraseOutcome} showDebugId={showDebugId} />;
      case 'fingerprint':
        return <FingerprintManagePage onBack={() => setCurrentPage('security')} showDebugId={showDebugId} />;
      case 'language':
        return <LanguagePage onBack={() => setCurrentPage('general')} showDebugId={showDebugId} />;
      case 'lock-screen':
        return <LockScreenImagePage onBack={() => setCurrentPage('general')} showDebugId={showDebugId} />;
      case 'auto-lock':
        return <AutoLockTimerPage onBack={() => setCurrentPage('general')} showDebugId={showDebugId} />;
      case 'storage':
        return <StorageManagementPage onBack={() => setCurrentPage('general')} showDebugId={showDebugId} />;
      case 'bluetooth':
        return <BluetoothPage onBack={() => setCurrentPage('connectivity')} showDebugId={showDebugId} />;
      case 'nfc':
        return <NFCPage onBack={() => setCurrentPage(nfcBackPage)} showDebugId={showDebugId} />;
      case 'firmware-info':
        return <FirmwareInfoPage onBack={() => setCurrentPage('about')} showDebugId={showDebugId} />;
      case 'firmware-update':
        // Keyed on the sim switches: the battery gate runs at mount, so a
        // toggle change restarts the flow from the entry check.
        return <FirmwareUpdatePage key={`${firmwareBatteryOk}-${firmwareHasUpdate}-${firmwareConnect}-${firmwareOutcome}`} onBack={() => setCurrentPage('about')} onCompleteToHome={() => setCurrentPage('home')} showDebugId={showDebugId} fingerprintEnrolled={fingerprintEnrolled} simulateHasUpdate={firmwareHasUpdate} simulateBatteryOk={firmwareBatteryOk} simulateConnect={firmwareConnect} simulateOutcome={firmwareOutcome} />;
      case 'download-app':
        return <DownloadAppPage onBack={() => setCurrentPage('about')} showDebugId={showDebugId} />;
      case 'reset-device':
        return <ResetDevicePage onBack={() => setCurrentPage('about')} showDebugId={showDebugId} />;
      case 'history':
        return <SignatureHistoryPage onBack={() => setCurrentPage('home')} onDocsViewChange={setDocsView} />;
      case 'sign-request':
        return <SignRequestPage onBack={() => setCurrentPage('home')} signType={signType} debugNetwork={debugNetwork} layoutVariant={signLayoutVariant} fingerprintEnrolled={fingerprintEnrolled} fingerprintPrompted={fingerprintPrompted} onFingerprintPromptDone={(enable) => { setFingerprintPrompted(true); if (enable) { setFingerprintEnrolled(true); setCurrentPage('fingerprint'); } }} showDebugId={showDebugId} onDocsViewChange={setDocsView} verifyFont={verifyFont} />;
      case 'sign-test':
        return <SignTestPage onBack={() => setCurrentPage('home')} showDebugId={showDebugId} />;
      case 'keyboard-showcase':
        return (
          <KeyboardShowcasePage
            key={`${keyboardVariant}-${bip39PrefixNonce}`}
            onBack={() => setCurrentPage('home')}
            variant={keyboardVariant}
            pinRandomized={pinRandomized}
            pinMaxLength={pinMaxLength}
            initialTextValue={keyboardVariant === 'bip39' ? bip39Prefix : ''}
          />
        );
      case 'activation':
        return (
          <ActivationPage
            key={activationNonce}
            initialStep={activationInitialStep}
            onComplete={() => {
              setFirstBoot(false);
              setCurrentPage('home');
            }}
            onStepChange={setActivationStep}
          />
        );
      case 'passkey':
        return <PasskeyPage onBack={() => setCurrentPage('home')} showDebugId={showDebugId} />;
      case 'sandbox':
        return (
          <SandboxPage
            onBack={() => setCurrentPage('home')}
            showDebugId={showDebugId}
          />
        );
      case 'lab':
        return <LabDevice screen={labScreen} style={labStyle} />;
      case 'home':
      default:
        return (
          <>
            <StatusBar 
              walletName={statusBarState.walletName}
              batteryLevel={statusBarState.batteryLevel}
              isCharging={statusBarState.isCharging}
              nfcEnabled={statusBarState.nfcEnabled}
              bluetoothConnected={statusBarState.bluetoothConnected}
            />
            <div className="flex-1 flex flex-col p-5">
              <div className="grid grid-cols-2 gap-4 flex-1">
                <MenuCard title="Assets" icon="wallet" />
                <MenuCard title="Sign History" icon="history" onClick={() => setCurrentPage('history')} />
                <MenuCard title="Passkey" subtitle="FIDO2" icon="key" onClick={() => setCurrentPage('passkey')} />
                <MenuCard title="Settings" icon="settings" onClick={() => setCurrentPage('settings')} />
              </div>
            </div>
            <PageDebugId page="home" showDebugId={showDebugId} />
          </>
        );
    }
  };

  return (
    <div className={effectivePage === 'lab-gallery'
      ? 'relative min-h-screen bg-gray-200'
      : 'flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8'}>
      {effectivePage === 'lab-gallery' ? (
        <LabGallery
          screen={labScreen}
          onScreen={setLabScreen}
          onPick={(s) => { setLabStyle(s); setCurrentPage('lab'); }}
          onExit={() => setCurrentPage('lab')}
        />
      ) : (
        <div style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center', transition: 'transform 0.3s ease' }}>
          {/* Hidden SVG filter powering the 1-bit preview: hard-threshold every
              pixel to one of the panel's TWO tones — black ink or the #838383
              base (0x83/255 ≈ 0.5137) — so anti-aliasing disappears but the base
              colour is kept (not forced to white). Applied to the screen only, so
              the bezel stays normal. View at 100% zoom — scaling re-softens edges. */}
          <svg width="0" height="0" className="absolute" aria-hidden="true">
            <filter id="eink-1bit" colorInterpolationFilters="sRGB">
              <feColorMatrix type="matrix" values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0" />
              <feComponentTransfer>
                <feFuncR type="discrete" tableValues="0 0.5137" />
                <feFuncG type="discrete" tableValues="0 0.5137" />
                <feFuncB type="discrete" tableValues="0 0.5137" />
              </feComponentTransfer>
            </filter>
          </svg>
          <DeviceFrame>
            <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col relative" style={{ ...(bitPreview ? { filter: 'url(#eink-1bit)' } : {}), fontFamily: VERIFY_FONTS[verifyFont].family }}>
              {renderPage()}
            </div>
          </DeviceFrame>
        </div>
      )}

      {/* {effectivePage === 'passphrase' && <PassphraseDocsPanel />} — outer docs panel temporarily removed per request */}

      {effectivePage === 'verify-recovery' && <VerifyDocsPanel outcome={verifyOutcome} onOutcomeChange={setVerifyOutcome} passphraseOutcome={verifyPassphraseOutcome} onPassphraseOutcomeChange={setVerifyPassphraseOutcome} />}

      {(effectivePage === 'sign-request' || effectivePage === 'history') && <SignDetailDocsPanel view={docsView} />}

      {effectivePage === 'activation' && (
        <ActivationDocsPanel
          firstBoot={firstBoot}
          onFirstBootChange={(v) => {
            setFirstBoot(v);
            setActivationNonce((n) => n + 1);
            // When turning firstBoot OFF and we're stuck on the activation page,
            // route the user back home so they see something meaningful.
            if (!v && currentPage === 'activation') {
              setCurrentPage('home');
            }
            // When turning ON, ensure we land on activation page navigation too.
            if (v) {
              setCurrentPage('activation');
            }
          }}
          currentStep={activationStep}
        />
      )}

      {effectivePage === 'keyboard-showcase' && (
        <KeyboardDocsPanel
          variant={keyboardVariant}
          onVariantChange={setKeyboardVariant}
          pinRandomized={pinRandomized}
          pinMaxLength={pinMaxLength}
          onPinRandomizedChange={setPinRandomized}
          onPinMaxLengthChange={setPinMaxLength}
          bip39Prefix={bip39Prefix}
          onBip39PrefixSet={(prefix) => {
            setBip39Prefix(prefix);
            setBip39PrefixNonce((n) => n + 1);
          }}
        />
      )}
      
      {/* Debug Panel */}
      <DebugPanel
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        statusBarState={statusBarState}
        onStatusBarChange={setStatusBarState}
        signType={signType}
        onSignTypeChange={setSignType}
        debugNetwork={debugNetwork}
        onDebugNetworkChange={setDebugNetwork}
        zoomLevel={zoomLevel}
        onZoomLevelChange={setZoomLevel}
        bitPreview={bitPreview}
        onBitPreviewChange={setBitPreview}
        showDebugId={showDebugId}
        onShowDebugIdChange={setShowDebugId}
        onNavigateActivation={handleActivationNavigate}
        currentActivationStep={activationStep}
      />
      
      {/* Sign Type Switcher - Only show on Sign Request page */}
      {effectivePage === 'sign-request' && (
        <SignTypeSwitcher
          currentType={signType}
          onTypeChange={setSignType}
        />
      )}

      {/* Variant Switcher - Only show on Sign Request page */}
      {effectivePage === 'sign-request' && (
        <VariantSwitcher
          currentVariant={signLayoutVariant}
          onVariantChange={setSignLayoutVariant}
          availableVariants={['A', 'B', 'C', 'D', 'E']}
          description="Sign Request Layout"
        />
      )}

      {/* Second-factor (fingerprint vs PIN) toggle - Only on Sign Request page */}
      {effectivePage === 'sign-request' && (
        <SecondFactorToggle enrolled={fingerprintEnrolled} onChange={(v) => { setFingerprintEnrolled(v); setFingerprintPrompted(false); }} />
      )}

      {/* Firmware Update sim toggles (version check + battery + 2nd factor + outcome) */}
      {effectivePage === 'firmware-update' && (
        <FirmwareUpdateToggle
          hasUpdate={firmwareHasUpdate}
          onHasUpdateChange={setFirmwareHasUpdate}
          batteryOk={firmwareBatteryOk}
          onBatteryOkChange={setFirmwareBatteryOk}
          enrolled={fingerprintEnrolled}
          onEnrolledChange={(v) => { setFingerprintEnrolled(v); setFingerprintPrompted(false); }}
          connect={firmwareConnect}
          onConnectChange={setFirmwareConnect}
          outcome={firmwareOutcome}
          onOutcomeChange={setFirmwareOutcome}
        />
      )}

      {/* Verify Code font switcher - Only on Sign Request page (1-bit font compare) */}
      {effectivePage === 'sign-request' && (
        <VerifyFontSwitcher currentFont={verifyFont} onFontChange={setVerifyFont} />
      )}

      {/* Design Lab controls — OUTSIDE the device so the prototype screen stays clean */}
      {effectivePage === 'lab' && (
        <LabControls
          screen={labScreen}
          onScreen={setLabScreen}
          style={labStyle}
          onStyle={setLabStyle}
          onOpenGallery={() => setCurrentPage('lab-gallery')}
        />
      )}
    </div>
  );
}