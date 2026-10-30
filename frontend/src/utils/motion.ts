import { Variants } from 'framer-motion';

/**
 * AegisHealth AI Motion Design System
 * Standardized timing, easing, and micro-interactions.
 * Consistent across dashboards, cards, dialogs, drawers, and routes.
 */

// Timing tokens (in seconds)
export const MOTION_TIMING = {
  micro: 0.16,      // 160ms: hover, tap, icon rotations
  button: 0.2,      // 200ms: buttons, chips, pill toggles
  card: 0.28,       // 280ms: cards, list items, alert banners
  modal: 0.32,      // 320ms: modals, popovers, drawers
  page: 0.35,       // 350ms: route and tab transitions
  hero: 0.65,       // 650ms: landing hero reveals
};

// Easing cubic-bezier curves
export const MOTION_EASING = {
  easeOutQuart: [0.16, 1, 0.3, 1],    // Default entrance curve (snappy and premium)
  easeInOutQuart: [0.76, 0, 0.24, 1], // Smooth reversible transitions
  bounceSubtle: [0.34, 1.56, 0.64, 1],// Micro-spring without excessive shaking
};

/**
 * Route & Page Transitions
 */
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 10,
    filter: 'blur(3px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: MOTION_TIMING.page,
      ease: MOTION_EASING.easeOutQuart,
      staggerChildren: 0.08,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: 'blur(2px)',
    transition: {
      duration: MOTION_TIMING.button,
      ease: [0.4, 0, 1, 1],
    },
  },
};

/**
 * Staggered Container for Dashboard grids & lists
 */
export const containerStaggerVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

/**
 * Card & Section Entrance
 */
export const cardEntranceVariants: Variants = {
  initial: {
    opacity: 0,
    y: 14,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_TIMING.card,
      ease: MOTION_EASING.easeOutQuart,
    },
  },
};

/**
 * Modal & Overlay Variants
 */
export const modalBackdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: MOTION_TIMING.button },
  },
  exit: {
    opacity: 0,
    transition: { duration: MOTION_TIMING.micro },
  },
};

export const modalDialogVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.96,
    y: 12,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: MOTION_TIMING.modal,
      ease: MOTION_EASING.easeOutQuart,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 8,
    transition: {
      duration: MOTION_TIMING.button,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

/**
 * Drawer slide-in from right
 */
export const drawerVariants: Variants = {
  initial: {
    x: '100%',
    opacity: 0.5,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: MOTION_TIMING.modal,
      ease: MOTION_EASING.easeOutQuart,
    },
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: {
      duration: MOTION_TIMING.card,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

/**
 * Tab Content Transition
 */
export const tabContentVariants: Variants = {
  initial: {
    opacity: 0,
    y: 6,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_TIMING.card,
      ease: MOTION_EASING.easeOutQuart,
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: {
      duration: MOTION_TIMING.micro,
    },
  },
};

/**
 * Micro-Interaction Hover & Tap Configurations
 */
export const buttonMotionProps = {
  whileHover: { scale: 1.015 },
  whileTap: { scale: 0.98 },
  transition: { duration: MOTION_TIMING.micro },
};

export const cardHoverMotionProps = {
  whileHover: { y: -3, transition: { duration: MOTION_TIMING.button, ease: MOTION_EASING.easeOutQuart } },
};

/**
 * Check if the user has requested reduced motion
 */
export const getPrefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

