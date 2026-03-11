import { useQuery } from '@tanstack/react-query';

import { listCustomers } from '@/features/customers/services/customers-service';
import { customerKeys } from '@/features/customers/hooks/customer-keys';

export function useCustomersQuery(businessId: string | null | undefined) {
  return useQuery({
    queryKey: businessId ? customerKeys.list(businessId) : customerKeys.all,
    queryFn: () => listCustomers(businessId!),
    enabled: Boolean(businessId),
  });
}
