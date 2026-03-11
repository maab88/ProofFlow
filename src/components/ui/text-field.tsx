import { Input, type InputProps } from '@/components/ui/input';

export type TextFieldProps = InputProps;

export function TextField(props: TextFieldProps) {
  return <Input {...props} />;
}
