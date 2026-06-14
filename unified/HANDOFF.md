# 硬件钱包 e-ink 原型 — 源码交接说明

> 版本：2026-06-13。本文写给接手的开发同事（以及他们使用的 AI 助手）。
> **AI 接手建议的阅读顺序**：本文 → `CONSTRAINTS.md` → `DETAIL_LIST_SPEC.md` → 对应组件源码。
>
> **本次更新（06-13）**：① 开发说明面板按"可验证规格"标准重写——所有数值对码核对、
> 元素规格用表格（`FeatureDocsPanel.tsx` 新增共用 `DocTable`）、px + 数字字重代替 Tailwind
> 类名、引用真实状态名/常量名、补边界行为段。涉及 Sign / Keyboard / Activation / Passphrase
> 四个面板 + `ConstraintsCard`。② Approve 无限额屏删除多余的独立 `Network` 字段（网络名已含在
> `Token` 行，如 `USDT (Ethereum)`）。

---

## 1. 这是什么

SafePal 硬件钱包（3 寸单色墨水屏，1-bit）的**高保真交互原型**。浏览器里渲染一个
400×600 的设备帧，内含完整的设备 UI：开机激活、首页、签名（7 种类型）、签名历史、
Passkey（FIDO2 外置验证器）、全套设置。所有数据均为 mock，无后端。

- **不是产品代码**：目标是把交互/排版规则定到可以照抄的程度，固件/App 团队按此实现。
- 同仓库还有一个 Design Lab（`src/app/lab/`，30+ 套设计语言探索），与主原型隔离，可忽略。

## 2. 技术栈与运行

| 项 | 值 |
|---|---|
| 框架 | React 18 + TypeScript + Vite 6 |
| 样式 | Tailwind CSS v4（含 `@theme` 定制）|
| 图标 | lucide-react（+ 少量自绘 1-bit SVG 币标）|
| 字体 | 本地打包 woff2：**Noto Sans**（全局 sans）、IBM Plex Mono/Sans、Hanken、Newsreader（仅 Lab 用）|

```bash
npm install
npm run dev          # 开发服 (加 -- --port 5177 --host 可指定)
npm run build:html   # 单文件离线 HTML → dist-single/index.html
```

## 3. 目录速览

```
unified/
├─ CONSTRAINTS.md            ★ 墨水屏硬约束（先读）
├─ DETAIL_LIST_SPEC.md       ★ 信息列表/详情页规范（字号/换行/分页算法）
├─ EDITORIAL_DESIGN_LANGUAGE.md  字体角色定义（serif=内容/sans=元数据/mono=机器值）
├─ LAB_EXPLORATION_METHOD.md     Design Lab 的方法论（可忽略）
├─ src/app/
│  ├─ App.tsx                页面路由（switch-case）+ 设备帧挂载 + 浮动工具接线
│  ├─ config/pageIds.ts      页面/子页编号（#1~#23，对应屏幕角标）
│  ├─ components/            全部设备屏幕（一屏≈一个文件）
│  └─ lab/                   Design Lab（隔离，可忽略）
└─ src/styles/               fonts.css / theme.css / tailwind / eink
```

## 4. 核心架构

### 4.1 路由
`App.tsx` 顶部 `type Page` 联合类型 + `renderPage()` switch。新增页面三步：
加 Page 类型 → 加 case → 在 `DebugPanel.tsx` 的 `pageGroups`/`pageLabels` 注册
（再到 `pageIds.ts` 给编号）。无 router 库。

### 4.2 设备帧
所有屏幕统一 `w-[400px] h-[600px] bg-[#838383] flex flex-col`，挂在 `DeviceFrame` 内。
40% 缩放 ≈ 真实 3 寸物理尺寸。

### 4.3 签名（最核心）
- `SignRequestPage.tsx`：7 种签名类型（transfer / verifyCode / approve / approveLimit /
  message / blind / contractCall=Swap），**生产布局是 Variant E**（A-D 为历史遗留死代码）。
- 流程：主屏摘要 → Confirm → **必经二次验证**（已录指纹→`FingerprintVerifyPage`；
  未录→PIN 键盘）→ Signing → Success。首次 PIN 成功后弹"启用指纹"推荐。
- 主屏右下 `Full Details →` 进详情页。

### 4.4 DetailListView（复用组件，重点理解）
`components/DetailListView.tsx` — 所有"信息列表/详情"类页面的统一实现：
- `fields: { label, value, flow? }[]`，细标签(18px/300)在上、普通值(20-24px/400)在下；
- 超一屏**按字段整页翻页**（字段永不切断），页码在标题栏右上、底部 Prev/Next；
- `flow: true` 的长文本字段（完整 message / raw calldata）接排在末页剩余空间、整屏续翻；
- 导出 `PreciseAmount`（金额全精度整段显示）与 `BoldEndsAddress`（地址首尾 6 位加粗）。

使用方：签名详情（Transfer/Approve/Swap）、历史详情（Transfer/Approve/SignMessage/
Swap/Blind）、Firmware Info。**新的列表类界面请直接用它**，规则细节见 `DETAIL_LIST_SPEC.md`。

### 4.5 签名历史
`SignatureHistoryPage.tsx`：5 种卡片（transfer/approve/sign/swap/blind）+ 各自详情页
（`*DetailPage.tsx`）。详情字段 = **签名时字段集 + Time 领头 + 广播 Hash 收尾**。
列表金额缩写（123.46K），详情全精度。被拒签名不入列表（无 Status 概念）。
币标：主流币裸符号（₿/◆/独角兽）、稳定币圆环+符号（₮/$）、未知币首字母圆章，全部
`currentColor` 随按压反色。

### 4.6 Passkey（FIDO2 外置验证器）
`PasskeyPage.tsx`（#23）：凭据列表/详情/删除 + 注册/登录两种"来访请求"流程
（演示按钮模拟 BLE/NFC 来的请求）→ 复用 FingerprintVerifyPage 做 UV → 成功页。

## 5. 设计规则（违反 = bug）

1. **1-bit 双色**：只有 `#838383` 底 + 纯黑。禁 opacity / shadow / 灰阶 / emoji。
2. **≥18px**：设备屏内所有文字最小 18px（含标签）。放不下→翻页或减字段，不缩字号。
3. **金额/地址永不截断**：金额全精度不四舍五入不分组；地址 break-all 全显，首尾加粗辅助核对。
4. **层次靠字号不靠字重**：标签 18 细体 leading-none，值 20-24 普通体；间距三级
   （标签↔值 4px ＜ 字段↔字段 ~10px ＜ 分区↔分区 ~28px，分区用 2px 黑线分隔）。
5. **无法币**：任何签名相关界面不显示法币估值。
6. **术语**：手续费一律 **Network Fee**（不写 Gas Fee）；Gas Limit 保留原名。
7. **墨水屏交互**：无动画依赖（按压瞬时反色）；禁用小按钮用 `disabled:invisible` 保位；
   无滚动条——一切超屏内容用整页翻页。
8. **页眉统一**：`h-[45px] px-5 border-b-2 flex-shrink-0` + 标题 `text-lg font-bold
   uppercase tracking-wide` + 返回箭头 w-5/gap-2（`flex-shrink-0` 必带，否则被压扁）。

## 6. 原型专用设施（实机不存在，别实现）

- `DebugPanel`（右下角虫子按钮）：页面导航 / 状态栏控制 / zoom。
- `SignTypeSwitcher` / `VariantSwitcher` / `SecondFactorToggle`：签名页右下浮动开关。
- `PageDebugId`：屏角 #N 编号角标（对应 `pageIds.ts`）。
- 右侧白色文档面板（`FeatureDocsPanel` 外壳 + 共用 `Section`/`Rule`/`DocTable`/`ConstraintsCard`）：
  `SignDetailDocsPanel`（签名+历史规格速查，"标准/宽×2"开关，宽模式 `columns-2` 并排 8 张元素表）、
  `KeyboardDocsPanel`、`ActivationDocsPanel`（步骤表 + 当前步高亮）、`PassphraseDocsPanel`。
  写说明的标准：**数值必对码、规格用表格、px+数字字重不用类名、引用真实标识符、补边界行为**。
- 各页 mock 数据就写在各组件文件顶部（如 SignRequestPage 的 mock* 常量、
  SignatureHistoryPage 的 records）。压测样例（18 位小数、900 字符 calldata、53 字符
  method 名）是故意的，**改样式后请保留这些极端值来验证**。

## 7. 已知边界 / 注意事项

- Variant A-D、`SignTestPage`（签名功能测试）、Design Lab 为历史/实验代码，不影响主流程。
- message/blind 签名主屏的长内容是**屏内翻页**（无独立详情页）——这是有意决策。
- mock 定时器（蓝牙配对、固件升级进度）在无头浏览器里可能被节流，真浏览器正常。
- 单文件导出 `npm run build:html` 后产物在 `dist-single/index.html`，双击即用（字体已内联）。

## 8. 给 AI 的提示词建议

> 「这是一个 e-ink 硬件钱包的 React 原型。先读 unified/HANDOFF.md、CONSTRAINTS.md、
> DETAIL_LIST_SPEC.md。所有设备屏幕必须遵守 1-bit 双色、≥18px、金额地址永不截断、
> 按字段整页翻页这几条铁律。新列表类界面用 DetailListView 组件。改动后用
> npm run dev 起服务，在浏览器里逐屏验证无溢出、无 <18px 文字。」
