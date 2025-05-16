import React from 'react';
import { motion } from 'framer-motion';
import Input from '../../../components/Input';
import { SectionButtons, type DisabledFormData } from '../shared';
import { useTranslationWithFallback } from '../../../hooks/useTranslationWithFallback';
import { sectionVariants, transition } from '../../../config/animations';

interface BasicInfoSectionProps {
  formData: DisabledFormData;
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
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={transition}
      className="space-y-4"
    >
      <h3 className="text-base sm:text-lg font-semibold">
        {t('registration.personalInfo', 'Basic Information')}
      </h3>
      <Input
        label={t('registration.fullName', 'Full Name')}
        name="name"
        value={formData.name}
        onChange={onInputChange}
      />
      <Input
        label={t('registration.dateOfBirth', 'Date of Birth')}
        name="dob"
        type="date"
        value={formData.dob}
        onChange={onInputChange}
      />
      <div>
        <label className="block font-medium mb-1">
          {t('registration.gender', 'Gender')}
        </label>
        <select
          name="gender"
          value={formData.gender}
          onChange={onInputChange}
          className="w-full px-4 py-2 bg-white/10 border text-black border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">
            {t('registration.selectGender', 'Select Gender')}
          </option>
          <option value="male">{t('registration.male', 'Male')}</option>
          <option value="female">{t('registration.female', 'Female')}</option>
        </select>
      </div>
      <Input
        label={t('registration.nationalId', 'National ID')}
        name="national_id"
        value={formData.national_id}
        onChange={onInputChange}
      />
      <SectionButtons onNext={onNext} primaryColor="purple" />
    </motion.div>
  );
};

export default BasicInfoSection;
