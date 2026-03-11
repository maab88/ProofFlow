import { Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import type { BadgeTone } from '@/theme/tokens';

type StatCardProps = {
  label: string;
  value: string;
  helper?: string;
  badgeLabel?: string;
  badgeTone?: BadgeTone;
};

export function StatCard({ label, value, helper, badgeLabel, badgeTone = 'neutral' }: StatCardProps) {
  return (
    <Card className="gap-3 px-5 py-5">
      <View className="flex-row items-center justify-between gap-3">
        <Text className="text-sm font-medium text-text-muted">{label}</Text>
        {badgeLabel ? <StatusBadge label={badgeLabel} tone={badgeTone} /> : null}
      </View>
      <Text className="text-3xl font-semibold text-text-primary">{value}</Text>
      {helper ? <Text className="text-sm leading-5 text-text-secondary">{helper}</Text> : null}
    </Card>
  );
}
