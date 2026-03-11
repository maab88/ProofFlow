import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { BottomActionBar } from '@/components/ui/bottom-action-bar';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { GhostButton } from '@/components/ui/ghost-button';
import { LoadingState } from '@/components/ui/loading-state';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { SegmentedToggle } from '@/components/ui/segmented-toggle';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useDeleteJobMutation, useUpdateJobStatusMutation } from '@/features/jobs/hooks/use-job-mutations';
import { useJobDetailQuery } from '@/features/jobs/hooks/use-job-detail-query';
import { formatCurrencyFromCents } from '@/features/jobs/lib/job-form';
import { getDatabaseStatus, getJobCloseoutRoute, getJobEditRoute, getJobFormStatus, getJobStatusPresentation, jobStatusOptions, jobsRoute } from '@/features/jobs/lib/job-routes';
import { getJobErrorMessage } from '@/features/jobs/services/jobs-service';

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="gap-1">
      <Text className="text-sm text-text-muted">{label}</Text>
      <Text className="text-base leading-6 text-text-primary">{value}</Text>
    </View>
  );
}

export function JobDetailScreen() {
  const params = useLocalSearchParams<{ jobId?: string | string[] }>();
  const jobId = useMemo(() => (Array.isArray(params.jobId) ? params.jobId[0] : params.jobId) ?? null, [params.jobId]);
  const { business } = useAuth();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const jobQuery = useJobDetailQuery(jobId, business?.id);
  const deleteJobMutation = useDeleteJobMutation(business?.id);
  const updateJobStatusMutation = useUpdateJobStatusMutation(business?.id, jobId ?? '');
  const jobStatus = jobQuery.data ? getJobStatusPresentation(jobQuery.data.status, jobQuery.data.completedAt) : null;

  const handleDelete = async () => {
    if (!jobId) {
      return;
    }

    await deleteJobMutation.mutateAsync(jobId);
    router.replace(jobsRoute);
  };

  return (
    <>
      <Screen scrollable contentClassName="px-5 pb-32 pt-4">
        <View className="gap-6 py-4">
          <GhostButton fullWidth={false} label="Back to jobs" onPress={() => router.back()} />

          {!business?.id ? (
            <ErrorState
              title="Business not ready"
              description="Your business context is still loading. Return to jobs and try again in a moment."
              actionLabel="Back to jobs"
              onAction={() => router.replace(jobsRoute)}
            />
          ) : null}

          {business?.id && jobQuery.isLoading ? <LoadingState label="Loading job" /> : null}

          {business?.id && jobQuery.isError ? (
            <ErrorState
              title="Could not load this job"
              description="The job may have been removed or your session may need a refresh."
              actionLabel="Back to jobs"
              onAction={() => router.replace(jobsRoute)}
            />
          ) : null}

          {business?.id && jobQuery.data && jobStatus ? (
            <>
              <SectionHeader
                eyebrow={jobQuery.data.customerName}
                title={jobQuery.data.title}
                description="Keep the job details clear, then move directly into closeout when the work is done."
                rightSlot={<StatusBadge label={jobStatus.label} tone={jobStatus.tone} />}
              />

              <Card className="gap-4">
                <Text className="text-sm font-medium text-text-muted">Status</Text>
                <SegmentedToggle
                  disabled={updateJobStatusMutation.isPending}
                  options={jobStatusOptions}
                  value={getJobFormStatus(jobQuery.data.status, jobQuery.data.completedAt)}
                  onValueChange={(value) => {
                    const nextStatus = getDatabaseStatus({
                      formStatus: value,
                      currentStatus: jobQuery.data.status,
                      currentCompletedAt: value === 'completed' ? jobQuery.data.completedAt : null,
                    });
                    void updateJobStatusMutation.mutateAsync(nextStatus);
                  }}
                />
                {updateJobStatusMutation.isError ? (
                  <Text className="text-sm text-danger">{getJobErrorMessage(updateJobStatusMutation.error as Error)}</Text>
                ) : null}
              </Card>

              <Card className="gap-4">
                <DetailRow label="Work summary" value={jobQuery.data.workSummaryFinal ?? jobQuery.data.workSummaryDraft ?? 'No summary yet'} />
                <DetailRow label="Created" value={new Date(jobQuery.data.createdAt).toLocaleString()} />
                <DetailRow label="Completed" value={jobQuery.data.completedAt ? new Date(jobQuery.data.completedAt).toLocaleString() : 'Not completed yet'} />
              </Card>

              <Card className="gap-4">
                <Text className="text-base font-semibold text-text-primary">Amounts</Text>
                <DetailRow label="Labor" value={formatCurrencyFromCents(jobQuery.data.laborAmountCents)} />
                <DetailRow label="Parts" value={formatCurrencyFromCents(jobQuery.data.partsAmountCents)} />
                <DetailRow label="Tax" value={formatCurrencyFromCents(jobQuery.data.taxAmountCents)} />
                <DetailRow label="Total" value={formatCurrencyFromCents(jobQuery.data.totalAmountCents)} />
              </Card>

              {confirmDelete ? (
                <Card className="gap-4 border-danger bg-danger/5">
                  <Text className="text-base font-semibold text-text-primary">Delete this job?</Text>
                  <Text className="text-sm leading-6 text-text-secondary">
                    Delete the job only if it was created by mistake. This will remove it from the closeout pipeline.
                  </Text>
                  <View className="flex-row gap-3">
                    <View className="flex-1">
                      <GhostButton label="Cancel" onPress={() => setConfirmDelete(false)} />
                    </View>
                    <View className="flex-1">
                      <GhostButton label="Delete job" loading={deleteJobMutation.isPending} onPress={() => void handleDelete()} />
                    </View>
                  </View>
                  {deleteJobMutation.isError ? (
                    <Text className="text-sm text-danger">{getJobErrorMessage(deleteJobMutation.error as Error)}</Text>
                  ) : null}
                </Card>
              ) : null}

              <View className="gap-3">
                <PrimaryButton label="Edit job" onPress={() => router.push(getJobEditRoute(jobQuery.data.id))} />
                <GhostButton label="Delete job" onPress={() => setConfirmDelete(true)} />
              </View>
            </>
          ) : null}

          {business?.id && !jobQuery.isLoading && !jobQuery.isError && !jobQuery.data ? (
            <EmptyState
              title="Job not found"
              description="This job may have been deleted or is not available for your business."
              actionLabel="Back to jobs"
              onAction={() => router.replace(jobsRoute)}
            />
          ) : null}
        </View>
      </Screen>

      {jobQuery.data ? (
        <BottomActionBar
          primaryAction={<PrimaryButton label="Start Closeout" onPress={() => router.push(getJobCloseoutRoute(jobQuery.data.id))} />}
        />
      ) : null}
    </>
  );
}

