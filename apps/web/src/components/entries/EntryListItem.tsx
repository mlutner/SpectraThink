import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { FileText, Zap, Eye } from "lucide-react";
import { reactSpring } from "@/lib/spectra-motion";
import type { EntryListItem as EntryListItemType } from "@spectra/shared/types";

interface Props {
  entry: EntryListItemType;
}

export function EntryListItem({ entry }: Props) {
  const navigate = useNavigate();

  const date = new Date(entry.createdAt);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <motion.button
      onClick={() => navigate(`/entry/${entry.id}`)}
      className="group flex w-full items-center gap-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5 text-left hover:border-[var(--border2)] hover:bg-[var(--surface2)]"
      whileHover={{ x: 2 }}
      transition={reactSpring}
    >
      {/* Icon */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--surface2)] text-[var(--lavender)] group-hover:bg-[var(--surface3)]">
        <FileText size={14} strokeWidth={1.5} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-[var(--white)]">
          {entry.title}
        </div>
        <div className="mt-0.5 flex items-center gap-3 font-[var(--font-mono)] text-[10px] text-[var(--text)]">
          <span>{formattedDate} {formattedTime}</span>
          <span>{entry.wordCount} words</span>
        </div>
      </div>

      {/* Status indicators */}
      <div className="flex items-center gap-1.5">
        {entry.hasMirror && (
          <div
            className="flex h-5 w-5 items-center justify-center rounded-full text-[var(--violet)]"
            title="Has Mirror analysis"
          >
            <Eye size={12} strokeWidth={1.5} />
          </div>
        )}
        {entry.hasSpar && (
          <div
            className="flex h-5 w-5 items-center justify-center rounded-full text-[var(--rose)]"
            title="Has Spar session"
          >
            <Zap size={12} strokeWidth={1.5} />
          </div>
        )}
      </div>
    </motion.button>
  );
}
