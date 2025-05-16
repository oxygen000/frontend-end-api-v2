import React from 'react';
import { motion } from 'framer-motion';
import Input from '../../../components/Input';
import { SectionButtons, type WomanFormData } from '../shared';
import { useTranslationWithFallback } from '../../../hooks/useTranslationWithFallback';

interface CriminalRecordSectionProps {
  formData: WomanFormData;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onToggleCriminalRecord: () => void;
  onPrev: () => void;
  onNext: () => void;
}

const CriminalRecordSection: React.FC<CriminalRecordSectionProps> = ({
  formData,
  onInputChange,
  onToggleCriminalRecord,
  onPrev,
  onNext,
}) => {
  const { t } = useTranslationWithFallback();

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="space-y-3 sm:space-y-4"
    >
      <div className="flex items-center space-x-3 sm:space-x-4">
        <input
          type="checkbox"
          checked={formData.has_criminal_record}
          onChange={onToggleCriminalRecord}
          className="h-4 w-4 sm:h-5 sm:w-5"
        />
        <label className="text-sm sm:text-base">
          {t('registration.hasCriminalRecord', 'Has Criminal Record')}
        </label>
      </div>
      {formData.has_criminal_record && (
        <>
          <Input
            label={t('registration.caseDetails', 'Case Details')}
            name="case_details"
            value={formData.case_details}
            onChange={onInputChange}
          />
          <Input
            label={t('registration.policeStation', 'Police Station')}
            name="police_station"
            value={formData.police_station}
            onChange={onInputChange}
          />
          <Input
            label={t('registration.caseNumber', 'Case Number')}
            name="case_number"
            value={formData.case_number}
            onChange={onInputChange}
          />
          <Input
            label={t('registration.judgment', 'Judgment')}
            name="judgment"
            value={formData.judgment}
            onChange={onInputChange}
          />
          <Input
            label={t('registration.accusation', 'Accusation')}
            name="accusation"
            value={formData.accusation}
            onChange={onInputChange}
          />
        </>
      )}
      <SectionButtons onPrev={onPrev} onNext={onNext} primaryColor="pink" />
    </motion.div>
  );
};

export default CriminalRecordSection;
