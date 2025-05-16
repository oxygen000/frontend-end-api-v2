import React from 'react';
import { motion } from 'framer-motion';
import Input from '../../../components/Input';
import Textarea from '../../../components/Textarea';
import { SectionButtons, type DisabledFormData } from '../shared';
import { useTranslationWithFallback } from '../../../hooks/useTranslationWithFallback';
import { sectionVariants, transition } from '../../../config/animations';

interface ContactInfoSectionProps {
  formData: DisabledFormData;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onPrev: () => void;
  onNext: () => void;
}

const ContactInfoSection: React.FC<ContactInfoSectionProps> = ({
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
        {t('registration.contactInfo', 'Contact Information')}
      </h3>
      <Input
        label={t('registration.phoneNumber', 'Phone Number')}
        name="phone_number"
        value={formData.phone_number || ''}
        onChange={onInputChange}
      />
      <div>
        <label className="block font-medium mb-1">
          {t('registration.phoneCompany', 'Telecom Company')}
        </label>
        <select
          name="phone_company"
          value={formData.phone_company}
          onChange={onInputChange}
          className="w-full px-4 py-2 bg-white/10 text-black border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">{t('common.select', 'Select Company')}</option>
          <option value="Orange">Orange</option>
          <option value="Etisalat">Etisalat</option>
          <option value="Vodafone">Vodafone</option>
          <option value="WE">WE</option>
        </select>
      </div>
      <Input
        label={t('registration.secondaryPhone', 'Secondary Phone (Optional)')}
        name="second_phone_number"
        value={formData.second_phone_number}
        onChange={onInputChange}
      />
      <Textarea
        label={t('registration.address', 'Address')}
        name="address"
        value={formData.address}
        onChange={onInputChange}
      />
      <SectionButtons onPrev={onPrev} onNext={onNext} primaryColor="purple" />
    </motion.div>
  );
};

export default ContactInfoSection;
