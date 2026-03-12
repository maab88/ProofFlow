export const closeoutVoiceNoteKeys = {
  all: ['closeout-voice-note'] as const,
  detail: (businessId: string, jobId: string) => [...closeoutVoiceNoteKeys.all, businessId, jobId] as const,
};
