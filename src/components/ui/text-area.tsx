import type { TextInputProps } from 'react-native';

import { FieldShell, InputBase } from '@/components/ui/input-base';

export type TextAreaProps = TextInputProps & {
  label?: string;
  hint?: string;
  error?: string;
};

export function TextArea({ label, hint, error, ...props }: TextAreaProps) {
  return (
    <FieldShell error={error} hint={hint} label={label}>
      <InputBase hasError={Boolean(error)} multiline numberOfLines={5} {...props} />
    </FieldShell>
  );
}
