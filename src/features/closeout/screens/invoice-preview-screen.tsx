import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { GhostButton } from '@/components/ui/ghost-button';
import { PrimaryButton } from '@/components/ui/primary-button';
import { StatusBadge } from '@/components/ui/status-badge';
import { CloseoutStepShell } from '@/features/closeout/components/closeout-step-shell';
import { useCloseoutJobId } from '@/features/closeout/hooks/use-closeout-job-id';
import { getCloseoutStepRoute, getNextCloseoutStepLabel } from '@/features/closeout/lib/closeout-routes';
import { useCloseoutDraftStore } from '@/features/closeout/store/use-closeout-draft-store';

export function InvoicePreviewScreen() {
  const jobId = useCloseoutJobId();
  const draft = useCloseoutDraftStore((state) => (jobId ? state.drafts[jobId] : undefined));

  return (
    <CloseoutStepShell
      jobId={jobId}
      stepId="invoice-preview"
      primaryAction={<PrimaryButton label={getNextCloseoutStepLabel('invoice-preview') ?? 'Next'} onPress={() => jobId && router.push(getCloseoutStepRoute(jobId, 'send'))} />}
      secondaryAction={<GhostButton label="Back" onPress={() => router.back()} />}
      footerNote="Invoice preview stays customer-facing in tone, but still sits behind your review before anything is sent."
    >
      <View className="gap-4">
        <Card className="gap-4">
          <View className="flex-row items-center justify-between gap-3">
            <Text className="text-base font-semibold text-text-primary">Customer preview placeholder</Text>
            <StatusBadge label={draft?.invoicePreview.previewStatus ?? 'idle'} tone="info" />
          </View>
          <Text className="text-sm leading-6 text-text-secondary">This is where the invoice surface will show the cleaned work summary, charges, and payment request framing before it goes out.</Text>
        </Card>

        <Card className="gap-3 bg-surface-raised/70">
          <Text className="text-sm font-medium text-text-primary">Preview should answer one question clearly</Text>
          <Text className="text-sm leading-6 text-text-muted">Would you feel comfortable sending this customer-facing invoice right now? That is the bar this step is designed around.</Text>
        </Card>
      </View>
    </CloseoutStepShell>
  );
}
