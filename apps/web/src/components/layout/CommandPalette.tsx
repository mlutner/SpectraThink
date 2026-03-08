import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { FileText, Plus, User, Search } from "lucide-react";
import { useState } from "react";
import { useUiStore } from "@/stores/ui-store";
import { useEntries, useCreateEntry } from "@/hooks/useEntries";
import { navigateSpring } from "@/lib/spectra-motion";

export function CommandPalette() {
  const open = useUiStore((s) => s.commandPaletteOpen);
  const setOpen = useUiStore((s) => s.setCommandPaletteOpen);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { data: entries } = useEntries();
  const createEntry = useCreateEntry();

  // ⌘K to toggle
  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [open, setOpen]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, [setOpen]);

  async function handleNewEntry() {
    close();
    const entry = await createEntry.mutateAsync("");
    navigate(`/entry/${entry.id}`);
  }

  function handleGoToEntries() {
    close();
    navigate("/entries");
  }

  function handleGoToEntry(id: string) {
    close();
    navigate(`/entry/${id}`);
  }

  // Filter entries by query
  const filteredEntries = (entries ?? []).filter((e) =>
    e.title.toLowerCase().includes(query.toLowerCase())
  );

  const commands = [
    {
      id: "new-entry",
      icon: Plus,
      label: "New Entry",
      onSelect: handleNewEntry,
    },
    {
      id: "entries",
      icon: FileText,
      label: "Go to Entries",
      onSelect: handleGoToEntries,
    },
    {
      id: "profile",
      icon: User,
      label: "Go to Profile",
      onSelect: () => {
        close();
        navigate("/profile");
      },
    },
  ];

  const filteredCommands = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />

          {/* Palette */}
          <motion.div
            className="fixed inset-x-0 top-[20%] z-50 mx-auto w-full max-w-[520px] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border2)] bg-[var(--surface)] shadow-2xl"
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={navigateSpring}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3">
              <Search
                size={16}
                strokeWidth={1.5}
                className="text-[var(--lavender)]"
              />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent text-sm text-[var(--white)] placeholder-[var(--text)] outline-none"
              />
              <kbd className="rounded border border-[var(--border2)] px-1.5 py-0.5 font-[var(--font-mono)] text-[10px] text-[var(--text)]">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[320px] overflow-y-auto p-2">
              {/* Commands */}
              {filteredCommands.length > 0 && (
                <div className="mb-2">
                  <div className="px-2 py-1.5 font-[var(--font-mono)] text-[10px] uppercase tracking-wider text-[var(--text)]">
                    Commands
                  </div>
                  {filteredCommands.map((cmd) => (
                    <button
                      key={cmd.id}
                      onClick={cmd.onSelect}
                      className="flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--text-strong)] hover:bg-[var(--surface2)]"
                    >
                      <cmd.icon size={16} strokeWidth={1.5} />
                      {cmd.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Entries */}
              {query && filteredEntries.length > 0 && (
                <div>
                  <div className="px-2 py-1.5 font-[var(--font-mono)] text-[10px] uppercase tracking-wider text-[var(--text)]">
                    Entries
                  </div>
                  {filteredEntries.slice(0, 5).map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => handleGoToEntry(entry.id)}
                      className="flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--text-strong)] hover:bg-[var(--surface2)]"
                    >
                      <FileText size={16} strokeWidth={1.5} />
                      <span className="truncate">{entry.title}</span>
                    </button>
                  ))}
                </div>
              )}

              {query && filteredCommands.length === 0 && filteredEntries.length === 0 && (
                <div className="py-8 text-center text-sm text-[var(--text)]">
                  No results found
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
