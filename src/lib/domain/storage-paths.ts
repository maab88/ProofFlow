export const STORAGE_BUCKETS = {
  jobMedia: 'job-media',
  generatedFiles: 'generated-files',
} as const;

export const storagePaths = {
  jobPhoto: ({ businessId, jobId, photoId, extension }: { businessId: string; jobId: string; photoId: string; extension: string }) =>
    `${businessId}/jobs/${jobId}/photos/${photoId}.${extension}`,
  voiceNote: ({ businessId, jobId, voiceNoteId, extension }: { businessId: string; jobId: string; voiceNoteId: string; extension: string }) =>
    `${businessId}/jobs/${jobId}/voice-notes/${voiceNoteId}.${extension}`,
  invoicePdf: ({ businessId, invoiceId, extension = 'pdf' }: { businessId: string; invoiceId: string; extension?: string }) =>
    `${businessId}/invoices/${invoiceId}/invoice.${extension}`,
} as const;
