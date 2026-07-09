# Design Constraints — SafePal Obsidian E-ink Wallet Prototype

> **Audience**: anyone (human or AI) picking up this codebase. Read this **before** writing new components or modifying existing ones.
>
> **Purpose**: capture the hard rules and decision rationale that emerged over 30+ design iterations but live only in chat history. Source of truth for "why is this code shaped this way" questions.
>
> **Scope**: applies only to code under `unified/src/app/` (the device UI). Dev-only overlays (DebugPanel, DocsPanels) and shadcn dead code under `components/ui/` are not bound by these rules.

---

## § 1. E-ink Display Rules

The simulated device is a **two-tone** e-ink screen (black on `#838383` grey). Real hardware has no grayscale; the prototype emulates this constraint so the design stays implementable.

| Rule | Why | Enforcement |
|---|---|---|
| **No `opacity-X` on device-screen elements** | Alpha blending produces grayscale that doesn't exist on real e-ink. The device-screen browser preview would lie about how the design renders on hardware. | grep `opacity-` in `unified/src/app/` — only allowed inside `DebugPanel.tsx` overlay or hidden measurement elements (`absolute opacity-0 pointer-events-none` for `scrollHeight` measuring) |
| **No `text-black/N` / `bg-black/N` / `border-black/N`** | Same — alpha channel = grayscale. Replace with full black or invisible. | grep `text-black/` etc — should return zero in device-screen files |
| **No `border-dashed` for "disabled" affordance** | E-ink dithering of a dashed pattern looks noisy + visually inconsistent. Use solid border + invisible content instead. See § 3. | grep `border-dashed` — only allowed in tip cards (decorative semantic, not state) |
| **No horizontal scrolling on the device screen** | Real e-ink devices use physical buttons or tap-to-page; there's no smooth swipe affordance. Use `flex-wrap`, pagination, or content reorganization. | grep `overflow-x-auto` in `unified/src/app/` — should be zero |
| **No emoji in device-screen content** | OS emoji fonts are colorful (`🔒🌊⛰️`). Use Lucide icons via `<Icon className="..." />` — they're monochrome SVG that inherit `currentColor`. | LockScreenImagePage.tsx demonstrates the pattern: `Icon: LucideIcon` field in data, render `<image.Icon className="w-12 h-12" />` |
| **Deterministic shuffles, no `Math.random()`** | Random re-shuffling on re-render causes visible "jitter" on e-ink (each refresh is a full-screen invert+repaint). Use index-seeded selection. | See `ActivationPage.tsx:60` `pickOptionsForWord(correct, index)` — distractors picked by `index * 3` slice + `correct` placed at `index % 4` slot |
| **Error messages render BELOW input fields, not between title and input** | E-ink full-screen refresh: inserting an error between h2 and input would push the input down → user's tap target moves while they're tapping it. Anchoring errors below keeps the input row stable. | See `PassphrasePageNew.tsx` input step layout |
| **Fixed-height feedback slots for transient text** | When `isSubmitting` / `error` text appears/disappears, the surrounding layout must not shift. Use `min-h-[28px]` placeholders. | See `PassphrasePageNew.tsx` pin step (line ~228) — empty slot reserves the row |
| **No `Math.ceil`-style live character counters** | Continuous updates trigger full-screen refresh on e-ink → flicker. State the limit once in the subtitle ("Up to 50 characters") instead of `{value.length}/50` counter. | See `PassphrasePageNew.tsx:266` — static subtitle, no counter |
| **Global scrollbar UI is hidden** | Real e-ink devices have no scrollbar affordance. CSS in `unified/index.html` (or equivalent) hides `::-webkit-scrollbar`. Scrolling still works via wheel/touch, just no visual bar. | Verify by running and checking that long detail pages don't show a scrollbar |

---

## § 2. Hardware Semantic Constraints

These rules reflect what the simulated hardware can and cannot know. Breaking them produces a prototype that misleads about real device behavior.

### 2.1 Device cannot know "active passphrase"

BIP39 passphrases are stateless on hardware: the same mnemonic + different passphrase = entirely different deterministic wallet. The device does **not** store "is a passphrase currently in use" — it just derives whatever wallet matches the current passphrase entry.

**Consequence in code**: `PassphrasePageNew.tsx` has **no Active state, no Verify flow, no Abandon flow**. Every entry to the passphrase page starts the SET flow from `info`. See § 6.1 for what was removed.

### 2.2 Empty passphrase = original wallet path

Submitting an empty passphrase is legitimate — it loads the bare recovery-phrase wallet (no "13th word"). The flow short-circuits: input(empty) → confirm(empty match) → saving → success "Original wallet restored" (skipping display-passphrase + wallet-name steps).

**Enforcement**: 
- `UniversalKeyboard.tsx` exposes `allowEmpty?: boolean` prop. Passphrase input/confirm pass `allowEmpty`; other usages (wallet name, BIP39 word entry) keep the default `false`.
- `App.tsx` exports `ORIGINAL_WALLET_NAME` constant. `onCompleteToHome('')` from passphrase = restore this name to StatusBar.

### 2.3 StatusBar wallet name flows via callback, not shared state

The StatusBar `walletName` lives in `App.tsx` `statusBarState`. Pages that change it (currently only `PassphrasePageNew`) communicate via an explicit `onCompleteToHome(newName: string)` callback. Empty string signals "restore original".

**Why explicit callback, not store**: keeps page components stateless about parent — they call the callback and the parent decides what to do. Simpler than reaching up via context.

### 2.4 Navigation backPage state lives at App level

`nfcBackPage` (`'security' | 'connectivity'`) is set in `App.tsx` when the NFC page is entered from one of two paths (Security menu vs Connectivity menu). NFC back button reads this state.

**Rule**: when a page can be entered from multiple parents and back must return to the same parent, the back-target state belongs in `App.tsx`, not the page itself.

### 2.5 No "current state" indicator pages

Apart from the StatusBar (battery / Bluetooth / NFC), the device shows no persistent "you are using passphrase wallet X" / "biometrics enabled" type indicator. All such state must be inferred from action (entering passphrase = derives that wallet). This mirrors hardware limits — no extra storage for UI hints.

---

## § 3. Disabled UI Rules

### 3.1 Disabled buttons: solid border + invisible content

When a button is disabled (e.g., Confirm before input is filled), the rule is:
- **Border, background, padding stay identical to enabled state** (no border-dashed, no opacity change)
- **Content (text / icon) uses Tailwind `invisible` class** — element still occupies layout space, so the button width never collapses

Pattern:
```jsx
<button disabled={!canConfirm} className="h-10 px-4 border-2 border-black bg-[#838383]">
  <Check className={`w-5 h-5 ${canConfirm ? '' : 'invisible'}`} strokeWidth={2.5} />
</button>
```

**Why invisible, not `&& <Icon/>`**: conditional render makes the element disappear, which collapses button width via `flex-1` siblings or padding-based sizing. `invisible` keeps the layout box.

**Applied in**: `UniversalKeyboard.tsx` (Backspace, Confirm, mode toggle, BIP39-disabled letters), `PINKeypad.tsx` (Backspace, Confirm).

### 3.2 Boundary navigation buttons (Prev/Next) hide entirely

When the user is on page 0, the "Prev" button should not render at all (not disabled-but-visible). Same for "Next" on the last page. The remaining sibling takes full width via `flex-1`.

Pattern:
```jsx
{currentPage > 0 && <button onClick={prevPage} className="flex-1 ...">Prev</button>}
{currentPage < totalPages - 1 && <button onClick={nextPage} className="flex-1 ...">Next</button>}
```

**Why hide vs disable**: a "disabled Prev" on page 0 communicates "you could go back if X" — but at page 0 there's literally nowhere to go. The disabled state is a lie. Hiding tells the truth.

**Applied in**: all detail pages (`TransferDetailPage`, `ApproveDetailPage`, `SignMessageDetailPage`), `LockScreenImagePage`, `SignatureHistoryPage`, `SignRequestPage` (4 detail variants), `MnemonicVerifyPicker` (implicit — no pagination buttons).

### 3.3 `border-dashed` is reserved for **decorative tip cards**, never disabled state

Tip cards (e.g., the "Heads up" reminder in passphrase verify) use `border-2 border-black border-dashed` as a visual cue meaning "secondary informational content". This is a different semantic from disabled.

If you find yourself reaching for `border-dashed` for a disabled button, use the § 3.1 pattern instead.

---

## § 4. Style System

### 4.1 Button conventions

Two reusable button styles, both expressed as string constants per file:

```ts
const PRESS = 'active:bg-black active:text-[#838383]';
const BTN_BASE   = `h-14 border-2 border-black rounded-sm bg-[#838383] hover:bg-black hover:text-[#838383] ${PRESS} font-bold text-lg`;
const BTN_DANGER = `h-14 border-4 border-black rounded-sm bg-black text-[#838383] hover:bg-[#838383] hover:text-black ${PRESS.replace(...)} font-bold text-lg`;
```

- **BTN_BASE**: grey background + black border, hover inverts. Default for non-destructive primary actions.
- **BTN_DANGER**: filled black + double-thick border, hover inverts. Used for "Abandon" / "Reset" type destructive primaries.
- **PRESS**: shared tactile feedback (active state).

**Rule**: don't invent new button styles. If you need a new variant, justify in a code comment and consider whether the existing two suffice.

**Files defining their own copy of BTN_BASE/BTN_DANGER**: `ActivationPage.tsx`, `PassphrasePageNew.tsx`, `VerifyRecoveryPageNew.tsx`, `MnemonicVerifyPicker.tsx`, `WordCountSelector.tsx`. Convention: each file declares its own constants at top rather than importing — keeps files self-contained for easy review.

### 4.2 Two header patterns

**`BackOnlyHeader`** (used in Activation flow): just a `←` arrow, no title text, no `border-b`. Indicates a guided onboarding-style flow where the title would be redundant with the prominent on-screen content.

```jsx
function BackOnlyHeader({ onBack }: { onBack: () => void }) {
  return (
    <div className="h-[45px] px-5 flex items-center">
      <button onClick={onBack} aria-label="Back" className={`flex items-center ${PRESS} px-1 -mx-1 rounded-sm`}>
        <ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
      </button>
    </div>
  );
}
```

**Operational header** (used in Settings sub-pages, incl. VerifyRecovery — title "Verify Recovery Phrase" across all its steps): back arrow + title text + `border-b-2 border-black`. Indicates a settings/management context where the title aids orientation.

```jsx
<div className="h-[45px] px-5 flex items-center border-b-2 border-black">
  <button onClick={onBack} className="flex items-center gap-2">
    <ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
    <span className="text-sm font-bold text-black uppercase tracking-wide">Settings</span>
  </button>
</div>
```

**Rule**: use BackOnlyHeader for first-time / wizard / "linear journey" pages. Use operational header for "I navigated here to manage X" pages.

### 4.3 Sign Request Layout E — typography-only

`SignRequestPage.tsx` has 5 layout variants (A-D + E). Only **E** is implemented in this codebase — the others are placeholders.

**Why E**: it's the "typography-only" variant — no boxes, no decorative borders around sections, just big-bold-text + thin dividers (`h-[2px] bg-black`). This style:
- Maximizes readable size on a 400×600 e-ink screen
- Minimizes rendering complexity (e-ink loves flat shapes, slow with rounded borders)
- Gives each sign-type room for its own hero section (amount / dApp / contract / methodId / swap pair / approved amount)

Each of the 6 sign types has a unique hero structure but shares the same "label-tracking-widest + big-typography + dividers" rhythm. See `SignRequestPage.tsx` source for the canonical implementations.

### 4.4 Success / Failure icon pattern

For mid-page result indicators (e.g., "PIN changed", "Verification failed"):
- **Success**: `w-20 h-20 rounded-full bg-black flex items-center justify-center` + `<Check className="w-11 h-11 text-[#838383]" strokeWidth={3} />`
- **Failure**: `w-20 h-20 rounded-full border-[3px] border-black flex items-center justify-center` + `<X className="w-11 h-11 text-black" strokeWidth={3} />`

Both 80px circle, both centered, both visually weighty. The difference (filled vs bordered) is the clearest 2-tone semantic for success/failure available.

**Don't use**: `text-6xl ✓` (text glyph is ambiguous + may render as emoji), green/red colors (no color on e-ink).

### 4.5 Status banner conventions on Sign Request

- **Risk level 0 (no riskFactors)**: no banner
- **Risk level 1 (single factor)**: bordered banner `border-2 border-black mx-4 mt-2 rounded-sm p-2.5`
- **Risk level 2+ (multiple factors)**: filled black banner `bg-black mx-4 mt-2 rounded-sm p-2.5` with `text-[#838383]` content
- **Blind signing (special case)**: always full-width black strip `bg-black px-5 py-3` with `<ShieldAlert />` icon — overrides the regular banner (Blind is inherently high-risk regardless of explicit factors)

See `SignRequestPage.tsx` risk banner section (~line 320-340).

### 4.6 Mnemonic screens: Activation is the canonical language

Mnemonic-related screens appear in **two surfaces** — the Activation create flow (onboarding) and the Settings → Verify Recovery flow (management). **The Activation flow owns the design language; the Settings flow conforms to it** — not the reverse, and never by inventing a third style. Activation is the more complete, internally-cohesive flow; treat it as the reference and do not restyle it to match a settings screen.

What that language is, concretely (read `ActivationPage.tsx`):
- **Headers** differ on purpose (§ 4.2): Activation uses `BackOnlyHeader` (bare arrow, wizard); Settings sub-pages use the operational header (arrow + title + `border-b-2`). This header split is the *only* sanctioned divergence between the two surfaces.
- **Tap-to-continue hero screens** (`create-intro`, `create-done`): `basis-2/3` content block with a left-aligned `text-3xl` paragraph + `basis-1/3` "Tap to continue" / CTA region.
- **Prompt screens** (`create-length`, `create-verify-intro`): a `text-xl`/`text-2xl` title near the top (or centred in a `basis-2/3` block) with the choice/CTA pinned at the bottom via `mt-auto`. Content padding `px-6 pt-2 pb-6`.
- **Working screens** (`create-verify`): `text-xl` centred step title with the input/options below.

**Settings VerifyRecovery mirrors these** using the same titles (`text-xl`), the same `mt-auto` bottom-CTA rhythm, and the same shared components — the only deltas are the operational header and a slightly larger top pad (`pt-5` instead of `pt-2`) to breathe under the title bar. Do not bump VerifyRecovery to a bigger/centred type scale that Activation doesn't use.

**Shared components carry the consistency** (not a shared layout wrapper): `WordCountSelector`, `MnemonicWordList`, `MnemonicVerifyPicker`, `UniversalKeyboard`. Reuse these rather than reinventing.

**Two verification mechanisms, on purpose**: Activation `create-verify` uses **multiple-choice** (`MnemonicVerifyPicker`) — the user just saw the phrase, so recognition is enough and faster. VerifyRecovery `input` uses **typed BIP39 entry** (`UniversalKeyboard`) — an independent backup check, where recall is a stronger proof. Keep this divergence.

**Rule**: before restyling any mnemonic screen, look at how Activation does the equivalent screen and match *that*. If you think Activation itself should change, that's a deliberate, flow-wide decision — not a side effect of polishing a settings page.

---

## § 5. Component Reuse Index

Shared components — prefer reuse over reinventing.

| Component | Purpose | Used by | Notes |
|---|---|---|---|
| **`PINKeypad`** | 6-digit numeric PIN entry with built-in dot indicator | ChangePIN, ResetDevice, Passphrase, Activation | `randomized={true}` shuffles the digit layout (anti-shoulder-surf). Default `randomized={false}` standard 1-9 layout. `onConfirm` fires when value reaches `maxLength`. |
| **`UniversalKeyboard`** | Text + BIP39 keyboard with auto-cap, mode switch, suggestion bar | Passphrase, VerifyRecovery (BIP39), Activation (naming) | `mode='text'` enables shift / numbers / symbols. `mode='bip39'` locks lowercase + shows word suggestions + disables non-matching letters. `allowEmpty={true}` lets Confirm fire on empty input (passphrase only). |
| **`WordCountSelector`** | 12 / 24 word stacked picker | Activation create-length, VerifyRecovery | Pure presentation — caller handles state via `onSelect(12 \| 24)` callback. |
| **`MnemonicWordList`** | Display 6 mnemonic words per page (numbered) | Activation create-display | Caller controls pagination + `startIndex` (1-based for word #s). |
| **`MnemonicVerifyPicker`** | 4-option multiple-choice for a single mnemonic word | Activation create-verify | Caller does shuffle + advance + error handling. Internal: just 4 stacked BTN_BASE buttons. |
| **`PageDebugId`** | Tiny `#N` / `#N-X` badge top-right | Most settings pages | Reads from `PAGE_IDS` / `SUB_PAGE_IDS` in `config/pageIds.ts`. Toggled by `showDebugId` prop (controlled from DebugPanel). |
| **`StatusBar`** | Top bar with wallet name + battery + Bluetooth + NFC | Home only | Reads from `statusBarState` in App. Don't render on non-Home pages (Home is the only page with a status bar). |
| **`DeviceFrame`** | The phone-shaped outer chrome | App | Pure CSS — gradient body, rounded corners, side button, power LED, brand text. No logic. |
| **`FeatureDocsPanel`** | Shared shell for floating dev docs panels | KeyboardDocsPanel, PassphraseDocsPanel, ActivationDocsPanel | Right-side floating panel, sibling to device. Provides `<Section>`, `<Rule>`, `<ConstraintsCard>`, `pillClass`. **Not** part of the device UI. |

---

## § 6. Decision Reversals (things we tried and removed)

When you find code commented out or notice "why isn't there X" — check here first.

### 6.1 Passphrase Active / Verify / Abandon flow — REMOVED

**What it was**: A "Status: Active" indicator in the Passphrase info screen with two buttons ("Test my passphrase" / "Abandon passphrase") leading to verify-input → verify-success/fail flows and abandon-confirm → verify-input → abandon-pin → abandon-success flows. 11 step values total.

**Why removed**: per § 2.1, the device cannot know "active passphrase" — there's no state to verify against. The flow was lying about hardware capability.

**Current state**: `PassphrasePageNew.tsx` has only 8 step values (info / pin / input / confirm / display-passphrase / saving / wallet-name / success). No verify, no abandon. Every entry restarts the SET flow.

**If you want to switch wallets**: per § 2.2, just run the setup flow again with the desired passphrase (or empty for original).

### 6.2 `border-dashed` for disabled buttons — REMOVED

**What it was**: Disabled buttons (Prev on page 0, Confirm with empty input, etc.) had `disabled:border-dashed` Tailwind class.

**Why removed**: e-ink dithers the dashed pattern badly + § 3.1's `invisible` content pattern is more honest about the disabled state.

**Current state**: solid border + invisible content (§ 3.1) for "disabled and stays visible", or conditional render (§ 3.2) for "disabled and removed".

### 6.3 Horizontal-scroll chip strip in VerifyRecovery — REMOVED

**What it was**: Entered-words preview as horizontal `overflow-x-auto whitespace-nowrap` strip.

**Why removed**: per § 1, no horizontal scrolling on device screen.

**Current state**: `flex flex-wrap` multi-row chip layout. With BIP39 max word length 8 chars, 24 chips fit in ~4 rows.

### 6.4 "Connectivity" label — RENAMED to "Wireless"

**What it was**: Settings card title "CONNECTIVITY" — 12 letters at `text-xl uppercase` overflowed the 132px-wide card.

**Why renamed**: visual overflow + "Wireless" is shorter (8 letters), more accurate (it manages Bluetooth + NFC, both wireless), and common in hardware-wallet vocabulary (iOS/macOS use it).

**Current state**: card and sub-page header show "Wireless". The route path / file name / `nfcBackPage` enum value all keep `'connectivity'` (zero refactor needed; the rename is purely UI label).

### 6.5 Passphrase "I agree" checkbox — REMOVED

**What it was**: A checkbox "I have written down my passphrase separately and accept that loss is irreversible." Required to check before the "Set up passphrase" button enabled.

**Why removed**: the checkbox + dashed-disabled button combo violated § 3 (dashed for disabled). Also, the warning is already communicated by the big warning panel above — checkbox is friction without added safety.

**Current state**: a simple "I Understand" BTN_BASE button. Tapping it = acknowledgment, immediate transition to PIN entry.

### 6.6 Emoji on lock screen images — REPLACED with Lucide

**What it was**: LockScreenImagePage used emoji previews (`🔒🌊⛰️🌲🏜️🌌`) for the 6 lock screen options.

**Why removed**: per § 1, no color emoji on device screen.

**Current state**: each lock image has an `Icon: LucideIcon` field. Render: `<image.Icon className="w-12 h-12" strokeWidth={1.5} />`. Used icons: `Lock / Waves / Mountain / Trees / Sun / Moon / Image` (Custom upload).

---

## § 7. State Management Patterns

### 7.1 Edit-in-place with return-to-frontier

When a wizard collects items in sequence and the user jumps back to a previously-entered item N (by tapping its chip or the back arrow), only item N is edited — every other item is **preserved**. Confirming the edit returns the user to the *frontier* (the next not-yet-entered item) so forward progress is not lost. Example: `VerifyRecoveryPageNew.tsx` — `goToWord(idx)` loads `words[idx]` into the input WITHOUT truncating; `handleWordConfirm` detects `currentIndex < words.length` (an edit, not an append), replaces `words[currentIndex]` in place, then sets `currentIndex = words.length` to resume at the frontier.

**Why edit-in-place**: re-typing every subsequent word after fixing a single typo is punishing on a 24-word phrase. The "what does Enter do?" ambiguity is resolved by a clear rule: editing always REPLACES the single word being edited and then jumps to the frontier (never INSERTs, never shifts the tail).

**History note**: this reverses an earlier truncate-on-back design (where jumping to item N discarded items N+1..end via `words.slice(0, idx)`). Truncation was simpler but forced full re-entry of the tail; edit-in-place was adopted on user feedback.

### 7.2 Transient state has no back button

Steps like `saving` (loading spinner) or `signing` (sign-in-progress) don't render a back button. The user cannot interrupt — these states auto-advance via `setTimeout`. Header uses `renderHeaderStatic` (no back arrow) or `BackOnlyHeader` without an onBack handler.

**Why**: interrupting a one-way transition is a footgun. In real hardware, this would be an actual firmware operation that doesn't admit cancellation cleanly.

**Applied in**: `PassphrasePageNew` (`saving`), `FirmwareUpdatePage` (`transferring` / `verifying` / `restarting` / `boot-install` — the BLE firmware delivery, pre-reboot signature verify, reboot, and bootloader install are all uninterruptible). Firmware progress is shown with a **coarse stepped bar** (10% increments, ≤10 repaints) rather than a smooth per-percent counter — continuous counters flicker on e-ink (§ 1).

### 7.3 Dual completion callbacks: `onBack` vs `onCompleteToHome`

`PassphrasePageNew` accepts both. `onBack` is "cancel / abort, return to parent (Security)". `onCompleteToHome` is "finished setup, navigate to device Home + update StatusBar wallet name". The page picks the right one at the right time:

```ts
setTimeout(() => {
  if (onCompleteToHome) onCompleteToHome(walletName);
  else onBack();
}, 2000);
```

**Why two callbacks instead of one with a flag**: the meanings differ. `onBack` is "user-initiated retreat". `onCompleteToHome` is "wizard completed naturally". Treating them as one callback with a `completed: boolean` param invites bugs where cancel-paths accidentally trigger completion logic.

### 7.4 `submitWithPending` simulated async

`PassphrasePageNew.tsx` has a helper `submitWithPending(fn, ms = 450)` that flips `isSubmitting=true`, runs `fn()` after `ms`, then flips back. Used to give the UI a real "verifying..." moment so we can drop in real firmware calls later without changing the visual shape.

**Why**: a real device PIN check takes ~hundreds of ms. Faking it during prototype makes the eventual integration drop-in.

---

## § 8. Sign Request Layout E Decisions

`SignRequestPage.tsx` covers 6 sign types in layout E. The shared structure:

```
[PageHeader: "Confirm Send" / "Sign Message" / "EIP-712 Signature" / "Sign Raw Data" / "Confirm Swap" / "Approve Token"]
[riskBanner (conditional, see § 4.5)]
[content area: px-7 pt-5 pb-3, flex flex-col, space-y-4]
  ↳ hero section (1-2 lines big-bold-text)
  ↳ <div className="h-[2px] bg-black flex-shrink-0" />
  ↳ secondary section
  ↳ <div className="h-[2px] bg-black flex-shrink-0" />
  ↳ etc...
  ↳ <div className="flex-1" />  spacer
  ↳ "Full Details →" / "All Details →" link (right-aligned)
[actionButtons (Reject + Confirm)]
```

### 8.1 Per-type hero structures (the parts that vary)

| Type | Header title | Hero | Notable extras |
|---|---|---|---|
| `transfer` | Confirm Send | "Amount" label + dynamic-size amount + "Verify Code" black bar (extended `-mx-7`) | Amount font size depends on length (4xl / 5xl / 6xl) via `amountFontClass` helper |
| `message` | Sign Message | "Requested By" + dapp + dapp URL | Message viewport with inline pagination (280px) |
| `typedData` | EIP-712 Signature | "Domain" + domain name + version | Verifying Contract section + Network/Type 2-col + Fields viewport (200px) with inline pagination |
| `blind` | Sign Raw Data | "Contract" + contract address (xl font-mono) | Full-width black warning strip with ShieldAlert. Raw Calldata viewport (220px). Network rendered OUTSIDE main content area. No "Full Details" link. |
| `contractCall` | Confirm Swap | "You're Swapping" + FROM + arrow-with-lines + TO | Contract is its own section (own divider). "All Details →" (not "Full") |
| `approve` | Approve Token | "Approved Amount" + UNLIMITED (6xl) or amount+symbol+fiat | Approved Spender section + Token section + Network/Gas 2-col |

### 8.2 Inline pagination viewport pattern

Long content (Message text, Raw Calldata, EIP-712 fields) uses a fixed-height viewport + `transform: translateY(-page * boxHeight)` to slide through pages. Pagination arrows are inline next to the section label:

```jsx
<div className="flex items-center justify-between mb-3">
  <div className="flex items-center gap-2">
    <span className="text-sm text-black uppercase tracking-wide">Message</span>
    {messagePages > 1 && <span className="text-xs text-black font-bold">({messagePage + 1}/{messagePages})</span>}
  </div>
  {messagePages > 1 && (
    <div className="flex items-center gap-1">
      <button onClick={() => setMessagePage(p => Math.max(0, p - 1))} disabled={messagePage === 0} ...>
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button onClick={() => setMessagePage(p => Math.min(messagePages - 1, p + 1))} disabled={messagePage === messagePages - 1} ...>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )}
</div>
<div className="relative" style={{ height: '280px', overflow: 'hidden' }}>
  <div ref={msgContent}
       className="text-sm font-bold text-black font-mono whitespace-pre-wrap break-all transition-transform duration-200"
       style={{ transform: `translateY(${-messagePage * MESSAGE_BOX_HEIGHT}px)`, lineHeight: 1.6 }}>
    {message}
  </div>
</div>
```

Page count computed from `scrollHeight` measured via `useEffect` + `useRef`.

### 8.3 Action buttons row

Reject (left, 80px wide, X icon only) + Confirm (right, fills remaining, black filled, Check icon + label). The label varies:
- Default: "Confirm"
- High-risk transactions: "Confirm · PIN" (signals PIN verification will be required)
- Message / Blind: always "Confirm" (no PIN regardless of risk)

### 8.4 Variants A-D

Not implemented. The `VariantSwitcher` floating overlay shows A/B/C/D as selectable but tapping them shows a "Coming soon" alert. Implementing them is future work — see `SESSION_ARCHIVE_2026-05-26.md` future TODOs.

---

## § 9. Pagination Magic Numbers

Fixed viewport heights used in `SignRequestPage.tsx`:

| Constant | Value | Section | Why this number |
|---|---|---|---|
| `MESSAGE_BOX_HEIGHT` | 280px | Message signing — Message text viewport | Largest viewport because messages can be long prose. Fits ~14 lines at line-height 1.6 + text-sm = 22.4px/line |
| `RAW_DATA_BOX_HEIGHT` | 220px | Blind signing — Raw Calldata viewport | Smaller because Network info renders outside (below content). 220 + ~70 (Network footer) = ~290 total, similar real estate to message |
| `FIELDS_BOX_HEIGHT` | 200px | EIP-712 — Fields viewport | Even smaller because Domain hero + Verifying Contract section + Network/Type 2-col already consume significant space above |
| `WORDS_PER_DISPLAY_PAGE` | 6 | Activation mnemonic display | 6 words/page × 2 pages = 12-word phrase. Or × 4 pages = 24-word phrase. 6 is enough to read at a time without strain, few enough to fit at `text-2xl` comfortably on 400×600 |

**Rule**: if you add a new paginated viewport, follow the formula `~290 - (other content above)`. Sanity-check by measuring with various content lengths.

---

## Compliance Audit Commands

Run these to catch violations:

```powershell
# § 1 — no opacity on device screen
Select-String -Path "unified/src/app/components/*.tsx" -Pattern "opacity-[0-9]"
# Allowed hits: lines containing "absolute opacity-0 pointer-events-none" (hidden measurement elements)

# § 1 — no horizontal scroll on device
Select-String -Path "unified/src/app/components/*.tsx" -Pattern "overflow-x"
# Should return zero hits

# § 1 — no color emoji on device
Select-String -Path "unified/src/app/components/*.tsx" -Pattern "[🌀-🛿🤀-🧿]" -Encoding utf8
# Should return zero hits (excluding DebugPanel.tsx which is dev-only)

# § 3 — no border-dashed for disabled
Select-String -Path "unified/src/app/components/*.tsx" -Pattern "disabled:border-dashed"
# Should return zero hits

# § 6.4 — no "Connectivity" in UI text (only as route name)
Select-String -Path "unified/src/app/components/*.tsx" -Pattern '"Connectivity"|>Connectivity<'
# Should return zero hits
```

---

**Last updated**: 2026-05-26  
**Source of truth**: this file (in case of conflict with docs panels or HANDOFF.md)
