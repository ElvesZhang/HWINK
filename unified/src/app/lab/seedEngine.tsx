/**
 * seedEngine.tsx — shared LOGIC (no layout) for the BIP39 seed-entry and
 * verify-recovery flows, so each Lab design language can SKIN them without
 * re-deriving the (subtle) state machine. Mirrors the locked p3-editorial
 * behaviour: prefix-filtered keyboard, 3 suggestions, edit-in-place verify with
 * return-to-frontier, success auto-return.
 *
 * Styles import the hooks and render their own chrome. This keeps the hard part
 * (correctness) in one place and lets composition/metaphor vary freely.
 */
import { useState, useEffect } from 'react';
import { BIP39, KEY_ROWS } from './exdata';

export { BIP39, KEY_ROWS };

/** Demo answer key: word i passes by "tap the lit letter → tap the top
 *  suggestion". Valid for the 12-word path (first match per starting letter). */
export const EXPECTED = [
  'abandon', 'bacon', 'cabin', 'damage', 'eager', 'fabric', 'gadget', 'habit', 'ice', 'lab', 'machine', 'oak',
  'sad', 'table', 'ability', 'badge', 'cable', 'dance', 'eagle', 'face', 'gain', 'hair', 'icon', 'label',
];
export const REVIEW_PER_PAGE = 6;

const suggestionsFor = (prefix: string) => (prefix ? BIP39.filter((w) => w.startsWith(prefix)).slice(0, 3) : []);
const validNextFor = (prefix: string) =>
  new Set(BIP39.filter((w) => w.startsWith(prefix)).map((w) => w[prefix.length]).filter(Boolean));

/* ──────────────────────────────────────────────────────────────────────────
   SEED — enter all N words once. (info contract: ledger · input · suggestions ·
   keyboard with backspace + back-word · completion state)
   ────────────────────────────────────────────────────────────────────────── */
export interface SeedEntry {
  count: number;
  words: string[];
  prefix: string;
  suggestions: string[];
  validNext: Set<string>;
  done: boolean;
  type: (k: string) => void;
  backspace: () => void;
  commit: (w: string) => void;
  backWord: () => void;
  reset: () => void;
}

export function useSeedEntry(count = 12): SeedEntry {
  const [words, setWords] = useState<string[]>([]);
  const [prefix, setPrefix] = useState('');
  const done = words.length >= count;
  return {
    count, words, prefix,
    suggestions: suggestionsFor(prefix),
    validNext: validNextFor(prefix),
    done,
    type: (k) => setPrefix((p) => p + k),
    backspace: () => setPrefix((p) => p.slice(0, -1)),
    commit: (w) => { if (words.length >= count) return; setWords((ws) => [...ws, w]); setPrefix(''); },
    backWord: () => { setWords((ws) => ws.slice(0, -1)); setPrefix(''); },
    reset: () => { setWords([]); setPrefix(''); },
  };
}

/* ──────────────────────────────────────────────────────────────────────────
   VERIFY — select-length → per-word re-entry (edit-in-place, return-to-frontier)
   → result. (info contract: length picker · review grid · input · suggestions ·
   keyboard · Verified / No Match)
   ────────────────────────────────────────────────────────────────────────── */
export type VerifyStep = 'select-length' | 'input' | 'result';
export interface VerifyFlow {
  step: VerifyStep;
  count: number;
  words: string[];
  prefix: string;
  idx: number;
  ok: boolean;
  editing: boolean;
  suggestions: string[];
  validNext: Set<string>;
  pickLength: (n: number) => void;
  type: (k: string) => void;
  backspace: () => void;
  commit: (w: string) => void;
  goToWord: (t: number) => void;
  reset: () => void;
}

export function useVerifyFlow(): VerifyFlow {
  const [step, setStep] = useState<VerifyStep>('select-length');
  const [count, setCount] = useState(12);
  const [words, setWords] = useState<string[]>([]);
  const [prefix, setPrefix] = useState('');
  const [idx, setIdx] = useState(0);
  const [ok, setOk] = useState(false);

  const reset = () => { setStep('select-length'); setWords([]); setPrefix(''); setIdx(0); };
  // success auto-returns (stands in for routing back to the settings menu)
  useEffect(() => {
    if (step === 'result' && ok) { const t = window.setTimeout(reset, 2200); return () => window.clearTimeout(t); }
  }, [step, ok]);

  const editing = idx < words.length;
  return {
    step, count, words, prefix, idx, ok, editing,
    suggestions: suggestionsFor(prefix),
    validNext: validNextFor(prefix),
    pickLength: (n) => { setCount(n); setWords([]); setIdx(0); setPrefix(''); setStep('input'); },
    type: (k) => setPrefix((p) => p + k),
    backspace: () => setPrefix((p) => p.slice(0, -1)),
    commit: (w) => {
      if (editing) { const next = [...words]; next[idx] = w; setWords(next); setPrefix(''); setIdx(next.length); return; }
      const next = [...words, w]; setWords(next); setPrefix('');
      if (next.length >= count) { setOk(next.every((x, i) => x === EXPECTED[i])); setStep('result'); }
      else setIdx(next.length);
    },
    goToWord: (t) => { setIdx(t); setPrefix(words[t] ?? ''); },
    reset,
  };
}

/** Paginated review window for the verify grid (keeps the active word on screen). */
export function useReviewPage(idx: number, count: number) {
  const [page, setPage] = useState(0);
  useEffect(() => { setPage(Math.floor(idx / REVIEW_PER_PAGE)); }, [idx]);
  const pages = Math.max(1, Math.ceil(count / REVIEW_PER_PAGE));
  const safePage = Math.min(page, pages - 1);
  const slots = Array.from({ length: REVIEW_PER_PAGE }, (_, i) => safePage * REVIEW_PER_PAGE + i).filter((i) => i < count);
  return { page: safePage, pages, slots, setPage };
}
