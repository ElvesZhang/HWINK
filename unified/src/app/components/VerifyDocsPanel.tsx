import { ShieldCheck } from 'lucide-react';
import { FeatureDocsPanel, Section, Rule, pillClass } from './FeatureDocsPanel';

/**
 * Verify Recovery docs panel. Sits to the right of the device frame whenever the
 * Verify page is active. Its one control is a manual outcome switch so a reviewer
 * can preview BOTH end-states (the mock always "passes", so the failure screen is
 * otherwise unreachable). Lives outside the device frame per the project's rule
 * that debug/preview controls never sit on the device screen itself.
 */
export function VerifyDocsPanel({
  outcome,
  onOutcomeChange,
  passphraseOutcome,
  onPassphraseOutcomeChange,
}: {
  outcome: 'success' | 'fail';
  onOutcomeChange: (o: 'success' | 'fail') => void;
  passphraseOutcome: 'pass' | 'fail';
  onPassphraseOutcomeChange: (o: 'pass' | 'fail') => void;
}) {
  return (
    <FeatureDocsPanel
      icon={ShieldCheck}
      title="Verify Recovery"
      sourceFile="VerifyRecoveryPageNew.tsx"
      controls={
        <>
          <button onClick={() => onOutcomeChange('success')} className={pillClass(outcome === 'success')}>✓ Success</button>
          <button onClick={() => onOutcomeChange('fail')} className={pillClass(outcome === 'fail')}>✕ Fail</button>
          {outcome === 'fail' && (
            <>
              <span className="text-[11px] text-gray-400 self-center mx-1">passphrase→</span>
              <button onClick={() => onPassphraseOutcomeChange('pass')} className={pillClass(passphraseOutcome === 'pass')}>✓ PP Pass</button>
              <button onClick={() => onPassphraseOutcomeChange('fail')} className={pillClass(passphraseOutcome === 'fail')}>✕ PP Fail</button>
            </>
          )}
        </>
      }
    >
      <Section title="结果结尾（手动切换）">
        <Rule label="outcome">走完输入到结果屏时，按上方开关显示成功 / 失败；停在结果屏也能来回切。</Rule>
        <Rule label="fail → 询问">失败时不直接报错，先问 “Recovery phrase doesn’t match — 是否用了 passphrase？”：<strong>No</strong> → 报错结束；<strong>Yes</strong> → 进 passphrase 输入屏。</Rule>
        <Rule label="passphrase 结果">在 fail 分支下，用上方 <code className="font-mono text-[11px]">PP Pass / PP Fail</code> 决定输入 passphrase 后的结果：Pass → “验证成功（含 passphrase）”；Fail → 报错结束。</Rule>
        <Rule label="note">真机无法“校验”passphrase（任何值都导出一个有效钱包），这一步实为“加上 passphrase 后重新比对钱包是否匹配”；此处只手动预览各结尾。</Rule>
      </Section>
    </FeatureDocsPanel>
  );
}
