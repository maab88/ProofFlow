import { Pressable, Text, View } from 'react-native';

import type { Customer } from '@/lib/domain/models';

export function CustomerChoice({ customer, selected, onPress }: { customer: Customer; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      className={[
        'rounded-button border px-4 py-3',
        selected ? 'border-primary bg-primary/10' : 'border-border bg-surface-raised',
      ].join(' ')}
      onPress={onPress}
    >
      <View className="gap-1">
        <Text className="text-sm font-semibold text-text-primary">{customer.displayName}</Text>
        <Text className="text-sm text-text-muted">{customer.email ?? customer.phone ?? 'No contact details yet'}</Text>
      </View>
    </Pressable>
  );
}
