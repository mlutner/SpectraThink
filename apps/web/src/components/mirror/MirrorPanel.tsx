import { motion, AnimatePresence } from "motion/react";
import { X, Loader2 } from "lucide-react";
import { useEditorStore } from "@/stores/editor-store";
import { useMirrorStore } from "@/stores/mirror-store";
import { useMirror } from "@/hooks/useMirror";
import { SpectralEdge } from "./SpectralEdge";
import { AssumptionCard } from "./AssumptionCard";
import { revealSpring, reactSpring } from "@/lib/spectra-motion";

export function MirrorPanel() {
  const activeEntryId = useEditorStore((s) => s.activeEntryId);
  const isPanelOpen = useMirrorStore((s) => s.isPanelOpen);
  const isAnalyzing = useMirrorStore((s) => s.isAnalyzing);
  const closePanel = useMirrorStore((s) => s.closePanel);

  const { data: mirror, isLoading } = useMirror(
    isPanelOpen ? (activeEntryId ?? undefined) : undefined,
  );

  const showLoading = isAnalyzing || isLoading;

  return (
    <AnimatePresence>
      {isPanelOpen && (
        <motion.aside
          className="relative flex h-full w-[360px] min-w-[280px] max-w-[480px] flex-col border-l border-[var(--border)] bg-[var(--surface)]"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 360, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={revealSpring}
        >
          <SpectralEdge />

          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3">
            <h2 className="bg-gradient-to-r from-[var(--amber)] via-[var(--violet)] to-[var(--blue)] bg-clip-text text-sm font-medium text-transparent">
              Mirror Analysis
            </h2>
            <motion.button
              onClick={closePanel}
              className="rounded-[var(--radius-sm)] p-1 text-[var(--text)] hover:bg-[var(--surface2)] hover:text-[var(--text-strong)]"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={reactSpring}
            >
              <X size={14} strokeWidth={1.5} />
            </motion.button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-5">
            {showLoading && !mirror && (
              <div className="flex flex-col items-center justify-center gap-3 py-16">
                <Loader2
                  size={24}
                  strokeWidth={1.5}
                  className="animate-spin text-[var(--violet)]"
                />
                <p className="text-sm text-[var(--text)]">
                  Examining your thinking...
                </p>
              </div>
            )}

            {mirror && (
              <motion.div
                className="flex flex-col gap-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={revealSpring}
              >
                {/* Frame */}
                <section>
                  <h3 className="mb-2 font-[var(--font-mono)] text-[10px] uppercase tracking-wider text-[var(--text)]">
                    Your Frame
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--white)]">
                    {mirror.frame}
                  </p>
                </section>

                {/* Assumptions */}
                <section>
                  <h3 className="mb-3 font-[var(--font-mono)] text-[10px] uppercase tracking-wider text-[var(--text)]">
                    Hidden Assumptions
                  </h3>
                  <div className="flex flex-col gap-2">
                    {mirror.assumptions?.map((a, i) => (
                      <AssumptionCard key={a.id} assumption={a} index={i} />
                    ))}
                  </div>
                </section>

                {/* Avoided Question */}
                <section>
                  <h3 className="mb-2 font-[var(--font-mono)] text-[10px] uppercase tracking-wider text-[var(--text)]">
                    The Question You're Avoiding
                  </h3>
                  <div className="rounded-[var(--radius-md)] border border-[var(--border2)] bg-[var(--surface2)] px-4 py-3">
                    <p className="text-sm italic leading-relaxed text-[var(--text-strong)]">
                      {mirror.avoidedQuestion}
                    </p>
                  </div>
                </section>
              </motion.div>
            )}

            {!showLoading && !mirror && (
              <div className="flex flex-col items-center justify-center py-16">
                <p className="font-[var(--font-display)] text-lg italic text-[var(--text)] opacity-40">
                  No analysis yet
                </p>
              </div>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
