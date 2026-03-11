import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { GhostButton } from '@/components/ui/ghost-button';
import { PrimaryButton } from '@/components/ui/primary-button';
import { StatusBadge } from '@/components/ui/status-badge';
import { CloseoutStepShell } from '@/features/closeout/components/closeout-step-shell';
import { useCloseoutJobId } from '@/features/closeout/hooks/use-closeout-job-id';
import { getJobDetailRoute } from '@/features/jobs/lib/job-routes';
import { useCloseoutDraftStore } from '@/features/closeout/store/use-closeout-draft-store';

export function SendScreen() {
  const jobId = useCloseoutJobId();
  const draft = useCloseoutDraftStore((state) => (jobId ? state.drafts[jobId] : undefined));

  return (
    <CloseoutStepShell
      jobId={jobId}
      stepId="send"
      primaryAction={<PrimaryButton label="Return to Job Detail" onPress={() => jobId && router.replace(getJobDetailRoute(jobId))} />}
      secondaryAction={<GhostButton label="Back" onPress={() => router.back()} />}
      footerNote="The send step is still a shell, but it already reserves the last review point for recipient details and delivery status."
    >
      <Card className="gap-4">
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-1 gap-1">
            <Text className="text-base font-semibold text-text-primary">Send handoff placeholder</Text>
            <Text className="text-sm leading-6 text-text-secondary">This final step will later confirm where the invoice is going and whether delivery succeeded.</Text>
          </View>
          <StatusBadge label={draft?.send.sendStatus ?? 'idle'} tone="info" />
        </View>
        <View className="gap-2 rounded-card border border-border bg-surface-raised/80 px-4 py-4">
          <Text className="text-sm text-text-secondary">Recipient</Text>
          <Text className="text-base font-semibold text-text-primary">{draft?.send.recipientLabel ?? 'Customer recipient'}</Text>
        </View>
      </Card>
    </CloseoutStepShell>
  );
}
