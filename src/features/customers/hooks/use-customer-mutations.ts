import { useMutation, useQueryClient } from '@tanstack/react-query';

import { customerKeys } from '@/features/customers/hooks/customer-keys';
import {
  createCustomer,
  deleteCustomer,
  updateCustomer,
  type CustomerUpsertInput,
} from '@/features/customers/services/customers-service';

export function useCreateCustomerMutation(businessId: string | null | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Omit<CustomerUpsertInput, 'businessId'>) => {
      if (!businessId) {
        throw new Error('Your business is not loaded yet. Please try again.');
      }

      return createCustomer({ ...input, businessId });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: customerKeys.list(businessId!) });
    },
  });
}

export function useUpdateCustomerMutation(businessId: string | null | undefined, customerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Omit<CustomerUpsertInput, 'businessId'>) => {
      if (!businessId) {
        throw new Error('Your business is not loaded yet. Please try again.');
      }

      return updateCustomer(customerId, { ...input, businessId });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: customerKeys.list(businessId!) });
      await queryClient.invalidateQueries({ queryKey: customerKeys.detail(businessId!, customerId) });
    },
  });
}

export function useDeleteCustomerMutation(businessId: string | null | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerId: string) => {
      if (!businessId) {
        throw new Error('Your business is not loaded yet. Please try again.');
      }

      await deleteCustomer(customerId, businessId);
      return customerId;
    },
    onSuccess: async (customerId) => {
      await queryClient.invalidateQueries({ queryKey: customerKeys.list(businessId!) });
      queryClient.removeQueries({ queryKey: customerKeys.detail(businessId!, customerId) });
    },
  });
}
