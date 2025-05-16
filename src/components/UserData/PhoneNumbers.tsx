import React from 'react';
import { motion } from 'framer-motion';
import { FiPhone } from 'react-icons/fi';
import type { UserDataProps } from './types';

const PhoneNumbers: React.FC<UserDataProps> = ({
  user,
  isRTL,
  formatDate,
  maskSensitiveInfo,
  t,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-gradient-to-br from-blue-500/20 to-blue-500/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-blue-500/30 shadow-lg"
    >
      <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center">
        <FiPhone
          className={`${isRTL ? 'mr-2 sm:mr-3' : 'ml-2 sm:ml-3'} text-blue-400`}
          size={20}
        />
        {t('users.phoneNumbers', 'Phone Numbers')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
          <span className="text-white/70 text-sm">
            {t('users.primaryPhone', 'Primary Phone:')}
          </span>
          <span className="text-white font-medium text-sm">
            {maskSensitiveInfo(
              user.phone_number || t('users.notAvailable', 'N/A')
            )}
          </span>
        </div>

        <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
          <span className="text-white/70 text-sm">
            {t('users.secondaryPhone', 'Secondary Phone:')}
          </span>
          <span className="text-white font-medium text-sm">
            {maskSensitiveInfo(
              user.second_phone_number || t('users.notAvailable', 'N/A')
            )}
          </span>
        </div>

        <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
          <span className="text-white/70 text-sm">
            {t('users.phoneProvider', 'Phone Provider:')}
          </span>
          <span className="text-white font-medium text-sm">
            {maskSensitiveInfo(
              user.phone_company || t('users.notAvailable', 'N/A')
            )}
          </span>
        </div>

        <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
          <span className="text-white/70 text-sm">
            {t('users.registrationDate', 'Registration Date:')}
          </span>
          <span className="text-white font-medium text-sm">
            {formatDate(user.created_at) || t('users.notAvailable', 'N/A')}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default PhoneNumbers;
