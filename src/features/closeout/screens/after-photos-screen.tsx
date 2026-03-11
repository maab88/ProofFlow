import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { GhostButton } from '@/components/ui/ghost-button';
import { PrimaryButton } from '@/components/ui/primary-button';
import { CloseoutStepShell } from '@/features/closeout/components/closeout-step-shell';
import { useCloseoutJobId } from '@/features/closeout/hooks/use-closeout-job-id';
import { getCloseoutStepRoute } from '@/features/closeout/lib/closeout-routes';

export function AfterPhotosScreen() {
  const jobId = useCloseoutJobId();

  return (
    <CloseoutStepShell
      jobId={jobId}
      stepId="after-photos"
      primaryAction={<PrimaryButton label="Continue to Charges" onPress={() => jobId && router.push(getCloseoutStepRoute(jobId, 'charges'))} />}
      secondaryAction={<GhostButton label="Back" onPress={() => router.back()} />}
      footerNote="After photos will complete the proof set before charges and the invoice preview are reviewed."
    >
      <View className="gap-4">
        <EmptyState
          title="After photos come next"
          description="This step will collect the finished result right before charges and invoice prep. The shell keeps the handoff intentional even before camera wiring arrives."
        />
        <Card className="gap-3">
          <Text className="text-base font-semibold text-text-primary">What the user should expect</Text>
          <Text className="text-sm leading-6 text-text-secondary">Take the final proof shots, confirm they are usable, then continue straight into charges without losing momentum.</Text>
        </Card>
      </View>
    </CloseoutStepShell>
  );
}
