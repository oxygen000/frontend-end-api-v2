import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import axios from 'axios';
import { FaCamera, FaUpload, FaRedo } from 'react-icons/fa';
import Webcam from 'react-webcam';
import AnimatedFaceIcon from '../../components/AnimatedFaceIcon';
import { handleImageUpload } from '../../utils/apiUtils';
import { PERSON_CATEGORIES } from '../../config/constants';

// SectionButtons component
const SectionButtons = ({
  onPrev,
  onNext,
  isSubmitting = false,
}: {
  onPrev?: () => void;
  onNext?: () => void;
  isSubmitting?: boolean;
}) => (
  <div className="flex justify-between mt-6">
    {onPrev && (
      <button
        type="button"
        onClick={onPrev}
        disabled={isSubmitting}
        className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
      >
        Previous
      </button>
    )}
    {onNext && (
      <button
        type="button"
        onClick={onNext}
        disabled={isSubmitting}
        className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors ml-auto disabled:opacity-50"
      >
        Next
      </button>
    )}
    {!onNext && (
      <button
        type="submit"
        disabled={isSubmitting}
        className={`px-4 py-2 ${
          isSubmitting ? 'bg-gray-500' : 'bg-blue-600'
        } text-white rounded-md`}
      >
        {isSubmitting ? 'Processing...' : 'Submit'}
      </button>
    )}
  </div>
);

interface FormData {
  // Basic information (essential)
  name: string;
  dob: string;
  gender: string;

  // Guardian information (essential)
  guardianName: string;
  guardianPhone: string;
  relationship: string;

  // Disappearance details (essential)
  lastSeenTime: string;
  lastClothes: string;
  lastKnownLocation: string;

  // Physical description (essential)
  physicalDesc: string;

  // Additional information (optional)
  additionalNotes: string;

  // New field for form_type
  form_type: string;
}

function AddNormalChild() {
  const [currentSection, setCurrentSection] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    // Basic information (essential)
    name: '',
    dob: '',
    gender: '',

    // Guardian information (essential)
    guardianName: '',
    guardianPhone: '',
    relationship: '',

    // Disappearance details (essential)
    lastSeenTime: '',
    lastClothes: '',
    lastKnownLocation: '',

    // Physical description (essential)
    physicalDesc: '',

    // Additional information (optional)
    additionalNotes: '',

    // New field for form_type
    form_type: 'child',
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [useCamera, setUseCamera] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  // Add these functions for webcam functionality
  const handleToggleCamera = () => {
    setUseCamera(!useCamera);
    setCapturedImage(null);
  };

  const captureImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  // Add state for storing the user ID from response
  const [registeredUserId, setRegisteredUserId] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      setCapturedImage(null);
    } else {
      alert('File size exceeds 5MB');
    }
  };

  // Unified validation function
  const validateForm = () => {
    const errors: string[] = [];

    // Validate based on current section
    if (currentSection === 1) {
      if (!formData.name) errors.push("Child's Name is required");
      if (!formData.dob) errors.push('Date of Birth is required');
      if (!formData.gender) errors.push('Gender is required');
    } else if (currentSection === 2) {
      if (!formData.guardianName) errors.push("Guardian's Name is required");
      if (!formData.guardianPhone) errors.push("Guardian's Phone is required");
      if (!formData.relationship)
        errors.push('Relationship to child is required');
    } else if (currentSection === 3) {
      if (!formData.lastSeenTime)
        errors.push('Last Seen (Date & Time) is required');
      if (!formData.lastClothes) errors.push('Clothes Worn is required');
      if (!formData.lastKnownLocation)
        errors.push('Last Known Location is required');
      if (!capturedImage) errors.push("Child's Photo is required");
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
    setFormData({
      name: '',
      dob: '',
      gender: '',
      guardianName: '',
      guardianPhone: '',
      relationship: '',
      lastSeenTime: '',
      lastClothes: '',
      lastKnownLocation: '',
      physicalDesc: '',
      additionalNotes: '',
      form_type: 'child',
    });
    setCapturedImage(null);
    setCurrentSection(1);
    setFormErrors([]);
    setSubmitSuccess(false);
    setIsSubmitting(false);
  };

  // Unified form submission function
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Prepare form data
      const submissionData = {
        name: formData.name,
        dob: formData.dob,
        gender: formData.gender,
        guardian_name: formData.guardianName,
        guardian_phone: formData.guardianPhone,
        relationship: formData.relationship,
        last_seen_time: formData.lastSeenTime,
        last_clothes: formData.lastClothes,
        area_of_disappearance: formData.lastKnownLocation,
        physical_description: formData.physicalDesc,
        notes: formData.additionalNotes || '',
        // Add required fields for UserData type
        national_id: '',
        address: '',
        phone_number: '',
        phone_company: '',
        category: PERSON_CATEGORIES.CHILD,
        form_type: 'child',
      };

      // Submit to API
      const response = await handleImageUpload(
        null,
        capturedImage,
        submissionData,
        PERSON_CATEGORIES.CHILD
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
      console.error('Error registering child:', error);

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

  return (
    <div className="p-6">
      {/* "Back" Button */}
      <div>
        <Link
          to="/home"
          className="inline-flex items-center text-white hover:text-orange-300 transition-colors"
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
          {[1, 2, 3].map((step, idx) => (
            <React.Fragment key={step}>
              {idx > 0 && (
                <div className="w-16 h-1 bg-gray-300">
                  <div
                    className={`h-full ${currentSection >= step ? 'bg-orange-600' : 'bg-gray-300'}`}
                  ></div>
                </div>
              )}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  currentSection === step
                    ? 'bg-orange-600 text-white scale-110'
                    : currentSection > step
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                }`}
              >
                {step}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {submitSuccess ? (
        <motion.div
          className="max-w-2xl mx-auto bg-orange-500/20 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-orange-300/30 text-white mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-4 text-center">
            Child Report Submitted
          </h2>
          <p className="text-center">
            Thank you for submitting this report. The information has been
            recorded successfully.
          </p>

          {registeredUserId && (
            <div className="mt-4 p-3 bg-white/10 rounded-lg">
              <p className="text-center font-medium">Case Reference ID:</p>
              <p className="text-center text-xl font-bold">
                {registeredUserId}
              </p>
              <p className="text-center text-sm mt-2">
                Please save this ID for future reference
              </p>
            </div>
          )}

          <div className="flex justify-center mt-6 space-x-4">
            <button
              onClick={clearForm}
              className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
            >
              Submit Another Report
            </button>

            {registeredUserId && (
              <button
                onClick={() =>
                  (window.location.href = `/view/${registeredUserId}`)
                }
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                View Details
              </button>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.form
          onSubmit={handleFormSubmit}
          className="max-w-2xl mx-auto bg-white/20 backdrop-blur-lg p-10 mt-6 rounded-2xl shadow-[0_0_30px_5px_rgba(255,165,0,0.3)] text-white border border-white/30 space-y-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-center mb-6">
            Child Registration
          </h2>

          {/* Display form errors */}
          {formErrors.length > 0 && (
            <div className="bg-red-500/20 p-3 rounded-lg border border-red-500/30 mb-4">
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
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <Input
                label="Child's Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
              <Input
                label="Date of Birth"
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleInputChange}
              />
              <div>
                <label className="block font-medium mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <SectionButtons onNext={nextSection} />
            </motion.div>
          )}

          {/* Section 2: Guardian Information */}
          {currentSection === 2 && (
            <motion.div
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold">Guardian Information</h3>
              <Input
                label="Guardian's Name"
                name="guardianName"
                value={formData.guardianName}
                onChange={handleInputChange}
              />
              <Input
                label="Guardian's Phone Number"
                name="guardianPhone"
                value={formData.guardianPhone}
                onChange={handleInputChange}
              />
              <div>
                <label className="block font-medium mb-1">
                  Relationship to Child
                </label>
                <select
                  name="relationship"
                  value={formData.relationship}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Relationship</option>
                  <option value="parent">Parent</option>
                  <option value="grandparent">Grandparent</option>
                  <option value="sibling">Sibling</option>
                  <option value="aunt/uncle">Aunt/Uncle</option>
                  <option value="legalGuardian">Legal Guardian</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <SectionButtons onPrev={prevSection} onNext={nextSection} />
            </motion.div>
          )}

          {/* Section 3: Disappearance Details & Photo */}
          {currentSection === 3 && (
            <motion.div
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold">Disappearance Details</h3>
              <Input
                label="Last Seen (Date & Time)"
                name="lastSeenTime"
                type="datetime-local"
                value={formData.lastSeenTime}
                onChange={handleInputChange}
              />
              <Input
                label="Last Known Location"
                name="lastKnownLocation"
                value={formData.lastKnownLocation}
                onChange={handleInputChange}
              />
              <Textarea
                label="Clothes Worn When Last Seen"
                name="lastClothes"
                value={formData.lastClothes}
                onChange={handleInputChange}
              />
              <Textarea
                label="Physical Description"
                name="physicalDesc"
                value={formData.physicalDesc}
                onChange={handleInputChange}
              />
              <Textarea
                label="Additional Notes"
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleInputChange}
              />

              {/* Upload image option */}
              <div className="flex flex-col items-center">
                <label className="block text-white font-semibold mb-2">
                  Upload Child's Photo
                </label>

                {/* Toggle between upload and camera capture */}
                <div className="flex items-center space-x-4 mb-4">
                  <button
                    type="button"
                    onClick={handleToggleCamera}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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

                {!useCamera ? (
                  <div
                    className="cursor-pointer"
                    onClick={() =>
                      document.getElementById('fileInput')?.click()
                    }
                  >
                    <AnimatedFaceIcon size="md" text="Click to upload" />
                    <input
                      id="fileInput"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                ) : (
                  // Camera capture section
                  <div className="flex flex-col items-center text-white">
                    {!capturedImage ? (
                      <>
                        <div className="relative w-full max-w-md rounded-lg overflow-hidden border-2 border-blue-400">
                          <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{
                              width: 480,
                              height: 480,
                              facingMode: 'user',
                            }}
                            className="w-full"
                          />
                          <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
                            <svg
                              width="100%"
                              height="100%"
                              viewBox="0 0 100 100"
                              preserveAspectRatio="none"
                            >
                              <path
                                d="M20,20 L20,30 L30,30 M70,30 L80,30 L80,20 M80,80 L80,70 L70,70 M30,70 L20,70 L20,80"
                                stroke="#3b82f6"
                                strokeWidth="2"
                                fill="none"
                              />
                            </svg>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                          onClick={captureImage}
                        >
                          <FaCamera className="mr-2" /> Capture Photo
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="relative w-full max-w-md rounded-lg overflow-hidden border-2 border-green-400">
                          <img
                            src={capturedImage}
                            alt="Captured"
                            className="w-full"
                          />
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
                          className="mt-4 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
                          onClick={retakePhoto}
                        >
                          <FaRedo className="mr-2" /> Retake Photo
                        </button>
                      </>
                    )}
                  </div>
                )}

                {capturedImage && !useCamera && (
                  <img
                    src={capturedImage}
                    alt="Preview"
                    className="mt-2 w-32 h-32 object-cover rounded-md shadow-md"
                  />
                )}
              </div>
              <SectionButtons
                onPrev={prevSection}
                isSubmitting={isSubmitting}
              />
            </motion.div>
          )}
        </motion.form>
      )}
    </div>
  );
}

export default AddNormalChild;
