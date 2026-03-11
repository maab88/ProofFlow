import { useQuery } from '@tanstack/react-query';

import { jobKeys } from '@/features/jobs/hooks/job-keys';
import { getJob } from '@/features/jobs/services/jobs-service';

export function useJobDetailQuery(jobId: string | null | undefined, businessId: string | null | undefined) {
  return useQuery({
    queryKey: jobId && businessId ? jobKeys.detail(businessId, jobId) : jobKeys.all,
    queryFn: () => getJob(jobId!, businessId!),
    enabled: Boolean(jobId && businessId),
  });
}
