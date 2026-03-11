import { Link, Redirect, router } from 'expo-router';
import { Text, View } from 'react-native';

import { PrimaryButton } from '@/components/ui/primary-button';
import { SecondaryButton } from '@/components/ui/secondary-button';
import { Screen } from '@/components/ui/screen';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/features/auth/hooks/use-auth';

const proofMoments = ['Before photos', 'Voice summary', 'After photos', 'Invoice sent'];

export function SplashScreen() {
  const { status } = useAuth();

  if (status === 'ready') {
    return <Redirect href="/dashboard" />;
  }

  if (status === 'needs_onboarding') {
    return <Redirect href="/business-setup" />;
  }

  return (
    <Screen>
      <View className="flex-1 justify-between py-4">
        <View className="gap-6">
          <StatusBadge label="ProofFlow" tone="info" />
          <View className="gap-4">
            <Text className="text-5xl font-semibold leading-[56px] text-text-primary">
              Finish the job, prove the work, ask to get paid.
            </Text>
            <Text className="text-base leading-7 text-text-secondary">
              Built for solo trades who want the closeout path to feel fast, clear, and calmly professional.
            </Text>
          </View>
        </View>

        <View className="gap-4 rounded-card border border-border bg-surface px-5 py-5">
          {proofMoments.map((item, index) => (
            <View className="flex-row items-center gap-3" key={item}>
              <View className="h-8 w-8 items-center justify-center rounded-full bg-surface-raised">
                <Text className="text-sm font-semibold text-text-primary">{index + 1}</Text>
              </View>
              <Text className="flex-1 text-sm text-text-secondary">{item}</Text>
            </View>
          ))}
        </View>

        <View className="gap-3">
          <PrimaryButton label="Create account" onPress={() => router.push('/sign-up')} />
          <SecondaryButton label="Sign in" onPress={() => router.push('/sign-in')} />
          <Text className="text-center text-sm text-text-muted">
            Need to recover access?{' '}
            <Link href="/forgot-password" style={{ color: '#c3d2e4', fontWeight: '600' }}>
              Reset your password
            </Link>
          </Text>
        </View>
      </View>
    </Screen>
  );
}
