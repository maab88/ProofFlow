import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Text, View } from 'react-native';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { TextField } from '@/components/ui/text-field';

const signUpSchema = z
  .object({
    fullName: z.string().min(2, 'Enter your name.'),
    businessName: z.string().min(2, 'Enter your business name.'),
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
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    defaultValues: {
      fullName: '',
      businessName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = handleSubmit(async () => {
    router.replace('/dashboard');
  });

  return (
    <Screen avoidKeyboard scrollable>
      <View className="flex-1 gap-8 py-4">
        <SectionHeader
          eyebrow="Create account"
          title="Set up a calmer closeout workflow."
          description="Keep setup light, then move into a focused shell built around finishing work and requesting payment."
        />

        <Card className="gap-5">
          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, value } }) => (
              <TextField label="Full name" onChangeText={onChange} value={value} error={errors.fullName?.message} />
            )}
          />
          <Controller
            control={control}
            name="businessName"
            render={({ field: { onChange, value } }) => (
              <TextField
                label="Business name"
                onChangeText={onChange}
                value={value}
                error={errors.businessName?.message}
              />
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
          <Button label="Create account" loading={isSubmitting} onPress={onSubmit} />
        </Card>

        <Text className="text-center text-sm leading-6 text-muted">
          Account creation is placeholder-only in this foundation build.
        </Text>

        <Text className="text-center text-sm text-muted">
          Already have an account?{' '}
          <Link href="/sign-in" style={{ color: '#4da3ff', fontWeight: '600' }}>
            Sign in
          </Link>
        </Text>
      </View>
    </Screen>
  );
}
