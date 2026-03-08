import { motion } from "motion/react";
import { revealSpring } from "@/lib/spectra-motion";

/** 2px vertical gradient bar — Spectra's visual signature. */
export function SpectralEdge() {
  return (
    <motion.div
      className="absolute left-0 top-0 h-full w-[2px]"
      style={{
        background:
          "linear-gradient(to bottom, var(--amber), var(--violet), var(--blue))",
        transformOrigin: "top",
      }}
      initial={{ scaleY: 0 }}
      animate={{ scaleY: 1 }}
      transition={revealSpring}
    />
  );
}
