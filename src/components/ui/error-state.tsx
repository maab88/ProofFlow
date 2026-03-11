import { Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { GhostButton } from '@/components/ui/ghost-button';

type ErrorStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function ErrorState({ title, description, actionLabel, onAction }: ErrorStateProps) {
  return (
    <Card className="items-center gap-4 px-6 py-8">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-danger/10">
        <View className="h-6 w-0.5 rounded-full bg-danger" />
      </View>
      <View className="gap-2">
        <Text className="text-center text-xl font-semibold text-text-primary">{title}</Text>
        <Text className="text-center text-sm leading-6 text-text-muted">{description}</Text>
      </View>
      {actionLabel ? <GhostButton label={actionLabel} onPress={onAction} /> : null}
    </Card>
  );
}
