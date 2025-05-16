import React from 'react';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';
import { FaCamera, FaUpload, FaRedo, FaSync } from 'react-icons/fa';
import AnimatedFaceIcon from '../../AnimatedFaceIcon';
import { useTranslationWithFallback } from '../../../hooks/useTranslationWithFallback';

interface PhotoCaptureProps {
  useCamera: boolean;
  capturedImage: string | null;
  onToggleCamera: () => void;
  onCapture: () => void;
  onRetake: () => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  primaryColor?: string;
  webcamRef: React.RefObject<Webcam>;
  facingMode: 'user' | 'environment';
  onToggleFacingMode: () => void;
  previewImage?: File | null;
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({
  useCamera,
  capturedImage,
  onToggleCamera,
  onCapture,
  onRetake,
  onFileSelect,
  primaryColor = 'orange',
  webcamRef,
  facingMode,
  onToggleFacingMode,
  previewImage,
}) => {
  const { t } = useTranslationWithFallback();

  return (
    <div className="flex flex-col items-center">
      {/* Toggle between upload and camera capture */}
      <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
        <button
          type="button"
          onClick={onToggleCamera}
          className={`px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base bg-${primaryColor}-600 text-white rounded hover:bg-${primaryColor}-700`}
        >
          {useCamera
            ? t('registration.switchToUpload')
            : t('registration.switchToCamera')}
        </button>
        <div>
          {useCamera ? (
            <FaCamera className="text-white text-xl sm:text-2xl" />
          ) : (
            <FaUpload className="text-white text-xl sm:text-2xl" />
          )}
        </div>
      </div>

      {!useCamera ? (
        <div className="flex flex-col items-center">
          <label className="block text-white font-semibold mb-2 text-sm sm:text-base">
            {t('registration.uploadImage')}
          </label>
          <div
            className="cursor-pointer"
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            <AnimatedFaceIcon
              size="md"
              text={t('registration.clickToUpload')}
            />
            <input
              id="fileInput"
              type="file"
              accept="image/jpeg,image/png"
              onChange={onFileSelect}
              className="hidden"
            />
          </div>

          {previewImage && (
            <div className="mt-3 sm:mt-4 flex justify-center">
              <img
                src={URL.createObjectURL(previewImage)}
                alt="Preview"
                className="max-w-full max-h-48 sm:max-h-64 rounded shadow-md"
              />
            </div>
          )}
        </div>
      ) : (
        // Camera capture section
        <div className="flex flex-col items-center text-white w-full">
          {!capturedImage ? (
            <>
              <div
                className={`relative w-full max-w-xs sm:max-w-sm md:max-w-md rounded-lg overflow-hidden border-2 border-${primaryColor}-400`}
              >
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
                    <div
                      className={`w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 border-2 border-${primaryColor}-400 rounded-full opacity-50`}
                    ></div>
                  </div>
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M20,20 L20,30 L30,30 M70,30 L80,30 L80,20 M80,80 L80,70 L70,70 M30,70 L20,70 L20,80"
                      stroke={`#${primaryColor === 'orange' ? 'f97316' : primaryColor === 'purple' ? '9333ea' : 'f97316'}`}
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={onToggleFacingMode}
                  className={`absolute bottom-2 right-2 bg-${primaryColor}-600 text-white p-2 rounded-full hover:bg-${primaryColor}-700`}
                  aria-label="Switch camera"
                >
                  <FaSync className="text-sm" />
                </button>
              </div>
              <div className="flex space-x-2 mt-3 sm:mt-4">
                <button
                  type="button"
                  className={`px-4 sm:px-6 py-1.5 sm:py-2 bg-${primaryColor}-600 text-white rounded-lg hover:bg-${primaryColor}-700 flex items-center text-sm sm:text-base`}
                  onClick={onCapture}
                >
                  <FaCamera className="mr-2" /> {t('registration.capturePhoto')}
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
                onClick={onRetake}
              >
                <FaRedo className="mr-2" /> {t('registration.retakePhoto')}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PhotoCapture;
