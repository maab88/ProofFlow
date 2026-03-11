import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Text } from 'react-native';
import { useState } from 'react';
import { z } from 'zod';

import { GhostButton } from '@/components/ui/ghost-button';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { AuthFormShell } from '@/features/auth/components/auth-form-shell';
import { AuthInlineMessage } from '@/features/auth/components/auth-inline-message';
import { getAuthErrorMessage, sendPasswordResetEmail } from '@/features/auth/services/auth-service';

const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordScreen() {
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    defaultValues: {
      email: '',
    },
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = handleSubmit(async ({ email }) => {
    setFormError(null);
    setSuccessMessage(null);

    const { error } = await sendPasswordResetEmail(email);

    if (error) {
      setFormError(getAuthErrorMessage(error));
      return;
    }

    setSuccessMessage('If that email exists, reset instructions are on the way.');
  });

  return (
    <Screen avoidKeyboard scrollable>
      <AuthFormShell
        description="Enter your email and we'll send you a password reset link so you can get back into the app quickly."
        eyebrow="Forgot password"
        footer={
          <Text className="text-center text-sm text-text-muted">
            Remembered it?{' '}
            <Link href="/sign-in" style={{ color: '#4da3ff', fontWeight: '600' }}>
              Return to sign in
            </Link>
          </Text>
        }
        title="Reset your password."
      >
        {formError ? <AuthInlineMessage message={formError} /> : null}
        {successMessage ? <AuthInlineMessage message={successMessage} tone="success" /> : null}
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <TextField
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              keyboardType="email-address"
              label="Email"
              onChangeText={onChange}
              returnKeyType="done"
              textContentType="emailAddress"
              value={value}
              error={errors.email?.message}
            />
          )}
        />
        <PrimaryButton label="Send reset link" loading={isSubmitting} onPress={onSubmit} />
        <GhostButton label="Back to sign in" onPress={() => router.replace('/sign-in')} />
      </AuthFormShell>
    </Screen>
  );
}
