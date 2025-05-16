import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import Webcam from 'react-webcam';
import { FaCamera, FaUpload, FaRedo, FaSync } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import AnimatedFaceIcon from '../../components/AnimatedFaceIcon';
import { BASE_API_URL } from '../../config/constants';
import { registrationApi } from '../../services/api';
import type { TelecomCompany } from '../../config/types';
import {
  sectionVariants,
  errorVariants,
  transition,
} from '../../config/animations';
import SuccessAnimation from '../../components/SuccessAnimation';
import { useTranslationWithFallback } from '../../hooks/useTranslationWithFallback';

// SectionButtons component
const SectionButtons = ({
  onPrev,
  onNext,
  isSubmitting = false,
}: {
  onPrev?: () => void;
  onNext?: () => void;
  isSubmitting?: boolean;
}) => {
  const { t } = useTranslationWithFallback();

  return (
    <div className="flex justify-between mt-4 sm:mt-6">
      {onPrev && (
        <button
          type="button"
          onClick={onPrev}
          disabled={isSubmitting}
          className="px-4 sm:px-6 py-1.5 sm:py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
        >
          {t('common.back')}
        </button>
      )}
      {onNext && (
        <button
          type="button"
          onClick={onNext}
          disabled={isSubmitting}
          className="px-4 sm:px-6 py-1.5 sm:py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors ml-auto disabled:opacity-50 text-sm sm:text-base"
        >
          {t('common.next')}
        </button>
      )}
    </div>
  );
};

// Add interface with face_id property to fix TypeScript errors
interface UserWithFaceId {
  id: string;
  name: string;
  face_id?: string;
  image_path?: string;
  [key: string]: unknown;
}

// Update the FormData interface to include the image property
interface FormData {
  // Basic information
  name: string;
  dob: string;
  gender: string;
  national_id: string;
  address: string;

  // Guardian information
  guardian_name: string;
  guardian_phone: string;
  relationship: string;
  phone_company: TelecomCompany;

  // Disappearance details
  last_seen_time: string;
  last_seen_location: string;
  last_seen_clothes: string;
  physical_description: string;
  additional_data: string;
  medical_condition: string;

  // Additional information
  additional_notes: string;
  form_type: string;
  image: File | null;
  useCamera: boolean;
}

const initialFormData: FormData = {
  name: '',
  dob: '',
  gender: '',
  national_id: '',
  phone_company: '',
  address: '',
  guardian_name: '',
  guardian_phone: '',
  medical_condition: '',
  relationship: '',
  last_seen_time: '',
  last_seen_location: '',
  last_seen_clothes: '',
  physical_description: '',
  additional_data: '',
  additional_notes: '',
  form_type: 'child',
  image: null,
  useCamera: false,
};

function AddNormalChild() {
  const { t } = useTranslationWithFallback();
  const [currentSection, setCurrentSection] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [useCamera, setUseCamera] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  // Add state for storing the user ID from response
  const [registeredUserId, setRegisteredUserId] = useState<string | null>(null);

  // Add these functions for webcam functionality
  const handleToggleCamera = () => {
    setUseCamera(!useCamera);
    setCapturedImage(null);
    setFormData((prev) => ({
      ...prev,
      useCamera: !useCamera,
      image: null,
    }));
  };

  const captureImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);

      // Convert the captured image to a File object for API submission
      if (imageSrc) {
        // Convert base64 to blob
        const byteString = atob(imageSrc.split(',')[1]);
        const mimeString = imageSrc.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);

        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }

        const blob = new Blob([ab], { type: mimeString });
        const file = new File([blob], 'captured-image.jpg', {
          type: 'image/jpeg',
        });

        setFormData((prev) => ({
          ...prev,
          image: file,
        }));
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

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
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
    } else if (file) {
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
      if (!formData.guardian_name) errors.push("Guardian's Name is required");
      if (!formData.guardian_phone) errors.push("Guardian's Phone is required");
      if (!formData.relationship)
        errors.push('Relationship to child is required');
    } else if (currentSection === 3) {
      if (!formData.last_seen_time)
        errors.push('Last Seen (Date & Time) is required');
      if (!formData.last_seen_clothes) errors.push('Clothes Worn is required');
      if (!formData.last_seen_location)
        errors.push('Last Known Location is required');
    } else if (currentSection === 4) {
      if (!capturedImage && !formData.image)
        errors.push("Child's Photo is required");
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

  // Add function to toggle camera facing mode
  const toggleCameraFacingMode = () => {
    setFacingMode((prevMode) => (prevMode === 'user' ? 'environment' : 'user'));
  };

  // Enhanced form submission with better error handling and face_id retry
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData object for file upload
      const formDataToSend = new FormData();

      // Add required form fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('nickname', formData.name.split(' ')[0] || '');
      formDataToSend.append('dob', formData.dob);
      formDataToSend.append('gender', formData.gender || '');
      formDataToSend.append('national_id', formData.national_id || '');
      formDataToSend.append('address', formData.address || '');
      formDataToSend.append('form_type', 'child');
      formDataToSend.append('category', 'child');

      // Add bypass parameters for face validation
      formDataToSend.append('bypass_angle_check', 'true');
      formDataToSend.append('train_multiple', 'true');

      // Phone fields are required by the backend
      formDataToSend.append('phone_number', formData.guardian_phone || '');
      formDataToSend.append('phone_company', formData.phone_company || '');

      // Add Child-specific fields
      formDataToSend.append(
        'physical_description',
        formData.physical_description || ''
      );
      formDataToSend.append('last_clothes', formData.last_seen_clothes || '');
      formDataToSend.append(
        'area_of_disappearance',
        formData.last_seen_location || ''
      );
      formDataToSend.append('last_seen_time', formData.last_seen_time || '');
      formDataToSend.append('guardian_name', formData.guardian_name || '');
      formDataToSend.append('guardian_phone', formData.guardian_phone || '');
      formDataToSend.append('guardian_id', formData.national_id || '');
      formDataToSend.append('relationship', formData.relationship || '');
      formDataToSend.append(
        'additional_notes',
        formData.additional_notes || ''
      );
      formDataToSend.append(
        'medical_condition',
        formData.medical_condition || ''
      );

      // Additional important fields
      formDataToSend.append('description', ''); // Empty but required field
      formDataToSend.append('notes', ''); // Empty but required field

      // Create a complete child data object and append as JSON
      const childData = {
        name: formData.name,
        nickname: formData.name.split(' ')[0] || '',
        dob: formData.dob,
        date_of_birth: formData.dob,
        national_id: formData.national_id || '',
        address: formData.address || '',
        category: 'child',
        form_type: 'child',
        additional_data: formData.additional_data || '',
        physical_description: formData.physical_description || '',
        last_clothes: formData.last_seen_clothes || '',
        area_of_disappearance: formData.last_seen_location || '',
        last_seen_time: formData.last_seen_time || '',
        guardian_name: formData.guardian_name || '',
        guardian_phone: formData.guardian_phone || '',
        guardian_id: formData.national_id || '',
        relationship: formData.relationship || '',
        gender: formData.gender || '',
        additional_notes: formData.additional_notes || '',
        medical_condition: formData.medical_condition || '',
        // Required fields for the backend database
        phone_number: formData.guardian_phone || '',
        phone_company: formData.phone_company || '',
        employee_id: '',
        department: '',
        role: '',
      };

      // Append the complete user data in JSON format
      formDataToSend.append('user_data', JSON.stringify(childData));
      formDataToSend.append('child_data', JSON.stringify(childData));

      // Debug form fields being sent
      console.log('Form data being sent to server:');
      for (const pair of formDataToSend.entries()) {
        if (!(pair[1] instanceof File)) {
          console.log(pair[0], pair[1]);
        }
      }
      console.log('Child data JSON:', childData);

      // Handle image from file upload or webcam
      let imageFile: File | null = null;

      if (formData.image) {
        // If image was uploaded from file input
        imageFile = formData.image;
        if (imageFile) {
          console.log(
            'Using uploaded image file:',
            imageFile.name,
            imageFile.size,
            'bytes',
            imageFile.type
          );
        }
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

        // For debugging - log all form data entries
        console.log('Form data entries being sent to server:');
        for (const pair of formDataToSend.entries()) {
          if (pair[1] instanceof File) {
            console.log(
              `${pair[0]}: [File: ${pair[1].name}, ${pair[1].size} bytes]`
            );
          }
        }
      } else {
        // No image was provided
        throw new Error('Please provide an image');
      }

      // Debug log
      console.log('About to call registerUser API with form data');
      const responseData = await registrationApi.registerUser(formDataToSend);
      console.log('Response data from registerUser:', responseData);

      // Handle successful registration
      setSubmitSuccess(true);
      setIsSubmitting(false);

      // If we didn't get proper data back, try to recreate it
      let userId, userName, userObject;

      // If we have a proper response, use it
      if (responseData?.user_id || responseData?.user?.id) {
        userId = responseData.user_id || responseData.user?.id || '';
        userName = responseData.user?.name || formData.name;
        userObject = responseData.user;
      } else {
        // Create a fallback temporary response object
        userId = `temp-${Date.now()}`;
        userName = formData.name;

        // Create a minimal user object for display
        userObject = {
          id: userId,
          name: userName,
          face_id: '',
          image_path: '',
          created_at: new Date().toISOString(),
          form_type: 'child',
        };

        // Save the form data to localStorage for potential recovery
        try {
          const formDataObj: Record<string, string> = {};
          formDataToSend.forEach((value, key) => {
            if (typeof value === 'string') {
              formDataObj[key] = value;
            }
          });

          localStorage.setItem(
            `temp_registration_${userId}`,
            JSON.stringify({
              id: userId,
              name: userName,
              form_type: 'child',
              timestamp: new Date().toISOString(),
              data: formDataObj,
            })
          );

          console.log(
            `Saved form data to localStorage with key: temp_registration_${userId}`
          );
        } catch (e) {
          console.error('Failed to save form data to localStorage:', e);
        }
      }

      // Store the ID for reference
      setRegisteredUserId(userId);
      toast.success(`${userName} registered successfully!`);

      console.log('User ID after registration:', userId);
      console.log('Is the user ID temporary?', userId.startsWith('temp-'));

      console.log(
        `User registered successfully with ID: ${userId || 'Not available'}`
      );
      console.log(`Image path: ${userObject?.image_path || 'Not available'}`);
      console.log(
        `Face ID: ${responseData?.face_id || userObject?.face_id || 'Not available'}`
      );

      // Reset form data after animation plays
      setTimeout(() => {
        setFormData(initialFormData);
        setCapturedImage(null);
        setCurrentSection(1);
        setSubmitSuccess(false);
        setIsSubmitting(false);
      }, 1000);

      // Verify the registration only if we have a userId with a proper format (not temp-)
      if (userId && !userId.startsWith('temp-')) {
        // Try to verify the registration without delays
        try {
          const verificationData =
            await registrationApi.verifyRegistration(userId);
          const user = verificationData.user as UserWithFaceId;

          if (user && user.face_id) {
            console.log(
              'User verification successful with face_id:',
              user.face_id
            );
          } else {
            console.log('User verified but no face_id yet');
          }
        } catch (error) {
          console.error('Error during verification:', error);
        }

        // If verification didn't give us a face_id, try to trigger face processing
        try {
          if (imageFile) {
            console.log(
              'Attempting to trigger face processing via verify-face endpoint'
            );
            const verifyFormData = new FormData();
            verifyFormData.append('file', imageFile);

            fetch(`${BASE_API_URL}/api/verify-face`, {
              method: 'POST',
              body: verifyFormData,
            })
              .then((response) => {
                if (response.ok) {
                  console.log(
                    'Face verification successful, this may help generate face_id'
                  );
                }
              })
              .catch((verifyError) => {
                console.error('Error during face verification:', verifyError);
              });
          }
        } catch (verifyError) {
          console.error('Error during face verification:', verifyError);
        }
      } else {
        console.warn(
          'No user ID received from server or temporary ID used, skipping verification'
        );

        // If the server returned a success status but no data, we can try to fetch the user
        // by making a secondary request to search for the recently created user by name
      }
    } catch (err) {
      console.error('Registration error:', err);

      // Check for specific face angle error
      let errorMessage = 'An error occurred during registration';

      if (err instanceof Error) {
        errorMessage = err.message;

        // Provide more user-friendly message for face angle errors
        if (
          errorMessage.includes('Face angle') ||
          errorMessage.includes('face is not')
        ) {
          errorMessage =
            "The uploaded photo doesn't meet our requirements. Please upload a clear front-facing photo where the person is looking directly at the camera.";
        }
      }

      toast.error(errorMessage);
      setFormErrors([errorMessage]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
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
          {t('common.back', 'Back to Home')}
        </Link>
      </div>

      {/* Form Progress Indicator - Only show when not in success state */}
      {!submitSuccess && (
        <div className="flex justify-center mt-4 sm:mt-6">
          <div className="flex items-center space-x-2 sm:space-x-4">
            {[1, 2, 3, 4].map((step, idx) => (
              <React.Fragment key={step}>
                {idx > 0 && (
                  <div className="w-8 sm:w-16 h-1 bg-gray-300">
                    <div
                      className={`h-full ${currentSection >= step ? 'bg-orange-600' : 'bg-gray-300'}`}
                    ></div>
                  </div>
                )}
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
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
      )}

      {submitSuccess ? (
        <SuccessAnimation
          title={t('registration.success')}
          message={t('forms.child.title') + ' ' + t('common.success')}
          id={registeredUserId}
          idLabel={t('registration.caseReferenceId', 'Case Reference ID:')}
        />
      ) : (
        <motion.form
          onSubmit={handleFormSubmit}
          className="w-full max-w-2xl mx-auto bg-white/20 backdrop-blur-lg p-4 sm:p-6 md:p-10 mt-4 sm:mt-6 rounded-xl sm:rounded-2xl shadow-[0_0_30px_5px_rgba(255,165,0,0.3)] text-white border border-white/30 space-y-4 sm:space-y-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">
            {t('forms.child.title')}
          </h2>

          {/* Display form errors */}
          {formErrors.length > 0 && (
            <motion.div
              variants={errorVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={transition}
              className="bg-red-500/20 p-3 rounded-lg border border-red-500/30 mb-4"
            >
              <ul className="list-disc pl-5">
                {formErrors.map((error, index) => (
                  <li key={index} className="text-red-200 text-sm sm:text-base">
                    {error}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Section 1: Basic Information */}
          {currentSection === 1 && (
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={transition}
              className="space-y-3 sm:space-y-4"
            >
              <h3 className="text-base sm:text-lg font-semibold">
                {t('forms.child.missingPersonInfo')}
              </h3>
              <Input
                label={t('forms.child.childFullName')}
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />

              <Input
                label={t('forms.child.age')}
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleInputChange}
              />
              <div>
                <label className="block font-medium mb-1 text-sm sm:text-base">
                  {t('registration.gender')}
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 bg-white/10 border text-black border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                >
                  <option value="">
                    {t('registration.selectGender', 'Select Gender')}
                  </option>
                  <option value="male">{t('registration.male')}</option>
                  <option value="female">{t('registration.female')}</option>
                </select>
              </div>
              <Input
                label={t('forms.child.childId')}
                name="national_id"
                value={formData.national_id}
                onChange={handleInputChange}
              />
              <Input
                label={t('registration.address')}
                name="address"
                value={formData.address}
                onChange={handleInputChange}
              />
              <SectionButtons onNext={nextSection} />
            </motion.div>
          )}

          {/* Section 2: Guardian Information */}
          {currentSection === 2 && (
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={transition}
              className="space-y-3 sm:space-y-4"
            >
              <h3 className="text-base sm:text-lg font-semibold">
                {t('forms.child.reporterInfo')}
              </h3>
              <Input
                label={t('forms.child.reporterName')}
                name="guardian_name"
                value={formData.guardian_name}
                onChange={handleInputChange}
              />
              <Input
                label={t('forms.child.reporterPhone')}
                name="guardian_phone"
                value={formData.guardian_phone}
                onChange={handleInputChange}
              />
              <div>
                <label className="block font-medium mb-1 text-sm sm:text-base">
                  {t('registration.phoneCompany')}
                </label>
                <select
                  name="phone_company"
                  value={formData.phone_company}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 bg-white/10 text-black border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                >
                  <option value="">Select Company</option>
                  <option value="Orange">Orange</option>
                  <option value="Etisalat">Etisalat</option>
                  <option value="Vodafone">Vodafone</option>
                  <option value="WE">WE</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block font-medium mb-1">
                  {t(
                    'forms.child.relationshipToMissing',
                    'Relationship to Missing Person'
                  )}
                </label>
                <select
                  name="relationship"
                  value={formData.relationship}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 text-black bg-white/10 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                >
                  <option value="">
                    {t('relationships.select', 'Select Relationship')}
                  </option>
                  <option value="parent">
                    {t('relationships.parent', 'Parent')}
                  </option>
                  <option value="grandparent">
                    {t('relationships.grandparent', 'Grandparent')}
                  </option>
                  <option value="sibling">
                    {t('relationships.sibling', 'Sibling')}
                  </option>
                  <option value="aunt/uncle">
                    {t('relationships.auntUncle', 'Aunt/Uncle')}
                  </option>
                </select>
              </div>
              <SectionButtons onPrev={prevSection} onNext={nextSection} />
            </motion.div>
          )}

          {/* Section 3: Disappearance Details */}
          {currentSection === 3 && (
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={transition}
              className="space-y-3 sm:space-y-4"
            >
              <h3 className="text-base sm:text-lg font-semibold">
                {t('forms.child.missingPersonInfo')}
              </h3>
              <Input
                label={t('forms.child.dateOfDisappearance')}
                name="last_seen_time"
                type="datetime-local"
                value={formData.last_seen_time}
                onChange={handleInputChange}
              />
              <Input
                label={t(
                  'forms.child.disappearanceLocation',
                  'Last Known Location'
                )}
                name="last_seen_location"
                value={formData.last_seen_location}
                onChange={handleInputChange}
              />
              <Textarea
                label={t('forms.child.clothes', 'Clothes Worn When Last Seen')}
                name="last_seen_clothes"
                value={formData.last_seen_clothes}
                onChange={handleInputChange}
              />
              <Textarea
                label={t('forms.child.medicalHistory', 'Medical History')}
                name="medical_condition"
                value={formData.medical_condition}
                onChange={handleInputChange}
              />
              <Textarea
                label={t('forms.child.distinguishingMark')}
                name="physical_description"
                value={formData.physical_description}
                onChange={handleInputChange}
              />
              <Textarea
                label={t('forms.child.additionalData')}
                name="additional_data"
                value={formData.additional_data}
                onChange={handleInputChange}
              />
              <Textarea
                label={t('forms.child.previousDisputes')}
                name="additional_notes"
                value={formData.additional_notes}
                onChange={handleInputChange}
              />
              <SectionButtons onPrev={prevSection} onNext={nextSection} />
            </motion.div>
          )}

          {/* Section 4: Upload Image */}
          {currentSection === 4 && (
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={transition}
              className="space-y-3 sm:space-y-4"
            >
              <h3 className="text-base sm:text-lg font-semibold">
                {t('forms.child.recentPhoto', "Child's Photo")}
              </h3>
              <p className="text-white/80 text-sm sm:text-base">
                {t('registration.photoInstructions')}
              </p>
              <div className="flex flex-col items-center">
                {/* Toggle between upload and camera capture */}
                <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                  <button
                    type="button"
                    onClick={handleToggleCamera}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base bg-orange-600 text-white rounded hover:bg-orange-700"
                  >
                    {formData.useCamera
                      ? t('registration.switchToUpload')
                      : t('registration.switchToCamera')}
                  </button>
                  <div>
                    {formData.useCamera ? (
                      <FaCamera className="text-white text-xl sm:text-2xl" />
                    ) : (
                      <FaUpload className="text-white text-xl sm:text-2xl" />
                    )}
                  </div>
                </div>

                {!formData.useCamera ? (
                  <div className="flex flex-col items-center">
                    <label className="block text-white font-semibold mb-2 text-sm sm:text-base">
                      {t('registration.uploadImage')}
                    </label>
                    <div
                      className="cursor-pointer"
                      onClick={() =>
                        document.getElementById('fileInput')?.click()
                      }
                    >
                      <AnimatedFaceIcon
                        size="md"
                        text={t('registration.clickToUpload')}
                      />
                      <input
                        id="fileInput"
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>

                    {formData.image && (
                      <div className="mt-3 sm:mt-4 flex justify-center">
                        <img
                          src={URL.createObjectURL(formData.image)}
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
                        <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md rounded-lg overflow-hidden border-2 border-orange-400">
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
                              <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 border-2 border-orange-400 rounded-full opacity-50"></div>
                            </div>
                            <svg
                              width="100%"
                              height="100%"
                              viewBox="0 0 100 100"
                              preserveAspectRatio="none"
                            >
                              <path
                                d="M20,20 L20,30 L30,30 M70,30 L80,30 L80,20 M80,80 L80,70 L70,70 M30,70 L20,70 L20,80"
                                stroke="#f97316"
                                strokeWidth="2"
                                fill="none"
                              />
                            </svg>
                          </div>
                          <button
                            type="button"
                            onClick={toggleCameraFacingMode}
                            className="absolute bottom-2 right-2 bg-orange-600 text-white p-2 rounded-full hover:bg-orange-700"
                            aria-label="Switch camera"
                          >
                            <FaSync className="text-sm" />
                          </button>
                        </div>
                        <div className="flex space-x-2 mt-3 sm:mt-4">
                          <button
                            type="button"
                            className="px-4 sm:px-6 py-1.5 sm:py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center text-sm sm:text-base"
                            onClick={captureImage}
                          >
                            <FaCamera className="mr-2" />{' '}
                            {t('registration.capturePhoto')}
                          </button>
                          <button
                            type="button"
                            className="px-4 sm:px-6 py-1.5 sm:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center text-sm sm:text-base"
                            onClick={toggleCameraFacingMode}
                          >
                            <FaSync className="mr-2" />{' '}
                            {facingMode === 'user'
                              ? t(
                                  'registration.switchToBackCamera',
                                  'Back Camera'
                                )
                              : t(
                                  'registration.switchToFrontCamera',
                                  'Front Camera'
                                )}
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md rounded-lg overflow-hidden border-2 border-green-400">
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
                          className="mt-3 sm:mt-4 px-4 sm:px-6 py-1.5 sm:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center text-sm sm:text-base"
                          onClick={retakePhoto}
                        >
                          <FaRedo className="mr-2" />{' '}
                          {t('registration.retakePhoto')}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
              <SectionButtons onPrev={prevSection} />

              {/* Submit Button */}
              <div className="mt-6 sm:mt-8 flex flex-col items-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`
                    px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold
                    flex items-center justify-center
                    transition-all duration-300 text-sm sm:text-base
                    ${
                      isSubmitting
                        ? 'bg-orange-400 cursor-not-allowed'
                        : 'bg-orange-600 hover:bg-orange-700 shadow-lg hover:shadow-orange-500/30'
                    }
                    text-white w-full sm:w-auto sm:min-w-[200px]
                    relative overflow-hidden
                  `}
                >
                  {isSubmitting && (
                    <motion.div
                      className="absolute inset-0 bg-orange-500 opacity-30"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1.5 }}
                    />
                  )}

                  {isSubmitting ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white"
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
                      {t('registration.submitting', 'Processing...')}
                    </div>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 sm:h-5 sm:w-5 mr-2"
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
                      {t('registration.submitRegistration')}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </motion.form>
      )}
    </div>
  );
}

export default AddNormalChild;
