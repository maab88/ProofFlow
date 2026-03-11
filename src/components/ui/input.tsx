import type { TextInputProps } from 'react-native';

import { FieldShell, InputBase } from '@/components/ui/input-base';

export type InputProps = TextInputProps & {
  label?: string;
  hint?: string;
  error?: string;
};

export function Input({ label, hint, error, ...props }: InputProps) {
  return (
    <FieldShell error={error} hint={hint} label={label}>
      <InputBase hasError={Boolean(error)} {...props} />
    </FieldShell>
  );
}
