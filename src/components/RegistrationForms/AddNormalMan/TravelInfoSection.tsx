import React from 'react';
import { motion } from 'framer-motion';
import Input from '../../../components/Input';
import { SectionButtons, type ManFormData } from '../shared';
import { useTranslationWithFallback } from '../../../hooks/useTranslationWithFallback';

interface TravelInfoSectionProps {
  formData: ManFormData;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onPrev: () => void;
  onNext: () => void;
}

const TravelInfoSection: React.FC<TravelInfoSectionProps> = ({
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
        {t('registration.travelInfo', 'Travel Information')}
      </h3>
      <Input
        label={t('registration.travelDate', 'Travel Date')}
        name="travel_date"
        type="date"
        value={formData.travel_date}
        onChange={onInputChange}
      />
      <Input
        label={t(
          'registration.travelDestination',
          'Travel Destination'
        )}
        name="travel_destination"
        value={formData.travel_destination}
        onChange={onInputChange}
      />
      <Input
        label={t('registration.arrivalAirport', 'Arrival Airport')}
        name="arrival_airport"
        value={formData.arrival_airport}
        onChange={onInputChange}
      />
      <Input
        label={t('registration.arrivalDate', 'Arrival Date')}
        name="arrival_date"
        type="date"
        value={formData.arrival_date}
        onChange={onInputChange}
      />
      <Input
        label={t('registration.flightNumber', 'Flight Number')}
        name="flight_number"
        value={formData.flight_number}
        onChange={onInputChange}
      />
      <Input
        label={t('registration.returnDate', 'Return Date')}
        name="return_date"
        type="date"
        value={formData.return_date}
        onChange={onInputChange}
      />
      <SectionButtons onPrev={onPrev} onNext={onNext} primaryColor="blue" />
    </motion.div>
  );
};

export default TravelInfoSection; 