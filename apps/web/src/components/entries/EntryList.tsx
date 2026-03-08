import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { useEntries, useCreateEntry } from "@/hooks/useEntries";
import { EntryListItem } from "./EntryListItem";
import { EmptyState } from "./EmptyState";
import { reactSpring, staggerContainer, staggerItem } from "@/lib/spectra-motion";

export function EntryList() {
  const { data: entries, isLoading } = useEntries();
  const createEntry = useCreateEntry();
  const navigate = useNavigate();

  async function handleNewEntry() {
    const entry = await createEntry.mutateAsync("");
    navigate(`/entry/${entry.id}`);
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--border2)] border-t-[var(--lavender)]" />
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return <EmptyState onNewEntry={handleNewEntry} />;
  }

  return (
    <div className="mx-auto max-w-[var(--content-max-width)] px-8 py-10">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-[var(--font-mono)] text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--lavender)]">
          Entries
        </h1>
        <motion.button
          onClick={handleNewEntry}
          disabled={createEntry.isPending}
          className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--surface2)] px-3 py-1.5 text-sm text-[var(--text-strong)] hover:bg-[var(--surface3)]"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={reactSpring}
        >
          <Plus size={14} strokeWidth={1.5} />
          New Entry
        </motion.button>
      </div>

      {/* List */}
      <motion.div
        className="flex flex-col gap-2"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {entries.map((entry) => (
          <motion.div key={entry.id} variants={staggerItem}>
            <EntryListItem entry={entry} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
