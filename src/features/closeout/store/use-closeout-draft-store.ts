import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { closeoutStorage } from '@/features/closeout/lib/closeout-storage';
import {
  createCloseoutDraft,
  type CloseoutDraft,
  type CloseoutDraftSeed,
  type CloseoutAudioReference,
  type CloseoutPendingPhotoUpload,
  type CloseoutPhotoStepKey,
  type CloseoutVoiceSummaryDraft,
} from '@/features/closeout/lib/closeout-types';

function normalizePhotoStepDraft(step: Partial<CloseoutDraft['beforePhotos']> | undefined, placeholderNote: string) {
  return {
    itemCount: step?.itemCount ?? 0,
    placeholderNote: step?.placeholderNote ?? placeholderNote,
    lastUpdatedAt: step?.lastUpdatedAt ?? null,
    permissionStatus: step?.permissionStatus ?? 'unknown',
    pendingUploads: step?.pendingUploads ?? [],
  };
}

function normalizeVoiceSummaryDraft(step: Partial<CloseoutDraft['voiceSummary']> | undefined) {
  return {
    recordingState: step?.recordingState ?? 'idle',
    microphonePermissionStatus: step?.microphonePermissionStatus ?? 'unknown',
    audioReference: {
      voiceNoteId: step?.audioReference?.voiceNoteId ?? null,
      localUri: step?.audioReference?.localUri ?? null,
      previewUrl: step?.audioReference?.previewUrl ?? null,
      fileName: step?.audioReference?.fileName ?? null,
      mimeType: step?.audioReference?.mimeType ?? null,
      storageBucket: step?.audioReference?.storageBucket ?? null,
      storagePath: step?.audioReference?.storagePath ?? null,
      durationSeconds: step?.audioReference?.durationSeconds ?? null,
      recordedAt: step?.audioReference?.recordedAt ?? null,
    },
    uploadStatus: step?.uploadStatus ?? 'idle',
    uploadErrorMessage: step?.uploadErrorMessage ?? null,
    transcriptDraftText: step?.transcriptDraftText ?? '',
    finalWorkSummary: step?.finalWorkSummary ?? '',
    transcriptionStatus: step?.transcriptionStatus ?? 'idle',
    canRetryTranscription: step?.canRetryTranscription ?? false,
    manualEntryAvailable: step?.manualEntryAvailable ?? true,
    usedManualEntry: step?.usedManualEntry ?? false,
    lastTranscriptionError: step?.lastTranscriptionError ?? null,
    lastReviewedAt: step?.lastReviewedAt ?? null,
  };
}

function normalizeDraft(draft: CloseoutDraft): CloseoutDraft {
  const beforePhotos = normalizePhotoStepDraft(
    draft.beforePhotos,
    'Before photos will attach here so the starting condition is easy to prove later.',
  );
  const afterPhotos = normalizePhotoStepDraft(
    draft.afterPhotos,
    'After photos will confirm the finished result before the invoice goes out.',
  );
  const voiceSummary = normalizeVoiceSummaryDraft(draft.voiceSummary);

  const beforeChanged =
    draft.beforePhotos.itemCount !== beforePhotos.itemCount ||
    draft.beforePhotos.placeholderNote !== beforePhotos.placeholderNote ||
    draft.beforePhotos.lastUpdatedAt !== beforePhotos.lastUpdatedAt ||
    draft.beforePhotos.permissionStatus !== beforePhotos.permissionStatus ||
    draft.beforePhotos.pendingUploads !== beforePhotos.pendingUploads;

  const afterChanged =
    draft.afterPhotos.itemCount !== afterPhotos.itemCount ||
    draft.afterPhotos.placeholderNote !== afterPhotos.placeholderNote ||
    draft.afterPhotos.lastUpdatedAt !== afterPhotos.lastUpdatedAt ||
    draft.afterPhotos.permissionStatus !== afterPhotos.permissionStatus ||
    draft.afterPhotos.pendingUploads !== afterPhotos.pendingUploads;

  const voiceChanged =
    draft.voiceSummary.recordingState !== voiceSummary.recordingState ||
    draft.voiceSummary.microphonePermissionStatus !== voiceSummary.microphonePermissionStatus ||
    draft.voiceSummary.audioReference.voiceNoteId !== voiceSummary.audioReference.voiceNoteId ||
    draft.voiceSummary.audioReference.localUri !== voiceSummary.audioReference.localUri ||
    draft.voiceSummary.audioReference.previewUrl !== voiceSummary.audioReference.previewUrl ||
    draft.voiceSummary.audioReference.fileName !== voiceSummary.audioReference.fileName ||
    draft.voiceSummary.audioReference.mimeType !== voiceSummary.audioReference.mimeType ||
    draft.voiceSummary.audioReference.storageBucket !== voiceSummary.audioReference.storageBucket ||
    draft.voiceSummary.audioReference.storagePath !== voiceSummary.audioReference.storagePath ||
    draft.voiceSummary.audioReference.durationSeconds !== voiceSummary.audioReference.durationSeconds ||
    draft.voiceSummary.audioReference.recordedAt !== voiceSummary.audioReference.recordedAt ||
    draft.voiceSummary.uploadStatus !== voiceSummary.uploadStatus ||
    draft.voiceSummary.uploadErrorMessage !== voiceSummary.uploadErrorMessage ||
    draft.voiceSummary.transcriptDraftText !== voiceSummary.transcriptDraftText ||
    draft.voiceSummary.finalWorkSummary !== voiceSummary.finalWorkSummary ||
    draft.voiceSummary.transcriptionStatus !== voiceSummary.transcriptionStatus ||
    draft.voiceSummary.canRetryTranscription !== voiceSummary.canRetryTranscription ||
    draft.voiceSummary.manualEntryAvailable !== voiceSummary.manualEntryAvailable ||
    draft.voiceSummary.usedManualEntry !== voiceSummary.usedManualEntry ||
    draft.voiceSummary.lastTranscriptionError !== voiceSummary.lastTranscriptionError ||
    draft.voiceSummary.lastReviewedAt !== voiceSummary.lastReviewedAt;

  if (!beforeChanged && !afterChanged && !voiceChanged) {
    return draft;
  }

  return {
    ...draft,
    beforePhotos,
    voiceSummary,
    afterPhotos,
  };
}

type CloseoutDraftState = {
  hydrated: boolean;
  drafts: Record<string, CloseoutDraft>;
  setHydrated: (value: boolean) => void;
  ensureDraft: (seed: CloseoutDraftSeed) => void;
  updateVoiceSummary: (jobId: string, updates: Partial<CloseoutVoiceSummaryDraft>) => void;
  syncVoiceSummaryAudioReference: (jobId: string, audioReference: CloseoutAudioReference) => void;
  setPhotoPermission: (jobId: string, step: CloseoutPhotoStepKey, permissionStatus: 'unknown' | 'granted' | 'denied') => void;
  enqueuePendingUploads: (jobId: string, step: CloseoutPhotoStepKey, uploads: CloseoutPendingPhotoUpload[]) => void;
  updatePendingUpload: (
    jobId: string,
    step: CloseoutPhotoStepKey,
    localId: string,
    updates: Partial<CloseoutPendingPhotoUpload>,
  ) => void;
  removePendingUpload: (jobId: string, step: CloseoutPhotoStepKey, localId: string) => void;
  syncPhotoItemCount: (jobId: string, step: CloseoutPhotoStepKey, itemCount: number) => void;
  syncChargesFromJob: (
    jobId: string,
    values: {
      laborAmountCents: number;
      partsAmountCents: number;
      taxAmountCents: number;
      totalAmountCents: number;
    },
  ) => void;
  clearDraft: (jobId: string) => void;
};

export const useCloseoutDraftStore = create<CloseoutDraftState>()(
  persist(
    (set) => ({
      hydrated: false,
      drafts: {},
      setHydrated: (value) => set({ hydrated: value }),
      ensureDraft: (seed) =>
        set((state) => {
          const existing = state.drafts[seed.jobId];

          if (existing) {
            const normalized = normalizeDraft(existing);
            const sendRecipientLabel = seed.customerName;

            if (
              normalized.jobTitle === seed.jobTitle &&
              normalized.customerName === seed.customerName &&
              normalized.send.recipientLabel === sendRecipientLabel
            ) {
              if (normalized === existing) {
                return state;
              }

              return {
                drafts: {
                  ...state.drafts,
                  [seed.jobId]: normalized,
                },
              };
            }

            return {
              drafts: {
                ...state.drafts,
                [seed.jobId]: {
                  ...normalized,
                  jobTitle: seed.jobTitle,
                  customerName: seed.customerName,
                  send: {
                    ...normalized.send,
                    recipientLabel: sendRecipientLabel,
                  },
                },
              },
            };
          }

          return {
            drafts: {
              ...state.drafts,
              [seed.jobId]: createCloseoutDraft(seed),
            },
          };
        }),
      updateVoiceSummary: (jobId, updates) =>
        set((state) => {
          const current = state.drafts[jobId];
          const draft = current ? normalizeDraft(current) : null;
          if (!draft) {
            return state;
          }

          const nextVoiceSummary = {
            ...draft.voiceSummary,
            ...updates,
          };

          const didChange =
            draft.voiceSummary.recordingState !== nextVoiceSummary.recordingState ||
            draft.voiceSummary.microphonePermissionStatus !== nextVoiceSummary.microphonePermissionStatus ||
            draft.voiceSummary.audioReference !== nextVoiceSummary.audioReference ||
            draft.voiceSummary.uploadStatus !== nextVoiceSummary.uploadStatus ||
            draft.voiceSummary.uploadErrorMessage !== nextVoiceSummary.uploadErrorMessage ||
            draft.voiceSummary.transcriptDraftText !== nextVoiceSummary.transcriptDraftText ||
            draft.voiceSummary.finalWorkSummary !== nextVoiceSummary.finalWorkSummary ||
            draft.voiceSummary.transcriptionStatus !== nextVoiceSummary.transcriptionStatus ||
            draft.voiceSummary.canRetryTranscription !== nextVoiceSummary.canRetryTranscription ||
            draft.voiceSummary.manualEntryAvailable !== nextVoiceSummary.manualEntryAvailable ||
            draft.voiceSummary.usedManualEntry !== nextVoiceSummary.usedManualEntry ||
            draft.voiceSummary.lastTranscriptionError !== nextVoiceSummary.lastTranscriptionError ||
            draft.voiceSummary.lastReviewedAt !== nextVoiceSummary.lastReviewedAt;

          if (!didChange) {
            return state;
          }

          return {
            drafts: {
              ...state.drafts,
              [jobId]: {
                ...draft,
                updatedAt: new Date().toISOString(),
                voiceSummary: nextVoiceSummary,
              },
            },
          };
        }),
      syncVoiceSummaryAudioReference: (jobId, audioReference) =>
        set((state) => {
          const current = state.drafts[jobId];
          const draft = current ? normalizeDraft(current) : null;
          if (!draft) {
            return state;
          }

          const existing = draft.voiceSummary.audioReference;
          const unchanged =
            existing.voiceNoteId === audioReference.voiceNoteId &&
            existing.localUri === audioReference.localUri &&
            existing.previewUrl === audioReference.previewUrl &&
            existing.fileName === audioReference.fileName &&
            existing.mimeType === audioReference.mimeType &&
            existing.storageBucket === audioReference.storageBucket &&
            existing.storagePath === audioReference.storagePath &&
            existing.durationSeconds === audioReference.durationSeconds &&
            existing.recordedAt === audioReference.recordedAt;

          if (unchanged) {
            return state;
          }

          return {
            drafts: {
              ...state.drafts,
              [jobId]: {
                ...draft,
                updatedAt: new Date().toISOString(),
                voiceSummary: {
                  ...draft.voiceSummary,
                  audioReference,
                },
              },
            },
          };
        }),
      setPhotoPermission: (jobId, step, permissionStatus) =>
        set((state) => {
          const current = state.drafts[jobId];
          const draft = current ? normalizeDraft(current) : null;
          if (!draft || draft[step].permissionStatus === permissionStatus) {
            return state;
          }

          return {
            drafts: {
              ...state.drafts,
              [jobId]: {
                ...draft,
                updatedAt: new Date().toISOString(),
                [step]: {
                  ...draft[step],
                  permissionStatus,
                },
              },
            },
          };
        }),
      enqueuePendingUploads: (jobId, step, uploads) =>
        set((state) => {
          const current = state.drafts[jobId];
          const draft = current ? normalizeDraft(current) : null;
          if (!draft || uploads.length === 0) {
            return state;
          }

          return {
            drafts: {
              ...state.drafts,
              [jobId]: {
                ...draft,
                updatedAt: new Date().toISOString(),
                [step]: {
                  ...draft[step],
                  pendingUploads: [...draft[step].pendingUploads, ...uploads],
                  lastUpdatedAt: new Date().toISOString(),
                },
              },
            },
          };
        }),
      updatePendingUpload: (jobId, step, localId, updates) =>
        set((state) => {
          const current = state.drafts[jobId];
          const draft = current ? normalizeDraft(current) : null;
          if (!draft) {
            return state;
          }

          const currentUpload = draft[step].pendingUploads.find((upload) => upload.localId === localId);
          if (!currentUpload) {
            return state;
          }

          const nextUploads = draft[step].pendingUploads.map((upload) =>
            upload.localId === localId
              ? {
                  ...upload,
                  ...updates,
                }
              : upload,
          );

          return {
            drafts: {
              ...state.drafts,
              [jobId]: {
                ...draft,
                updatedAt: new Date().toISOString(),
                [step]: {
                  ...draft[step],
                  pendingUploads: nextUploads,
                  lastUpdatedAt: new Date().toISOString(),
                },
              },
            },
          };
        }),
      removePendingUpload: (jobId, step, localId) =>
        set((state) => {
          const current = state.drafts[jobId];
          const draft = current ? normalizeDraft(current) : null;
          if (!draft) {
            return state;
          }

          const nextUploads = draft[step].pendingUploads.filter((upload) => upload.localId !== localId);
          if (nextUploads.length === draft[step].pendingUploads.length) {
            return state;
          }

          return {
            drafts: {
              ...state.drafts,
              [jobId]: {
                ...draft,
                updatedAt: new Date().toISOString(),
                [step]: {
                  ...draft[step],
                  pendingUploads: nextUploads,
                  lastUpdatedAt: new Date().toISOString(),
                },
              },
            },
          };
        }),
      syncPhotoItemCount: (jobId, step, itemCount) =>
        set((state) => {
          const current = state.drafts[jobId];
          const draft = current ? normalizeDraft(current) : null;
          if (!draft || draft[step].itemCount === itemCount) {
            return state;
          }

          return {
            drafts: {
              ...state.drafts,
              [jobId]: {
                ...draft,
                updatedAt: new Date().toISOString(),
                [step]: {
                  ...draft[step],
                  itemCount,
                },
              },
            },
          };
        }),
      syncChargesFromJob: (jobId, values) =>
        set((state) => {
          const current = state.drafts[jobId];
          const draft = current ? normalizeDraft(current) : null;
          if (!draft) {
            return state;
          }

          const laborAmount = (values.laborAmountCents / 100).toFixed(2);
          const partsAmount = (values.partsAmountCents / 100).toFixed(2);
          const taxAmount = (values.taxAmountCents / 100).toFixed(2);
          const totalAmount = (values.totalAmountCents / 100).toFixed(2);

          if (
            draft.charges.laborAmount === laborAmount &&
            draft.charges.partsAmount === partsAmount &&
            draft.charges.taxAmount === taxAmount &&
            draft.charges.totalAmount === totalAmount
          ) {
            return state;
          }

          return {
            drafts: {
              ...state.drafts,
              [jobId]: {
                ...draft,
                updatedAt: new Date().toISOString(),
                charges: {
                  ...draft.charges,
                  laborAmount,
                  partsAmount,
                  taxAmount,
                  totalAmount,
                },
              },
            },
          };
        }),
      clearDraft: (jobId) =>
        set((state) => {
          const nextDrafts = { ...state.drafts };
          delete nextDrafts[jobId];
          return { drafts: nextDrafts };
        }),
    }),
    {
      name: 'closeout-draft-store',
      storage: createJSONStorage(() => closeoutStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
        }
      },
      partialize: (state) => ({ drafts: state.drafts }),
    },
  ),
);
