import { useState, useRef, useEffect, type ReactNode } from 'react';
import {
  ChevronLeft, ChevronRight, AlertTriangle, Check, X, Loader2,
  Smartphone, ArrowDown, RotateCw, ShieldCheck,
} from 'lucide-react';
import { PageDebugId } from './PageDebugId';
import { FingerprintVerifyPage } from './FingerprintVerifyPage';
import { ChangePINPage } from './ChangePINPage';

interface FirmwareUpdatePageProps {
  onBack: () => void;
  showDebugId?: boolean;
  /** Device has a fingerprint enrolled? Drives the second factor on "Update"
   *  (fingerprint scan vs PIN keypad) — same rule as the Sign confirm. */
  fingerprintEnrolled?: boolean;
  /** Prototype sim: did the version check find a newer firmware? */
  simulateHasUpdate?: boolean;
  /** Prototype sim: does the on-Continue battery check pass? */
  simulateBatteryOk?: boolean;
}

// ── Bluetooth firmware-update flow (device-side screens) ──
// The phone app does the heavy lifting (checking versions, downloading the
// firmware blob, streaming it over BLE). The device shows passive waiting
// states for those phases, then owns the security-critical bits: confirming
// what it's about to receive, verifying the signature, and rebooting.
//
//   preflight → (battery-low | connect)
//   connect → checking → (up-to-date | confirm)
//   confirm → verify (PIN/fingerprint) → transferring → installing → restarting → success
//   failures: battery-low | failed-connect | failed-transfer | failed-verify
type UpdateStep =
  | 'preflight' | 'battery-low' | 'connect' | 'checking'
  | 'up-to-date'
  | 'confirm' | 'verify'
  | 'transferring' | 'installing' | 'restarting' | 'success'
  | 'failed-connect' | 'failed-transfer' | 'failed-verify';

const CURRENT_VERSION = 'v2.1.5';
const NEW_VERSION = 'v2.2.0';

// Release notes for the confirm screen. Paged by whole items (a bullet is never
// split across pages), 4 per page — same inline section pager as the Message
// signing screen.
const WHATS_NEW = [
  '- New chain support and address types',
  '- Faster transaction signing',
  '- Security hardening',
  '- Improved Bluetooth pairing stability',
  '- Clearer signing screens for token approvals',
  '- Fingerprint unlock improvements',
  '- NFC backup card compatibility fixes',
  '- Reduced e-ink refresh artifacts',
  '- General bug fixes and performance',
];
const WN_PER_PAGE = 4;

// ── Prototype simulation switches ──
// "Has update" and "battery ok" are now driven by the FirmwareUpdateToggle dev
// panel (props). The transfer/verify outcome stays a module constant.
const SIMULATE_OUTCOME: 'success' | 'fail-transfer' | 'fail-verify' = 'success';

const PRESS = 'active:bg-black active:text-[#838383]';
const BTN_BASE = `h-14 border-2 border-black rounded-sm bg-[#838383] hover:bg-black hover:text-[#838383] ${PRESS} font-bold text-lg`;
const BTN_PRIMARY = `h-14 border-2 border-black rounded-sm bg-black text-[#838383] hover:bg-[#838383] hover:text-black ${PRESS} font-bold text-lg`;

export function FirmwareUpdatePage({
  onBack,
  showDebugId,
  fingerprintEnrolled = true,
  simulateHasUpdate = true,
  simulateBatteryOk = true,
}: FirmwareUpdatePageProps) {
  const [step, setStep] = useState<UpdateStep>('preflight');
  const [progress, setProgress] = useState(0);
  const [wnPage, setWnPage] = useState(0); // "What's new" pager on the confirm screen
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervals = useRef<ReturnType<typeof setInterval>[]>([]);

  // Clean up any pending timers/intervals on unmount so a backgrounded
  // transfer doesn't fire setState after the page is gone.
  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout);
      intervals.current.forEach(clearInterval);
    };
  }, []);

  const after = (ms: number, fn: () => void) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  };

  // ── Flow drivers ──

  const startConnect = () => {
    // The device self-checks its battery before starting. Below the safe
    // threshold we stop here — an update interrupted by a dead battery risks a
    // bricked device, so this is a hard gate, not a warning.
    if (!simulateBatteryOk) {
      setStep('battery-low');
      return;
    }
    setStep('connect');
    // Assume the device is already paired (per product decision) — just wait
    // briefly for the app to come to the foreground and link up.
    after(2000, startChecking);
  };

  const startChecking = () => {
    setStep('checking');
    after(2000, () => {
      setStep(simulateHasUpdate ? 'confirm' : 'up-to-date');
    });
  };

  const startTransfer = () => {
    setStep('transferring');
    setProgress(0);
    // Coarse 10% steps (≤10 repaints) — a smooth per-percent counter would
    // flicker on e-ink (CONSTRAINTS § 1).
    const id = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 10;
        // Simulated mid-transfer BLE drop.
        if (SIMULATE_OUTCOME === 'fail-transfer' && next >= 60) {
          clearInterval(id);
          setStep('failed-transfer');
          return prev;
        }
        if (next >= 100) {
          clearInterval(id);
          startInstall();
          return 100;
        }
        return next;
      });
    }, 500);
    intervals.current.push(id);
  };

  const startInstall = () => {
    setStep('installing');
    setProgress(0);
    // Same coarse 10% progress-bar treatment as the transfer phase (no smooth
    // counter — e-ink, CONSTRAINTS § 1). Verifying the signature + writing the
    // image is a measurable operation, so show real progress, not a spinner.
    const id = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 10;
        if (next >= 100) {
          clearInterval(id);
          if (SIMULATE_OUTCOME === 'fail-verify') {
            setStep('failed-verify');
            return prev;
          }
          setStep('restarting');
          after(2500, () => setStep('success'));
          return 100;
        }
        return next;
      });
    }, 250);
    intervals.current.push(id);
  };

  // ── Header helpers ──

  const headerWithBack = (onBackClick: () => void) => (
    <div className="h-[45px] px-5 flex items-center border-b-2 border-black flex-shrink-0">
      <button
        onClick={onBackClick}
        className={`flex items-center gap-2 ${PRESS} px-1 -mx-1 rounded-sm`}
      >
        <ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
        <span className="text-lg font-bold text-black uppercase tracking-wide">Firmware Update</span>
      </button>
    </div>
  );

  const headerStatic = () => (
    <div className="h-[45px] px-5 flex items-center border-b-2 border-black flex-shrink-0">
      <span className="text-lg font-bold text-black uppercase tracking-wide">Firmware Update</span>
    </div>
  );

  // ── Reusable result block (success circle / failure circle) ──
  const resultScreen = (opts: {
    ok: boolean;
    title: string;
    body: string;
    primaryLabel: string;
    onPrimary: () => void;
    secondaryLabel?: string;
    onSecondary?: () => void;
    header?: 'back' | 'static';
  }) => (
    <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
      <PageDebugId page="firmware-update" showDebugId={showDebugId} />
      {opts.header === 'back' ? headerWithBack(onBack) : headerStatic()}
      <div className="flex-1 px-6 pt-2 pb-6 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
              opts.ok ? 'bg-black' : 'border-[3px] border-black'
            }`}
          >
            {opts.ok
              ? <Check className="w-11 h-11 text-[#838383]" strokeWidth={3} />
              : <X className="w-11 h-11 text-black" strokeWidth={3} />}
          </div>
          <div className="text-2xl font-bold text-black mb-3">{opts.title}</div>
          <p className="text-lg text-black leading-relaxed max-w-[300px]">{opts.body}</p>
        </div>
        <div className="space-y-3">
          <button onClick={opts.onPrimary} className={`w-full ${BTN_PRIMARY}`}>
            {opts.primaryLabel}
          </button>
          {opts.secondaryLabel && opts.onSecondary && (
            <button onClick={opts.onSecondary} className={`w-full ${BTN_BASE}`}>
              {opts.secondaryLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // ── Progress-bar screen (no back button). Shared by the transfer and
  //    install phases so both read as the same kind of measurable operation. ──
  const progressScreen = (icon: ReactNode, title: string, sub: string) => (
    <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
      <PageDebugId page="firmware-update" showDebugId={showDebugId} />
      {headerStatic()}
      <div className="flex-1 px-6 pt-2 pb-6 flex flex-col items-center justify-center text-center">
        {icon}
        <div className="text-xl font-bold text-black mb-1">{title}</div>
        <p className="text-lg text-black mb-6 max-w-[280px] leading-snug">{sub}</p>

        {/* Coarse progress bar (no transition tween — e-ink) */}
        <div className="w-full max-w-[280px]">
          <div className="w-full h-10 border-2 border-black rounded-sm bg-[#838383] overflow-hidden">
            <div className="h-full bg-black" style={{ width: `${progress}%` }} />
          </div>
          <div className="text-lg font-bold text-black mt-2">{progress}%</div>
        </div>
      </div>
    </div>
  );

  // ── Transient spinner screen (no back button) ──
  const transientScreen = (icon: ReactNode, title: string, sub?: string) => (
    <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
      <PageDebugId page="firmware-update" showDebugId={showDebugId} />
      {headerStatic()}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {icon}
        <div className="text-xl font-bold text-black mt-5">{title}</div>
        {sub && <p className="text-lg text-black mt-2 max-w-[280px] leading-snug">{sub}</p>}
      </div>
    </div>
  );

  // ════════════════════════════════════════════
  // PREFLIGHT — pre-upgrade checklist
  // ════════════════════════════════════════════
  if (step === 'preflight') {
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <PageDebugId page="firmware-update" showDebugId={showDebugId} />
        {headerWithBack(onBack)}
        <div className="flex-1 px-5 pt-4 pb-6 flex flex-col">
          <h2 className="text-xl font-bold text-black mb-4">Before you update</h2>

          <div className="border-4 border-black rounded-sm p-4 bg-black text-[#838383] mb-4">
            <h3 className="text-lg font-bold flex items-center gap-1 mb-3">
              <AlertTriangle className="w-4 h-4" strokeWidth={3} /> Make sure
            </h3>
            <ul className="space-y-2 text-lg">
              <li>- Your recovery phrase is backed up</li>
              <li>- Battery is above 50%</li>
              <li>- Keep the device near your phone</li>
              <li>- Do not turn off Bluetooth</li>
            </ul>
          </div>

          <p className="text-lg text-black leading-snug">
            The update is delivered from the SafePal app over Bluetooth. Your device will restart once it completes.
          </p>

          <div className="mt-auto space-y-3">
            <button onClick={startConnect} className={`w-full ${BTN_PRIMARY}`}>Continue</button>
            <button onClick={onBack} className={`w-full ${BTN_BASE}`}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════
  // CONNECT — wait for the phone app (already paired)
  // ════════════════════════════════════════════
  if (step === 'connect') {
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <PageDebugId page="firmware-update" showDebugId={showDebugId} />
        {headerWithBack(onBack)}
        <div className="flex-1 px-6 pt-2 pb-6 flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <Smartphone className="w-20 h-20 text-black mb-5" strokeWidth={1.5} />
            <div className="text-xl font-bold text-black mb-2">Open the SafePal app</div>
            <p className="text-lg text-black max-w-[280px] leading-snug mb-6">
              Keep this device nearby. We're linking to your phone over Bluetooth.
            </p>
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 text-black animate-spin" strokeWidth={2.5} />
              <span className="text-lg font-bold text-black">Connecting...</span>
            </div>
          </div>
          <button onClick={onBack} className={`w-full ${BTN_BASE}`}>Cancel</button>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════
  // CHECKING — app verifies the latest version
  // ════════════════════════════════════════════
  if (step === 'checking') {
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <PageDebugId page="firmware-update" showDebugId={showDebugId} />
        {headerWithBack(onBack)}
        <div className="flex-1 px-6 pt-2 pb-6 flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-16 h-16 text-black animate-spin mb-5" strokeWidth={2} />
            <div className="text-xl font-bold text-black mb-2">Checking for updates</div>
            <p className="text-lg text-black max-w-[280px] leading-snug">
              The app is checking for the latest firmware.
            </p>
          </div>
          <button onClick={onBack} className={`w-full ${BTN_BASE}`}>Cancel</button>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════
  // UP-TO-DATE — no new version
  // ════════════════════════════════════════════
  if (step === 'up-to-date') {
    return resultScreen({
      ok: true,
      header: 'back',
      title: 'Up to date',
      body: `You're on the latest version (${CURRENT_VERSION}). No update is needed.`,
      primaryLabel: 'Done',
      onPrimary: onBack,
    });
  }

  // ════════════════════════════════════════════
  // BATTERY-LOW — battery check on Continue failed
  // ════════════════════════════════════════════
  if (step === 'battery-low') {
    return resultScreen({
      ok: false,
      header: 'back',
      title: 'Battery too low',
      body: 'Charge your device above 50%, then start the update again. This keeps the update from being interrupted.',
      primaryLabel: 'Done',
      onPrimary: onBack,
    });
  }

  // ════════════════════════════════════════════
  // CONFIRM — device shows the version it will receive
  // ════════════════════════════════════════════
  if (step === 'confirm') {
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <PageDebugId page="firmware-update" showDebugId={showDebugId} />
        {headerWithBack(onBack)}
        <div className="flex-1 px-5 pt-4 pb-6 flex flex-col">
          <h2 className="text-xl font-bold text-black mb-4">Update available</h2>

          {/* Versions — flat fields side by side (no info cards). */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-lg font-light text-black uppercase tracking-wide leading-none mb-1.5">Current</div>
              <div className="text-2xl font-normal text-black">{CURRENT_VERSION}</div>
            </div>
            <div>
              <div className="text-lg font-light text-black uppercase tracking-wide leading-none mb-1.5">New</div>
              <div className="text-2xl font-normal text-black">{NEW_VERSION}</div>
            </div>
          </div>

          <div className="h-[2px] bg-black flex-shrink-0 my-3.5" />

          {(() => {
            const wnPages = Math.ceil(WHATS_NEW.length / WN_PER_PAGE);
            const wnItems = WHATS_NEW.slice(wnPage * WN_PER_PAGE, (wnPage + 1) * WN_PER_PAGE);
            return (
              <div className="flex-1 min-h-0 flex flex-col">
                {/* Section pager — label + (n/N) left, ‹ › right (Message-screen style). */}
                <div className="flex items-center justify-between mb-2 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-light text-black uppercase tracking-wide leading-none">What's new</span>
                    {wnPages > 1 && (
                      <span className="text-lg text-black font-bold">({wnPage + 1}/{wnPages})</span>
                    )}
                  </div>
                  {wnPages > 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setWnPage(p => Math.max(0, p - 1))}
                        disabled={wnPage === 0}
                        className="w-7 h-7 flex items-center justify-center hover:bg-black hover:text-[#838383] active:scale-95 transition-colors disabled:invisible"
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="w-4 h-4 text-black" strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => setWnPage(p => Math.min(wnPages - 1, p + 1))}
                        disabled={wnPage === wnPages - 1}
                        className="w-7 h-7 flex items-center justify-center hover:bg-black hover:text-[#838383] active:scale-95 transition-colors disabled:invisible"
                        aria-label="Next page"
                      >
                        <ChevronRight className="w-4 h-4 text-black" strokeWidth={2.5} />
                      </button>
                    </div>
                  )}
                </div>
                <ul className="space-y-1 text-lg text-black leading-snug overflow-hidden">
                  {wnItems.map((line, i) => <li key={i}>{line}</li>)}
                </ul>
              </div>
            );
          })()}

          <div className="h-[2px] bg-black flex-shrink-0 mt-3.5" />

          <div className="mt-auto pt-3 space-y-3">
            {/* Update requires a second factor (PIN or fingerprint) before the
                transfer starts — same gate as the Sign confirm. */}
            <button onClick={() => setStep('verify')} className={`w-full ${BTN_PRIMARY}`}>Update</button>
            <button onClick={onBack} className={`w-full ${BTN_BASE}`}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════
  // VERIFY — second factor before the transfer starts (PIN / fingerprint)
  // ════════════════════════════════════════════
  if (step === 'verify') {
    if (fingerprintEnrolled) {
      return (
        <FingerprintVerifyPage
          title="Verify to Update"
          promptSubtitle="Touch the sensor to start the update"
          onBack={() => setStep('confirm')}
          onVerifySuccess={startTransfer}
          showDebugId={showDebugId}
        />
      );
    }
    return (
      <ChangePINPage
        onBack={() => setStep('confirm')}
        randomized={true}
        mode="verify"
        headerTitle="Firmware Update"
        verifyTitle="Enter PIN to Update"
        onVerifySuccess={startTransfer}
        showDebugId={showDebugId}
      />
    );
  }

  // ════════════════════════════════════════════
  // TRANSFERRING — receiving the firmware over BLE (no back)
  // ════════════════════════════════════════════
  if (step === 'transferring') {
    return progressScreen(
      <ArrowDown className="w-16 h-16 text-black mb-5" strokeWidth={1.5} />,
      'Receiving update',
      'Keep the device near your phone. Do not power off.',
    );
  }

  // ════════════════════════════════════════════
  // INSTALLING — verify signature + install (no back)
  // ════════════════════════════════════════════
  if (step === 'installing') {
    return progressScreen(
      <ShieldCheck className="w-16 h-16 text-black mb-5" strokeWidth={1.5} />,
      'Verifying & installing',
      'Checking the firmware signature and applying the update. Do not power off.',
    );
  }

  // ════════════════════════════════════════════
  // RESTARTING — reboot to apply (no back)
  // ════════════════════════════════════════════
  if (step === 'restarting') {
    return transientScreen(
      <RotateCw className="w-16 h-16 text-black animate-spin" strokeWidth={2} />,
      'Restarting',
      'Your device is rebooting to finish the update.',
    );
  }

  // ════════════════════════════════════════════
  // SUCCESS
  // ════════════════════════════════════════════
  if (step === 'success') {
    return resultScreen({
      ok: true,
      header: 'static',
      title: 'Update complete',
      body: `Your device is now running ${NEW_VERSION}.`,
      primaryLabel: 'Done',
      onPrimary: onBack,
    });
  }

  // ════════════════════════════════════════════
  // FAILURE SCREENS
  // ════════════════════════════════════════════
  if (step === 'failed-connect') {
    return resultScreen({
      ok: false,
      header: 'back',
      title: "Couldn't connect",
      body: 'We could not reach the SafePal app. Make sure the app is open and Bluetooth is on.',
      primaryLabel: 'Retry',
      onPrimary: startConnect,
      secondaryLabel: 'Cancel',
      onSecondary: onBack,
    });
  }

  if (step === 'failed-transfer') {
    return resultScreen({
      ok: false,
      header: 'back',
      title: 'Transfer interrupted',
      body: 'The update did not finish transferring. Your device is unchanged and safe to retry.',
      primaryLabel: 'Retry',
      onPrimary: startTransfer,
      secondaryLabel: 'Cancel',
      onSecondary: onBack,
    });
  }

  if (step === 'failed-verify') {
    return resultScreen({
      ok: false,
      header: 'back',
      title: 'Verification failed',
      body: 'The firmware signature could not be verified, so nothing was installed. Your device rolled back safely.',
      primaryLabel: 'Retry',
      onPrimary: startTransfer,
      secondaryLabel: 'Cancel',
      onSecondary: onBack,
    });
  }

  return null;
}
