import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { useTranslationWithFallback } from '../hooks/useTranslationWithFallback';

// Type definitions for the translation context
interface TranslationContextType {
  isRTL: boolean;
  language: string;
  changeLanguage: (lng: string) => void;
  t: (key: string, options?: any) => string;
}

// Create the context with a default value
const TranslationContext = createContext<TranslationContextType>({
  isRTL: false,
  language: 'en',
  changeLanguage: () => {},
  t: (key: string) => key,
});

// Provider component for the TranslationContext
export const TranslationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { t, i18n, language, isRTL } = useTranslationWithFallback();
  const [, setCurrentDirection] = useState(
    isRTL ? 'rtl' : 'ltr'
  );

  // Update document direction when language changes
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    setCurrentDirection(isRTL ? 'rtl' : 'ltr');
  }, [isRTL, language]);

  // Function to change the language
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  // Context value
  const contextValue: TranslationContextType = {
    isRTL,
    language,
    changeLanguage,
    t: (key: string, options?: any) => t(key, options) as string,
  };

  return (
    <TranslationContext.Provider value={contextValue}>
      {children}
    </TranslationContext.Provider>
  );
};

// Custom hook to use the translation context
export const useTranslation = () => useContext(TranslationContext);

export default TranslationContext;
