import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { env } from '@/lib/env';

const workflowSteps = [
  'Capture before photos',
  'Record and review the work summary',
  'Capture after photos',
  'Preview and send the invoice',
];

const readinessItems = [
  { label: 'Auth shell', status: 'Ready', tone: 'success' as const },
  { label: 'Closeout flow', status: 'Next', tone: 'info' as const },
  { label: 'Payments', status: 'Later', tone: 'warning' as const },
];

export function DashboardScreen() {
  return (
    <Screen scrollable>
      <View className="gap-6 py-4">
        <SectionHeader
          eyebrow={env.appEnv}
          title="A tighter final-mile workflow starts here."
          description="ProofFlow stays focused on closeout readiness instead of turning into a broad field-service suite."
          rightSlot={<StatusBadge label="Foundation ready" tone="success" />}
        />

        <Card className="gap-5">
          <View className="gap-2">
            <Text className="text-sm font-semibold uppercase tracking-[1.5px] text-accent">App direction</Text>
            <Text className="text-2xl font-semibold text-text">Built for the moment right after the work is done.</Text>
            <Text className="text-sm leading-6 text-muted">
              The app shell is ready for proof capture, summary review, invoice preview, and payment request without expanding into unrelated operations.
            </Text>
          </View>
          <Button label="Open jobs" onPress={() => router.push('/jobs')} />
        </Card>

        <Card className="gap-4">
          <Text className="text-base font-semibold text-text">Readiness</Text>
          <View className="gap-3">
            {readinessItems.map((item) => (
              <View className="flex-row items-center justify-between gap-3" key={item.label}>
                <Text className="flex-1 text-sm text-muted">{item.label}</Text>
                <StatusBadge label={item.status} tone={item.tone} />
              </View>
            ))}
          </View>
        </Card>

        <Card className="gap-4">
          <Text className="text-base font-semibold text-text">Primary workflow scaffold</Text>
          <View className="gap-3">
            {workflowSteps.map((step, index) => (
              <View className="flex-row items-center gap-3" key={step}>
                <View className="h-9 w-9 items-center justify-center rounded-full bg-surface-elevated">
                  <Text className="text-sm font-semibold text-text">{index + 1}</Text>
                </View>
                <Text className="flex-1 text-sm leading-6 text-muted">{step}</Text>
              </View>
            ))}
          </View>
        </Card>

        <View className="gap-3">
          <Button label="Open customers" onPress={() => router.push('/customers')} variant="secondary" />
          <Button label="Review settings" onPress={() => router.push('/settings')} variant="ghost" />
        </View>
      </View>
    </Screen>
  );
}
