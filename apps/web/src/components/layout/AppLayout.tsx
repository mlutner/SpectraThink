import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { CommandPalette } from "./CommandPalette";
import { useFocusMode } from "@/hooks/useFocusMode";

export function AppLayout() {
  useFocusMode();

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <CommandPalette />
    </div>
  );
}
