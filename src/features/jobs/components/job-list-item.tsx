import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { formatCurrencyFromCents } from '@/features/jobs/lib/job-form';
import { getJobStatusPresentation } from '@/features/jobs/lib/job-routes';
import type { JobListRecord } from '@/features/jobs/services/jobs-service';
import { StatusBadge } from '@/components/ui/status-badge';

export function JobListItem({ job, onPress }: { job: JobListRecord; onPress: () => void }) {
  const status = getJobStatusPresentation(job.status, job.completedAt);

  return (
    <Pressable className="rounded-card border border-border bg-surface px-5 py-4 active:opacity-90" onPress={onPress}>
      <View className="gap-3">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1 gap-1">
            <Text className="text-base font-semibold text-text-primary">{job.title}</Text>
            <Text className="text-sm leading-5 text-text-secondary">{job.customerName}</Text>
          </View>
          <Ionicons color="#8ea2ba" name="chevron-forward" size={18} />
        </View>
        <View className="flex-row items-center justify-between gap-3">
          <StatusBadge label={status.label} tone={status.tone} />
          <Text className="text-sm font-medium text-text-primary">{formatCurrencyFromCents(job.totalAmountCents)}</Text>
        </View>
      </View>
    </Pressable>
  );
}
