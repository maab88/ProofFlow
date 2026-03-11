import { Pressable, Text, View } from 'react-native';

type SegmentedOption<T extends string> = {
  label: string;
  value: T;
};

type SegmentedToggleProps<T extends string> = {
  options: readonly SegmentedOption<T>[];
  value: T;
  onValueChange?: (value: T) => void;
  disabled?: boolean;
};

export function SegmentedToggle<T extends string>({ options, value, onValueChange, disabled = false }: SegmentedToggleProps<T>) {
  return (
    <View accessibilityRole="tablist" className={["min-h-touch flex-row rounded-button border border-border bg-surface p-1", disabled ? 'opacity-60' : ''].join(' ')}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ disabled, selected }}
            className={[
              'min-h-touch flex-1 items-center justify-center rounded-[16px] px-4',
              selected ? 'bg-surface-raised' : 'bg-transparent',
            ].join(' ')}
            disabled={disabled}
            key={option.value}
            onPress={() => onValueChange?.(option.value)}
          >
            <Text className={['text-sm font-semibold', selected ? 'text-text-primary' : 'text-text-muted'].join(' ')}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
