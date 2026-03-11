import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { StatusBadge } from '@/components/ui/status-badge';

const jobStates = [
  { label: 'Before proof pending', tone: 'warning' as const },
  { label: 'Summary review', tone: 'info' as const },
  { label: 'Invoice send', tone: 'success' as const },
];

export function JobsScreen() {
  return (
    <Screen scrollable>
      <View className="gap-6 py-4">
        <SectionHeader
          eyebrow="Jobs"
          title="Jobs stay centered on closeout readiness."
          description="No scheduling board, no dispatch layer, no broad ops surface. Just the jobs that need to be wrapped up cleanly."
        />

        <EmptyState
          title="No jobs in the shell yet"
          description="Real jobs are intentionally not connected in this foundation. When they are, this screen should highlight only the jobs closest to invoice and payment."
          actionLabel="Back to dashboard"
          onAction={() => router.push('/dashboard')}
        />

        <Card className="gap-4">
          <Text className="text-base font-semibold text-text">States this screen should support</Text>
          <View className="flex-row flex-wrap gap-3">
            {jobStates.map((state) => (
              <StatusBadge key={state.label} label={state.label} tone={state.tone} />
            ))}
          </View>
        </Card>

        <Button label="Open settings" onPress={() => router.push('/settings')} variant="ghost" />
      </View>
    </Screen>
  );
}
