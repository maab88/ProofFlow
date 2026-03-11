import { router } from 'expo-router';
import { View } from 'react-native';

import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingState } from '@/components/ui/loading-state';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { JobListItem } from '@/features/jobs/components/job-list-item';
import { useJobsQuery } from '@/features/jobs/hooks/use-jobs-query';
import { createJobRoute, getJobDetailRoute } from '@/features/jobs/lib/job-routes';

export function JobsScreen() {
  const { business } = useAuth();
  const jobsQuery = useJobsQuery(business?.id);
  const jobs = jobsQuery.data ?? [];

  return (
    <Screen scrollable>
      <View className="gap-6 py-4">
        <SectionHeader
          eyebrow="Jobs"
          title="Keep jobs lined up for closeout."
          description="Stay focused on the work that still needs to move from completed job to proof, invoice, and payment request."
        />

        {!business?.id ? (
          <ErrorState
            title="Business not ready"
            description="Your business context is still loading. Return to the dashboard and try again in a moment."
            actionLabel="Back to dashboard"
            onAction={() => router.replace('/dashboard')}
          />
        ) : (
          <>
            <PrimaryButton label="Create job" onPress={() => router.push(createJobRoute)} />

            {jobsQuery.isLoading ? <LoadingState label="Loading jobs" /> : null}

            {jobsQuery.isError ? (
              <ErrorState
                title="Could not load jobs"
                description="Check your connection and try again."
                actionLabel="Retry"
                onAction={() => void jobsQuery.refetch()}
              />
            ) : null}

            {!jobsQuery.isLoading && !jobsQuery.isError && jobs.length > 0 ? (
              <View className="gap-3">
                {jobs.map((job) => (
                  <JobListItem key={job.id} job={job} onPress={() => router.push(getJobDetailRoute(job.id))} />
                ))}
              </View>
            ) : null}

            {!jobsQuery.isLoading && !jobsQuery.isError && jobs.length === 0 ? (
              <EmptyState
                title="No jobs yet"
                description="Create your first job so it is ready to hand off into closeout when the work is done."
                actionLabel="Create job"
                onAction={() => router.push(createJobRoute)}
              />
            ) : null}
          </>
        )}
      </View>
    </Screen>
  );
}
