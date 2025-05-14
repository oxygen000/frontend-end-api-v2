import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslationWithFallback } from '../hooks/useTranslationWithFallback';
import { useState } from 'react';
import i18n from 'i18next';
import { FiGlobe } from 'react-icons/fi';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { t, isRTL } = useTranslationWithFallback();
  const [showLanguageOptions, setShowLanguageOptions] = useState(false);

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    setShowLanguageOptions(false);
  };

  const currentLanguage = i18n.language;

  // Define RTL-specific sidebar variants
  const sidebarVariants = {
    hidden: { x: isRTL ? '100%' : '-100%' },
    visible: { x: 0 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <motion.div
            className="fixed inset-0 bg-black/70 z-30 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.aside
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={sidebarVariants}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={`fixed top-0 ${isRTL ? 'right-0' : 'left-0'} h-full w-64 bg-gray-800 text-white shadow-lg z-40 md:w-72`}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <div className="flex flex-col h-full p-6 relative">
              {/* Logo / Title */}
              <div className="mb-10">
                <h2
                  className={`text-2xl font-bold ${isRTL ? 'text-right' : 'text-left'}`}
                >
                  {t('sidebar.navigation', 'Navigation')}
                </h2>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 space-y-4">
                <Link
                  to="/identification"
                  className={`block px-3 py-2 rounded hover:bg-gray-700 transition ${isRTL ? 'text-right' : 'text-left'}`}
                >
                  {t('identification.title', 'Identification')}
                </Link>
                <Link
                  to="/Search"
                  className={`block px-3 py-2 rounded hover:bg-gray-700 transition ${isRTL ? 'text-right' : 'text-left'}`}
                >
                  {t('common.search', 'Search')}
                </Link>
                <Link
                  to="/"
                  className={`block px-3 py-2 rounded hover:bg-gray-700 transition ${isRTL ? 'text-right' : 'text-left'}`}
                >
                  {t('sidebar.settings', 'Settings')}
                </Link>

                {/* Language Switcher */}
                <div className="relative">
                  <button
                    onClick={() => setShowLanguageOptions(!showLanguageOptions)}
                    className={`flex items-center w-full px-3 py-2 rounded hover:bg-gray-700 transition ${isRTL ? 'text-right justify-between' : 'text-left'}`}
                  >
                    <FiGlobe className={isRTL ? 'ml-2' : 'mr-2'} />
                    {currentLanguage === 'ar' ? 'العربية' : 'English'}
                  </button>

                  {showLanguageOptions && (
                    <div
                      className={`absolute w-full mt-1 bg-gray-700 rounded-md shadow-lg overflow-hidden z-10 ${isRTL ? 'right-0' : 'left-0'}`}
                    >
                      <button
                        onClick={() => changeLanguage('en')}
                        className={`w-full ${isRTL ? 'text-right' : 'text-left'} px-3 py-2 hover:bg-gray-600 transition ${currentLanguage === 'en' ? 'bg-blue-600/40' : ''}`}
                      >
                        English
                      </button>
                      <button
                        onClick={() => changeLanguage('ar')}
                        className={`w-full ${isRTL ? 'text-right' : 'text-left'} px-3 py-2 hover:bg-gray-600 transition ${currentLanguage === 'ar' ? 'bg-blue-600/40' : ''}`}
                      >
                        العربية
                      </button>
                    </div>
                  )}
                </div>
              </nav>

              {/* Logout Button */}
              <div className="pt-6 border-t border-gray-700">
                <Link
                to={"login"}
                  className={`w-full ${isRTL ? 'text-right' : 'text-left'} px-3 py-2 rounded hover:bg-red-600 transition`}
                >
                  {t('auth.logout', 'Logout')}
                </Link>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default Sidebar;
