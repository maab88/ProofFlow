import { Redirect, Stack } from 'expo-router';

import { FullScreenLoader } from '@/components/ui/full-screen-loader';
import { useAuth } from '@/features/auth/hooks/use-auth';

export default function OnboardingLayout() {
  const { status } = useAuth();

  if (status === 'loading') {
    return <FullScreenLoader title="Loading setup" description="Getting the first business details ready so you can move into the app cleanly." />;
  }

  if (status === 'signed_out') {
    return <Redirect href="/" />;
  }

  if (status === 'ready') {
    return <Redirect href="/dashboard" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    />
  );
}
