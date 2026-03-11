import { ButtonBase } from '@/components/ui/button-base';

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = true,
}: ButtonProps) {
  return (
    <ButtonBase
      disabled={disabled}
      fullWidth={fullWidth}
      label={label}
      loading={loading}
      onPress={onPress}
      tone={variant}
    />
  );
}
