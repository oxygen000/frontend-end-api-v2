import React, { useState, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';
import { FaCamera, FaRedo, FaUpload } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import AnimatedFaceIcon from '../../components/AnimatedFaceIcon';
import { recognizeFace, recognizeFaceBase64 } from '../../utils/apiUtils';

function Identification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get('id');

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      setCapturedImage(null);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Capture image from webcam
  const captureImage = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImage(imageSrc);
        setUploadedImage(null);
        setUploadedImagePreview(null);
      }
    }
  }, [webcamRef]);

  // Reset captured/uploaded image
  const resetImage = () => {
    setCapturedImage(null);
    setUploadedImage(null);
    setUploadedImagePreview(null);
    setError(null);
  };

  // Toggle camera
  const toggleCamera = () => {
    setShowCamera((prev) => !prev);
    if (!showCamera) {
      setCapturedImage(null);
    }
  };

  // Trigger file input click
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Identify person
  const identifyPerson = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let result;

      // Use the appropriate recognition method based on input type
      if (capturedImage) {
        // Use base64 recognition
        result = await recognizeFaceBase64(
          capturedImage,
          preselectedId || undefined
        );
      } else if (uploadedImage) {
        // Use file upload recognition
        result = await recognizeFace(uploadedImage, preselectedId || undefined);
      } else {
        toast.error('Please capture or upload an image first');
        setIsLoading(false);
        return;
      }

      // Handle successful identification
      if (result.recognized) {
        toast.success(`Identified: ${result.username}`);
        // Navigate to the user's page
        navigate(`/users/${result.user_id}`);
      } else {
        setError(
          result.message ||
            'No match found. Please try again with a clearer image.'
        );
        toast.error(
          result.message ||
            'No match found. Please try again with a clearer image.'
        );
      }
    } catch (error) {
      console.error('Error during identification:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [capturedImage, uploadedImage, navigate, preselectedId]);

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-white">Face Identification</h1>
        <p className="text-gray-300 mt-2">
          {preselectedId
            ? "Verify this person's identity"
            : 'Upload or capture an image to identify a person'}
        </p>
      </motion.div>

      <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg p-6 shadow-lg">
        <div className="flex flex-col items-center">
          {/* Image Display Area */}
          <div className="w-full max-w-md h-80 bg-gray-700 rounded-lg mb-6 overflow-hidden flex items-center justify-center">
            {showCamera && !capturedImage ? (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: 'user' }}
                className="w-full h-full object-cover"
              />
            ) : capturedImage ? (
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-full object-contain"
              />
            ) : uploadedImagePreview ? (
              <img
                src={uploadedImagePreview}
                alt="Uploaded"
                className="w-full h-full object-contain"
              />
            ) : (
              <AnimatedFaceIcon size="lg" color="#4B5563" />
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4 justify-center mb-6">
            {!showCamera && !capturedImage && !uploadedImage && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleCamera}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2"
                >
                  <FaCamera /> Use Camera
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={triggerFileUpload}
                  className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center gap-2"
                >
                  <FaUpload /> Upload Image
                </motion.button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
              </>
            )}

            {showCamera && !capturedImage && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={captureImage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2"
                >
                  <FaCamera /> Capture
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleCamera}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md"
                >
                  Cancel
                </motion.button>
              </>
            )}

            {(capturedImage || uploadedImage) && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetImage}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md flex items-center gap-2"
                >
                  <FaRedo /> Reset
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={identifyPerson}
                  disabled={isLoading}
                  className={`px-4 py-2 ${isLoading ? 'bg-gray-500' : 'bg-green-600'} text-white rounded-md`}
                >
                  {isLoading ? 'Processing...' : 'Identify Person'}
                </motion.button>
              </>
            )}
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-md text-red-100 mb-4"
            >
              {error}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Identification;
