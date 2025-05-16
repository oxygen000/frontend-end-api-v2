import React from 'react';
import { motion } from 'framer-motion';
import Input from '../../../components/Input';
import { SectionButtons, type WomanFormData } from '../shared';
import { useTranslationWithFallback } from '../../../hooks/useTranslationWithFallback';

interface VehicleInfoSectionProps {
  formData: WomanFormData;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onToggleVehicle: () => void;
  onPrev: () => void;
  onNext: () => void;
}

const VehicleInfoSection: React.FC<VehicleInfoSectionProps> = ({
  formData,
  onInputChange,
  onPrev,
  onNext,
}) => {
  const { t } = useTranslationWithFallback();

  return (
    <motion.div
      initial={{ x: 30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="space-y-3 sm:space-y-4"
    >
      <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-4">
        {t('registration.vehicleInfo', 'Vehicle Information')}
      </h3>
      <Input
        label={t('registration.vehicleModel', 'Vehicle Model')}
        name="vehicle_model"
        type="text"
        value={formData.vehicle_model}
        onChange={onInputChange}
      />
      <Input
        label={t('registration.vehicleColor', 'Vehicle Color')}
        name="vehicle_color"
        value={formData.vehicle_color}
        onChange={onInputChange}
      />
      <Input
        label={t('registration.chassisNumber', 'Chassis Number')}
        name="chassis_number"
        value={formData.chassis_number}
        onChange={onInputChange}
      />
      <Input
        label={t('registration.vehicleNumber', 'Vehicle Number')}
        name="vehicle_number"
        type="text"
        value={formData.vehicle_number}
        onChange={onInputChange}
      />
      <Input
        label={t('registration.licenseExpiration', 'License Expiration')}
        name="license_expiration"
        type="date"
        value={formData.license_expiration}
        onChange={onInputChange}
      />
      <SectionButtons onPrev={onPrev} onNext={onNext} primaryColor="pink" />
    </motion.div>
  );
};

export default VehicleInfoSection;
