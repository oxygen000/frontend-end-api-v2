import React from 'react';
import { motion } from 'framer-motion';
import { FaFingerprint } from 'react-icons/fa';
import {
  FiHash,
  FiUser,
  FiBriefcase,
  FiHome,
  FiCalendar,
} from 'react-icons/fi';
import type { UserDataProps } from './types';

interface PersonalInfoProps extends UserDataProps {
  showEmptyFields: boolean;
}

const PersonalInfo: React.FC<PersonalInfoProps> = ({
  user,
  isRTL,
  formatDate,
  maskSensitiveInfo,
  t,
  showEmptyFields,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/30 shadow-lg"
    >
      <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center">
        <FaFingerprint
          className={`${isRTL ? 'ml-2 sm:ml-3' : 'mr-2 sm:mr-3'} text-blue-400`}
          size={20}
        />
        {t('users.personalInfo', 'Personal Information')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div className="flex justify-between items-center p-3 sm:p-4 bg-white/10 hover:bg-white/15 transition-colors duration-200 rounded-lg">
          <span className="text-white/70 flex items-center text-sm">
            <FiHash className={`${isRTL ? 'ml-2' : 'mr-2'}`} />{' '}
            {t('users.id', 'ID:')}
          </span>
          <span className="text-white font-medium text-sm">
            {user.id
              ? `${user.id.substring(0, 8)}...`
              : t('users.notAvailable', 'Not available')}
          </span>
        </div>

        <div className="flex justify-between items-center p-3 sm:p-4 bg-white/10 hover:bg-white/15 transition-colors duration-200 rounded-lg">
          <span className="text-white/70 flex items-center text-sm">
            <FiUser className={`${isRTL ? 'ml-2' : 'mr-2'}`} />{' '}
            {t('users.faceId', 'Face ID:')}
          </span>
          <span className="text-white font-medium text-sm">
            {user.face_id
              ? `${user.face_id.substring(0, 8)}...`
              : t('users.notAvailable', 'Not available')}
          </span>
        </div>

        {(user.employee_id || showEmptyFields) && (
          <div className="flex justify-between items-center p-3 sm:p-4 bg-white/10 hover:bg-white/15 transition-colors duration-200 rounded-lg">
            <span className="text-white/70 flex items-center text-sm">
              <FiBriefcase className={`${isRTL ? 'ml-2' : 'mr-2'}`} />{' '}
              {t('users.employeeId', 'Employee ID:')}
            </span>
            <span className="text-white font-medium text-sm">
              {maskSensitiveInfo(user.employee_id)}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center p-3 sm:p-4 bg-white/10 hover:bg-white/15 transition-colors duration-200 rounded-lg">
          <span className="text-white/70 flex items-center text-sm">
            <FiHash className={`${isRTL ? 'ml-2' : 'mr-2'}`} />{' '}
            {t('users.formType', 'Form Type:')}
          </span>
          <span className="text-white font-medium text-sm capitalize">
            {t(`search.formTypes.${user.form_type}`, user.form_type)}
          </span>
        </div>

        {(user.occupation || showEmptyFields) && (
          <div className="flex justify-between items-center p-3 sm:p-4 bg-white/10 hover:bg-white/15 transition-colors duration-200 rounded-lg">
            <span className="text-white/70 flex items-center text-sm">
              <FiBriefcase className={`${isRTL ? 'ml-2' : 'mr-2'}`} />{' '}
              {t('users.occupation', 'Occupation:')}
            </span>
            <span className="text-white font-medium text-sm">
              {maskSensitiveInfo(user.occupation)}
            </span>
          </div>
        )}

        {(user.address || showEmptyFields) && (
          <div className="flex justify-between items-center p-3 sm:p-4 bg-white/10 hover:bg-white/15 transition-colors duration-200 rounded-lg">
            <span className="text-white/70 flex items-center text-sm">
              <FiHome className={`${isRTL ? 'ml-2' : 'mr-2'}`} />{' '}
              {t('registration.address', 'Address:')}
            </span>
            <span className="text-white font-medium text-sm">
              {maskSensitiveInfo(user.address)}
            </span>
          </div>
        )}

        {(user.updated_at || showEmptyFields) && (
          <div className="flex justify-between items-center p-3 sm:p-4 bg-white/10 hover:bg-white/15 transition-colors duration-200 rounded-lg">
            <span className="text-white/70 flex items-center text-sm">
              <FiCalendar className={`${isRTL ? 'ml-2' : 'mr-2'}`} />{' '}
              {t('users.lastUpdated', 'Last Updated:')}
            </span>
            <span className="text-white font-medium text-sm">
              {formatDate(user.updated_at)}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PersonalInfo;
