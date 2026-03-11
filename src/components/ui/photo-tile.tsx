import { ImageBackground, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import type { BadgeTone } from '@/theme/tokens';

type PhotoTileProps = {
  title: string;
  subtitle?: string;
  uri?: string;
  badgeLabel?: string;
  badgeTone?: BadgeTone;
};

export function PhotoTile({ title, subtitle, uri, badgeLabel, badgeTone = 'neutral' }: PhotoTileProps) {
  const content = (
    <View className="flex-1 justify-between">
      <View className="items-start">
        {badgeLabel ? <StatusBadge label={badgeLabel} tone={badgeTone} /> : null}
      </View>
      <View className="gap-1">
        <Text className="text-sm font-semibold text-text-primary">{title}</Text>
        {subtitle ? <Text className="text-xs leading-5 text-text-secondary">{subtitle}</Text> : null}
      </View>
    </View>
  );

  return (
    <Card className="h-photo w-photo overflow-hidden px-4 py-4">
      {uri ? (
        <ImageBackground className="absolute inset-0" resizeMode="cover" source={{ uri }}>
          <View className="absolute inset-0 bg-background/45" />
        </ImageBackground>
      ) : (
        <View className="absolute inset-0 bg-surface-raised" />
      )}
      {content}
    </Card>
  );
}
