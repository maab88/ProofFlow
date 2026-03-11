export type DashboardStatTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export type DashboardQuickStatKey = 'jobsThisWeek' | 'unpaidAmount' | 'paidThisMonth';

export type DashboardQuickStat = {
  key: DashboardQuickStatKey;
  label: string;
  value: string;
  helper: string;
  badgeLabel?: string;
  badgeTone?: DashboardStatTone;
};

export type DashboardRecentJob = {
  id: string;
  customerName: string;
  title: string;
  statusLabel: string;
  statusTone: DashboardStatTone;
  updatedLabel: string;
};

export type DashboardUnpaidInvoice = {
  id: string;
  customerName: string;
  invoiceNumber: string;
  amountLabel: string;
  ageLabel: string;
};

export type DashboardSnapshot = {
  businessName: string;
  greetingName: string | null;
  headline: string;
  subheadline: string;
  quickStats: DashboardQuickStat[];
  recentJobs: DashboardRecentJob[];
  unpaidInvoices: DashboardUnpaidInvoice[];
  unpaidSummaryLabel: string;
  scenario: 'populated' | 'empty';
};

export const dashboardMockScenario: DashboardSnapshot['scenario'] = 'populated';

export function getDashboardMock(params: {
  businessName?: string | null;
  greetingName?: string | null;
  scenario?: DashboardSnapshot['scenario'];
}): DashboardSnapshot {
  const businessName = params.businessName?.trim() || 'ProofFlow';
  const greetingName = params.greetingName?.trim() || null;
  const scenario = params.scenario ?? dashboardMockScenario;

  if (scenario === 'empty') {
    return {
      businessName,
      greetingName,
      headline: 'Your launchpad is ready for the first closeout.',
      subheadline: 'Start with one finished job and keep the path focused on proof, summary, invoice, and payment request.',
      quickStats: [
        {
          key: 'jobsThisWeek',
          label: 'Jobs this week',
          value: '0',
          helper: 'No closeouts yet',
        },
        {
          key: 'unpaidAmount',
          label: 'Unpaid amount',
          value: '$0',
          helper: 'Nothing waiting on payment',
        },
        {
          key: 'paidThisMonth',
          label: 'Paid this month',
          value: '$0',
          helper: 'Payments will appear here',
        },
      ],
      recentJobs: [],
      unpaidInvoices: [],
      unpaidSummaryLabel: 'No unpaid invoices yet',
      scenario,
    };
  }

  return {
    businessName,
    greetingName,
    headline: 'Keep today moving from finished job to paid request.',
    subheadline: 'Your next action should stay obvious: wrap up the job, capture clean proof, and send the invoice without extra admin drag.',
    quickStats: [
      {
        key: 'jobsThisWeek',
        label: 'Jobs this week',
        value: '6',
        helper: '2 waiting to close out',
        badgeLabel: 'On pace',
        badgeTone: 'info',
      },
      {
        key: 'unpaidAmount',
        label: 'Unpaid amount',
        value: '$1,480',
        helper: '3 invoices still open',
        badgeLabel: 'Needs follow-up',
        badgeTone: 'warning',
      },
      {
        key: 'paidThisMonth',
        label: 'Paid this month',
        value: '$4,260',
        helper: 'From 9 completed invoices',
        badgeLabel: 'Healthy',
        badgeTone: 'success',
      },
    ],
    recentJobs: [
      {
        id: 'job-1',
        customerName: 'Jordan Miller',
        title: 'Replace leaking shutoff valve',
        statusLabel: 'Ready to close out',
        statusTone: 'success',
        updatedLabel: 'Updated 35 min ago',
      },
      {
        id: 'job-2',
        customerName: 'Sofia Nguyen',
        title: 'Panel troubleshooting and breaker swap',
        statusLabel: 'Proof in progress',
        statusTone: 'info',
        updatedLabel: 'Updated 2 hours ago',
      },
      {
        id: 'job-3',
        customerName: 'Liam Carter',
        title: 'Water heater thermostat replacement',
        statusLabel: 'Invoice draft ready',
        statusTone: 'warning',
        updatedLabel: 'Updated yesterday',
      },
    ],
    unpaidInvoices: [
      {
        id: 'inv-1',
        customerName: 'Jordan Miller',
        invoiceNumber: 'PF-1048',
        amountLabel: '$425',
        ageLabel: 'Sent today',
      },
      {
        id: 'inv-2',
        customerName: 'Sofia Nguyen',
        invoiceNumber: 'PF-1043',
        amountLabel: '$780',
        ageLabel: '3 days unpaid',
      },
      {
        id: 'inv-3',
        customerName: 'Liam Carter',
        invoiceNumber: 'PF-1039',
        amountLabel: '$275',
        ageLabel: '6 days unpaid',
      },
    ],
    unpaidSummaryLabel: '$1,480 still waiting across 3 invoices',
    scenario,
  };
}
