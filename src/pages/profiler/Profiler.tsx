import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslationWithFallback } from '../../hooks/useTranslationWithFallback';
import { users } from '../../types/users';
import type { User } from '../../types/users';
import { motion } from 'framer-motion';
import {
  FiUser,
  FiInfo,
  FiCalendar,
  FiMail,
  FiPhone,
  FiHome,
  FiClock,
  FiShield,
} from 'react-icons/fi';
import { FaIdCard } from 'react-icons/fa';

// Define section color styles
const SECTION_COLORS = {
  profile: {
    gradient: 'from-blue-500/20 to-blue-500/10',
    border: 'border-blue-500/30',
    icon: 'text-blue-400',
  },
  account: {
    gradient: 'from-teal-500/20 to-teal-500/10',
    border: 'border-teal-500/30',
    icon: 'text-teal-400',
  },
  activity: {
    gradient: 'from-purple-500/20 to-purple-500/10',
    border: 'border-purple-500/30',
    icon: 'text-purple-400',
  },
};

function Profiler() {
  const { t, isRTL } = useTranslationWithFallback();
  const navigate = useNavigate();
  const params = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const fetchUserProfile = () => {
      setLoading(true);

      try {
        // First, check if we have a user ID in the route params
        let userId = params.id ? parseInt(params.id) : null;

        // If not, get it from localStorage (the logged-in user)
        if (!userId) {
          const storedUserId = localStorage.getItem('loggedInUserId');

          if (storedUserId) {
            userId = parseInt(storedUserId);
          } else {
            // User is not logged in, redirect to login page
            navigate('/login');
            return;
          }
        }

        // Find the user in the users array
        const currentUser = users.find((u) => u.id === userId);

        if (currentUser) {
          setUser(currentUser);
        } else {
          setError(t('users.notFound', 'User not found'));

          // If this is the logged-in user and they don't exist, clear localStorage and redirect to login
          if (!params.id) {
            localStorage.removeItem('loggedInUserId');
            localStorage.removeItem('loggedInUsername');
            navigate('/login');
          }
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(t('errors.generic', 'Failed to load user profile'));
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate, params.id, t]);



  // Format date function
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return t('users.notAvailable', 'N/A');
    const date = new Date(dateString);
    return date.toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-4 text-white">
          {t('common.loading', 'Loading...')}
        </span>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-100/20 backdrop-blur-md border border-red-400/30 text-red-700 px-4 py-3 rounded">
          <p>{error || t('users.notFound', 'User not found')}</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-2 bg-blue-600/70 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded"
          >
            {t('common.back', 'Back to Login')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold text-white">
          {t('users.myProfile', 'My Profile')}
        </h1>

       
      </div>

      {/* User profile header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/30 shadow-lg mb-4 sm:mb-6"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-6">
          <div className="w-20 h-20 sm:w-28 sm:h-28 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-3xl font-bold overflow-hidden shadow-lg border-2 border-white/30">
            {user.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt={user.fullName || user.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {(user.fullName || user.username).charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="text-center md:text-left flex-1">
            <div className="flex items-center justify-center md:justify-start flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {user.fullName || user.username}
              </h2>
            </div>
            <p className="text-white/70 mt-1">@{user.username}</p>
            <p className="text-white/70 mt-1 flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="bg-blue-500/30 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                {params.id
                  ? t('users.userProfile', 'User Profile')
                  : t('users.myAccount', 'My Account')}
              </span>
              {user.role && (
                <span
                  className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${user.role === 'admin' ? 'bg-purple-500/30' : 'bg-green-500/30'}`}
                >
                  {user.role === 'admin'
                    ? t('users.adminRole', 'Administrator')
                    : t('users.userRole', 'User')}
                </span>
              )}
              {user.isActive !== undefined && (
                <span
                  className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${user.isActive ? 'bg-green-500/30' : 'bg-red-500/30'}`}
                >
                  {user.isActive
                    ? t('users.active', 'Active')
                    : t('users.inactive', 'Inactive')}
                </span>
              )}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 sm:gap-6">
        {/* User Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`bg-gradient-to-br ${SECTION_COLORS.profile.gradient} backdrop-blur-md rounded-xl p-4 sm:p-6 border ${SECTION_COLORS.profile.border} shadow-lg`}
        >
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center">
            <FiUser
              className={`${isRTL ? 'ml-2 sm:ml-3' : 'mr-2 sm:mr-3'} ${SECTION_COLORS.profile.icon}`}
              size={20}
            />
            {t('users.personalInfo', 'Personal Information')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="flex justify-between items-center p-3 sm:p-4 bg-white/10 hover:bg-white/15 transition-colors duration-200 rounded-lg">
              <span className="text-white/70 flex items-center text-sm">
                <FiUser className={`${isRTL ? 'ml-2' : 'mr-2'}`} />{' '}
                {t('registration.fullName', 'Full Name:')}
              </span>
              <span className="text-white font-medium text-sm">
                {user.fullName || user.username}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 sm:p-4 bg-white/10 hover:bg-white/15 transition-colors duration-200 rounded-lg">
              <span className="text-white/70 flex items-center text-sm">
                <FiMail className={`${isRTL ? 'ml-2' : 'mr-2'}`} />{' '}
                {t('auth.email', 'Email:')}
              </span>
              <span className="text-white font-medium text-sm">
                {user.email || `${user.username}@example.com`}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 sm:p-4 bg-white/10 hover:bg-white/15 transition-colors duration-200 rounded-lg">
              <span className="text-white/70 flex items-center text-sm">
                <FiPhone className={`${isRTL ? 'ml-2' : 'mr-2'}`} />{' '}
                {t('registration.phoneNumber', 'Phone Number:')}
              </span>
              <span className="text-white font-medium text-sm">
                {user.phoneNumber || t('users.notAvailable', 'N/A')}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 sm:p-4 bg-white/10 hover:bg-white/15 transition-colors duration-200 rounded-lg">
              <span className="text-white/70 flex items-center text-sm">
                <FiHome className={`${isRTL ? 'ml-2' : 'mr-2'}`} />{' '}
                {t('registration.address', 'Address:')}
              </span>
              <span className="text-white font-medium text-sm">
                {user.address || t('users.notAvailable', 'N/A')}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Account Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`bg-gradient-to-br ${SECTION_COLORS.account.gradient} backdrop-blur-md rounded-xl p-4 sm:p-6 border ${SECTION_COLORS.account.border} shadow-lg`}
        >
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center">
            <FaIdCard
              className={`${isRTL ? 'ml-2 sm:ml-3' : 'mr-2 sm:mr-3'} ${SECTION_COLORS.account.icon}`}
              size={20}
            />
            {t('users.accountInfo', 'Account Information')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="flex justify-between items-center p-3 sm:p-4 bg-white/10 hover:bg-white/15 transition-colors duration-200 rounded-lg">
              <span className="text-white/70 flex items-center text-sm">
                <FiInfo className={`${isRTL ? 'ml-2' : 'mr-2'}`} />{' '}
                {t('users.id', 'User ID:')}
              </span>
              <span className="text-white font-medium text-sm">{user.id}</span>
            </div>

            <div className="flex justify-between items-center p-3 sm:p-4 bg-white/10 hover:bg-white/15 transition-colors duration-200 rounded-lg">
              <span className="text-white/70 flex items-center text-sm">
                <FiUser className={`${isRTL ? 'ml-2' : 'mr-2'}`} />{' '}
                {t('users.username', 'Username:')}
              </span>
              <span className="text-white font-medium text-sm">
                {user.username}
              </span>
            </div>

            

            <div className="flex justify-between items-center p-3 sm:p-4 bg-white/10 hover:bg-white/15 transition-colors duration-200 rounded-lg">
              <span className="text-white/70 flex items-center text-sm">
                <FiShield className={`${isRTL ? 'ml-2' : 'mr-2'}`} />{' '}
                {t('users.accountStatus', 'Account Status:')}
              </span>
              <span className="text-white font-medium text-sm">
                <span
                  className={`inline-block w-2 h-2 ${user.isActive !== false ? 'bg-green-500' : 'bg-red-500'} rounded-full ${isRTL ? 'ml-2' : 'mr-2'}`}
                ></span>
                {user.isActive !== false
                  ? t('users.active', 'Active')
                  : t('users.inactive', 'Inactive')}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Activity Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`bg-gradient-to-br ${SECTION_COLORS.activity.gradient} backdrop-blur-md rounded-xl p-4 sm:p-6 border ${SECTION_COLORS.activity.border} shadow-lg`}
        >
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center">
            <FiClock
              className={`${isRTL ? 'ml-2 sm:ml-3' : 'mr-2 sm:mr-3'} ${SECTION_COLORS.activity.icon}`}
              size={20}
            />
            {t('users.activityInfo', 'Activity Information')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="flex justify-between items-center p-3 sm:p-4 bg-white/10 hover:bg-white/15 transition-colors duration-200 rounded-lg">
              <span className="text-white/70 flex items-center text-sm">
                <FiCalendar className={`${isRTL ? 'ml-2' : 'mr-2'}`} />{' '}
                {t('users.registrationDate', 'Registration Date:')}
              </span>
              <span className="text-white font-medium text-sm">
                {formatDate(user.dateJoined)}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 sm:p-4 bg-white/10 hover:bg-white/15 transition-colors duration-200 rounded-lg">
              <span className="text-white/70 flex items-center text-sm">
                <FiClock className={`${isRTL ? 'ml-2' : 'mr-2'}`} />{' '}
                {t('users.lastLogin', 'Last Login:')}
              </span>
              <span className="text-white font-medium text-sm">
                {formatDate(user.lastLogin)}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 sm:p-4 bg-white/10 hover:bg-white/15 transition-colors duration-200 rounded-lg">
              <span className="text-white/70 flex items-center text-sm">
                <FiShield className={`${isRTL ? 'ml-2' : 'mr-2'}`} />{' '}
                {t('users.role', 'User Role:')}
              </span>
              <span className="text-white font-medium text-sm capitalize">
                {user.role || t('users.standardUser', 'Standard User')}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Profiler;
