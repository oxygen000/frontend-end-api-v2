import React from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiAlertCircle, FiMaximize } from 'react-icons/fi';
import type { UserDataProps } from './types';
import { getImageUrl } from './UserDataUtils';

interface UserHeaderProps extends UserDataProps {
  openImageModal: () => void;
}

const UserHeader: React.FC<UserHeaderProps> = ({
  user,
  isRTL,
  isIdentityRevealed,
  formatDate,
  t,
  openImageModal,
}) => {
  // Check if user is a child record
  const isChildRecord = user.form_type === 'child';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/30 shadow-lg mb-4 sm:mb-6 ${
        isChildRecord ? 'from-amber-500/20 to-amber-500/10' : ''
      }`}
    >
      <div className="flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-6">
        <div
          className="w-20 h-20 sm:w-28 sm:h-28 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-3xl font-bold overflow-hidden shadow-lg border-2 border-white/30 cursor-pointer relative group"
          onClick={() => user?.image_path && openImageModal()}
        >
          {user?.image_path && (
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <FiMaximize className="text-white text-lg" />
              {isChildRecord && (
                <span className="sr-only">
                  {t('forms.child.clickToEnlarge', 'Click to enlarge image')}
                </span>
              )}
            </div>
          )}
          {user?.image_path ? (
            <img
              src={getImageUrl(user.image_path, user.name)}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {user?.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="text-center md:text-left flex-1">
          <div className="flex items-center justify-center md:justify-start flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              {user.name}
            </h1>
          </div>
          <p className="text-white/70 mt-1 flex flex-wrap items-center justify-center md:justify-start gap-2">
            {user.form_type && (
              <span className="capitalize bg-white/20 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                {t(`search.formTypes.${user.form_type}`, user.form_type)}
              </span>
            )}
            {user.department && (
              <span className="bg-blue-500/30 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                {isIdentityRevealed
                  ? user.department
                  : t('users.department', 'Department')}
              </span>
            )}
            {isChildRecord && (
              <span className="bg-amber-500/50 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                {t('users.childRecord', 'Child Record')}
              </span>
            )}
          </p>
          <p className="text-white/70 mt-2 flex items-center justify-center md:justify-start text-sm">
            <FiCalendar className={`inline ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('users.registeredOn', 'Registered on')}{' '}
            {formatDate(user.created_at)}
          </p>

          {user.has_criminal_record === 1 && (
            <div className="mt-3 inline-block bg-red-500/30 text-white px-4 py-1 rounded-full text-xs sm:text-sm font-medium">
              <FiAlertCircle className={`inline ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t('users.hasCriminalRecord', 'Has Criminal Record')}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default UserHeader;
