import { motion } from "motion/react";
import type { Assumption } from "@spectra/shared";
import { revealSpring } from "@/lib/spectra-motion";

const domainColors: Record<string, string> = {
  epistemic: "var(--violet)",
  ethical: "var(--rose)",
  practical: "var(--amber)",
  ontological: "var(--blue)",
  methodological: "var(--teal)",
};

interface Props {
  assumption: Assumption;
  index: number;
}

export function AssumptionCard({ assumption, index }: Props) {
  const dotColor =
    domainColors[assumption.domain ?? ""] ?? "var(--lavender)";

  return (
    <motion.div
      className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...revealSpring, delay: 0.1 * (index + 1) }}
    >
      <div className="mb-1.5 flex items-center gap-2">
        <div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: dotColor }}
        />
        <span className="font-[var(--font-mono)] text-[10px] uppercase tracking-wider text-[var(--text)]">
          {assumption.domain ?? "unclassified"}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-[var(--text-strong)]">
        {assumption.text}
      </p>
    </motion.div>
  );
}
