import React from 'react';
import { motion } from 'framer-motion';
import Input from '../../../components/Input';
import { SectionButtons, type ChildFormData } from '../shared';
import { useTranslationWithFallback } from '../../../hooks/useTranslationWithFallback';
import { sectionVariants, transition } from '../../../config/animations';

interface BasicInfoSectionProps {
  formData: ChildFormData;
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
      className="space-y-3 sm:space-y-4"
    >
      <h3 className="text-base sm:text-lg font-semibold">
        {t('forms.child.missingPersonInfo')}
      </h3>
      <Input
        label={t('forms.child.childFullName')}
        name="name"
        value={formData.name}
        onChange={onInputChange}
      />

      <Input
        label={t('forms.child.age')}
        name="dob"
        type="date"
        value={formData.dob}
        onChange={onInputChange}
      />
      <div>
        <label className="block font-medium mb-1 text-sm sm:text-base">
          {t('registration.gender')}
        </label>
        <select
          name="gender"
          value={formData.gender}
          onChange={onInputChange}
          className="w-full px-3 sm:px-4 py-2 bg-white/10 border text-black border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
        >
          <option value="">
            {t('registration.selectGender', 'Select Gender')}
          </option>
          <option value="male">{t('registration.male')}</option>
          <option value="female">{t('registration.female')}</option>
        </select>
      </div>
      <Input
        label={t('forms.child.childId')}
        name="national_id"
        value={formData.national_id}
        onChange={onInputChange}
      />
      <Input
        label={t('registration.address')}
        name="address"
        value={formData.address}
        onChange={onInputChange}
      />
      <SectionButtons onNext={onNext} />
    </motion.div>
  );
};

export default BasicInfoSection;
