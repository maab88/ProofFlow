import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { GhostButton } from '@/components/ui/ghost-button';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Screen } from '@/components/ui/screen';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/features/auth/hooks/use-auth';

const workflowSteps = [
  'Capture before photos',
  'Record and review the work summary',
  'Capture after photos',
  'Preview and send the invoice',
];

function formatHourlyRate(value: number | null | undefined) {
  if (value == null) {
    return 'Hourly rate not set';
  }

  return `$${(value / 100).toFixed(2)}/hr`;
}

function formatTaxDefaults(label: string | null | undefined, rateBasisPoints: number | null | undefined) {
  if (!label && rateBasisPoints == null) {
    return 'Tax defaults not set';
  }

  if (!label) {
    return `${(rateBasisPoints! / 100).toFixed(2)}% tax`;
  }

  if (rateBasisPoints == null) {
    return `${label} not set`;
  }

  return `${label} ${(rateBasisPoints / 100).toFixed(2)}%`;
}

export function DashboardScreen() {
  const { appUser, business } = useAuth();

  return (
    <Screen scrollable>
      <View className="gap-6 py-4">
        <View className="gap-3">
          <StatusBadge label="Ready for closeout" tone="success" />
          <Text className="text-[30px] font-semibold leading-10 text-text-primary">
            {business?.displayName ? `${business.displayName} is ready to wrap up today's work.` : 'Your closeout workspace is ready.'}
          </Text>
          <Text className="text-sm leading-6 text-text-secondary">
            {appUser?.fullName
              ? `Welcome back, ${appUser.fullName}. Keep the last mile focused on proof, summary, invoice, and payment request.`
              : 'Keep the last mile focused on proof, summary, invoice, and payment request.'}
          </Text>
        </View>

        <View className="gap-4 rounded-card border border-border bg-surface px-5 py-5">
          <View className="gap-2">
            <Text className="text-sm font-semibold uppercase tracking-[1.5px] text-primary">Business defaults</Text>
            <Text className="text-2xl font-semibold text-text-primary">{formatHourlyRate(business?.defaultHourlyRateCents)}</Text>
            <Text className="text-sm leading-6 text-text-secondary">{formatTaxDefaults(business?.taxLabel, business?.taxRateBasisPoints)}</Text>
          </View>
          <PrimaryButton label="Open jobs" onPress={() => router.push('/jobs')} />
        </View>

        <View className="gap-4 rounded-card border border-border bg-surface px-5 py-5">
          <Text className="text-base font-semibold text-text-primary">Closeout flow</Text>
          <View className="gap-3">
            {workflowSteps.map((step, index) => (
              <View className="flex-row items-center gap-3" key={step}>
                <View className="h-9 w-9 items-center justify-center rounded-full bg-surface-raised">
                  <Text className="text-sm font-semibold text-text-primary">{index + 1}</Text>
                </View>
                <Text className="flex-1 text-sm leading-6 text-text-secondary">{step}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="gap-3">
          <GhostButton label="Open customers" onPress={() => router.push('/customers')} />
          <GhostButton label="Review settings" onPress={() => router.push('/settings')} />
        </View>
      </View>
    </Screen>
  );
}
