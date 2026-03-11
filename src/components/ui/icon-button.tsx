import type { ComponentProps } from 'react';

import { Ionicons } from '@expo/vector-icons';

import { ButtonBase } from '@/components/ui/button-base';

type IconButtonProps = {
  icon: ComponentProps<typeof Ionicons>['name'];
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel: string;
};

export function IconButton({ icon, onPress, disabled = false, accessibilityLabel }: IconButtonProps) {
  return (
    <ButtonBase
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      fullWidth={false}
      icon={<Ionicons color="#f3f7fc" name={icon} size={18} />}
      onPress={onPress}
      tone="icon"
    />
  );
}
