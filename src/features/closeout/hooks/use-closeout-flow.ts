import { useEffect, useMemo } from 'react';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { useCloseoutDraftStore } from '@/features/closeout/store/use-closeout-draft-store';
import { useJobDetailQuery } from '@/features/jobs/hooks/use-job-detail-query';

export function useCloseoutFlow(jobId: string | null) {
  const { business } = useAuth();
  const jobQuery = useJobDetailQuery(jobId, business?.id);
  const hydrated = useCloseoutDraftStore((state) => state.hydrated);
  const draft = useCloseoutDraftStore((state) => (jobId ? state.drafts[jobId] : undefined));
  const ensureDraft = useCloseoutDraftStore((state) => state.ensureDraft);
  const syncChargesFromJob = useCloseoutDraftStore((state) => state.syncChargesFromJob);

  useEffect(() => {
    if (!hydrated || !jobId || !jobQuery.data) {
      return;
    }

    if (!draft) {
      ensureDraft({
        jobId: jobQuery.data.id,
        jobTitle: jobQuery.data.title,
        customerName: jobQuery.data.customerName,
        laborAmountCents: jobQuery.data.laborAmountCents,
        partsAmountCents: jobQuery.data.partsAmountCents,
        taxAmountCents: jobQuery.data.taxAmountCents,
        totalAmountCents: jobQuery.data.totalAmountCents,
      });
      return;
    }

    ensureDraft({
      jobId: jobQuery.data.id,
      jobTitle: jobQuery.data.title,
      customerName: jobQuery.data.customerName,
      laborAmountCents: jobQuery.data.laborAmountCents,
      partsAmountCents: jobQuery.data.partsAmountCents,
      taxAmountCents: jobQuery.data.taxAmountCents,
      totalAmountCents: jobQuery.data.totalAmountCents,
    });

    syncChargesFromJob(jobQuery.data.id, {
      laborAmountCents: jobQuery.data.laborAmountCents,
      partsAmountCents: jobQuery.data.partsAmountCents,
      taxAmountCents: jobQuery.data.taxAmountCents,
      totalAmountCents: jobQuery.data.totalAmountCents,
    });
  }, [draft, ensureDraft, hydrated, jobId, jobQuery.data, syncChargesFromJob]);

  const isReady = hydrated && Boolean(business?.id) && Boolean(draft);

  return useMemo(
    () => ({
      business,
      draft,
      hydrated,
      isReady,
      jobQuery,
    }),
    [business, draft, hydrated, isReady, jobQuery],
  );
}
