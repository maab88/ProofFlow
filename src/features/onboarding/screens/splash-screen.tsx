import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAppStore } from '@/store/app-store';

const proofMoments = ['Before photos', 'Voice summary', 'After photos', 'Invoice send'];

export function SplashScreen() {
  const completeSplash = useAppStore((state) => state.completeSplash);

  const continueTo = (path: '/sign-in' | '/dashboard') => {
    completeSplash();
    router.replace(path);
  };

  return (
    <Screen>
      <View className="flex-1 justify-between py-4">
        <View className="gap-6">
          <StatusBadge label="ProofFlow" tone="info" />
          <View className="gap-4">
            <Text className="text-5xl font-semibold leading-[56px] text-text">
              Finish the job, prove the work, ask to get paid.
            </Text>
            <Text className="text-base leading-7 text-muted">
              A focused, premium mobile shell for solo trades closing out work cleanly in the field.
            </Text>
          </View>
        </View>

        <Card className="gap-5">
          <Text className="text-sm font-semibold uppercase tracking-[1.8px] text-accent">
            Narrow by design
          </Text>
          <View className="gap-3">
            {proofMoments.map((item, index) => (
              <View className="flex-row items-center gap-3" key={item}>
                <View className="h-8 w-8 items-center justify-center rounded-full bg-surface-elevated">
                  <Text className="text-sm font-semibold text-text">{index + 1}</Text>
                </View>
                <Text className="flex-1 text-sm text-muted">{item}</Text>
              </View>
            ))}
          </View>
          <Text className="text-sm leading-6 text-muted">
            No dispatch board, no back-office suite, no extra noise. Just the closeout path that matters after the work is done.
          </Text>
        </Card>

        <View className="gap-3">
          <Button label="Continue to sign in" onPress={() => continueTo('/sign-in')} />
          <Button label="Preview app shell" onPress={() => continueTo('/dashboard')} variant="secondary" />
        </View>
      </View>
    </Screen>
  );
}
