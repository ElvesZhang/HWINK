import { useState } from 'react';
import { FileText } from 'lucide-react';
import { FeatureDocsPanel, Section, Rule, ConstraintsCard, pillClass } from './FeatureDocsPanel';

/**
 * Reference sheet for the signing screens + Sign History details. Shown to the
 * right of the device frame on the Sign Request and Sign History pages.
 *
 * Structure:
 *   1. flow + where each piece of data comes from + cross-cutting rules
 *   2. 共用件 (action bar / details entry / amount size ladder) — written once
 *   3. element-by-element spec TABLE per sign type (Transfer, Verify Code,
 *      Approve unlimited/limited, Message, Blind, Swap)
 *   4. Sign History — list cards + detail field rules
 *
 * Every spec value here is verified against SignRequestPage.tsx, not written
 * from memory. The full pagination algorithm / `flow` field / exact classes
 * live in unified/DETAIL_LIST_SPEC.md; this sheet points there rather than
 * restating it.
 */

type SpecRow = { el: string; ex?: string; spec: string; layout: string; src?: string };

/** Compact 4-column spec table: 元素 / 字号·字重 / 排布 / 来源. */
function SpecTable({ caption, rows, note }: { caption: string; rows: SpecRow[]; note?: string }) {
  return (
    <div className="mb-4 break-inside-avoid">
      <div className="text-xs font-bold text-gray-900 mb-1.5">{caption}</div>
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

export function SignDetailDocsPanel() {
  // Width toggle: collapsed (standard 360px sidebar, single column) by default
  // so the centered device stays clear; expand to a wide 2-column sheet so all
  // the per-type tables fit side by side.
  const [wide, setWide] = useState(false);

  return (
    <FeatureDocsPanel
      icon={FileText}
      title="Sign · 开发说明"
      sourceFile="SignRequestPage.tsx / DetailListView.tsx"
      widthClass={wide ? 'w-[920px]' : 'w-[360px]'}
      controls={
        <>
          <button className={pillClass(!wide)} onClick={() => setWide(false)}>标准</button>
          <button className={pillClass(wide)} onClick={() => setWide(true)}>宽 ×2</button>
        </>
      }
    >
      <div className={wide ? 'columns-2 gap-7 [&>*]:break-inside-avoid' : 'space-y-5'}>
        {/* ── 1. 流程 + 信息来源 + 规则 ── */}
        <Section title="签名流程">
          <Rule label="主屏">
            每种类型一屏摘要：主角信息（金额/授权额/站点）+ 分区明细 + 右下 <code className="font-mono text-[11px]">Full Details →</code> 入口 + 底部操作栏（✕ Reject ｜ Confirm）。
          </Rule>
          <Rule label="确认">
            点 Confirm → <strong>必经二次验证</strong>：已录指纹 → 指纹验证页；未录 → PIN 键盘。没有免验证的签名。
          </Rule>
          <Rule label="签名">
            验证通过 → Signing 过场 → Success → Done 返回。Reject 任意时刻直接返回，<strong>不产生记录</strong>。
          </Rule>
          <Rule label="指纹推荐">
            设备未录指纹时，<strong>首次 PIN 签名成功后</strong>（Done 之后、回首页之前）弹"启用指纹"推荐；Enable 跳设置-指纹页。
          </Rule>
        </Section>

        <Section title="信息来源">
          <Rule label="请求字段">
            amount / token / to / spender / calldata / fee 由手机 App 经 BLE 随签名请求传入；设备<strong>仅原样展示，不换算、不截断</strong>（安全红线）。
          </Rule>
          <Rule label="设备字段">
            From 地址由设备本地派生。历史详情里 Time 为设备记录，Hash 为广播回执（App 回传）。
          </Rule>
          <Rule label="法币">
            不显示任何法币估值——来源不可信，且与"核对要签的东西"无关。
          </Rule>
        </Section>

        <Section title="核心规则（照着做）">
          <Rule label="金额">
            全精度，<strong>整段同字号普通体</strong>，不分组、不省略、永不四舍五入。最长 18 位小数也整段显示，靠 <code className="font-mono text-[11px]">break-all</code> 换行。<br />
            范例：<code className="font-mono text-[11px]">1,234.567890123456789012</code>
          </Rule>
          <Rule label="地址">
            首尾各 6 位加粗、中段普通（<code className="font-mono text-[11px]">BoldEndsAddress</code>），mono + break-all 换行，<strong>绝不截断省略</strong>。核对靠首尾。
          </Rule>
          <Rule label="层次">
            标签弱、值强，<strong>对比靠字号不靠字重</strong>：标签 18px 细体 <code className="font-mono text-[11px]">leading-none</code>，值 20–24px 普通体。标签↔值间距 ≈ 字段↔字段间距的一半。
          </Rule>
          <Rule label="翻页">
            内容超一屏 → <strong>按字段整页翻</strong>，字段永不被切断；页码在标题栏右上，底部 Prev/Next。长文本（message / raw data）标 <code className="font-mono text-[11px]">flow</code>，接在最后一页固定字段的剩余空间起排、再整屏续翻。
          </Rule>
          <Rule label="≥18px">
            所有文字 ≥18px（含标签）。放不下就翻页或缩减字段，不靠缩字号。
          </Rule>
        </Section>

        {/* ── 2. 共用件（写一次，各类型不重复） ── */}
        <Section title="共用件（各类型同款）">
          <Rule label="操作栏">
            距左右 16px 的 2px 顶线；左 <strong>✕ Reject</strong> 80×60px 描边方块，右 <strong>Confirm</strong> 黑底 60px 高占满剩余宽（✓ + 18px 粗体大写）。Reject 任意时刻可点、直接返回不留痕。
          </Rule>
          <Rule label="详情入口">
            <strong>Full Details →</strong>：18px/300 大写，右对齐，固定在内容区底部、操作栏上方。<br />
            （Verify Code 屏的 <strong>Transaction Details →</strong> 是另一种入口——通栏可点按钮 + 箭头，<strong>有意不与 Full Details 合并</strong>。）
          </Rule>
          <Rule label="金额降档表">
            transfer / approve 共用同一段代码，按字符数：<code className="font-mono text-[11px]">≤6→60px｜7–10→48px｜11–12→36px｜13–20→30px｜&gt;20→24px</code>；一律 700 粗体、<code className="font-mono text-[11px]">tabular-nums</code>、整段换行、全精度。
          </Rule>
        </Section>

        {/* ── 3. 元素级示范：逐类型表格 ── */}
        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-2">元素示范（逐类型）</h4>

          <SpecTable
            caption="① Transfer 主屏"
            rows={[
              { el: '标签', ex: 'AMOUNT / FROM / TO', spec: '18px/300 大写 tracking-wide', layout: 'leading-none，距值 4px', src: '—' },
              { el: '金额', ex: '500', spec: '降档表（≤6→60px…），700 粗', layout: '整段换行，与币种 baseline 对齐', src: '请求' },
              { el: '币种', ex: 'USDT (Tron)', spec: '主屏 20px/700；详情 18px/400', layout: 'whitespace-nowrap 不拆行', src: '请求 token/network' },
              { el: '地址', ex: 'TKzx…6 / …g2Ax', spec: '20px mono，首6尾6加粗', layout: 'break-all 整段换行；To 收款人名 20px 普通体在地址上行', src: 'From 设备派生 / To 请求' },
              { el: 'Network Fee', ex: '13.5 TRX', spec: '20px/700 等宽（数字+空格+符号）', layout: '术语统一 Network Fee', src: 'App 估算' },
              { el: '分区', spec: '2px 黑线（my-3.5）', layout: '三级间距 标签↔值 4px ＜ 字段 10px ＜ 分区 ~28px', src: '—' },
            ]}
          />

          <SpecTable
            caption="② Verify Code（带校验码转账·主确认屏）"
            rows={[
              { el: '标签', ex: 'VERIFY CODE', spec: '18px/300，居中', layout: '垂直居中区块', src: '—' },
              { el: '校验码', ex: '748392', spec: '60px/700 等宽，字距 0.2em', layout: '居中，视觉焦点', src: 'App 随请求下发' },
              { el: '说明句', ex: 'Make sure this code matches…', spec: '18px/400，居中', layout: '码下方 24px', src: '固定文案' },
              { el: '明细入口', ex: 'Transaction Details →', spec: '18px 大写 + 箭头', layout: '2px 顶线下整行可点，通栏按压反色', src: '—' },
            ]}
            note="请求带 verifyCode 时校验码屏是主确认屏：先对码，点 Transaction Details → 进入交易明细（即普通 transfer 屏），返回键回到码屏。Confirm/Reject 在码屏即可操作。"
          />

          <SpecTable
            caption="③ Approve · 无限额"
            rows={[
              { el: '标签', ex: 'APPROVED AMOUNT', spec: '18px/300 大写 tracking-widest', layout: '距值 4px', src: '—' },
              { el: '授权额', ex: 'UNLIMITED', spec: '60px/700（与最大金额同级——最危险授权给最大重量）', layout: '不降档、不换行', src: '请求 isUnlimited' },
              { el: '被授权方', ex: 'Uniswap … Router + 地址', spec: '名 20px/700；地址 20px 等宽首6尾6加粗', layout: '名在上地址在下，同区块', src: '请求 spender/spenderName' },
              { el: 'Token', ex: 'USDT (Ethereum)', spec: '20px/700', layout: '符号+括号网络（网络已含于此）', src: '请求' },
              { el: 'Network Fee', ex: '0.0015 ETH', spec: '20px/700 等宽', layout: 'Token 下 mt-2.5', src: '请求' },
            ]}
            note="无独立 Network 字段——网络名已并入 Token 行（如 USDT (Ethereum)），不重复单写。分区 2px 黑线：Amount→Spender→Token 组。"
          />

          <SpecTable
            caption="④ Approve · 限额（差异部分）"
            rows={[
              { el: '授权额', ex: '1,234,567.8901234…', spec: '走金额降档表，700 粗', layout: '整段换行；币种 chip 20px/700 不拆行', src: '请求' },
              { el: 'Expires ╱ Network Fee', ex: '2026-06-30 14:32 UTC ╱ 0.0015 ETH', spec: '各 20px/700（fee 等宽）', layout: '左右双列：Expires 左、Fee 右对齐', src: '请求 expiry / App' },
            ]}
            note="网络已并入金额行的 USDT (Ethereum) → 第三区改为 Expires ╱ Network Fee 双列（Permit2 风格 expiry，绝对时间）。"
          />

          <SpecTable
            caption="⑤ Message（消息签名）"
            rows={[
              { el: '标签', ex: 'REQUESTED BY', spec: '18px/300', layout: '—', src: '—' },
              { el: '请求方', ex: 'Uniswap', spec: '30px/700（本屏 hero）', layout: '合约请求显示首6尾6加粗地址，否则 dappUrl 18px', src: '请求 dapp/contractAddress/dappUrl' },
              { el: 'Message 标头行', ex: 'MESSAGE (1/2) ‹ ›', spec: '标签 18px/300 + 页码 18px/700 + 28px 方块箭头', layout: '左标签右箭头；首/末页箭头隐形但占位', src: '—' },
              { el: '消息体', ex: 'Welcome to Uniswap!…', spec: '20px/700 等宽，行高 1.6', layout: '保留换行符，整段换行；屏内整页平移翻页（盒高即页高）', src: '请求 message，原样' },
            ]}
            note="消息盒高度是测量值（随请求方区块高度自适应），永不与操作栏重叠；无独立详情页——有意决策。"
          />

          <SpecTable
            caption="⑥ Blind（盲签）"
            rows={[
              { el: 'Contract', ex: 'TKzx…g2Ax', spec: '20px 等宽，首6尾6加粗', layout: '整段换行；仅第 1 页显示', src: '请求' },
              { el: 'Network', ex: 'Tron', spec: '20px/700', layout: 'Contract 下 10px', src: '请求' },
              { el: 'Raw Data 标头行', ex: 'RAW DATA (1/3) ‹ ›', spec: '同 Message 标头行', layout: '—', src: '—' },
              { el: '数据体', ex: '0x5ae401dc…', spec: '20px/700 等宽，行高 1.6', layout: '翻页同 Message；第 2 页起隐藏头部、数据吃满全屏（首页/后续页两档容量）；点数据区也可翻页（循环）', src: '请求 calldata，原样' },
            ]}
          />

          <SpecTable
            caption="⑦ Swap（合约调用）"
            rows={[
              { el: 'Pay / Receive 金额', ex: '1,234.5678901234567890', spec: '小降档表 ≤12→24px｜13–18→20px｜>18→18px；700 粗等宽', layout: 'Pay 上 Receive 下，中间 1px 线 + ↓', src: '请求 amountIn/Out' },
              { el: '币种 chip', ex: 'USDT (Tron)', spec: '18px/700', layout: '不拆行，与金额底线对齐', src: '请求' },
              { el: 'Contract', ex: 'SunSwap V2 Router + 地址', spec: '名 20px/700；地址 20px 等宽首6尾6加粗', layout: '名换行，同区块', src: '请求' },
              { el: 'Network Fee', ex: '27.5 TRX', spec: '20px/700 等宽', layout: '—', src: 'App 估算' },
            ]}
            note="Swap 金额起始档 24px 比 transfer 60px 小——一屏要放两个金额 + 合约信息。分区 2px 黑线 ×2（换币区→Contract→Fee）。"
          />
        </div>

        {/* ── 4. Sign History ── */}
        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-2">Sign History</h4>

          <SpecTable
            caption="⑧ 列表卡片"
            rows={[
              { el: '卡片', spec: '固定 102px 高，2px 描边，4 张/页', layout: '整卡可点，按压反色', src: '被拒签名不入列表（无状态）' },
              { el: '币标', ex: '₮ / ◆ / G', spec: '28px，线宽 1.5', layout: '左侧，随按压反色', src: '主流币裸符号；稳定币圆环+符号；未知币首字母圆章；类型图标 sign/swap/blind' },
              { el: '主行', ex: 'USDT (TRON)', spec: '20px/400 大写', layout: '单行截断（完整在详情）', src: 'swap 写 USDT→TRX (TRON)；blind 写 RAW DATA (ETHEREUM)' },
              { el: '金额', ex: '123.46K', spec: '20px/400 等宽', layout: '右对齐不换行；title 出全值', src: '列表缩写：≥1M→x.xxM｜≥1万→x.xxK｜<1→≤6位去尾零｜其余千分位+2位' },
              { el: '副行', ex: 'TRANSFER · 时间戳', spec: '类型 18px/400 大写；时间 18px/300', layout: '卡内 2px 分隔线下方', src: 'Transfer/Approve/Sign/Swap/Blind Sign' },
              { el: '翻页', ex: '1/3 · PREV/NEXT', spec: '页码标题栏右上 18px/700；底部 48px 描边按钮', layout: '仅显示可用方向', src: '—' },
            ]}
          />

          <Section title="⑨ 详情（5 类通用规则）">
            <Rule label="字段集">
              = 对应签名类型的 Full Details 字段、<strong>顺序一致</strong>，仅加两类：<code className="font-mono text-[11px]">Time</code> <strong>领头</strong>（18px 标签 + 20px/400 值）、广播回执 <code className="font-mono text-[11px]">Transaction Hash</code>（消息类叫 <code className="font-mono text-[11px]">Signature Hash</code>）<strong>收尾</strong>（20px/400 等宽整段换行）。
            </Rule>
            <Rule label="消息类">
              额外保留 <code className="font-mono text-[11px]">Message Type</code>（Plain Text / Hexadecimal Data，24px/400）。
            </Rule>
            <Rule label="字重">
              值一律 <strong>400 普通体</strong>（区别于签名主屏的 700——主屏在做核对决策，详情是事后查阅）；金额详情页统一 24px 全精度不分组。
            </Rule>
            <Rule label="长内容">
              Message 正文 / Blind 的 Raw Data 作 <code className="font-mono text-[11px]">flow</code> 字段压轴：接排末页固定字段剩余空间（≥100px 才接排），之后整屏续翻。
            </Rule>
            <Rule label="翻页">
              = DetailListView 标准件：按字段整页翻、页码右上、底部 Prev/Next。
            </Rule>
            <Rule label="来源">
              除 Time（设备记录）和 Hash（App 回传广播回执）外，全部来自当时的签名请求快照。组件：<code className="font-mono text-[11px]">Transfer/Approve/SignMessage/Swap/BlindDetailPage.tsx</code>。
            </Rule>
          </Section>
        </div>

        <Section title="完整规范">
          <Rule label="spec">
            字段边界分页算法、<code className="font-mono text-[11px]">flow</code> 用法、精确 class 与 <code className="font-mono text-[11px]">DetailField</code> API 见 <code className="font-mono text-[11px]">unified/DETAIL_LIST_SPEC.md</code>。本面板只列要点，不重复。
          </Rule>
        </Section>
      </div>

      <ConstraintsCard />
    </FeatureDocsPanel>
  );
}
