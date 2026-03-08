import { create } from "zustand";

interface MirrorState {
  isPanelOpen: boolean;
  isAnalyzing: boolean;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  setAnalyzing: (v: boolean) => void;
}

export const useMirrorStore = create<MirrorState>((set) => ({
  isPanelOpen: false,
  isAnalyzing: false,
  openPanel: () => set({ isPanelOpen: true }),
  closePanel: () => set({ isPanelOpen: false }),
  togglePanel: () => set((s) => ({ isPanelOpen: !s.isPanelOpen })),
  setAnalyzing: (v) => set({ isAnalyzing: v }),
}));
