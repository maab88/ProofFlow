import { Text, View } from 'react-native';

import type { BadgeTone } from '@/theme/tokens';

type StatusBadgeProps = {
  label: string;
  tone?: BadgeTone;
};

const tones: Record<BadgeTone, { container: string; text: string }> = {
  neutral: { container: 'bg-badge-neutral-bg', text: 'text-badge-neutral-text' },
  info: { container: 'bg-badge-info-bg', text: 'text-badge-info-text' },
  success: { container: 'bg-badge-success-bg', text: 'text-badge-success-text' },
  warning: { container: 'bg-badge-warning-bg', text: 'text-badge-warning-text' },
  danger: { container: 'bg-badge-danger-bg', text: 'text-badge-danger-text' },
};

export function StatusBadge({ label, tone = 'neutral' }: StatusBadgeProps) {
  const toneStyles = tones[tone];

  return (
    <View className={['rounded-full px-3 py-2', toneStyles.container].join(' ')}>
      <Text className={['text-xs font-semibold uppercase tracking-[1px]', toneStyles.text].join(' ')}>{label}</Text>
    </View>
  );
}
