import { ChevronRight, X, Fingerprint } from 'lucide-react';
import type { LabScreen } from '../data';
import { WALLET, HOME_ITEMS, HIST, SIGN, SEED } from '../data';
import { Reticle, Gauge, HudFrame } from '../atoms';

/**
 * HUD style — sci-fi line-art (reference image 3). Inverts the field to BLACK
 * with thin light strokes/labels (#838383 = "white" on the device; becomes
 * true white under the 1-bit preview). Reticles, gauges, corner frames,
 * connector ticks. Bounded layouts, no scroll.
 */
export function HudStyle({ screen }: { screen: LabScreen }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-black text-[#838383]">
      {screen === 'home' && <Home />}
      {screen === 'sign' && <Sign />}
      {screen === 'history' && <History />}
      {screen === 'seed' && <Seed />}
    </div>
  );
}

const HBORDER = 'border-[#838383]';

function Home() {
  return (
    <div className="flex-1 flex flex-col min-h-0 p-3">
      <div className="flex items-center gap-2 text-[11px] tracking-[0.2em] font-bold">
        <Reticle size={16} />
        <span>SYS · ONLINE</span>
        <span className="ml-auto flex items-center gap-1.5"><Gauge size={22} />{WALLET.battery}%</span>
      </div>
      <div className="mt-3 text-[30px] font-black tracking-tight leading-none">{WALLET.name}</div>
      <div className="text-[10px] tracking-[0.25em] mt-1.5">{WALLET.model} · {WALLET.networks} NET · {WALLET.tokens} TKN</div>
      <div className="flex-1 mt-3 grid grid-cols-2 gap-2 min-h-0">
        {HOME_ITEMS.map((m) => (
          <button key={m.id} className="text-left active:bg-[#838383] active:text-black">
            <HudFrame pad="p-2.5" className="h-full flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[9px] tracking-widest font-bold">{m.code}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
              </div>
              <div>
                <div className="text-[17px] font-black leading-tight">{m.label}</div>
                <div className="text-[9px] tracking-wide mt-0.5">{m.sub}</div>
              </div>
            </HudFrame>
          </button>
        ))}
      </div>
    </div>
  );
}

function Sign() {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className={`px-3 py-2 flex items-center text-[11px] tracking-[0.2em] font-bold border-b ${HBORDER}`}>
        <span>CONFIRM · SEND</span><span className="ml-auto">{SIGN.network}</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <Reticle size={30} className="mb-2" />
        <div className="text-[11px] tracking-[0.3em]">AMOUNT</div>
        <div className="text-[70px] font-black leading-[0.8] tabular-nums">500</div>
        <div className="text-lg font-black tracking-[0.2em] mt-1">USDT</div>
        <div className="text-[12px] mt-1.5">≈ {SIGN.fiat}</div>
      </div>
      <div className={`grid grid-cols-2 border-t ${HBORDER}`}>
        <div className={`p-3 border-r ${HBORDER} min-w-0`}>
          <div className="text-[9px] tracking-widest">TARGET</div>
          <div className="text-[15px] font-black truncate">{SIGN.to}</div>
          <div className="text-[11px] truncate">{SIGN.address}</div>
        </div>
        <div className="p-3">
          <div className="text-[9px] tracking-widest">NETWORK FEE</div>
          <div className="text-[15px] font-black">{SIGN.fee}</div>
        </div>
      </div>
      <div className={`flex border-t ${HBORDER}`}>
        <button className={`w-16 h-14 border-r ${HBORDER} flex items-center justify-center active:bg-[#838383] active:text-black`} aria-label="Reject"><X className="w-6 h-6" strokeWidth={2} /></button>
        <button className="flex-1 h-14 flex items-center justify-center gap-2 text-[15px] font-black tracking-[0.2em] active:bg-[#838383] active:text-black"><Fingerprint className="w-6 h-6" strokeWidth={2} />HOLD TO SIGN</button>
      </div>
    </div>
  );
}

function History() {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className={`px-3 py-2 flex items-center gap-2 border-b ${HBORDER}`}>
        <Reticle size={16} />
        <span className="text-[12px] tracking-[0.2em] font-bold">SIGNAL LOG</span>
        <span className="ml-auto text-[10px] tracking-widest">{HIST.length} REC</span>
      </div>
      <div className="flex-1 grid min-h-0" style={{ gridTemplateRows: `repeat(${HIST.length}, minmax(0, 1fr))` }}>
        {HIST.map((e, i) => (
          <button key={e.idx} className={`flex items-center gap-2.5 px-3 text-left ${i > 0 ? `border-t ${HBORDER}` : ''} active:bg-[#838383] active:text-black`}>
            <span className="text-[13px] font-black w-5">{e.idx}</span>
            <span className={`w-2.5 h-2.5 flex-shrink-0 ${e.ok ? 'bg-current' : 'border border-current'}`} />
            <div className="flex-1 min-w-0">
              <div className="text-[16px] font-black leading-none truncate">{e.title}</div>
              <div className="text-[9px] tracking-wide truncate mt-0.5">{e.type} · {e.date} {e.time}</div>
            </div>
            <span className="text-[9px] tracking-widest">{e.ok ? 'ACK' : 'NAK'}</span>
            <ChevronRight className="w-4 h-4" strokeWidth={2} />
          </button>
        ))}
      </div>
    </div>
  );
}

function Seed() {
  return (
    <div className="flex-1 flex flex-col min-h-0 p-3">
      <div className="flex items-center gap-2">
        <Reticle size={16} />
        <span className="text-[12px] tracking-[0.2em] font-bold">KEY INPUT</span>
        <span className="ml-auto text-[13px] font-black">{String(SEED.current).padStart(2, '0')} / {SEED.count}</span>
      </div>
      <div className="flex gap-1 mt-3">
        {Array.from({ length: SEED.count }).map((_, i) => (
          <div key={i} className={`flex-1 h-1.5 ${i < SEED.current ? 'bg-current' : 'border border-current'}`} />
        ))}
      </div>
      <HudFrame pad="p-3" className="mt-3">
        <div className="text-[9px] tracking-widest">PREFIX</div>
        <div className="text-2xl font-black">ba<span className="inline-block w-0.5 h-6 bg-current align-middle ml-1" /></div>
      </HudFrame>
      <div className="flex-1 mt-3 flex flex-col gap-2 min-h-0">
        {SEED.suggestions.map((w) => (
          <button key={w} className="active:bg-[#838383] active:text-black">
            <HudFrame pad="px-3 py-2.5" className="flex items-center gap-2.5">
              <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
              <span className="text-xl font-black lowercase">{w}</span>
            </HudFrame>
          </button>
        ))}
      </div>
    </div>
  );
}
