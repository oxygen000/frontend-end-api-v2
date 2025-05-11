import React, { useState, useRef } from 'react';
import AnimatedFaceIcon from '../../components/AnimatedFaceIcon';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import axios from 'axios';
import { FaCamera, FaUpload, FaRedo } from 'react-icons/fa';
import Webcam from 'react-webcam';
import { handleImageUpload } from '../../utils/apiUtils';
import { PERSON_CATEGORIES } from '../../config/constants';

// SectionButtons component
const SectionButtons = ({
  onPrev,
  onNext,
}: {
  onPrev?: () => void;
  onNext?: () => void;
}) => (
  <div className="flex justify-between mt-6">
    {onPrev && (
      <button
        type="button"
        onClick={onPrev}
        className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
      >
        Previous
      </button>
    )}
    {onNext && (
      <button
        type="button"
        onClick={onNext}
        className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors ml-auto"
      >
        Next
      </button>
    )}
    {!onNext && (
      <button
        type="submit"
        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors ml-auto"
      >
        Submit
      </button>
    )}
  </div>
);

function AddDisabled() {
  const [currentSection, setCurrentSection] = useState(1);
  const [useCamera, setUseCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const webcamRef = useRef<Webcam>(null);
  const [, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [, setRegisteredUserId] = useState<string | null>(null);

  // Form data structure
  const [personDetails, setPersonDetails] = useState({
    // Basic information
    name: '',
    dob: '',
    gender: '',
    nationalId: '',
    address: '',

    // Contact information
    phoneNumber: '',
    secondaryPhone: '',

    // Disability information
    disabilityType: '',
    disabilityDetails: '',
    medicalConditions: '',
    medications: '',

    // Additional information
    additionalNotes: '',
    guardianName: '',
    guardianPhone: '',
    relationship: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setPersonDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setCapturedImage(null);
    } else {
      alert('File size exceeds 5MB');
    }
  };

  const handleToggleCamera = () => {
    setUseCamera(!useCamera);
    setSelectedImage(null);
    setPreviewUrl('');
    setCapturedImage(null);
  };

  const captureImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      setSelectedImage(null);
      setPreviewUrl('');
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  // Unified validation function
  const validateForm = () => {
    const errors: string[] = [];

    // Validate based on current section
    if (currentSection === 1) {
      if (!personDetails.name) errors.push("Person's Name is required");
      if (!personDetails.dob) errors.push('Date of Birth is required');
      if (!personDetails.gender) errors.push('Gender is required');
    } else if (currentSection === 2) {
      if (!personDetails.phoneNumber) errors.push('Phone Number is required');
      if (!personDetails.address) errors.push('Address is required');
    } else if (currentSection === 3) {
      if (!personDetails.disabilityType)
        errors.push('Disability Type is required');
      if (!selectedImage && !capturedImage)
        errors.push("Person's Photo is required");
    }

    setFormErrors(errors);

    // If there are errors, scroll to the error section
    if (errors.length > 0) {
      setTimeout(() => {
        document
          .querySelector('.bg-red-500\\/20')
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }

    return errors.length === 0;
  };

  // Unified next section function
  const nextSection = () => {
    if (validateForm()) {
      setCurrentSection(currentSection + 1);
      // Scroll to top of form when changing sections
      setTimeout(() => {
        document
          .querySelector('form')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  // Unified previous section function
  const prevSection = () => {
    setCurrentSection(currentSection - 1);
    // Scroll to top of form when changing sections
    setTimeout(() => {
      document
        .querySelector('form')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const clearForm = () => {
    setPersonDetails({
      name: '',
      dob: '',
      gender: '',
      nationalId: '',
      address: '',
      phoneNumber: '',
      secondaryPhone: '',
      disabilityType: '',
      disabilityDetails: '',
      medicalConditions: '',
      medications: '',
      additionalNotes: '',
      guardianName: '',
      guardianPhone: '',
      relationship: '',
    });
    setSelectedImage(null);
    setPreviewUrl('');
    setCapturedImage(null);
    setCurrentSection(1);
    setFormErrors([]);
    setSubmitSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = {
        ...personDetails,
        guardian_name: personDetails.guardianName,
        guardian_phone: personDetails.guardianPhone,
        relationship: personDetails.relationship,
        national_id: personDetails.nationalId || '',
        phone_number: personDetails.phoneNumber || '',
        phone_company: '', // Add required field
        category: PERSON_CATEGORIES.DISABLED // Add required category field
      };

      if (!selectedImage && !capturedImage) {
        throw new Error("Person's Photo is required");
      }

      // Submit to API
      const response = await handleImageUpload(
        selectedImage,
        capturedImage,
        formData,
        PERSON_CATEGORIES.DISABLED
      );

      console.log('Registration successful:', response);

      // Show success message and store the user ID from response
      setSubmitSuccess(true);
      if (response && response.user_id) {
        setRegisteredUserId(response.user_id);
      }

      // Reset form after delay
      setTimeout(() => {
        clearForm();
      }, 5000);
    } catch (error) {
      console.error('Registration failed:', error);

      // Handle API errors
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with an error
          const errorMessage =
            error.response.data?.message || 'Unknown server error';
          setFormErrors([errorMessage]);
        } else if (error.request) {
          // No response received
          setFormErrors([
            'No response from server. Please check your internet connection.',
          ]);
        } else {
          // Request setup error
          setFormErrors(['Error setting up request. Please try again.']);
        }
      } else {
        // Non-Axios error
        setFormErrors([
          (error as Error).message || 'An unknown error occurred',
        ]);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const indicatorClasses = (num: number) =>
    num <= currentSection
      ? 'bg-purple-600 text-white'
      : 'bg-gray-200 text-gray-500';

  return (
    <>
      {/* "Back" Button */}
      <div className="mt-6">
        <Link
          to="/home"
          className="inline-flex items-center text-white hover:text-purple-300 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Home
        </Link>
      </div>

      {/* Form Progress Indicator */}
      <div className="flex justify-center mt-6">
        <div className="flex items-center space-x-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${indicatorClasses(1)}`}
          >
            1
          </div>
          <div className="w-16 h-1 bg-gray-300">
            <div
              className={`h-full ${currentSection >= 2 ? 'bg-purple-600' : 'bg-gray-300'}`}
            ></div>
          </div>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${indicatorClasses(2)}`}
          >
            2
          </div>
          <div className="w-16 h-1 bg-gray-300">
            <div
              className={`h-full ${currentSection >= 3 ? 'bg-purple-600' : 'bg-gray-300'}`}
            ></div>
          </div>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${indicatorClasses(3)}`}
          >
            3
          </div>
        </div>
      </div>

      {submitSuccess ? (
        <motion.div
          className="max-w-xl mx-auto bg-purple-500/20 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-purple-300/30 text-white mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold mb-4">
            Accompanying Person Report Submitted
          </h2>
          <p>
            Thank you for submitting this report. The information has been
            recorded successfully.
          </p>
          <p className="mt-4">
            Case reference:{' '}
            {Math.random().toString(36).substring(2, 10).toUpperCase()}
          </p>
          <button
            onClick={clearForm}
            className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Submit Another Report
          </button>
        </motion.div>
      ) : (
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6 max-w-xl mx-auto 
             bg-white/20 backdrop-blur-lg 
             p-8 rounded-2xl 
             shadow-[0_0_30px_5px_rgba(128,0,128,0.5)] 
             border border-white/30 
             text-white"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-center mb-6">
            Accompanying Person Registration
          </h2>

          {/* Display form errors */}
          {formErrors.length > 0 && (
            <div className="bg-red-500/20 p-3 rounded-lg border border-red-500/30">
              <ul className="list-disc pl-5">
                {formErrors.map((error, index) => (
                  <li key={index} className="text-red-200">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section 1: Basic Information */}
          {currentSection === 1 && (
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <Input
                label="Full Name"
                name="name"
                value={personDetails.name}
                onChange={handleInputChange}
              />
              <Input
                label="Date of Birth"
                name="dob"
                type="date"
                value={personDetails.dob}
                onChange={handleInputChange}
              />
              <div>
                <label className="block font-medium mb-1">Gender</label>
                <select
                  name="gender"
                  value={personDetails.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <Input
                label="National ID"
                name="nationalId"
                value={personDetails.nationalId}
                onChange={handleInputChange}
              />
              <SectionButtons onNext={nextSection} />
            </motion.div>
          )}

          {/* Section 2: Contact Information */}
          {currentSection === 2 && (
            <motion.div
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold">Contact Information</h3>
              <Input
                label="Phone Number"
                name="phoneNumber"
                value={personDetails.phoneNumber}
                onChange={handleInputChange}
              />
              <Input
                label="Secondary Phone (Optional)"
                name="secondaryPhone"
                value={personDetails.secondaryPhone}
                onChange={handleInputChange}
              />
              <Textarea
                label="Address"
                name="address"
                value={personDetails.address}
                onChange={handleInputChange}
              />
              <SectionButtons onPrev={prevSection} onNext={nextSection} />
            </motion.div>
          )}

          {/* Section 3: Disability Information & Photo */}
          {currentSection === 3 && (
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold">Disability Information</h3>
              <div>
                <label className="block font-medium mb-1">
                  Disability Type
                </label>
                <select
                  name="disabilityType"
                  value={personDetails.disabilityType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Disability Type</option>
                  <option value="physical">Physical</option>
                  <option value="visual">Visual</option>
                  <option value="hearing">Hearing</option>
                  <option value="cognitive">Cognitive</option>
                  <option value="multiple">Multiple Disabilities</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <Textarea
                label="Disability Details"
                name="disabilityDetails"
                value={personDetails.disabilityDetails}
                onChange={handleInputChange}
              />
              <Textarea
                label="Medical Conditions (Optional)"
                name="medicalConditions"
                value={personDetails.medicalConditions}
                onChange={handleInputChange}
              />
              <Input
                label="Medications (Optional)"
                name="medications"
                value={personDetails.medications}
                onChange={handleInputChange}
              />

              {/* Toggle between upload and camera capture */}
              <div className="flex items-center space-x-4 mb-4">
                <button
                  type="button"
                  onClick={handleToggleCamera}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  {useCamera ? 'Switch to Upload' : 'Switch to Camera'}
                </button>
                <div>
                  {useCamera ? (
                    <FaCamera className="text-white text-2xl" />
                  ) : (
                    <FaUpload className="text-white text-2xl" />
                  )}
                </div>
              </div>

              {/* Upload image option */}
              {!useCamera ? (
                <div className="flex flex-col items-center">
                  <label className="block text-white font-semibold mb-2">
                    Upload Person's Photo
                  </label>
                  <div
                    className="cursor-pointer"
                    onClick={() =>
                      document.getElementById('fileInput')?.click()
                    }
                  >
                    <AnimatedFaceIcon size="md" text="Click to upload" />
                  </div>
                  <input
                    id="fileInput"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="mt-2 w-32 h-32 object-cover rounded-md shadow-md"
                    />
                  )}
                </div>
              ) : (
                // Camera capture section
                <div className="flex flex-col items-center text-white">
                  {!capturedImage ? (
                    <>
                      <div className="relative w-full max-w-md rounded-lg overflow-hidden border-2 border-purple-400">
                        <Webcam
                          audio={false}
                          ref={webcamRef}
                          screenshotFormat="image/jpeg"
                          videoConstraints={{
                            width: 480,
                            height: 480,
                            facingMode: 'user',
                          }}
                        />
                        <button
                          type="button"
                          onClick={captureImage}
                          className="absolute bottom-4 right-4 bg-purple-600 text-white p-2 rounded"
                        >
                          <FaCamera className="text-white text-2xl" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={retakePhoto}
                        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        Retake Photo
                      </button>
                    </>
                  ) : (
                    <div className="w-32 h-32">
                      <img
                        src={capturedImage}
                        alt="Captured"
                        className="object-cover w-full h-full rounded-md shadow-md"
                      />
                      <button
                        type="button"
                        onClick={retakePhoto}
                        className="absolute top-2 right-2 bg-purple-600 text-white p-2 rounded"
                      >
                        <FaRedo className="text-white text-2xl" />
                      </button>
                    </div>
                  )}
                </div>
              )}
              <SectionButtons onPrev={prevSection} />
            </motion.div>
          )}
        </motion.form>
      )}
    </>
  );
}

export default AddDisabled;
