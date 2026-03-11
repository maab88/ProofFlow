import { useQuery } from '@tanstack/react-query';

import { customerKeys } from '@/features/customers/hooks/customer-keys';
import { getCustomer } from '@/features/customers/services/customers-service';

export function useCustomerDetailQuery(customerId: string | null | undefined, businessId: string | null | undefined) {
  return useQuery({
    queryKey: customerId && businessId ? customerKeys.detail(businessId, customerId) : customerKeys.all,
    queryFn: () => getCustomer(customerId!, businessId!),
    enabled: Boolean(customerId && businessId),
  });
}
