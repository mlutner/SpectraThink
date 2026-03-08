import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useEntry } from "@/hooks/useEntries";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useEditorStore } from "@/stores/editor-store";
import { EntryEditor } from "@/components/editor/EntryEditor";
import { ActionBar } from "@/components/editor/ActionBar";
import { loadDraft } from "@/lib/local-storage";
import { revealSpring } from "@/lib/spectra-motion";

export function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: entry, isLoading, error } = useEntry(id);
  const { save, isSaving } = useAutoSave(id);
  const setActiveEntry = useEditorStore((s) => s.setActiveEntry);
  const setDraftContent = useEditorStore((s) => s.setDraftContent);
  const setDirty = useEditorStore((s) => s.setDirty);
  const reset = useEditorStore((s) => s.reset);

  // Set active entry and load draft
  useEffect(() => {
    if (!id) return;
    setActiveEntry(id);

    async function restoreDraft() {
      const draft = await loadDraft(id!);
      if (draft) {
        setDraftContent(draft.content);
        setDirty(true);
      }
    }
    restoreDraft();

    return () => {
      reset();
    };
  }, [id, setActiveEntry, setDraftContent, setDirty, reset]);

  if (error) {
    navigate("/entries");
    return null;
  }

  if (isLoading || !entry) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--border2)] border-t-[var(--lavender)]" />
      </div>
    );
  }

  return (
    <motion.div
      className="flex h-full flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={revealSpring}
    >
      <ActionBar entryId={entry.id} onSave={save} isSaving={isSaving} />
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <EntryEditor initialContent={entry.content} />
      </div>
    </motion.div>
  );
}
