import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';

const customerFocus = [
  'Find a customer fast from the field',
  'Start a new closeout without admin clutter',
  'Return to repeat customers in one tap',
];

export function CustomersScreen() {
  return (
    <Screen scrollable>
      <View className="gap-6 py-4">
        <SectionHeader
          eyebrow="Customers"
          title="Customer access should stay quick and quiet."
          description="This area will stay focused on selecting or creating the right customer before a job closeout begins."
        />

        <EmptyState
          title="No customers loaded yet"
          description="Customer data is intentionally not wired in yet. This screen is reserved for fast selection and lightweight creation only."
          actionLabel="Return to dashboard"
          onAction={() => router.push('/dashboard')}
        />

        <Card className="gap-4">
          <Text className="text-base font-semibold text-text">What belongs here</Text>
          <View className="gap-3">
            {customerFocus.map((item) => (
              <Text className="text-sm leading-6 text-muted" key={item}>
                {item}
              </Text>
            ))}
          </View>
        </Card>

        <Button label="Open jobs" onPress={() => router.push('/jobs')} variant="ghost" />
      </View>
    </Screen>
  );
}
