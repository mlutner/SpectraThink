import { motion, AnimatePresence } from "motion/react";
import { Eye, Loader2 } from "lucide-react";
import { useEditorStore } from "@/stores/editor-store";
import { useMirrorStore } from "@/stores/mirror-store";
import { useMirror, useTriggerMirror } from "@/hooks/useMirror";
import { reactSpring } from "@/lib/spectra-motion";

const MIRROR_THRESHOLD = 200;

export function MirrorThreshold() {
  const charCount = useEditorStore((s) => s.charCount);
  const activeEntryId = useEditorStore((s) => s.activeEntryId);
  const openPanel = useMirrorStore((s) => s.openPanel);
  const setAnalyzing = useMirrorStore((s) => s.setAnalyzing);

  const { data: existingMirror } = useMirror(activeEntryId ?? undefined);
  const triggerMirror = useTriggerMirror();

  const isReady = charCount >= MIRROR_THRESHOLD;
  const hasMirror = !!existingMirror;
  const progress = Math.min(charCount / MIRROR_THRESHOLD, 1);

  async function handleClick() {
    if (!activeEntryId) return;

    if (hasMirror) {
      // Already analyzed — just open the panel
      openPanel();
      return;
    }

    // Trigger new analysis
    setAnalyzing(true);
    openPanel();
    try {
      await triggerMirror.mutateAsync(activeEntryId);
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {/* Character progress */}
      <div className="flex items-center gap-2">
        <div className="h-1 w-16 overflow-hidden rounded-full bg-[var(--surface3)]">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: isReady ? "var(--violet)" : "var(--lavender)",
            }}
            animate={{ width: `${progress * 100}%` }}
            transition={reactSpring}
          />
        </div>
        <span className="font-[var(--font-mono)] text-[10px] text-[var(--text)]">
          {charCount}/{MIRROR_THRESHOLD}
        </span>
      </div>

      {/* Mirror button */}
      <AnimatePresence>
        {isReady && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={reactSpring}
            onClick={handleClick}
            disabled={triggerMirror.isPending}
            className="relative flex items-center gap-1.5 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border2)] bg-[var(--surface2)] px-3 py-1.5 text-sm text-[var(--violet)] hover:bg-[var(--surface3)] disabled:opacity-60"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {triggerMirror.isPending ? (
              <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />
            ) : (
              <Eye size={14} strokeWidth={1.5} />
            )}
            <span className="relative z-10 bg-gradient-to-r from-[var(--amber)] via-[var(--violet)] to-[var(--blue)] bg-clip-text font-medium text-transparent">
              {hasMirror ? "View Mirror" : "Mirror"}
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
