# Editorial — Design Language Spec

> **What this is**: the locked design language for the SafePal Obsidian e-ink wallet redesign, chosen 2026-06-03 (the "③ Editorial / P3" direction). This is the **准绳** for every new screen.
>
> **Canonical implementation**: `src/app/lab/styles/p3-editorial.tsx` — Home / Sign / History / Seed / VerifyRecovery. When this doc and the code disagree, fix one to match the other deliberately; don't let them drift.
>
> **Hardware floor**: obey `CONSTRAINTS.md` first (two-tone `#838383`/black, ~400×600 @ ~3″, full-refresh, no horizontal scroll, deterministic, no live counters). This spec layers the *voice* on top of those rules.

---

## ① Personality (the anchor — derives everything below)

**Literary · ordered · magazine-calm.** An agenda poster, not a dashboard. The device feels like a *fine instrument with a typographic voice*: confident serif headlines, hairline rules, generous numerals, scarce emphasis. Trust through restraint, not decoration.

Shared atoms (declared at top of `p3-editorial.tsx`):
```tsx
const PRESS = 'active:bg-black active:text-[#838383]';           // momentary tactile inversion
function Chip(children)   // font-sans bg-black text-[#838383] text-[11px] font-bold px-2 py-1 tracking-wide
function VerifyHeader({title, onBack})  // operational header (see ⑦)
```

---

## ② Type — serif voice vs sans metadata (enforced everywhere)

| Use | Family | Pattern |
|---|---|---|
| Content / display: titles, names, amounts, word values, big index numerals | **serif** (`font-serif` is the root default) | `font-bold`, large (titles `text-2xl`–`text-[27px]`, amounts `text-[68px]`, index numerals `text-[38px]`–`text-[52px]`), `tabular-nums` for numbers |
| System metadata: section labels, sub-text, status, chip text, button labels | **sans** (`font-sans` explicitly) | `text-[11px]`/`text-[12px]`, `font-bold`, `uppercase`, `tracking-[0.12em–0.25em]` |
| Machine values: addresses, tx/sig hashes, verify code, seed input | **mono** (`style={{fontFamily:'ui-monospace, monospace'}}`) | keep `tabular-nums` feel; wide `tracking` for read-aloud codes |

**Rule**: every text node is one of these three roles. Serif carries *what it is*; sans carries *what the system calls it*; mono carries *exact strings a human must compare*. Never set body/metadata in serif or a title in sans.

---

## ③ Container / shape — lines, not cards

- **No cards. No shadows. No rounding.** Structure is drawn with ink lines only.
- **Hairline `border-t border-black` (1px)** = separates peer rows in a list.
- **`border-b-2 border-black` / `border-t-2 border-black` (2px)** = structural dividers: header underline, section breaks, keyboard top, action-row top.
- **Peer rows fill height** via `flex-1` inside a `border-t-2` group (Home menu, History rows, length choices).
- **Interactive affordances** (inputs, keys, choice/suggestion boxes) use `border-2 border-black` **square** boxes — these are controls, not content containers.
- Forbidden on device screen: `rounded-*` on containers, `box-shadow`/`hard-shadow`, `border-dashed` for state, `opacity-*`, any gray besides `#838383`. (The only `rounded-full` allowed is the result status circle in ⑩ — it is an icon, not a container.)

---

## ④ Surface / tone semantics (locked — 3 surfaces, fixed meanings)

| Surface | Meaning | Where |
|---|---|---|
| `#838383` (page) | default field; everything lives here | all backgrounds |
| `bg-black` + `text-[#838383]` (inverted) | **scarce emphasis — "the one important thing"** | Home masthead band · `Chip` (metadata token) · the single primary action (Hold-to-Sign) · its filled success circle · the Verify-Code readout bar |
| `PRESS` (momentary inversion) | tactile press feedback | every tappable element |

**No dithered tone (`ink-25`) in Editorial.** Hierarchy is lines + weight + size, never tonal fills. Inversion is rationed: if more than ~one black region competes for attention on a screen, you're overusing it.

---

## ⑤ Hierarchy — weight, size, rule, whitespace

Build importance with: big serif **numerals as anchors** (Home `01–04`, History `idx`, Verify word number, length `12/24`) → serif title weight/size → hairline grouping → whitespace. **Never** with containers, shadows, or tone. One inverted element per screen is the apex.

---

## ⑥ Iconography

- **Lucide only**, monochrome, inherit `currentColor`. No emoji.
- Stroke weights: navigation/content **2–2.25**; emphasis (status ✓/✗, suggestion chevrons) **3**.
- Sizes: nav chevron `w-5`/`w-6`; status icon `w-10` inside the 76px result circle.
- Icons label, never decorate: a chevron *means* movement (⑧), a fingerprint *means* hold-to-sign (⑨).

---

## ⑦ Navigation

- **Operational header** (`VerifyHeader` pattern) for any "I navigated here to manage X" screen:
  `h-[46px] px-4 flex items-center gap-2 border-b-2 border-black` + back `<ChevronLeft w-6 strokeWidth=2.25>` + **serif title** `text-lg font-bold tracking-tight`.
- **Home has no back** — it shows the inverted masthead band instead (it is the root).
- **Back returns to the logical parent step** (e.g. Verify `input → select-length`), not blindly to Home.
- **Drill-in** is signalled by a trailing `ChevronRight` on the row (⑧).
- **Transient / auto-advancing screens have no back** (success auto-returns; signing is uninterruptible).

---

## ⑧ Selection vs Navigation (distinct grammars — never mix)

| Intent | Grammar | Example |
|---|---|---|
| **Navigate** (go deeper / proceed) | hairline row or bordered choice + trailing **`ChevronRight`** | Home items, History rows, length 12/24 |
| **Select a value** (pick one of a set) | bordered box; **selected = inverted** (`bg-black text-[#838383]`); **no chevron** | History filters (All/Sent/Signed), Verify review chip (active word), keyboard suggestions |

**Rule**: chevron = *movement*; inversion = *chosen state*. A value-picker never gets a chevron; a navigation row never stays inverted (only momentary `PRESS`).

---

## ⑨ Confirmation — match friction to consequence

| Stakes | Mechanism |
|---|---|
| **Signing a transaction** (irreversible) | **Hold-to-Sign**: press-and-hold, **5-segment stepped fill** (`5×150ms` ≈ 0.75s; ≤5 repaints = e-ink safe). Full-width `bg-black text-[#838383]` button, `Fingerprint` icon, label `Hold to Sign` → `Hold…`. Completing → result. |
| **Reject** | single tap, left, narrow `w-[76px]`, `X` icon, on a `border-r-2` divider |
| **Verify a backup** | typed per-word entry with **edit-in-place** (tap a filled word to fix it; never truncate the tail — return to frontier after edit) |
| **Reversible picks** (filter, suggestion, menu) | single tap |

Don't gate low-stakes actions behind a hold; don't let an irreversible action fire on a single tap.

---

## ⑩ Feedback / status

- **Success** (`§4.4` device rule): filled circle `w-[76px] rounded-full bg-black` + `Check w-10 text-[#838383] strokeWidth=3` + serif title; **auto-returns ~2.2s** with sans `Returning…`. No button.
- **Failure**: bordered circle `border-[3px] border-black` + `X w-10 text-black strokeWidth=3` + serif title + sans body + explicit **`Try Again`** button. No auto-return.
- **Status vocabulary is LOCKED to full words**: `SIGNED` / `REJECTED` (history & sign), `Verified` / `No Match` (verify) — plain **sans uppercase tracking**, never abbreviated (`OK`/`REJ` banned), never a chip.
- **`Chip` is metadata only** (date·time, network, count). It must never carry status.
- Transient states (signing/saving) show stepped progress only — **no per-frame % counters** (e-ink flicker).

---

## ⑪ Spatial model

- Content **fills the fixed screen; never scroll.** Long content **paginates**: History `3/page`, Verify review `6/page` — **Prev/Next hidden at boundaries** + center `n / total`.
- Equal **`flex-1` rows** fill vertical space; entered-word bands are **bounded `overflow-hidden`**, not scrollable.
- **Keyboard pinned to bottom** under `border-t-2`; disabled keys keep their box with `invisible` content (`§3.1`) so the layout never reflows.

---

## Compliance checklist (run before shipping a new Editorial screen)

- [ ] Root is `font-serif`; every sans run is an explicit metadata label; addresses/codes are mono.
- [ ] Zero `rounded-*`/`shadow`/`opacity`/`border-dashed`/non-`#838383` gray on the device screen (only the result status circle is round).
- [ ] At most ~one inverted (`bg-black`) emphasis region on the screen.
- [ ] Navigation rows have a `ChevronRight`; value-pickers invert when selected and have no chevron.
- [ ] Irreversible action = hold-to-confirm; reject = single narrow tap.
- [ ] Status uses full words (SIGNED/REJECTED/Verified/No Match), not a Chip.
- [ ] No scroll: long lists paginate with boundary-hidden Prev/Next; keyboard disabled keys stay boxed.

---

**Decision owner**: user (chose Editorial over Instrument/Tool, 2026-06-03).
**Next**: apply this spec when porting to the real device UI (`src/app/components/`) or recasting `composite.tsx`.
