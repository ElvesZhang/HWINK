# Detail / Information-List Spec

The single pattern for **information-list screens** on the e-ink wallet: any page
that shows a set of labelled values (transaction details, approval details, swap
details, device-info lists, settings read-outs, history detail …).

Implemented by `src/app/components/DetailListView.tsx`. New list-type features
should reuse that component rather than re-style rows by hand.

> Reads with the hard constraints in `CONSTRAINTS.md` (1-bit `#838383` + black,
> no opacity / shadow / emoji, ≥18px on signing surfaces) and the type roles in
> `EDITORIAL_DESIGN_LANGUAGE.md` (mono = machine values).

---

## 1. Principles

1. **Peer fields, no hero.** The screen that *opens* the detail already owns the
   hero (the amount, the "what am I doing"). Inside the detail every field
   carries equal structural weight — it is a list, not a poster. Do not enlarge
   or box one field above the others.
2. **Hierarchy lives *inside* a field, not between fields.** The only contrast is
   label vs value: a quiet label over a prominent value.
3. **Never truncate.** A value (amount, address, calldata) is security-critical.
   It wraps; it is never clipped, ellipsised, or rounded. Full 18-digit
   precision is always shown.
4. **Overflow flips whole pages on a field boundary.** When the list is taller
   than one screen it paginates — a field is never split across a page.

---

## 2. The two hierarchy levers (1-bit, ≥18px floor)

Colour and size-below-18 are unavailable, so hierarchy is carried by **weight +
case** (for the label) and **size + weight** (for the value):

| Role  | Classes | Why |
|-------|---------|-----|
| **Label** | `text-lg font-light text-black uppercase tracking-wide leading-none mb-1.5` | 18px (the floor) but de-emphasised by light weight + uppercase + tracking. `leading-none` is **required** — the default `text-lg` line-height (28px) adds ~5px of leading above and below, which inflates the label↔value gap until it looks equal to the field↔field gap. Killing the leading restores the ~1 : 2 ratio. |
| **Value (plain)** | `text-2xl font-normal text-black` | Larger + (relatively) bolder than the label. Not `font-bold` — content is regular weight; the size step carries the emphasis. |
| **Value (long / mono)** | `text-xl font-normal text-black font-mono break-all leading-snug` | Addresses, method names, hashes. Drop to `text-xl` so long strings fit; always `break-all` so they wrap instead of clip. |
| **Value (amount)** | `<PreciseAmount amount token network />` | The full number as one uniform `text-2xl font-normal` span (no grouping, no size step), `break-all` wrap. Shows every decimal. Fee labels are always "Network Fee", never "Gas Fee". |
| **Address** | `<BoldEndsAddress addr className="text-xl … font-mono break-all" />` | First/last 6 chars bold for fast end-to-end verification. |

### Spacing rhythm (the 1 : 2 rule)
- **label → value (within a field): ~1×** — `mb-1.5` on the label + `leading-none`.
- **field → value-of-next-field (between fields): ~2×** — `gap-4` (16px) on the
  flex column.

The visual gap is what matters, not the raw margin; `leading-none` on the label
is what makes the box margins read as the intended ratio.

---

## 3. Page chrome

- **Header** `h-[45px]`, `border-b-2`: back button left; **page number top-right**
  (`text-lg font-bold tabular-nums`), shown only when `totalPages > 1`.
- **Bottom pager** (Sign History style), shown only when `totalPages > 1`:
  - Wrapper `mx-4 mt-3 mb-4 pt-3 border-t-2 border-black` — the rule is **inset
    16px each side (`mx-4`) to match the outer signing page's action-bar line**,
    not edge-to-edge.
  - Buttons `flex-1 h-12 border-2 border-black rounded-sm`, `font-bold text-lg
    uppercase`, `ChevronUp + Prev` / `Next + ChevronDown`.
  - Only the available direction renders (Prev hidden on the first page, Next on
    the last) — when one is hidden the other fills the row.

---

## 4. Pagination algorithm (field-boundary packing)

Implemented in `DetailListView`'s effect; reuse as-is.

1. Render the full field list in a hidden measuring pass (`absolute inset-0
   opacity-0`, same `p-4` width as the visible list) and read each field's
   `offsetHeight`.
2. Available height = **device root − header − padding**
   (`rootEl.clientHeight − 45 − 32`). Derive it from the device root, **not** the
   content container — the container shrinks once the pager bar mounts, and
   measuring it would subtract the bar twice.
3. If the total exceeds one screen, reserve the pager bar (`BAR = 90`): the
   page-1 slice then still clears it.
4. Greedily pack fields into pages (`gap-4` = 16px between them); start a new page
   before any field that would overflow. A field never straddles a break.

---

## 5. Using `DetailListView`

```tsx
import { DetailListView, PreciseAmount, type DetailField } from './DetailListView';
// BoldEndsAddress stays in SignRequestPage; pass already-styled value nodes.

const fields: DetailField[] = [
  { label: 'Pay',     value: <PreciseAmount amount={r.amountIn} token={r.tokenIn} network={r.networkIn} /> },
  { label: 'From',    value: <BoldEndsAddress addr={r.address} className="text-xl text-black font-mono break-all leading-snug" /> },
  { label: 'Contract',value: (<>
      <div className="text-xl font-normal text-black break-all leading-snug mb-1">{r.contractName}</div>
      <BoldEndsAddress addr={r.contractAddress} className="text-xl text-black font-mono break-all leading-snug" />
    </>) },
  { label: 'Network Fee', value: <div className="text-2xl font-normal text-black font-mono break-all">{r.maxFee} {r.tokenSymbol}</div> },
];

return <DetailListView title="Swap Details" onBack={…} fields={fields} dataKey={`swap:${network}`} />;
```

- **`fields`**: `{ label, value }[]`. `value` is a fully-styled node (use the
  classes in §2). A field may stack several lines (name + address).
- **`dataKey`**: any string that captures the data identity (e.g.
  `` `${type}:${network}` ``). Changing it re-measures and resets to page 1.

In use by: the Transfer / Approve / Swap signing details (`SignRequestPage.tsx`)
and the Transfer / Approve / Sign-Message history details
(`TransferDetailPage`, `ApproveDetailPage`, `SignMessageDetailPage`). The shared
`BoldEndsAddress` and `PreciseAmount` helpers are exported from this module.

---

## 6. Long content — the `flow` field

A field whose value is one long block (a full signing message, raw calldata)
can't be packed whole. Mark it `flow: true` — at most one per view, and it must
be the **last** field:

```tsx
{ label: 'Message', flow: true,
  value: <div className="text-xl font-normal text-black whitespace-pre-wrap break-all leading-snug">{msg}</div> }
```

DetailListView then **boundary-paginates the fixed fields first** (they may span
several pages), and gives the flow value its **own page(s)** afterwards, scrolling
it by whole viewports (`translateY`) so it is never clipped. The flow label is
repeated as a header on each flow page; the bottom pager spans every page.

In use by: the Sign Message history detail (`SignMessageDetailPage`).

> The signing-flow **message** and **blind** screens read their payload inline on
> the main screen (with the Confirm bar), so they keep their own inline
> `translateY` pager rather than a separate detail page.
