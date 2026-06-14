import { X, Fingerprint, CornerDownLeft } from 'lucide-react';
import type { LabScreen } from '../data';
import { WALLET, HOME_ITEMS, HIST, SIGN, SEED } from '../data';
import { HazardBar, Pill } from '../atoms';

/**
 * TECHWEAR style — high-contrast sticker collage (reference image 2, color
 * dropped to 2-tone). Solid black + paper blocks, bold condensed uppercase,
 * pills, hazard stripes. Bounded layouts, no scroll.
 */
export function TechwearStyle({ screen }: { screen: LabScreen }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      {screen === 'home' && <Home />}
      {screen === 'sign' && <Sign />}
      {screen === 'history' && <History />}
      {screen === 'seed' && <Seed />}
    </div>
  );
}

const INV = 'active:bg-[#838383] active:text-black';
const NRM = 'active:bg-black active:text-[#838383]';

function Home() {
  return (
    <>
      <div className="bg-black text-[#838383] px-3 py-2.5 flex items-center gap-2.5 flex-shrink-0">
        <span className="text-[32px] font-black tracking-tighter leading-none">P9</span>
        <div className="leading-none min-w-0">
          <div className="text-[9px] tracking-[0.2em] font-bold">PRODUCT OF</div>
          <div className="text-lg font-black truncate">{WALLET.name}</div>
        </div>
        <span className="ml-auto text-[11px] font-black tracking-widest border-2 border-[#838383] px-2 py-1 leading-none">{WALLET.battery}%</span>
      </div>
      <HazardBar className="h-3 text-black flex-shrink-0" />
      <div className="flex-1 grid grid-cols-2 gap-1.5 p-1.5 min-h-0">
        {HOME_ITEMS.map((m, i) => {
          const inv = i % 2 === 0;
          return (
            <button key={m.id} className={`flex flex-col justify-between p-2.5 border-2 border-black ${inv ? `bg-black text-[#838383] ${INV}` : `bg-[#838383] text-black ${NRM}`}`}>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black tracking-widest">{m.code}</span>
                <span className="w-2 h-2 bg-current" />
              </div>
              <div>
                <div className="text-[26px] font-black uppercase leading-[0.85] tracking-tight">{m.label}</div>
                <div className="text-[10px] mt-1 tracking-wide">{m.sub}</div>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

function Sign() {
  return (
    <>
      <div className="bg-black text-[#838383] px-3 py-2.5 flex items-center justify-between flex-shrink-0">
        <span className="text-2xl font-black tracking-tighter uppercase">Confirm Send</span>
        <span className="text-[10px] font-black tracking-widest">{SIGN.network}</span>
      </div>
      <HazardBar className="h-3 text-black flex-shrink-0" />
      <div className="px-3 pt-3 pb-2 flex-shrink-0">
        <div className="text-[10px] font-black tracking-[0.2em] uppercase">Send Amount</div>
        <div className="text-[76px] font-black leading-[0.78] tracking-tighter tabular-nums">500</div>
        <div className="flex items-center gap-2 mt-1"><Pill filled>USDT</Pill><span className="text-sm font-black">{SIGN.fiat}</span></div>
      </div>
      <div className="mx-3 mb-2 border-2 border-black flex items-stretch flex-shrink-0">
        <div className="bg-black text-[#838383] px-2.5 flex items-center text-[11px] font-black tracking-widest uppercase">To</div>
        <div className="flex-1 px-2.5 py-1.5 flex items-center justify-between min-w-0">
          <span className="text-base font-black truncate">{SIGN.to}</span>
          <span className="text-[11px] flex-shrink-0 ml-2">{SIGN.address}</span>
        </div>
      </div>
      <div className="flex-1 min-h-0" />
      <div className="px-3 pb-1.5 flex items-center justify-between flex-shrink-0">
        <span className="text-[10px] font-black uppercase tracking-widest">Network Fee</span>
        <span className="text-lg font-black">{SIGN.fee}</span>
      </div>
      <div className="flex gap-1.5 px-1.5 pb-1.5 flex-shrink-0">
        <button className={`w-16 h-14 border-2 border-black bg-[#838383] flex items-center justify-center ${NRM}`} aria-label="Reject"><X className="w-6 h-6" strokeWidth={2.5} /></button>
        <button className={`flex-1 h-14 bg-black text-[#838383] border-2 border-black flex items-center justify-center gap-2 text-base font-black uppercase tracking-[0.15em] ${INV}`}><Fingerprint className="w-5 h-5" strokeWidth={2.5} />Hold · Sign</button>
      </div>
    </>
  );
}

function History() {
  return (
    <>
      <div className="bg-black text-[#838383] px-3 py-2.5 flex items-center justify-between flex-shrink-0">
        <span className="text-2xl font-black uppercase tracking-tighter">History</span>
        <span className="text-[11px] font-black tracking-widest border-2 border-[#838383] px-2 py-0.5 leading-none">{HIST.length} REC</span>
      </div>
      <div className="flex-1 grid min-h-0 gap-1.5 p-1.5" style={{ gridTemplateRows: `repeat(${HIST.length}, minmax(0, 1fr))` }}>
        {HIST.map((e) => (
          <button key={e.idx} className={`flex items-center gap-2.5 px-2.5 border-2 border-black ${e.ok ? `bg-[#838383] text-black ${NRM}` : `bg-black text-[#838383] ${INV}`}`}>
            <span className="text-[28px] font-black leading-none w-9">{e.idx}</span>
            <div className="flex-1 min-w-0">
              <div className="text-lg font-black uppercase leading-none truncate tracking-tight">{e.title}</div>
              <div className="text-[9px] tracking-widest mt-1 truncate">{e.type} · {e.time}</div>
            </div>
            <span className="text-[11px] font-black tracking-widest">{e.ok ? 'OK' : 'REJ'}</span>
          </button>
        ))}
      </div>
    </>
  );
}

function Seed() {
  return (
    <>
      <div className="bg-black text-[#838383] px-3 py-2.5 flex items-center justify-between flex-shrink-0">
        <span className="text-2xl font-black uppercase tracking-tighter">Recovery</span>
        <span className="text-lg font-black">{String(SEED.current).padStart(2, '0')}/{SEED.count}</span>
      </div>
      <HazardBar className="h-3 text-black flex-shrink-0" />
      <div className="px-3 py-2 flex flex-wrap gap-1 flex-shrink-0">
        {SEED.entered.map((w, i) => <Pill key={i}>{i + 1}·{w}</Pill>)}
      </div>
      <div className="mx-3 border-2 border-black px-3 h-12 flex items-center flex-shrink-0">
        <span className="text-2xl font-black">ba</span><span className="w-1 h-6 bg-black ml-1" />
      </div>
      <div className="flex-1 flex flex-col gap-1.5 p-1.5 min-h-0">
        {SEED.suggestions.map((w, i) => (
          <button key={w} className={`flex-1 border-2 border-black flex items-center justify-between px-3 ${i === 0 ? `bg-black text-[#838383] ${INV}` : `bg-[#838383] text-black ${NRM}`}`}>
            <span className="text-2xl font-black lowercase">{w}</span>
            <CornerDownLeft className="w-6 h-6" strokeWidth={2.5} />
          </button>
        ))}
      </div>
    </>
  );
}
