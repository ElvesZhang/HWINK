import { Check, X, ArrowRight, Fingerprint } from 'lucide-react';
import type { LabScreen } from '../data';
import { WALLET, HOME_ITEMS, HIST, SIGN, SEED } from '../data';

/**
 * SKETCH style — hand-drawn wireframe (reference: hand-drawn UI kit). Two cheap,
 * reliable tricks: asymmetric border-radius (.sketch-box*) makes boxes look
 * "drawn by hand", and a feTurbulence + feDisplacementMap filter (.sketch-rough)
 * wobbles every edge/glyph for a pen-on-paper feel. Pure black on #838383 →
 * ideal for 1-bit. Bounded, no scroll.
 */
const BOX = ['sketch-box', 'sketch-box-2', 'sketch-box-3'];
const box = (i: number) => BOX[i % 3];
const PRESS = 'active:bg-black active:text-[#838383]';
const CHECKBOX = 'w-7 h-7 border-2 border-black grid place-items-center flex-shrink-0';
const CB_R = { borderRadius: '12px 7px 14px 6px' };

export function SketchStyle({ screen }: { screen: LabScreen }) {
  return (
    <>
      {/* roughen filter — rendered once */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <filter id="sketch-rough" x="-6%" y="-6%" width="112%" height="112%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018 0.022" numOctaves="2" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <div className="flex-1 flex flex-col min-h-0 text-black sketch-rough">
        {screen === 'home' && <Home />}
        {screen === 'sign' && <Sign />}
        {screen === 'history' && <History />}
        {screen === 'seed' && <Seed />}
      </div>
    </>
  );
}

function Home() {
  return (
    <div className="flex-1 flex flex-col min-h-0 p-3 gap-2.5">
      <div className="text-[30px] font-black tracking-tight flex-shrink-0">Wallet</div>
      <div className="flex-1 flex flex-col gap-2.5 min-h-0">
        {HOME_ITEMS.map((m, i) => (
          <button key={m.id} className={`flex-1 border-2 border-black ${box(i)} px-4 flex items-center gap-3 text-left ${PRESS}`}>
            <span className={CHECKBOX} style={CB_R}>{i < 2 ? <Check className="w-4 h-4" strokeWidth={2.5} /> : null}</span>
            <div className="flex-1 min-w-0">
              <div className="text-lg font-black leading-tight">{m.label}</div>
              <div className="text-[11px]">{m.sub}</div>
            </div>
            <ArrowRight className="w-6 h-6 flex-shrink-0" strokeWidth={2} />
          </button>
        ))}
      </div>
    </div>
  );
}

function Sign() {
  return (
    <div className="flex-1 flex flex-col min-h-0 p-3 gap-2.5">
      <div className="text-2xl font-black tracking-tight flex-shrink-0">Confirm send</div>
      <div className={`border-2 border-black ${BOX[0]} p-3 flex-shrink-0`}>
        <div className="text-[10px] font-bold uppercase tracking-widest">Amount</div>
        <div className="text-[54px] font-black leading-none tabular-nums">500<span className="text-xl ml-1">USDT</span></div>
        <div className="text-[12px] mt-1">≈ {SIGN.fiat}</div>
      </div>
      <div className={`border-2 border-black ${BOX[1]} px-3 py-2 flex-shrink-0`}>
        <div className="text-[10px] font-bold uppercase tracking-widest">To</div>
        <div className="text-base font-black truncate">{SIGN.to} · {SIGN.address}</div>
      </div>
      <div className={`border-2 border-black ${BOX[2]} px-3 py-2 flex items-center justify-between flex-shrink-0`}>
        <span className="text-[10px] font-bold uppercase tracking-widest">Fee</span>
        <span className="text-base font-black">{SIGN.fee}</span>
      </div>
      <div className="flex-1 min-h-0" />
      <div className="flex gap-2.5 flex-shrink-0">
        <button className={`w-16 h-14 border-2 border-black ${BOX[0]} grid place-items-center ${PRESS}`} aria-label="Reject"><X className="w-6 h-6" strokeWidth={2.5} /></button>
        <button className={`flex-1 h-14 border-2 border-black ${BOX[1]} bg-black text-[#838383] flex items-center justify-center gap-2 text-sm font-black uppercase tracking-wide active:bg-[#838383] active:text-black`}><Fingerprint className="w-5 h-5" strokeWidth={2.5} />Hold to sign</button>
      </div>
    </div>
  );
}

function History() {
  return (
    <div className="flex-1 flex flex-col min-h-0 p-3 gap-2">
      <div className="text-2xl font-black tracking-tight flex-shrink-0">History</div>
      <div className="flex-1 grid gap-2 min-h-0" style={{ gridTemplateRows: `repeat(${HIST.length}, minmax(0, 1fr))` }}>
        {HIST.map((e, i) => (
          <button key={e.idx} className={`border-2 border-black ${box(i)} px-3 flex items-center gap-3 text-left ${PRESS}`}>
            <span className={CHECKBOX} style={CB_R}>{e.ok ? <Check className="w-4 h-4" strokeWidth={2.5} /> : <X className="w-4 h-4" strokeWidth={2.5} />}</span>
            <div className="flex-1 min-w-0">
              <div className="text-base font-black leading-none truncate">{e.title}</div>
              <div className="text-[10px] mt-1 truncate">{e.type} · {e.time}</div>
            </div>
            <ArrowRight className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
          </button>
        ))}
      </div>
    </div>
  );
}

function Seed() {
  return (
    <div className="flex-1 flex flex-col min-h-0 p-3 gap-2.5">
      <div className="flex items-baseline justify-between flex-shrink-0">
        <span className="text-2xl font-black tracking-tight">Recovery</span>
        <span className="text-[12px] font-bold tracking-widest">{String(SEED.current).padStart(2, '0')}/{SEED.count}</span>
      </div>
      <div className={`border-2 border-black ${BOX[0]} h-12 flex items-center px-4 flex-shrink-0`}>
        <span className="text-xl font-black">ba</span><span className="w-0.5 h-6 bg-black ml-1" />
      </div>
      <div className="flex-1 grid gap-2.5 min-h-0" style={{ gridTemplateRows: 'repeat(3, minmax(0, 1fr))' }}>
        {SEED.suggestions.map((w, i) => (
          <button key={w} className={`border-2 border-black ${box(i)} flex items-center justify-between px-4 ${PRESS}`}>
            <span className="text-xl font-black lowercase">{w}</span>
            <ArrowRight className="w-5 h-5" strokeWidth={2} />
          </button>
        ))}
      </div>
    </div>
  );
}
