import { ChevronRight, X } from 'lucide-react';
import type { LabScreen } from '../data';
import { WALLET, HOME_ITEMS, HIST, SIGN, SEED } from '../data';
import { Barcode, QrBlock, RegMark } from '../atoms';

/**
 * LABEL style — industrial spec-sheet / shipping-label (reference image 1).
 * Bordered label cells, mono codes, barcodes + QR, registration crosshairs,
 * inverted tags. Black on the #838383 field. Bounded layouts, no scroll.
 */
export function LabelStyle({ screen }: { screen: LabScreen }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black font-mono">
      {screen === 'home' && <Home />}
      {screen === 'sign' && <Sign />}
      {screen === 'history' && <History />}
      {screen === 'seed' && <Seed />}
    </div>
  );
}

const cap = 'font-bold tracking-[0.18em]';

function Home() {
  return (
    <>
      <div className="flex items-stretch border-b-2 border-black flex-shrink-0">
        <div className="bg-black text-[#838383] px-3 flex items-center text-3xl font-black">P</div>
        <div className="flex-1 px-3 py-2 min-w-0">
          <div className={`text-[9px] ${cap}`}>WALLET ASSET PACK 01</div>
          <div className="text-2xl font-black leading-none tracking-tight font-sans truncate">{WALLET.name}</div>
        </div>
        <div className="px-3 flex flex-col justify-center items-end border-l-2 border-black">
          <div className={`text-[9px] ${cap}`}>2025</div>
          <div className="text-[11px] font-black">FAL·11</div>
        </div>
      </div>
      <div className="flex-1 grid grid-cols-2 min-h-0">
        {HOME_ITEMS.map((m, i) => (
          <button key={m.id} className={`relative text-left p-2.5 flex flex-col ${i % 2 === 0 ? 'border-r-2' : ''} ${i < 2 ? 'border-b-2' : ''} border-black active:bg-black active:text-[#838383]`}>
            <div className="flex items-center justify-between">
              <span className={`text-[9px] ${cap}`}>LOCAL NAME</span>
              <RegMark size={13} />
            </div>
            <div className="text-xl font-black leading-tight mt-1.5 font-sans">{m.label}</div>
            <div className="text-[10px] tracking-wide leading-tight mt-0.5 font-sans">{m.sub}</div>
            <div className="mt-auto flex items-end justify-between gap-2">
              <span className="text-[11px] font-black">{m.code}</span>
              <div className="h-4 w-16"><Barcode /></div>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}

function Sign() {
  const fields: [string, string][] = [['MATERIM / TO', SIGN.to], ['BASE UNIT / ADDR', SIGN.address], ['INPUT / FEE', SIGN.fee]];
  return (
    <>
      <div className="flex items-stretch border-b-2 border-black flex-shrink-0">
        <div className="flex-1 px-3 py-2 min-w-0">
          <div className={`text-[9px] ${cap}`}>CONFIRM SEND · REFERENCE 100</div>
          <div className="text-3xl font-black tracking-tight leading-none">MHV-RST</div>
          <div className="text-[11px] mt-1">928173414151 · {SIGN.network}</div>
        </div>
        <div className="w-[60px] border-l-2 border-black flex items-center justify-center"><QrBlock size={46} seed="MHVRST" /></div>
      </div>
      <div className="h-7 border-b-2 border-black px-3 flex items-center flex-shrink-0"><div className="h-4 w-full"><Barcode /></div></div>
      <div className="px-3 py-3 border-b-2 border-black flex-shrink-0">
        <div className={`text-[9px] ${cap}`}>AMOUNT / INPUT 0015</div>
        <div className="flex items-baseline gap-2 font-sans">
          <span className="text-5xl font-black tabular-nums leading-none">500</span>
          <span className="text-lg font-black">USDT</span>
          <span className="ml-auto text-[11px] self-end font-mono">≈ {SIGN.fiat}</span>
        </div>
      </div>
      <div className="flex-1 grid grid-cols-3 min-h-0">
        {fields.map(([c, v], i) => (
          <div key={i} className={`p-2.5 ${i < 2 ? 'border-r-2' : ''} border-black flex flex-col min-w-0`}>
            <span className={`text-[8px] ${cap}`}>{c}</span>
            <span className="text-[12px] font-black mt-1.5 break-all leading-tight">{v}</span>
          </div>
        ))}
      </div>
      <div className="border-t-2 border-black flex items-stretch flex-shrink-0">
        <div className="flex-1 px-3 py-1.5">
          <div className={`text-[8px] ${cap}`}>VERIFY CODE</div>
          <div className="text-base font-black tracking-[0.3em]">{SIGN.verify}</div>
        </div>
        <button className="w-14 border-l-2 border-black flex items-center justify-center active:bg-black active:text-[#838383] font-sans"><X className="w-5 h-5" strokeWidth={2.5} /></button>
        <button className="px-5 bg-black text-[#838383] border-l-2 border-black text-sm font-black uppercase tracking-wide font-sans">Sign</button>
      </div>
    </>
  );
}

function History() {
  return (
    <>
      <div className="flex items-center justify-between px-3 py-2 border-b-2 border-black flex-shrink-0">
        <div>
          <div className={`text-[9px] ${cap}`}>SIGNATURE MANIFEST</div>
          <div className="text-xl font-black leading-none font-sans">INS · SHAPE DYS</div>
        </div>
        <span className="text-[11px] font-black">001-2123</span>
      </div>
      <div className="flex-1 grid min-h-0" style={{ gridTemplateRows: `repeat(${HIST.length}, minmax(0, 1fr))` }}>
        {HIST.map((e, i) => (
          <button key={e.idx} className={`flex items-center gap-2.5 px-3 text-left ${i > 0 ? 'border-t border-black' : ''} active:bg-black active:text-[#838383]`}>
            <span className="text-[12px] font-black w-5">{e.idx}</span>
            <div className="w-11 h-5 flex-shrink-0"><Barcode /></div>
            <div className="flex-1 min-w-0 font-sans">
              <div className="text-[15px] font-black leading-none truncate">{e.title}</div>
              <div className="text-[9px] tracking-wide truncate mt-0.5 font-mono">{e.type} · {e.date} {e.time}</div>
            </div>
            <span className="text-[9px] font-black tracking-widest">{e.ok ? 'OK' : 'NG'}</span>
            <span className="text-[10px]">{e.idx}-3234</span>
          </button>
        ))}
      </div>
    </>
  );
}

function Seed() {
  return (
    <>
      <div className="flex items-stretch border-b-2 border-black flex-shrink-0">
        <div className="flex-1 px-3 py-2">
          <div className={`text-[9px] ${cap}`}>RECOVERY INPUT 0015</div>
          <div className="text-2xl font-black leading-none font-sans">WORD {String(SEED.current).padStart(2, '0')} / {SEED.count}</div>
        </div>
        <div className="w-14 border-l-2 border-black flex items-center justify-center"><QrBlock size={42} seed="SEED03" /></div>
      </div>
      <div className="px-3 py-2 border-b-2 border-black flex flex-wrap gap-1.5 flex-shrink-0">
        {SEED.entered.map((w, i) => (
          <span key={i} className="text-[11px] border border-black px-1.5 py-0.5"><b>{String(i + 1).padStart(2, '0')}</b> {w}</span>
        ))}
      </div>
      <div className="px-3 py-2.5 border-b-2 border-black flex items-center gap-2 flex-shrink-0">
        <span className={`text-[9px] ${cap}`}>INPUT</span>
        <span className="text-xl font-black">ba</span>
        <span className="w-0.5 h-5 bg-black" />
        <div className="ml-auto h-5 w-24"><Barcode /></div>
      </div>
      <div className="flex-1 grid grid-rows-3 min-h-0">
        {SEED.suggestions.map((w, i) => (
          <button key={w} className={`flex items-center gap-3 px-3 text-left ${i > 0 ? 'border-t border-black' : ''} active:bg-black active:text-[#838383]`}>
            <span className="text-[10px] font-black w-10">00{i + 1}</span>
            <span className="text-xl font-black lowercase font-sans">{w}</span>
            <ChevronRight className="ml-auto w-5 h-5" strokeWidth={2.5} />
          </button>
        ))}
      </div>
    </>
  );
}
