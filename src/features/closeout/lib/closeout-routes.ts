import type { Href } from 'expo-router';

import { closeoutStepIds, type CloseoutStepId } from '@/features/closeout/lib/closeout-types';

export const closeoutStepMeta: ReadonlyArray<{ id: CloseoutStepId; title: string; description: string; shortLabel: string }> = [
  {
    id: 'before-photos',
    title: 'Before Photos',
    description: 'Capture the starting condition before anything else changes.',
    shortLabel: 'Before',
  },
  {
    id: 'voice-summary',
    title: 'Voice Summary',
    description: 'Record the work in your own words, then review the summary draft before it becomes trusted job notes.',
    shortLabel: 'Voice',
  },
  {
    id: 'after-photos',
    title: 'After Photos',
    description: 'Show the finished result while the job is still fresh.',
    shortLabel: 'After',
  },
  {
    id: 'charges',
    title: 'Charges',
    description: 'Review labor, parts, tax, and the total before previewing the invoice.',
    shortLabel: 'Charges',
  },
  {
    id: 'invoice-preview',
    title: 'Invoice Preview',
    description: 'Confirm the customer-facing invoice summary before sending anything out.',
    shortLabel: 'Preview',
  },
  {
    id: 'send',
    title: 'Send',
    description: 'Confirm recipient details and the send handoff for the payment request.',
    shortLabel: 'Send',
  },
] as const;

const stepPathById: Record<CloseoutStepId, string> = {
  'before-photos': 'before-photos',
  'voice-summary': 'voice-summary',
  'after-photos': 'after-photos',
  charges: 'charges',
  'invoice-preview': 'invoice-preview',
  send: 'send',
};

export function getCloseoutEntryRoute(jobId: string): Href {
  return `/jobs/${jobId}/closeout` as Href;
}

export function getCloseoutStepRoute(jobId: string, stepId: CloseoutStepId): Href {
  return `/jobs/${jobId}/closeout/${stepPathById[stepId]}` as Href;
}

export function getCloseoutStepIndex(stepId: CloseoutStepId) {
  return closeoutStepIds.indexOf(stepId);
}

export function getNextCloseoutStep(stepId: CloseoutStepId): CloseoutStepId | null {
  const index = getCloseoutStepIndex(stepId);
  return closeoutStepIds[index + 1] ?? null;
}

export function getPreviousCloseoutStep(stepId: CloseoutStepId): CloseoutStepId | null {
  const index = getCloseoutStepIndex(stepId);
  return closeoutStepIds[index - 1] ?? null;
}

export function getCloseoutStepMeta(stepId: CloseoutStepId) {
  return closeoutStepMeta.find((step) => step.id === stepId)!;
}

export function getNextCloseoutStepLabel(stepId: CloseoutStepId) {
  const nextStepId = getNextCloseoutStep(stepId);

  if (!nextStepId) {
    return null;
  }

  return `Next: ${getCloseoutStepMeta(nextStepId).title}`;
}
