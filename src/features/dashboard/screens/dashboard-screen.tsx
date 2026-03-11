import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { GhostButton } from '@/components/ui/ghost-button';
import { ListRow } from '@/components/ui/list-row';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Screen } from '@/components/ui/screen';
import { SecondaryButton } from '@/components/ui/secondary-button';
import { SectionHeader } from '@/components/ui/section-header';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { getDashboardMock } from '@/features/dashboard/data/dashboard-mock';

function getScenario(hasRecentJobs: boolean, hasUnpaidInvoices: boolean) {
  return hasRecentJobs || hasUnpaidInvoices ? 'populated' : 'empty';
}

export function DashboardScreen() {
  const { appUser, business } = useAuth();
  const snapshot = getDashboardMock({
    businessName: business?.displayName,
    greetingName: appUser?.fullName ?? null,
  });
  const quickStats = Object.fromEntries(snapshot.quickStats.map((stat) => [stat.key, stat]));
  const scenario = getScenario(snapshot.recentJobs.length > 0, snapshot.unpaidInvoices.length > 0);

  return (
    <Screen scrollable>
      <View className="gap-6 py-4">
        <SectionHeader
          eyebrow={snapshot.businessName}
          title={snapshot.greetingName ? `Good to see you, ${snapshot.greetingName}.` : 'Ready for the next closeout?'}
          description={snapshot.subheadline}
          rightSlot={<StatusBadge label={scenario === 'empty' ? 'Start simple' : 'Ready today'} tone={scenario === 'empty' ? 'info' : 'success'} />}
        />

        <Card className="gap-5 overflow-hidden px-5 py-5">
          <View className="absolute inset-0 bg-surface-raised opacity-40" />
          <View className="gap-3">
            <Text className="text-xs font-semibold uppercase tracking-[2px] text-primary">Today&apos;s launchpad</Text>
            <Text className="text-[30px] font-semibold leading-10 text-text-primary">{snapshot.headline}</Text>
          </View>
          <View className="gap-3">
            <PrimaryButton label="Close Out Job" onPress={() => router.push('/jobs')} />
            <View className="flex-row gap-3">
              <View className="flex-1">
                <SecondaryButton label="Customers" onPress={() => router.push('/customers')} />
              </View>
              <View className="flex-1">
                <GhostButton label="Jobs" onPress={() => router.push('/jobs')} />
              </View>
            </View>
          </View>
        </Card>

        <View className="gap-4">
          <StatCard
            label={quickStats.jobsThisWeek.label}
            value={quickStats.jobsThisWeek.value}
            helper={quickStats.jobsThisWeek.helper}
            badgeLabel={quickStats.jobsThisWeek.badgeLabel}
            badgeTone={quickStats.jobsThisWeek.badgeTone}
          />
          <StatCard
            label={quickStats.unpaidAmount.label}
            value={quickStats.unpaidAmount.value}
            helper={quickStats.unpaidAmount.helper}
            badgeLabel={quickStats.unpaidAmount.badgeLabel}
            badgeTone={quickStats.unpaidAmount.badgeTone}
          />
          <StatCard
            label={quickStats.paidThisMonth.label}
            value={quickStats.paidThisMonth.value}
            helper={quickStats.paidThisMonth.helper}
            badgeLabel={quickStats.paidThisMonth.badgeLabel}
            badgeTone={quickStats.paidThisMonth.badgeTone}
          />
        </View>

        <View className="gap-4">
          <SectionHeader
            title="Recent jobs"
            description="The latest work that may need proof captured, summary cleanup, or invoice finishing."
          />
          {snapshot.recentJobs.length > 0 ? (
            <View className="gap-3">
              {snapshot.recentJobs.map((job) => (
                <ListRow
                  key={job.id}
                  title={job.title}
                  subtitle={`${job.customerName} · ${job.updatedLabel}`}
                  trailing={<StatusBadge label={job.statusLabel} tone={job.statusTone} />}
                />
              ))}
              <GhostButton label="Open jobs" onPress={() => router.push('/jobs')} />
            </View>
          ) : (
            <EmptyState
              title="No recent jobs yet"
              description="Your next finished job will show up here so the closeout action stays easy to find."
              actionLabel="Go to jobs"
              onAction={() => router.push('/jobs')}
            />
          )}
        </View>

        <View className="gap-4">
          <SectionHeader
            title="Unpaid invoices"
            description="Keep a quick read on what still needs payment without turning this into a finance dashboard."
          />
          <Card className="gap-2 px-5 py-5">
            <Text className="text-sm font-medium text-text-muted">Outstanding right now</Text>
            <Text className="text-3xl font-semibold text-text-primary">{quickStats.unpaidAmount.value}</Text>
            <Text className="text-sm leading-6 text-text-secondary">{snapshot.unpaidSummaryLabel}</Text>
          </Card>
          {snapshot.unpaidInvoices.length > 0 ? (
            <View className="gap-3">
              {snapshot.unpaidInvoices.map((invoice) => (
                <ListRow
                  key={invoice.id}
                  title={`${invoice.customerName} · ${invoice.invoiceNumber}`}
                  subtitle={invoice.ageLabel}
                  value={invoice.amountLabel}
                />
              ))}
              <GhostButton label="Open customers" onPress={() => router.push('/customers')} />
            </View>
          ) : (
            <EmptyState
              title="No unpaid invoices"
              description="Once you start sending invoices, any unpaid totals will show up here for a quick check-in."
              actionLabel="View customers"
              onAction={() => router.push('/customers')}
            />
          )}
        </View>
      </View>
    </Screen>
  );
}
