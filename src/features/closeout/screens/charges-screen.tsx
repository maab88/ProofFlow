import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { GhostButton } from '@/components/ui/ghost-button';
import { PrimaryButton } from '@/components/ui/primary-button';
import { CloseoutStepShell } from '@/features/closeout/components/closeout-step-shell';
import { useCloseoutJobId } from '@/features/closeout/hooks/use-closeout-job-id';
import { getCloseoutStepRoute } from '@/features/closeout/lib/closeout-routes';
import { useCloseoutDraftStore } from '@/features/closeout/store/use-closeout-draft-store';

function AmountRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <Text className="text-sm text-text-secondary">{label}</Text>
      <Text className="text-base font-semibold text-text-primary">${value}</Text>
    </View>
  );
}

export function ChargesScreen() {
  const jobId = useCloseoutJobId();
  const draft = useCloseoutDraftStore((state) => (jobId ? state.drafts[jobId] : undefined));

  return (
    <CloseoutStepShell
      jobId={jobId}
      stepId="charges"
      primaryAction={<PrimaryButton label="Continue to Invoice Preview" onPress={() => jobId && router.push(getCloseoutStepRoute(jobId, 'invoice-preview'))} />}
      secondaryAction={<GhostButton label="Back" onPress={() => router.back()} />}
      footerNote="Charges are seeded from the job right now so the later invoice preview step can stay fast and predictable."
    >
      <Card className="gap-4">
        <Text className="text-base font-semibold text-text-primary">Charges placeholder</Text>
        <Text className="text-sm leading-6 text-text-secondary">The line-item editor comes later. For now, this step proves the flow can carry charges into invoice preview without losing state.</Text>
        <View className="gap-3 rounded-card border border-border bg-surface-raised/80 px-4 py-4">
          <AmountRow label="Labor" value={draft?.charges.laborAmount ?? '0.00'} />
          <AmountRow label="Parts" value={draft?.charges.partsAmount ?? '0.00'} />
          <AmountRow label="Tax" value={draft?.charges.taxAmount ?? '0.00'} />
          <View className="h-px bg-border" />
          <AmountRow label="Total" value={draft?.charges.totalAmount ?? '0.00'} />
        </View>
      </Card>
    </CloseoutStepShell>
  );
}
