import { ButtonBase, type ButtonBaseProps } from '@/components/ui/button-base';

export type GhostButtonProps = Omit<ButtonBaseProps, 'tone'>;

export function GhostButton(props: GhostButtonProps) {
  return <ButtonBase {...props} tone="ghost" />;
}
