import type { Variants } from 'framer-motion';

export const formVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -40 },
};

export const sectionVariants: Variants = {
  hidden: { x: -30, opacity: 0 },
  visible: { x: 0, opacity: 1 },
  exit: { x: 30, opacity: 0 },
};

export const successVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
  exit: { scale: 0, opacity: 0 },
};

export const errorVariants: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const progressBarVariants: Variants = {
  hidden: { width: 0 },
  visible: { width: '100%' },
};

export const transition = {
  duration: 0.5,
  ease: 'easeInOut',
};
