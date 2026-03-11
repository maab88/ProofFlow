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

const signInSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

type SignInValues = z.infer<typeof signInSchema>;

export function SignInScreen() {
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

  const onSubmit = handleSubmit(async () => {
    router.replace('/dashboard');
  });

  return (
    <Screen avoidKeyboard scrollable>
      <View className="flex-1 gap-8 py-4">
        <SectionHeader
          eyebrow="Welcome back"
          title="Step into today's closeouts."
          description="Keep the final mile simple: proof captured, summary reviewed, invoice sent, payment requested."
        />

        <Card className="gap-5">
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
          <Button label="Continue" loading={isSubmitting} onPress={onSubmit} />
        </Card>

        <Text className="text-center text-sm leading-6 text-muted">
          Real authentication is intentionally out of scope for this foundation.
        </Text>

        <Button label="Preview app shell instead" onPress={() => router.replace('/dashboard')} variant="ghost" />

        <Text className="text-center text-sm text-muted">
          New to ProofFlow?{' '}
          <Link href="/sign-up" style={{ color: '#4da3ff', fontWeight: '600' }}>
            Create an account
          </Link>
        </Text>
      </View>
    </Screen>
  );
}
