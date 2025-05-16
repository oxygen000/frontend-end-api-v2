import React from 'react';
import { motion } from 'framer-motion';
import Input from '../../../components/Input';
import Textarea from '../../../components/Textarea';
import { SectionButtons, type DisabledFormData } from '../shared';
import { useTranslationWithFallback } from '../../../hooks/useTranslationWithFallback';
import { sectionVariants, transition } from '../../../config/animations';

interface DisabilityInfoSectionProps {
  formData: DisabledFormData;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onPrev: () => void;
  onNext: () => void;
}

const DisabilityInfoSection: React.FC<DisabilityInfoSectionProps> = ({
  formData,
  onInputChange,
  onPrev,
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
        {t('forms.disabled.disabilityInfo', 'Disability Information')}
      </h3>
      <div>
        <label className="block font-medium mb-1">
          {t('forms.disabled.disabilityType', 'Disability Type')}
        </label>
        <select
          name="disability_type"
          value={formData.disability_type}
          onChange={onInputChange}
          className="w-full px-4 py-2 bg-white/10 border text-black border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">
            {t('common.select', 'Select Disability Type')}
          </option>
          <option value="physical">{t('physical', 'Physical')}</option>
          <option value="visual">{t('visual', 'Visual')}</option>
          <option value="hearing">{t('hearing', 'Hearing')}</option>
          <option value="cognitive">{t('cognitive', 'Cognitive')}</option>
          <option value="multiple">
            {t('multiple', 'Multiple Disabilities')}
          </option>
          <option value="other">{t('common.other', 'Other')}</option>
        </select>
      </div>
      <Textarea
        label={t('forms.disabled.disabilityDetails', 'Disability Details')}
        name="disability_description"
        value={formData.disability_description}
        onChange={onInputChange}
      />
      <Textarea
        label={t(
          'forms.disabled.medicalConditions',
          'Medical Conditions (Optional)'
        )}
        name="medical_condition"
        value={formData.medical_condition}
        onChange={onInputChange}
      />
      <Input
        label={t('forms.disabled.specialNeeds', 'Additional Notes (Optional)')}
        name="special_needs"
        value={formData.special_needs || ''}
        onChange={onInputChange}
      />
      <Input
        label={t('forms.disabled.emergencyContact', 'Emergency Contact Name')}
        name="emergency_contact"
        value={formData.emergency_contact || ''}
        onChange={onInputChange}
      />
      <Input
        label={t('users.emergencyPhone', 'Emergency Contact Phone')}
        name="emergency_phone"
        value={formData.emergency_phone || ''}
        onChange={onInputChange}
      />

      <SectionButtons onPrev={onPrev} onNext={onNext} primaryColor="purple" />
    </motion.div>
  );
};

export default DisabilityInfoSection;
