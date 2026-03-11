import type { PropsWithChildren } from 'react';

import { View } from 'react-native';

type CardProps = PropsWithChildren<{
  className?: string;
}>;

export function Card({ children, className }: CardProps) {
  return (
    <View className={['rounded-card border border-border bg-surface px-5 py-5 shadow-raised', className ?? ''].join(' ')}>
      {children}
    </View>
  );
}
