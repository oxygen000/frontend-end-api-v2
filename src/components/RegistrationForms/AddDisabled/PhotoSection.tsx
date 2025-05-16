import React from 'react';
import type { RefObject } from 'react';
import { motion } from 'framer-motion';
import Webcam from 'react-webcam';
import {
  PhotoCapture,
  SectionButtons,
  SubmitButton,
  type DisabledFormData,
} from '../shared';
import { useTranslationWithFallback } from '../../../hooks/useTranslationWithFallback';
import { sectionVariants, transition } from '../../../config/animations';

interface PhotoSectionProps {
  formData: DisabledFormData;
  capturedImage: string | null;
  webcamRef: RefObject<Webcam>;
  facingMode: 'user' | 'environment';
  onToggleCamera: () => void;
  onToggleFacingMode: () => void;
  onCaptureImage: () => void;
  onRetakePhoto: () => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPrev: () => void;
  isSubmitting: boolean;
}

const PhotoSection: React.FC<PhotoSectionProps> = ({
  formData,
  capturedImage,
  webcamRef,
  facingMode,
  onToggleCamera,
  onToggleFacingMode,
  onCaptureImage,
  onRetakePhoto,
  onFileSelect,
  onPrev,
  isSubmitting,
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
        {t('registration.photo', "Person's Photo")}
      </h3>
      <p className="text-white/80 text-sm sm:text-base">
        {t('registration.photoInstructions')}
      </p>

      <PhotoCapture
        useCamera={formData.useCamera}
        capturedImage={capturedImage}
        onToggleCamera={onToggleCamera}
        onCapture={onCaptureImage}
        onRetake={onRetakePhoto}
        onFileSelect={onFileSelect}
        webcamRef={webcamRef}
        facingMode={facingMode}
        onToggleFacingMode={onToggleFacingMode}
        previewImage={formData.image}
        primaryColor="purple"
      />

      <SectionButtons onPrev={onPrev} primaryColor="purple" />

      {/* Submit Button */}
      <div className="mt-6 sm:mt-8 flex flex-col items-center">
        <SubmitButton isSubmitting={isSubmitting} primaryColor="pink" />
      </div>
    </motion.div>
  );
};

export default PhotoSection;
