import { Key } from 'lucide-react';
import { FeatureDocsPanel, Section, Rule, ConstraintsCard } from './FeatureDocsPanel';

/**
 * Docs panel for the Passphrase feature. Sits to the right of the device frame
 * whenever the Passphrase page is active. Uses the shared FeatureDocsPanel
 * shell so its chrome matches the keyboard docs panel exactly.
 *
 * No Inactive/Active toggle here — a hardware wallet cannot tell whether it's
 * currently running on a passphrase-derived account vs the original one (each
 * passphrase deterministically derives a different wallet, with no state
 * stored on the device). Every entry to the page starts the SET flow.
 */
export function PassphraseDocsPanel() {
  return (
    <FeatureDocsPanel
      icon={Key}
      title="Passphrase Flow"
      sourceFile="PassphrasePageNew.tsx"
    >
      <Section title="状态机（每次进入都是完整 SET 流程）">
        <Rule label="state">
          <code className="font-mono text-[11px]">info → pin → input → confirm → display-passphrase → saving → wallet-name → success</code>（状态名取自 <code className="font-mono text-[11px]">PassphrasePageNew.tsx</code> 的 <code className="font-mono text-[11px]">type Step</code>）。
        </Rule>
        <Rule label="confirm 不匹配">
          自动清空 confirm 输入、停在原地重输（保留首次输入）。
        </Rule>
      </Section>

      <Section title="核心规则（照着做）">
        <Rule label="无 Active 态">
          相同 mnemonic + 不同 passphrase = 不同确定性钱包，设备不存"当前用哪个 passphrase"。<strong>所以没有 Status / Test / Abandon</strong>——每次走完流程只是派生一个钱包并更新 StatusBar 名称。
        </Rule>
        <Rule label="精确匹配">
          区分大小写与空格；<code className="font-mono text-[11px]">display-passphrase</code> 用等宽字体逐字核对。无法找回——警示在 info 页讲清。
        </Rule>
        <Rule label="键盘/长度">
          <code className="font-mono text-[11px]">mode='text'</code>（任意字符，非 BIP39 词表），上限 50 字静默截停，无实时计数。
        </Rule>
        <Rule label="错误位置">
          报错显示在<strong>输入框下方</strong>——避免墨水屏整屏刷新时输入框被下推抖动。
        </Rule>
      </Section>

      <Section title="边界行为">
        <Rule label="空 passphrase">
          提交空 passphrase = <strong>派生回原始钱包</strong>（<code className="font-mono text-[11px]">passphrase.length === 0</code> 分支跳过命名，success 文案区分这种情况）——这是"切回主钱包"的唯一途径。
        </Rule>
        <Rule label="钱包名为空">
          ✓ 禁用，不可提交。
        </Rule>
      </Section>

      <Section title="完整规范">
        <Rule label="spec">
          字号/换行/翻页等跨界面规则见 <code className="font-mono text-[11px]">unified/DETAIL_LIST_SPEC.md</code>；本面板只列本流程要点。
        </Rule>
      </Section>

      <ConstraintsCard />
    </FeatureDocsPanel>
  );
}
