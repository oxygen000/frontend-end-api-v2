import React from 'react';

interface MissingTranslationProps {
  translationKey: string;
  fallback?: string;
}

/**
 * Component to highlight missing translations in development mode
 * In production, it will just display the fallback text
 */
const MissingTranslation: React.FC<MissingTranslationProps> = ({
  translationKey,
  fallback = 'Missing translation',
}) => {
  if (process.env.NODE_ENV === 'production') {
    return <>{fallback}</>;
  }

  return (
    <span
      className="bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded text-xs border border-yellow-300"
      title={`Missing translation key: ${translationKey}`}
    >
      {fallback} 🔍 [{translationKey}]
    </span>
  );
};

export default MissingTranslation;
