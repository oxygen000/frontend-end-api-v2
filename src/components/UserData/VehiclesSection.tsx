import React from 'react';
import { motion } from 'framer-motion';
import { FaCar } from 'react-icons/fa';
import type { UserDataProps } from './types';
import { hasVehicleInfo } from './UserDataUtils';

const VehiclesSection: React.FC<UserDataProps> = ({
  user,
  isRTL,
  formatDate,
  maskSensitiveInfo,
  t,
}) => {
  // Only show for male or female users
  if (user.form_type !== 'man' && user.form_type !== 'woman') {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="bg-gradient-to-br from-amber-500/20 to-amber-500/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-amber-500/30 shadow-lg"
    >
      <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center">
        <FaCar
          className={`${isRTL ? 'mr-2 sm:mr-3' : 'ml-2 sm:ml-3'} text-amber-400`}
          size={20}
        />
        {t('users.vehicleInfo', 'Vehicles Information')}
      </h2>

      {hasVehicleInfo(user) ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {user.license_plate && (
            <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
              <span className="text-white/70 text-sm">
                {t('users.licensePlate', 'License Plate:')}
              </span>
              <span className="text-white font-medium text-sm">
                {maskSensitiveInfo(user.license_plate)}
              </span>
            </div>
          )}

          {user.vehicle_model && (
            <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
              <span className="text-white/70 text-sm">
                {t('users.vehicleModel', 'Vehicle Model:')}
              </span>
              <span className="text-white font-medium text-sm">
                {maskSensitiveInfo(user.vehicle_model)}
              </span>
            </div>
          )}

          {user.vehicle_color && (
            <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
              <span className="text-white/70 text-sm">
                {t('users.vehicleColor', 'Vehicle Color:')}
              </span>
              <span className="text-white font-medium text-sm">
                {maskSensitiveInfo(user.vehicle_color)}
              </span>
            </div>
          )}

          {user.chassis_number && (
            <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
              <span className="text-white/70 text-sm">
                {t('users.chassisNumber', 'Chassis Number:')}
              </span>
              <span className="text-white font-medium text-sm">
                {maskSensitiveInfo(user.chassis_number)}
              </span>
            </div>
          )}

          {user.vehicle_number && (
            <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
              <span className="text-white/70 text-sm">
                {t('users.vehicleNumber', 'Vehicle Number:')}
              </span>
              <span className="text-white font-medium text-sm">
                {maskSensitiveInfo(user.vehicle_number)}
              </span>
            </div>
          )}

          {user.license_expiration && (
            <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
              <span className="text-white/70 text-sm">
                {t('users.licenseExpiration', 'License Expiration:')}
              </span>
              <span className="text-white font-medium text-sm">
                {formatDate(user.license_expiration)}
              </span>
            </div>
          )}

          {user.manufacture_year && (
            <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
              <span className="text-white/70 text-sm">
                {t('users.yearmanufacture', 'Year of Manufacture:')}
              </span>
              <span className="text-white font-medium text-sm">
                {maskSensitiveInfo(user.manufacture_year)}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="p-3 bg-white/10 rounded-lg text-center">
          <span className="text-white/70 text-sm">
            {t('users.noVehicleInfo', 'No vehicle information available')}
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default VehiclesSection;
