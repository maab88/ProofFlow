import type { Href } from 'expo-router';
import type { JobStatus } from '@/lib/domain/models';

export type JobFormStatus = 'draft' | 'open' | 'completed';

export type JobStatusPresentation = {
  label: string;
  tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
  formStatus: JobFormStatus;
};

export const jobStatusOptions: ReadonlyArray<{ label: string; value: JobFormStatus }> = [
  { label: 'Draft', value: 'draft' },
  { label: 'Open', value: 'open' },
  { label: 'Completed', value: 'completed' },
] as const;

export function getJobDetailRoute(jobId: string): Href {
  return `/jobs/${jobId}` as Href;
}

export function getJobEditRoute(jobId: string): Href {
  return `/jobs/${jobId}/edit` as Href;
}

export function getJobCloseoutRoute(jobId: string): Href {
  return `/jobs/${jobId}/closeout` as Href;
}

export const createJobRoute = '/jobs/new' as Href;
export const jobsRoute = '/jobs' as Href;

export function getJobFormStatus(status: JobStatus, completedAt: string | null): JobFormStatus {
  if (completedAt) {
    return 'completed';
  }

  if (status === 'draft') {
    return 'draft';
  }

  return 'open';
}

export function getDatabaseStatus(input: { formStatus: JobFormStatus; currentStatus?: JobStatus | null; currentCompletedAt?: string | null }) {
  if (input.formStatus === 'draft') {
    return {
      status: 'draft' as JobStatus,
      completedAt: null,
    };
  }

  if (input.formStatus === 'open') {
    return {
      status: 'in_progress' as JobStatus,
      completedAt: null,
    };
  }

  return {
    status: (input.currentStatus && input.currentStatus !== 'draft' ? input.currentStatus : 'in_progress') as JobStatus,
    completedAt: input.currentCompletedAt ?? new Date().toISOString(),
  };
}

export function getJobStatusPresentation(status: JobStatus, completedAt: string | null): JobStatusPresentation {
  if (status === 'paid') {
    return { label: 'Paid', tone: 'success', formStatus: 'completed' };
  }

  if (status === 'payment_requested') {
    return { label: 'Payment requested', tone: 'warning', formStatus: 'completed' };
  }

  if (status === 'invoice_sent') {
    return { label: 'Invoice sent', tone: 'info', formStatus: 'completed' };
  }

  if (status === 'invoice_ready') {
    return { label: 'Invoice ready', tone: 'warning', formStatus: 'completed' };
  }

  if (status === 'proof_captured') {
    return { label: 'Closeout started', tone: 'info', formStatus: 'completed' };
  }

  if (completedAt) {
    return { label: 'Completed', tone: 'success', formStatus: 'completed' };
  }

  if (status === 'draft') {
    return { label: 'Draft', tone: 'neutral', formStatus: 'draft' };
  }

  return { label: 'Open', tone: 'info', formStatus: 'open' };
}
