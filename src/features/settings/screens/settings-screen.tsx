import { Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { GhostButton } from '@/components/ui/ghost-button';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { AuthInlineMessage } from '@/features/auth/components/auth-inline-message';
import { useAuth } from '@/features/auth/hooks/use-auth';

function formatHourlyRate(value: number | null | undefined) {
  if (value == null) {
    return 'Not set';
  }

  return `$${(value / 100).toFixed(2)}/hr`;
}

function formatTaxDefaults(label: string | null | undefined, rateBasisPoints: number | null | undefined) {
  if (!label && rateBasisPoints == null) {
    return 'Not set';
  }

  if (!label) {
    return `${(rateBasisPoints! / 100).toFixed(2)}%`;
  }

  if (rateBasisPoints == null) {
    return label;
  }

  return `${label} ${(rateBasisPoints / 100).toFixed(2)}%`;
}

export function SettingsScreen() {
  const { appUser, business, signOut, status, errorMessage } = useAuth();

  return (
    <Screen scrollable>
      <View className="gap-6 py-4">
        <SectionHeader
          eyebrow="Settings"
          title="Account defaults, kept simple."
          description="This stays intentionally small: identity, business defaults, and a clean path out of the app."
        />

        {errorMessage ? <AuthInlineMessage message={errorMessage} /> : null}

        <Card className="gap-4">
          <View className="flex-row items-center justify-between gap-4">
            <Text className="text-sm text-text-muted">Signed in as</Text>
            <Text className="text-right text-sm font-medium text-text-primary">{appUser?.email ?? 'Unknown'}</Text>
          </View>
          <View className="flex-row items-center justify-between gap-4">
            <Text className="text-sm text-text-muted">Business</Text>
            <Text className="text-right text-sm font-medium text-text-primary">{business?.displayName ?? 'Not set'}</Text>
          </View>
        </Card>

        <Card className="gap-4">
          <Text className="text-base font-semibold text-text-primary">Business defaults</Text>
          <View className="flex-row items-center justify-between gap-4">
            <Text className="text-sm text-text-muted">Hourly rate</Text>
            <Text className="text-right text-sm font-medium text-text-primary">{formatHourlyRate(business?.defaultHourlyRateCents)}</Text>
          </View>
          <View className="flex-row items-center justify-between gap-4">
            <Text className="text-sm text-text-muted">Tax</Text>
            <Text className="text-right text-sm font-medium text-text-primary">{formatTaxDefaults(business?.taxLabel, business?.taxRateBasisPoints)}</Text>
          </View>
        </Card>

        <Card className="gap-3">
          <Text className="text-base font-semibold text-text-primary">Account state</Text>
          <View className="flex-row flex-wrap gap-3">
            <StatusBadge label={status === 'ready' ? 'Authenticated' : status} tone={status === 'ready' ? 'success' : 'warning'} />
            <StatusBadge label={business?.onboardingCompletedAt ? 'Onboarded' : 'Setup needed'} tone={business?.onboardingCompletedAt ? 'info' : 'warning'} />
          </View>
        </Card>

        <GhostButton label="Sign out" onPress={signOut} />
      </View>
    </Screen>
  );
}
