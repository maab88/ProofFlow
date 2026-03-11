import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Text, View } from 'react-native';
import { useState } from 'react';
import { z } from 'zod';

import { CurrencyInput } from '@/components/ui/currency-input';
import { GhostButton } from '@/components/ui/ghost-button';
import { Input } from '@/components/ui/input';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Screen } from '@/components/ui/screen';
import { AuthFormShell } from '@/features/auth/components/auth-form-shell';
import { AuthInlineMessage } from '@/features/auth/components/auth-inline-message';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { completeBusinessSetup, getAuthErrorMessage } from '@/features/auth/services/auth-service';

const businessSetupSchema = z.object({
  businessName: z.string().min(2, 'Enter your business name.'),
  logoStoragePath: z.string().max(240, 'Keep the placeholder short.').optional().or(z.literal('')),
  defaultHourlyRate: z
    .string()
    .min(1, 'Enter your default hourly rate.')
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 0, 'Enter a valid hourly rate.'),
  taxLabel: z.string().min(2, 'Enter a tax label like HST or GST.'),
  taxRate: z
    .string()
    .min(1, 'Enter your tax rate.')
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 0 && Number(value) <= 100, 'Enter a tax rate between 0 and 100.'),
});

type BusinessSetupValues = z.infer<typeof businessSetupSchema>;

function toCents(value: string) {
  return Math.round(Number(value) * 100);
}

function toBasisPoints(value: string) {
  return Math.round(Number(value) * 100);
}

export function BusinessSetupScreen() {
  const { authUser, errorMessage, refresh, signOut } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BusinessSetupValues>({
    defaultValues: {
      businessName: '',
      logoStoragePath: '',
      defaultHourlyRate: '',
      taxLabel: 'HST',
      taxRate: '13',
    },
    resolver: zodResolver(businessSetupSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    if (!authUser) {
      setFormError('Your session is missing. Please sign in again.');
      return;
    }

    setFormError(null);

    try {
      await completeBusinessSetup(authUser, {
        businessName: values.businessName.trim(),
        logoStoragePath: values.logoStoragePath?.trim() || null,
        defaultHourlyRateCents: toCents(values.defaultHourlyRate),
        taxLabel: values.taxLabel.trim(),
        taxRateBasisPoints: toBasisPoints(values.taxRate),
      });
      await refresh();
      router.replace('/connect-payments-later');
    } catch (error) {
      setFormError(getAuthErrorMessage(error as Error));
    }
  });

  return (
    <Screen avoidKeyboard scrollable>
      <AuthFormShell
        description="Save the few defaults ProofFlow needs so the closeout path can stay fast and uncluttered."
        eyebrow="Business setup"
        footer={<GhostButton label="Sign out instead" onPress={signOut} />}
        title="Set up your business defaults."
      >
        {errorMessage ? <AuthInlineMessage message={errorMessage} /> : null}
        {formError ? <AuthInlineMessage message={formError} /> : null}
        <Controller
          control={control}
          name="businessName"
          render={({ field: { onChange, value } }) => (
            <Input
              autoCapitalize="words"
              label="Business name"
              onChangeText={onChange}
              returnKeyType="next"
              value={value}
              error={errors.businessName?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="defaultHourlyRate"
          render={({ field: { onChange, value } }) => (
            <CurrencyInput
              hint="Used as the default labor starting point later."
              label="Default hourly rate"
              onChangeValue={onChange}
              value={value}
              error={errors.defaultHourlyRate?.message}
            />
          )}
        />
        <View className="flex-row gap-4">
          <View className="flex-1">
            <Controller
              control={control}
              name="taxLabel"
              render={({ field: { onChange, value } }) => (
                <Input
                  autoCapitalize="characters"
                  label="Tax label"
                  onChangeText={onChange}
                  returnKeyType="next"
                  value={value}
                  error={errors.taxLabel?.message}
                />
              )}
            />
          </View>
          <View className="flex-1">
            <Controller
              control={control}
              name="taxRate"
              render={({ field: { onChange, value } }) => (
                <Input
                  hint="Percent"
                  keyboardType="decimal-pad"
                  label="Tax rate"
                  onChangeText={onChange}
                  returnKeyType="next"
                  value={value}
                  error={errors.taxRate?.message}
                />
              )}
            />
          </View>
        </View>
        <Controller
          control={control}
          name="logoStoragePath"
          render={({ field: { onChange, value } }) => (
            <Input
              autoCapitalize="none"
              autoCorrect={false}
              hint="Optional placeholder only. Leave blank if you're skipping logo setup for now."
              label="Logo placeholder"
              onChangeText={onChange}
              returnKeyType="done"
              value={value}
              error={errors.logoStoragePath?.message}
            />
          )}
        />
        <View className="rounded-xl border border-border bg-surface-raised px-4 py-4">
          <Text className="text-sm font-semibold text-text-primary">Payments can wait</Text>
          <Text className="mt-2 text-sm leading-6 text-text-secondary">
            Finish setup now and keep the payment connection step for later. The next screen simply confirms that choice before you enter the app.
          </Text>
        </View>
        <PrimaryButton label="Save and continue" loading={isSubmitting} onPress={onSubmit} />
      </AuthFormShell>
    </Screen>
  );
}
