import { Link, Redirect, router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Text, View } from 'react-native';
import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { GhostButton } from '@/components/ui/ghost-button';
import { Screen } from '@/components/ui/screen';
import { PrimaryButton } from '@/components/ui/primary-button';
import { TextField } from '@/components/ui/text-field';
import { FullScreenLoader } from '@/components/ui/full-screen-loader';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { AuthFormShell } from '@/features/auth/components/auth-form-shell';
import { AuthInlineMessage } from '@/features/auth/components/auth-inline-message';
import { getPostAuthRoute } from '@/features/auth/utils/auth-routing';
import { getAuthErrorMessage, getAuthSnapshot, signInWithPassword } from '@/features/auth/services/auth-service';

const signInSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

type SignInValues = z.infer<typeof signInSchema>;

export function SignInScreen() {
  const { status } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: zodResolver(signInSchema),
  });

  if (status === 'loading') {
    return <FullScreenLoader title="Preparing sign in" description="Loading the fastest route back into your closeouts." />;
  }

  if (status !== 'signed_out') {
    return <Redirect href={getPostAuthRoute(status === 'ready')} />;
  }

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    const { data, error } = await signInWithPassword(values);

    if (error) {
      setFormError(getAuthErrorMessage(error));
      return;
    }

    if (!data.user) {
      setFormError('We could not load your account after sign in. Please try again.');
      return;
    }

    const snapshot = await getAuthSnapshot(data.user.id);
    router.replace(getPostAuthRoute(snapshot.isOnboarded));
  });

  return (
    <Screen avoidKeyboard scrollable>
      <AuthFormShell
        description="Sign in to capture proof, finalize the summary, and move straight into invoice and payment request steps."
        eyebrow="Welcome back"
        footer={
          <View className="gap-4">
            <Text className="text-center text-sm text-text-muted">
              New to ProofFlow?{' '}
              <Link href="/sign-up" style={{ color: '#4da3ff', fontWeight: '600' }}>
                Create an account
              </Link>
            </Text>
            <Text className="text-center text-sm text-text-muted">
              Need help getting back in?{' '}
              <Link href="/forgot-password" style={{ color: '#c3d2e4', fontWeight: '600' }}>
                Reset your password
              </Link>
            </Text>
          </View>
        }
        title="Step into today's closeouts."
      >
        {formError ? <AuthInlineMessage message={formError} /> : null}
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <TextField
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              hint="Use the email tied to your business."
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
              autoComplete="password"
              hint="Minimum 8 characters."
              label="Password"
              onChangeText={onChange}
              returnKeyType="done"
              secureTextEntry
              textContentType="password"
              value={value}
              error={errors.password?.message}
            />
          )}
        />
        <PrimaryButton label="Continue" loading={isSubmitting} onPress={onSubmit} />
        <GhostButton label="Back to splash" onPress={() => router.replace('/')} />
      </AuthFormShell>
    </Screen>
  );
}
