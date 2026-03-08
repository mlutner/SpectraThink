/**
 * Spectra Motion Language
 * 
 * Three bespoke spring signatures that define how Spectra feels.
 * See Design Spec v1, Section 03 for full documentation.
 * 
 * Rules:
 * - Nothing bounces (high damping, 2-5% overshoot max)
 * - Nothing loops (no infinite animations)
 * - Content never moves after settling
 * - Exit animations are 1.5x faster than entries
 * - Use Motion for React (not CSS transitions) for all interactive elements
 */

import type { Transition } from "motion/react";

// ─── The Three Springs ──────────────────────────────────────────────────────

/**
 * REVEAL — The Mirror Moment
 * Slow, heavy, inevitable. Used for the Mirror panel sliding in,
 * assumption cards appearing, the avoided question materializing.
 * Feels: weighted arrival, like a heavy curtain drawing back.
 * Duration: ~600ms to settle.
 */
export const revealSpring: Transition = {
  type: "spring",
  stiffness: 120,
  damping: 28,
  mass: 1.2,
};

/**
 * NAVIGATE — Moving Between Views
 * Crisp but not harsh. Used for sidebar transitions, view switches,
 * entry list scrolling.
 * Feels: confident step, like turning a page.
 * Duration: ~300ms to settle.
 */
export const navigateSpring: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};

/**
 * REACT — Hover / Press / Micro
 * Subtle, immediate. Used for button presses, hover states,
 * toggle switches.
 * Feels: tactile response, like a light switch.
 * Duration: ~150ms to settle.
 */
export const reactSpring: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 30,
  mass: 0.5,
};

// ─── Convenience Object ─────────────────────────────────────────────────────

export const spectraSpring = {
  reveal: revealSpring,
  navigate: navigateSpring,
  react: reactSpring,
} as const;

// ─── Stagger Variants ───────────────────────────────────────────────────────

/** Stagger children for Mirror assumption cards (150ms intervals, 300ms initial delay) */
export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

/** Individual stagger item (fade + slide up) */
export const staggerItem = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: revealSpring,
  },
};

// ─── The Spectral Edge ──────────────────────────────────────────────────────

/** 2px vertical gradient line that precedes the Mirror panel */
export const spectralEdge = {
  initial: { opacity: 0, scaleY: 0 },
  animate: {
    opacity: 1,
    scaleY: 1,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    scaleY: 0,
    transition: { duration: 0.25, ease: "easeIn" as const },
  },
};

// ─── Exit Speed Multiplier ──────────────────────────────────────────────────

/** Exits are 1.5x faster — panels slide out decisively */
export const exitRevealSpring: Transition = {
  type: "spring",
  stiffness: 120 * 1.5,
  damping: 28 * 1.5,
  mass: 1.2 / 1.5,
};
