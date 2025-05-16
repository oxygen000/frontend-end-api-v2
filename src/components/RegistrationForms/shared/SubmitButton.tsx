import React from 'react';
import { motion } from 'framer-motion';
import { useTranslationWithFallback } from '../../../hooks/useTranslationWithFallback';

interface SubmitButtonProps {
  isSubmitting: boolean;
  primaryColor?: string;
  className?: string;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  isSubmitting,
  primaryColor = 'orange',
  className = '',
}) => {
  const { t } = useTranslationWithFallback();

  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className={`
        px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold
        flex items-center justify-center
        transition-all duration-300 text-sm sm:text-base
        ${
          isSubmitting
            ? `bg-${primaryColor}-400 cursor-not-allowed`
            : `bg-${primaryColor}-600 hover:bg-${primaryColor}-700 shadow-lg hover:shadow-${primaryColor}-500/30`
        }
        text-white w-full sm:w-auto sm:min-w-[200px]
        relative overflow-hidden
        ${className}
      `}
    >
      {isSubmitting && (
        <motion.div
          className={`absolute inset-0 bg-${primaryColor}-500 opacity-30`}
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.5 }}
        />
      )}

      {isSubmitting ? (
        <div className="flex items-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12l2 2 4-4m6 2a9 9 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {t('registration.submitting', 'Processing...')}
        </div>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 sm:h-5 sm:w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {t('registration.submitRegistration')}
        </>
      )}
    </button>
  );
};

export default SubmitButton;
