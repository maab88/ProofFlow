import type { ReactNode } from 'react';

import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type BottomActionBarProps = {
  primaryAction: ReactNode;
  secondaryAction?: ReactNode;
};

export function BottomActionBar({ primaryAction, secondaryAction }: BottomActionBarProps) {
  return (
    <SafeAreaView className="bg-background" edges={['bottom', 'left', 'right']}>
      <View className="border-t border-border bg-surface px-5 pb-4 pt-3 shadow-raised">
        <View className="flex-row items-center gap-3">
          {secondaryAction ? <View className="flex-1">{secondaryAction}</View> : null}
          <View className={secondaryAction ? 'flex-[1.4]' : 'flex-1'}>{primaryAction}</View>
        </View>
      </View>
    </SafeAreaView>
  );
}
