import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';

export function useCloseoutJobId() {
  const params = useLocalSearchParams<{ jobId?: string | string[] }>();

  return useMemo(() => (Array.isArray(params.jobId) ? params.jobId[0] : params.jobId) ?? null, [params.jobId]);
}
