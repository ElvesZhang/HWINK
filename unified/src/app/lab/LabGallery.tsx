import { useState } from 'react';
import { LayoutGrid, ArrowLeft, Maximize2, Minimize2 } from 'lucide-react';
import { LabDevice } from './LabPage';
import type { LabScreen, LabStyle } from './data';
import { STYLE_ORDER, STYLE_META, CELL_LABEL, occupiedCells, styleNo, type Archetype } from './styleMeta';

/**
 * LabGallery — the COMPARISON SURFACE. Renders every design language side by
 * side at ~3-inch physical scale for ONE archetype screen at a time, each with
 * a spec card (metaphor · composition cell · one-liner) and static annotations.
 *
 * Why it exists: flipping styles one-at-a-time makes the eye notice only font
 * size. Seeing them all at once, captioned by which COMPOSITION CELL they
 * occupy, makes structural differences (and convergence) legible instantly.
 *
 * This is a dev overlay OUTSIDE the device frame, so normal scrolling / greys
 * are fine here — the e-ink rules bind only the device screens it renders.
 */

// All 5 screens are comparable now. home/sign/history carry a tracked
// CompositionCell (the gated axis); seed/verify are keyboard-dense flows whose
// composition is constrained, so they show metaphor + annotations instead.
const SCREENS: [LabScreen, string][] = [['home', '首页 Home'], ['sign', '签名 Sign'], ['history', '列表 History'], ['seed', '助记词 Seed'], ['verify', '验证 Verify']];

interface LabGalleryProps {
  screen: LabScreen;
  onScreen: (s: LabScreen) => void;
  onPick: (s: LabStyle) => void;
  onExit: () => void;
}

/** A device rendered at scale, clipped to its scaled footprint. */
function Thumb({ screen, style, scale }: { screen: LabScreen; style: LabStyle; scale: number }) {
  return (
    <div
      className="overflow-hidden border-2 border-black bg-[#838383] flex-shrink-0"
      style={{ width: 400 * scale, height: 600 * scale }}
    >
      <div style={{ width: 400, height: 600, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col relative">
          <LabDevice screen={screen} style={style} />
        </div>
      </div>
    </div>
  );
}

export function LabGallery({ screen, onScreen, onPick, onExit }: LabGalleryProps) {
  const [scale, setScale] = useState(0.46);
  // home/sign/history have a tracked composition cell; seed/verify don't.
  const isArchetype = screen === 'home' || screen === 'sign' || screen === 'history';
  const arche = isArchetype ? (screen as Archetype) : null;

  const ids = STYLE_ORDER;
  const cellsUsed = arche ? occupiedCells(arche) : null;
  const colW = 400 * scale;

  return (
    <div className="min-h-screen bg-gray-200 text-gray-900">
      {/* sticky control bar */}
      <div className="sticky top-0 z-10 bg-white border-b-2 border-gray-300 shadow-sm">
        <div className="px-5 py-2.5 flex items-center gap-3 flex-wrap">
          <button onClick={onExit} className="h-8 px-3 rounded bg-gray-100 hover:bg-gray-200 text-xs font-bold flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2.5} />单屏
          </button>
          <div className="flex items-center gap-1.5 text-sm font-black">
            <LayoutGrid className="w-4 h-4" strokeWidth={2.5} />对照画廊 Gallery
          </div>
          <span className="text-[11px] text-gray-500">{ids.length} 个设计语言 · 真实 ~3″ 比例</span>

          {/* archetype toggle */}
          <div className="ml-2 flex rounded-md overflow-hidden border-2 border-gray-300">
            {SCREENS.map(([id, label]) => (
              <button
                key={id}
                onClick={() => onScreen(id)}
                className={`h-8 px-3 text-xs font-bold transition-colors ${screen === id ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* size toggle */}
          <div className="flex items-center gap-1 ml-auto">
            <button onClick={() => setScale((s) => Math.max(0.3, +(s - 0.08).toFixed(2)))} className="h-8 w-8 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center" title="缩小"><Minimize2 className="w-3.5 h-3.5" /></button>
            <span className="text-[11px] font-mono text-gray-500 w-10 text-center">{Math.round(scale * 100)}%</span>
            <button onClick={() => setScale((s) => Math.min(0.8, +(s + 0.08).toFixed(2)))} className="h-8 w-8 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center" title="放大"><Maximize2 className="w-3.5 h-3.5" /></button>
          </div>
        </div>
        {/* legend: which composition cells are present on this archetype */}
        <div className="px-5 pb-2 flex items-center gap-1.5 flex-wrap">
          {cellsUsed ? (
            <>
              <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mr-1">本屏构图格 ({cellsUsed.size}):</span>
              {[...cellsUsed].filter((c) => c !== 'placeholder').map((c) => (
                <span key={c} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{CELL_LABEL[c]}</span>
              ))}
            </>
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400">键盘密集屏 · 不计构图格（看每卡标注；点入单屏可交互）</span>
          )}
        </div>
      </div>

      {/* the contact sheet */}
      <div className="p-5 flex flex-wrap gap-x-5 gap-y-7">
        {ids.map((id) => {
          const m = STYLE_META[id];
          const cell = arche ? m.cell[arche] : null;
          const notes = m.annotations?.[screen];
          return (
            <div key={id} style={{ width: colW }} className="flex flex-col">
              {/* div (not button): the device frames contain their own buttons,
                  and nested <button> is invalid HTML. Click anywhere = pick. */}
              <div onClick={() => onPick(id)} role="button" tabIndex={0} title="点击进入单屏查看" className="block cursor-pointer hover:opacity-90 transition-opacity">
                <Thumb screen={screen} style={id} scale={scale} />
              </div>
              {/* spec card */}
              <div className="mt-1.5" style={{ width: colW }}>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono font-bold bg-black text-white px-1.5 py-0.5 rounded leading-none flex-shrink-0">#{styleNo(id)}</span>
                  <span className="text-[12px] font-bold truncate">{m.label}</span>
                </div>
                <div className="text-[11px] text-gray-600 truncate">{m.metaphor}</div>
                {cell && (
                  <div className="text-[10px] font-mono text-gray-500 mt-0.5">
                    ▦ {cell === 'placeholder' ? <span className="text-gray-400">（本屏未实现）</span> : <>{CELL_LABEL[cell]} <span className="text-gray-400">{cell}</span></>}
                  </div>
                )}
                <div className="text-[10px] text-gray-500 italic truncate">{m.oneLiner}</div>
                {notes && (
                  <ul className="mt-1 space-y-0.5">
                    {notes.map((n, i) => (
                      <li key={i} className="text-[10px] text-gray-600 leading-snug flex gap-1">
                        <span className="text-gray-400 flex-shrink-0">·</span><span>{n}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
