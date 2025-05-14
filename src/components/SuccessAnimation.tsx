import React from 'react';
import { motion } from 'framer-motion';
import {
  successVariants,
  successAnimationStyles,
  transition,
} from '../config/animations';
import { useTranslationWithFallback } from '../hooks/useTranslationWithFallback';

interface SuccessAnimationProps {
  title?: string;
  message?: string;
  subtitle?: string;
  id?: string | null;
  idLabel?: string;
  idNote?: string;
}

/**
 * A reusable success animation component for form submission
 * Uses consistent green styling across all forms
 */
const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
  title,
  message,
  subtitle,
  id = null,
  idLabel,
  idNote,
}) => {
  const { t, isRTL } = useTranslationWithFallback();

  // Use translations or fallback to props
  const translatedTitle =
    title || t('registration.success', 'Registration Successful!');
  const translatedMessage =
    message ||
    t(
      'successAnimation.message',
      'The information has been recorded successfully.'
    );
  const translatedSubtitle =
    subtitle ||
    t('successAnimation.subtitle', 'Starting new registration in a moment...');
  const translatedIdLabel =
    idLabel || t('registration.caseReferenceId', 'Registration ID:');
  const translatedIdNote =
    idNote ||
    t('successAnimation.idNote', 'Please save this ID for future reference');

  return (
    <motion.div
      variants={successVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={transition}
      className={successAnimationStyles.container}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <motion.div
        className={successAnimationStyles.icon.wrapper}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-10 w-10 ${successAnimationStyles.icon.color}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </motion.div>
      <h3 className={successAnimationStyles.title}>{translatedTitle}</h3>
      <p className={successAnimationStyles.message}>{translatedMessage}</p>
      <div className={successAnimationStyles.progressBar.container}>
        <motion.div
          className={successAnimationStyles.progressBar.indicator}
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 3, ease: 'linear' }}
        />
      </div>
      <p className={successAnimationStyles.subtitle}>{translatedSubtitle}</p>

      {id && (
        <div className={successAnimationStyles.idContainer}>
          <p className={successAnimationStyles.idTitle}>{translatedIdLabel}</p>
          <p className={successAnimationStyles.idValue}>{id}</p>
          <p className={successAnimationStyles.idNote}>{translatedIdNote}</p>
        </div>
      )}
    </motion.div>
  );
};

export default SuccessAnimation;
