import { useTranslation } from 'react-i18next';

/**
 * A hook that extends react-i18next's useTranslation to provide missing translation indicators
 * in development environment
 */
export const useTranslationWithFallback = () => {
  const { t, i18n, ready } = useTranslation();

  // Enhanced translation function with missing translation indicator
  const translate = (key: string, options?: any): string => {
    const translation = t(key, { ...options, defaultValue: null });

    // In development, if translation is the same as the key, it's likely missing
    if (process.env.NODE_ENV === 'development' && translation === key) {
      console.warn(`Missing translation for key: ${key}`);
      return t('missingTranslation', { key, ...options }) as string;
    }

    return translation as string;
  };

  return {
    t: translate,
    i18n,
    ready,
    language: i18n.language,
    changeLanguage: i18n.changeLanguage,
    isRTL: i18n.dir() === 'rtl',
  };
};

export default useTranslationWithFallback;
