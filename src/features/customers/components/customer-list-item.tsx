import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import type { Customer } from '@/lib/domain/models';

function getSecondaryLine(customer: Customer) {
  return customer.email ?? customer.phone ?? customer.addressLine1 ?? 'No contact details yet';
}

export function CustomerListItem({ customer, onPress }: { customer: Customer; onPress: () => void }) {
  return (
    <Pressable
      className="rounded-card border border-border bg-surface px-5 py-4 active:opacity-90"
      onPress={onPress}
    >
      <View className="flex-row items-center gap-4">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-surface-raised">
          <Text className="text-base font-semibold text-text-primary">{customer.displayName.slice(0, 1).toUpperCase()}</Text>
        </View>
        <View className="flex-1 gap-1">
          <Text className="text-base font-semibold text-text-primary">{customer.displayName}</Text>
          <Text className="text-sm leading-5 text-text-muted">{getSecondaryLine(customer)}</Text>
        </View>
        <Ionicons color="#8ea2ba" name="chevron-forward" size={18} />
      </View>
    </Pressable>
  );
}
