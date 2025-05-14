import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import Sidebar from '../components/sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import UserMenu from '../components/usermenu';
import LanguageToggle from '../components/LanguageToggle';
import { useTranslationWithFallback } from '../hooks/useTranslationWithFallback';

function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isRTL } = useTranslationWithFallback();

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div
      className="min-h-screen flex relative overflow-hidden bg-cover bg-center"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Sidebar with toggle control */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            className=""
            initial={{ x: isRTL ? 300 : -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isRTL ? 300 : -300, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              duration: 0.5,
            }}
          >
            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <motion.div
        className={`flex-1 flex flex-col relative z-10 transition-all duration-300 ease-in-out ${
          isSidebarOpen
            ? isRTL
              ? 'mr-64 md:mr-72'
              : 'ml-64 md:ml-72'
            : isRTL
              ? 'mr-0'
              : 'ml-0'
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {/* Page Content */}
        <motion.main
          className="flex-1 p-4 transition-all duration-300 ease-in-out"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          style={{
            backgroundImage: "url('/back1.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Navbar */}
          <motion.header
            className="p-4 flex items-center justify-between transition-all duration-300 ease-in-out"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {/* Left/Right Side (depends on RTL): Site Name and Menu Button */}
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="text-white hover:text-gray-500 focus:outline-none"
              >
                {isSidebarOpen ? (
                  <svg
                    className="w-6 h-6 transition-all duration-300 ease-in-out hidden md:block"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6 transition-all duration-300 ease-in-out"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
              <Link
                to={'/home'}
                className={`text-xl text-white font-bold ${isRTL ? 'mr-4' : 'ml-4'}`}
              >
                Face ID
              </Link>
            </div>

            {/* Opposite Side: Language Toggle and User Menu */}
            <div className="flex items-center ml-auto gap-4">
              <LanguageToggle />
              <UserMenu />
            </div>
          </motion.header>

          {/* Page Content */}
          <Outlet />
        </motion.main>
      </motion.div>
    </div>
  );
}

export default Layout;
