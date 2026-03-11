import type { PropsWithChildren, ReactNode } from 'react';

import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { BottomActionBar } from '@/components/ui/bottom-action-bar';
import { Card } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { FullScreenLoader } from '@/components/ui/full-screen-loader';
import { GhostButton } from '@/components/ui/ghost-button';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { StepIndicator } from '@/components/ui/step-indicator';
import { useCloseoutFlow } from '@/features/closeout/hooks/use-closeout-flow';
import { closeoutStepMeta, getCloseoutStepIndex, getCloseoutStepMeta } from '@/features/closeout/lib/closeout-routes';
import { getCloseoutStorageLabel } from '@/features/closeout/lib/closeout-storage';
import type { CloseoutStepId } from '@/features/closeout/lib/closeout-types';
import { getJobDetailRoute, jobsRoute } from '@/features/jobs/lib/job-routes';

type CloseoutStepShellProps = PropsWithChildren<{
  jobId: string | null;
  stepId: CloseoutStepId;
  primaryAction: ReactNode;
  secondaryAction?: ReactNode;
  footerNote?: string;
}>;

export function CloseoutStepShell({ jobId, stepId, primaryAction, secondaryAction, footerNote, children }: CloseoutStepShellProps) {
  const { business, draft, hydrated, isReady, jobQuery } = useCloseoutFlow(jobId);
  const stepMeta = getCloseoutStepMeta(stepId);
  const stepIndex = getCloseoutStepIndex(stepId);

  if (!hydrated) {
    return (
      <FullScreenLoader
        title="Restoring closeout draft"
        description={`Checking ${getCloseoutStorageLabel()} so step progress stays with you.`}
      />
    );
  }

  if (!business?.id) {
    return (
      <Screen>
        <View className="flex-1 py-4">
          <ErrorState
            title="Business not ready"
            description="Your business context is still loading. Return to jobs and try closeout again in a moment."
            actionLabel="Back to jobs"
            onAction={() => router.replace(jobsRoute)}
          />
        </View>
      </Screen>
    );
  }

  if (jobQuery.isLoading || !isReady) {
    return <FullScreenLoader title="Opening closeout" description="Preparing this job so the proof and invoice steps stay connected." />;
  }

  if (jobQuery.isError || !jobQuery.data || !draft || !jobId) {
    return (
      <Screen>
        <View className="flex-1 py-4">
          <ErrorState
            title="Could not open closeout"
            description="The job may have changed or your session may need a refresh. Head back to jobs and try again."
            actionLabel="Back to jobs"
            onAction={() => router.replace(jobsRoute)}
          />
        </View>
      </Screen>
    );
  }

  return (
    <>
      <Screen scrollable contentClassName="px-5 pb-32 pt-4">
        <View className="gap-6 py-4">
          <GhostButton fullWidth={false} label="Exit closeout" onPress={() => router.replace(getJobDetailRoute(jobId))} />

          <Card className="gap-5 px-5 py-5">
            <View className="gap-2">
              <Text className="text-xs font-semibold uppercase tracking-[2px] text-primary">Closeout for {draft.customerName}</Text>
              <Text className="text-sm leading-6 text-text-secondary">{draft.jobTitle}</Text>
            </View>
            <StepIndicator steps={closeoutStepMeta.map((step) => step.shortLabel)} currentStep={stepIndex} />
          </Card>

          <SectionHeader eyebrow={`Step ${stepIndex + 1}`} title={stepMeta.title} description={stepMeta.description} />

          {children}

          <Card className="gap-2 bg-surface-raised/70 px-5 py-4">
            <Text className="text-sm font-medium text-text-primary">Draft progress stays local for now</Text>
            <Text className="text-sm leading-6 text-text-muted">
              {footerNote ?? 'You can move forward, back, or briefly leave the flow without losing this draft shell immediately.'}
            </Text>
          </Card>
        </View>
      </Screen>

      <BottomActionBar primaryAction={primaryAction} secondaryAction={secondaryAction} />
    </>
  );
}
