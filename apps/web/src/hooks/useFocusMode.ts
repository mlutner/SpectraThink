import { useEffect, useRef } from "react";
import { useUiStore } from "@/stores/ui-store";

/**
 * Focus mode: sidebar auto-collapses when typing, returns on mouse-to-left-edge.
 */
export function useFocusMode() {
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      // Only collapse for actual content keys, not modifiers
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.length !== 1 && e.key !== "Backspace" && e.key !== "Enter")
        return;

      if (!isTypingRef.current) {
        isTypingRef.current = true;
        setSidebarOpen(false);
      }

      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        isTypingRef.current = false;
      }, 2000);
    }

    function handleMousemove(e: MouseEvent) {
      if (e.clientX < 60 && !isTypingRef.current) {
        setSidebarOpen(true);
      }
    }

    document.addEventListener("keydown", handleKeydown);
    document.addEventListener("mousemove", handleMousemove);

    return () => {
      document.removeEventListener("keydown", handleKeydown);
      document.removeEventListener("mousemove", handleMousemove);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [setSidebarOpen]);
}
