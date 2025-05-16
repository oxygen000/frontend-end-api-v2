import React from 'react';
import type { RefObject } from 'react';
import { motion } from 'framer-motion';
import { FaCamera, FaUpload, FaRedo, FaSync } from 'react-icons/fa';
import Webcam from 'react-webcam';
import AnimatedFaceIcon from '../../../components/AnimatedFaceIcon';
import { SectionButtons, SubmitButton, type WomanFormData } from '../shared';
import { useTranslationWithFallback } from '../../../hooks/useTranslationWithFallback';

interface PhotoSectionProps {
  formData: WomanFormData;
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
      initial={{ x: 30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="space-y-3 sm:space-y-4"
    >
      {/* Toggle between upload and camera capture */}
      <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
        <button
          type="button"
          onClick={onToggleCamera}
          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-pink-600 text-white rounded hover:bg-pink-700 text-sm sm:text-base"
        >
          {formData.useCamera
            ? t('registration.switchToUpload', 'Switch to Upload')
            : t('registration.switchToCapture', 'Switch to Capture')}
        </button>
        <div>
          {formData.useCamera ? (
            <FaCamera className="text-white text-xl sm:text-2xl" />
          ) : (
            <FaUpload className="text-white text-xl sm:text-2xl" />
          )}
        </div>
      </div>

      {/* Upload image option */}
      {!formData.useCamera ? (
        <div className="flex flex-col items-center">
          <label className="block text-white font-semibold mb-2 text-sm sm:text-base">
            {t('registration.uploadImage', 'Upload Image')}
          </label>
          <div
            className="cursor-pointer"
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            <AnimatedFaceIcon
              size="md"
              text={t('registration.clickToUpload', 'Click to upload')}
              color="#ffff"
            />
          </div>
          <input
            id="fileInput"
            type="file"
            name="image"
            onChange={onFileSelect}
            accept="image/jpeg,image/png"
            className="hidden"
          />
        </div>
      ) : (
        // Camera capture section
        <div className="flex flex-col items-center text-white w-full">
          {!capturedImage ? (
            <>
              <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md rounded-lg overflow-hidden border-2 border-pink-400">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{
                    width: 480,
                    height: 480,
                    facingMode: facingMode,
                  }}
                  className="w-full"
                />
                <div className="absolute inset-0 pointer-events-none">
                  {/* Face alignment guide */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 border-2 border-pink-400 rounded-full opacity-50"></div>
                  </div>
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M20,20 L20,30 L30,30 M70,30 L80,30 L80,20 M80,80 L80,70 L70,70 M30,70 L20,70 L20,80"
                      stroke="#ec4899"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={onToggleFacingMode}
                  className="absolute bottom-2 right-2 bg-pink-600 text-white p-2 rounded-full hover:bg-pink-700"
                  aria-label="Switch camera"
                >
                  <FaSync className="text-sm" />
                </button>
              </div>

              <div className="flex space-x-2 mt-3 sm:mt-4">
                <button
                  type="button"
                  className="px-4 sm:px-6 py-1.5 sm:py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 flex items-center text-sm sm:text-base"
                  onClick={onCaptureImage}
                >
                  <FaCamera className="mr-2" />{' '}
                  {t('registration.capturePhoto', 'Capture Photo')}
                </button>
                <button
                  type="button"
                  className="px-4 sm:px-6 py-1.5 sm:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center text-sm sm:text-base"
                  onClick={onToggleFacingMode}
                >
                  <FaSync className="mr-2" />{' '}
                  {facingMode === 'user'
                    ? t('registration.switchToBackCamera', 'Back Camera')
                    : t('registration.switchToFrontCamera', 'Front Camera')}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md rounded-lg overflow-hidden border-2 border-green-400">
                <img src={capturedImage} alt="Captured" className="w-full" />
                <div className="absolute top-2 right-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-green-500 text-white p-2 rounded-full"
                  >
                    ✓
                  </motion.div>
                </div>
              </div>
              <button
                type="button"
                className="mt-3 sm:mt-4 px-4 sm:px-6 py-1.5 sm:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center text-sm sm:text-base"
                onClick={onRetakePhoto}
              >
                <FaRedo className="mr-2" />{' '}
                {t('registration.retakePhoto', 'Retake Photo')}
              </button>
            </>
          )}
        </div>
      )}

      {/* Image preview - only show for uploaded images */}
      {formData.image && !formData.useCamera && (
        <div className="mt-3 sm:mt-4 flex justify-center">
          <img
            src={URL.createObjectURL(formData.image)}
            alt="Preview"
            className="max-w-full max-h-48 sm:max-h-64 rounded shadow-md"
          />
        </div>
      )}

      <SectionButtons onPrev={onPrev} primaryColor="pink" />

      {/* Submit Button */}
      <div className="mt-6 sm:mt-8 flex flex-col items-center">
        <SubmitButton isSubmitting={isSubmitting} primaryColor="pink" />
      </div>
    </motion.div>
  );
};

export default PhotoSection;
