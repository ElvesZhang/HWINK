import { Minus, Plus, ArrowUpRight, ChevronRight, X, Fingerprint } from 'lucide-react';
import type { LabScreen } from '../data';
import { WALLET, HOME_ITEMS, HIST, SIGN, SEED } from '../data';

/**
 * SHADOW / NEO style — big bold sans + rounded cards raised with HARD offset
 * shadows (reference "bankon"). The shadow is a solid black, zero-blur,
 * zero-alpha box-shadow → fully 1-bit safe (soft/blurred shadows are NOT, so
 * they're avoided). #838383 base. Bounded, no scroll (box-shadow adds no layout
 * height; it's clipped at the screen edge, which is fine).
 */
export function ShadowStyle({ screen }: { screen: LabScreen }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black p-3 gap-3">
      {screen === 'home' && <Home />}
      {screen === 'sign' && <Sign />}
      {screen === 'history' && <History />}
      {screen === 'seed' && <Seed />}
    </div>
  );
}

const CARD = 'rounded-[20px] border-2 border-black bg-[#838383] hard-shadow';
const CARD_SM = 'rounded-[16px] border-2 border-black bg-[#838383] hard-shadow-sm';
const PRESS = 'active:bg-black active:text-[#838383]';
const CIRC = 'w-9 h-9 rounded-full border-2 border-black grid place-items-center flex-shrink-0';

function Home() {
  return (
    <>
      <div className="flex items-center justify-between flex-shrink-0">
        <span className="text-[26px] font-black tracking-tight leading-none">{WALLET.name}</span>
        <span className="w-9 h-9 rounded-full bg-black flex-shrink-0" />
      </div>
      <div className="text-[24px] font-black leading-[0.95] tracking-tight flex-shrink-0">Your keys,<br />always offline.</div>
      <button className={`${CARD} p-4 flex-1 min-h-0 flex flex-col text-left ${PRESS}`}>
        <div className="flex items-center justify-between">
          <span className="text-lg font-black">Assets</span>
          <span className={CIRC}><Minus className="w-5 h-5" strokeWidth={2.5} /></span>
        </div>
        <div className="h-0.5 bg-black my-2.5" />
        <div className="text-[13px] leading-snug">{WALLET.networks} networks · {WALLET.tokens} tokens. Manage balances and connect cards.</div>
        <div className="mt-auto inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest"><ArrowUpRight className="w-4 h-4" strokeWidth={2.5} />Open</div>
      </button>
      <div className="grid grid-cols-2 gap-3 flex-shrink-0">
        {[['History', '6 sigs'], ['Settings', 'Device']].map(([t, s]) => (
          <button key={t} className={`${CARD_SM} h-[70px] px-4 flex items-center justify-between text-left ${PRESS}`}>
            <span><span className="block text-base font-black leading-none">{t}</span><span className="block text-[11px] mt-1">{s}</span></span>
            <span className="w-8 h-8 rounded-full border-2 border-black grid place-items-center flex-shrink-0"><Plus className="w-4 h-4" strokeWidth={2.5} /></span>
          </button>
        ))}
      </div>
    </>
  );
}

function Sign() {
  return (
    <>
      <div className="flex items-center justify-between flex-shrink-0">
        <span className="text-xl font-black tracking-tight">Confirm Send</span>
        <span className="rounded-full bg-black text-[#838383] text-[11px] font-black uppercase tracking-widest px-3 h-7 flex items-center">{SIGN.network}</span>
      </div>
      <div className={`${CARD} p-4 flex-shrink-0`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[11px] font-black uppercase tracking-widest">Amount</div>
            <div className="text-[52px] font-black leading-none tabular-nums mt-1">500<span className="text-xl ml-2">USDT</span></div>
            <div className="text-[12px] mt-1.5">≈ {SIGN.fiat}</div>
          </div>
          <span className={CIRC}><Minus className="w-5 h-5" strokeWidth={2.5} /></span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
        <div className={`${CARD_SM} p-3 flex flex-col justify-center min-w-0`}>
          <div className="text-[10px] font-black uppercase tracking-widest">To</div>
          <div className="text-base font-black truncate mt-1">{SIGN.to}</div>
          <div className="text-[11px] truncate">{SIGN.address}</div>
        </div>
        <div className={`${CARD_SM} p-3 flex flex-col justify-center`}>
          <div className="text-[10px] font-black uppercase tracking-widest">Fee</div>
          <div className="text-base font-black mt-1">{SIGN.fee}</div>
        </div>
      </div>
      <div className="flex gap-3 flex-shrink-0">
        <button className={`w-16 h-14 rounded-full border-2 border-black bg-[#838383] hard-shadow-sm grid place-items-center ${PRESS}`} aria-label="Reject"><X className="w-6 h-6" strokeWidth={2.5} /></button>
        <button className="flex-1 h-14 rounded-full bg-black text-[#838383] hard-shadow flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest active:bg-[#838383] active:text-black border-2 border-black"><Fingerprint className="w-5 h-5" strokeWidth={2.5} />Hold to Sign</button>
      </div>
    </>
  );
}

function History() {
  return (
    <>
      <div className="flex items-baseline justify-between flex-shrink-0">
        <span className="text-2xl font-black tracking-tight">History</span>
        <span className="text-[11px] font-black tracking-widest">{HIST.length} REC</span>
      </div>
      <div className="flex-1 grid gap-3 min-h-0" style={{ gridTemplateRows: `repeat(${HIST.length}, minmax(0, 1fr))` }}>
        {HIST.map((e) => (
          <button key={e.idx} className={`${CARD_SM} px-4 flex items-center gap-3 text-left ${PRESS}`}>
            <div className="flex-1 min-w-0">
              <div className="text-lg font-black leading-none truncate">{e.title}</div>
              <div className="text-[11px] mt-1.5 truncate">{e.type} · {e.time}</div>
            </div>
            <span className="text-[10px] font-black tracking-widest flex-shrink-0">{e.ok ? 'OK' : 'REJ'}</span>
            <span className="w-8 h-8 rounded-full border-2 border-black grid place-items-center flex-shrink-0"><ChevronRight className="w-4 h-4" strokeWidth={2.5} /></span>
          </button>
        ))}
      </div>
    </>
  );
}

function Seed() {
  return (
    <>
      <div className="flex items-baseline justify-between flex-shrink-0">
        <span className="text-2xl font-black tracking-tight">Recovery</span>
        <span className="text-[11px] font-black tracking-widest">{String(SEED.current).padStart(2, '0')} / {SEED.count}</span>
      </div>
      <div className={`${CARD_SM} h-14 px-4 flex items-center flex-shrink-0`}>
        <span className="text-2xl font-black">ba</span><span className="w-0.5 h-6 bg-black ml-1" />
        <span className="ml-auto flex gap-1">{Array.from({ length: SEED.count }).map((_, i) => <span key={i} className={`w-1.5 h-1.5 rounded-full ${i < SEED.current ? 'bg-black' : 'border border-black'}`} />)}</span>
      </div>
      <div className="flex-1 grid gap-3 min-h-0" style={{ gridTemplateRows: 'repeat(3, minmax(0, 1fr))' }}>
        {SEED.suggestions.map((w) => (
          <button key={w} className={`${CARD_SM} px-4 flex items-center justify-between ${PRESS}`}>
            <span className="text-xl font-black lowercase">{w}</span>
            <span className="w-8 h-8 rounded-full border-2 border-black grid place-items-center flex-shrink-0"><Plus className="w-4 h-4" strokeWidth={2.5} /></span>
          </button>
        ))}
      </div>
    </>
  );
}
