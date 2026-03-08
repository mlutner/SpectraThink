import { create } from "zustand";

interface EditorState {
  activeEntryId: string | null;
  draftContent: string;
  isDirty: boolean;
  charCount: number;
  setActiveEntry: (id: string | null) => void;
  setDraftContent: (content: string) => void;
  setDirty: (dirty: boolean) => void;
  reset: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  activeEntryId: null,
  draftContent: "",
  isDirty: false,
  charCount: 0,
  setActiveEntry: (id) => set({ activeEntryId: id }),
  setDraftContent: (content) => {
    const text = content.replace(/<[^>]*>/g, "").trim();
    set({ draftContent: content, isDirty: true, charCount: text.length });
  },
  setDirty: (dirty) => set({ isDirty: dirty }),
  reset: () =>
    set({
      activeEntryId: null,
      draftContent: "",
      isDirty: false,
      charCount: 0,
    }),
}));
