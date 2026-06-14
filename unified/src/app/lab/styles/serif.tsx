import { ChevronRight, Fingerprint } from 'lucide-react';
import type { LabScreen } from '../data';
import { WALLET, HOME_ITEMS, HIST, SIGN, SEED } from '../data';

/**
 * SERIF style — editorial serif + tone-block cards (reference 4, meal plan).
 * The reference's colour blocks become 2-color "tones": solid black, dithered
 * (ink-25), and outlined. Serif headings, sans micro-labels, circular arrow
 * buttons. #838383 base. Bounded grids, no scroll.
 */
export function SerifStyle({ screen }: { screen: LabScreen }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black font-serif">
      {screen === 'home' && <Home />}
      {screen === 'sign' && <Sign />}
      {screen === 'history' && <History />}
      {screen === 'seed' && <Seed />}
    </div>
  );
}

// 3 "tones" cycling like the reference's 3 card colours.
function toneClass(i: number) {
  const t = i % 3;
  if (t === 0) return 'bg-black text-[#838383] active:bg-[#838383] active:text-black';
  if (t === 1) return 'ink-25 border-2 border-black text-black active:bg-black active:text-[#838383]';
  return 'border-2 border-black text-black active:bg-black active:text-[#838383]';
}
function Arrow() {
  return <span className="w-8 h-8 rounded-full border-2 border-current grid place-items-center flex-shrink-0"><ChevronRight className="w-4 h-4" strokeWidth={2.5} /></span>;
}

function Home() {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-4 pt-4 pb-1 flex-shrink-0">
        <div className="font-sans text-[10px] tracking-[0.25em] uppercase">{WALLET.model}</div>
        <div className="text-[34px] font-bold leading-none mt-1">{WALLET.name}</div>
      </div>
      <div className="flex-1 grid gap-2 px-3 py-3 min-h-0" style={{ gridTemplateRows: `repeat(${HOME_ITEMS.length}, minmax(0, 1fr))` }}>
        {HOME_ITEMS.map((m, i) => (
          <button key={m.id} className={`rounded-[12px] px-4 flex items-center gap-3 text-left ${toneClass(i)}`}>
            <div className="flex-1 min-w-0">
              <div className="font-sans text-[10px] tracking-[0.18em] uppercase">{m.code}</div>
              <div className="text-[22px] font-bold leading-tight">{m.label}</div>
              <div className="font-sans text-[11px] truncate">{m.sub}</div>
            </div>
            <Arrow />
          </button>
        ))}
      </div>
    </div>
  );
}

function History() {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-4 pt-4 pb-1 flex items-baseline justify-between flex-shrink-0">
        <span className="text-[28px] font-bold leading-none">Sign history</span>
        <span className="font-sans text-[11px] tracking-widest">{HIST.length} items</span>
      </div>
      <div className="flex-1 grid gap-2 px-3 py-3 min-h-0" style={{ gridTemplateRows: `repeat(${HIST.length}, minmax(0, 1fr))` }}>
        {HIST.map((e, i) => (
          <button key={e.idx} className={`rounded-[12px] px-4 flex items-center gap-3 text-left ${toneClass(i)}`}>
            <div className="flex-1 min-w-0">
              <div className="font-sans text-[10px] tracking-[0.18em] uppercase">{e.date} · {e.type}</div>
              <div className="text-[21px] font-bold leading-tight truncate">{e.title}</div>
              <div className="font-sans text-[11px] truncate">{e.sub}</div>
            </div>
            <span className="font-sans text-[10px] tracking-widest flex-shrink-0">{e.ok ? 'OK' : 'REJ'}</span>
            <Arrow />
          </button>
        ))}
      </div>
    </div>
  );
}

function Sign() {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-4 pt-4 pb-2 flex items-baseline justify-between flex-shrink-0">
        <span className="text-[24px] font-bold">Confirm send</span>
        <span className="font-sans text-[10px] tracking-widest uppercase">{SIGN.network}</span>
      </div>
      <div className="px-4 flex-shrink-0">
        <div className="font-sans text-[10px] tracking-[0.25em] uppercase">Amount</div>
        <div className="text-[66px] font-bold leading-[0.82] tabular-nums">500<span className="text-2xl ml-2">USDT</span></div>
        <div className="font-sans text-[12px] mt-1.5">≈ {SIGN.fiat}</div>
      </div>
      <div className="flex-1 px-3 py-3 grid gap-2 min-h-0" style={{ gridTemplateRows: 'repeat(2, minmax(0, 1fr))' }}>
        <div className="ink-25 border-2 border-black rounded-[12px] px-4 flex items-center min-w-0">
          <div className="flex-1 min-w-0">
            <div className="font-sans text-[10px] tracking-widest uppercase">To</div>
            <div className="text-[19px] font-bold truncate">{SIGN.to}</div>
            <div className="font-sans text-[11px] truncate">{SIGN.address}</div>
          </div>
        </div>
        <div className="border-2 border-black rounded-[12px] px-4 flex items-center justify-between">
          <div><div className="font-sans text-[10px] tracking-widest uppercase">Network fee</div><div className="text-[19px] font-bold">{SIGN.fee}</div></div>
        </div>
      </div>
      <div className="flex gap-2 px-3 pb-3 flex-shrink-0">
        <button className="px-6 h-12 rounded-full border-2 border-black font-sans text-sm font-bold uppercase tracking-wide active:bg-black active:text-[#838383]">Reject</button>
        <button className="flex-1 h-12 rounded-full bg-black text-[#838383] font-sans text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 active:bg-[#838383] active:text-black"><Fingerprint className="w-5 h-5" strokeWidth={2.5} />Hold to sign</button>
      </div>
    </div>
  );
}

function Seed() {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-4 pt-4 pb-1 flex items-baseline justify-between flex-shrink-0">
        <span className="text-[26px] font-bold leading-none">Recovery phrase</span>
        <span className="font-sans text-[11px] tracking-widest">{String(SEED.current).padStart(2, '0')}/{SEED.count}</span>
      </div>
      <div className="px-4 font-sans text-[12px] flex-shrink-0">Word {SEED.current} of {SEED.count}. Entered: {SEED.entered.join(', ')}.</div>
      <div className="px-4 py-3 flex-shrink-0">
        <div className="border-b-2 border-black pb-1 flex items-baseline">
          <span className="text-[30px] font-bold">ba</span><span className="w-0.5 h-7 bg-black ml-1 self-center" />
        </div>
      </div>
      <div className="flex-1 grid gap-2 px-3 pb-3 min-h-0" style={{ gridTemplateRows: 'repeat(3, minmax(0, 1fr))' }}>
        {SEED.suggestions.map((w, i) => (
          <button key={w} className={`rounded-[12px] px-4 flex items-center justify-between ${toneClass(i)}`}>
            <span className="text-[24px] font-bold lowercase">{w}</span>
            <Arrow />
          </button>
        ))}
      </div>
    </div>
  );
}
