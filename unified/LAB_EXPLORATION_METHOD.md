# Lab 探索方法 — 让"换设计语言"真的换骨架

> 目的：解决"很快就不再尝试设计语言变化、交互布局不动、只剩字号变化"的退化。
> 适用范围：`unified/src/app/lab/` 下的设计探索（首页 Home / 签名 Sign / 列表 History 三屏为构图轴核心；并覆盖 Seed / Verify / History 详情）。
> 配套实现：构图占用表 `src/app/lab/styleMeta.ts`、对照画廊 `src/app/lab/LabGallery.tsx`、Seed/Verify 共享逻辑 `src/app/lab/seedEngine.tsx`、插画套件 `src/app/lab/illus.tsx`、硬约束 `CONSTRAINTS.md`、已锁定语言 `EDITORIAL_DESIGN_LANGUAGE.md`。
>
> 两条探索轴并存：**构图轴**（同屏信息排列，§2 门禁约束，home/sign/history 为核心）与**插画美学轴**（图标/插画作为主角的视觉处理，1-bit 线刻/实心/排线）。后者由 `illus.tsx` 支撑，共用 `illustrated-hero` 构图格、靠 metaphor 区分。

---

## 0. 核心立场

我们只在两条轴上做探索，其余固定：

| 轴 | 是否变化 | 说明 |
|---|---|---|
| **同屏内信息排列（构图 CompositionCell）** | ✅ 主要变化 | 同样的信息，换一种空间组织 |
| **框架隐喻（metaphor）** | ✅ 主要变化 | 文档/票据/仪器/报纸…决定排版的根 |
| 基本交互流程 / 导航 | ⛔ 保持不变 | 进入→查看→确认/返回 的步骤一致 |
| 信息元素集合 | ⛔ 不可增删 | 见 §3 信息契约 |
| 墨水屏硬约束 | ⛔ 不可违反 | 见 `CONSTRAINTS.md` |

> 因为流程与信息都固定，**唯一能退化的方向就是"只改字号"**。所以下面的门禁（§2）专门把这条路堵死。

---

## 1. Brief 模板（每个新语言开工前必填，先写后写代码）

复制以下骨架，填完再动 `styles/<name>.tsx`：

```
语言 id：           <kebab-case，如 manuscript>
中文名/标签：        <如 手稿 Manuscript>
Personality anchor：<一句话人格，如 "注释手稿，不是仪表盘">
框架隐喻 metaphor：  <文档/票据/仪器/终端/报纸/证件… 并说明它如何决定排版的根>

三屏构图决策（每屏声明所占 CompositionCell + 主角/网格/元数据落点/层级）：
  · home    : cell=<…>  主角=<…>  元数据落点=<…>
  · sign    : cell=<…>  主角=<…>  元数据落点=<…>
  · history : cell=<…>  主角=<…>  元数据落点=<…>

它为什么 NOT 别的：
  <与最接近的现有语言相比，差在"信息位置/分组的重排"上，而不是字体/字号/描边>
```

**CompositionCell 词表**（见 `styleMeta.ts` 的 `CompositionCell`）：
`centered-hero · masthead-band · flow-schematic · receipt-stack · two-col-asym · grid-blocks · instrument-readout · inverted-hud · left-rail-meta · split-5050 · margin-notes · agenda-grid · spec-table · card-stack · ruled-rows · numbered-index · radial · timeline`

填完 brief，把它落进 `styleMeta.ts` 的 `STYLE_META[id]`（含 `metaphor / oneLiner / cell / annotations / isNew:true`），并加入 `STYLE_ORDER`。

---

## 2. 反收敛门禁（候选不过 = 打回，不准合入）

逐条勾，全过才算一个"新语言"：

1. ☐ **构图向量未被占用**：该语言 `(home, sign, history)` 的 cell 三元组在 `styleMeta.ts` 中不与任一现有语言重合。
   - 自检：`isCellVectorUnused({home, sign, history})`（`styleMeta.ts` 已导出）。
   - 例外：**纯插画美学批次**共享 `illustrated-hero` 构图格、靠 `metaphor` 区分（探索插画轴而非构图轴），本条豁免。
2. ☐ **差异不止字号**：与最接近的现有语言相比，必须有**信息位置或分组的重排**（主角换位、元数据搬家、网格改向…），不能只是字体/字号/字重/描边粗细的调整。
   - 自检：在画廊里把候选和最近邻并排切到同一屏，遮住字号仍能一眼看出布局不同。
3. ☐ **隐喻贯穿三屏**：框架隐喻在 home/sign/history 上都成立，而不是只在某一屏耍一个点子。
4. ☐ **信息契约齐全**：§3 列出的必含字段一个不少（用共享数据自然满足）。
5. ☐ **墨水屏合规**：设备屏代码中无 `opacity-` / `rounded` / `shadow` / `border-dashed` / 非 `#838383` 的灰 / emoji / `Math.random`（见 `CONSTRAINTS.md` 审计命令）。

> 经验法则：如果你"想不出新的构图格、只能把上一版字调大"，那就是收敛信号——停下，回到 §1 重新选一个 metaphor + 空白 cell。

---

## 3. 信息契约（保证"信息元素不可改，只可重排"）

每屏的必含信息元素，**来源 = 正式（非 lab）页面**，并已固化在 `src/app/lab/data.ts`。新语言直接 `import` 这些数据即可自动满足契约。

### Home（来源：`App.tsx` 首页 + `data.ts` `WALLET` / `HOME_ITEMS`）
- 钱包名 `WALLET.name`、型号 `WALLET.model`
- 电量 `WALLET.battery`、连接状态（蓝牙）、网络数 `WALLET.networks`、代币数 `WALLET.tokens`
- 四个入口 `HOME_ITEMS`：Assets / History / Passkey / Settings（各含 `label` + `sub`，可用 `code`）

### Sign（来源：`components/SignRequestPage.tsx` transfer 视图 + `data.ts` `SIGN`）
- 金额 `amount` + 代币 `token` + 法币 `fiat`
- 收款方名 `to` + 地址 `address`
- 网络 `network`、手续费 `fee`
- 确认 / 拒绝 两个动作（确认须显著、拒绝须次级）
- **校验码 `verify` 不在默认签名屏展示**：默认屏为摘要，点“完整详情 Full details”进入单独的**签名详情页**（含 amount/value/to/address/network/fee + **verify code**）。参考实现 `lineicon.tsx` 的 `Sign()` / `SignDetail()`。

### History（来源：`components/SignatureHistoryPage.tsx` + `data.ts` `HIST`）
- 每条：序号 `idx`、日期 `date`、时间 `time`、标题 `title`、副题 `sub`、类型 `type`、状态 `ok`（SIGNED/REJECTED）
- 计数（总条数）；（可选）筛选 all/sent/signed、分页、详情字段 `detail`

### History 详情（点条目下钻；来源：`LabPage.tsx` HistoryDetail · `p3-editorial.tsx` · `data.ts` `HIST[].detail`）
- 返回控件（ChevronLeft）+ 标题 “Signature” + 状态（SIGNED/REJECTED）
- 摘要：`idx` / `date` / `time` / `title` / `type` / `sub`
- 明细：`detail: [key,value][]`（逐条不同：To / Address / Network fee / Tx hash / Spender / Allowance / Method…），机器值（地址/hash/Tx）用 mono
- 实现：在 History 内用 `useState` 做一级下钻；列表行为按钮

### Seed（BIP39 录入；逻辑共享自 `lab/seedEngine.tsx` `useSeedEntry`，来源：`p3-editorial.tsx` Seed · `data.ts` `SEED`）
- 进度 “WORD nn / count”
- 已输入词的有界编号台账（不滚动）
- 输入框（prefix + 光标）
- ≤3 个 BIP39 建议词（点选 = commit）
- 键盘（KEY_ROWS）：禁用键留框、内容 `invisible`；退格 + “Back word”
- 完成态（全部录入）+ Restart

### Verify（验证助记词；逻辑共享自 `seedEngine.tsx` `useVerifyFlow`/`useReviewPage`，来源：`VerifyRecoveryPageNew.tsx` · `p3-editorial.tsx`）
- 步骤一：长度选择 12 / 24
- 步骤二：编号复查网格（点词就地改、当前词反白、超前格禁用）+ “Word nn / count”（多页时带页码）+ 输入 + ≤3 建议（点选确认）+ 键盘
- 步骤三：结果 Verified / No Match（成功自动返回，失败 Try Again）

> 允许：重排位置、改分组、改层级、改隐喻。
> 禁止：删字段、加未在契约内的新信息、把"必含"降级到看不见。

---

## 4. 如何"看到"探索成果

1. DebugPanel（🐛）→ Debug Tools → **Lab ▦ Gallery**（或单屏 Design Lab 面板里的"全部并排对照"按钮）。
2. 顶部切 **首页 / 签名 / 列表**：所有语言同屏并排、真实 ~3″ 比例，每个缩略图下有规格卡（隐喻 · 构图格 · 一句话 · 新批次的静态标注）。
3. 顶部图例列出"本屏已占用的构图格"——空白格就是下一批的目标。
4. 点任一缩略图进入单屏细看。

---

## 5. 现状基线（2026-06）

- 旧 26 个语言集中在 `grid-blocks / ruled-rows / spec-table / card-stack`（视觉跨度大，但构图重复、交互同构）。
- 新一批 6 个各占一个此前的空白格：
  `manuscript`(margin-notes) · `dial`(radial) · `ticket`(split-5050) · `ledger`(left-rail-meta 全屏) · `timeline`(timeline 全屏) · `broadsheet`(masthead-band)。
- 这 6 个语言已补齐 **Seed / Verify / History 详情**（交互逻辑共享自 `seedEngine.tsx`，皮肤各按隐喻）。
- 插画批次 4 个（**engraving / pictograph / woodcut / infographic**）探索**插画美学轴**（图标/插画为主角，1-bit 线刻/实心/排线），共享插画套件 `illus.tsx`；五屏齐全，Seed/Verify/详情同样复用 `seedEngine.tsx`。
- 另有 **lineicon** = 清爽 lucide 线性图标实验（回应“图标太繁杂”），并作为**新 Sign 模式的参考实现**：默认签名屏不放校验码，点“完整详情”进单独详情页。
- **编号**：每个语言有稳定 `#NN`（= `styleNo()` 在 `STYLE_ORDER` 的 1-based 位次，append-only 以保持稳定），画廊卡片与 LabControls 均显示，便于引用确认。新测试语言为 #01–#11。
- 下一批可瞄准画廊仍显示为空的格：`instrument-readout`(真多表) · `inverted-hud`(全黑场) · 以及 history 屏长期欠探索的非线性排布。
