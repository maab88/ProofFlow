import { Text, View } from 'react-native';

import { BottomActionBar } from '@/components/ui/bottom-action-bar';
import { Card } from '@/components/ui/card';
import { CurrencyInput } from '@/components/ui/currency-input';
import { EmptyState } from '@/components/ui/empty-state';
import { GhostButton } from '@/components/ui/ghost-button';
import { IconButton } from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';
import { ListRow } from '@/components/ui/list-row';
import { PhotoTile } from '@/components/ui/photo-tile';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Screen } from '@/components/ui/screen';
import { SecondaryButton } from '@/components/ui/secondary-button';
import { SectionHeader } from '@/components/ui/section-header';
import { SegmentedToggle } from '@/components/ui/segmented-toggle';
import { StatCard } from '@/components/ui/stat-card';
import { StepIndicator } from '@/components/ui/step-indicator';
import { TextArea } from '@/components/ui/text-area';

const photoToggleOptions = [
  { label: 'Before', value: 'before' },
  { label: 'After', value: 'after' },
] as const;

export function DesignSystemShowcase() {
  return (
    <View className="flex-1 bg-background">
      <Screen scrollable contentClassName="gap-6 py-4 pb-28">
        <SectionHeader
          eyebrow="Design system"
          title="Premium dark building blocks for the closeout flow."
          description="A calm, one-thumb-friendly system for proof, summary, invoice preview, and payment request screens."
          rightSlot={<IconButton accessibilityLabel="More options" icon="ellipsis-horizontal" />}
        />

        <StepIndicator
          currentStep={1}
          steps={['Customer selected', 'Proof captured', 'Invoice previewed', 'Payment requested']}
        />

        <SegmentedToggle options={photoToggleOptions} value="before" />

        <View className="flex-row gap-4">
          <StatCard badgeLabel="Next up" badgeTone="info" helper="Jobs closest to invoice send." label="Ready to close" value="3" />
          <StatCard badgeLabel="This week" badgeTone="success" helper="Collected after proof and invoice." label="Payments requested" value="$2,480" />
        </View>

        <Card className="gap-4">
          <Text className="text-base font-semibold text-text-primary">Field inputs</Text>
          <Input editable={false} hint="Homeowner or site contact." label="Customer name" value="Morgan Electrical" />
          <TextArea
            editable={false}
            hint="Keep it short and invoice-ready."
            label="Work summary"
            value="Replaced faulty breaker, tested panel, confirmed full circuit restoration."
          />
          <CurrencyInput editable={false} hint="Labor or parts total." label="Amount" value="185.50" />
        </Card>

        <Card className="gap-4">
          <Text className="text-base font-semibold text-text-primary">Proof capture</Text>
          <View className="flex-row gap-4">
            <PhotoTile badgeLabel="Before" badgeTone="warning" subtitle="Tap target sized for quick review." title="Panel photo" />
            <PhotoTile badgeLabel="After" badgeTone="success" subtitle="Ready to support the invoice." title="Completed work" />
          </View>
        </Card>

        <View className="gap-3">
          <ListRow subtitle="Tight row layout for the closeout list." title="Job closeout status" value="Ready" />
          <ListRow subtitle="Use trailing actions sparingly." title="Customer record" trailing={<GhostButton fullWidth={false} label="Open" />} />
        </View>

        <EmptyState
          actionLabel="Create job"
          description="Empty states should push the next narrow step instead of filling the screen with generic admin clutter."
          onAction={() => undefined}
          title="No closeouts waiting"
        />
      </Screen>

      <BottomActionBar
        primaryAction={<PrimaryButton label="Send invoice" onPress={() => undefined} />}
        secondaryAction={<SecondaryButton label="Save draft" onPress={() => undefined} />}
      />
    </View>
  );
}
