import { ActivityIndicator, Text, View } from 'react-native';

import { Screen } from '@/components/ui/screen';

type FullScreenLoaderProps = {
  title?: string;
  description?: string;
};

export function FullScreenLoader({
  title = 'Preparing the workspace',
  description = 'Loading the next screen with calm defaults and polished spacing.',
}: FullScreenLoaderProps) {
  return (
    <Screen>
      <View className="flex-1 items-center justify-center gap-5 px-8">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-surface-raised">
          <ActivityIndicator color="#4da3ff" size="large" />
        </View>
        <View className="gap-2">
          <Text className="text-center text-xl font-semibold text-text-primary">{title}</Text>
          <Text className="text-center text-sm leading-6 text-text-muted">{description}</Text>
        </View>
      </View>
    </Screen>
  );
}
