export const customerKeys = {
  all: ['customers'] as const,
  list: (businessId: string) => [...customerKeys.all, businessId] as const,
  detail: (businessId: string, customerId: string) => [...customerKeys.list(businessId), customerId] as const,
};
