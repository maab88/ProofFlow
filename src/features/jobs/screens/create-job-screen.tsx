import { router } from 'expo-router';
import { View } from 'react-native';

import { ErrorState } from '@/components/ui/error-state';
import { GhostButton } from '@/components/ui/ghost-button';
import { LoadingState } from '@/components/ui/loading-state';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useCustomersQuery } from '@/features/customers/hooks/use-customers-query';
import { createCustomerRoute } from '@/features/customers/lib/customer-routes';
import { JobForm } from '@/features/jobs/components/job-form';
import { useCreateJobMutation } from '@/features/jobs/hooks/use-job-mutations';
import { getJobFormDefaults, getJobTotalFromValues, toCents, type JobFormValues } from '@/features/jobs/lib/job-form';
import { getDatabaseStatus, getJobDetailRoute, jobsRoute } from '@/features/jobs/lib/job-routes';
import { getJobErrorMessage } from '@/features/jobs/services/jobs-service';

export function CreateJobScreen() {
  const { business, appUser } = useAuth();
  const customersQuery = useCustomersQuery(business?.id);
  const createJobMutation = useCreateJobMutation(business?.id, appUser?.id);

  const handleSubmit = async (values: JobFormValues) => {
    const nextStatus = getDatabaseStatus({ formStatus: values.status });
    const createdJob = await createJobMutation.mutateAsync({
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

    router.replace(getJobDetailRoute(createdJob.id));
  };

  return (
    <Screen scrollable avoidKeyboard>
      <View className="gap-6 py-4">
        <GhostButton fullWidth={false} label="Back to jobs" onPress={() => router.back()} />
        <SectionHeader
          eyebrow="New job"
          title="Create a job fast."
          description="Capture just enough detail to keep the work moving toward closeout."
        />

        {!business?.id || !appUser?.id ? (
          <ErrorState
            title="Account not ready"
            description="Your business context is still loading. Return to jobs and try again in a moment."
            actionLabel="Back to jobs"
            onAction={() => router.replace(jobsRoute)}
          />
        ) : customersQuery.isLoading ? (
          <LoadingState label="Loading customers" />
        ) : customersQuery.isError ? (
          <ErrorState
            title="Could not load customers"
            description="You need at least one customer before creating a job."
            actionLabel="Retry"
            onAction={() => void customersQuery.refetch()}
          />
        ) : !customersQuery.data || customersQuery.data.length === 0 ? (
          <ErrorState
            title="Create a customer first"
            description="Jobs need a customer, so add one customer before creating the first job."
            actionLabel="Add customer"
            onAction={() => router.push(createCustomerRoute)}
          />
        ) : (
          <JobForm
            customers={customersQuery.data}
            defaultValues={getJobFormDefaults()}
            errorMessage={createJobMutation.isError ? getJobErrorMessage(createJobMutation.error as Error) : null}
            isSubmitting={createJobMutation.isPending}
            onSubmit={handleSubmit}
            submitLabel="Create job"
          />
        )}
      </View>
    </Screen>
  );
}
