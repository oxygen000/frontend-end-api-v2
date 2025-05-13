import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import { Link } from 'react-router-dom';
import { FaCamera, FaUpload, FaRedo } from 'react-icons/fa';
import AnimatedFaceIcon from '../../components/AnimatedFaceIcon';
import Webcam from 'react-webcam';
import { toast } from 'react-hot-toast';
import { BASE_API_URL } from '../../config/constants';

// Define interface for user with face_id property to fix TypeScript errors
interface UserWithFaceId {
  id: string;
  name: string;
  face_id?: string;
  image_path?: string;
  [key: string]: unknown;
}

interface FormData {
  // Basic information
  name: string;
  nickname: string;
  dob: string;
  national_id: string;
  address: string;
  job: string;
  document_number: string;

  // Contact information
  phone_number: string;
  phone_company: string;
  second_phone_number: string;

  // Criminal record
  has_criminal_record: boolean;
  criminal_record_details: string;
  arrest_date: string;
  case_number: string;
  security_directorate: string;
  police_station: string;
  sentence: string;
  fame: string;

  // Vehicle information
  has_motorcycle: boolean;
  motorcycle_plate: string;
  motorcycle_model: string;
  motorcycle_color: string;
  manufacture_year: string;
  license_expiration_date: string;
  traffic_department: string;

  // Travel information
  travel_date: string;
  travel_destination: string;
  arrival_airport: string;
  arrival_date: string;
  flight_number: string;
  return_date: string;

  // Additional information
  additional_notes: string;
  form_type: string;
  image: File | null;
  useCamera: boolean;
  category: string;
}

const initialFormData: FormData = {
  name: '',
  nickname: '',
  dob: '',
  national_id: '',
  address: '',
  job: '',
  document_number: '',
  phone_number: '',
  phone_company: '',
  second_phone_number: '',
  has_criminal_record: false,
  criminal_record_details: '',
  arrest_date: '',
  case_number: '',
  security_directorate: '',
  police_station: '',
  sentence: '',
  fame: '',
  has_motorcycle: false,
  motorcycle_plate: '',
  motorcycle_model: '',
  motorcycle_color: '',
  manufacture_year: '',
  license_expiration_date: '',
  traffic_department: '',
  travel_date: '',
  travel_destination: '',
  arrival_airport: '',
  arrival_date: '',
  flight_number: '',
  return_date: '',
  additional_notes: '',
  form_type: 'woman',
  image: null,
  useCamera: false,
  category: 'female',
};

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
        className="px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors ml-auto"
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

const AddNormalWoman = () => {
  const [currentSection, setCurrentSection] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Unified validation function
  const validateForm = () => {
    const errors: string[] = [];

    // Validate based on current section
    if (currentSection === 1) {
      if (!formData.name) errors.push('Name is required');
      if (!formData.dob) errors.push('Date of Birth is required');
      if (!formData.national_id) errors.push('National ID is required');
    } else if (currentSection === 2) {
      if (!formData.address) errors.push('Address is required');
      if (!formData.job) errors.push('Job is required');
    } else if (currentSection === 3) {
      if (!formData.phone_number) errors.push('Phone Number is required');
    } else if (currentSection === 4) {
      // Vehicle info validation is optional
    } else if (currentSection === 5) {
      if (!formData.image && !capturedImage) errors.push('Photo is required');
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, checked } = e.target as HTMLInputElement;

    if (name === 'has_motorcycle') {
      setFormData((prev) => ({
        ...prev,
        has_motorcycle: checked,
      }));
    } else if (name.includes('.')) {
      // Handle nested properties
      const [section, field] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...(prev[section as keyof typeof prev] as object),
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleToggleCriminalRecord = () => {
    setFormData((prev) => ({
      ...prev,
      has_criminal_record: !prev.has_criminal_record,
    }));
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

  // Add verification function
  const verifyRegistration = async (userId: string) => {
    if (!userId) {
      console.warn('Cannot verify registration: No user ID provided');
      return null;
    }

    try {
      const response = await fetch(`${BASE_API_URL}/api/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Verification of registered user:', data);

        // Cast the user to our interface with face_id
        const user = data.user as UserWithFaceId;

        // Check if image path and face_id are set
        if (user && user.image_path) {
          console.log('✅ Image successfully saved:', user.image_path);
        } else {
          console.warn('⚠️ Image path not set in user data');
        }

        if (user && user.face_id) {
          console.log('✅ Face ID successfully generated:', user.face_id);
        } else {
          console.warn('⚠️ Face ID not set in user data');
        }

        return user;
      } else {
        console.warn(
          `Failed to verify registration result: ${response.status}`
        );
        return null;
      }
    } catch (err) {
      console.error('Error verifying registration:', err);
      return null;
    }
  };

  // Enhanced form submission with better error handling and face_id retry
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a FormData object to handle file upload
      const formDataToSend = new FormData();

      // Add user data
      formDataToSend.append('name', formData.name);
      formDataToSend.append('nickname', formData.nickname || '');
      formDataToSend.append('dob', formData.dob);
      formDataToSend.append('national_id', formData.national_id);
      formDataToSend.append('address', formData.address || '');
      formDataToSend.append('phone_number', formData.phone_number);
      formDataToSend.append('phone_company', formData.phone_company as string);
      formDataToSend.append(
        'second_phone_number',
        formData.second_phone_number || ''
      );
      formDataToSend.append('category', 'female');
      formDataToSend.append('form_type', 'woman');

      // Additional required fields the backend might expect
      formDataToSend.append('employee_id', '');
      formDataToSend.append('department', '');
      formDataToSend.append('role', '');
      formDataToSend.append('bypass_angle_check', 'false');
      formDataToSend.append('train_multiple', 'true');

      // Job-related fields
      formDataToSend.append('occupation', formData.job || '');
      formDataToSend.append('job', formData.job || ''); // Also send as job for compatibility

      // Vehicle info - match backend field names
      formDataToSend.append(
        'has_motorcycle',
        formData.has_motorcycle ? '1' : '0'
      );
      formDataToSend.append('license_plate', formData.motorcycle_plate || '');
      formDataToSend.append('vehicle_model', formData.motorcycle_model || '');
      formDataToSend.append('vehicle_color', formData.motorcycle_color || '');
      formDataToSend.append('chassis_number', formData.manufacture_year || '');
      formDataToSend.append(
        'vehicle_number',
        formData.traffic_department || ''
      );
      formDataToSend.append(
        'license_expiration',
        formData.license_expiration_date || ''
      );

      // Criminal record
      formDataToSend.append(
        'has_criminal_record',
        formData.has_criminal_record ? '1' : '0'
      );
      formDataToSend.append(
        'case_details',
        formData.criminal_record_details || ''
      );
      formDataToSend.append('police_station', formData.police_station || '');
      formDataToSend.append('case_number', formData.case_number || '');
      formDataToSend.append('judgment', formData.sentence || '');
      formDataToSend.append('accusation', formData.fame || '');

      // Travel info
      formDataToSend.append('travel_date', formData.travel_date || '');
      formDataToSend.append(
        'travel_destination',
        formData.travel_destination || ''
      );
      formDataToSend.append('arrival_airport', formData.arrival_airport || '');
      formDataToSend.append('arrival_date', formData.arrival_date || '');
      formDataToSend.append('flight_number', formData.flight_number || '');
      formDataToSend.append('return_date', formData.return_date || '');

      // Also add date_of_birth which is used in some backend models
      formDataToSend.append('date_of_birth', formData.dob);

      // Handle image from file upload or webcam
      let imageFile: File | null = null;

      if (formData.image) {
        // If image was uploaded from file input
        imageFile = formData.image;
        console.log(
          'Using uploaded image file:',
          imageFile.name,
          imageFile.size,
          'bytes',
          imageFile.type
        );
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
          console.log(
            'Created file from webcam image:',
            imageFile.size,
            'bytes',
            imageFile.type
          );
        } catch (error) {
          console.error('Error converting base64 to file:', error);
          throw new Error(
            'Failed to process webcam image. Please try again or upload a file instead.'
          );
        }
      }

      if (imageFile) {
        // Append the file with name 'file' as expected by the backend
        formDataToSend.append('file', imageFile);
        console.log('Image file appended to form data:', {
          name: imageFile.name,
          size: imageFile.size,
          type: imageFile.type,
          lastModified: new Date(imageFile.lastModified).toISOString(),
        });

        // For debugging - make sure FormData is correctly formed
        console.log('Form data entries:');
        for (const pair of formDataToSend.entries()) {
          console.log(
            pair[0],
            pair[1] instanceof File
              ? `[File: ${pair[1].name}, ${pair[1].size} bytes]`
              : pair[1]
          );
        }
      } else {
        // No image was provided
        throw new Error('Please provide an image');
      }

      // Debug log
      console.log(
        'Sending registration with image to:',
        `${BASE_API_URL}/api/register/upload`
      );

      // Send registration request with image using fetch with appropriate headers
      const response = await fetch(`${BASE_API_URL}/api/register/upload`, {
        method: 'POST',
        body: formDataToSend,
        // Don't set Content-Type header with FormData as the browser will set it with the boundary
      });

      // Log the response
      console.log('Response status:', response.status);

      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        throw new Error(
          responseData?.message ||
            (responseData?.detail && Array.isArray(responseData?.detail)
              ? responseData?.detail[0]?.msg
              : null) ||
            `Registration failed with status ${response.status}`
        );
      }

      // Handle successful registration
      setSubmitSuccess(true);

      // Use the ID from the response to navigate to the user profile
      const userId = responseData?.user_id;
      const userName = responseData?.user?.name || formData.name;
      toast.success(`${userName} registered successfully!`);

      console.log(
        `User registered successfully with ID: ${userId || 'Not available'}`
      );
      console.log(
        `Image path: ${responseData?.user?.image_path || 'Not available'}`
      );
      console.log(`Face ID: ${responseData?.face_id || 'Not available'}`);

      // Verify the registration only if we have a userId
      if (userId) {
        // Try to verify the registration up to 3 times with delays
        // This helps ensure the backend has time to process the face encoding
        let user: UserWithFaceId | null = null;
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries) {
          user = await verifyRegistration(userId);

          if (user && user.face_id) {
            console.log(
              'User verification successful with face_id:',
              user.face_id
            );
            break;
          } else {
            console.log(
              `Verification attempt ${retryCount + 1}: No face_id yet`
            );
            retryCount++;

            if (retryCount < maxRetries) {
              // Wait before retrying (increasing delay with each retry)
              const delay = 1000 * retryCount;
              console.log(`Waiting ${delay}ms before retrying...`);
              await new Promise((resolve) => setTimeout(resolve, delay));
            }
          }
        }

        if (!user || !user.face_id) {
          console.warn(
            'User verification completed but no face_id was generated'
          );
          // Try to trigger face processing again by sending a verification request
          try {
            if (imageFile) {
              console.log(
                'Attempting to trigger face processing via verify-face endpoint'
              );
              const verifyFormData = new FormData();
              verifyFormData.append('file', imageFile);

              const verifyResponse = await fetch(
                `${BASE_API_URL}/api/verify-face`,
                {
                  method: 'POST',
                  body: verifyFormData,
                }
              );

              if (verifyResponse.ok) {
                console.log(
                  'Face verification successful, this may help generate face_id'
                );
              }
            }
          } catch (verifyError) {
            console.error('Error during face verification:', verifyError);
          }
        }
      } else {
        console.warn('No user ID received from server, skipping verification');
      }

      // Reset form data and state after a delay
      setTimeout(() => {
        setFormData(initialFormData);
        setCapturedImage(null);
        setCurrentSection(1);
        setFormErrors([]);
        setSubmitSuccess(false);
      }, 3000); // Delay reset to allow the success animation to play
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'An error occurred during registration';
      toast.error(errorMessage);
      setFormErrors([errorMessage]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setFormData((prevData) => ({
        ...prevData,
        image: file,
      }));
    }
  };

  const handleToggleCamera = () => {
    setFormData((prevData) => ({
      ...prevData,
      useCamera: !prevData.useCamera,
      image: null,
    }));
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

  // Success animation component
  const SuccessAnimation = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="max-w-2xl mx-auto bg-green-500/20 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-green-300/30 text-white mt-8"
    >
      <motion.div
        className="w-20 h-20 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-4"
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
      <h3 className="text-3xl font-bold text-white mb-2 text-center">
        Registration Successful!
      </h3>
      <p className="text-white/80 mb-6 text-center">
        User has been registered successfully.
      </p>
      <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
        <motion.div
          className="bg-pink-500 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 2.5, ease: 'linear' }}
        />
      </div>
      <p className="text-center mt-4 text-white/70">
        Starting new registration in a moment...
      </p>
    </motion.div>
  );

  return (
    <div className="p-6">
      <Link
        to="/home"
        className="inline-flex items-center text-white hover:text-pink-300 transition-colors"
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

      {/* Form Progress Indicator */}
      <div className="flex justify-center mt-6">
        <div className="flex items-center space-x-4">
          {[1, 2, 3, 4, 5].map((step, idx) => (
            <React.Fragment key={step}>
              {idx > 0 && (
                <div className="w-16 h-1 bg-gray-300">
                  <div
                    className={`h-full ${currentSection >= step ? 'bg-pink-600' : 'bg-gray-300'}`}
                  ></div>
                </div>
              )}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  currentSection === step
                    ? 'bg-pink-600 text-white scale-110'
                    : currentSection > step
                      ? 'bg-pink-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                }`}
              >
                {step}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      <motion.form
        onSubmit={handleFormSubmit}
        className="max-w-2xl mx-auto bg-white/20 backdrop-blur-lg p-10 mt-6 rounded-2xl shadow-[0_0_30px_5px_rgba(255,105,180,0.3)] text-white border border-white/30 space-y-8"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-center mb-6">
          Female Registration
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

        {/* Success message */}
        {submitSuccess && <SuccessAnimation />}

        {/* Sections */}
        {currentSection === 1 && (
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-4"
          >
            <Input
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
            <Input
              label="Nickname"
              name="nickname"
              value={formData.nickname}
              onChange={handleInputChange}
            />
            <Input
              label="Date of Birth"
              name="dob"
              type="date"
              value={formData.dob}
              onChange={handleInputChange}
            />

            <Input
              label="National ID"
              name="national_id"
              value={formData.national_id}
              onChange={handleInputChange}
            />
            <Input
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
            />
            <Input
              label="Job"
              name="job"
              value={formData.job}
              onChange={handleInputChange}
            />

            <SectionButtons onNext={nextSection} />
          </motion.div>
        )}

        {currentSection === 2 && (
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-4"
          >
            <Input
              label="Phone Number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleInputChange}
            />
            <Input
              label="Phone Company"
              name="phone_company"
              value={formData.phone_company}
              onChange={handleInputChange}
            />
            <Input
              label="Second Phone Number (Optional)"
              name="second_phone_number"
              value={formData.second_phone_number}
              onChange={handleInputChange}
            />
            <SectionButtons onPrev={prevSection} onNext={nextSection} />
          </motion.div>
        )}

        {currentSection === 3 && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-4">
              <input
                type="checkbox"
                checked={formData.has_criminal_record}
                onChange={handleToggleCriminalRecord}
                className="h-5 w-5"
              />
              <label>Has Criminal Record</label>
            </div>
            {formData.has_criminal_record && (
              <>
                <Input
                  label="Arrest"
                  name="arrest_date"
                  value={formData.arrest_date}
                  onChange={handleInputChange}
                />
                <Input
                  label="Case"
                  name="case_number"
                  value={formData.case_number}
                  onChange={handleInputChange}
                />
                <Input
                  label="Security Directorate"
                  name="security_directorate"
                  value={formData.security_directorate}
                  onChange={handleInputChange}
                />
                <Input
                  label="Police Station"
                  name="police_station"
                  value={formData.police_station}
                  onChange={handleInputChange}
                />
                <Textarea
                  label="Description"
                  name="criminal_record_details"
                  value={formData.criminal_record_details}
                  onChange={handleInputChange}
                />
                <Input
                  label="Sentence"
                  name="sentence"
                  value={formData.sentence}
                  onChange={handleInputChange}
                />
                <Input
                  label="Fame"
                  name="fame"
                  value={formData.fame}
                  onChange={handleInputChange}
                />
              </>
            )}
            <SectionButtons onPrev={prevSection} onNext={nextSection} />
          </motion.div>
        )}

        {currentSection === 4 && (
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              Travel Information
            </h3>
            <Input
              label="Travel Date"
              name="travel_date"
              type="date"
              value={formData.travel_date}
              onChange={handleInputChange}
            />
            <Input
              label="Travel Destination"
              name="travel_destination"
              value={formData.travel_destination}
              onChange={handleInputChange}
            />
            <Input
              label="Arrival Airport"
              name="arrival_airport"
              value={formData.arrival_airport}
              onChange={handleInputChange}
            />
            <Input
              label="Arrival Date"
              name="arrival_date"
              type="date"
              value={formData.arrival_date}
              onChange={handleInputChange}
            />
            <Input
              label="Flight Number"
              name="flight_number"
              value={formData.flight_number}
              onChange={handleInputChange}
            />
            <Input
              label="Return Date"
              name="return_date"
              type="date"
              value={formData.return_date}
              onChange={handleInputChange}
            />
            <SectionButtons onPrev={prevSection} onNext={nextSection} />
          </motion.div>
        )}

        {currentSection === 5 && (
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-4"
          >
            {/* Toggle between upload and camera capture */}
            <div className="flex items-center space-x-4 mb-4">
              <button
                type="button"
                onClick={handleToggleCamera}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {formData.useCamera ? 'Switch to Upload' : 'Switch to Capture'}
              </button>
              <div>
                {formData.useCamera ? (
                  <FaCamera className="text-white text-2xl" />
                ) : (
                  <FaUpload className="text-white text-2xl" />
                )}
              </div>
            </div>

            {/* Upload image option */}
            {!formData.useCamera ? (
              <div className="flex flex-col items-center">
                <label className="block text-white font-semibold mb-2">
                  Upload Image
                </label>
                <div
                  className="cursor-pointer"
                  onClick={() => document.getElementById('fileInput')?.click()}
                >
                  <AnimatedFaceIcon size="md" text="Click to upload" />
                </div>
                <input
                  id="fileInput"
                  type="file"
                  name="image"
                  onChange={handleFileChange}
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

            {/* Image preview - only show for uploaded images */}
            {formData.image && !formData.useCamera && (
              <div className="mt-4 flex justify-center">
                <img
                  src={URL.createObjectURL(formData.image)}
                  alt="Preview"
                  className="max-w-full max-h-64 rounded shadow-md"
                />
              </div>
            )}

            <SectionButtons onPrev={prevSection} />

            {/* Submit Button */}
            <div className="mt-8 flex flex-col items-center">
              {submitSuccess ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center"
                >
                  <div className="bg-blue-500 text-white p-4 rounded-full mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="text-white font-medium">
                    Registration Submitted Successfully!
                  </p>
                </motion.div>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  onClick={handleFormSubmit}
                  className={`
                    px-8 py-3 rounded-lg font-semibold
                    flex items-center justify-center
                    transition-all duration-300
                    ${
                      isSubmitting
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30'
                    }
                    text-white min-w-[200px]
                    relative overflow-hidden
                  `}
                >
                  {isSubmitting && (
                    <motion.div
                      className="absolute inset-0 bg-blue-500 opacity-30"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1.5 }}
                    />
                  )}

                  {isSubmitting ? (
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
              )}
            </div>
          </motion.div>
        )}

        {/* Error Messages */}
        {formErrors.length > 0 && (
          <ul className="text-red-500 space-y-1 list-disc list-inside">
            {formErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        )}
      </motion.form>
    </div>
  );
};

export default AddNormalWoman;
