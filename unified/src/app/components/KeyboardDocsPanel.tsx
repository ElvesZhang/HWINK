import { Keyboard } from 'lucide-react';
import type { KeyboardVariant } from './KeyboardShowcasePage';
import { FeatureDocsPanel, Section, Rule, ConstraintsCard, DocTable, pillClass } from './FeatureDocsPanel';

interface KeyboardDocsPanelProps {
  variant: KeyboardVariant;
  onVariantChange: (v: KeyboardVariant) => void;
  pinRandomized: boolean;
  pinMaxLength: number;
  onPinRandomizedChange: (v: boolean) => void;
  onPinMaxLengthChange: (v: number) => void;
  bip39Prefix: string;
  onBip39PrefixSet: (prefix: string) => void;
}

const VARIANT_LABELS: Record<KeyboardVariant, string> = {
  pin: 'PIN',
  text: 'Text',
  bip39: 'BIP39',
};

const BIP39_DEMO_PREFIXES = [
  { prefix: '', label: '(empty)', hint: 'all letters enabled' },
  { prefix: 'a', label: 'a', hint: 'wide funnel — most letters still valid' },
  { prefix: 'ab', label: 'ab', hint: 'narrows to a / s / u' },
  { prefix: 'abo', label: 'abo', hint: 'only ’u’ continues → suggestion: about' },
  { prefix: 'abou', label: 'abou', hint: 'only ’t’ continues → about almost complete' },
  { prefix: 'act', label: 'act', hint: 'forks to (end) / i / o / r → action/actor/actual' },
  { prefix: 'q', label: 'q', hint: 'no matches → every letter dashed' },
];

export function KeyboardDocsPanel({
  variant,
  onVariantChange,
  pinRandomized,
  pinMaxLength,
  onPinRandomizedChange,
  onPinMaxLengthChange,
  bip39Prefix,
  onBip39PrefixSet,
}: KeyboardDocsPanelProps) {
  const title =
    variant === 'pin' ? 'PIN Keypad' : variant === 'bip39' ? 'BIP39 Keyboard' : 'Text Keyboard';
  const sourceFile = variant === 'pin' ? 'PINKeypad.tsx' : 'UniversalKeyboard.tsx';

  return (
    <FeatureDocsPanel
      icon={Keyboard}
      title={title}
      sourceFile={sourceFile}
      controls={(Object.keys(VARIANT_LABELS) as KeyboardVariant[]).map((v) => (
        <button key={v} onClick={() => onVariantChange(v)} className={pillClass(variant === v)}>
          {VARIANT_LABELS[v]}
        </button>
      ))}
    >
      {variant === 'pin' ? (
        <>
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-1.5">键与禁用规则</h4>
            <p className="text-[13px] text-gray-700 leading-relaxed mb-2">
              布局：3×3 数字 + 底排 <code className="font-mono text-[11px]">[← 退格] [0] [✓ 确认]</code>，无独立 Continue 按钮。
            </p>
            <DocTable
              headers={['键', '启用条件', '禁用时外观']}
              widths={['26%', '44%', '30%']}
              rows={[
                ['数字', '始终', '—'],
                ['← 退格', '有输入', '虚线边框，不可点'],
                [
                  '✓ 确认',
                  <><code className="font-mono text-[10px]">value.length === maxLength</code>（默认 6）</>,
                  '虚线边框；启用后黑底反白',
                ],
              ]}
            />
            <ul className="space-y-1.5 mt-2">
              <Rule label="按压反馈">瞬时反色，无缩放无过渡。</Rule>
              <Rule label="randomized">防肩窥模式：数字位置打乱（7-2-9 / 4-1-6 / 3-8-5 / 0），样式不变。</Rule>
              <Rule label="使用方">Passphrase、ChangePIN、ResetDevice 的全部 PIN 入口。</Rule>
            </ul>
          </div>

          <Section title="Live controls">
            <li>
              <button
                onClick={() => onPinRandomizedChange(!pinRandomized)}
                className={`text-xs px-2 py-1 rounded border mr-2 ${
                  pinRandomized
                    ? 'bg-gray-800 text-white border-gray-800'
                    : 'bg-white text-gray-700 border-gray-400 hover:bg-gray-50'
                }`}
              >
                randomized: {pinRandomized ? 'on' : 'off'}
              </button>
              <button
                onClick={() => onPinMaxLengthChange(pinMaxLength === 6 ? 4 : 6)}
                className="text-xs px-2 py-1 bg-white border border-gray-400 rounded text-gray-700 hover:bg-gray-50"
              >
                maxLength: {pinMaxLength}
              </button>
            </li>
          </Section>
        </>
      ) : (
        <>
          {variant === 'text' ? (
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-1.5">大小写状态机（text 模式）</h4>
              <DocTable
                headers={['当前状态', '事件', '结果']}
                widths={['30%', '24%', '46%']}
                rows={[
                  ['初始', '进入', <>大写 + <code className="font-mono text-[10px]">autoCap=true</code></>],
                  [<code className="font-mono text-[10px]">autoCap=true</code>, '输入字母', '该字母大写，随即回小写，清 autoCap'],
                  ['小写', '键空格', <>切大写 + <code className="font-mono text-[10px]">autoCap=true</code></>],
                  ['任意', '手动 ↑', <>切换大小写，<code className="font-mono text-[10px]">autoCap=false</code>（不再自动回落）</>],
                ]}
              />
            </div>
          ) : (
            <Section title="大小写（BIP39 模式）">
              <Rule label="恒小写">
                BIP39 默认 <code className="font-mono text-[11px]">lowercase</code> + <code className="font-mono text-[11px]">autoCap=false</code>——BIP39 词表全为小写，无自动首字母大写。Shift 仍可手动切大写并保持。
              </Rule>
            </Section>
          )}

          <Section title="禁用规则">
            <Rule label="✓ / ←">
              value 为空时禁用：<strong>虚线边框</strong>、锁死 hover/active；有内容时 ✓ 黑底反白，点击触发 <code className="font-mono text-[11px]">onConfirm()</code>。
            </Rule>
            <Rule label="不合法字母">
              BIP39 模式按"合法下一字符集"过滤：不在其中的字母键<strong>保留实线边框但字符隐去（空槽）</strong>——键位不动、不可点。
            </Rule>
            <Rule label="123 / ABC">
              字母 ↔ 数字互切；BIP39 模式下同样<strong>空槽化</strong>（实线无字符，不可点）。<code className="font-mono text-[11px]">#+=</code> 仅数字模式出现，切换扩展符号集。
            </Rule>
            {variant === 'bip39' && (
              <Rule label="建议词">
                输入有前缀时，键盘上方显示最多 3 个匹配词；点击 = 一步替换 + 提交。
              </Rule>
            )}
            <Rule label="按压反馈">所有按键 active <strong>瞬时反色</strong>，无缩放无过渡。</Rule>
          </Section>

          {variant === 'bip39' && (
            <Section title="Try a prefix">
              <li className="text-[12px] text-gray-600 leading-relaxed mb-2">
                Inject a prefix to immediately see disabled letters + suggestion buttons. Current pool: 21
                words starting with <code className="font-mono text-[11px]">a–</code>.
              </li>
              <li className="flex flex-wrap gap-1.5">
                {BIP39_DEMO_PREFIXES.map(({ prefix, label, hint }) => {
                  const active = bip39Prefix === prefix;
                  return (
                    <button
                      key={label}
                      onClick={() => onBip39PrefixSet(prefix)}
                      title={hint}
                      className={`font-mono text-[11px] px-2 py-1 rounded border ${
                        active
                          ? 'bg-gray-800 text-white border-gray-800'
                          : 'bg-white text-gray-700 border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </li>
              {bip39Prefix && (
                <li className="text-[12px] text-gray-600 leading-relaxed mt-2 italic">
                  {BIP39_DEMO_PREFIXES.find((p) => p.prefix === bip39Prefix)?.hint}
                </li>
              )}
            </Section>
          )}
        </>
      )}

      <ConstraintsCard />
    </FeatureDocsPanel>
  );
}
