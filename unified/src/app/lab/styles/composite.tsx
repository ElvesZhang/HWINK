import { ChevronRight, Fingerprint, X } from 'lucide-react';
import type { LabScreen } from '../data';
import { WALLET, HOME_ITEMS, HIST, SIGN, SEED } from '../data';

/**
 * COMPOSITE — the "house blend" of the four kept elements:
 *  · Shadow   → hard offset shadows on raised cards (.hard-shadow-sm)
 *  · Serif    → serif display type + tone cards (font-serif, ink-25)
 *  · Editorial→ big numerals, inverted date/label chips, hairline rules, weight
 *  · Techwear → bold bordered status tags
 * Serif for display; sans for micro-labels. #838383 base. Bounded, no scroll.
 */
export function CompositeStyle({ screen }: { screen: LabScreen }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black font-serif">
      {screen === 'home' && <Home />}
      {screen === 'sign' && <Sign />}
      {screen === 'history' && <History />}
      {screen === 'seed' && <Seed />}
    </div>
  );
}

// inverted chip (Editorial/Techwear); `tag` = bordered status tag (Techwear)
function Chip({ children }: { children: React.ReactNode }) {
  return <span className="font-sans inline-flex items-center bg-black text-[#838383] text-[10px] font-bold leading-none px-1.5 py-1 tracking-wide">{children}</span>;
}
function Tag({ children }: { children: React.ReactNode }) {
  return <span className="font-sans text-[9px] font-bold tracking-widest uppercase border-2 border-black px-1.5 py-0.5 leading-none">{children}</span>;
}

function Home() {
  return (
    <div className="flex-1 flex flex-col min-h-0 p-3 gap-3">
      {/* identity — raised hard-shadow-sm card */}
      <div className="rounded-[14px] border-2 border-black hard-shadow-sm bg-[#838383] px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="min-w-0">
          <div className="font-sans text-[10px] tracking-[0.2em] uppercase">◆ Wallet</div>
          <div className="text-[30px] font-bold leading-none mt-0.5 truncate">{WALLET.name}</div>
        </div>
        <Chip>{WALLET.battery}%</Chip>
      </div>
      {/* index — editorial hairline rows, serif numerals + chips */}
      <div className="flex-1 flex flex-col min-h-0">
        {HOME_ITEMS.map((m, i) => (
          <button key={m.id} className="flex-1 flex items-center gap-3.5 px-1 border-t border-black text-left active:bg-black active:text-[#838383]">
            <span className="text-[40px] font-bold leading-none w-[54px] tabular-nums flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
            <div className="flex-1 min-w-0">
              <div className="text-[21px] font-bold leading-tight">{m.label}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-sans text-[11px] truncate">{m.sub}</span>
                <Tag>{m.code}</Tag>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 flex-shrink-0" strokeWidth={2} />
          </button>
        ))}
      </div>
    </div>
  );
}

function History() {
  const [first, ...rest] = HIST;
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-4 pt-3.5 pb-2 flex items-baseline justify-between flex-shrink-0">
        <span className="text-[26px] font-bold leading-none">Sign history</span>
        <Chip>{HIST.length} REC</Chip>
      </div>
      {/* featured — raised serif tone card */}
      <div className="px-3 flex-shrink-0">
        <button className="w-full rounded-[14px] border-2 border-black hard-shadow-sm ink-25 px-4 py-3 flex items-center gap-3 text-left active:bg-black active:text-[#838383]">
          <span className="text-[40px] font-bold leading-none tabular-nums flex-shrink-0">{first.idx}</span>
          <div className="flex-1 min-w-0">
            <Chip>{first.date} · {first.time}</Chip>
            <div className="text-[20px] font-bold leading-tight truncate mt-1">{first.title}</div>
            <div className="font-sans text-[11px] truncate">{first.type} · {first.sub}</div>
          </div>
          <Tag>{first.ok ? 'Signed' : 'Rej'}</Tag>
        </button>
      </div>
      {/* rest — editorial hairline rows */}
      <div className="flex-1 grid min-h-0 mt-2" style={{ gridTemplateRows: `repeat(${rest.length}, minmax(0, 1fr))` }}>
        {rest.map((e) => (
          <button key={e.idx} className="flex items-center gap-3 px-4 border-t border-black text-left active:bg-black active:text-[#838383]">
            <span className="text-[30px] font-bold leading-none w-[42px] tabular-nums flex-shrink-0">{e.idx}</span>
            <div className="flex-1 min-w-0">
              <div className="text-[17px] font-bold leading-tight truncate">{e.title}</div>
              <div className="font-sans text-[10px] truncate">{e.type} · {e.date} {e.time}</div>
            </div>
            <span className="font-sans text-[9px] font-bold tracking-widest flex-shrink-0">{e.ok ? 'OK' : 'REJ'}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Sign() {
  return (
    <div className="flex-1 flex flex-col min-h-0 p-3 gap-3">
      <div className="flex items-baseline justify-between flex-shrink-0">
        <span className="text-2xl font-bold">Confirm send</span>
        <Chip>{SIGN.network}</Chip>
      </div>
      <div className="flex-shrink-0 border-b-2 border-black pb-2">
        <div className="font-sans text-[10px] tracking-[0.25em] uppercase">Amount</div>
        <div className="flex items-baseline gap-2">
          <span className="text-[64px] font-bold leading-[0.8] tabular-nums">500</span>
          <span className="text-2xl font-bold">USDT</span>
          <span className="font-sans text-[12px] ml-auto self-end">≈ {SIGN.fiat}</span>
        </div>
      </div>
      <div className="rounded-[14px] border-2 border-black hard-shadow-sm bg-[#838383] px-4 py-2.5 flex-shrink-0">
        <div className="font-sans text-[10px] tracking-widest uppercase">To</div>
        <div className="text-[19px] font-bold leading-tight truncate">{SIGN.to}</div>
        <div className="font-sans text-[11px] truncate">{SIGN.address}</div>
      </div>
      <div className="flex items-center justify-between border-t border-black pt-2 flex-shrink-0">
        <span className="font-sans text-[10px] tracking-widest uppercase">Network fee</span>
        <span className="text-[18px] font-bold">{SIGN.fee}</span>
      </div>
      <div className="flex-1 min-h-0" />
      <div className="flex gap-2.5 flex-shrink-0">
        <button className="px-6 h-14 rounded-full border-2 border-black font-sans text-sm font-bold uppercase tracking-wide active:bg-black active:text-[#838383]">Reject</button>
        <button className="flex-1 h-14 rounded-full bg-black text-[#838383] hard-shadow-sm border-2 border-black font-sans text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 active:bg-[#838383] active:text-black"><Fingerprint className="w-5 h-5" strokeWidth={2.5} />Hold to sign</button>
      </div>
    </div>
  );
}

function Seed() {
  return (
    <div className="flex-1 flex flex-col min-h-0 p-3 gap-2.5">
      <div className="flex items-baseline justify-between flex-shrink-0">
        <span className="text-2xl font-bold">Recovery phrase</span>
        <Chip>{String(SEED.current).padStart(2, '0')} / {SEED.count}</Chip>
      </div>
      <div className="border-b-2 border-black pb-1 flex items-baseline flex-shrink-0">
        <span className="text-[28px] font-bold">ba</span><span className="w-0.5 h-7 bg-black ml-1 self-center" />
        <span className="font-sans text-[10px] tracking-widest uppercase ml-auto self-end">word {SEED.current}</span>
      </div>
      <div className="flex-1 grid gap-2.5 min-h-0" style={{ gridTemplateRows: 'repeat(3, minmax(0, 1fr))' }}>
        {SEED.suggestions.map((w, i) => (
          <button key={w} className={`rounded-[12px] border-2 border-black hard-shadow-sm ${i === 0 ? 'ink-25' : 'bg-[#838383]'} px-4 flex items-center justify-between active:bg-black active:text-[#838383]`}>
            <span className="text-[24px] font-bold lowercase">{w}</span>
            <Tag>Pick</Tag>
          </button>
        ))}
      </div>
    </div>
  );
}
