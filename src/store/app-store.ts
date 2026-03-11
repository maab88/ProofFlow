import { create } from 'zustand';

type AppState = {
  hasCompletedSplash: boolean;
  completeSplash: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  hasCompletedSplash: false,
  completeSplash: () => set({ hasCompletedSplash: true }),
}));
