/**
 * styleMeta.ts — single source of truth for every Lab design language.
 *
 * WHY THIS EXISTS
 * The team kept producing "new" styles that only changed font size. The fix is
 * to make the ONE axis we care about — intra-screen information arrangement
 * (composition) + framing metaphor — explicit and machine-checkable. Each style
 * declares which COMPOSITION CELL it occupies on each archetype screen. The
 * Gallery renders these as spec cards so differences are legible at a glance,
 * and the anti-convergence gate (LAB_EXPLORATION_METHOD.md) rejects any new
 * language whose (home,sign,history) cell vector duplicates an existing one.
 *
 * This file is descriptive metadata only — it renders nothing. The actual
 * style components live in ./styles/*.tsx and are wired in LabPage.tsx.
 */

import type { LabScreen, LabStyle } from './data';

/** Spatial arrangement of information on a single screen (NOT the typography/skin). */
export type CompositionCell =
  | 'centered-hero'      // hero value centered, everything stacked center
  | 'masthead-band'      // full-width bold/inverted band carries identity; body below
  | 'flow-schematic'     // FROM → TO directional flow with connectors/arrows
  | 'receipt-stack'      // narrow centered monospace stack with divider lines
  | 'two-col-asym'       // asymmetric two-column magazine spread
  | 'grid-blocks'        // modular rectangular blocks / bento tiles
  | 'instrument-readout' // gauge / meter / measuring-instrument arrangement
  | 'inverted-hud'       // black field with reticles / corner frames
  | 'left-rail-meta'     // labels pinned in a left column, values in the right
  | 'split-5050'         // screen split into two halves (body + stub)
  | 'margin-notes'       // central column with metadata as side-margin annotations
  | 'agenda-grid'        // dated/sectioned grid (calendar-like)
  | 'spec-table'         // bordered field table / spec sheet
  | 'card-stack'         // stacked discrete cards
  | 'ruled-rows'         // equal-weight rows separated by hairline rules
  | 'numbered-index'     // big index numerals lead each row
  | 'radial'             // concentric / dial / clock arrangement
  | 'timeline'           // vertical time spine
  | 'illustrated-hero'   // a bespoke illustration is the dominant element (illustration-axis batch)
  | 'placeholder';       // screen intentionally not implemented

export type Archetype = 'home' | 'sign' | 'history';

export interface StyleMeta {
  id: LabStyle;
  label: string;                                   // shown in LabControls list
  group: string;                                   // ordering bucket in controls
  metaphor: string;                                // framing metaphor (one phrase)
  oneLiner: string;                                // personality anchor (<= 8 words)
  cell: Record<Archetype, CompositionCell>;        // composition occupied per screen (gated axes)
  annotations?: Partial<Record<LabScreen, string[]>>; // static callouts per screen (incl. seed/verify)
}

/** Human label for a cell (for the spec card). */
export const CELL_LABEL: Record<CompositionCell, string> = {
  'centered-hero': '居中主角',
  'masthead-band': '报头横幅',
  'flow-schematic': '流向示意',
  'receipt-stack': '票据竖列',
  'two-col-asym': '非对称双栏',
  'grid-blocks': '模块网格',
  'instrument-readout': '仪表读数',
  'inverted-hud': '反白 HUD',
  'left-rail-meta': '左栏标签',
  'split-5050': '对开/主+副券',
  'margin-notes': '正文+旁注',
  'agenda-grid': '议程网格',
  'spec-table': '规格表',
  'card-stack': '卡片堆叠',
  'ruled-rows': '等权细线行',
  'numbered-index': '编号索引',
  'radial': '径向/转盘',
  'timeline': '时间轴',
  'illustrated-hero': '插画主导',
  'placeholder': '（未实现）',
};

/* ────────────────────────────────────────────────────────────────────────
   THE REGISTRY. Existing 28 entries classified by composition (read from the
   actual style files), then the 6 new languages that fill the unused cells.
   ──────────────────────────────────────────────────────────────────────── */
export const STYLE_META: Record<LabStyle, StyleMeta> = {
  // ── ⑦ featured explorations ──
  poster:       { id: 'poster',       label: '⑦ Poster · 海报',     group: '⑦', metaphor: '海报 Poster',        oneLiner: '极端尺度对比', cell: { home: 'centered-hero', sign: 'centered-hero', history: 'placeholder' } },
  receipt:      { id: 'receipt',      label: '⑦ Receipt · 票据',    group: '⑦', metaphor: '热敏小票 Receipt',    oneLiner: '等宽居中、撕裂线', cell: { home: 'receipt-stack', sign: 'receipt-stack', history: 'receipt-stack' } },
  flow:         { id: 'flow',         label: '⑦ Flow · 流向图',     group: '⑦', metaphor: '工程示意 Schematic',  oneLiner: 'FROM→TO 引线标注', cell: { home: 'flow-schematic', sign: 'flow-schematic', history: 'placeholder' } },
  spread:       { id: 'spread',       label: '⑦ Spread · 杂志',     group: '⑦', metaphor: '杂志跨页 Spread',     oneLiner: '非对称双栏、衬线', cell: { home: 'two-col-asym', sign: 'two-col-asym', history: 'two-col-asym' } },

  // ── ⑥ minimal interaction-flow variants (composition near-identical by design) ──
  minimaldrill: { id: 'minimaldrill', label: '⑥ Min · 摘要+全览',   group: '⑥', metaphor: '极简下钻 Minimal',    oneLiner: '摘要主角+详情页', cell: { home: 'centered-hero', sign: 'centered-hero', history: 'placeholder' } },
  minimaldense: { id: 'minimaldense', label: '⑥ Min · 单屏全览',    group: '⑥', metaphor: '极简全览 Minimal',    oneLiner: '所有字段单屏', cell: { home: 'centered-hero', sign: 'ruled-rows', history: 'placeholder' } },
  // ── ⑤ refinements ──
  clarity:      { id: 'clarity',      label: '⑤ Clarity · 标识',    group: '⑤', metaphor: '交通标识 Signage',    oneLiner: '一屏一主体、极大字', cell: { home: 'ruled-rows', sign: 'centered-hero', history: 'placeholder' } },
  refined:      { id: 'refined',      label: '⑤ Refined · 编辑',    group: '⑤', metaphor: '屏优衬线 Editorial',  oneLiner: '细线行、Newsreader', cell: { home: 'ruled-rows', sign: 'spec-table', history: 'placeholder' } },

  // ── ①②③ design-language candidates ──
  p1:           { id: 'p1',           label: '① 仪器 Instrument',   group: '①②③', metaphor: '测量仪器 Instrument', oneLiner: '单字族、克制', cell: { home: 'ruled-rows', sign: 'spec-table', history: 'placeholder' } },
  p3:           { id: 'p3',           label: '③ 编辑 Editorial',    group: '①②③', metaphor: '议程海报 Editorial',  oneLiner: '衬线数字、反白窄条', cell: { home: 'numbered-index', sign: 'spec-table', history: 'numbered-index' } },

  // ── ④ traditional faithful-layout variants ──
  traditional:  { id: 'traditional',  label: '④ Traditional',       group: '④', metaphor: '忠实布局 Traditional', oneLiner: '卡片转墨线', cell: { home: 'grid-blocks', sign: 'left-rail-meta', history: 'numbered-index' } },
  tradtime:     { id: 'tradtime',     label: '④ List · 时间轴',     group: '④', metaphor: '忠实布局 · 时间轴',   oneLiner: '左侧时间脊', cell: { home: 'grid-blocks', sign: 'left-rail-meta', history: 'timeline' } },

  // ── reference / archive ──
  composite:    { id: 'composite',    label: 'Composite · mix',     group: 'archive', metaphor: '混合 House-blend',  oneLiner: '衬线数字+细线', cell: { home: 'numbered-index', sign: 'left-rail-meta', history: 'numbered-index' } },
  editorial:    { id: 'editorial',    label: 'Editorial',           group: 'archive', metaphor: '黑底白纸海报',     oneLiner: '巨号索引、反白条', cell: { home: 'numbered-index', sign: 'spec-table', history: 'agenda-grid' } },
  label:        { id: 'label',        label: 'Label · spec',        group: 'archive', metaphor: '工业标签 Spec',     oneLiner: '边框单元、条码', cell: { home: 'grid-blocks', sign: 'spec-table', history: 'ruled-rows' } },
  techwear:     { id: 'techwear',     label: 'Techwear',            group: 'archive', metaphor: '机能贴纸 Collage',  oneLiner: '粗压缩体、警示条', cell: { home: 'grid-blocks', sign: 'centered-hero', history: 'ruled-rows' } },
  hud:          { id: 'hud',          label: 'HUD · line',          group: 'archive', metaphor: '科幻线框 HUD',      oneLiner: '准星、角框', cell: { home: 'grid-blocks', sign: 'centered-hero', history: 'ruled-rows' } },
  fono:         { id: 'fono',         label: 'Fono · soft',         group: 'archive', metaphor: '柔和仪表盘 Fono',   oneLiner: '圆角卡、环形进度', cell: { home: 'card-stack', sign: 'card-stack', history: 'card-stack' } },
  bento:        { id: 'bento',        label: 'Bento · grid',        group: 'archive', metaphor: '模块 OS Bento',     oneLiner: '细线方块、状态点', cell: { home: 'grid-blocks', sign: 'grid-blocks', history: 'grid-blocks' } },
  serif:        { id: 'serif',        label: 'Serif · tone',        group: 'archive', metaphor: '衬线色块 Serif',    oneLiner: '色调卡、圆箭头', cell: { home: 'card-stack', sign: 'card-stack', history: 'card-stack' } },
  sketch:       { id: 'sketch',       label: 'Sketch · hand',       group: 'archive', metaphor: '手绘线框 Sketch',   oneLiner: '抖动边、不对称圆角', cell: { home: 'card-stack', sign: 'card-stack', history: 'card-stack' } },
  shadow:       { id: 'shadow',       label: 'Shadow · neo',        group: 'archive', metaphor: '新粗野投影 Shadow',  oneLiner: '硬偏移投影', cell: { home: 'card-stack', sign: 'card-stack', history: 'card-stack' } },
  // tradtech exists in the type but has no LabDevice case — kept out of STYLE_ORDER.
  tradtech:     { id: 'tradtech',     label: 'Traditional · tech',  group: 'archive', metaphor: '忠实布局 · 技术',   oneLiner: '（未接线）', cell: { home: 'grid-blocks', sign: 'left-rail-meta', history: 'ruled-rows' } },

  /* ════════════════ 2026-06 NEW BATCH — fills unused composition cells ════════════════ */
  manuscript: {
    id: 'manuscript', label: '✦ Manuscript · 手稿', group: 'new',
    metaphor: '注释手稿 Manuscript',
    oneLiner: '正文居中、元数据作旁注',
    cell: { home: 'margin-notes', sign: 'margin-notes', history: 'margin-notes' },
    annotations: {
      home: ['主体 = 居中衬线书名页（钱包名/型号）', '右窄边栏 = 旁注（电量/连接/统计）', '入口 = 带页码的目录条目'],
      sign: ['金额 = 居中正文大字', '左/右页边 = 收款/手续费/网络旁注', '校验码 = 脚注，确认/拒绝在底栏'],
      history: ['每条 = 一段带行号的正文', '日期时间 = 左边栏旁注', '状态 = 右边栏批注', '点条目 → 该签名的“题跋页”详情'],
      seed: ['书名页：Recovery / WORD nn / 12', '已输入词 = 编号正文列表（有界）', '输入 = 一行衬线正文 + 光标', '建议词 = 缩进旁注（前导 ›）', '禁用键留框、字 invisible'],
      verify: ['长度选择 = 两种“版本” 12 / 24', '复查网格：点词就地改，当前词反白', '建议条确认词；末词出结果', '结果 = Verified / No Match'],
    },
  },
  dial: {
    id: 'dial', label: '✦ Dial · 转盘', group: 'new',
    metaphor: '密码转盘 / 表盘 Dial',
    oneLiner: '同心圆、主值居中环抱',
    cell: { home: 'radial', sign: 'radial', history: 'radial' },
    annotations: {
      home: ['钱包名 = 圆心', '入口 = 环绕圆心的弧形扇区/刻度', '电量连接 = 外圈刻度'],
      sign: ['金额 = 圆心主值', '收款/网络/手续费 = 同心环上的刻度位', '确认 = 沿弧的长压/扇形按钮'],
      history: ['最新 = 表盘中心读数', '历史 = 沿刻度向外/向下的转盘磁带', '状态 = 刻度旁标记', '点条目 → 该签名的中心读数详情'],
      seed: ['进度 nn/12 置于刻度旁', '已输入词 = 有界词带', '标准键盘 + 3 个建议刻度', '禁用键留框、字 invisible', '完成 = DialFace + Check'],
      verify: ['长度选择 = 两个表盘读数', '复查网格 + 输入 + 键盘', '结果用 DialFace + Check/X'],
    },
  },
  ticket: {
    id: 'ticket', label: '✦ Ticket · 车票', group: 'new',
    metaphor: '车票 / 登机牌 Ticket',
    oneLiner: '主券+撕裂线+副券',
    cell: { home: 'split-5050', sign: 'split-5050', history: 'ruled-rows' },
    annotations: {
      home: ['主券 = 钱包名/型号（出票人）', '齿孔撕裂线分隔', '副券(右窄条) = 电量/连接/统计存根'],
      sign: ['主券 = 金额+收款（行程）', '撕裂线', '副券 = 校验码+网络存根；底部确认/拒绝'],
      history: ['每条 = 一张迷你票根', '左 = 编号/日期，右 = 状态打孔', '点条目 → 整张票（主券摘要 + 存根状态）'],
      seed: ['主券 = 输入 + 建议 + 键盘', '副券存根 = WORD nn/12 + 已输入数', '撕裂线分隔', '禁用键留框、字 invisible'],
      verify: ['主券 = 复查网格 + 输入 + 键盘', '副券 = 步骤/进度', '结果 = Verified / No Match'],
    },
  },
  ledger: {
    id: 'ledger', label: '✦ Ledger · 账簿', group: 'new',
    metaphor: '账簿 / 索引册 Ledger',
    oneLiner: '固定左标签栏贯穿全屏',
    cell: { home: 'left-rail-meta', sign: 'left-rail-meta', history: 'left-rail-meta' },
    annotations: {
      home: ['左栏 = 固定标签列（NAME/MODEL/PWR/ENTRIES）', '右栏 = 对应值，入口为带值的行', '左栏标签贯穿三屏不变'],
      sign: ['左栏 = 字段名（AMOUNT/TO/NET/FEE/CODE）', '右栏 = 值，金额为右栏首行大字', '确认/拒绝在底部跨栏'],
      history: ['左栏 = 序号+日期列', '右栏 = 摘要+状态', '细线分隔每个账目行', '点条目 → 账目明细（左=字段名/右=值）'],
      seed: ['左栏标签 WORD / ENTERED / INPUT', '右栏 = 值 + 键盘', '建议作账目行', '禁用键留框、字 invisible'],
      verify: ['左栏标签随步骤 LENGTH / WORD nn / REVIEW', '右栏 = 网格/输入/键盘', '结果行 Verified / No Match'],
    },
  },
  timeline: {
    id: 'timeline', label: '✦ Timeline · 时间轴', group: 'new',
    metaphor: '时间轴 / 行程 Timeline',
    oneLiner: '左侧时间脊串联节点',
    cell: { home: 'timeline', sign: 'timeline', history: 'timeline' },
    annotations: {
      home: ['左脊 = 竖线+节点', '节点 = 入口（现在/接下来）', '钱包名为脊顶起点'],
      sign: ['左脊 = 签名步骤进度节点', '右侧 = 金额/收款/网络/手续费依次挂在节点上', '末节点 = 确认/拒绝'],
      history: ['左脊 = 真实时间轴（日期分段）', '节点 = 每笔签名，按时间从上到下', '状态标在节点右侧', '点节点 → 该签名详情（明细挂在脊上）'],
      seed: ['每个已输入词 = 脊上一个节点', '输入 + 建议 + 键盘在下', '进度注记在时间脊', '禁用键留框、字 invisible'],
      verify: ['节点 = 待确认的词', '末节点 = 结果', '失败可重试'],
    },
  },
  broadsheet: {
    id: 'broadsheet', label: '✦ Broadsheet · 头版', group: 'new',
    metaphor: '大报头版 Broadsheet',
    oneLiner: '主导报头+多层标题',
    cell: { home: 'masthead-band', sign: 'masthead-band', history: 'masthead-band' },
    annotations: {
      home: ['顶部 = 反白报头横幅（报名/日期/电量）', '其下 = 多栏目索引（入口为栏目标题+副题）', '横幅是贯穿三屏的主导元素'],
      sign: ['报头 = "CONFIRM SEND" + 网络', '头条 = 金额大标题+副题(收款)', '正文栏 = 地址/手续费/校验码；底栏确认/拒绝'],
      history: ['报头 = SIGN HISTORY + 计数', '其下 = 按日期分栏目的新闻条目', '状态 = 条目尾部标签', '点条目 → 头版“SIGNATURE”详情（明细作分栏）'],
      seed: ['报头 RECOVERY + WORD nn/12', '已输入词作一栏', '输入 + 建议 + 键盘', '禁用键留框、字 invisible'],
      verify: ['报头 VERIFY；长度选择作两条头条', '复查网格', '结果作头条 Verified / No Match'],
    },
  },

  /* ════════════════ 2026-06 ILLUSTRATION BATCH ════════════════
     These 4 explore the ILLUSTRATION-AESTHETIC axis (icons/illustration as the
     dominant element) — orthogonal to the composition-cell gate. They share the
     'illustrated-hero' cell on purpose and are distinguished by `metaphor`, so
     the cell-vector-uniqueness rule (isCellVectorUnused) does NOT apply to them. */
  engraving: {
    id: 'engraving', label: '✦ Engraving · 版画', group: 'illus',
    metaphor: '纸币雕刻 Engraving',
    oneLiner: 'guilloché 玫瑰线 + 雕刻花边框',
    cell: { home: 'illustrated-hero', sign: 'illustrated-hero', history: 'illustrated-hero' },
    annotations: {
      home: ['中央 guilloché 玫瑰徽章 + 钱包名', '雕刻双线花边框', '入口为带线刻小图的目录'],
      sign: ['金额置于雕刻奖章/花边内', '金库/币线刻小图点缀', '确认/拒绝在雕花底栏'],
      history: ['每条配线刻小章 + 雕花分隔', '点条目 → 雕刻"凭证"详情'],
      seed: ['钥匙线刻图 + 雕花框输入', '键盘禁用键留框、字 invisible'],
      verify: ['盾牌线刻 + 雕花复查网格', '结果为雕刻徽章 Verified / No Match'],
    },
  },
  pictograph: {
    id: 'pictograph', label: '✦ Pictograph · 象形', group: 'illus',
    metaphor: '象形徽记 Pictograph',
    oneLiner: '大号实心象形图主导',
    cell: { home: 'illustrated-hero', sign: 'illustrated-hero', history: 'illustrated-hero' },
    annotations: {
      home: ['每个入口一个大号实心象形图块', '顶部钱包名 + 设备实心图', '图标即导航'],
      sign: ['大号实心币流图 + 巨号金额', '收款/网络/手续费配小实心图标', '确认/拒绝实心按钮'],
      history: ['每条配实心类型图标(转账/授权/签名)', '点条目 → 详情(实心盾/币图 + 字段)'],
      seed: ['大号钥匙实心图 + 键盘', '禁用键留框、字 invisible'],
      verify: ['大号实心盾图', '复查网格 + 结果实心 Check / X'],
    },
  },
  woodcut: {
    id: 'woodcut', label: '✦ Woodcut · 木刻', group: 'illus',
    metaphor: '木刻绘本 Woodcut',
    oneLiner: '木刻排线阴影 + 场景插画',
    cell: { home: 'illustrated-hero', sign: 'illustrated-hero', history: 'illustrated-hero' },
    annotations: {
      home: ['整屏木刻场景(金库/设备) + 排线阴影', '钱包名压在木刻横幅上', '入口为木刻条目'],
      sign: ['木刻币堆场景 + 金额', '排线(hatch)做体积阴影', '确认/拒绝木刻按钮'],
      history: ['每条木刻小插图 + 排线', '点条目 → 木刻详情页'],
      seed: ['木刻钥匙 + 排线键盘区', '禁用键留框、字 invisible'],
      verify: ['木刻盾牌场景', '复查网格 + 木刻结果'],
    },
  },
  infographic: {
    id: 'infographic', label: '✦ Infographic · 线描图', group: 'illus',
    metaphor: '线描信息图 Infographic',
    oneLiner: '线描图标 + from→to 图解',
    cell: { home: 'illustrated-hero', sign: 'illustrated-hero', history: 'illustrated-hero' },
    annotations: {
      home: ['以钱包为中心的连线信息图(入口=分支节点)', '线描图标标注每个分支', '电量/连接作仪表标注'],
      sign: ['from→to 线描图解 + 币在线上', '金额/手续费作引线标注', '确认/拒绝在底栏'],
      history: ['每条画成迷你 from→to 图标行', '点条目 → 图解详情(连线 + 字段)'],
      seed: ['线描钥匙 + 进度图解 + 键盘', '禁用键留框、字 invisible'],
      verify: ['线描盾 + 对勾图解', '复查网格 + 结果图解'],
    },
  },
  // ── archive: frozen real-page snapshot (not a composition exploration) ──
  verifyclassic: {
    id: 'verifyclassic', label: '◆ Verify · 旧版存档', group: 'archive',
    metaphor: '真机旧版存档 Archive',
    oneLiner: 'entered 网格版（真机已换新版）',
    cell: { home: 'placeholder', sign: 'placeholder', history: 'placeholder' },
    annotations: {
      verify: ['旧版快照：方框输入 + 6/页可编辑「Entered」网格 + 完整 UniversalKeyboard', '真机已替换为：线式输入 + prev/next + 专用 BIP39 键盘', '仅此屏实现，其余为占位'],
    },
  },
  lineicon: {
    id: 'lineicon', label: '✦ Lineicon · 线性', group: 'illus',
    metaphor: '极简线性图标 (Lucide)',
    oneLiner: '统一细线 lucide 图标、留白克制',
    cell: { home: 'illustrated-hero', sign: 'illustrated-hero', history: 'illustrated-hero' },
    annotations: {
      home: ['每个入口配一个统一细线 lucide 图标', '钱包名 + Wallet 图标', '克制留白、单色细线'],
      sign: ['Coins 图标 + 金额；收款/网络/手续费', '校验码不在此屏 → 点“完整详情”进', '确认/拒绝在底栏'],
      history: ['每条配类型 lucide 图标', '点条目 → 签名详情'],
      seed: ['KeyRound 图标 + 键盘', '禁用键留框、字 invisible'],
      verify: ['ShieldCheck 图标 + 复查网格', '结果 Verified / No Match'],
    },
  },
};

/** Display order in the Gallery & LabControls. New batch first so it's seen. */
export const STYLE_ORDER: LabStyle[] = [
  'manuscript', 'dial', 'ticket', 'ledger', 'timeline', 'broadsheet',
  'engraving', 'pictograph', 'woodcut', 'infographic', 'lineicon',
  'poster', 'receipt', 'flow', 'spread',
  'minimaldrill', 'minimaldense',
  'clarity', 'refined',
  'p1', 'p3',
  'traditional', 'tradtime',
  'composite', 'editorial', 'label', 'techwear', 'hud',
  'fono', 'bento', 'serif', 'sketch', 'shadow',
  'verifyclassic',
];

/** Back-compat list for LabControls — [id, label] derived from the registry. */
export const LAB_STYLES: [LabStyle, string][] = STYLE_ORDER.map((id) => [id, STYLE_META[id].label]);

/** Stable reference number for a style = its 1-based position in STYLE_ORDER (padded).
 *  Order is APPEND-ONLY so these numbers stay stable for citing/confirming a style
 *  (e.g. "#08"). New styles go at the end of their batch; never reorder existing ids. */
export function styleNo(id: LabStyle): string {
  const i = STYLE_ORDER.indexOf(id);
  return i < 0 ? '--' : String(i + 1).padStart(2, '0');
}

/** True if no existing style occupies the same (home,sign,history) cell vector. */
export function isCellVectorUnused(
  vector: Record<Archetype, CompositionCell>,
  exclude?: LabStyle,
): boolean {
  const key = (c: Record<Archetype, CompositionCell>) => `${c.home}|${c.sign}|${c.history}`;
  const target = key(vector);
  return !STYLE_ORDER.some((id) => id !== exclude && key(STYLE_META[id].cell) === target);
}

/** Which cells are occupied on a given screen (for spotting gaps). */
export function occupiedCells(screen: Archetype): Set<CompositionCell> {
  return new Set(STYLE_ORDER.map((id) => STYLE_META[id].cell[screen]));
}

export type { LabScreen, LabStyle };
