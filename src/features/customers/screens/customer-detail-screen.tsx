import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { GhostButton } from '@/components/ui/ghost-button';
import { LoadingState } from '@/components/ui/loading-state';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useCustomerDetailQuery } from '@/features/customers/hooks/use-customer-detail-query';
import { useDeleteCustomerMutation } from '@/features/customers/hooks/use-customer-mutations';
import { customersRoute, getCustomerEditRoute } from '@/features/customers/lib/customer-routes';
import { getCustomerErrorMessage } from '@/features/customers/services/customers-service';

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="gap-1">
      <Text className="text-sm text-text-muted">{label}</Text>
      <Text className="text-base leading-6 text-text-primary">{value}</Text>
    </View>
  );
}

export function CustomerDetailScreen() {
  const params = useLocalSearchParams<{ customerId?: string | string[] }>();
  const customerId = useMemo(() => (Array.isArray(params.customerId) ? params.customerId[0] : params.customerId) ?? null, [params.customerId]);
  const { business } = useAuth();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const customerQuery = useCustomerDetailQuery(customerId, business?.id);
  const deleteCustomerMutation = useDeleteCustomerMutation(business?.id);

  const handleDelete = async () => {
    if (!customerId) {
      return;
    }

    await deleteCustomerMutation.mutateAsync(customerId);
    router.replace(customersRoute);
  };

  return (
    <Screen scrollable>
      <View className="gap-6 py-4">
        <GhostButton fullWidth={false} label="Back to customers" onPress={() => router.back()} />

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
            title="Could not load this customer"
            description="The customer may have been removed or your session may need a refresh."
            actionLabel="Back to customers"
            onAction={() => router.replace(customersRoute)}
          />
        ) : null}

        {business?.id && customerQuery.data ? (
          <>
            <SectionHeader
              eyebrow="Customer detail"
              title={customerQuery.data.displayName}
              description="Keep contact details easy to review before starting or resuming work."
            />

            <Card className="gap-4">
              <DetailRow label="Phone" value={customerQuery.data.phone ?? 'Not added'} />
              <DetailRow label="Email" value={customerQuery.data.email ?? 'Not added'} />
              <DetailRow label="Address" value={customerQuery.data.addressLine1 ?? 'Not added'} />
              <DetailRow label="Notes" value={customerQuery.data.notes ?? 'No notes yet'} />
            </Card>

            <Card className="gap-3">
              <Text className="text-base font-semibold text-text-primary">Recent jobs</Text>
              <Text className="text-sm leading-6 text-text-secondary">
                This area is reserved for recent job summaries and quick re-entry into closeouts once job data is wired in.
              </Text>
            </Card>

            {confirmDelete ? (
              <Card className="gap-4 border-danger bg-danger/5">
                <Text className="text-base font-semibold text-text-primary">Delete this customer?</Text>
                <Text className="text-sm leading-6 text-text-secondary">
                  This removes the customer record from ProofFlow. Use this only if the record was added by mistake.
                </Text>
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <GhostButton label="Cancel" onPress={() => setConfirmDelete(false)} />
                  </View>
                  <View className="flex-1">
                    <GhostButton label="Delete customer" loading={deleteCustomerMutation.isPending} onPress={() => void handleDelete()} />
                  </View>
                </View>
                {deleteCustomerMutation.isError ? (
                  <Text className="text-sm text-danger">{getCustomerErrorMessage(deleteCustomerMutation.error as Error)}</Text>
                ) : null}
              </Card>
            ) : null}

            <View className="gap-3">
              <PrimaryButton label="Edit customer" onPress={() => router.push(getCustomerEditRoute(customerQuery.data.id))} />
              <GhostButton label="Delete customer" onPress={() => setConfirmDelete(true)} />
            </View>
          </>
        ) : null}

        {business?.id && !customerQuery.isLoading && !customerQuery.isError && !customerQuery.data ? (
          <EmptyState
            title="Customer not found"
            description="This customer may have been deleted or is not available for your business."
            actionLabel="Back to customers"
            onAction={() => router.replace(customersRoute)}
          />
        ) : null}
      </View>
    </Screen>
  );
}
