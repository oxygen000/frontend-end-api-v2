import React from 'react';
import { motion } from 'framer-motion';
import Input from '../../../components/Input';
import { SectionButtons, type ChildFormData } from '../shared';
import { useTranslationWithFallback } from '../../../hooks/useTranslationWithFallback';
import { sectionVariants, transition } from '../../../config/animations';

interface GuardianInfoSectionProps {
  formData: ChildFormData;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onPrev: () => void;
  onNext: () => void;
}

const GuardianInfoSection: React.FC<GuardianInfoSectionProps> = ({
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
      className="space-y-3 sm:space-y-4"
    >
      <h3 className="text-base sm:text-lg font-semibold">
        {t('forms.child.reporterInfo')}
      </h3>
      <Input
        label={t('forms.child.reporterName')}
        name="guardian_name"
        value={formData.guardian_name}
        onChange={onInputChange}
      />
      <Input
        label={t('forms.child.reporterPhone')}
        name="guardian_phone"
        value={formData.guardian_phone}
        onChange={onInputChange}
      />
      <div>
        <label className="block font-medium mb-1 text-sm sm:text-base">
          {t('registration.phoneCompany')}
        </label>
        <select
          name="phone_company"
          value={formData.phone_company}
          onChange={onInputChange}
          className="w-full px-3 sm:px-4 py-2 bg-white/10 text-black border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
        >
          <option value="">Select Company</option>
          <option value="Orange">Orange</option>
          <option value="Etisalat">Etisalat</option>
          <option value="Vodafone">Vodafone</option>
          <option value="WE">WE</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">
          {t(
            'forms.child.relationshipToMissing',
            'Relationship to Missing Person'
          )}
        </label>
        <select
          name="relationship"
          value={formData.relationship}
          onChange={onInputChange}
          className="w-full px-3 sm:px-4 py-2 text-black bg-white/10 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
        >
          <option value="">
            {t('relationships.select', 'Select Relationship')}
          </option>
          <option value="parent">{t('relationships.parent', 'Parent')}</option>
          <option value="grandparent">
            {t('relationships.grandparent', 'Grandparent')}
          </option>
          <option value="sibling">
            {t('relationships.sibling', 'Sibling')}
          </option>
          <option value="aunt/uncle">
            {t('relationships.auntUncle', 'Aunt/Uncle')}
          </option>
        </select>
      </div>
      <SectionButtons onPrev={onPrev} onNext={onNext} />
    </motion.div>
  );
};

export default GuardianInfoSection;
