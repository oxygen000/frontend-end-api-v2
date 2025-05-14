import React from 'react';
import { motion } from 'framer-motion';
import { buttonHoverAnimation } from '../config/animations';

interface SectionButtonsProps {
  onPrev?: () => void;
  onNext?: () => void;
  isSubmitting?: boolean;
  prevLabel?: string;
  nextLabel?: string;
  prevColor?: string;
  nextColor?: string;
}

/**
 * Reusable component for section navigation buttons in multi-step forms
 */
const SectionButtons: React.FC<SectionButtonsProps> = ({
  onPrev,
  onNext,
  isSubmitting = false,
  prevLabel = 'Previous',
  nextLabel = 'Next',
  prevColor = 'gray',
  nextColor = 'blue',
}) => {
  const prevColorClass = `bg-${prevColor}-600 hover:bg-${prevColor}-700`;
  const nextColorClass = `bg-${nextColor}-600 hover:bg-${nextColor}-700 hover:shadow-${nextColor}-500/30`;

  return (
    <div className="flex justify-between mt-6">
      {onPrev && (
        <motion.button
          type="button"
          onClick={onPrev}
          disabled={isSubmitting}
          whileHover={buttonHoverAnimation}
          className={`px-6 py-2 ${prevColorClass} text-white rounded-md transition-colors disabled:opacity-50`}
        >
          {prevLabel}
        </motion.button>
      )}
      {onNext && (
        <motion.button
          type="button"
          onClick={onNext}
          disabled={isSubmitting}
          whileHover={buttonHoverAnimation}
          className={`px-6 py-2 ${nextColorClass} text-white rounded-md transition-colors shadow-lg ml-auto disabled:opacity-50`}
        >
          {nextLabel}
        </motion.button>
      )}
    </div>
  );
};

export default SectionButtons;
