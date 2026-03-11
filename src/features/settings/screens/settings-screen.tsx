import { Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingState } from '@/components/ui/loading-state';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { env } from '@/lib/env';

const settingsRows = [
  { label: 'Environment', value: env.appEnv },
  { label: 'Theme mode', value: 'Premium dark' },
  { label: 'Routing', value: 'Expo Router' },
  { label: 'State', value: 'Zustand + Query' },
];

export function SettingsScreen() {
  return (
    <Screen scrollable>
      <View className="gap-6 py-4">
        <SectionHeader
          eyebrow="Settings"
          title="Operational defaults, without the clutter."
          description="This screen stays small: app-level configuration, foundation health, and future settings boundaries."
        />

        <Card className="gap-4">
          {settingsRows.map((row) => (
            <View className="flex-row items-center justify-between gap-4" key={row.label}>
              <Text className="text-sm text-muted">{row.label}</Text>
              <Text className="text-right text-sm font-medium text-text">{row.value}</Text>
            </View>
          ))}
        </Card>

        <Card className="gap-3">
          <Text className="text-base font-semibold text-text">Foundation health</Text>
          <View className="flex-row flex-wrap gap-3">
            <StatusBadge label="Providers ready" tone="success" />
            <StatusBadge label="Typed env" tone="info" />
            <StatusBadge label="Dark shell" tone="success" />
          </View>
        </Card>

        <LoadingState label="Query and provider layers are wired for future data screens." />

        <ErrorState
          title="No live services connected yet"
          description="This is expected for the foundation phase. Backend wiring should arrive only when the next implementation task calls for it."
        />
      </View>
    </Screen>
  );
}
