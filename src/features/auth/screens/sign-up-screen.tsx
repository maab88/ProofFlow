import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Redirect, router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Text, View } from 'react-native';
import { useState } from 'react';
import { z } from 'zod';

import { FullScreenLoader } from '@/components/ui/full-screen-loader';
import { GhostButton } from '@/components/ui/ghost-button';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { AuthFormShell } from '@/features/auth/components/auth-form-shell';
import { AuthInlineMessage } from '@/features/auth/components/auth-inline-message';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { getAuthErrorMessage, signUpWithPassword } from '@/features/auth/services/auth-service';
import { getPostAuthRoute } from '@/features/auth/utils/auth-routing';

const signUpSchema = z
  .object({
    fullName: z.string().min(2, 'Enter your full name.'),
    email: z.string().email('Enter a valid email address.'),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string().min(8, 'Confirm your password.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords must match.',
    path: ['confirmPassword'],
  });

type SignUpValues = z.infer<typeof signUpSchema>;

export function SignUpScreen() {
  const { status } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    resolver: zodResolver(signUpSchema),
  });

  if (status === 'loading') {
    return <FullScreenLoader title="Preparing sign up" description="Getting your account shell ready without extra setup noise." />;
  }

  if (status !== 'signed_out') {
    return <Redirect href={getPostAuthRoute(status === 'ready')} />;
  }

  const onSubmit = handleSubmit(async ({ fullName, email, password }) => {
    setFormError(null);
    setSuccessMessage(null);

    const { data, error } = await signUpWithPassword({ fullName, email, password });

    if (error) {
      setFormError(getAuthErrorMessage(error));
      return;
    }

    if (!data.session) {
      setSuccessMessage('Account created. Check your inbox to confirm your email, then return here to sign in.');
      return;
    }

    router.replace('/business-setup');
  });

  return (
    <Screen avoidKeyboard scrollable>
      <AuthFormShell
        description="Start with a simple account, then finish the minimal business setup needed for ProofFlow's closeout path."
        eyebrow="Create account"
        footer={
          <Text className="text-center text-sm text-text-muted">
            Already have an account?{' '}
            <Link href="/sign-in" style={{ color: '#4da3ff', fontWeight: '600' }}>
              Sign in
            </Link>
          </Text>
        }
        title="Create your account."
      >
        {formError ? <AuthInlineMessage message={formError} /> : null}
        {successMessage ? <AuthInlineMessage message={successMessage} tone="success" /> : null}
        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, value } }) => (
            <TextField label="Full name" onChangeText={onChange} value={value} error={errors.fullName?.message} />
          )}
        />
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
              returnKeyType="next"
              textContentType="emailAddress"
              value={value}
              error={errors.email?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <TextField
              autoComplete="new-password"
              hint="Use at least 8 characters."
              label="Password"
              onChangeText={onChange}
              returnKeyType="next"
              secureTextEntry
              textContentType="newPassword"
              value={value}
              error={errors.password?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, value } }) => (
            <TextField
              autoComplete="new-password"
              label="Confirm password"
              onChangeText={onChange}
              returnKeyType="done"
              secureTextEntry
              textContentType="newPassword"
              value={value}
              error={errors.confirmPassword?.message}
            />
          )}
        />
        <PrimaryButton label="Create account" loading={isSubmitting} onPress={onSubmit} />
        <GhostButton label="Back to splash" onPress={() => router.replace('/')} />
      </AuthFormShell>
    </Screen>
  );
}
