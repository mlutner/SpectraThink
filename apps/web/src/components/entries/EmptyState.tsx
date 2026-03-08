import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { revealSpring, reactSpring } from "@/lib/spectra-motion";

interface Props {
  onNewEntry: () => void;
}

export function EmptyState({ onNewEntry }: Props) {
  return (
    <motion.div
      className="flex h-full flex-col items-center justify-center px-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={revealSpring}
    >
      <p className="max-w-[320px] text-center font-[var(--font-headline)] text-lg italic leading-relaxed text-[var(--text)] opacity-50">
        What are you thinking about today?
      </p>

      <motion.button
        onClick={onNewEntry}
        className="mt-8 flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border2)] bg-[var(--surface)] px-5 py-2.5 text-sm font-medium text-[var(--text-strong)] hover:bg-[var(--surface2)]"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={reactSpring}
      >
        <Plus size={16} strokeWidth={1.5} />
        Begin
      </motion.button>
    </motion.div>
  );
}
