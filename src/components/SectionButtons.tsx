import React from 'react';
import { motion } from 'framer-motion';
import { buttonHoverAnimation } from '../config/animations';
import { useTranslationWithFallback } from '../hooks/useTranslationWithFallback';

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
  prevLabel,
  nextLabel,
  prevColor = 'gray',
  nextColor = 'blue',
}) => {
  const { t } = useTranslationWithFallback();
  const prevColorClass = `bg-${prevColor}-600 hover:bg-${prevColor}-700`;
  const nextColorClass = `bg-${nextColor}-600 hover:bg-${nextColor}-700 hover:shadow-${nextColor}-500/30`;

  return (
    <div className="flex justify-between mt-4 sm:mt-6">
      {onPrev && (
        <motion.button
          type="button"
          onClick={onPrev}
          disabled={isSubmitting}
          whileHover={buttonHoverAnimation}
          className={`px-4 sm:px-6 py-1.5 sm:py-2 ${prevColorClass} text-white rounded-md transition-colors disabled:opacity-50 text-sm sm:text-base`}
        >
          {prevLabel || t('common.back', 'Previous')}
        </motion.button>
      )}
      {onNext && (
        <motion.button
          type="button"
          onClick={onNext}
          disabled={isSubmitting}
          whileHover={buttonHoverAnimation}
          className={`px-4 sm:px-6 py-1.5 sm:py-2 ${nextColorClass} text-white rounded-md transition-colors shadow-lg ml-auto disabled:opacity-50 text-sm sm:text-base`}
        >
          {nextLabel || t('common.next', 'Next')}
        </motion.button>
      )}
    </div>
  );
};

export default SectionButtons;
