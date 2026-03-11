import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { GhostButton } from '@/components/ui/ghost-button';
import { PrimaryButton } from '@/components/ui/primary-button';
import { CloseoutStepShell } from '@/features/closeout/components/closeout-step-shell';
import { useCloseoutJobId } from '@/features/closeout/hooks/use-closeout-job-id';
import { getCloseoutStepRoute } from '@/features/closeout/lib/closeout-routes';
import { getJobDetailRoute } from '@/features/jobs/lib/job-routes';

export function BeforePhotosScreen() {
  const jobId = useCloseoutJobId();

  return (
    <CloseoutStepShell
      jobId={jobId}
      stepId="before-photos"
      primaryAction={<PrimaryButton label="Continue to Voice Summary" onPress={() => jobId && router.push(getCloseoutStepRoute(jobId, 'voice-summary'))} />}
      secondaryAction={<GhostButton label="Back to job" onPress={() => jobId && router.replace(getJobDetailRoute(jobId))} />}
      footerNote="Before photos will plug into the proof record next. For now, the shell makes the step order and handoff clear."
    >
      <View className="gap-4">
        <EmptyState
          title="Before photos are still empty"
          description="This step will open the camera and hold the initial proof set. Right now, the shell keeps the closeout sequence focused and ready."
        />
        <Card className="gap-3">
          <Text className="text-base font-semibold text-text-primary">What will happen here later</Text>
          <Text className="text-sm leading-6 text-text-secondary">Capture the starting condition quickly, review the photo count, then continue without leaving the closeout flow.</Text>
        </Card>
      </View>
    </CloseoutStepShell>
  );
}
