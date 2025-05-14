import { useState, useEffect } from 'react';
import { FaGlobeAmericas, FaGlobeAfrica } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

function LanguageToggle() {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState<string>(
    () => localStorage.getItem('i18nextLng') || 'en'
  );

  // Set initial language on component mount
  useEffect(() => {
    i18n.changeLanguage(language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, i18n]);

  // Function to toggle language
  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'ar' : 'en';
    setLanguage(newLanguage);
    localStorage.setItem('i18nextLng', newLanguage);
    i18n.changeLanguage(newLanguage);
    document.documentElement.dir = newLanguage === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLanguage;
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 text-white px-3 py-2 rounded-lg transition-colors duration-300"
      aria-label={language === 'en' ? 'Change to Arabic' : 'Change to English'}
    >
      {language === 'en' ? (
        <>
          <FaGlobeAfrica className="text-white" />
          <span className="text-white">العربية</span>
        </>
      ) : (
        <>
          <FaGlobeAmericas className="text-white" />
          <span className="text-white">English</span>
        </>
      )}
    </button>
  );
}

export default LanguageToggle;
