import type { ReactNode } from 'react';

import { Text, View } from 'react-native';

import { Card } from '@/components/ui/card';

type AuthFormShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  footer?: ReactNode;
  children: ReactNode;
};

export function AuthFormShell({ eyebrow, title, description, footer, children }: AuthFormShellProps) {
  return (
    <View className="flex-1 gap-8 py-4">
      <View className="gap-3">
        <Text className="text-xs font-semibold uppercase tracking-[2px] text-primary">{eyebrow}</Text>
        <Text className="text-[30px] font-semibold leading-10 text-text-primary">{title}</Text>
        <Text className="text-sm leading-6 text-text-secondary">{description}</Text>
      </View>

      <Card className="gap-5">{children}</Card>

      {footer ? footer : null}
    </View>
  );
}
