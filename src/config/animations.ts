import type { Variants } from 'framer-motion';

export const formVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -40 },
};

export const sectionVariants: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 30 },
};

export const successVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};

export const errorVariants: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
};

export const progressBarVariants: Variants = {
  hidden: { width: 0 },
  visible: { width: '100%' },
};

export const transition = {
  duration: 0.4,
  ease: [0.43, 0.13, 0.23, 0.96], // Custom easing for smoother feel
};

// Standard success animation styles for consistent look across forms
export const successAnimationStyles = {
  container:
    'max-w-2xl mx-auto bg-green-500/20 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-green-300/30 text-white mt-6',
  icon: {
    wrapper:
      'w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4',
    color: 'text-white',
  },
  title: 'text-3xl font-bold text-white mb-2 text-center',
  message: 'text-white/80 mb-6 text-center',
  progressBar: {
    container: 'w-full bg-white/20 rounded-full h-2 overflow-hidden',
    indicator: 'bg-green-500 h-2 rounded-full',
  },
  subtitle: 'text-center mt-4 text-white/70',
  idContainer: 'mt-4 p-3 bg-white/10 rounded-lg',
  idTitle: 'text-center font-medium',
  idValue: 'text-center text-xl font-bold',
  idNote: 'text-center text-sm mt-2',
};

export const modalVariants: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.95 },
};

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  hover: { y: -5, scale: 1.03 },
};

export const listItemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

// Correctly defined page transition with proper type
export const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// Correctly defined button hover animation
export const buttonHoverAnimation = {
  scale: 1.05,
};

// Define animation configs as objects rather than Variants
export const customAnimationConfig = {
  spring: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 20,
  },
  delayedAppearance: (delay: number) => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { delay, duration: 0.5 },
    },
  }),
};
