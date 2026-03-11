import { useQuery } from '@tanstack/react-query';

import { jobKeys } from '@/features/jobs/hooks/job-keys';
import { listJobs } from '@/features/jobs/services/jobs-service';

export function useJobsQuery(businessId: string | null | undefined) {
  return useQuery({
    queryKey: businessId ? jobKeys.list(businessId) : jobKeys.all,
    queryFn: () => listJobs(businessId!),
    enabled: Boolean(businessId),
  });
}
