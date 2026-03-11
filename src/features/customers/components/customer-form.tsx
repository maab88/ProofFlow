import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';

import { Input } from '@/components/ui/input';
import { PrimaryButton } from '@/components/ui/primary-button';
import { TextArea } from '@/components/ui/text-area';
import { AuthInlineMessage } from '@/features/auth/components/auth-inline-message';
import { customerFormSchema, type CustomerFormValues } from '@/features/customers/lib/customer-form';

type CustomerFormProps = {
  defaultValues: CustomerFormValues;
  submitLabel: string;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onSubmit: (values: CustomerFormValues) => void | Promise<void>;
};

export function CustomerForm({ defaultValues, submitLabel, isSubmitting = false, errorMessage, onSubmit }: CustomerFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    defaultValues,
    resolver: zodResolver(customerFormSchema),
  });

  return (
    <View className="gap-4">
      {errorMessage ? <AuthInlineMessage message={errorMessage} /> : null}
      <Controller
        control={control}
        name="fullName"
        render={({ field: { onChange, value } }) => (
          <Input
            autoCapitalize="words"
            label="Full name"
            onChangeText={onChange}
            returnKeyType="next"
            value={value}
            error={errors.fullName?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, value } }) => (
          <Input
            keyboardType="phone-pad"
            label="Phone"
            onChangeText={onChange}
            returnKeyType="next"
            value={value}
            error={errors.phone?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <Input
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            label="Email"
            onChangeText={onChange}
            returnKeyType="next"
            value={value}
            error={errors.email?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="address"
        render={({ field: { onChange, value } }) => (
          <TextArea
            label="Address"
            numberOfLines={3}
            onChangeText={onChange}
            value={value}
            error={errors.address?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="notes"
        render={({ field: { onChange, value } }) => (
          <TextArea
            hint="Keep this lightweight: gate code, parking note, or quick context only."
            label="Notes"
            numberOfLines={4}
            onChangeText={onChange}
            value={value}
            error={errors.notes?.message}
          />
        )}
      />
      <PrimaryButton label={submitLabel} loading={isSubmitting} onPress={handleSubmit(onSubmit)} />
    </View>
  );
}
