export const jobKeys = {
  all: ['jobs'] as const,
  list: (businessId: string) => [...jobKeys.all, businessId] as const,
  detail: (businessId: string, jobId: string) => [...jobKeys.list(businessId), jobId] as const,
};
