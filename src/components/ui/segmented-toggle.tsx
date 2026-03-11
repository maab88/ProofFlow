import { Pressable, Text, View } from 'react-native';

type SegmentedOption<T extends string> = {
  label: string;
  value: T;
};

type SegmentedToggleProps<T extends string> = {
  options: readonly SegmentedOption<T>[];
  value: T;
  onValueChange?: (value: T) => void;
};

export function SegmentedToggle<T extends string>({ options, value, onValueChange }: SegmentedToggleProps<T>) {
  return (
    <View accessibilityRole="tablist" className="min-h-touch flex-row rounded-button border border-border bg-surface p-1">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            className={[
              'min-h-touch flex-1 items-center justify-center rounded-[16px] px-4',
              selected ? 'bg-surface-raised' : 'bg-transparent',
            ].join(' ')}
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
