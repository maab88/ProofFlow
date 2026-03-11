import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { GhostButton } from '@/components/ui/ghost-button';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Screen } from '@/components/ui/screen';
import { StatusBadge } from '@/components/ui/status-badge';

export function ConnectPaymentsLaterScreen() {
  return (
    <Screen>
      <View className="flex-1 justify-between py-4">
        <View className="gap-6">
          <StatusBadge label="Optional step" tone="info" />
          <View className="gap-4">
            <Text className="text-4xl font-semibold leading-[44px] text-text-primary">You can connect payments later.</Text>
            <Text className="text-base leading-7 text-text-secondary">
              The MVP is ready to handle proof capture, summaries, invoices, and payment requests without turning payment setup into a blocker today.
            </Text>
          </View>
        </View>

        <View className="rounded-card border border-border bg-surface px-5 py-5">
          <Text className="text-base font-semibold text-text-primary">What's saved</Text>
          <Text className="mt-3 text-sm leading-6 text-text-secondary">
            Your account and business defaults are ready. Move into the dashboard now and return to payment setup later when it matters.
          </Text>
        </View>

        <View className="gap-3">
          <PrimaryButton label="Open dashboard" onPress={() => router.replace('/dashboard')} />
          <GhostButton label="Review settings first" onPress={() => router.replace('/settings')} />
        </View>
      </View>
    </Screen>
  );
}
