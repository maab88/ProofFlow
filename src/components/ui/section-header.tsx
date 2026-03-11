import type { ReactNode } from 'react';

import { Text, View } from 'react-native';

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  rightSlot?: ReactNode;
};

export function SectionHeader({ eyebrow, title, description, rightSlot }: SectionHeaderProps) {
  return (
    <View className="flex-row items-end justify-between gap-4">
      <View className="flex-1 gap-2">
        {eyebrow ? <Text className="text-xs font-semibold uppercase tracking-[2px] text-primary">{eyebrow}</Text> : null}
        <Text className="text-[28px] font-semibold leading-9 text-text-primary">{title}</Text>
        {description ? <Text className="text-sm leading-6 text-text-secondary">{description}</Text> : null}
      </View>
      {rightSlot}
    </View>
  );
}
