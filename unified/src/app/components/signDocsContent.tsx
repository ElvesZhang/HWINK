import type { ReactNode } from 'react';

/**
 * Content model for the Sign developer-docs panel (SignDetailDocsPanel).
 *
 * The panel renders ONLY the docs for the device's current screen. App.tsx
 * mirrors that screen into a `SignDocsView` (derived in SignRequestPage /
 * SignatureHistoryPage) and passes it to the panel; the panel looks the view
 * up in SIGN_DOCS and renders the four collapsible categories below.
 *
 * Every spec value here is verified against SignRequestPage.tsx — not written
 * from memory. Cross-cutting display rules + shared components live in the
 * panel's static footer (rendered once), not per-view.
 */

/** One device screen the panel can document. The shared Verify Code screen
 *  (`verify`) precedes every type. Keyed off `signType` (NOT currentRequest.type
 *  — approve / approveLimit share type 'approve'). */
export type SignDocsView =
  // ── universal first screen (level 1, shared by every type) ──
  | 'verify'
  // ── sign-request sub-screens (level 2) ──
  | 'transfer/main' | 'transfer/raw-data'
  | 'approve/main' | 'approveLimit/main' | 'approve/raw-data'
  | 'message/message' | 'message/raw-data'
  | 'blind/raw-data'
  | 'swap/main' | 'swap/raw-data'
  // ── shared confirm tail (all types) ──
  | 'confirm/second-factor' | 'confirm/result'
  // ── sign history ──
  | 'history/list'
  | 'history/transfer' | 'history/approve' | 'history/sign' | 'history/swap' | 'history/blind';

/** One row of the 元素 / 字号·字重 / 排布 / 来源 spec table. */
export type SpecRow = { el: string; ex?: string; spec: string; layout: string; src?: string };

export interface ViewDoc {
  title: string;            // header shown above the four categories
  flow?: ReactNode;         // 流程说明
  dataSource?: ReactNode;   // 数据来源
  interaction?: ReactNode;  // 交互说明
  elements?: SpecRow[];     // 界面元素 (rendered as a SpecTable)
  elementsNote?: ReactNode;  // optional caption note under the table
}

// ── shared element tables (reused across views) ───────────────────────────

/** Transfer 主屏 element table. */
const TRANSFER_ELEMENTS: SpecRow[] = [
  { el: '标签', ex: 'AMOUNT / FROM / TO', spec: '18px/300 大写 tracking-wide', layout: 'leading-none，距值 4px', src: '—' },
  { el: '金额', ex: '500', spec: '降档表（≤6→60px…），700 粗', layout: '整段换行，与币种 baseline 对齐', src: '请求' },
  { el: '币种', ex: 'USDT (Tron)', spec: '主屏 20px/700；详情 18px/400', layout: '长网络名换行（break-words，不再 nowrap，避免溢出）；网络只在此处显示，无独立 Network 字段', src: '请求 token/network' },
  { el: '地址', ex: 'TKzx…6 / …g2Ax', spec: '主屏 20px mono，首6尾6加粗', layout: 'break-all 整段换行；To 收款人名 20px 普通体在地址上行（注：详情页地址改 sans，主屏仍 mono）', src: 'From 设备派生 / To 请求' },
  { el: 'Network Fee', ex: 'Max 13.5 TRX', spec: '20px/700 等宽，整行独占', layout: 'Max 前缀 + formatFee 舍入到 ~6 位有效数字（估算上限，非精确）', src: 'App 估算' },
  { el: '分区', spec: '2px 黑线（my-3.5）', layout: '三级间距 标签↔值 4px ＜ 字段 10px ＜ 分区 ~28px', src: '—' },
];

/** Generic DetailListView field specs — used by the history detail screens
 *  (they render via DetailListView). The live sign-request second layer is now
 *  a single Raw Data field, not a full field list. */
const DETAIL_ELEMENTS: SpecRow[] = [
  { el: '标签', spec: '18px/300 大写', layout: 'leading-none，值上方', src: '—' },
  { el: '值', spec: '20px/400 普通体（全部统一）', layout: '事后查阅用普通体（区别签名主屏 700）；详情值一律 20px sans', src: '签名请求快照' },
  { el: '地址', spec: '20px sans，首6尾6加粗', layout: 'break-all 整段换行，绝不截断（详情已去 mono，统一 sans）', src: '请求快照' },
  { el: '金额', spec: '20px/400 全精度', layout: '不分组不省略', src: '请求' },
  { el: 'Network Fee', spec: '20px/400 全精度', layout: '详情为精确值（不舍入）；主屏才显示 Max+舍入', src: '请求/App 估算' },
  { el: '翻页', spec: '页码标题栏右上；底部 Prev/Next', layout: '按字段整页翻，字段永不切断；长文本标 flow 接排末页再续翻', src: '—' },
];

// ── overall flow ──────────────────────────────────────────────────────────

export const OVERALL: ViewDoc = {
  title: 'Overall · 大流程',
  flow: (
    <ol className="list-decimal pl-4 space-y-1.5">
      <li><strong>收到请求</strong>：设备经 BLE 收到手机 App 的签名请求；字段（amount/token/to/spender/calldata/fee…）<strong>原样展示</strong>，不换算、不截断、不显法币。</li>
      <li><strong>校验码屏（统一第一步）</strong>：<strong>所有签名类型</strong>都先进校验码屏，与 App 对码后 <code className="font-mono text-[11px]">Transaction Details →</code> 进入对应类型内容（也可在此直接 Confirm）。verify 不再是单独的签名类型。</li>
      <li><strong>具体签名类型</strong>：transfer / approve / approveLimit / message / blind / swap(contractCall) 各渲染自己的内容屏，底部 ✕ Reject ｜ Confirm；返回键回校验码屏。</li>
      <li><strong>Confirm → 二次验证</strong>：必经——已录指纹 → 指纹验证页；未录 → PIN 键盘。首次 PIN 成功后（未录指纹时）弹"启用指纹"推荐。</li>
      <li><strong>Signing → Success</strong>：验证通过 → Signing 过场 → Success → Done 返回。Reject 任意时刻直接返回、<strong>不产生记录</strong>。</li>
    </ol>
  ),
};

// ── helper for the 5 history detail views (same shape, different label) ─────

function historyDetail(label: string, note: ReactNode): ViewDoc {
  return {
    title: `History · ${label}详情`,
    flow: <>事后查阅一条已签记录。字段集 = 对应签名类型的 Full Details 字段、<strong>顺序一致</strong>，<code className="font-mono text-[11px]">Time</code> 领头；<strong>每个详情都以 <code className="font-mono text-[11px]">Raw Data</code> 收尾</strong>（原始签名负载 hex，flow 字段分页不裁切；消息类为 <code className="font-mono text-[11px]">Message</code>）。</>,
    dataSource: <>除 <code className="font-mono text-[11px]">Time</code>（设备记录）外，全部来自当时的签名请求快照（<strong>不显示交易/签名 Hash</strong>）。{note}</>,
    interaction: <>DetailListView 标准件：按字段整页翻、页码右上、底部 Prev/Next；返回回列表。被拒签名不入列表（无 Status 概念）。</>,
    elements: DETAIL_ELEMENTS,
  };
}

// ── per-view docs ──────────────────────────────────────────────────────────

export const SIGN_DOCS: Record<SignDocsView, ViewDoc> = {
  // ───── Verify (universal first screen, level 1) ─────
  'verify': {
    title: 'Verify · 校验码（统一第一步）',
    flow: <><strong>所有签名类型的统一第一屏</strong>（不再是单独的签名类型）：先把屏上 6 位码与 SafePal App 对齐，确认通道无误。<br />Transaction Details → 进入对应签名类型的内容屏（第二级）；也可在本屏直接 Confirm。Reject 任意时刻退出。</>,
    dataSource: <>校验码用于硬件 ↔ App 通道校验，由 App 随请求经 BLE 下发（原型用固定 <code className="font-mono text-[11px]">748392</code>）；说明句为固定文案。</>,
    interaction: <>底部 2px 线下 <code className="font-mono text-[11px]">Transaction Details →</code> 进内容屏（内容屏返回键回到本屏）；操作栏 ✕ Reject ｜ Confirm（本屏即可签）。</>,
    elements: [
      { el: '标签', ex: 'VERIFY CODE', spec: '18px/300，居中', layout: '垂直居中区块', src: '—' },
      { el: '校验码', ex: '748392', spec: '60px/700 等宽，字距 0.2em', layout: '居中，视觉焦点', src: 'App 下发（原型固定）' },
      { el: '说明句', ex: 'Make sure this code matches…', spec: '18px/400，居中', layout: '码下方 24px', src: '固定文案' },
      { el: '明细入口', ex: 'Transaction Details →', spec: '18px 大写 + 箭头', layout: '2px 顶线下整行可点，通栏按压反色', src: '—' },
    ],
  },

  // ───── Transfer ─────
  'transfer/main': {
    title: 'Transfer · 转账主屏',
    flow: <>普通转账一屏摘要：金额 hero + From/To + Network Fee，底部操作栏。Confirm → 二次验证；Reject 直接返回。</>,
    dataSource: <>amount / token / to / fee 来自请求（BLE）；From 地址设备本地派生；不显法币。网络名<strong>只在金额 chip 显示</strong>（无独立 Network 字段）。Network Fee 显示为 <strong>Max + 舍入</strong>（~6 位有效数字，估算上限）；<strong>交易金额仍全精度</strong>不舍入。</>,
    interaction: <>右下 <code className="font-mono text-[11px]">Raw Data →</code> 看原始交易数据；底部 ✕ Reject ｜ Confirm。</>,
    elements: TRANSFER_ELEMENTS,
  },
  'transfer/raw-data': {
    title: 'Transfer · Raw Data',
    flow: <>从摘要屏 <code className="font-mono text-[11px]">Raw Data →</code> 进入的<strong>原始数据抽屉</strong>：只展示原始交易（序列化 tx hex），<strong>不再逐字段重复摘要</strong>（Gas Limit / Your Address 等已去掉）。</>,
    dataSource: <>请求随附的原始签名负载，<strong>原样 hex</strong>。</>,
    interaction: <>单个 <code className="font-mono text-[11px]">flow</code> 字段，按整行翻页（不裁切）；返回回摘要屏，Confirm 在摘要屏。</>,
    elements: [
      { el: 'Raw Data', ex: '0x02f8b0…', spec: '20px/400 sans', layout: 'flow 字段，break-all，按整行翻页不裁切', src: '请求原始负载，原样 hex' },
    ],
  },


  // ───── Approve ─────
  'approve/main': {
    title: 'Approve · 无限额',
    flow: <>授权主屏：UNLIMITED 授权额给最大视觉重量（最危险），被授权方 + Token + Network Fee。Confirm → 二次验证。</>,
    dataSource: <>isUnlimited / spender / spenderName / token / fee 来自请求；网络名已并入 Token 行，<strong>无独立 Network 字段</strong>。</>,
    interaction: <>右下 Raw Data → 看原始交易数据；底部 Confirm/Reject。</>,
    elements: [
      { el: '标签', ex: 'APPROVED AMOUNT', spec: '18px/300 大写 tracking-widest', layout: '距值 4px', src: '—' },
      { el: '授权额', ex: 'UNLIMITED', spec: '60px/700（与最大金额同级——最危险授权给最大重量）', layout: '不降档、不换行', src: '请求 isUnlimited' },
      { el: '被授权方', ex: 'Uniswap … Router + 地址', spec: '名 20px/700；地址 20px 等宽首6尾6加粗', layout: '名在上地址在下，同区块', src: '请求 spender/spenderName' },
      { el: 'Token', ex: 'USDT (Ethereum)', spec: '20px/700', layout: '符号+括号网络（网络已含于此，长名换行）', src: '请求' },
      { el: 'Network Fee', ex: 'Max 0.0015 ETH', spec: '20px/700 等宽', layout: 'Token 下 mt-2.5；Max + formatFee 舍入到 ~6 位有效数字', src: '请求/App' },
    ],
    elementsNote: '分区 2px 黑线：Amount→Spender→Token 组。',
  },
  'approveLimit/main': {
    title: 'Approve · 限额',
    flow: <>限额授权主屏：授权额走金额降档表（不再是 UNLIMITED），第三区为 Network Fee（整行）。被授权方同无限额。<strong>不再显示 Expires</strong>——授权到期时间不由请求传入。</>,
    dataSource: <>amount / spender / token / fee 来自请求；网络名在金额 chip 内。<strong>无 Expires 字段</strong>。</>,
    interaction: <>右下 Raw Data → 看原始交易数据；底部 Confirm/Reject。</>,
    elements: [
      { el: '授权额', ex: '1,234,567.8901234…', spec: '走金额降档表，700 粗', layout: '整段换行；币种 chip 20px/700 长名换行', src: '请求' },
      { el: '被授权方', ex: 'Uniswap … Router + 地址', spec: '名 20px/700；地址 20px 等宽首6尾6加粗', layout: '名在上地址在下', src: '请求 spender/spenderName' },
      { el: 'Network Fee', ex: 'Max 0.0015 ETH', spec: '20px/700 等宽，整行独占', src: 'App 估算', layout: 'Max + formatFee 舍入到 ~6 位有效数字（已去掉 Expires）' },
    ],
    elementsNote: '网络已并入金额行的 USDT (Ethereum)；第三区为整行 Network Fee（不显示 Expires）。',
  },
  'approve/raw-data': {
    title: 'Approve · Raw Data',
    flow: <>approve 与 approveLimit <strong>共用</strong>同一原始数据抽屉：只展示原始 approve calldata（hex），<strong>不再逐字段重复</strong>（Gas Limit / Your Address 等已去掉）。</>,
    dataSource: <>请求随附的原始签名负载，<strong>原样 hex</strong>。</>,
    interaction: <>单个 <code className="font-mono text-[11px]">flow</code> 字段，按整行翻页（不裁切）；返回回授权摘要屏。</>,
    elements: [
      { el: 'Raw Data', ex: '0x095ea7b3…', spec: '20px/400 sans', layout: 'flow 字段，break-all，按整行翻页不裁切', src: '请求原始负载，原样 hex' },
    ],
  },

  // ───── Message ─────
  'message/message': {
    title: 'Message · 消息签名',
    flow: <>单屏：请求方区块 + 消息盒（屏内整页平移翻页）+ 操作栏；<strong>翻到末页底部出现 <code className="font-mono text-[11px]">Raw Data →</code> 入口</strong>（进原始数据抽屉，看真正被签的字节）。</>,
    dataSource: <>message 正文 App 随请求传入，<strong>原样展示</strong>、保留换行、不截断；合约请求显 <code className="font-mono text-[11px]">contractAddress</code>（首6尾6加粗），否则 dappUrl。</>,
    interaction: <>消息超一屏 → 标头行页码 (1/2) + 28px 方块箭头；消息盒高度为测量值，随请求方区块高度自适应，永不与操作栏重叠。<strong>末页（单页消息即刻）</strong>盒下出现右对齐 <code className="font-mono text-[11px]">Raw Data →</code>，点进抽屉；该行高度每页常驻，翻页不跳动。</>,
    elements: [
      { el: '标签', ex: 'REQUESTED BY', spec: '18px/300', layout: '—', src: '—' },
      { el: '请求方', ex: 'Uniswap', spec: '30px/700（本屏 hero）', layout: '合约请求显地址，否则 dappUrl 18px', src: '请求 dapp/contractAddress/dappUrl' },
      { el: 'Message 标头行', ex: 'MESSAGE (1/2) ‹ ›', spec: '标签 18px/300 + 页码 18px/700 + 28px 方块箭头', layout: '左标签右箭头；首/末页箭头隐形但占位', src: '—' },
      { el: '消息体', ex: 'Welcome to Uniswap!…', spec: '20px/700 sans，行高 1.6', layout: '保留换行符，整段换行；屏内翻页按整行对齐（不裁切行）', src: '请求 message，原样' },
    ],
    elementsNote: '消息正文用 sans（非等宽）；盒高为测量值，自适应请求方区块高度。',
  },
  'message/raw-data': {
    title: 'Message · Raw Data',
    flow: <>从消息末页 <code className="font-mono text-[11px]">Raw Data →</code> 进入的<strong>原始数据抽屉</strong>：展示真正被签名的字节（EIP-191 / typed-data 预映像，原样 hex），不重复消息正文。</>,
    dataSource: <>请求随附的待签字节，<strong>原样 hex</strong>（设备据此哈希并签名）。</>,
    interaction: <>单个 <code className="font-mono text-[11px]">flow</code> 字段，按整行翻页（不裁切）；返回回消息屏（停在原页），Confirm 在消息屏。</>,
    elements: [
      { el: 'Raw Data', ex: '0x19457468…', spec: '20px/400 sans', layout: 'flow 字段，break-all，按整行翻页不裁切', src: '请求待签字节，原样 hex' },
    ],
  },

  // ───── Blind ─────
  'blind/raw-data': {
    title: 'Blind · 盲签',
    flow: <>单屏：Contract + Network + Raw Data（屏内整页翻页）+ 操作栏；无独立详情页。盲签风险横幅常驻顶部。</>,
    dataSource: <>contractAddress / network / calldata 来自请求，<strong>原样展示</strong>不解析。</>,
    interaction: <>Raw Data 超一屏 → 标头行页码 + 箭头；<strong>第 2 页起隐藏 Contract/Network 头部</strong>、数据吃满全屏（首页/后续页两档容量）；点数据区也可翻页（循环）。</>,
    elements: [
      { el: 'Contract', ex: 'TKzx…g2Ax', spec: '20px 等宽，首6尾6加粗', layout: '整段换行；仅第 1 页显示', src: '请求' },
      { el: 'Network', ex: 'Tron', spec: '20px/700', layout: 'Contract 下 10px', src: '请求' },
      { el: 'Raw Data 标头行', ex: 'RAW DATA (1/3) ‹ ›', spec: '同 Message 标头行', layout: '—', src: '—' },
      { el: '数据体', ex: '0x5ae401dc…', spec: '20px/700 等宽，行高 1.6', layout: '翻页同 Message；第 2 页起隐藏头部、数据吃满全屏；点数据区也可翻页（循环）', src: '请求 calldata，原样' },
    ],
  },

  // ───── Swap (contractCall) ─────
  'swap/main': {
    title: 'Swap · 合约调用',
    flow: <>换币主屏：Pay → Receive 两个金额（中间 ↓），Contract + Network Fee。Confirm → 二次验证。</>,
    dataSource: <>amountIn/amountOut / 币种 / contractAddress / fee 来自请求；网络名在换币金额 chip 内。Network Fee 显示为 <strong>Max + 舍入</strong>（~6 位有效数字，估算上限）。</>,
    interaction: <>右下 Raw Data → 看原始交易数据；底部 Confirm/Reject。</>,
    elements: [
      { el: 'Pay / Receive 金额', ex: '1,234.5678901234567890', spec: '小降档表 ≤12→24px｜13–18→20px｜>18→18px；700 粗等宽', layout: 'Pay 上 Receive 下，中间 1px 线 + ↓', src: '请求 amountIn/Out' },
      { el: '币种 chip', ex: 'USDT (Tron)', spec: '18px/700', layout: '长名换行（break-words），与金额底线对齐', src: '请求' },
      { el: 'Contract', ex: 'SunSwap V2 Router + 地址', spec: '名 20px/700；地址 20px 等宽首6尾6加粗', layout: '名换行，同区块', src: '请求' },
      { el: 'Network Fee', ex: 'Max 27.5 TRX', spec: '20px/700 等宽，整行独占', layout: 'Max + formatFee 舍入到 ~6 位有效数字', src: 'App 估算' },
    ],
    elementsNote: 'Swap 金额起始档 24px 比 transfer 60px 小——一屏要放两个金额 + 合约信息。分区 2px 黑线 ×2。',
  },
  'swap/raw-data': {
    title: 'Swap · Raw Data',
    flow: <>从换币摘要屏 <code className="font-mono text-[11px]">Raw Data →</code> 进入的原始数据抽屉：只展示原始 swap calldata（hex）。<strong>Method / From(签名者) 等已去掉</strong>——都编码在原始数据里。</>,
    dataSource: <>请求随附的原始签名负载，<strong>原样 hex</strong>。</>,
    interaction: <>单个 <code className="font-mono text-[11px]">flow</code> 字段，按整行翻页（不裁切）；返回回换币摘要屏。</>,
    elements: [
      { el: 'Raw Data', ex: '0x38ed1739…', spec: '20px/400 sans', layout: 'flow 字段，break-all，按整行翻页不裁切', src: '请求原始负载，原样 hex' },
    ],
  },

  // ───── Confirm tail (shared) ─────
  'confirm/second-factor': {
    title: 'Confirm · 二次验证',
    flow: <>点 Confirm 后<strong>必经</strong>二次验证（无免验证签名）：已录指纹 → 指纹验证页（等待按压）；未录指纹 → PIN 键盘（6 位）。</>,
    dataSource: <>指纹模板 / PIN 均在设备本地校验，<strong>不离开设备</strong>。</>,
    interaction: <>指纹页等待按压，失败可重试；PIN 满 6 位 ✓ 才可点，错误清空重输。返回 / Reject 取消本次签名、不留记录。</>,
  },
  'confirm/result': {
    title: 'Confirm · 签名 / 结果',
    flow: <>验证通过 → Signing 过场 → Success → Done 返回首页。未录指纹时，<strong>首次 PIN 成功后</strong>弹"启用指纹"推荐（Enable 跳设置-指纹页）。</>,
    dataSource: <>签名在设备本地完成；广播由 App 负责。签名历史只存设备本地的请求快照（<strong>不回传/不显示广播 Hash</strong>）。</>,
    interaction: <>Signing 过场不可中断；Success 的 Done 返回首页。Reject 任意时刻直接返回、不产生记录。</>,
  },

  // ───── History ─────
  'history/list': {
    title: 'History · 列表',
    flow: <>已签记录列表（被拒签名不入，无 Status 概念）。整卡可点进对应类型详情。</>,
    dataSource: <>来自设备本地签名历史；金额在列表里缩写，详情里全精度。</>,
    interaction: <>整卡点进详情、按压反色；底部 Prev/Next 翻页，页码标题栏右上。</>,
    elements: [
      { el: '卡片', spec: '固定 102px 高，2px 描边，4 张/页', layout: '整卡可点，按压反色', src: '被拒签名不入列表（无状态）' },
      { el: '币标', ex: '₮ / ◆ / G', spec: '28px，线宽 1.5', layout: '左侧，随按压反色', src: '主流币裸符号；稳定币圆环+符号；未知币首字母圆章；类型图标 sign/swap/blind' },
      { el: '主行', ex: 'USDT (TRON)', spec: '20px/400 大写', layout: '单行截断（完整在详情）', src: 'swap 写 USDT→TRX (TRON)；blind 写 RAW DATA (ETHEREUM)' },
      { el: '金额', ex: '123.46K', spec: '20px/400 等宽', layout: '右对齐不换行；title 出全值', src: '列表缩写：≥1M→x.xxM｜≥1万→x.xxK｜<1→≤6位去尾零｜其余千分位+2位' },
      { el: '副行', ex: 'TRANSFER · 时间戳', spec: '类型 18px/400 大写；时间 18px/300', layout: '卡内 2px 分隔线下方', src: 'Transfer/Approve/Sign/Swap/Blind Sign' },
      { el: '翻页', ex: '1/3 · PREV/NEXT', spec: '页码标题栏右上 18px/700；底部 48px 描边按钮', layout: '仅显示可用方向', src: '—' },
    ],
  },
  'history/transfer': historyDetail('Transfer', <> 组件 <code className="font-mono text-[11px]">TransferDetailPage.tsx</code>。</>),
  'history/approve': historyDetail('Approve', <> 组件 <code className="font-mono text-[11px]">ApproveDetailPage.tsx</code>。</>),
  'history/sign': historyDetail('Sign（消息）', <> 组件 <code className="font-mono text-[11px]">SignMessageDetailPage.tsx</code>；另保留 <code className="font-mono text-[11px]">Message Type</code>（Plain Text / Hexadecimal Data，24px/400）；正文为 <code className="font-mono text-[11px]">Message</code> flow 字段压轴。</>),
  'history/swap': historyDetail('Swap', <> 组件 <code className="font-mono text-[11px]">SwapDetailPage.tsx</code>。</>),
  'history/blind': historyDetail('Blind', <> 组件 <code className="font-mono text-[11px]">BlindDetailPage.tsx</code>；Raw Data 作 flow 字段压轴。</>),
};
