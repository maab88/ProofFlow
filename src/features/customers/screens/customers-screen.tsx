import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';

import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Input } from '@/components/ui/input';
import { LoadingState } from '@/components/ui/loading-state';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { CustomerListItem } from '@/features/customers/components/customer-list-item';
import { useCustomersQuery } from '@/features/customers/hooks/use-customers-query';
import { createCustomerRoute, getCustomerDetailRoute } from '@/features/customers/lib/customer-routes';

function matchesSearch(search: string, fields: Array<string | null>) {
  const normalized = search.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  return fields.some((field) => field?.toLowerCase().includes(normalized));
}

export function CustomersScreen() {
  const { business } = useAuth();
  const [search, setSearch] = useState('');
  const customersQuery = useCustomersQuery(business?.id);

  const filteredCustomers = useMemo(() => {
    return (customersQuery.data ?? []).filter((customer) =>
      matchesSearch(search, [customer.displayName, customer.email, customer.phone]),
    );
  }, [customersQuery.data, search]);

  return (
    <Screen scrollable avoidKeyboard>
      <View className="gap-6 py-4">
        <SectionHeader
          eyebrow="Customers"
          title="Keep customer lookup quick and quiet."
          description="Search fast, open the right customer, or add a new one without turning this into CRM work."
        />

        {!business?.id ? (
          <ErrorState
            title="Business not ready"
            description="Your business context is still loading. Return to the dashboard and try again in a moment."
            actionLabel="Back to dashboard"
            onAction={() => router.replace('/dashboard')}
          />
        ) : (
          <>
            <PrimaryButton label="Add customer" onPress={() => router.push(createCustomerRoute)} />

            <Input
              autoCapitalize="none"
              autoCorrect={false}
              hint="Search by name, email, or phone."
              label="Find customer"
              onChangeText={setSearch}
              placeholder="Start typing a name"
              returnKeyType="search"
              value={search}
            />

            {customersQuery.isLoading ? <LoadingState label="Loading customers" /> : null}

            {customersQuery.isError ? (
              <ErrorState
                title="Could not load customers"
                description="Pull to retry later, or check your connection and try again."
                actionLabel="Retry"
                onAction={() => void customersQuery.refetch()}
              />
            ) : null}

            {!customersQuery.isLoading && !customersQuery.isError && filteredCustomers.length > 0 ? (
              <View className="gap-3">
                {filteredCustomers.map((customer) => (
                  <CustomerListItem key={customer.id} customer={customer} onPress={() => router.push(getCustomerDetailRoute(customer.id))} />
                ))}
              </View>
            ) : null}

            {!customersQuery.isLoading && !customersQuery.isError && customersQuery.data?.length === 0 ? (
              <EmptyState
                title="No customers yet"
                description="Add your first customer so the next job can move straight into proof capture and invoicing."
                actionLabel="Create customer"
                onAction={() => router.push(createCustomerRoute)}
              />
            ) : null}

            {!customersQuery.isLoading && !customersQuery.isError && customersQuery.data && customersQuery.data.length > 0 && filteredCustomers.length === 0 ? (
              <EmptyState
                title="No matches found"
                description="Try a customer name, phone number, or email to narrow the list."
                actionLabel="Clear search"
                onAction={() => setSearch('')}
              />
            ) : null}
          </>
        )}
      </View>
    </Screen>
  );
}
