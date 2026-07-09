import { useState } from 'react';
import { ChevronDown, ChevronRight, type LucideIcon } from 'lucide-react';

/**
 * Generic docs-panel shell. Sits to the right of the device frame and
 * documents the active feature with the same chrome regardless of which
 * feature is being shown. Use this for any debug/showcase explanation so
 * the style stays consistent across the prototype.
 *
 * Layout: fixed top-6 right-6, 340px wide, capped at viewport height with
 * an inner scroll. Three slots:
 *   - header (icon + title + sourceFile path on the right)
 *   - optional controls strip (tabs, toggles, etc.)
 *   - body (rules, sections, cards via the helpers below)
 */
interface FeatureDocsPanelProps {
  icon: LucideIcon;
  title: string;
  /** Source filename shown right-aligned in the header (e.g. "PassphrasePageNew.tsx"). */
  sourceFile?: string;
  /** Optional control strip rendered below the header (variant tabs, toggles). */
  controls?: React.ReactNode;
  /** Panel width utility class. Defaults to the standard 340px sidebar; wide
   *  reference sheets (multi-column) pass their own (e.g. "w-[1020px]"). */
  widthClass?: string;
  children: React.ReactNode;
}

export function FeatureDocsPanel({
  icon: Icon,
  title,
  sourceFile,
  controls,
  widthClass = 'w-[340px]',
  children,
}: FeatureDocsPanelProps) {
  return (
    <div className={`fixed top-6 right-6 z-30 ${widthClass} max-w-[calc(100vw-48px)] max-h-[calc(100vh-48px)] bg-white rounded-lg shadow-2xl border-2 border-gray-300 flex flex-col`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-md">
        <Icon className="w-4 h-4 text-gray-700 flex-shrink-0" />
        <h3 className="text-sm font-bold text-gray-900 truncate">{title}</h3>
        {sourceFile && (
          <span className="text-xs text-gray-500 ml-auto truncate font-mono">{sourceFile}</span>
        )}
      </div>

      {/* Optional control strip (tabs, toggles) */}
      {controls && (
        <div className="px-4 py-2 border-b border-gray-200 bg-white flex items-center gap-1">
          {controls}
        </div>
      )}

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">{children}</div>
    </div>
  );
}

/** Section with a small bold title and a list of rule rows. */
export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="text-sm font-bold text-gray-900 mb-2">{title}</h4>
      <ul className="space-y-1.5">{children}</ul>
    </div>
  );
}

/** One rule row: a left-side mono label + body text. Use inside <Section>. */
export function Rule({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-2">
      <span className="font-mono text-[11px] bg-gray-100 border border-gray-300 px-1.5 py-0.5 rounded text-gray-700 flex-shrink-0 h-fit whitespace-nowrap">
        {label}
      </span>
      <span className="text-[13px] text-gray-700 leading-relaxed">{children}</span>
    </li>
  );
}

/** Reusable amber callout listing the three device-wide e-ink constraints.
 *  Drop this at the bottom of any device-UI docs panel so the reader is
 *  reminded of cross-cutting rules regardless of which feature they're reading.
 *  Phrased as behaviour + visible result; class names go in parentheses. */
export function ConstraintsCard() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded p-3 space-y-2 text-[13px] text-gray-800">
      <div className="font-bold text-gray-900 text-xs uppercase tracking-wide">墨水屏共性约束</div>
      <p>
        <strong>不即时刷新：</strong>无字符计数、无强度条、无进度动画；长度上限静默生效。
      </p>
      <p>
        <strong>禁用不靠灰：</strong>禁用按钮 = 虚线边框（<code className="font-mono text-[11px] bg-white px-1">border-dashed</code>，绝不降透明度）；
        无边框小图标按钮禁用时整体隐形但占位不变（<code className="font-mono text-[11px] bg-white px-1">disabled:invisible</code>，布局不跳）。
      </p>
      <p>
        <strong>无动画：</strong>按压瞬时反色、松开立即恢复；显隐切换瞬时完成，不依赖过渡动画。
      </p>
    </div>
  );
}

/** Generic compact docs table: headers + ReactNode cell grid. Render OUTSIDE
 *  <Section> (whose <ul> can't legally contain a <table>) — give it its own
 *  heading. `widths` optionally sets per-column widths. */
export function DocTable({
  headers,
  rows,
  widths,
}: {
  headers: string[];
  rows: React.ReactNode[][];
  widths?: string[];
}) {
  return (
    <table className="w-full border-collapse text-[11px] leading-snug mb-1">
      <thead>
        <tr className="text-left text-gray-400">
          {headers.map((h, i) => (
            <th
              key={i}
              className="font-semibold pb-1 pr-2 align-top"
              style={widths ? { width: widths[i] } : undefined}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-t border-gray-200 align-top">
            {r.map((c, j) => (
              <td key={j} className="py-1 pr-2 text-gray-700">
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Collapsible section: a chevron + bold title header that toggles its body.
 *  Hand-rolled (not Radix) to match the panel's plain styling. Each instance
 *  owns its open state; remount (via a parent `key`) to reset to defaultOpen. */
export function Collapsible({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-gray-200 first:border-t-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-1.5 py-2 text-left"
        aria-expanded={open}
      >
        {open ? (
          <ChevronDown className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
        )}
        <span className="text-sm font-bold text-gray-900">{title}</span>
      </button>
      {open && <div className="pb-3 pl-1">{children}</div>}
    </div>
  );
}

/** Button styling for the "pill row" pattern used in the controls slot
 *  (variant tabs, on/off toggles). Compose with onClick handlers. */
export function pillClass(active: boolean) {
  return `flex-1 text-xs font-bold py-1.5 rounded border transition-colors ${
    active
      ? 'bg-gray-800 text-white border-gray-800'
      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
  }`;
}
