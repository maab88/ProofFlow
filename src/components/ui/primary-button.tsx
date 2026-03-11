import { ButtonBase, type ButtonBaseProps } from '@/components/ui/button-base';

export type PrimaryButtonProps = Omit<ButtonBaseProps, 'tone'>;

export function PrimaryButton(props: PrimaryButtonProps) {
  return <ButtonBase {...props} tone="primary" />;
}
