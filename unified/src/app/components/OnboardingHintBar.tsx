/**
 * Reusable bottom strip used across the activation/onboarding flow.
 *
 * In the Figma design, the bottom 100px of every device screen is a single
 * "status strip" with two variants:
 *   - mode='hint':   onboarding screens show a centred prompt (default "Tap
 *                    to continue") and nothing else. Clean, brand-forward.
 *   - mode='status': operational screens show device name + battery + radio
 *                    icons. We don't use this variant in activation, but
 *                    expose it for future reuse on settings-flow pages that
 *                    want the bottom-bar layout rather than our current
 *                    top-bar StatusBar.tsx.
 *
 * Keeping the strip in its own component (rather than inlining `<div className="h-20 …">`
 * in every activation screen) gives us a single place to evolve the chrome
 * later and a single anchor for the "this is the same strip" mental model.
 */
interface OnboardingHintBarProps {
  /** Visible affordance text. Defaults to "Tap to continue". */
  hint?: string;
  /** Future expansion slot for the 'status' variant. Unused today. */
  mode?: 'hint';
}

export function OnboardingHintBar({ hint = 'Tap to continue' }: OnboardingHintBarProps) {
  return (
    <div className="h-20 flex items-center justify-center">
      <span className="text-base text-black">{hint}</span>
    </div>
  );
}
