import { Power } from 'lucide-react';
import type { ActivationStep } from './ActivationPage';
import { FeatureDocsPanel, Section, Rule, ConstraintsCard, pillClass } from './FeatureDocsPanel';

interface ActivationDocsPanelProps {
  firstBoot: boolean;
  onFirstBootChange: (v: boolean) => void;
  /** Optional: current step inside the activation flow, surfaced from the page. */
  currentStep?: ActivationStep;
}

/**
 * Docs panel for the device activation flow.
 *
 * Renders to the right of the device frame whenever the Activation page is
 * the current page, using the shared FeatureDocsPanel shell so chrome and
 * typography stay aligned with KeyboardDocsPanel and PassphraseDocsPanel.
 *
 * The firstBoot toggle simulates a freshly-shipped device vs. an already
 * activated one — when on, App.tsx intercepts navigation and forces the
 * Activation page; when off, Activation is reachable only via DebugPanel
 * (Debug Tools group).
 *
 * Structure follows the sign-panel standard: common patterns are stated ONCE,
 * then the 16 steps collapse into a single table (one row per step) rather
 * than a paragraph of implementation diary per step. The matching step is
 * highlighted while the user walks the flow.
 */

/** One row per ActivationStep, in time order. */
const STEPS: { step: ActivationStep; screen: string; advance: string; figma: string }[] = [
  { step: 'splash', screen: 'Logo + 标语', advance: '整屏点 → welcome-1', figma: '—' },
  { step: 'welcome-1', screen: '欢迎第一段', advance: '整屏点', figma: '—' },
  { step: 'welcome-2', screen: '累加第二段（第一段保留原位）', advance: '整屏点', figma: '327:3126' },
  { step: 'scan-to-connect', screen: '配对 QR（原型用占位图标；底部 skip 为原型独有，真机靠配对成功跳转）', advance: '整屏点', figma: '327:3228' },
  { step: 'choose-path', screen: 'Set up / Restore 两选项（Restore 待接入）', advance: '点选项', figma: '—' },
  { step: 'create-intro', screen: '生成助记词说明', advance: '整屏点', figma: '327:4432' },
  { step: 'create-length', screen: '12 / 24 词二选一', advance: '点按钮', figma: '327:4520' },
  { step: 'create-display', screen: '助记词 6 词/页（12 词=2 页，24=4 页）', advance: 'Next 翻页，末页进验证', figma: '327:4480' },
  { step: 'create-verify-intro', screen: '开始确认 / 再看一遍', advance: '点按钮', figma: '327:4531' },
  { step: 'create-verify', screen: '逐词 4 选 1；错 → 反馈槽提示，位置不动', advance: '全对 → create-done', figma: '327:4540' },
  { step: 'create-done', screen: '✓ Wallet created', advance: '整屏点 → naming', figma: '327:4451' },
  { step: 'naming', screen: '钱包命名，≤20 字，空名 ✓ 禁用', advance: '键盘 ✓', figma: '327:2858' },
  { step: 'pin-explain', screen: 'PIN 说明', advance: '整屏点', figma: '327:3158' },
  { step: 'pin-set', screen: '6 位 PIN（非 randomized）', advance: '键盘 ✓ → pin-confirm', figma: '327:4576' },
  { step: 'pin-confirm', screen: '重输一遍；不匹配 → 固定槽报错重输', advance: '匹配 → done', figma: '—' },
  { step: 'done', screen: '完成屏', advance: '→ Home，更新钱包名', figma: '—' },
];

export function ActivationDocsPanel({
  firstBoot,
  onFirstBootChange,
  currentStep,
}: ActivationDocsPanelProps) {
  return (
    <FeatureDocsPanel
      icon={Power}
      title="Activation Flow"
      sourceFile="ActivationPage.tsx"
      controls={
        <>
          <button onClick={() => onFirstBootChange(false)} className={pillClass(!firstBoot)}>
            Activated
          </button>
          <button onClick={() => onFirstBootChange(true)} className={pillClass(firstBoot)}>
            First Boot
          </button>
        </>
      }
    >
      <Section title="共性模式（先读，下表不再重复）">
        <Rule label="整屏即按钮">
          凡"Tap to continue"屏，除返回箭头外<strong>整屏可点</strong>；底部 80px Tap 条只是 affordance 提示（无上边框）。
        </Rule>
        <Rule label="三区布局">
          上/中/下各 1/3（或上 2/3 + 下 1/3），内容各居其位；<strong>揭示新段落不挤压已有内容</strong>（累加式）。
        </Rule>
        <Rule label="错误反馈槽">
          固定高度预留（如 create-verify 24px、pin-confirm 28px），出错时填充、<strong>不挪动</strong>键盘/选项位置。
        </Rule>
        <Rule label="返回 / mock">
          顶部 ← 总是回上一步（splash/done 无箭头）；mock <strong>无真实配对/固件调用</strong>。
        </Rule>
        <Rule label="一套设计语言">
          激活不另起视觉系统——按钮/列表/输入/字号/间距与日常页面一致，差异仅"无 title bar + 可选整屏 Tap"两个开关。
        </Rule>
      </Section>

      <div>
        <h4 className="text-sm font-bold text-gray-900 mb-1.5">
          步骤表（<code className="font-mono text-[11px]">ActivationStep</code>，按时序）
        </h4>
        <table className="w-full border-collapse text-[11px] leading-snug mb-1">
          <thead>
            <tr className="text-left text-gray-400">
              <th className="font-semibold pb-1 pr-2 align-top w-[22%]">步骤</th>
              <th className="font-semibold pb-1 pr-2 align-top w-[40%]">屏幕内容</th>
              <th className="font-semibold pb-1 pr-2 align-top w-[24%]">前进</th>
              <th className="font-semibold pb-1 align-top w-[14%]">Figma</th>
            </tr>
          </thead>
          <tbody>
            {STEPS.map(({ step, screen, advance, figma }) => {
              const active = step === currentStep;
              return (
                <tr
                  key={step}
                  className={`border-t border-gray-200 align-top ${active ? 'bg-amber-100' : ''}`}
                >
                  <td className="py-1 pr-2 align-top">
                    <code className="font-mono text-[10px] text-gray-900">{step}</code>
                    {active && <em className="not-italic text-gray-900 font-bold"> ◄</em>}
                  </td>
                  <td className="py-1 pr-2 text-gray-700">{screen}</td>
                  <td className="py-1 pr-2 text-gray-700">{advance}</td>
                  <td className="py-1 text-gray-500 font-mono text-[10px]">{figma}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Section title="共享原子组件">
        <Rule label="WordCountSelector">12 / 24 二选一（两个等权 BTN_BASE）；ActivationRestore / VerifyRecoveryPageNew 共用。</Rule>
        <Rule label="MnemonicWordList">带 index 的助记词列表（create-display 用）。</Rule>
        <Rule label="MnemonicVerifyPicker">
          4 选 1；<code className="font-mono text-[11px]">pickOptionsForWord</code> 按 index 确定性选项（避免每次 render 抖动）。
        </Rule>
        <Rule label="OnboardingHintBar / PathRow">过渡屏底条 / 大选择屏 1/3 行；其余直接用现成产品模板。
        </Rule>
      </Section>

      <Section title="设计稿 → 原型 适配映射">
        <Rule label="尺寸">Figma 设备 520×747（内屏 480×640）→ 原型 400×600，等比 ~83%。</Rule>
        <Rule label="底色">
          Figma <code className="font-mono text-[11px]">#cac9d8</code> → 原型 <code className="font-mono text-[11px]">#838383</code>（贴近真机渲染）。
        </Rule>
        <Rule label="字色">
          Figma <code className="font-mono text-[11px]">#0d0b33</code>（深紫蓝，含 80% opacity 次要文字）→ 原型一律 <strong>black</strong>（墨水屏无灰阶）。
        </Rule>
        <Rule label="字体 / logo">
          Figma Alibaba Sans → 原型暂用系统字体待替换；splash logo 为 96×96 占位，待换 SafePal SVG mark。
        </Rule>
      </Section>

      <ConstraintsCard />
    </FeatureDocsPanel>
  );
}
