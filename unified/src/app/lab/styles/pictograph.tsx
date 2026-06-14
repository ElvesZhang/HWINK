/**
 * PICTOGRAPH · 图标语言 — bold filled pictograms as the dominant visual.
 *
 * Governing metaphor: a wayfinding signage system. Every screen has a large
 * filled subject illustration (filled=true → solid silhouette in black, carved
 * #838383 detail) as the centrepiece. Navigation tiles, row icons, and accent
 * marks all use the same illustration-first vocabulary. Typography is large,
 * bold, and sans-serif — the word-count is intentionally low so the pictures
 * do the heavy lifting. Ultra-legible at 3 inches. 2-tone monochrome only.
 */
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Bluetooth, BatteryMedium, Check, X, Delete } from 'lucide-react';
import type { LabScreen } from '../data';
import { WALLET, HOME_ITEMS, HIST, SIGN, SEED } from '../data';
import { useSeedEntry, useVerifyFlow, useReviewPage, KEY_ROWS } from '../seedEngine';
import {
  IllVault, IllLedger, IllKey, IllShield, IllCoins, IllTransfer, IllDevice,
} from '../illus';

const PRESS = 'active:bg-black active:text-[#838383]';
const MONO = { fontFamily: 'ui-monospace, monospace' } as const;

/* Map each HOME_ITEMS entry to a large filled illustration */
const HOME_ILLUSMAP = {
  assets: <IllVault size={64} filled className="text-black" />,
  history: <IllLedger size={64} filled className="text-black" />,
  passkey: <IllKey size={64} filled className="text-black" />,
  settings: <IllShield size={64} filled className="text-black" />,
};

export function PictographStyle({ screen }: { screen: LabScreen }) {
  if (screen === 'home') return <Home />;
  if (screen === 'sign') return <Sign />;
  if (screen === 'history') return <History />;
  if (screen === 'seed') return <Seed />;
  if (screen === 'verify') return <Verify />;
  return null;
}

/* ── STATUS BAR — shared narrow band ── */
function StatusBar() {
  return (
    <div className="flex items-center justify-between px-4 h-8 border-b border-black flex-shrink-0">
      <span className="text-[11px] font-bold tracking-[0.18em] uppercase">{WALLET.name}</span>
      <span className="flex items-center gap-2.5">
        <Bluetooth className="w-3.5 h-3.5" strokeWidth={2.5} />
        <span className="flex items-center gap-1 text-[11px] font-bold tabular-nums">
          <BatteryMedium className="w-4 h-4" strokeWidth={2.5} />{WALLET.battery}%
        </span>
      </span>
    </div>
  );
}

/* ── HOME ── hero device + 2x2 pictogram tile grid ── */
function Home() {
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      <StatusBar />

      {/* hero band: device illustration + wallet identity */}
      <div className="bg-black text-[#838383] flex items-center gap-4 px-5 py-3 flex-shrink-0">
        <IllDevice size={56} filled className="text-[#838383] flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-[22px] font-black leading-none tracking-tight">{WALLET.name}</div>
          <div className="text-[11px] font-bold tracking-[0.2em] uppercase mt-1">{WALLET.model}</div>
          <div className="text-[10px] tracking-wide mt-1">{WALLET.networks} NET · {WALLET.tokens} TOK</div>
        </div>
      </div>

      {/* 2×2 tile grid — each tile is a large filled pictogram + label */}
      <div className="flex-1 grid grid-cols-2 min-h-0">
        {HOME_ITEMS.map((item, i) => (
          <button
            key={item.id}
            className={`flex flex-col items-center justify-center gap-2 border-black
              ${i === 0 ? 'border-b-2 border-r-2' : ''}
              ${i === 1 ? 'border-b-2' : ''}
              ${i === 2 ? 'border-r-2' : ''}
              text-black ${PRESS}`}
          >
            {HOME_ILLUSMAP[item.id as keyof typeof HOME_ILLUSMAP]}
            <div className="text-[15px] font-black tracking-tight leading-none">{item.label}</div>
            <div className="text-[10px] font-bold tracking-wide text-center px-2 leading-snug">{item.sub}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── SIGN DETAIL ── full field list including verify code ── */
function SignDetail({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      {/* back header — inverted bar matching HistoryDetail */}
      <div className="bg-black text-[#838383] flex items-center gap-3 px-4 h-12 flex-shrink-0">
        <button onClick={onBack} aria-label="Back" className="flex items-center active:text-black">
          <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
        </button>
        <IllCoins size={28} filled className="text-[#838383] flex-shrink-0" />
        <span className="text-[13px] font-black tracking-[0.1em] uppercase flex-1">Signature Details</span>
      </div>

      {/* all fields including verify code */}
      <div className="flex-1 flex flex-col min-h-0">
        {[
          { k: 'Amount', v: `${SIGN.amount} ${SIGN.token}`, mono: false, emph: false },
          { k: 'Value', v: SIGN.fiat, mono: false, emph: false },
          { k: 'To', v: SIGN.to, mono: false, emph: false },
          { k: 'Address', v: SIGN.address, mono: true, emph: false },
          { k: 'Network', v: SIGN.network, mono: false, emph: false },
          { k: 'Network Fee', v: SIGN.fee, mono: false, emph: false },
          { k: 'Verify Code', v: SIGN.verify, mono: true, emph: true },
        ].map(({ k, v, mono, emph }) => (
          <div key={k} className="flex-1 flex items-center justify-between gap-3 px-5 border-b border-black last:border-b-0">
            <span className="text-[10px] font-bold tracking-[0.18em] uppercase flex-shrink-0">{k}</span>
            <span
              className={`${emph ? 'text-[20px]' : 'text-[14px]'} font-black text-right truncate`}
              style={mono ? MONO : undefined}
            >{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── SIGN ── large IllCoins hero + summary rows + full-details drill + actions ── */
function Sign() {
  const [detail, setDetail] = useState(false);
  if (detail) return <SignDetail onBack={() => setDetail(false)} />;

  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      <StatusBar />

      {/* hero: large filled coins + amount */}
      <div className="bg-black text-[#838383] flex items-center gap-4 px-5 py-3 flex-shrink-0">
        <IllCoins size={72} filled className="text-[#838383] flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold tracking-[0.22em] uppercase mb-1">Confirm Send</div>
          <div className="flex items-baseline gap-2 leading-none">
            <span className="text-[54px] font-black tabular-nums tracking-tight leading-[0.85]">{SIGN.amount}</span>
            <span className="text-[22px] font-black">{SIGN.token}</span>
          </div>
          <div className="text-[13px] font-bold mt-1">{SIGN.fiat}</div>
        </div>
      </div>

      {/* transfer illustration as a row accent */}
      <div className="flex items-center gap-3 px-5 py-2 border-b border-black flex-shrink-0">
        <IllTransfer size={36} filled className="text-black flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold tracking-[0.18em] uppercase">To</div>
          <div className="text-[17px] font-black leading-tight truncate">{SIGN.to}</div>
        </div>
      </div>

      {/* summary meta rows — NO verify code here */}
      <div className="flex-1 flex flex-col min-h-0">
        {[
          { k: 'Address', v: SIGN.address, mono: true },
          { k: 'Network', v: SIGN.network, mono: false },
          { k: 'Fee', v: SIGN.fee, mono: false },
        ].map(({ k, v, mono }) => (
          <div key={k} className="flex-1 flex items-center justify-between gap-3 px-5 border-b border-black last:border-b-0">
            <span className="text-[10px] font-bold tracking-[0.18em] uppercase flex-shrink-0">{k}</span>
            <span
              className="text-[15px] font-black text-right truncate"
              style={mono ? MONO : undefined}
            >{v}</span>
          </div>
        ))}

        {/* drill to full details — verify code lives there */}
        <button
          onClick={() => setDetail(true)}
          className={`flex-1 w-full flex items-center gap-3 px-5 border-b border-black text-left ${PRESS}`}
        >
          <IllLedger size={28} filled className="text-black flex-shrink-0" />
          <span className="flex-1 text-[13px] font-black tracking-[0.08em] uppercase">Full details &amp; verify code</span>
          <ChevronRight className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
        </button>
      </div>

      {/* action bar */}
      <div className="flex border-t-2 border-black flex-shrink-0">
        <button
          className={`w-[80px] h-[60px] border-r-2 border-black flex items-center justify-center ${PRESS}`}
          aria-label="Reject"
        >
          <X className="w-7 h-7" strokeWidth={2.5} />
        </button>
        <button className="flex-1 h-[60px] bg-black text-[#838383] flex items-center justify-center gap-3 active:bg-[#838383] active:text-black">
          <Check className="w-6 h-6" strokeWidth={2.75} />
          <span className="text-[17px] font-black tracking-tight">Sign</span>
        </button>
      </div>
    </div>
  );
}

/* ── HISTORY ── IllLedger accent header + icon rows → detail drill ── */
function HistoryDetail({ e, onBack }: { e: typeof HIST[number]; onBack: () => void }) {
  const monoKeys = /address|hash|tx/i;
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      {/* header bar */}
      <div className="bg-black text-[#838383] flex items-center gap-3 px-4 h-12 flex-shrink-0">
        <button onClick={onBack} aria-label="Back" className="flex items-center active:text-black">
          <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
        </button>
        <span className="text-[14px] font-black tracking-[0.1em] uppercase flex-1">Signature</span>
        <span className="text-[11px] font-bold tracking-[0.2em] uppercase">{e.ok ? 'SIGNED' : 'REJECTED'}</span>
      </div>

      {/* summary card with small ledger accent */}
      <div className="flex items-start gap-3 px-5 py-3 border-b-2 border-black flex-shrink-0">
        <IllLedger size={48} filled className="text-black flex-shrink-0 mt-1" />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold tracking-[0.18em] uppercase">#{e.idx} · {e.date} · {e.time} · {e.type}</div>
          <div className="text-[22px] font-black leading-tight truncate mt-0.5">{e.title}</div>
          <div className="text-[12px] font-bold truncate">{e.sub}</div>
        </div>
        <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 border-2 border-black ${e.ok ? 'bg-black' : ''}`}>
          {e.ok
            ? <Check className="w-4 h-4 text-[#838383]" strokeWidth={2.75} />
            : <X className="w-4 h-4 text-black" strokeWidth={2.75} />
          }
        </div>
      </div>

      {/* detail rows */}
      <div className="flex-1 flex flex-col min-h-0">
        {e.detail.map(([k, v]) => (
          <div key={k} className="flex-1 flex items-center gap-3 px-5 border-b border-black last:border-b-0">
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase flex-shrink-0 w-[80px]">{k}</span>
            <span
              className="flex-1 text-right text-[13px] font-black truncate"
              style={monoKeys.test(k) ? MONO : undefined}
            >{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function History() {
  const [sel, setSel] = useState<typeof HIST[number] | null>(null);
  if (sel) return <HistoryDetail e={sel} onBack={() => setSel(null)} />;

  const rows = HIST.slice(0, 4);
  const typeIllus = (kind: string) =>
    kind === 'sent'
      ? <IllCoins size={36} filled className="text-black flex-shrink-0" />
      : <IllLedger size={36} filled className="text-black flex-shrink-0" />;

  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      {/* header with ledger hero */}
      <div className="bg-black text-[#838383] flex items-center gap-4 px-5 py-3 flex-shrink-0">
        <IllLedger size={52} filled className="text-[#838383] flex-shrink-0" />
        <div>
          <div className="text-[20px] font-black leading-none">Sign History</div>
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase mt-1">{HIST.length} records</div>
        </div>
      </div>

      {/* rows */}
      <div className="flex-1 flex flex-col min-h-0">
        {rows.map((e) => (
          <button
            key={e.idx}
            onClick={() => setSel(e)}
            className={`flex-1 flex items-center gap-3 px-4 border-b border-black text-left ${PRESS}`}
          >
            {typeIllus(e.kind)}
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold tracking-[0.15em] uppercase">#{e.idx} · {e.date} · {e.time} · {e.type}</div>
              <div className="text-[17px] font-black leading-tight truncate">{e.title}</div>
              <div className="text-[11px] font-bold truncate">{e.sub}</div>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="text-[10px] font-bold tracking-wide">{e.ok ? 'SIGNED' : 'REJECTED'}</span>
              <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── SEED ── IllKey hero + progress + word ledger + input + suggestions + keyboard ── */
function Seed() {
  const s = useSeedEntry(SEED.count);

  if (s.done) {
    return (
      <div className="flex-1 flex flex-col min-h-0 text-black">
        {/* hero */}
        <div className="bg-black text-[#838383] flex items-center justify-center gap-4 px-5 py-4 flex-shrink-0">
          <IllKey size={60} filled className="text-[#838383]" />
          <div>
            <div className="text-[20px] font-black leading-none">Phrase Complete</div>
            <div className="text-[11px] font-bold tracking-[0.2em] uppercase mt-1">All {SEED.count} words entered</div>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8">
          <div className="w-[72px] h-[72px] bg-black flex items-center justify-center">
            <Check className="w-10 h-10 text-[#838383]" strokeWidth={2.75} />
          </div>
          <button
            onClick={s.reset}
            className={`px-8 h-12 border-2 border-black text-[13px] font-black tracking-[0.18em] uppercase ${PRESS}`}
          >
            Restart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      {/* hero header */}
      <div className="bg-black text-[#838383] flex items-center gap-3 px-4 py-2.5 flex-shrink-0">
        <IllKey size={40} filled className="text-[#838383] flex-shrink-0" />
        <div className="flex-1">
          <div className="text-[13px] font-black tracking-[0.1em] uppercase">Recovery Phrase</div>
        </div>
        <span className="text-[12px] font-bold tracking-wide tabular-nums">
          WORD {String(s.words.length + 1).padStart(2, '0')} / {SEED.count}
        </span>
      </div>

      {/* entered words ledger — bounded, no scroll */}
      <div className="px-4 py-2 h-[44px] border-b border-black flex-shrink-0 overflow-hidden">
        {s.words.length === 0
          ? <span className="text-[11px] font-bold tracking-wide">Enter your {SEED.count}-word recovery phrase.</span>
          : <div className="flex flex-wrap gap-x-3 gap-y-0.5">
              {s.words.map((w, i) => (
                <span key={i} className="text-[11px] font-bold">
                  <span className="tabular-nums">{String(i + 1).padStart(2, '0')}</span> {w}
                </span>
              ))}
            </div>
        }
      </div>

      {/* input field */}
      <div className="px-4 py-2 flex-shrink-0">
        <div className="h-10 border-2 border-black flex items-center px-3 gap-0.5">
          <span className="text-[20px] font-black tracking-wide" style={MONO}>{s.prefix}</span>
          <span className="w-0.5 h-6 bg-black" />
        </div>
      </div>

      {/* suggestions — pictograph style: big bold labels */}
      <div className="flex-1 min-h-0 flex flex-col border-t border-black">
        {s.suggestions.length > 0
          ? s.suggestions.map((w) => (
              <button
                key={w}
                onClick={() => s.commit(w)}
                className={`flex-1 w-full flex items-center gap-3 px-4 border-b border-black last:border-b-0 text-left ${PRESS}`}
              >
                <IllKey size={22} filled className="text-black flex-shrink-0" />
                <span className="text-[20px] font-black lowercase tracking-tight">{w}</span>
              </button>
            ))
          : <div className="flex-1 flex items-center px-4 text-[11px] font-bold tracking-wide">
              {s.prefix ? 'No matching word' : 'Type to search BIP39'}
            </div>
        }
      </div>

      {/* keyboard */}
      <div className="px-1.5 pb-2 pt-1.5 flex flex-col gap-1.5 flex-shrink-0 border-t-2 border-black">
        {KEY_ROWS.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1">
            {row.split('').map((k) => {
              const enabled = s.validNext.has(k);
              return (
                <button
                  key={k}
                  disabled={!enabled}
                  onClick={() => s.type(k)}
                  className={`h-9 flex-1 max-w-[34px] border-2 border-black text-[13px] font-black uppercase ${enabled ? PRESS : ''}`}
                >
                  <span className={enabled ? '' : 'invisible'}>{k}</span>
                </button>
              );
            })}
          </div>
        ))}
        <div className="flex justify-center gap-2">
          {s.words.length > 0 && (
            <button
              onClick={s.backWord}
              className={`h-9 px-3 border-2 border-black text-[11px] font-black uppercase tracking-wide ${PRESS}`}
            >
              Back word
            </button>
          )}
          <button
            onClick={s.backspace}
            disabled={!s.prefix}
            className={`h-9 px-5 border-2 border-black flex items-center justify-center ${s.prefix ? PRESS : ''}`}
            aria-label="Backspace"
          >
            <Delete className={`w-5 h-5 ${s.prefix ? '' : 'invisible'}`} strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── VERIFY ── IllShield hero; select-length with big pictogram tiles; grid; result ── */
function Verify() {
  const v = useVerifyFlow();
  const rp = useReviewPage(v.idx, v.count);

  /* select-length — two pictogram tiles */
  if (v.step === 'select-length') {
    return (
      <div className="flex-1 flex flex-col min-h-0 text-black">
        {/* shield hero */}
        <div className="bg-black text-[#838383] flex items-center gap-4 px-5 py-3 flex-shrink-0">
          <IllShield size={60} filled className="text-[#838383] flex-shrink-0" />
          <div>
            <div className="text-[18px] font-black leading-none">Verify Phrase</div>
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase mt-1">Confirm your backup</div>
          </div>
        </div>

        <div className="px-5 py-2.5 border-b border-black flex-shrink-0">
          <div className="text-[13px] font-bold leading-snug">
            Re-enter every word to prove your backup is correct.
          </div>
        </div>

        {/* length tiles */}
        <div className="flex-1 flex flex-col min-h-0">
          {([12, 24] as const).map((n) => (
            <button
              key={n}
              onClick={() => v.pickLength(n)}
              className={`flex-1 flex items-center gap-5 px-5 border-b border-black last:border-b-0 text-left ${PRESS}`}
            >
              <IllShield size={52} filled className="text-black flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[40px] font-black tabular-nums leading-none">{n}</div>
                <div className="text-[12px] font-bold uppercase tracking-wide">
                  {n === 12 ? 'Standard phrase' : 'Extended phrase'}
                </div>
              </div>
              <ChevronRight className="w-6 h-6 flex-shrink-0" strokeWidth={2.5} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* result */
  if (v.step === 'result') {
    return (
      <div className="flex-1 flex flex-col min-h-0 text-black">
        <div className="bg-black text-[#838383] flex items-center gap-4 px-5 py-3 flex-shrink-0">
          <IllShield size={52} filled className="text-[#838383] flex-shrink-0" />
          <div className="text-[16px] font-black tracking-tight">{v.ok ? 'VERIFIED' : 'NO MATCH'}</div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-4">
          <div className={`w-[80px] h-[80px] flex items-center justify-center border-2 border-black ${v.ok ? 'bg-black' : ''}`}>
            {v.ok
              ? <Check className="w-12 h-12 text-[#838383]" strokeWidth={2.75} />
              : <X className="w-12 h-12 text-black" strokeWidth={2.75} />
            }
          </div>
          <div className="text-[26px] font-black leading-tight">{v.ok ? 'Verified' : 'No Match'}</div>
          <div className="text-[12px] font-bold leading-snug max-w-[260px]">
            {v.ok
              ? 'Your recovery phrase is correct — this backup is valid.'
              : 'That phrase does not match this wallet. Check your backup and try again.'
            }
          </div>
          {v.ok
            ? <div className="text-[11px] font-bold tracking-[0.22em] uppercase">Returning…</div>
            : <button
                onClick={v.reset}
                className={`px-8 h-12 border-2 border-black text-[13px] font-black tracking-[0.18em] uppercase ${PRESS}`}
              >
                Try Again
              </button>
          }
        </div>
      </div>
    );
  }

  /* input step */
  return (
    <div className="flex-1 flex flex-col min-h-0 text-black">
      {/* compact header with shield accent */}
      <div className="bg-black text-[#838383] flex items-center gap-3 px-4 h-11 flex-shrink-0">
        <IllShield size={28} filled className="text-[#838383] flex-shrink-0" />
        <span className="text-[12px] font-black tracking-[0.1em] uppercase flex-1">Verify Phrase</span>
        <span className="text-[11px] font-bold tabular-nums">
          {v.editing ? 'Edit' : 'Word'} {String(v.idx + 1).padStart(2, '0')} / {v.count}
        </span>
        {rp.pages > 1 && (
          <span className="text-[10px] font-bold ml-2">{rp.page + 1}/{rp.pages}</span>
        )}
      </div>

      {/* review grid — 2 columns; active cell inverted */}
      <div className="px-3 pt-2 pb-1.5 flex-shrink-0">
        <div
          className="grid grid-cols-2 gap-1"
          style={{ height: '106px', gridTemplateRows: 'repeat(3, minmax(0,1fr))' }}
        >
          {rp.slots.map((i) => {
            const filled = i < v.words.length;
            const active = i === v.idx;
            return (
              <button
                key={i}
                onClick={() => v.goToWord(i)}
                disabled={i > v.words.length}
                className={`flex items-center gap-2 px-2.5 border-2 border-black text-left overflow-hidden
                  ${active ? 'bg-black text-[#838383]' : ''}
                  ${i <= v.words.length ? PRESS : ''}`}
              >
                <span className="text-[10px] font-black tabular-nums flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-[14px] font-black lowercase truncate">{filled ? v.words[i] : ''}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* input field */}
      <div className="px-4 pb-1.5 flex-shrink-0">
        <div className="h-10 border-2 border-black flex items-center px-3 gap-0.5">
          <span className="text-[18px] font-black tracking-wide" style={MONO}>{v.prefix}</span>
          <span className="w-0.5 h-5 bg-black" />
        </div>
      </div>

      {/* suggestion bar */}
      <div className="h-[44px] flex items-stretch gap-1.5 px-3 flex-shrink-0">
        {v.suggestions.length > 0
          ? v.suggestions.map((w) => (
              <button
                key={w}
                onClick={() => v.commit(w)}
                className={`flex-1 min-w-0 border-2 border-black flex items-center justify-center px-1 ${PRESS}`}
              >
                <span className="text-[14px] font-black lowercase truncate">{w}</span>
              </button>
            ))
          : <div className="flex-1 flex items-center justify-center text-[11px] font-bold tracking-wide">
              {v.prefix ? 'No matching word' : 'Type the word'}
            </div>
        }
      </div>

      {/* keyboard */}
      <div className="px-1.5 pb-2 pt-1.5 flex flex-col gap-1.5 flex-shrink-0 border-t-2 border-black">
        {KEY_ROWS.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1">
            {row.split('').map((k) => {
              const enabled = v.validNext.has(k);
              return (
                <button
                  key={k}
                  disabled={!enabled}
                  onClick={() => v.type(k)}
                  className={`h-9 flex-1 max-w-[34px] border-2 border-black text-[13px] font-black uppercase ${enabled ? PRESS : ''}`}
                >
                  <span className={enabled ? '' : 'invisible'}>{k}</span>
                </button>
              );
            })}
          </div>
        ))}
        <div className="flex justify-center">
          <button
            onClick={v.backspace}
            disabled={!v.prefix}
            className={`h-9 px-6 border-2 border-black flex items-center justify-center ${v.prefix ? PRESS : ''}`}
            aria-label="Backspace"
          >
            <Delete className={`w-5 h-5 ${v.prefix ? '' : 'invisible'}`} strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </div>
  );
}
