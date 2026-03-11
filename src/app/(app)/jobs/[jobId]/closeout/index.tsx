import { Redirect, useLocalSearchParams } from 'expo-router';

import { getCloseoutStepRoute } from '@/features/closeout/lib/closeout-routes';

export default function CloseoutIndexRoute() {
  const params = useLocalSearchParams<{ jobId?: string | string[] }>();
  const jobId = Array.isArray(params.jobId) ? params.jobId[0] : params.jobId;

  if (!jobId) {
    return null;
  }

  return <Redirect href={getCloseoutStepRoute(jobId, 'before-photos')} />;
}
