import { router } from 'expo-router';

import { GhostButton } from '@/components/ui/ghost-button';
import { PrimaryButton } from '@/components/ui/primary-button';
import { CloseoutPhotoStepContent } from '@/features/closeout/components/closeout-photo-step-content';
import { CloseoutStepShell } from '@/features/closeout/components/closeout-step-shell';
import { useCloseoutJobId } from '@/features/closeout/hooks/use-closeout-job-id';
import { useCloseoutPhotoStep } from '@/features/closeout/hooks/use-closeout-photo-step';
import { getCloseoutStepRoute, getNextCloseoutStepLabel } from '@/features/closeout/lib/closeout-routes';

export function AfterPhotosScreen() {
  const jobId = useCloseoutJobId();
  const photoState = useCloseoutPhotoStep({ stepKey: 'afterPhotos', category: 'after' });

  return (
    <CloseoutStepShell
      jobId={jobId}
      stepId="after-photos"
      primaryAction={
        <PrimaryButton
          disabled={photoState.isUploading}
          label={photoState.isUploading ? 'Uploads in progress' : (getNextCloseoutStepLabel('after-photos') ?? 'Next')}
          onPress={() => jobId && router.push(getCloseoutStepRoute(jobId, 'charges'))}
        />
      }
      secondaryAction={<GhostButton label="Back" onPress={() => router.back()} />}
      footerNote="After photos finish the proof record and should make the completed result obvious at a glance."
    >
      <CloseoutPhotoStepContent category="after" state={photoState} />
    </CloseoutStepShell>
  );
}
