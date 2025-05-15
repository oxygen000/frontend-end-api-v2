import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslationWithFallback } from '../hooks/useTranslationWithFallback';
import { users } from '../types/users';
import type { User } from '../types/users';

function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { t, isRTL } = useTranslationWithFallback();

  useEffect(() => {
    // Fetch the current user from localStorage
    const userId = localStorage.getItem('loggedInUserId');
    if (userId) {
      const user = users.find((u) => u.id === parseInt(userId));
      if (user) {
        setCurrentUser(user);
      }
    }
  }, []);

  // Toggle menu function using useCallback for performance
  const toggleMenu = useCallback(
    () => setIsOpen((prevState) => !prevState),
    []
  );

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('loggedInUserId');
    localStorage.removeItem('loggedInUsername');
    navigate('/login');
    setIsOpen(false);
  };

  return (
    <div className="relative" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Menu toggle button */}
      <button
        onClick={toggleMenu}
        className="flex items-center p-2 bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none transition duration-300 ease-in-out"
      >
        <img
          src={
            currentUser?.profileImageUrl ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.fullName || currentUser?.username || '')}&background=random`
          }
          alt={t('users.userAvatar', 'User Avatar')}
          className="w-8 h-8 rounded-full mr-2"
        />
        <span className="text-sm font-medium hidden md:block">
          {currentUser?.fullName ||
            currentUser?.username ||
            t('users.myProfile', 'My Profile')}
        </span>
        {/* Animated arrow */}
        <motion.svg
          className="w-4 h-4 ml-2 transform transition-transform duration-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          initial={{ rotate: isOpen ? 180 : 0 }}
          animate={{ rotate: isOpen ? 180 : 0 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </motion.svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <motion.div
          className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 bg-white shadow-lg rounded-lg w-48 z-50`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <ul className="list-none p-2">
            <li>
              <button
                onClick={() => {
                  navigate('/profile');
                  setIsOpen(false);
                }}
                className="w-full text-left p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition duration-300"
              >
                {t('users.myProfile', 'My Profile')}
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  navigate('/settings');
                  setIsOpen(false);
                }}
                className="w-full text-left p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition duration-300"
              >
                {t('sidebar.settings', 'Settings')}
              </button>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="w-full text-left p-2 text-red-600 hover:bg-red-50 rounded-lg transition duration-300"
              >
                {t('auth.logout', 'Logout')}
              </button>
            </li>
          </ul>
        </motion.div>
      )}
    </div>
  );
}

export default UserMenu;
