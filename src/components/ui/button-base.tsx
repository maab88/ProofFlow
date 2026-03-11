import type { ReactNode } from 'react';

import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { theme } from '@/theme/tokens';

export type ButtonTone = 'primary' | 'secondary' | 'ghost' | 'icon';

export type ButtonBaseProps = {
  label?: string;
  icon?: ReactNode;
  onPress?: () => void;
  tone?: ButtonTone;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  accessibilityLabel?: string;
};

const toneClasses: Record<ButtonTone, { container: string; text: string; spinner: string }> = {
  primary: {
    container: 'border border-primary/40 bg-primary',
    text: 'text-slate-950',
    spinner: theme.colors.background,
  },
  secondary: {
    container: 'border border-border-strong bg-surface-raised',
    text: 'text-text-primary',
    spinner: theme.colors.textPrimary,
  },
  ghost: {
    container: 'border border-border bg-transparent',
    text: 'text-text-secondary',
    spinner: theme.colors.textSecondary,
  },
  icon: {
    container: 'border border-border bg-surface',
    text: 'text-text-primary',
    spinner: theme.colors.textPrimary,
  },
};

export function ButtonBase({
  label,
  icon,
  onPress,
  tone = 'primary',
  disabled = false,
  loading = false,
  fullWidth = true,
  accessibilityLabel,
}: ButtonBaseProps) {
  const inactive = disabled || loading;
  const styles = toneClasses[tone];
  const isIconOnly = tone === 'icon' && !label;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      className={[
        'min-h-control items-center justify-center rounded-button px-5',
        fullWidth ? 'w-full' : '',
        isIconOnly ? 'min-w-touch px-0' : '',
        styles.container,
        inactive ? 'opacity-50' : 'active:opacity-90',
      ].join(' ')}
      disabled={inactive}
      hitSlop={4}
      onPress={onPress}
    >
      {loading ? (
        <ActivityIndicator color={styles.spinner} />
      ) : (
        <View className="flex-row items-center justify-center gap-2">
          {icon ? icon : null}
          {label ? <Text className={['text-base font-semibold tracking-[0.2px]', styles.text].join(' ')}>{label}</Text> : null}
        </View>
      )}
    </Pressable>
  );
}
