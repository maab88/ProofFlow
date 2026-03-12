import { router } from 'expo-router';

import { GhostButton } from '@/components/ui/ghost-button';
import { PrimaryButton } from '@/components/ui/primary-button';
import { CloseoutPhotoStepContent } from '@/features/closeout/components/closeout-photo-step-content';
import { CloseoutStepShell } from '@/features/closeout/components/closeout-step-shell';
import { useCloseoutJobId } from '@/features/closeout/hooks/use-closeout-job-id';
import { useCloseoutPhotoStep } from '@/features/closeout/hooks/use-closeout-photo-step';
import { getCloseoutStepRoute, getNextCloseoutStepLabel } from '@/features/closeout/lib/closeout-routes';
import { getJobDetailRoute } from '@/features/jobs/lib/job-routes';

export function BeforePhotosScreen() {
  const jobId = useCloseoutJobId();
  const photoState = useCloseoutPhotoStep({ stepKey: 'beforePhotos', category: 'before' });

  return (
    <CloseoutStepShell
      jobId={jobId}
      stepId="before-photos"
      primaryAction={
        <PrimaryButton
          disabled={photoState.isUploading}
          label={photoState.isUploading ? 'Uploads in progress' : (getNextCloseoutStepLabel('before-photos') ?? 'Next')}
          onPress={() => jobId && router.push(getCloseoutStepRoute(jobId, 'voice-summary'))}
        />
      }
      secondaryAction={<GhostButton label="Back to job" onPress={() => jobId && router.replace(getJobDetailRoute(jobId))} />}
      footerNote="Before photos now upload into the job proof record directly. Keep this step quick, clear, and easy to review."
    >
      <CloseoutPhotoStepContent category="before" state={photoState} />
    </CloseoutStepShell>
  );
}
