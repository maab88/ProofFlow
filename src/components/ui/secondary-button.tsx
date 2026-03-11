import { ButtonBase, type ButtonBaseProps } from '@/components/ui/button-base';

export type SecondaryButtonProps = Omit<ButtonBaseProps, 'tone'>;

export function SecondaryButton(props: SecondaryButtonProps) {
  return <ButtonBase {...props} tone="secondary" />;
}
