import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { closeoutStorage } from '@/features/closeout/lib/closeout-storage';
import { createCloseoutDraft, type CloseoutDraft, type CloseoutDraftSeed, type CloseoutStepId, type CloseoutVoiceSummaryDraft } from '@/features/closeout/lib/closeout-types';

type CloseoutDraftState = {
  hydrated: boolean;
  drafts: Record<string, CloseoutDraft>;
  setHydrated: (value: boolean) => void;
  ensureDraft: (seed: CloseoutDraftSeed) => void;
  setCurrentStep: (jobId: string, stepId: CloseoutStepId) => void;
  updateVoiceSummary: (jobId: string, updates: Partial<CloseoutVoiceSummaryDraft>) => void;
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
            const sendRecipientLabel = seed.customerName;

            if (
              existing.jobTitle === seed.jobTitle &&
              existing.customerName === seed.customerName &&
              existing.send.recipientLabel === sendRecipientLabel
            ) {
              return state;
            }

            return {
              drafts: {
                ...state.drafts,
                [seed.jobId]: {
                  ...existing,
                  jobTitle: seed.jobTitle,
                  customerName: seed.customerName,
                  send: {
                    ...existing.send,
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
      setCurrentStep: (jobId, stepId) =>
        set((state) => {
          const draft = state.drafts[jobId];
          if (!draft || draft.currentStep === stepId) {
            return state;
          }

          return {
            drafts: {
              ...state.drafts,
              [jobId]: {
                ...draft,
                currentStep: stepId,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        }),
      updateVoiceSummary: (jobId, updates) =>
        set((state) => {
          const draft = state.drafts[jobId];
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
      syncChargesFromJob: (jobId, values) =>
        set((state) => {
          const draft = state.drafts[jobId];
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
