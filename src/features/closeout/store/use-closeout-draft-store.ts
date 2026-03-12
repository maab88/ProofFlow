import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { closeoutStorage } from '@/features/closeout/lib/closeout-storage';
import {
  createCloseoutDraft,
  type CloseoutDraft,
  type CloseoutDraftSeed,
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

function normalizeDraft(draft: CloseoutDraft): CloseoutDraft {
  const beforePhotos = normalizePhotoStepDraft(
    draft.beforePhotos,
    'Before photos will attach here so the starting condition is easy to prove later.',
  );
  const afterPhotos = normalizePhotoStepDraft(
    draft.afterPhotos,
    'After photos will confirm the finished result before the invoice goes out.',
  );

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

  if (!beforeChanged && !afterChanged) {
    return draft;
  }

  return {
    ...draft,
    beforePhotos,
    afterPhotos,
  };
}

type CloseoutDraftState = {
  hydrated: boolean;
  drafts: Record<string, CloseoutDraft>;
  setHydrated: (value: boolean) => void;
  ensureDraft: (seed: CloseoutDraftSeed) => void;
  updateVoiceSummary: (jobId: string, updates: Partial<CloseoutVoiceSummaryDraft>) => void;
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

          return {
            drafts: {
              ...state.drafts,
              [jobId]: {
                ...draft,
                updatedAt: new Date().toISOString(),
                voiceSummary: {
                  ...draft.voiceSummary,
                  ...updates,
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
