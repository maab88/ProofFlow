import { Redirect, Stack } from 'expo-router';

import { FullScreenLoader } from '@/components/ui/full-screen-loader';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { getPostAuthRoute } from '@/features/auth/utils/auth-routing';

export default function AuthLayout() {
  const { status } = useAuth();

  if (status === 'loading') {
    return <FullScreenLoader title="Preparing sign in" description="Checking your session and loading the calmest way back into ProofFlow." />;
  }

  if (status !== 'signed_out') {
    return <Redirect href={getPostAuthRoute(status === 'ready')} />;
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
