import { z } from 'zod';

import type { Customer } from '@/lib/domain/models';
import { getJobFormStatus, type JobFormStatus } from '@/features/jobs/lib/job-routes';

export const jobFormSchema = z.object({
  customerId: z.string().min(1, 'Choose a customer.'),
  title: z.string().min(2, 'Enter a job title.'),
  status: z.enum(['draft', 'open', 'completed']),
  workSummary: z.string().trim().max(1200, 'Keep the work summary under 1200 characters.').optional().or(z.literal('')),
  laborAmount: z
    .string()
    .min(1, 'Enter a labor amount.')
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 0, 'Enter a valid labor amount.'),
  partsAmount: z
    .string()
    .min(1, 'Enter a parts amount.')
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 0, 'Enter a valid parts amount.'),
  taxAmount: z
    .string()
    .min(1, 'Enter a tax amount.')
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 0, 'Enter a valid tax amount.'),
});

export type JobFormValues = z.infer<typeof jobFormSchema>;

export function toCents(value: string) {
  return Math.round(Number(value) * 100);
}

export function formatCurrencyFromCents(amountCents: number) {
  return `$${(amountCents / 100).toFixed(2)}`;
}

export function getJobFormDefaults(job?: {
  customerId: string;
  title: string;
  status: import('@/lib/domain/models').JobStatus;
  completedAt: string | null;
  workSummaryDraft: string | null;
  workSummaryFinal: string | null;
  laborAmountCents: number;
  partsAmountCents: number;
  taxAmountCents: number;
}): JobFormValues {
  return {
    customerId: job?.customerId ?? '',
    title: job?.title ?? '',
    status: job ? getJobFormStatus(job.status, job.completedAt) : 'draft',
    workSummary: job?.workSummaryFinal ?? job?.workSummaryDraft ?? '',
    laborAmount: job ? (job.laborAmountCents / 100).toFixed(2).replace(/\.00$/, '') : '0',
    partsAmount: job ? (job.partsAmountCents / 100).toFixed(2).replace(/\.00$/, '') : '0',
    taxAmount: job ? (job.taxAmountCents / 100).toFixed(2).replace(/\.00$/, '') : '0',
  };
}

export function getSelectedCustomerLabel(customers: Customer[], customerId: string) {
  return customers.find((customer) => customer.id === customerId)?.displayName ?? 'Choose a customer';
}

export function getJobTotalFromValues(values: Pick<JobFormValues, 'laborAmount' | 'partsAmount' | 'taxAmount'>) {
  return toCents(values.laborAmount) + toCents(values.partsAmount) + toCents(values.taxAmount);
}

export function getStatusHelperText(formStatus: JobFormStatus) {
  if (formStatus === 'draft') {
    return 'Use draft while the job is still being set up.';
  }

  if (formStatus === 'open') {
    return 'Open means the work is active and not yet ready for closeout.';
  }

  return 'Completed keeps the job ready for the closeout flow without starting scheduling or invoicing here.';
}
