import { Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { GhostButton } from '@/components/ui/ghost-button';

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Card className="items-center gap-4 px-6 py-8">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-surface-raised">
        <View className="h-3 w-3 rounded-full bg-primary" />
      </View>
      <View className="gap-2">
        <Text className="text-center text-xl font-semibold text-text-primary">{title}</Text>
        <Text className="text-center text-sm leading-6 text-text-muted">{description}</Text>
      </View>
      {actionLabel ? <GhostButton label={actionLabel} onPress={onAction} /> : null}
    </Card>
  );
}
