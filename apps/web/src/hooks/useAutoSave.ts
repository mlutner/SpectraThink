import { useEffect, useRef, useCallback } from "react";
import { useUpdateEntry } from "./useEntries";
import { useEditorStore } from "@/stores/editor-store";
import { saveDraft, clearDraft } from "@/lib/local-storage";
import { toast } from "sonner";

const AUTO_SAVE_DELAY = 3000; // 3 seconds after last keystroke

export function useAutoSave(entryId: string | undefined) {
  const updateEntry = useUpdateEntry();
  const isDirty = useEditorStore((s) => s.isDirty);
  const draftContent = useEditorStore((s) => s.draftContent);
  const setDirty = useEditorStore((s) => s.setDirty);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const save = useCallback(async () => {
    if (!entryId || !isDirty) return;
    try {
      await updateEntry.mutateAsync({ id: entryId, data: { content: draftContent } });
      await clearDraft(entryId);
      setDirty(false);
      toast("Saved", { duration: 1500 });
    } catch {
      toast.error("Failed to save");
    }
  }, [entryId, isDirty, draftContent, updateEntry, setDirty]);

  // Debounced auto-save
  useEffect(() => {
    if (!isDirty || !entryId) return;

    // Save draft to IndexedDB immediately
    saveDraft(entryId, draftContent);

    // Debounce server sync
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(save, AUTO_SAVE_DELAY);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isDirty, draftContent, entryId, save]);

  return { save, isSaving: updateEntry.isPending };
}
