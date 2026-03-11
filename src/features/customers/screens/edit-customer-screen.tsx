import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';

import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { GhostButton } from '@/components/ui/ghost-button';
import { LoadingState } from '@/components/ui/loading-state';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { CustomerForm } from '@/features/customers/components/customer-form';
import { useCustomerDetailQuery } from '@/features/customers/hooks/use-customer-detail-query';
import { useUpdateCustomerMutation } from '@/features/customers/hooks/use-customer-mutations';
import { getCustomerFormDefaults, type CustomerFormValues } from '@/features/customers/lib/customer-form';
import { customersRoute, getCustomerDetailRoute } from '@/features/customers/lib/customer-routes';
import { getCustomerErrorMessage } from '@/features/customers/services/customers-service';

export function EditCustomerScreen() {
  const params = useLocalSearchParams<{ customerId?: string | string[] }>();
  const customerId = useMemo(() => (Array.isArray(params.customerId) ? params.customerId[0] : params.customerId) ?? null, [params.customerId]);
  const { business } = useAuth();
  const customerQuery = useCustomerDetailQuery(customerId, business?.id);
  const updateCustomerMutation = useUpdateCustomerMutation(business?.id, customerId ?? '');

  const handleSubmit = async (values: CustomerFormValues) => {
    if (!customerId) {
      return;
    }

    await updateCustomerMutation.mutateAsync({
      displayName: values.fullName.trim(),
      phone: values.phone?.trim() || null,
      email: values.email?.trim() || null,
      address: values.address?.trim() || null,
      notes: values.notes?.trim() || null,
    });

    router.replace(getCustomerDetailRoute(customerId));
  };

  return (
    <Screen scrollable avoidKeyboard>
      <View className="gap-6 py-4">
        <GhostButton fullWidth={false} label="Back to customer" onPress={() => router.back()} />

        {!business?.id ? (
          <ErrorState
            title="Business not ready"
            description="Your business context is still loading. Return to the dashboard and try again in a moment."
            actionLabel="Back to dashboard"
            onAction={() => router.replace('/dashboard')}
          />
        ) : null}

        {business?.id && customerQuery.isLoading ? <LoadingState label="Loading customer" /> : null}

        {business?.id && customerQuery.isError ? (
          <ErrorState
            title="Could not load customer"
            description="Try going back to the customer list and opening the record again."
            actionLabel="Back to customers"
            onAction={() => router.replace(customersRoute)}
          />
        ) : null}

        {business?.id && customerQuery.data ? (
          <>
            <SectionHeader
              eyebrow="Edit customer"
              title={`Update ${customerQuery.data.displayName}`}
              description="Keep the record clean and current without turning this into a CRM workflow."
            />
            <CustomerForm
              defaultValues={getCustomerFormDefaults(customerQuery.data)}
              errorMessage={updateCustomerMutation.isError ? getCustomerErrorMessage(updateCustomerMutation.error as Error) : null}
              isSubmitting={updateCustomerMutation.isPending}
              onSubmit={handleSubmit}
              submitLabel="Save changes"
            />
          </>
        ) : null}

        {business?.id && !customerQuery.isLoading && !customerQuery.isError && !customerQuery.data ? (
          <EmptyState
            title="Customer not found"
            description="This record may have been removed before you got here."
            actionLabel="Back to customers"
            onAction={() => router.replace(customersRoute)}
          />
        ) : null}
      </View>
    </Screen>
  );
}
