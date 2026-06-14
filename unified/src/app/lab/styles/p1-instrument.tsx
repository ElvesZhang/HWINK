import { useState, useRef, useEffect } from 'react';
import { ChevronRight, Bluetooth, BatteryMedium, X, Check, Fingerprint } from 'lucide-react';
import type { LabScreen } from '../data';
import { WALLET, HOME_ITEMS, SIGN } from '../data';

/**
 * P1 · 冷静的精密仪器 (Instrument) — calm precision.
 *
 * Governing voice: a measuring instrument's readout. ONE sans family. Hierarchy
 * comes ONLY from weight / size / whitespace — never from shadows or containers.
 * Shapes are flat and square (no rounding, no fills-as-decoration). Decorative
 * industrial codes are dropped. Status vocabulary is single + plain. The signature
 * interaction is HOLD-TO-CONFIRM with a real, stepped progress readout.
 *
 * Surface semantics (locked): #838383 = field; black = a single emphasis ink
 * (used ONLY for the one consequential action + its result). No ink-25 tone, no
 * inverted chips — emphasis is scarce on purpose.
 */
const PRESS = 'active:bg-black active:text-[#838383]';

export function P1Instrument({ screen }: { screen: LabScreen }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black font-sans">
      {screen === 'home' && <Home />}
      {screen === 'sign' && <Sign />}
      {(screen === 'history' || screen === 'seed') && <Placeholder />}
    </div>
  );
}

function Placeholder() {
  return (
    <div className="flex-1 flex items-center justify-center px-8 text-center">
      <span className="text-sm tracking-wide">This screen lands after a direction is chosen.</span>
    </div>
  );
}

/* ── HOME ── readout header + four hairline rows, no chrome. ── */
function Home() {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* readout header — air, not a card */}
      <div className="px-5 pt-4 pb-3.5 flex-shrink-0">
        <div className="flex items-center justify-between text-[12px] font-semibold tracking-[0.22em] uppercase">
          <span>Wallet</span>
          <span className="inline-flex items-center gap-2.5">
            <Bluetooth className="w-4 h-4" strokeWidth={2.25} />
            <span className="inline-flex items-center gap-1 tabular-nums"><BatteryMedium className="w-5 h-5" strokeWidth={2.25} />{WALLET.battery}%</span>
          </span>
        </div>
        <div className="text-[34px] font-bold tracking-tight leading-none mt-2.5">{WALLET.name}</div>
        <div className="text-[12px] tracking-[0.18em] mt-1.5 font-medium">{WALLET.model}</div>
      </div>
      {/* index — hairline rows, weight drives hierarchy, no codes */}
      <div className="flex-1 flex flex-col min-h-0 border-t-2 border-black">
        {HOME_ITEMS.map((m) => (
          <button key={m.id} className={`flex-1 flex items-center gap-4 px-5 text-left border-b border-black last:border-b-0 ${PRESS}`}>
            <div className="flex-1 min-w-0">
              <div className="text-[23px] font-bold leading-tight">{m.label}</div>
              <div className="text-[13px] font-medium tracking-wide mt-0.5 truncate">{m.sub}</div>
            </div>
            <ChevronRight className="w-6 h-6 flex-shrink-0" strokeWidth={2.25} />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── SIGN ── flat readout + uniform meta rows + real hold-to-confirm. ── */
function MetaRow({ k, v, mono, big }: { k: string; v: string; mono?: boolean; big?: boolean }) {
  return (
    <div className="flex-1 flex items-center justify-between gap-3 px-5 border-b border-black last:border-b-0">
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] flex-shrink-0">{k}</span>
      <span className={`${big ? 'text-[19px]' : 'text-[16px]'} font-bold text-right truncate`} style={mono ? { fontFamily: 'ui-monospace, monospace' } : undefined}>{v}</span>
    </div>
  );
}

const HOLD_STEPS = 5;
function Sign() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState<null | 'signed' | 'rejected'>(null);
  const timer = useRef<number | null>(null);
  const clear = () => { if (timer.current !== null) { window.clearInterval(timer.current); timer.current = null; } };
  useEffect(() => clear, []);
  const startHold = () => {
    if (done) return; clear();
    timer.current = window.setInterval(() => {
      setProgress(p => { if (p + 1 >= HOLD_STEPS) { clear(); setDone('signed'); return HOLD_STEPS; } return p + 1; });
    }, 150);
  };
  const endHold = () => { clear(); if (!done) setProgress(0); };
  const reset = () => { clear(); setProgress(0); setDone(null); };

  if (done) {
    const ok = done === 'signed';
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
        <div className={`w-[72px] h-[72px] flex items-center justify-center ${ok ? 'bg-black' : 'border-[3px] border-black'}`}>
          {ok ? <Check className="w-9 h-9 text-[#838383]" strokeWidth={3} /> : <X className="w-9 h-9 text-black" strokeWidth={3} />}
        </div>
        <div className="text-[28px] font-bold tracking-tight mt-5">{ok ? 'Signed' : 'Rejected'}</div>
        <div className="text-[13px] tracking-wide mt-1.5">{ok ? `${SIGN.amount} ${SIGN.token} sent to ${SIGN.to}` : 'Nothing was sent'}</div>
        <button onClick={reset} className={`mt-7 px-7 h-11 border-2 border-black text-[14px] font-bold uppercase tracking-wide ${PRESS}`}>Again</button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-5 pt-4 pb-3 flex items-center justify-between flex-shrink-0 border-b-2 border-black">
        <span className="text-[13px] font-semibold tracking-[0.22em] uppercase">Confirm Send</span>
        <span className="text-[12px] font-bold tracking-[0.16em] uppercase">{SIGN.network}</span>
      </div>
      {/* amount readout */}
      <div className="px-5 pt-4 pb-3 flex-shrink-0">
        <div className="text-[11px] font-semibold tracking-[0.22em] uppercase">Amount</div>
        <div className="flex items-baseline gap-2.5 mt-1">
          <span className="text-[64px] font-bold leading-[0.8] tabular-nums tracking-tight">{SIGN.amount}</span>
          <span className="text-2xl font-bold">{SIGN.token}</span>
        </div>
        <div className="text-[13px] font-medium tracking-wide mt-2">≈ {SIGN.fiat}</div>
      </div>
      {/* uniform meta rows — address emphasised (security), all flat */}
      <div className="flex-1 min-h-0 flex flex-col border-t-2 border-black">
        <MetaRow k="To" v={SIGN.to} />
        <MetaRow k="Address" v={SIGN.address} mono big />
        <MetaRow k="Network fee" v={SIGN.fee} />
        <MetaRow k="Verify code" v={SIGN.verify} mono big />
      </div>
      {/* action — reject + hold-to-confirm with stepped progress readout */}
      <div className="flex border-t-2 border-black flex-shrink-0">
        <button onClick={() => setDone('rejected')} className={`w-[76px] h-16 border-r-2 border-black flex items-center justify-center ${PRESS}`} aria-label="Reject">
          <X className="w-7 h-7" strokeWidth={2.25} />
        </button>
        <button onPointerDown={startHold} onPointerUp={endHold} onPointerLeave={endHold} className="relative flex-1 h-16 bg-black select-none touch-none overflow-hidden" aria-label="Hold to sign">
          {/* stepped fill readout (≤5 repaints — e-ink safe) */}
          <div className="absolute inset-0 flex">
            {Array.from({ length: HOLD_STEPS }, (_, i) => (
              <div key={i} className={`flex-1 ${i < progress ? 'bg-[#838383]' : ''} ${i > 0 ? 'border-l border-[#838383]' : ''}`} />
            ))}
          </div>
          <span className="relative z-10 h-full flex items-center justify-center gap-2 text-[15px] font-bold uppercase tracking-[0.18em] text-[#838383]">
            <Fingerprint className="w-5 h-5" strokeWidth={2.25} />{progress > 0 ? 'Hold…' : 'Hold to Sign'}
          </span>
        </button>
      </div>
    </div>
  );
}
