import { ActivityIndicator, Text } from 'react-native';

import { Card } from '@/components/ui/card';

export type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = 'Loading' }: LoadingStateProps) {
  return (
    <Card className="items-center gap-4 px-6 py-8">
      <ActivityIndicator color="#4da3ff" size="large" />
      <Text className="text-center text-sm leading-6 text-text-muted">{label}</Text>
    </Card>
  );
}
