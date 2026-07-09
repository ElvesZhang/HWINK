import { FileText } from 'lucide-react';
import { FeatureDocsPanel, Section, Rule, Collapsible, ConstraintsCard } from './FeatureDocsPanel';
import { OVERALL, SIGN_DOCS, type SignDocsView, type SpecRow } from './signDocsContent';

/**
 * Developer-docs panel for the signing screens + Sign History. Shown to the
 * right of the device frame on the Sign Request and Sign History pages.
 *
 * It documents ONLY the device's current screen: App.tsx derives a `view`
 * (`SignDocsView`) from the active signType + sub-screen state and passes it
 * in; the panel looks it up in SIGN_DOCS and renders four collapsible
 * categories (流程说明 / 数据来源 / 交互说明 / 界面元素) for that one screen,
 * plus an always-available Overall 大流程 and a static footer of cross-cutting
 * rules. Content + verified spec values live in signDocsContent.tsx.
 */

/** Compact 4-column spec table: 元素 / 字号·字重 / 排布 / 来源. */
function SpecTable({ rows, note }: { rows: SpecRow[]; note?: React.ReactNode }) {
  return (
    <div className="break-inside-avoid">
      <table className="w-full border-collapse text-[11px] leading-snug">
        <thead>
          <tr className="text-left text-gray-400">
            <th className="font-semibold pb-1 pr-2 align-top w-[24%]">元素</th>
            <th className="font-semibold pb-1 pr-2 align-top w-[30%]">字号·字重</th>
            <th className="font-semibold pb-1 pr-2 align-top w-[28%]">排布</th>
            <th className="font-semibold pb-1 align-top w-[18%]">来源</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-gray-200 align-top">
              <td className="py-1 pr-2 text-gray-900">
                <span className="font-semibold">{r.el}</span>
                {r.ex && <span className="block font-mono text-[10px] text-gray-500 mt-0.5 break-all">{r.ex}</span>}
              </td>
              <td className="py-1 pr-2 text-gray-700">{r.spec}</td>
              <td className="py-1 pr-2 text-gray-700">{r.layout}</td>
              <td className="py-1 text-gray-700">{r.src ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {note && <div className="text-[11px] text-gray-600 mt-1.5 italic leading-snug">{note}</div>}
    </div>
  );
}

export function SignDetailDocsPanel({ view }: { view: SignDocsView | null }) {
  const doc = view ? SIGN_DOCS[view] : null;

  return (
    <FeatureDocsPanel
      icon={FileText}
      title="Sign · 开发说明"
      sourceFile={view ?? '当前界面'}
      widthClass="w-[360px]"
    >
      {/* Overall 大流程 — always available, persists its open state across views. */}
      <Collapsible title="Overall · 大流程" defaultOpen={false}>
        <div className="text-[13px] text-gray-700 leading-relaxed">{OVERALL.flow}</div>
      </Collapsible>

      {/* Per-view categories. key={view} remounts on screen change so each new
          screen starts with 流程说明 open and the rest collapsed. */}
      {doc ? (
        <div key={view}>
          <div className="text-xs font-bold text-gray-900 pt-3 pb-1 uppercase tracking-wide">{doc.title}</div>
          {doc.flow && (
            <Collapsible title="流程说明" defaultOpen>
              <div className="text-[13px] text-gray-700 leading-relaxed">{doc.flow}</div>
            </Collapsible>
          )}
          {doc.dataSource && (
            <Collapsible title="数据来源">
              <div className="text-[13px] text-gray-700 leading-relaxed">{doc.dataSource}</div>
            </Collapsible>
          )}
          {doc.interaction && (
            <Collapsible title="交互说明">
              <div className="text-[13px] text-gray-700 leading-relaxed">{doc.interaction}</div>
            </Collapsible>
          )}
          {doc.elements && (
            <Collapsible title="界面元素">
              <SpecTable rows={doc.elements} note={doc.elementsNote} />
            </Collapsible>
          )}
        </div>
      ) : (
        <div className="text-[13px] text-gray-500 py-3">切换到某个签名界面后，这里显示该界面的说明。</div>
      )}

      {/* Static footer: cross-cutting rules + shared components, rendered once. */}
      <Collapsible title="通用规则 + 共用件">
        <Section title="核心规则（照着做）">
          <Rule label="金额">
            全精度，<strong>整段同字号普通体</strong>，不分组、不省略、永不四舍五入。最长 18 位小数也整段显示，靠 <code className="font-mono text-[11px]">break-all</code> 换行。<br />
            范例：<code className="font-mono text-[11px]">1,234.567890123456789012</code>
          </Rule>
          <Rule label="网络费">
            <strong>Network Fee 是上限估算</strong>，主屏显示 <code className="font-mono text-[11px]">Max</code> 前缀 + <code className="font-mono text-[11px]">formatFee</code> 舍入到 ~6 位有效数字（不刷屏长串）；详情页保留精确值。<strong>交易金额永不舍入</strong>（你授权的是确切数额）。
          </Rule>
          <Rule label="网络名">
            只在金额/Token chip 显示一次（无独立 Network 字段）；长名 <code className="font-mono text-[11px]">break-words</code> 换行、不再 nowrap，避免溢出。
          </Rule>
          <Rule label="地址">
            首尾各 6 位加粗、中段普通（<code className="font-mono text-[11px]">BoldEndsAddress</code>），break-all 换行，<strong>绝不截断省略</strong>。核对靠首尾。<strong>详情页地址用 sans</strong>，签名主屏仍 mono。
          </Rule>
          <Rule label="层次">
            标签弱、值强，<strong>对比靠字号不靠字重</strong>：标签 18px 细体 <code className="font-mono text-[11px]">leading-none</code>；<strong>详情页值统一 20px 普通体 sans</strong>（主屏 hero 仍按降档表放大）。
          </Rule>
          <Rule label="≥18px">
            所有文字 ≥18px（含标签）。放不下就翻页或缩减字段，不靠缩字号。
          </Rule>
          <Rule label="法币">
            任何签名相关界面<strong>不显示法币估值</strong>——来源不可信，且与"核对要签的东西"无关。
          </Rule>
        </Section>

        <Section title="共用件（各类型同款）">
          <Rule label="操作栏">
            距左右 16px 的 2px 顶线；左 <strong>✕ Reject</strong> 80×60px 描边方块，右 <strong>Confirm</strong> 黑底 60px 高占满剩余宽（✓ + 18px 粗体大写）。Reject 任意时刻可点、直接返回不留痕。
          </Rule>
          <Rule label="原始数据入口">
            transfer/approve/swap 摘要屏右下 <strong>Raw Data →</strong>（18px/300 大写，内容区底部）进入<strong>原始数据抽屉</strong>——只看原始交易/calldata，不再逐字段重复摘要（Gas Limit / Your Address / Method / From 已去掉）。<strong>message 同样有此入口</strong>，但放在消息<strong>末页底部</strong>（看真正被签的字节）；blind 无入口（长内容屏内翻页）。<br />
            （注：统一校验码屏底部的 <strong>Transaction Details →</strong> 是另一层级——进入内容屏的入口。整体：verify（第一级）→ 摘要内容（第二级）→ Raw Data 抽屉。）
          </Rule>
          <Rule label="金额降档表">
            transfer / approve 共用同一段代码，按字符数：<code className="font-mono text-[11px]">≤6→60px｜7–10→48px｜11–12→36px｜13–20→30px｜&gt;20→24px</code>；一律 700 粗体、<code className="font-mono text-[11px]">tabular-nums</code>、整段换行、全精度。
          </Rule>
          <Rule label="完整规范">
            字段边界分页算法、<code className="font-mono text-[11px]">flow</code> 用法、精确 class 与 <code className="font-mono text-[11px]">DetailField</code> API 见 <code className="font-mono text-[11px]">unified/DETAIL_LIST_SPEC.md</code>。
          </Rule>
        </Section>
      </Collapsible>

      <ConstraintsCard />
    </FeatureDocsPanel>
  );
}
