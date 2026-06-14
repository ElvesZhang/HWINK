# SafePal Obsidian e-ink 钱包 — UI 设计规范

> 本文以键盘组件（`PINKeypad` / `UniversalKeyboard`）的实现为蓝本，把"在墨水屏 + 2 色约束 + 全屏刷新"前提下逐步沉淀的可复用规则汇总。新功能任何 UI 都应套用同一套词汇。

---

## 1. 设备硬约束（先有这层认知再谈设计）

| 约束 | 含义 | 实操含义 |
|---|---|---|
| 只有两种颜色 | 屏幕只能渲染 `#838383`（底）和 `black`（前）两值 | 任何中间灰 (`#a0a0a0`、`text-gray-500`、`opacity-50` 等) 在真机上**要么变 0 要么变 100**，不可预测 |
| 全屏刷新 | 任何视觉变化都触发整屏重绘，会闪烁 | 杜绝实时计数、动画、转场、心跳、滚动惯性等高频更新 |
| 像素粗糙 | 物理屏低 DPI | 字号下限 `text-sm` (14px)，`text-xs` (12px) 是字体上限不是常规态 |
| 字体回退不可控 | 系统字体可能渲染 Unicode 字符为方框/不同字形 | `✓` `✗` `⚠` 等 Unicode 符号一律改用 `lucide-react` 图标 |
| 触摸而非鼠标 | 用户用手指操作 | 字母键最小 `w-8 h-10` (32×40)，PIN 键 `h-16` (≈64)；按钮间距 `gap-1` / `gap-2` 不再缩 |

---

## 1.5 Onboarding 模式（不是独立的设计语言，是"省略 title bar"）

**重要更正**：产品里**只有一套设计语言**。激活流程不另起炉灶，不发明新的 CTA 样式、新的字号梯度、新的按钮形状。

激活流程与日常使用的差异**仅靠两个开关**实现：

1. **隐藏顶部 title bar**：不渲染 UPPERCASE 标题和 `border-b-2`。可以只保留裸 `←` 返回箭头（45px 行内左对齐），让屏幕"看上去更轻"
2. **可选启用整屏可点的 "Tap to continue" 模式**：用于低信息量的过渡屏（splash / welcome）。底部 80px hint 条（参考 `OnboardingHintBar.tsx`），无上下边框。**不是必须**：交互重一些的 onboarding 屏（如助记词记录、PIN 设置）仍用显式 `BTN_BASE` 按钮

splash 是唯一彻底例外（品牌 logo 居中 + 标语），仅一屏。

### 共用层（无差异）

下列所有元素 **激活与日常完全相同**，不允许漂移：

- 调色板（§1）、字号梯度（§5.2）、字重、间距
- 按钮：`BTN_BASE` / `BTN_DANGER` 一律用，不发明新的 onboarding 专属 CTA
- 列表：`SettingsItem` / `PathRow`（onboarding 大选择屏专用，1/3 等高）
- 输入：`PINKeypad` / `UniversalKeyboard` / 输入框 + X 清空
- 警告 / 危险卡、提示卡（dashed）
- 图标库 lucide-react（§6）
- 按压反馈：瞬时反色 + `PRESS` 常量
- 禁用态：虚线（§3）
- 错误提示位置（§4.6 A/B 模式）

### 差异层（onboarding-only 的两个开关）

| 开关 | onboarding | operational |
|---|---|---|
| 顶部 title bar | **不渲染** UPPERCASE 标题；保留裸 `←`（如有上一步） | `border-b-2` + UPPERCASE 标题 |
| Tap to continue 底条 | **可启用**（低信息量过渡屏） | 不使用 |
| Status bar | 通常无（用户还没"拥有"设备） | 顶部 StatusBar.tsx |

差异**仅限上述三处**。一切其它视觉元素与日常使用一致。

### 选择判定

新写一个 onboarding 屏前，自查：

- 这是过渡型（如 welcome）还是操作型（如助记词记录）？
- 过渡型：套 "Tap to continue 模式"
- 操作型：和日常一样写（用 `BTN_BASE`、提示卡、输入框等），**只是不渲染顶部 title bar**

### 为什么不做两套设计语言

之前考虑过给 onboarding 一套独立视觉（黑色圆角胶囊 CTA、更大字号、更多留白）。但：
- 墨水屏 2 色 + 全屏刷新的硬约束下，"胶囊 vs 矩形"、"text-3xl vs text-xl" 的差异远不如"是否有顶部 title bar"明显
- 两套系统的维护成本巨大（每次改一个元素要兼顾两套）
- 用户感受到 onboarding 与日常不同，是因为**内容**（"Welcome to SafePal" / Logo / "Set up a new wallet"）和 **chrome 密度**（无 title bar），而不是因为按钮形状不同
- 行业惯例（Ledger / Trezor）里 onboarding 的差异主要也是 chrome 密度，不是另起设计系统

---

## 2. 视觉层级原语（替代颜色的所有手段）

色彩没了，层级靠这五件武器组合：

### 2.1 边框粗细
```
border-2   普通可点元素 / 容器
border-4   强调（危险、关键警告框）
border     极小图标里嵌套元素（如 16×16 状态指示）
```

### 2.2 边框风格
```
border-solid    默认（不写也是 solid）
border-dashed   "永久或场景性禁用"的统一标记
```

### 2.3 字重
```
font-bold    标题、按钮文字、强调
font-normal  正文（默认）
```
绝不用 color shade 表达 secondary，而用 weight。

### 2.4 填色反转（唯一的色彩对照）
```
bg-[#838383] text-black    默认面：灰底黑字
bg-black text-[#838383]    反色面：黑底灰字，用于
                            • 主 CTA（如已激活的 ✓ 确认键、Abandon 按钮）
                            • 按下/悬停瞬时反馈
                            • 危险动作的醒目按钮
```

### 2.5 内容缺失
```
按钮位置在、边框在、label/icon 不渲染   →  "槽位存在但当前无效"
```
不是"不可点击的灰按钮"，而是"看似空的格子"。

---

## 3. 状态视觉词汇表（最值得记的一节）

把"不可用"按 **原因** 区分成五种，每种有自己的样式：

### 3.1 "暂时锁住"（context-driven disabled, 有 label/icon）
**何时**：可点按钮，但当前 value 不满足条件
**典型**：键盘 ← 退格（value 为空时）、键盘 ✓ 确认（PIN 不满 6 位时）
**样式**：`disabled:border-dashed disabled:cursor-default disabled:hover:bg-[#838383] disabled:hover:text-black`
**要点**：保留 label/icon，仅边框由实变虚。锁住 hover 反色，防止禁用按钮还会变黑。

### 3.2 "结构性此刻无效"（content-driven, 无 label）
**何时**：按键位置必须保留以维持网格，但本次按键流程中这个键没有合法 affordance
**典型**：BIP39 模式下不能继续构成有效单词的字母、BIP39 模式下的 `123/ABC` 切换
**样式**：保持 `border-2 border-black` 实线，**label 渲染为空字符串**

```tsx
<button disabled={disabled} className="w-8 h-10 border-2 border-black ...">
  {disabled ? '' : key}
</button>
```

**与 3.1 的区分**：3.1 是"用户操作链上下一次会变可用"（再敲一个字符 ← 就亮）；3.2 是"在当前模式下永远没意义但布局需要它存在"。

### 3.3 "完全不该出现"（fully hidden）
**何时**：无边框小图标按钮，且当前真的没有任何含义需要表达
**典型**：内容分页箭头到达边界（SignRequest 内的滚动 chevron）
**样式**：`disabled:invisible`
**与 3.1 的区分**：3.1 是必须告诉用户"这个按钮在但当前不可用"；3.3 是连"按钮在"都不需要告诉用户。

### 3.4 "功能整体未启用"（feature dormant）
**何时**：整个功能模块当前关闭（蓝牙未开、NFC 未开等空态页）
**样式**：虚线方框 + 居中大图标
```tsx
<div className="w-20 h-20 border-2 border-dashed border-black rounded-sm
                flex items-center justify-center mx-auto mb-4">
  <Icon className="w-12 h-12 text-black" strokeWidth={1.5} />
</div>
<div className="text-base font-bold text-black">Feature is disabled</div>
<div className="text-sm text-black mt-2">Turn on to ...</div>
```
**读法**："插槽存在但是空的"。

### 3.5 "已发生但作废"（voided past event）
**何时**：历史记录里已被拒绝/失败的事件
**样式**：
- 状态图标位用小虚线方框包 X：`w-4 h-4 border border-dashed border-current rounded-[2px]` + 内嵌 `<X className="w-3 h-3" />`
- 关联的数值（金额等）加 `line-through decoration-2`
- 整张卡片**保持实线边框**（仍可点开看详情，不要错把"已作废"读成"不可交互"）

---

## 4. 交互行为规则

### 4.1 按压反馈：瞬时反色，不要动画
**禁用**：`transition-all`、`active:scale-95` 等会被墨水屏的整屏刷新粗暴打断的过渡

**统一写法**：
```ts
const PRESS = 'active:bg-black active:text-[#838383]';
```
配合 `hover:bg-black hover:text-[#838383]` 用。Hover 是桌面预览用，Press 是真机用，两者目标一致："瞬间反色，松开恢复"。

### 4.2 确认动作在键盘内（PIN 键盘）
**规则**：所有 device PIN 入口，✓ 在 PINKeypad 内置（0 右边那格），**不另起 Continue 按钮**。
**理由**：手指/视线轨迹局限在键盘区，省去到底部按钮的二次定位。
**条件启用**：`value.length === maxLength` 才让 ✓ 变 `bg-black text-[#838383]` 可点；未满 6 位 → 灰底虚线边框（3.1 规则）。

### 4.3 杜绝即时更新
**禁止**：实时字符计数、强度条、倒计时、动态进度条、心跳颤动、循环 spinner、平滑滚动
**替代**：
- 长度上限 → 静默执行（达到 maxLength 后忽略后续按键，不闪红、不抖动）
- 错误反馈 → 提交时一次性更新（reject 后展示文案）
- 失败次数 → 每次失败更新一次，不是每秒刷新
- Loading → 把按钮文案换成"Verifying..."并禁用，不用 spinner

### 4.4 自动大写规则（仅文本模式）
- 进入时 `keyboardMode='uppercase'` + 内部 `autoCap=true`
- 输入第一个字母后：自动落到 `lowercase`，清 `autoCap`
- 空格后：再次升 `uppercase` + `autoCap=true`
- 用户手动按 Shift：`autoCap=false`，从此用户掌控
- BIP39 模式：**始终默认 `lowercase`**，因为单词均小写

### 4.5 不可点的不响应 hover
任何禁用按钮必须显式锁死 hover 反色：
```
disabled:hover:bg-[#838383] disabled:hover:text-black
```
否则鼠标停在禁用按钮上还会变黑，误导可点。

### 4.6 避免聚焦元素位置抖动（关键）
**规则**：错误提示、loading 文本、动态副标题等"按状态出现的消息"，不能出现在**已聚焦元素（输入框 / 键盘 / 主操作按钮）的上方**。墨水屏全屏刷新一次，但用户对"自己刚输入的内容"位置位移最敏感。

**反模式**（旧 ChangePINPage / ResetDevicePage 早期写法）：
```tsx
<h2>Enter PIN</h2>
{error && <div>⚠ {error}</div>}   {/* ← 出现时把 keypad 整体下挤 */}
<PINKeypad ... />
```

**正确做法**

**A. 有"输入框"的页面（passphrase 输入、wallet name 等）**：错误放在 input **下方**，且 tip 卡用 `mt-auto` 贴底，错误只压缩 input 与 tip 之间的弹性空间：
```tsx
<div className="mb-4"><h2>...</h2><p>...</p></div>
{renderInputField(...)}
{error && (
  <div className="text-base text-black font-bold flex items-center gap-1 mb-2">
    <AlertTriangle className="w-4 h-4" strokeWidth={3} /> {error}
  </div>
)}
<div className="mt-auto mb-2 border-2 border-black border-dashed ...">Tip</div>
```

**B. 无独立 input、聚焦元素是大块的（PIN 键盘、相机预览等）**：在 h2 和聚焦元素之间预留**固定高度反馈槽**，无论消息是否显示槽位高度都不变：
```tsx
<div className="mb-2"><h2>Enter your device PIN</h2></div>
<div className="min-h-[28px] mb-2">
  {isSubmitting && <p className="text-sm text-black font-bold">Verifying...</p>}
  {!isSubmitting && error && (
    <div className="text-base text-black font-bold flex items-center gap-1">
      <AlertTriangle className="w-4 h-4" strokeWidth={3} /> {error}
    </div>
  )}
</div>
<div className="flex-1 flex flex-col justify-center"><PINKeypad ... /></div>
```

**判定**：任何"按 state 切换的内联文本"，先问自己——"如果这段文字突然出现，下方的输入区会不会移动？"。会的话，重排为 A 或 B 模式。

---

## 5. 间距与排版

### 5.1 标准间距单位
```
gap-1    4px   键之间
gap-2    8px   主要按钮组之间
gap-3    12px  分区之间
p-3      12px  键盘 / 容器外内边距（标准）
px-3     12px  按钮内横向 padding（不带 px 的按钮，文字会贴边）
mb-4     16px  小节标题与正文之间
mb-6     24px  独立段落之间
```

### 5.2 字号
| 用途 | 类 | 何时 |
|---|---|---|
| 设备 header bar 标题 | `text-sm font-bold uppercase tracking-wide` | 仅页面顶部 chrome |
| 页面主标题 | `text-xl font-bold` | h2，**不要大写** |
| 段落小标题 | `text-base font-bold` | 卡片内 h3 |
| 正文 | `text-sm` | 默认 |
| 极小辅助 | `text-xs` | 仅备用，**最小阈值，需评估可读性** |

### 5.3 关于 uppercase
**保留**：设备 chrome 风格的 header bar（如顶部"PASSPHRASE"）
**移除**：页面主标题、按钮文案、卡片小标题、列表项

---

## 6. 图标与字符

### 6.1 一律用 lucide-react
```
✓  →  <Check />
✗  →  <X />
⚠  →  <AlertTriangle />
←  →  <ChevronLeft /> 或 <Delete />（退格用 Delete）
```
不用 Unicode，不用 emoji，不用字体图标。

### 6.2 strokeWidth 约定
| 场景 | strokeWidth |
|---|---|
| Header back arrow | 2.5 |
| 输入框内 X 清空 | 3 |
| 状态指示（成功/失败大图） | 3 |
| 装饰性大图标（空态） | 1.5 |
| 一般 inline | 2.5 |

---

## 7. 常用 className 模板（直接复用）

### 7.1 主操作按钮（h-14 标准 CTA）
```tsx
const BTN_BASE = `h-14 border-2 border-black rounded-sm bg-[#838383]
  hover:bg-black hover:text-[#838383] active:bg-black active:text-[#838383]
  font-bold text-lg`;
```

### 7.2 危险/反白主操作按钮
```tsx
const BTN_DANGER = `h-14 border-4 border-black rounded-sm bg-black text-[#838383]
  hover:bg-[#838383] hover:text-black active:bg-[#838383] active:text-black
  font-bold text-lg`;
```

### 7.3 禁用态后缀（接 BTN_BASE）
```
disabled:border-dashed disabled:cursor-not-allowed
disabled:hover:bg-[#838383] disabled:hover:text-black
```

### 7.4 输入框（带 X 清空槽位）
```tsx
<div className="relative mb-3">
  <div className="min-h-14 border-2 border-black rounded-sm bg-[#838383]
                  flex items-start px-3 py-2 pr-12">
    <span className="text-lg font-bold text-black flex-1 break-all">
      {value || ' '}
    </span>
  </div>
  {value && (
    <button onClick={onClear} aria-label="Clear"
      className="absolute top-2 right-2 w-8 h-8 rounded-full
                 border-2 border-black bg-[#838383]
                 flex items-center justify-center
                 hover:bg-black hover:text-[#838383]
                 active:bg-black active:text-[#838383]">
      <X className="w-4 h-4" strokeWidth={3} />
    </button>
  )}
</div>
```
**不要**在框旁单独显示 `x/maxLength`，长度上限静默执行（4.3 规则）。

### 7.5 Header bar（带返回）
```tsx
<div className="h-[45px] px-5 flex items-center border-b-2 border-black">
  <button onClick={onBack}
    className="flex items-center gap-2 active:bg-black active:text-[#838383] px-1 -mx-1 rounded-sm">
    <ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
    <span className="text-sm font-bold text-black uppercase tracking-wide">{title}</span>
  </button>
</div>
```

### 7.6 警告/危险信息卡
```tsx
<div className="border-4 border-black rounded-sm p-4 bg-black text-[#838383] mb-6">
  <h3 className="text-sm font-bold flex items-center gap-1 mb-3">
    <AlertTriangle className="w-4 h-4" strokeWidth={3} /> Warning
  </h3>
  <ul className="space-y-2 text-sm">
    <li>- ...</li>
  </ul>
</div>
```

### 7.7 上下文提示（虚线 dashed 卡片）
```tsx
<div className="mt-auto mb-2 border-2 border-black border-dashed rounded-sm p-3 bg-[#838383]">
  <div className="text-xs font-bold text-black mb-1">Tip</div>
  <p className="text-sm text-black leading-snug">...</p>
</div>
```

### 7.8 空态（功能未启用）
```tsx
<div className="flex-1 flex items-center justify-center">
  <div className="text-center">
    <div className="w-20 h-20 border-2 border-dashed border-black rounded-sm
                    flex items-center justify-center mx-auto mb-4">
      <Icon className="w-12 h-12 text-black" strokeWidth={1.5} />
    </div>
    <div className="text-base font-bold text-black">Feature is disabled</div>
    <div className="text-sm text-black mt-2">Turn on to ...</div>
  </div>
</div>
```

---

## 8. 反例 / 禁止清单

```
❌ opacity-50 / opacity-20 / opacity-* 用于"次要、置灰、禁用"
❌ text-gray-300 等中间灰色文字
❌ transition-all、transition-transform、transition-opacity
❌ active:scale-95、active:scale-90、any scale animation
❌ 实时变化的字符计数 {value.length}/{max}
❌ 动态进度条（除非用户主动触发的离散步骤）
❌ Unicode 字符 ✓ ✗ ⚠ ← → 当 icon 用
❌ 给同一禁用语境同时叠加 border-dashed + line-through + opacity（任一足矣）
❌ 在 BIP39 模式给键盘默认大写
❌ PIN 输入下方再加 Continue 按钮（应该用键盘内置 ✓）
❌ 按钮全大写 + 卡片小标题全大写 + h2 全大写（层级被磨平）
❌ 错误提示 / loading 文字插在 h2 与输入框/keypad 之间（违反 §4.6，致使聚焦元素整体位移）
```

---

## 10. Feature docs panel（功能右侧说明栏）

> 当某个功能的视觉/状态/交互值得给协作者解释时（设计评审、固件对接、测试覆盖），右侧浮动一块说明面板。所有这种面板必须用同一个外壳，规则与字号视觉一致。

### 10.1 共享外壳：`FeatureDocsPanel`

文件：`src/app/components/FeatureDocsPanel.tsx`

提供：
- `<FeatureDocsPanel icon title sourceFile? controls? >...</FeatureDocsPanel>` —— 浮动壳（top-6 right-6、340px 宽、内置滚动）
- `<Section title>...</Section>` —— 小节标题 + ul
- `<Rule label>...</Rule>` —— 单条规则（左侧 mono 标签 + 右侧说明文）
- `<ConstraintsCard />` —— 共性 amber 卡，提醒墨水屏三大约束（不即时更新 / 不灰阶 / 不动画）
- `pillClass(active)` —— 控制条里 pill 风格按钮的 className 生成器

### 10.2 标准结构

```tsx
import { Key } from 'lucide-react';
import {
  FeatureDocsPanel, Section, Rule, ConstraintsCard, pillClass,
} from './FeatureDocsPanel';

export function MyFeatureDocsPanel({ mode, onModeChange, ...props }) {
  return (
    <FeatureDocsPanel
      icon={Key}                          // lucide 图标
      title="My Feature Flow"             // 短标题
      sourceFile="MyFeaturePage.tsx"      // 右上角文件名（mono 灰）
      controls={                          // 可选：tabs / toggles，进 header 下沿
        <>
          <button onClick={() => onModeChange('a')} className={pillClass(mode === 'a')}>A</button>
          <button onClick={() => onModeChange('b')} className={pillClass(mode === 'b')}>B</button>
        </>
      }
    >
      <Section title="State machine">
        <Rule label="step1">说明...</Rule>
        <Rule label="step2">说明...</Rule>
      </Section>

      <Section title="Display rules">
        <Rule label="规则名">具体描述...</Rule>
      </Section>

      <ConstraintsCard />     {/* 推荐结尾贴这一卡，作为共性提醒 */}
    </FeatureDocsPanel>
  );
}
```

### 10.3 接入 App.tsx

在框外（与 DeviceFrame 同级）按 currentPage 条件渲染：

```tsx
{currentPage === 'my-feature' && (
  <MyFeatureDocsPanel mode={mode} onModeChange={setMode} />
)}
```

### 10.4 内容组织约定

按这个顺序组织内容，新人扫一遍能立刻上手：

1. **State machine / 流程**：列出所有 step 或子页面，每条 `<Rule label="stepName">` + 一句作用描述
2. **Flows / 路径**：如果功能有多条用户路径（如 passphrase 的 SET / VERIFY / ABANDON），分别列出 step 链
3. **Display & input rules**：键盘选择、长度上限、字符限制、提示位置、UI 规约
4. **Safety / state constraints**：必勾 checkbox、case sensitive、失败次数、isSubmitting、状态同步等
5. （可选）**Live controls**：仅用于此功能调试的按钮集合
6. **`<ConstraintsCard />`**：放在最后，承担"提醒共性约束"职责，不要每个 `<Section>` 都重复这些。

### 10.5 现有实例（参考实现）

- `KeyboardDocsPanel.tsx` —— 包含 variant tabs（PIN/Text/BIP39）+ 按变体切换的规则集 + Try-a-prefix 调试区
- `PassphraseDocsPanel.tsx` —— 包含 Inactive/Active 切换 + state machine + 三条 flow + 安全约束

### 10.6 何时该加 docs panel？何时不该加？

**应加**：
- 状态机有 ≥ 5 个 step
- 同一入口承载 ≥ 2 条用户路径
- 视觉/交互依赖隐式规则（如 BIP39 字母禁用的"空槽"语义）需要向协作者讲清楚
- 已经在/即将做固件对接，需要把"前端期望的行为"沉淀下来

**不该加**：
- 单一线性流程、无分支（直接跑就懂）
- 仅为 mockup/还原 Figma，没有真实交互逻辑
- 内容超过 300 字 —— 这种该写成单独的文档/规范，不该塞进右侧浮动条

---

## 11. 移植到新功能时的核查清单

新写一个页面/组件前，自查：

1. [ ] 我的页面是否用到了任何"灰阶"做层级（中间色、opacity）？→ 替换为字重/边框/填色反转。
2. [ ] 是否有任何元素会高频更新（每帧、每秒）？→ 改为离散事件触发更新。
3. [ ] 禁用元素的语义属于 §3 的哪一类？用对应的样式词汇。
4. [ ] 主操作 CTA 是否走 §7.1 / §7.2 模板？危险动作是否用了反白？
5. [ ] 头部、h2、按钮的大写规则是否符合 §5.3？
6. [ ] 所有图标都来自 lucide-react，没有 Unicode 字符？
7. [ ] 按钮没有 transition / scale 动画，press 反馈用 §4.1 的反色？
8. [ ] PIN 输入用 PINKeypad 内置 ✓，不另加 Continue？
9. [ ] 字符计数、强度条等"实时"提示都改成上下文静态提示卡（§7.7）？
10. [ ] 在墨水屏上想象一次完整交互，能不能复述这条路径而不依赖颜色？
11. [ ] 错误 / loading 提示是否避免出现在聚焦元素上方？输入框走 §4.6 A 模式，键盘类走 §4.6 B 模式。
12. [ ] 我的功能是否符合 §10.6 "应加 docs panel" 的标准？如是，按 §10.2 模板加 `FeatureDocsPanel`。
