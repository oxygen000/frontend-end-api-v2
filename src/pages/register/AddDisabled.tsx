import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import { Link } from 'react-router-dom';
import { FaCamera, FaUpload, FaRedo } from 'react-icons/fa';
import AnimatedFaceIcon from '../../components/AnimatedFaceIcon';
import Webcam from 'react-webcam';
import { toast } from 'react-hot-toast';
import { registrationApi } from '../../services/api';

interface FormData {
  // Basic information
  name: string;
  dob: string;
  gender: string;
  national_id: string;
  address: string;

  // Contact information
  phone_number: string;
  phone_company: string;
  second_phone_number: string;

  // Disability information
  disability_type: string;
  disability_description: string;
  medical_condition: string;
  special_needs: string;
  emergency_contact: string;
  emergency_phone: string;

  // Additional information
  additional_notes: string;
  guardian_name: string;
  guardian_phone: string;
  relationship: string;
  form_type: string;
  image: File | null;
  useCamera: boolean;
}

const initialFormData: FormData = {
  name: '',
  dob: '',
  gender: '',
  national_id: '',
  address: '',
  phone_number: '',
  phone_company: '',
  second_phone_number: '',
  disability_type: '',
  disability_description: '',
  medical_condition: '',
  special_needs: '',
  emergency_contact: '',
  emergency_phone: '',
  additional_notes: '',
  guardian_name: '',
  guardian_phone: '',
  relationship: '',
  form_type: 'disabled',
  image: null,
  useCamera: false,
};

function AddDisabled() {
  const [currentSection, setCurrentSection] = useState(1);
  const [useCamera, setUseCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form data structure
  const [personDetails, setPersonDetails] = useState<FormData>(initialFormData);

  // Moved inside component to access loading state
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
          disabled={loading}
          className={`px-6 py-2 ${loading ? 'bg-gray-500' : 'bg-green-600 hover:bg-green-700'} text-white rounded-md transition-colors ml-auto flex items-center`}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </>
          ) : (
            'Submit'
          )}
        </button>
      )}
    </div>
  );

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
      setPersonDetails((prev) => ({
        ...prev,
        image: file,
      }));
    } else if (file) {
      alert('File size exceeds 5MB');
    }
  };

  const handleToggleCamera = () => {
    setUseCamera(!useCamera);
    setPersonDetails((prev) => ({
      ...prev,
      useCamera: !useCamera,
      image: null,
    }));
  };

  const captureImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImage(imageSrc);
      }
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
      if (!personDetails.phone_number) errors.push('Phone Number is required');
      if (!personDetails.address) errors.push('Address is required');
    } else if (currentSection === 3) {
      if (!personDetails.disability_type)
        errors.push('Disability Type is required');
    } else if (currentSection === 4) {
      if (!personDetails.image && !capturedImage)
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

  // Handle form submission with better error handling
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Create a FormData object to handle file upload
      const formDataToSend = new FormData();

      // Basic user fields - match exactly what the backend expects
      formDataToSend.append('name', personDetails.name);
      formDataToSend.append('nickname', personDetails.name.split(' ')[0] || '');
      formDataToSend.append('dob', personDetails.dob);
      formDataToSend.append('national_id', personDetails.national_id);
      formDataToSend.append('address', personDetails.address || '');
      formDataToSend.append('phone_number', personDetails.phone_number || '');
      formDataToSend.append('phone_company', personDetails.phone_company || '');
      formDataToSend.append(
        'second_phone_number',
        personDetails.second_phone_number || ''
      );
      formDataToSend.append('category', 'disabled');
      formDataToSend.append('form_type', 'disabled');

      // Disability-specific fields
      formDataToSend.append(
        'disability_type',
        personDetails.disability_type || ''
      );
      formDataToSend.append(
        'disability_description',
        personDetails.disability_description || ''
      );
      formDataToSend.append(
        'medical_condition',
        personDetails.medical_condition || ''
      );
      formDataToSend.append('special_needs', personDetails.special_needs || '');
      formDataToSend.append(
        'emergency_contact',
        personDetails.emergency_contact || ''
      );
      formDataToSend.append(
        'emergency_phone',
        personDetails.emergency_phone || ''
      );
      formDataToSend.append(
        'additional_notes',
        personDetails.additional_notes || ''
      );
      formDataToSend.append('employee_id', '');
      formDataToSend.append('department', '');
      formDataToSend.append('role', '');
      formDataToSend.append('bypass_angle_check', 'true');
      formDataToSend.append('train_multiple', 'true');

      // Handle image from file input or webcam
      let imageFile: File | null = null;

      if (personDetails.image) {
        // If image was uploaded from file input
        imageFile = personDetails.image;
      } else if (capturedImage) {
        // If image was captured from webcam, convert base64 to file
        console.log('Converting webcam image from base64 to file');

        // Extract the base64 part if it's a data URL
        let base64Data = capturedImage;
        if (base64Data.startsWith('data:image/jpeg;base64,')) {
          base64Data = capturedImage.split(',')[1];
        } else if (base64Data.startsWith('data:')) {
          // Handle other image formats
          const matches = base64Data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            base64Data = matches[2];
          } else {
            console.error('Invalid data URL format');
            throw new Error('Invalid image format from webcam');
          }
        }

        try {
          const byteString = atob(base64Data);
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);

          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }

          const blob = new Blob([ab], { type: 'image/jpeg' });
          imageFile = new File([blob], `webcam_capture_${Date.now()}.jpg`, {
            type: 'image/jpeg',
          });
        } catch (error) {
          console.error('Error converting base64 to file:', error);
          throw new Error(
            'Failed to process webcam image. Please try again or upload a file instead.'
          );
        }
      }

      if (imageFile) {
        formDataToSend.append('file', imageFile);
      } else {
        throw new Error('Please provide a photo');
      }

      // Use the registration API service instead of direct fetch
      const responseData = await registrationApi.registerUser(formDataToSend);

      // Handle successful registration
      setSubmitSuccess(true);

      // Show a success message with the name
      const userName = responseData?.user?.name || personDetails.name;
      toast.success(`${userName} registered successfully!`);

      // Reset form data after animation plays
      setTimeout(() => {
        setPersonDetails(initialFormData);
        setCapturedImage(null);
        setCurrentSection(1);
        setSubmitSuccess(false);
        setLoading(false);
      }, 3000);
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'An error occurred during registration';
      toast.error(errorMessage);
      setFormErrors([errorMessage]);
      setLoading(false);
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
          <div className="w-16 h-1 bg-gray-300">
            <div
              className={`h-full ${currentSection >= 4 ? 'bg-purple-600' : 'bg-gray-300'}`}
            ></div>
          </div>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${indicatorClasses(4)}`}
          >
            4
          </div>
        </div>
      </div>

      {submitSuccess ? (
        <motion.div
          className="max-w-xl mx-auto bg-purple-500/20 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-purple-300/30 text-white mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>
          <h2 className="text-2xl font-bold mb-4 text-center">
            Registration Successful!
          </h2>
          <p className="text-center mb-6">
            The information has been recorded successfully.
          </p>
          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
            <motion.div
              className="bg-purple-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 3, ease: 'linear' }}
            />
          </div>
          <p className="text-center mt-4 text-white/70">
            Starting new registration in a moment...
          </p>
        </motion.div>
      ) : (
        <motion.form
          onSubmit={handleFormSubmit}
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
                name="national_id"
                value={personDetails.national_id}
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
                name="phone_number"
                value={personDetails.phone_number}
                onChange={handleInputChange}
              />
              <Input
                label="Secondary Phone (Optional)"
                name="second_phone_number"
                value={personDetails.second_phone_number}
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
                  name="disability_type"
                  value={personDetails.disability_type}
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
                name="disability_description"
                value={personDetails.disability_description}
                onChange={handleInputChange}
              />
              <Textarea
                label="Medical Conditions (Optional)"
                name="medical_condition"
                value={personDetails.medical_condition}
                onChange={handleInputChange}
              />
              <Input
                label="Additional Notes (Optional)"
                name="special_needs"
                value={personDetails.special_needs}
                onChange={handleInputChange}
              />

              <SectionButtons onPrev={prevSection} onNext={nextSection} />
            </motion.div>
          )}

          {currentSection === 4 && (
            <motion.div
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold">Person's Photo</h3>
              <p className="text-white/80">
                Please upload a clear photo of the person's face. This will be
                used for identification purposes.
              </p>

              {/* Toggle between upload and camera capture */}
              <div className="flex items-center space-x-4 mb-4">
                <button
                  type="button"
                  onClick={handleToggleCamera}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  {personDetails.useCamera
                    ? 'Switch to Upload'
                    : 'Switch to Camera'}
                </button>
                <div>
                  {personDetails.useCamera ? (
                    <FaCamera className="text-white text-2xl" />
                  ) : (
                    <FaUpload className="text-white text-2xl" />
                  )}
                </div>
              </div>

              {/* Upload image option */}
              {!personDetails.useCamera ? (
                <div className="flex flex-col items-center">
                  <div
                    className="cursor-pointer"
                    onClick={() =>
                      document.getElementById('fileInput')?.click()
                    }
                  >
                    <AnimatedFaceIcon
                      size="md"
                      text="Click to upload"
                      color="#ffff"
                    />
                  </div>
                  <input
                    id="fileInput"
                    type="file"
                    name="image"
                    onChange={handleFileSelect}
                    accept="image/jpeg,image/png"
                    className="hidden"
                  />
                </div>
              ) : (
                // Camera capture section
                <div className="flex flex-col items-center text-white">
                  {!capturedImage ? (
                    <>
                      <div className="relative w-full max-w-md rounded-lg overflow-hidden border-2 border-pink-400">
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
                        <div className="absolute inset-0 pointer-events-none">
                          {/* Face alignment guide */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-64 h-64 border-2 border-pink-400 rounded-full opacity-50"></div>
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
                      </div>

                      <button
                        type="button"
                        className="mt-4 px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 flex items-center mx-auto"
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

              {/* Image preview - only show for uploaded images */}
              {personDetails.image && !personDetails.useCamera && (
                <div className="mt-4 flex justify-center">
                  <img
                    src={URL.createObjectURL(personDetails.image)}
                    alt="Preview"
                    className="max-w-full max-h-64 rounded shadow-md"
                  />
                </div>
              )}

              <SectionButtons onPrev={prevSection} />

              {/* Submit Button */}
              <div className="mt-8 flex flex-col items-center">
                <button
                  type="submit"
                  disabled={loading}
                  className={`
                      px-8 py-3 rounded-lg font-semibold
                      flex items-center justify-center
                      transition-all duration-300
                      ${
                        loading
                          ? 'bg-pink-400 cursor-not-allowed'
                          : 'bg-pink-600 hover:bg-pink-700 shadow-lg hover:shadow-pink-500/30'
                      }
                      text-white min-w-[200px]
                      relative overflow-hidden
                    `}
                >
                  {loading && (
                    <motion.div
                      className="absolute inset-0 bg-pink-500 opacity-30"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1.5 }}
                    />
                  )}

                  {loading ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12l2 2 4-4m6 2a9 9 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </div>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Submit Registration
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </motion.form>
      )}
    </>
  );
}

export default AddDisabled;
