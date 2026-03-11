import { Text, View } from 'react-native';

import { StatusBadge } from '@/components/ui/status-badge';

export type StepIndicatorProps = {
  steps: string[];
  currentStep: number;
};

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  if (steps.length === 0) {
    return (
      <View className="gap-3">
        <View className="h-1.5 rounded-full bg-surface-raised" />
        <View className="flex-row items-center justify-between gap-3">
          <Text className="text-sm font-medium text-text-muted">No steps configured</Text>
          <StatusBadge label="0 of 0" tone="neutral" />
        </View>
      </View>
    );
  }

  const safeIndex = Math.max(0, Math.min(currentStep, steps.length - 1));

  return (
    <View className="gap-3">
      <View className="flex-row items-center gap-2">
        {steps.map((step, index) => (
          <View className="flex-1" key={step}>
            <View className={['h-1.5 rounded-full', index <= safeIndex ? 'bg-primary' : 'bg-surface-raised'].join(' ')} />
          </View>
        ))}
      </View>
      <View className="flex-row items-center justify-between gap-3">
        <Text className="flex-1 text-sm font-medium text-text-primary">{steps[safeIndex]}</Text>
        <StatusBadge label={`${safeIndex + 1} of ${steps.length}`} tone="info" />
      </View>
    </View>
  );
}
