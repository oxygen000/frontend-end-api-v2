import React from 'react';
import { motion } from 'framer-motion';
import Input from '../../../components/Input';
import Textarea from '../../../components/Textarea';
import { SectionButtons, type ChildFormData } from '../shared';
import { useTranslationWithFallback } from '../../../hooks/useTranslationWithFallback';
import { sectionVariants, transition } from '../../../config/animations';

interface DisappearanceSectionProps {
  formData: ChildFormData;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onPrev: () => void;
  onNext: () => void;
}

const DisappearanceSection: React.FC<DisappearanceSectionProps> = ({
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
        {t('forms.child.missingPersonInfo')}
      </h3>
      <Input
        label={t('forms.child.dateOfDisappearance')}
        name="last_seen_time"
        type="datetime-local"
        value={formData.last_seen_time}
        onChange={onInputChange}
      />
      <Input
        label={t('forms.child.disappearanceLocation', 'Last Known Location')}
        name="last_seen_location"
        value={formData.last_seen_location}
        onChange={onInputChange}
      />
      <Textarea
        label={t('forms.child.clothes', 'Clothes Worn When Last Seen')}
        name="last_seen_clothes"
        value={formData.last_seen_clothes}
        onChange={onInputChange}
      />
      <Textarea
        label={t('forms.child.medicalHistory', 'Medical History')}
        name="medical_condition"
        value={formData.medical_condition}
        onChange={onInputChange}
      />
      <Textarea
        label={t('forms.child.distinguishingMark')}
        name="physical_description"
        value={formData.physical_description}
        onChange={onInputChange}
      />
      <Textarea
        label={t('forms.child.additionalData')}
        name="additional_data"
        value={formData.additional_data}
        onChange={onInputChange}
      />
      <Textarea
        label={t('forms.child.previousDisputes')}
        name="additional_notes"
        value={formData.additional_notes}
        onChange={onInputChange}
      />
      <SectionButtons onPrev={onPrev} onNext={onNext} />
    </motion.div>
  );
};

export default DisappearanceSection;
