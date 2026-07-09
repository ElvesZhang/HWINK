import { useState, useRef, useEffect, type ReactNode } from 'react';
import {
  ChevronLeft, AlertTriangle, Check, X, Loader2,
  Smartphone, ArrowDown, ArrowRight, RotateCw, ShieldCheck,
} from 'lucide-react';
import { PageDebugId } from './PageDebugId';
import { FingerprintVerifyPage } from './FingerprintVerifyPage';
import { ChangePINPage } from './ChangePINPage';

interface FirmwareUpdatePageProps {
  /** User-initiated retreat (cancel / battery fail / up-to-date) → About. */
  onBack: () => void;
  /** Update finished naturally — the device has rebooted, so land on Home,
   *  not back inside the Settings tree (CONSTRAINTS § 7.3 dual-callback). */
  onCompleteToHome?: () => void;
  showDebugId?: boolean;
  /** Device has a fingerprint enrolled? Drives the second factor on "Update"
   *  (fingerprint scan vs PIN keypad) — same rule as the Sign confirm. */
  fingerprintEnrolled?: boolean;
  /** Prototype sim: does the app report a newer firmware once linked? */
  simulateHasUpdate?: boolean;
  /** Prototype sim: how the waiting-for-app phase ends — BLE link up + info
   *  received, no link at all, or link drops before the info arrives. */
  simulateConnect?: 'success' | 'fail-ble' | 'fail-info';
  /** Prototype sim: does the on-entry battery check pass? */
  simulateBatteryOk?: boolean;
  /** Prototype sim: how the transfer/verify phases end. */
  simulateOutcome?: 'success' | 'fail-transfer' | 'fail-verify';
}

// ── Bluetooth firmware-update flow (device-side screens) ──
// App-led: the wallet has no network, so the PHONE APP checks versions and
// downloads the firmware blob BEFORE talking to the device. The device is a
// passive receiver that owns only the security-critical bits: showing what it
// is offered, gating the transfer behind a second factor, verifying the
// signature BEFORE rebooting, and applying the image in the bootloader.
//
//   (entry battery check) → battery-low | preflight
//   preflight (warnings, user-paced, NO timers) → Continue → app-guide
//   app-guide (how to operate the app, user-paced) → Connect to App → waiting-app
//   waiting-app (pure status, machine-paced) → (up-to-date | confirm)
//     each waiting phase has its own failure: no BLE link → failed-connect;
//     linked but the firmware info never arrives → failed-info
//   confirm → verify (PIN/fingerprint) → transferring → verifying
//   verifying → restarting → boot-install → success (→ Home)
//   failures: battery-low | failed-connect | failed-info | failed-transfer | failed-verify
//
// Pacing rule: reading content (warnings, instructions) and live status never
// share a screen. The preflight screen is user-paced — it sits until the user
// taps Continue (= the device starts listening over BLE). The waiting screen
// is machine-paced — it holds nothing to read, so auto-advancing is fine.
type UpdateStep =
  | 'battery-low'
  | 'preflight' | 'app-guide'
  | 'waiting-app'
  | 'up-to-date'
  | 'confirm' | 'verify'
  | 'transferring' | 'verifying'
  | 'restarting' | 'boot-install' | 'success'
  | 'failed-connect' | 'failed-info' | 'failed-transfer' | 'failed-verify';

const CURRENT_VERSION = 'v2.1.5';
const NEW_VERSION = 'v2.2.0';

// NOTE: release notes ("What's New") are deliberately NOT shown on the device.
// They are free-form server-fed text and the device ships a trimmed font
// subset — unvetted copy would render as missing glyphs. They also carry no
// security value (the device only attests what it can verify: version strings
// and the firmware signature). The confirm screen points at the app instead.

const PRESS = 'active:bg-black active:text-[#838383]';
const BTN_BASE = `h-14 border-2 border-black rounded-sm bg-[#838383] hover:bg-black hover:text-[#838383] ${PRESS} font-bold text-lg`;
const BTN_PRIMARY = `h-14 border-2 border-black rounded-sm bg-black text-[#838383] hover:bg-[#838383] hover:text-black ${PRESS} font-bold text-lg`;

export function FirmwareUpdatePage({
  onBack,
  onCompleteToHome,
  showDebugId,
  fingerprintEnrolled = true,
  simulateHasUpdate = true,
  simulateBatteryOk = true,
  simulateConnect = 'success',
  simulateOutcome = 'success',
}: FirmwareUpdatePageProps) {
  // The device self-checks its battery the moment the page opens (fail fast —
  // don't let the user read the preflight text only to be stopped later). An
  // update interrupted by a dead battery risks a bricked device, so this is a
  // hard gate, not a warning. Seeded via the initializer to avoid an extra
  // first-frame repaint on e-ink.
  const [step, setStep] = useState<UpdateStep>(simulateBatteryOk ? 'preflight' : 'battery-low');
  // waiting-app sub-status: has the BLE link to the app come up yet?
  const [linked, setLinked] = useState(false);
  const [progress, setProgress] = useState(0);
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

  // Waiting-for-app sequence: BLE link comes up, then the app (which already
  // checked versions and downloaded the blob) reports its result. Each phase
  // fails on its own: no link within the window → failed-connect; linked but
  // the firmware info never arrives → failed-info.
  //
  // PROTOTYPE: on real hardware these are machine-paced BLE events; here each
  // one is simulated by tapping the status area (like the fingerprint page's
  // tap-to-scan), so a reviewer can hold and inspect every state — nothing
  // advances until tapped.
  const advanceWaiting = () => {
    if (!linked) {
      if (simulateConnect === 'fail-ble') {
        setStep('failed-connect');
        return;
      }
      setLinked(true);
      return;
    }
    if (simulateConnect === 'fail-info') {
      setStep('failed-info');
      return;
    }
    setStep(simulateHasUpdate ? 'confirm' : 'up-to-date');
  };

  // Retry from a connect failure: back to listening with a clean sub-status.
  const retryWaiting = () => {
    setLinked(false);
    setStep('waiting-app');
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
        if (simulateOutcome === 'fail-transfer' && next >= 60) {
          clearInterval(id);
          setStep('failed-transfer');
          return prev;
        }
        if (next >= 100) {
          clearInterval(id);
          startVerifying();
          return 100;
        }
        return next;
      });
    }, 500);
    intervals.current.push(id);
  };

  // Signature check happens BEFORE the reboot: if the image is bad the device
  // must say so while it is still running the old firmware — failing inside
  // the bootloader after a restart looks like a brick to the user.
  const startVerifying = () => {
    setStep('verifying');
    after(1600, () => {
      if (simulateOutcome === 'fail-verify') {
        setStep('failed-verify');
        return;
      }
      setStep('restarting');
      after(2200, startBootInstall);
    });
  };

  // Post-reboot bootloader phase: writing the verified image. Same coarse 10%
  // progress-bar treatment (no smooth counter — e-ink, CONSTRAINTS § 1).
  const startBootInstall = () => {
    setStep('boot-install');
    setProgress(0);
    const id = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 10;
        if (next >= 100) {
          clearInterval(id);
          after(600, () => setStep('success'));
          return 100;
        }
        return next;
      });
    }, 300);
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
    sub: string;
    title: string;
    body: string;
    primaryLabel: string;
    onPrimary: () => void;
    secondaryLabel?: string;
    onSecondary?: () => void;
    header?: 'back' | 'static';
  }) => (
    <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
      <PageDebugId page="firmware-update" subPage={opts.sub} showDebugId={showDebugId} />
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

  // ── Transient spinner screen (no back button). `bare` drops the header for
  //    phases where the normal UI isn't running (reboot / bootloader). ──
  const transientScreen = (icon: ReactNode, sub: string, title: string, body?: string, bare = false) => (
    <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
      <PageDebugId page="firmware-update" subPage={sub} showDebugId={showDebugId} />
      {!bare && headerStatic()}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {icon}
        <div className="text-xl font-bold text-black mt-5">{title}</div>
        {body && <p className="text-lg text-black mt-2 max-w-[280px] leading-snug">{body}</p>}
      </div>
    </div>
  );

  // ════════════════════════════════════════════
  // BATTERY-LOW — on-entry battery check failed
  // ════════════════════════════════════════════
  if (step === 'battery-low') {
    return resultScreen({
      ok: false,
      sub: 'battery',
      header: 'back',
      title: 'Battery too low',
      body: 'Charge your device above 50%, then start the update again. This keeps the update from being interrupted.',
      primaryLabel: 'Done',
      onPrimary: onBack,
    });
  }

  // ════════════════════════════════════════════
  // PREFLIGHT — reading screen, user-paced (no timers). Continue = the device
  // starts listening over BLE.
  // ════════════════════════════════════════════
  if (step === 'preflight') {
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <PageDebugId page="firmware-update" subPage="preflight" showDebugId={showDebugId} />
        {headerWithBack(onBack)}
        <div className="flex-1 px-5 pt-4 pb-6 flex flex-col">
          <h2 className="text-xl font-bold text-black mb-4">Before you update</h2>

          <div className="border-4 border-black rounded-sm p-4 bg-black text-[#838383] mb-4">
            <h3 className="text-lg font-bold flex items-center gap-1 mb-3">
              <AlertTriangle className="w-4 h-4" strokeWidth={3} /> Make sure
            </h3>
            <ul className="space-y-2 text-lg">
              <li>- Your recovery phrase is backed up</li>
              <li>- Keep the device near your phone</li>
              <li>- Do not turn off Bluetooth</li>
            </ul>
          </div>

          <div className="mt-auto space-y-3">
            <button onClick={() => setStep('app-guide')} className={`w-full ${BTN_PRIMARY}`}>Continue</button>
            <button onClick={onBack} className={`w-full ${BTN_BASE}`}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════
  // APP-GUIDE — how to operate the phone app (reading screen, user-paced).
  // Mock copy until the app side is designed. Header back returns to the
  // preflight page (page-wise back); Cancel exits the flow.
  // ════════════════════════════════════════════
  if (step === 'app-guide') {
    const APP_STEPS = [
      'Open Wallet Management in the SafePal app',
      'Select this hardware wallet',
      'Tap Firmware Upgrade to check for the new version',
    ];
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <PageDebugId page="firmware-update" subPage="guide" showDebugId={showDebugId} />
        {headerWithBack(() => setStep('preflight'))}
        <div className="flex-1 px-5 pt-4 pb-6 flex flex-col">
          <h2 className="text-xl font-bold text-black mb-4">On your phone</h2>

          <div className="space-y-4">
            {/* Number box is 28px — the same height as one text-lg/leading-snug
                line box (~25px) plus the 2px offset — so the first line of a
                wrapped step stays optically centered against its number. */}
            {APP_STEPS.map((text, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-7 h-7 border-2 border-black rounded-sm flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-black leading-none">{i + 1}</span>
                </div>
                <p className="text-lg text-black leading-snug pt-0.5 min-w-0">{text}</p>
              </div>
            ))}
          </div>

          <div className="h-[2px] bg-black flex-shrink-0 my-4" />

          <p className="text-lg font-light text-black leading-snug">
            Tap Continue — this device will then wait for the app.
          </p>

          <div className="mt-auto space-y-3">
            <button onClick={() => setStep('waiting-app')} className={`w-full ${BTN_PRIMARY}`}>Continue</button>
            <button onClick={onBack} className={`w-full ${BTN_BASE}`}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════
  // WAITING-APP — pure status screen (nothing to read); the app checks +
  // downloads, this device just listens. Auto-advances when the app answers.
  // ════════════════════════════════════════════
  if (step === 'waiting-app') {
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <PageDebugId page="firmware-update" subPage="waiting" showDebugId={showDebugId} />
        {headerWithBack(onBack)}
        <div className="flex-1 px-6 pt-2 pb-6 flex flex-col">
          {/* Tap = simulate the next BLE event arriving (prototype only). */}
          <div
            onClick={advanceWaiting}
            role="button"
            aria-label="Simulate the next connection event"
            className="flex-1 flex flex-col items-center justify-center text-center cursor-pointer"
          >
            <Smartphone className="w-20 h-20 text-black mb-5" strokeWidth={1.5} />
            <div className="text-xl font-bold text-black mb-2">
              {linked ? 'Connected' : 'Waiting for the app…'}
            </div>
            {/* Fixed-height slot sized for the longer (2-line) phase text so
                the swap doesn't shift the spinner (CONSTRAINTS § 1). The
                detailed app steps live on the app-guide page — this line only
                points back at them, it doesn't re-explain. */}
            <p className="text-lg text-black max-w-[280px] leading-snug min-h-[56px]">
              {linked
                ? 'Receiving firmware info from the app…'
                : 'Follow the steps in the app. Keep this device nearby.'}
            </p>
            <div className="mt-4">
              <Loader2 className="w-6 h-6 text-black animate-spin" strokeWidth={2.5} />
            </div>
          </div>
          {/* Static reminder (not part of the phase-swapping slot): the update
              path is BLE-only — pre-empt the "which cable do I plug in" reflex. */}
          <p className="text-lg font-light text-black text-center mb-4">
            Bluetooth only — no USB cable is needed.
          </p>
          <button onClick={onBack} className={`w-full ${BTN_BASE}`}>Cancel</button>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════
  // UP-TO-DATE — the app reports no newer firmware
  // ════════════════════════════════════════════
  if (step === 'up-to-date') {
    return resultScreen({
      ok: true,
      sub: 'latest',
      header: 'back',
      title: 'Up to date',
      body: `You're on the latest version (${CURRENT_VERSION}). No update is needed.`,
      primaryLabel: 'Done',
      onPrimary: onBack,
    });
  }

  // ════════════════════════════════════════════
  // CONFIRM — device shows the version the app is offering
  // ════════════════════════════════════════════
  if (step === 'confirm') {
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <PageDebugId page="firmware-update" subPage="available" showDebugId={showDebugId} />
        {headerWithBack(onBack)}
        <div className="flex-1 px-5 pt-4 pb-6 flex flex-col">
          <h2 className="text-xl font-bold text-black mb-4">Update available</h2>

          {/* Version transition is the hero — centered in the free space
              (sign-screen big-typography language): current → NEW, with the
              target version carrying the emphasis. */}
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-end justify-center gap-5">
              <div>
                <div className="text-lg font-light text-black uppercase tracking-wide leading-none mb-1.5">Current</div>
                <div className="text-3xl font-normal text-black">{CURRENT_VERSION}</div>
              </div>
              <ArrowRight className="w-8 h-8 text-black mb-1 flex-shrink-0" strokeWidth={2.5} />
              <div>
                <div className="text-lg font-light text-black uppercase tracking-wide leading-none mb-1.5">New</div>
                <div className="text-3xl font-bold text-black">{NEW_VERSION}</div>
              </div>
            </div>
          </div>

          <div className="h-[2px] bg-black flex-shrink-0 mb-3" />

          {/* Release notes live in the app (trimmed device font subset — see
              note at top of file); the device just points there. */}
          <p className="text-lg font-light text-black leading-snug">
            See what's new in the SafePal app.
          </p>

          <div className="pt-3 space-y-3">
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
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <PageDebugId page="firmware-update" subPage="transfer" showDebugId={showDebugId} />
        {headerStatic()}
        <div className="flex-1 px-6 pt-2 pb-6 flex flex-col items-center justify-center text-center">
          <ArrowDown className="w-16 h-16 text-black mb-5" strokeWidth={1.5} />
          <div className="text-xl font-bold text-black mb-1">Receiving update</div>
          <p className="text-lg text-black mb-6 max-w-[280px] leading-snug">
            Keep the device near your phone. Do not power off.
          </p>

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
  }

  // ════════════════════════════════════════════
  // VERIFYING — signature check BEFORE the reboot (no back)
  // ════════════════════════════════════════════
  if (step === 'verifying') {
    return transientScreen(
      <ShieldCheck className="w-16 h-16 text-black" strokeWidth={1.5} />,
      'verify-fw',
      'Verifying firmware',
      'Checking the firmware signature before installing. Do not power off.',
    );
  }

  // ════════════════════════════════════════════
  // RESTARTING — reboot into the bootloader (no header: UI is going down)
  // ════════════════════════════════════════════
  if (step === 'restarting') {
    return transientScreen(
      <RotateCw className="w-16 h-16 text-black animate-spin" strokeWidth={2} />,
      'boot',
      'Restarting',
      'Your device is rebooting to install the update.',
      true,
    );
  }

  // ════════════════════════════════════════════
  // BOOT-INSTALL — bootloader writing the verified image (bare screen)
  // ════════════════════════════════════════════
  if (step === 'boot-install') {
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <PageDebugId page="firmware-update" subPage="boot" showDebugId={showDebugId} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="text-xl font-bold text-black mb-1">Installing firmware</div>
          <div className="text-2xl font-bold text-black mb-8">{NEW_VERSION}</div>

          {/* Coarse progress bar (no transition tween — e-ink) */}
          <div className="w-full max-w-[280px]">
            <div className="w-full h-10 border-2 border-black rounded-sm bg-[#838383] overflow-hidden">
              <div className="h-full bg-black" style={{ width: `${progress}%` }} />
            </div>
            <div className="text-lg font-bold text-black mt-2">{progress}%</div>
          </div>

          <p className="text-lg text-black mt-8">Do not power off.</p>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════
  // SUCCESS — device is back up on the new firmware
  // ════════════════════════════════════════════
  if (step === 'success') {
    return resultScreen({
      ok: true,
      sub: 'success',
      header: 'static',
      title: 'Update complete',
      body: `Your device is now running ${NEW_VERSION}.`,
      primaryLabel: 'Done',
      onPrimary: onCompleteToHome ?? onBack,
    });
  }

  // ════════════════════════════════════════════
  // FAILURE SCREENS
  // ════════════════════════════════════════════
  if (step === 'failed-connect') {
    return resultScreen({
      ok: false,
      sub: 'waiting',
      header: 'back',
      title: "Couldn't connect",
      body: 'We could not reach the SafePal app over Bluetooth. Make sure Bluetooth is on and the app is open, then try again.',
      primaryLabel: 'Retry',
      onPrimary: retryWaiting,
      secondaryLabel: 'Cancel',
      onSecondary: onBack,
    });
  }

  if (step === 'failed-info') {
    return resultScreen({
      ok: false,
      sub: 'waiting',
      header: 'back',
      title: 'Connection lost',
      body: 'Your phone connected, but the app did not send back the firmware info. Keep the device near your phone and try again.',
      primaryLabel: 'Retry',
      onPrimary: retryWaiting,
      secondaryLabel: 'Cancel',
      onSecondary: onBack,
    });
  }

  if (step === 'failed-transfer') {
    return resultScreen({
      ok: false,
      sub: 'transfer',
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
      sub: 'verify-fw',
      header: 'back',
      title: 'Verification failed',
      body: `The firmware signature could not be verified. Nothing was installed — your device is unchanged and still on ${CURRENT_VERSION}.`,
      primaryLabel: 'Retry',
      onPrimary: startTransfer,
      secondaryLabel: 'Cancel',
      onSecondary: onBack,
    });
  }

  return null;
}
