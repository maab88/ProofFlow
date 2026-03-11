import { router } from 'expo-router';
import { View } from 'react-native';

import { ErrorState } from '@/components/ui/error-state';
import { GhostButton } from '@/components/ui/ghost-button';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { CustomerForm } from '@/features/customers/components/customer-form';
import { useCreateCustomerMutation } from '@/features/customers/hooks/use-customer-mutations';
import { getCustomerFormDefaults, type CustomerFormValues } from '@/features/customers/lib/customer-form';
import { getCustomerDetailRoute } from '@/features/customers/lib/customer-routes';
import { getCustomerErrorMessage } from '@/features/customers/services/customers-service';

export function CreateCustomerScreen() {
  const { business } = useAuth();
  const createCustomerMutation = useCreateCustomerMutation(business?.id);

  const handleSubmit = async (values: CustomerFormValues) => {
    const createdCustomer = await createCustomerMutation.mutateAsync({
      displayName: values.fullName.trim(),
      phone: values.phone?.trim() || null,
      email: values.email?.trim() || null,
      address: values.address?.trim() || null,
      notes: values.notes?.trim() || null,
    });

    router.replace(getCustomerDetailRoute(createdCustomer.id));
  };

  return (
    <Screen scrollable avoidKeyboard>
      <View className="gap-6 py-4">
        <GhostButton fullWidth={false} label="Back to customers" onPress={() => router.back()} />
        <SectionHeader
          eyebrow="New customer"
          title="Add a customer fast."
          description="Capture only the contact details you need to start work and move toward closeout."
        />
        {!business?.id ? (
          <ErrorState
            title="Business not ready"
            description="Your business context is still loading. Return to the dashboard and try again in a moment."
            actionLabel="Back to dashboard"
            onAction={() => router.replace('/dashboard')}
          />
        ) : (
          <CustomerForm
            defaultValues={getCustomerFormDefaults()}
            errorMessage={createCustomerMutation.isError ? getCustomerErrorMessage(createCustomerMutation.error as Error) : null}
            isSubmitting={createCustomerMutation.isPending}
            onSubmit={handleSubmit}
            submitLabel="Create customer"
          />
        )}
      </View>
    </Screen>
  );
}
