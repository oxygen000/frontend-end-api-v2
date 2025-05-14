import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslationWithFallback } from '../hooks/useTranslationWithFallback';

function UserMenu({ userAvatar = 'https://via.placeholder.com/40' }) {
  const [isOpen, setIsOpen] = useState(false); // لتبديل حالة القائمة
  const navigate = useNavigate();
  const { t, isRTL } = useTranslationWithFallback();

  // وظيفة إغلاق القائمة باستخدام useCallback لتحسين الأداء
  const toggleMenu = useCallback(
    () => setIsOpen((prevState) => !prevState),
    []
  );

  return (
    <div className="relative" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* زر فتح/إغلاق القائمة */}
      <button
        onClick={toggleMenu}
        className="flex items-center p-2 bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none transition duration-300 ease-in-out"
      >
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userAvatar)}&background=random`} // استخدام صورة المستخدم
          alt={t('users.userAvatar', 'User Avatar')}
          className="w-8 h-8 rounded-full mr-2"
        />
        {/* السهم المتحرك */}
        <motion.svg
          className="w-4 h-4 ml-2 transform transition-transform duration-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          initial={{ rotate: isOpen ? 180 : 0 }} // التدوير عند الفتح والإغلاق
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

      {/* القائمة المنسدلة */}
      {isOpen && (
        <motion.div
          className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 bg-white shadow-lg rounded-lg w-48`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <ul className="list-none p-2">
            <li>
              <button
                onClick={() => navigate('/profile')}
                className="w-full text-left p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition duration-300"
              >
                {t('users.myProfile', 'My Profile')}
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/settings')}
                className="w-full text-left p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition duration-300"
              >
                {t('sidebar.settings', 'Settings')}
              </button>
            </li>
          </ul>
        </motion.div>
      )}
    </div>
  );
}

export default UserMenu;
