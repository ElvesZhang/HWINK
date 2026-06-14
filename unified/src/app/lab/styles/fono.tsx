import { Menu, X, Fingerprint, ChevronRight } from 'lucide-react';
import type { LabScreen } from '../data';
import { WALLET, HIST, SIGN, SEED } from '../data';
import { Ring, Toggle } from '../atoms';

/**
 * FONO style — soft rounded dashboard (reference 1, "Aeonik Fono").
 * Mono type, rounded cards, line-art, circular Ring, ON/OFF Toggle. Friendly /
 * data-dense counterpoint to the hard editorial/industrial styles. #838383 base.
 */
export function FonoStyle({ screen }: { screen: LabScreen }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black font-mono">
      {screen === 'home' && <Home />}
      {screen === 'sign' && <Sign />}
      {screen === 'history' && <History />}
      {screen === 'seed' && <Seed />}
    </div>
  );
}

const CARD = 'rounded-[16px] border-2 border-black';

function Home() {
  return (
    <div className="flex-1 flex flex-col min-h-0 p-3 gap-2.5">
      <div className="flex items-center justify-between flex-shrink-0">
        <span className="text-[26px] font-black tracking-tight leading-none">{WALLET.name}</span>
        <Menu className="w-7 h-7" strokeWidth={2} />
      </div>
      <div className={`${CARD} px-4 py-3 flex items-center gap-3 flex-shrink-0`}>
        <div className="flex-1 min-w-0">
          <div className="text-[20px] font-black leading-none">Secured</div>
          <div className="text-[11px] mt-1.5 leading-tight">{WALLET.networks} networks · {WALLET.tokens} tokens protected</div>
        </div>
        <Ring pct={100} size={54} />
      </div>
      <div className="grid grid-cols-2 gap-2.5 flex-shrink-0">
        <div className={`${CARD} p-3`}>
          <div className="text-[10px] tracking-widest font-bold">ASSETS</div>
          <div className="text-[26px] font-black leading-none mt-2">$12.8k</div>
          <div className="text-[10px] tracking-widest mt-0.5">TOTAL VALUE</div>
        </div>
        <div className={`${CARD} p-3`}>
          <div className="text-[10px] tracking-widest font-bold">HISTORY</div>
          <div className="text-[26px] font-black leading-none mt-2">6</div>
          <div className="text-[10px] tracking-widest mt-0.5">SIGNATURES</div>
        </div>
      </div>
      <div className="flex-1 min-h-0 flex flex-col justify-end gap-2">
        <button className={`${CARD} h-12 px-4 flex items-center justify-between active:bg-black active:text-[#838383]`}>
          <span className="text-base font-black">Passkey · FIDO2</span><ChevronRight className="w-5 h-5" strokeWidth={2.5} />
        </button>
        <div className={`${CARD} h-12 px-4 flex items-center justify-between`}>
          <span className="text-base font-black">Auto-lock</span><Toggle on />
        </div>
        <button className={`${CARD} h-12 px-4 flex items-center justify-between active:bg-black active:text-[#838383]`}>
          <span className="text-base font-black">Settings</span><ChevronRight className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

function Sign() {
  return (
    <div className="flex-1 flex flex-col min-h-0 p-3 gap-2.5">
      <div className="flex items-center justify-between flex-shrink-0">
        <span className="text-xl font-black">Confirm Send</span>
        <span className="text-[11px] tracking-widest">{SIGN.network}</span>
      </div>
      <div className={`${CARD} px-4 py-3 flex-shrink-0`}>
        <div className="text-[10px] tracking-widest font-bold">AMOUNT</div>
        <div className="text-[46px] font-black leading-none mt-1">500<span className="text-lg ml-2">USDT</span></div>
        <div className="text-[11px] mt-1.5">≈ {SIGN.fiat}</div>
      </div>
      <div className="grid grid-cols-2 gap-2.5 flex-shrink-0">
        <div className={`${CARD} p-3 min-w-0`}><div className="text-[10px] tracking-widest font-bold">TO</div><div className="text-base font-black mt-1 truncate">{SIGN.to}</div><div className="text-[10px] truncate">{SIGN.address}</div></div>
        <div className={`${CARD} p-3`}><div className="text-[10px] tracking-widest font-bold">FEE</div><div className="text-base font-black mt-1">{SIGN.fee}</div></div>
      </div>
      <div className="flex-1 min-h-0" />
      <div className="flex gap-2.5 flex-shrink-0">
        <button className={`w-16 h-14 ${CARD} flex items-center justify-center active:bg-black active:text-[#838383]`} aria-label="Reject"><X className="w-6 h-6" strokeWidth={2.5} /></button>
        <button className="flex-1 h-14 rounded-[16px] bg-black text-[#838383] flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest active:bg-[#838383] active:text-black border-2 border-black"><Fingerprint className="w-5 h-5" strokeWidth={2.5} />Hold to Sign</button>
      </div>
    </div>
  );
}

function History() {
  return (
    <div className="flex-1 flex flex-col min-h-0 p-3 gap-2">
      <div className="flex items-center justify-between flex-shrink-0">
        <span className="text-2xl font-black">History</span>
        <span className="text-[11px] tracking-widest">{HIST.length} REC</span>
      </div>
      <div className="flex-1 grid gap-2 min-h-0" style={{ gridTemplateRows: `repeat(${HIST.length}, minmax(0, 1fr))` }}>
        {HIST.map((e) => (
          <button key={e.idx} className={`${CARD} px-3.5 flex items-center gap-3 text-left active:bg-black active:text-[#838383]`}>
            <div className="flex-1 min-w-0">
              <div className="text-lg font-black leading-none truncate">{e.title}</div>
              <div className="text-[10px] tracking-wide mt-1.5 truncate">{e.type} · {e.time}</div>
            </div>
            <span className="text-[10px] tracking-widest">{e.ok ? 'OK' : 'REJ'}</span>
            <span className={`w-3 h-3 rounded-full ${e.ok ? 'bg-black' : 'border-2 border-black'}`} />
          </button>
        ))}
      </div>
    </div>
  );
}

function Seed() {
  return (
    <div className="flex-1 flex flex-col min-h-0 p-3 gap-2.5">
      <div className="flex items-center justify-between flex-shrink-0">
        <span className="text-2xl font-black">Recovery</span>
        <span className="text-[11px] tracking-widest">{String(SEED.current).padStart(2, '0')} / {SEED.count}</span>
      </div>
      <div className="flex gap-1 flex-shrink-0">
        {Array.from({ length: SEED.count }).map((_, i) => (
          <div key={i} className={`flex-1 h-2 rounded-full ${i < SEED.current ? 'bg-black' : 'border-2 border-black'}`} />
        ))}
      </div>
      <div className={`${CARD} h-12 flex items-center px-4 flex-shrink-0`}>
        <span className="text-xl font-black">ba</span><span className="w-0.5 h-6 bg-black ml-1" />
        <span className="ml-auto text-[10px] tracking-widest">WORD {String(SEED.current).padStart(2, '0')}</span>
      </div>
      <div className="flex-1 grid gap-2 min-h-0" style={{ gridTemplateRows: 'repeat(3, minmax(0, 1fr))' }}>
        {SEED.suggestions.map((w) => (
          <button key={w} className={`${CARD} flex items-center justify-between px-4 active:bg-black active:text-[#838383]`}>
            <span className="text-xl font-black lowercase">{w}</span>
            <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
          </button>
        ))}
      </div>
    </div>
  );
}
