import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SavedJobsState {
  savedIds: string[];
  toggle: (jobId: string) => void;
  isSaved: (jobId: string) => boolean;
  clearAll: () => void;
}

export const useSavedJobsStore = create<SavedJobsState>()(
  persist(
    (set, get) => ({
      savedIds: [],

      toggle: (jobId) =>
        set((state) => ({
          savedIds: state.savedIds.includes(jobId)
            ? state.savedIds.filter((id) => id !== jobId)
            : [...state.savedIds, jobId],
        })),

      isSaved: (jobId) => get().savedIds.includes(jobId),

      clearAll: () => set({ savedIds: [] }),
    }),
    { name: 'devhire-saved-jobs' },
  ),
);