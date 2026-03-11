import type { ReactNode } from 'react';
import type { TextInputProps } from 'react-native';

import { Text, TextInput, View } from 'react-native';

type FieldShellProps = {
  label?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
};

export function FieldShell({ label, hint, error, children }: FieldShellProps) {
  return (
    <View className="gap-2">
      {label ? <Text className="text-sm font-medium text-text-secondary">{label}</Text> : null}
      {children}
      {error ? <Text className="text-sm leading-5 text-danger">{error}</Text> : null}
      {!error && hint ? <Text className="text-sm leading-5 text-text-muted">{hint}</Text> : null}
    </View>
  );
}

type InputBaseProps = TextInputProps & {
  multiline?: boolean;
  hasError?: boolean;
};

export function InputBase({ multiline = false, hasError = false, ...props }: InputBaseProps) {
  return (
    <TextInput
      className={[
        'min-h-control rounded-button border bg-surface-raised px-4 text-base text-text-primary',
        multiline ? 'py-4' : '',
        hasError ? 'border-danger' : 'border-border',
      ].join(' ')}
      multiline={multiline}
      placeholderTextColor="#8ea2ba"
      selectionColor="#4da3ff"
      textAlignVertical={multiline ? 'top' : 'center'}
      {...props}
    />
  );
}
