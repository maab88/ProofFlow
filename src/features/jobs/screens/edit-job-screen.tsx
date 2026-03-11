import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';

import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { GhostButton } from '@/components/ui/ghost-button';
import { LoadingState } from '@/components/ui/loading-state';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useCustomersQuery } from '@/features/customers/hooks/use-customers-query';
import { JobForm } from '@/features/jobs/components/job-form';
import { useJobDetailQuery } from '@/features/jobs/hooks/use-job-detail-query';
import { useUpdateJobMutation } from '@/features/jobs/hooks/use-job-mutations';
import { getJobFormDefaults, getJobTotalFromValues, toCents, type JobFormValues } from '@/features/jobs/lib/job-form';
import { getDatabaseStatus, getJobDetailRoute, jobsRoute } from '@/features/jobs/lib/job-routes';
import { getJobErrorMessage } from '@/features/jobs/services/jobs-service';

export function EditJobScreen() {
  const params = useLocalSearchParams<{ jobId?: string | string[] }>();
  const jobId = useMemo(() => (Array.isArray(params.jobId) ? params.jobId[0] : params.jobId) ?? null, [params.jobId]);
  const { business, appUser } = useAuth();
  const customersQuery = useCustomersQuery(business?.id);
  const jobQuery = useJobDetailQuery(jobId, business?.id);
  const updateJobMutation = useUpdateJobMutation(business?.id, appUser?.id, jobId ?? '');

  const handleSubmit = async (values: JobFormValues) => {
    if (!jobQuery.data) {
      return;
    }

    const nextStatus = getDatabaseStatus({
      formStatus: values.status,
      currentStatus: jobQuery.data.status,
      currentCompletedAt: values.status === 'completed' ? jobQuery.data.completedAt : null,
    });

    await updateJobMutation.mutateAsync({
      customerId: values.customerId,
      title: values.title.trim(),
      status: nextStatus.status,
      completedAt: nextStatus.completedAt,
      workSummary: values.workSummary?.trim() || null,
      laborAmountCents: toCents(values.laborAmount),
      partsAmountCents: toCents(values.partsAmount),
      taxAmountCents: toCents(values.taxAmount),
      totalAmountCents: getJobTotalFromValues(values),
    });

    router.replace(getJobDetailRoute(jobQuery.data.id));
  };

  return (
    <Screen scrollable avoidKeyboard>
      <View className="gap-6 py-4">
        <GhostButton fullWidth={false} label="Back to job" onPress={() => router.back()} />

        {!business?.id || !appUser?.id ? (
          <ErrorState
            title="Account not ready"
            description="Your account context is still loading. Return to jobs and try again in a moment."
            actionLabel="Back to jobs"
            onAction={() => router.replace(jobsRoute)}
          />
        ) : jobQuery.isLoading || customersQuery.isLoading ? (
          <LoadingState label="Loading job" />
        ) : jobQuery.isError || customersQuery.isError ? (
          <ErrorState
            title="Could not load job"
            description="Try opening the job again in a moment."
            actionLabel="Back to jobs"
            onAction={() => router.replace(jobsRoute)}
          />
        ) : !jobQuery.data || !customersQuery.data ? (
          <EmptyState
            title="Job not found"
            description="This job may have been removed before you got here."
            actionLabel="Back to jobs"
            onAction={() => router.replace(jobsRoute)}
          />
        ) : (
          <>
            <SectionHeader
              eyebrow="Edit job"
              title={`Update ${jobQuery.data.title}`}
              description="Keep the job clear and ready for closeout without turning this into a scheduling workflow."
            />
            <JobForm
              customers={customersQuery.data}
              defaultValues={getJobFormDefaults(jobQuery.data)}
              errorMessage={updateJobMutation.isError ? getJobErrorMessage(updateJobMutation.error as Error) : null}
              isSubmitting={updateJobMutation.isPending}
              onSubmit={handleSubmit}
              submitLabel="Save changes"
            />
          </>
        )}
      </View>
    </Screen>
  );
}
