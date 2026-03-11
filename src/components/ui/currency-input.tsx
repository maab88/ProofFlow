import type { TextInputProps } from 'react-native';

import { Text, View } from 'react-native';

import { FieldShell, InputBase } from '@/components/ui/input-base';

type CurrencyInputProps = Omit<TextInputProps, 'onChangeText'> & {
  label?: string;
  hint?: string;
  error?: string;
  value: string;
  onChangeValue?: (value: string) => void;
};

export function CurrencyInput({
  label,
  hint,
  error,
  value,
  onChangeValue,
  ...props
}: CurrencyInputProps) {
  return (
    <FieldShell error={error} hint={hint} label={label}>
      <View className="relative w-full justify-center">
        <Text className="absolute left-4 z-10 text-base font-semibold text-text-primary">$</Text>
        <InputBase
          className="w-full pl-8 text-text-primary"
          hasError={Boolean(error)}
          keyboardType="decimal-pad"
          onChangeText={(next) => {
            const cleaned = next.replace(/[^0-9.]/g, '');
            const normalized = cleaned.replace(/(\..*)\./g, '$1');
            onChangeValue?.(normalized);
          }}
          value={value}
          {...props}
        />
      </View>
    </FieldShell>
  );
}
