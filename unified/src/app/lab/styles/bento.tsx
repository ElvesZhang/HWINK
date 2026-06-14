import { ChevronRight, X, Fingerprint } from 'lucide-react';
import type { LabScreen } from '../data';
import { WALLET, HIST, SIGN, SEED } from '../data';

/**
 * BENTO style — modular OS grid (reference 5, "Tlon"). Thin bordered square
 * modules with distinctive line-art glyphs, counts and status dots. #838383
 * base. Bounded grids, no scroll.
 */
export function BentoStyle({ screen }: { screen: LabScreen }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black p-2 gap-2">
      {screen === 'home' && <Home />}
      {screen === 'sign' && <Sign />}
      {screen === 'history' && <History />}
      {screen === 'seed' && <Seed />}
    </div>
  );
}

const MOD = 'border-2 border-black rounded-[7px]';

function Glyph({ id, size = 36 }: { id: string; size?: number }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, 'aria-hidden': true } as const;
  if (id === 'nodes') return (<svg {...p}><circle cx="12" cy="12" r="2.5" />{[0, 60, 120, 180, 240, 300].map(a => { const r = (a * Math.PI) / 180; return <g key={a}><line x1={12 + Math.cos(r) * 3} y1={12 + Math.sin(r) * 3} x2={12 + Math.cos(r) * 8} y2={12 + Math.sin(r) * 8} /><circle cx={12 + Math.cos(r) * 9.5} cy={12 + Math.sin(r) * 9.5} r="1.6" /></g>; })}</svg>);
  if (id === 'doc') return (<svg {...p}><rect x="5" y="3" width="14" height="18" rx="1.5" /><line x1="8" y1="8" x2="16" y2="8" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="8" y1="16" x2="13" y2="16" /></svg>);
  if (id === 'key') return (<svg {...p}><circle cx="9" cy="9" r="4.5" /><path d="M12.5 12.5 L20 20 M17 17 l2-2 M20 20 l-2 2" /></svg>);
  if (id === 'gear') return (<svg {...p}><circle cx="12" cy="12" r="3.5" />{Array.from({ length: 8 }).map((_, i) => { const a = (i * Math.PI) / 4; return <line key={i} x1={12 + Math.cos(a) * 6} y1={12 + Math.sin(a) * 6} x2={12 + Math.cos(a) * 9.5} y2={12 + Math.sin(a) * 9.5} strokeWidth={2} />; })}</svg>);
  if (id === 'send') return (<svg {...p}><path d="M4 12h13 M12 6l6 6-6 6" strokeWidth={2} /></svg>);
  if (id === 'coin') return (<svg {...p}><ellipse cx="12" cy="6.5" rx="7" ry="3" /><path d="M5 6.5V13c0 1.7 3.1 3 7 3s7-1.3 7-3V6.5 M5 13v4c0 1.7 3.1 3 7 3s7-1.3 7-3v-4" /></svg>);
  return (<svg {...p}><rect x="4" y="4" width="16" height="16" rx="2" /></svg>);
}

function Header({ title, right }: { title: string; right: string }) {
  return (
    <div className="flex items-center gap-2 px-1 flex-shrink-0">
      <span className="flex gap-1">{[0, 1, 2].map(i => <span key={i} className="w-2 h-2 rounded-full border-2 border-black" />)}</span>
      <span className="text-sm font-bold tracking-tight">{title}</span>
      <span className="ml-auto text-[11px] font-bold tracking-widest">{right}</span>
    </div>
  );
}

function Home() {
  const mods = [
    { t: 'Assets', g: 'coin', c: '12 tokens', dot: true },
    { t: 'History', g: 'doc', c: '6 signatures', dot: true },
    { t: 'Passkey', g: 'key', c: 'FIDO2', dot: false },
    { t: 'Settings', g: 'gear', c: 'Device', dot: false },
  ];
  return (
    <>
      <Header title={WALLET.name} right={`${WALLET.networks} NET`} />
      <div className="flex-1 grid grid-cols-2 gap-2 min-h-0">
        {mods.map((m) => (
          <button key={m.t} className={`${MOD} p-2.5 flex flex-col text-left active:bg-black active:text-[#838383]`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">{m.t}</span>
              {m.dot && <span className="w-2 h-2 rounded-full bg-black" />}
            </div>
            <div className="flex-1 grid place-items-center"><Glyph id={m.g} size={44} /></div>
            <span className="text-[11px] font-bold tracking-wide">{m.c}</span>
          </button>
        ))}
      </div>
    </>
  );
}

function Sign() {
  return (
    <>
      <Header title="Confirm · Send" right={SIGN.network} />
      <div className={`${MOD} px-3 py-2.5 flex-shrink-0`}>
        <div className="text-[10px] tracking-widest font-bold">AMOUNT</div>
        <div className="text-[50px] font-black leading-none tabular-nums">500<span className="text-xl ml-2">USDT</span></div>
        <div className="text-[11px] mt-1">≈ {SIGN.fiat}</div>
      </div>
      <div className="grid grid-cols-2 gap-2 flex-1 min-h-0">
        <div className={`${MOD} p-2.5 flex flex-col min-w-0`}>
          <span className="text-[10px] tracking-widest font-bold">TO</span>
          <div className="flex-1 grid place-items-center"><Glyph id="send" size={40} /></div>
          <span className="text-sm font-bold truncate">{SIGN.to}</span>
          <span className="text-[10px] truncate">{SIGN.address}</span>
        </div>
        <div className={`${MOD} p-2.5 flex flex-col`}>
          <span className="text-[10px] tracking-widest font-bold">NETWORK FEE</span>
          <div className="flex-1 grid place-items-center"><Glyph id="nodes" size={40} /></div>
          <span className="text-sm font-bold">{SIGN.fee}</span>
        </div>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button className={`w-16 h-14 ${MOD} grid place-items-center active:bg-black active:text-[#838383]`} aria-label="Reject"><X className="w-6 h-6" strokeWidth={2.5} /></button>
        <button className={`flex-1 h-14 ${MOD} bg-black text-[#838383] flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest active:bg-[#838383] active:text-black`}><Fingerprint className="w-5 h-5" strokeWidth={2.5} />Hold to Sign</button>
      </div>
    </>
  );
}

function History() {
  return (
    <>
      <Header title="Sign · Log" right={`${HIST.length} REC`} />
      <div className="flex-1 grid gap-2 min-h-0" style={{ gridTemplateRows: `repeat(${HIST.length}, minmax(0, 1fr))` }}>
        {HIST.map((e) => (
          <button key={e.idx} className={`${MOD} px-3 flex items-center gap-3 text-left active:bg-black active:text-[#838383]`}>
            <Glyph id={e.kind === 'sent' ? 'send' : 'doc'} size={26} />
            <div className="flex-1 min-w-0">
              <div className="text-base font-bold leading-none truncate">{e.title}</div>
              <div className="text-[10px] tracking-wide mt-1 truncate">{e.type} · {e.time}</div>
            </div>
            <span className="text-[10px] tracking-widest">{e.ok ? 'ACK' : 'NAK'}</span>
            <span className={`w-2.5 h-2.5 rounded-full ${e.ok ? 'bg-black' : 'border-2 border-black'}`} />
          </button>
        ))}
      </div>
    </>
  );
}

function Seed() {
  return (
    <>
      <Header title="Key · Input" right={`${String(SEED.current).padStart(2, '0')}/${SEED.count}`} />
      <div className={`${MOD} px-3 h-12 flex items-center flex-shrink-0`}>
        <span className="text-2xl font-black">ba</span><span className="w-0.5 h-6 bg-black ml-1" />
        <span className="ml-auto flex gap-1">{Array.from({ length: SEED.count }).map((_, i) => <span key={i} className={`w-1.5 h-1.5 rounded-full ${i < SEED.current ? 'bg-black' : 'border border-black'}`} />)}</span>
      </div>
      <div className="flex-1 grid gap-2 min-h-0" style={{ gridTemplateRows: 'repeat(3, minmax(0, 1fr))' }}>
        {SEED.suggestions.map((w) => (
          <button key={w} className={`${MOD} px-4 flex items-center justify-between active:bg-black active:text-[#838383]`}>
            <span className="text-xl font-black lowercase">{w}</span>
            <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
          </button>
        ))}
      </div>
    </>
  );
}
