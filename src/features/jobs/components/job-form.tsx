import { Controller, useForm, useWatch } from 'react-hook-form';
import { Text, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';

import { CurrencyInput } from '@/components/ui/currency-input';
import { Input } from '@/components/ui/input';
import { PrimaryButton } from '@/components/ui/primary-button';
import { SegmentedToggle } from '@/components/ui/segmented-toggle';
import { TextArea } from '@/components/ui/text-area';
import { AuthInlineMessage } from '@/features/auth/components/auth-inline-message';
import { CustomerChoice } from '@/features/jobs/components/customer-choice';
import { formatCurrencyFromCents, getJobTotalFromValues, getSelectedCustomerLabel, getStatusHelperText, jobFormSchema, type JobFormValues } from '@/features/jobs/lib/job-form';
import { jobStatusOptions } from '@/features/jobs/lib/job-routes';
import type { Customer } from '@/lib/domain/models';

type JobFormProps = {
  customers: Customer[];
  defaultValues: JobFormValues;
  submitLabel: string;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onSubmit: (values: JobFormValues) => void | Promise<void>;
};

export function JobForm({ customers, defaultValues, submitLabel, isSubmitting = false, errorMessage, onSubmit }: JobFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<JobFormValues>({
    defaultValues,
    resolver: zodResolver(jobFormSchema),
  });
  const values = useWatch({ control });
  const totalLabel = formatCurrencyFromCents(
    getJobTotalFromValues({
      laborAmount: values.laborAmount ?? '0',
      partsAmount: values.partsAmount ?? '0',
      taxAmount: values.taxAmount ?? '0',
    }),
  );

  return (
    <View className="gap-4">
      {errorMessage ? <AuthInlineMessage message={errorMessage} /> : null}
      <Controller
        control={control}
        name="customerId"
        render={({ field: { onChange, value } }) => (
          <View className="gap-3">
            <Text className="text-sm font-medium text-text-secondary">Customer</Text>
            <Text className="text-sm text-text-muted">{getSelectedCustomerLabel(customers, value)}</Text>
            <View className="gap-2">
              {customers.map((customer) => (
                <CustomerChoice key={customer.id} customer={customer} selected={customer.id === value} onPress={() => onChange(customer.id)} />
              ))}
            </View>
            {errors.customerId?.message ? <Text className="text-sm text-danger">{errors.customerId.message}</Text> : null}
          </View>
        )}
      />
      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, value } }) => (
          <Input
            autoCapitalize="sentences"
            label="Title"
            onChangeText={onChange}
            returnKeyType="next"
            value={value}
            error={errors.title?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="status"
        render={({ field: { onChange, value } }) => (
          <View className="gap-3">
            <Text className="text-sm font-medium text-text-secondary">Status</Text>
            <SegmentedToggle options={jobStatusOptions} value={value} onValueChange={onChange} />
            <Text className="text-sm leading-5 text-text-muted">{getStatusHelperText(value)}</Text>
          </View>
        )}
      />
      <Controller
        control={control}
        name="workSummary"
        render={({ field: { onChange, value } }) => (
          <TextArea
            hint="Keep this tight: enough to remind you what was done before closeout starts."
            label="Work summary"
            numberOfLines={4}
            onChangeText={onChange}
            value={value}
            error={errors.workSummary?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="laborAmount"
        render={({ field: { onChange, value } }) => (
          <CurrencyInput label="Labor amount" onChangeValue={onChange} value={value} error={errors.laborAmount?.message} />
        )}
      />
      <Controller
        control={control}
        name="partsAmount"
        render={({ field: { onChange, value } }) => (
          <CurrencyInput label="Parts amount" onChangeValue={onChange} value={value} error={errors.partsAmount?.message} />
        )}
      />
      <Controller
        control={control}
        name="taxAmount"
        render={({ field: { onChange, value } }) => (
          <CurrencyInput label="Tax amount" onChangeValue={onChange} value={value} error={errors.taxAmount?.message} />
        )}
      />
      <View className="rounded-card border border-border bg-surface px-5 py-4">
        <Text className="text-sm font-medium text-text-muted">Total amount</Text>
        <Text className="mt-2 text-3xl font-semibold text-text-primary">{totalLabel}</Text>
      </View>
      <PrimaryButton label={submitLabel} loading={isSubmitting} onPress={handleSubmit(onSubmit)} />
    </View>
  );
}
