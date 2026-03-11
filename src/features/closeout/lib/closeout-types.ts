export const closeoutStepIds = [
  'before-photos',
  'voice-summary',
  'after-photos',
  'charges',
  'invoice-preview',
  'send',
] as const;

export type CloseoutStepId = (typeof closeoutStepIds)[number];

export type CloseoutPhotoStepDraft = {
  itemCount: number;
  placeholderNote: string;
  lastUpdatedAt: string | null;
};

export type CloseoutAudioReference = {
  localUri: string | null;
  fileName: string | null;
  durationSeconds: number | null;
  recordedAt: string | null;
};

export type CloseoutRecordingState = 'idle' | 'recording' | 'recorded';
export type CloseoutTranscriptionStatus = 'idle' | 'loading' | 'success' | 'error';

export type CloseoutVoiceSummaryDraft = {
  recordingState: CloseoutRecordingState;
  audioReference: CloseoutAudioReference;
  transcriptDraftText: string;
  finalWorkSummary: string;
  transcriptionStatus: CloseoutTranscriptionStatus;
  canRetryTranscription: boolean;
  manualEntryAvailable: boolean;
  usedManualEntry: boolean;
  lastTranscriptionError: string | null;
  lastReviewedAt: string | null;
};

export type CloseoutChargesDraft = {
  laborAmount: string;
  partsAmount: string;
  taxAmount: string;
  totalAmount: string;
  placeholderNote: string;
};

export type CloseoutInvoicePreviewDraft = {
  previewStatus: 'idle' | 'ready';
  placeholderNote: string;
};

export type CloseoutSendDraft = {
  recipientLabel: string;
  sendStatus: 'idle' | 'ready';
  placeholderNote: string;
};

export type CloseoutDraft = {
  jobId: string;
  jobTitle: string;
  customerName: string;
  currentStep: CloseoutStepId;
  startedAt: string;
  updatedAt: string;
  beforePhotos: CloseoutPhotoStepDraft;
  voiceSummary: CloseoutVoiceSummaryDraft;
  afterPhotos: CloseoutPhotoStepDraft;
  charges: CloseoutChargesDraft;
  invoicePreview: CloseoutInvoicePreviewDraft;
  send: CloseoutSendDraft;
};

export type CloseoutDraftSeed = {
  jobId: string;
  jobTitle: string;
  customerName: string;
  laborAmountCents: number;
  partsAmountCents: number;
  taxAmountCents: number;
  totalAmountCents: number;
};

export function createCloseoutDraft(seed: CloseoutDraftSeed): CloseoutDraft {
  const now = new Date().toISOString();

  return {
    jobId: seed.jobId,
    jobTitle: seed.jobTitle,
    customerName: seed.customerName,
    currentStep: 'before-photos',
    startedAt: now,
    updatedAt: now,
    beforePhotos: {
      itemCount: 0,
      placeholderNote: 'Before photos will attach here so the starting condition is easy to prove later.',
      lastUpdatedAt: null,
    },
    voiceSummary: {
      recordingState: 'idle',
      audioReference: {
        localUri: null,
        fileName: null,
        durationSeconds: null,
        recordedAt: null,
      },
      transcriptDraftText: '',
      finalWorkSummary: '',
      transcriptionStatus: 'idle',
      canRetryTranscription: false,
      manualEntryAvailable: true,
      usedManualEntry: false,
      lastTranscriptionError: null,
      lastReviewedAt: null,
    },
    afterPhotos: {
      itemCount: 0,
      placeholderNote: 'After photos will confirm the finished result before the invoice goes out.',
      lastUpdatedAt: null,
    },
    charges: {
      laborAmount: formatMoneyInput(seed.laborAmountCents),
      partsAmount: formatMoneyInput(seed.partsAmountCents),
      taxAmount: formatMoneyInput(seed.taxAmountCents),
      totalAmount: formatMoneyInput(seed.totalAmountCents),
      placeholderNote: 'Charges stay editable here before the customer-facing invoice preview is locked in.',
    },
    invoicePreview: {
      previewStatus: 'idle',
      placeholderNote: 'The invoice preview step will show exactly what the customer is about to receive.',
    },
    send: {
      recipientLabel: seed.customerName,
      sendStatus: 'idle',
      placeholderNote: 'Send will confirm recipient details and delivery status before the payment request goes out.',
    },
  };
}

function formatMoneyInput(amountCents: number) {
  return (amountCents / 100).toFixed(2);
}
