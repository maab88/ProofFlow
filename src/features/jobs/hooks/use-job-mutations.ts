import { useMutation, useQueryClient } from '@tanstack/react-query';

import { jobKeys } from '@/features/jobs/hooks/job-keys';
import {
  createJob,
  deleteJob,
  updateJob,
  updateJobStatus,
  type JobUpsertInput,
} from '@/features/jobs/services/jobs-service';
import type { JobStatus } from '@/lib/domain/models';

export function useCreateJobMutation(businessId: string | null | undefined, createdByUserId: string | null | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Omit<JobUpsertInput, 'businessId' | 'createdByUserId'>) => {
      if (!businessId || !createdByUserId) {
        throw new Error('Your account is still loading. Please try again.');
      }

      return createJob({ ...input, businessId, createdByUserId });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: jobKeys.list(businessId!) });
    },
  });
}

export function useUpdateJobMutation(businessId: string | null | undefined, createdByUserId: string | null | undefined, jobId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Omit<JobUpsertInput, 'businessId' | 'createdByUserId'>) => {
      if (!businessId || !createdByUserId) {
        throw new Error('Your account is still loading. Please try again.');
      }

      return updateJob(jobId, { ...input, businessId, createdByUserId });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: jobKeys.list(businessId!) });
      await queryClient.invalidateQueries({ queryKey: jobKeys.detail(businessId!, jobId) });
    },
  });
}

export function useUpdateJobStatusMutation(businessId: string | null | undefined, jobId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { status: JobStatus; completedAt: string | null }) => {
      if (!businessId) {
        throw new Error('Your business is still loading. Please try again.');
      }

      return updateJobStatus(jobId, businessId, input.status, input.completedAt);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: jobKeys.list(businessId!) });
      await queryClient.invalidateQueries({ queryKey: jobKeys.detail(businessId!, jobId) });
    },
  });
}

export function useDeleteJobMutation(businessId: string | null | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: string) => {
      if (!businessId) {
        throw new Error('Your business is still loading. Please try again.');
      }

      await deleteJob(jobId, businessId);
      return jobId;
    },
    onSuccess: async (jobId) => {
      await queryClient.invalidateQueries({ queryKey: jobKeys.list(businessId!) });
      queryClient.removeQueries({ queryKey: jobKeys.detail(businessId!, jobId) });
    },
  });
}
