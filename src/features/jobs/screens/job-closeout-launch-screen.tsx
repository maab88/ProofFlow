import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { GhostButton } from '@/components/ui/ghost-button';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { useJobDetailQuery } from '@/features/jobs/hooks/use-job-detail-query';
import { jobsRoute } from '@/features/jobs/lib/job-routes';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingState } from '@/components/ui/loading-state';

export function JobCloseoutLaunchScreen() {
  const params = useLocalSearchParams<{ jobId?: string | string[] }>();
  const jobId = useMemo(() => (Array.isArray(params.jobId) ? params.jobId[0] : params.jobId) ?? null, [params.jobId]);
  const { business } = useAuth();
  const jobQuery = useJobDetailQuery(jobId, business?.id);

  return (
    <Screen>
      <View className="flex-1 gap-6 py-4">
        <GhostButton fullWidth={false} label="Back to job" onPress={() => router.back()} />
        {!business?.id ? (
          <ErrorState
            title="Business not ready"
            description="Your business context is still loading. Return to jobs and try again in a moment."
            actionLabel="Back to jobs"
            onAction={() => router.replace(jobsRoute)}
          />
        ) : jobQuery.isLoading ? (
          <LoadingState label="Loading job" />
        ) : jobQuery.isError || !jobQuery.data ? (
          <ErrorState
            title="Could not open closeout"
            description="Try reopening the job and starting closeout again."
            actionLabel="Back to jobs"
            onAction={() => router.replace(jobsRoute)}
          />
        ) : (
          <>
            <SectionHeader
              eyebrow="Start closeout"
              title={jobQuery.data.title}
              description="This is the handoff point into proof capture, summary cleanup, invoice preview, and payment request next."
            />
            <View className="gap-4 rounded-card border border-border bg-surface px-5 py-5">
              <Text className="text-base font-semibold text-text-primary">Closeout comes next</Text>
              <Text className="text-sm leading-6 text-text-secondary">
                The job is ready to move into the narrow closeout workflow. This placeholder keeps the main CTA connected without implementing the full flow in this task.
              </Text>
            </View>
            <PrimaryButton label="Back to job" onPress={() => router.back()} />
          </>
        )}
      </View>
    </Screen>
  );
}
