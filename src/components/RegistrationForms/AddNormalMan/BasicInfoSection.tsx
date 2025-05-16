import React from 'react';
import { motion } from 'framer-motion';
import Input from '../../../components/Input';
import { SectionButtons, type ManFormData } from '../shared';
import { useTranslationWithFallback } from '../../../hooks/useTranslationWithFallback';

interface BasicInfoSectionProps {
  formData: ManFormData;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onNext: () => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  formData,
  onInputChange,
  onNext,
}) => {
  const { t } = useTranslationWithFallback();

  return (
    <motion.div
      initial={{ x: -30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="space-y-3 sm:space-y-4"
    >
      <Input
        label={t('registration.fullName', 'Name')}
        name="name"
        value={formData.name}
        onChange={onInputChange}
      />
      <Input
        label={t('registration.nickname', 'Nickname')}
        name="nickname"
        value={formData.nickname}
        onChange={onInputChange}
      />
      <Input
        label={t('registration.dateOfBirth', 'Date of Birth')}
        name="dob"
        type="date"
        value={formData.dob}
        onChange={onInputChange}
      />
      <Input
        label={t('registration.nationalId', 'National ID')}
        name="national_id"
        value={formData.national_id}
        onChange={onInputChange}
      />
      <Input
        label={t('registration.address', 'Address')}
        name="address"
        value={formData.address}
        onChange={onInputChange}
      />
      <Input
        label={t('registration.job', 'Job')}
        name="job"
        value={formData.job}
        onChange={onInputChange}
      />
      <SectionButtons onNext={onNext} primaryColor="blue" />
    </motion.div>
  );
};

export default BasicInfoSection;
