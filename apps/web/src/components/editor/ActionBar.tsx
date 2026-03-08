import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Trash2, Save } from "lucide-react";
import { useDeleteEntry } from "@/hooks/useEntries";
import { MirrorThreshold } from "./MirrorThreshold";
import { reactSpring } from "@/lib/spectra-motion";

interface Props {
  entryId: string;
  onSave: () => void;
  isSaving: boolean;
}

export function ActionBar({ entryId, onSave, isSaving }: Props) {
  const navigate = useNavigate();
  const deleteEntry = useDeleteEntry();

  async function handleDelete() {
    await deleteEntry.mutateAsync(entryId);
    navigate("/entries");
  }

  return (
    <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-3">
      {/* Left: back + save */}
      <div className="flex items-center gap-2">
        <motion.button
          onClick={() => navigate("/entries")}
          className="flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-1.5 text-sm text-[var(--text)] hover:bg-[var(--surface2)] hover:text-[var(--text-strong)]"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={reactSpring}
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Back
        </motion.button>

        <motion.button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-1.5 text-sm text-[var(--text)] hover:bg-[var(--surface2)] hover:text-[var(--text-strong)] disabled:opacity-50"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={reactSpring}
        >
          <Save size={14} strokeWidth={1.5} />
          {isSaving ? "Saving..." : "Save"}
        </motion.button>
      </div>

      {/* Center: Mirror threshold */}
      <MirrorThreshold />

      {/* Right: delete */}
      <motion.button
        onClick={handleDelete}
        disabled={deleteEntry.isPending}
        className="flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-1.5 text-sm text-[var(--text)] hover:bg-[var(--surface2)] hover:text-[var(--rose)] disabled:opacity-50"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={reactSpring}
      >
        <Trash2 size={14} strokeWidth={1.5} />
        Delete
      </motion.button>
    </div>
  );
}
