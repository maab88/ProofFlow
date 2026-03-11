import type { ReactNode } from 'react';

import { Text, View } from 'react-native';

import { Card } from '@/components/ui/card';

export type ListRowProps = {
  title: string;
  subtitle?: string;
  value?: string;
  trailing?: ReactNode;
};

export function ListRow({ title, subtitle, value, trailing }: ListRowProps) {
  return (
    <Card className="gap-2 px-4 py-4">
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-1 gap-1">
          <Text className="text-base font-semibold text-text-primary">{title}</Text>
          {subtitle ? <Text className="text-sm leading-5 text-text-muted">{subtitle}</Text> : null}
        </View>
        {value ? <Text className="text-sm font-medium text-text-secondary">{value}</Text> : trailing}
      </View>
    </Card>
  );
}
