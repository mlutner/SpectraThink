import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { FileText, Search, User, LogOut } from "lucide-react";
import { useClerk } from "@clerk/react";
import { useUiStore } from "@/stores/ui-store";
import { navigateSpring, reactSpring } from "@/lib/spectra-motion";

const NAV_ITEMS = [
  { icon: FileText, label: "Entries", path: "/entries" },
  { icon: Search, label: "Search", action: "command-palette" as const },
  { icon: User, label: "Profile", path: "/profile" },
] as const;

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useClerk();
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const setCommandPaletteOpen = useUiStore((s) => s.setCommandPaletteOpen);

  function handleNavClick(item: (typeof NAV_ITEMS)[number]) {
    if ("action" in item && item.action === "command-palette") {
      setCommandPaletteOpen(true);
    } else if ("path" in item) {
      navigate(item.path);
    }
  }

  return (
    <motion.aside
      className="relative z-20 flex h-full flex-col border-r border-[var(--border)] bg-[var(--surface)]"
      animate={{ width: sidebarOpen ? 220 : 52 }}
      transition={navigateSpring}
    >
      {/* Logo */}
      <button
        onClick={toggleSidebar}
        className="flex h-14 w-full items-center justify-center border-b border-[var(--border)] hover:bg-[var(--surface2)] transition-none"
        aria-label="Toggle sidebar"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2L22 20H2L12 2Z"
            stroke="url(#spectral)"
            strokeWidth="1.5"
            fill="none"
          />
          <defs>
            <linearGradient id="spectral" x1="2" y1="20" x2="22" y2="2">
              <stop offset="0%" stopColor="var(--amber)" />
              <stop offset="50%" stopColor="var(--violet)" />
              <stop offset="100%" stopColor="var(--blue)" />
            </linearGradient>
          </defs>
        </svg>
      </button>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 p-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            "path" in item && location.pathname.startsWith(item.path);
          const Icon = item.icon;

          return (
            <motion.button
              key={item.label}
              onClick={() => handleNavClick(item)}
              className={`flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium ${
                isActive
                  ? "bg-[var(--surface2)] text-[var(--white)]"
                  : "text-[var(--text)] hover:bg-[var(--surface2)] hover:text-[var(--text-strong)]"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={reactSpring}
            >
              <Icon size={18} strokeWidth={1.5} className="shrink-0" />
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="truncate"
                >
                  {item.label}
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="border-t border-[var(--border)] p-2">
        <motion.button
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-[var(--text)] hover:bg-[var(--surface2)] hover:text-[var(--rose)]"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={reactSpring}
        >
          <LogOut size={18} strokeWidth={1.5} className="shrink-0" />
          {sidebarOpen && <span className="truncate">Sign out</span>}
        </motion.button>
      </div>
    </motion.aside>
  );
}
