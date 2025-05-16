import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Webcam from 'react-webcam';
import { toast } from 'react-hot-toast';
import { registrationApi } from '../../services/api';
import { errorVariants, transition } from '../../config/animations';
import SuccessAnimation from '../../components/SuccessAnimation';
import { useTranslationWithFallback } from '../../hooks/useTranslationWithFallback';
import {
  BasicInfoSection,
  ContactInfoSection,
  DisabilityInfoSection,
  PhotoSection,
} from '../../components/RegistrationForms/AddDisabled';
import type { DisabledFormData } from '../../components/RegistrationForms/shared';
import {
  webcamImageToFile,
  scrollToElement,
  saveFormDataToLocalStorage,
  verifyFaceAfterRegistration,
} from '../../components/RegistrationForms/shared';

const initialFormData: DisabledFormData = {
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
  const { t } = useTranslationWithFallback();
  const [currentSection, setCurrentSection] = useState(1);
  const [formData, setFormData] = useState<DisabledFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const [registeredUserId, setRegisteredUserId] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  // Handle toggling camera
  const handleToggleCamera = () => {
    setFormData((prev) => ({
      ...prev,
      useCamera: !prev.useCamera,
      image: null,
    }));
    setCapturedImage(null);
  };

  // Handle capturing image from webcam
  const captureImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);

      // Convert the captured image to a File object for API submission
      if (imageSrc) {
        const file = webcamImageToFile(imageSrc);

        if (file) {
          setFormData((prev) => ({
            ...prev,
            image: file,
          }));
        }
      }
    }
  };

  // Handle retaking photo
  const retakePhoto = () => {
    setCapturedImage(null);
  };

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      setCapturedImage(null);
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
    } else if (file) {
      toast.error(t('validation.imageSizeLimit', 'File size exceeds 5MB'));
    }
  };

  // Toggle camera facing mode
  const toggleCameraFacingMode = () => {
    setFacingMode((prevMode) => (prevMode === 'user' ? 'environment' : 'user'));
  };

  // Validate form based on current section
  const validateForm = () => {
    const errors: string[] = [];

    // Validate based on current section
    if (currentSection === 1) {
      if (!formData.name)
        errors.push(t('validation.required', "Person's Name is required"));
      if (!formData.dob)
        errors.push(t('validation.required', 'Date of Birth is required'));
      if (!formData.gender)
        errors.push(t('validation.required', 'Gender is required'));
    } else if (currentSection === 2) {
      if (!formData.phone_number)
        errors.push(t('validation.required', 'Phone Number is required'));
      if (!formData.address)
        errors.push(t('validation.required', 'Address is required'));
    } else if (currentSection === 3) {
      if (!formData.disability_type)
        errors.push(t('validation.required', 'Disability Type is required'));
    } else if (currentSection === 4) {
      if (!formData.image && !capturedImage)
        errors.push(t('validation.required', "Person's Photo is required"));
    }

    setFormErrors(errors);

    // If there are errors, scroll to the error section
    if (errors.length > 0) {
      scrollToElement('.bg-red-500\\/20');
    }

    return errors.length === 0;
  };

  // Next section function
  const nextSection = () => {
    if (validateForm()) {
      setCurrentSection(currentSection + 1);
      // Scroll to top of form when changing sections
      scrollToElement('form');
    }
  };

  // Previous section function
  const prevSection = () => {
    setCurrentSection(currentSection - 1);
    // Scroll to top of form when changing sections
    scrollToElement('form');
  };

  // Handle form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a FormData object to handle file upload
      const formDataToSend = new FormData();

      // Basic user fields - match exactly what the backend expects
      formDataToSend.append('name', formData.name);
      formDataToSend.append('nickname', formData.name.split(' ')[0] || '');
      formDataToSend.append('dob', formData.dob);
      formDataToSend.append('national_id', formData.national_id || '');
      formDataToSend.append('address', formData.address || '');
      formDataToSend.append('gender', formData.gender || '');

      // Ensure these fields are set, as they are required by the backend
      formDataToSend.append('phone_number', formData.phone_number || '');
      formDataToSend.append('phone_company', formData.phone_company || '');
      formDataToSend.append(
        'second_phone_number',
        formData.second_phone_number || ''
      );

      formDataToSend.append('category', 'disabled');
      formDataToSend.append('form_type', 'disabled');

      // Ensure bypass parameters are set to true
      formDataToSend.append('bypass_angle_check', 'true');
      formDataToSend.append('train_multiple', 'true');

      // Disability-specific fields
      formDataToSend.append('disability_type', formData.disability_type || '');
      formDataToSend.append(
        'disability_details',
        formData.disability_description || ''
      );
      formDataToSend.append(
        'disability_description',
        formData.disability_description || ''
      );
      formDataToSend.append(
        'medical_condition',
        formData.medical_condition || ''
      );
      formDataToSend.append('special_needs', formData.special_needs || '');
      formDataToSend.append(
        'emergency_contact',
        formData.emergency_contact || ''
      );
      formDataToSend.append('emergency_phone', formData.emergency_phone || '');
      formDataToSend.append(
        'additional_notes',
        formData.additional_notes || ''
      );
      formDataToSend.append('employee_id', '');
      formDataToSend.append('department', '');
      formDataToSend.append('role', '');

      // Create a complete data object and append as JSON
      const userData = {
        name: formData.name,
        nickname: formData.name.split(' ')[0] || '',
        dob: formData.dob,
        date_of_birth: formData.dob,
        national_id: formData.national_id || '',
        address: formData.address || '',
        category: 'disabled',
        form_type: 'disabled',
        phone_number: formData.phone_number || '',
        phone_company: formData.phone_company || '',
        second_phone_number: formData.second_phone_number || '',
        disability_type: formData.disability_type || '',
        disability_details: formData.disability_description || '',
        disability_description: formData.disability_description || '',
        medical_condition: formData.medical_condition || '',
        special_needs: formData.special_needs || '',
        emergency_contact: formData.emergency_contact || '',
        emergency_phone: formData.emergency_phone || '',
        additional_notes: formData.additional_notes || '',
        gender: formData.gender || '',
        employee_id: '',
        department: '',
        role: '',
      };

      // Append the complete user data in JSON format
      formDataToSend.append('user_data', JSON.stringify(userData));
      formDataToSend.append('disabled_data', JSON.stringify(userData));

      // Handle image from file input or webcam
      let imageFile: File | null = null;

      if (formData.image) {
        // If image was uploaded from file input
        imageFile = formData.image;
      } else if (capturedImage) {
        // If image was captured from webcam, convert base64 to file
        imageFile = webcamImageToFile(capturedImage);
      }

      if (imageFile) {
        formDataToSend.append('file', imageFile);
      } else {
        throw new Error('Please provide a photo');
      }

      // Call API to register user
      const responseData = await registrationApi.registerUser(formDataToSend);
      console.log('Response data from registerUser:', responseData);

      // Handle successful registration
      setSubmitSuccess(true);

      // Process response data
      let userId, userName;

      // If we have a proper response, use it
      if (responseData?.user_id || responseData?.user?.id) {
        userId = responseData.user_id || responseData.user?.id || '';
        userName = responseData.user?.name || formData.name;
      } else {
        // Create a fallback temporary response object
        userId = `temp-${Date.now()}`;
        userName = formData.name;

        // Save the form data to localStorage for potential recovery
        saveFormDataToLocalStorage(
          userId,
          userName,
          'disabled',
          formDataToSend
        );
      }

      // Store the ID for reference
      setRegisteredUserId(userId);
      toast.success(`${userName} registered successfully!`);

      // Reset form data after animation plays
      setTimeout(() => {
        setFormData(initialFormData);
        setCapturedImage(null);
        setCurrentSection(1);
        setSubmitSuccess(false);
        setIsSubmitting(false);
      }, 3000);

      // Attempt to verify the face ID
      if (imageFile) {
        verifyFaceAfterRegistration(userId, imageFile);
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
      setIsSubmitting(false);
    }
  };

  const indicatorClasses = (num: number) =>
    num <= currentSection
      ? 'bg-purple-600 text-white'
      : 'bg-gray-200 text-gray-500';

  return (
    <div className="px-4 sm:px-6 w-full max-w-full overflow-x-hidden">
      {/* "Back" Button */}
      <div className="mt-4 sm:mt-6">
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
          {t('common.back', 'Back to Home')}
        </Link>
      </div>

      {/* Form Progress Indicator - Only show when not in success state */}
      {!submitSuccess && (
        <div className="flex justify-center mt-4 sm:mt-6 overflow-x-auto">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${indicatorClasses(1)}`}
            >
              1
            </div>
            <div className="w-8 sm:w-16 h-1 bg-gray-300">
              <div
                className={`h-full ${currentSection >= 2 ? 'bg-purple-600' : 'bg-gray-300'}`}
              ></div>
            </div>
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${indicatorClasses(2)}`}
            >
              2
            </div>
            <div className="w-8 sm:w-16 h-1 bg-gray-300">
              <div
                className={`h-full ${currentSection >= 3 ? 'bg-purple-600' : 'bg-gray-300'}`}
              ></div>
            </div>
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${indicatorClasses(3)}`}
            >
              3
            </div>
            <div className="w-8 sm:w-16 h-1 bg-gray-300">
              <div
                className={`h-full ${currentSection >= 4 ? 'bg-purple-600' : 'bg-gray-300'}`}
              ></div>
            </div>
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${indicatorClasses(4)}`}
            >
              4
            </div>
          </div>
        </div>
      )}

      {submitSuccess ? (
        <SuccessAnimation
          title={t('registration.success', 'Registration Successful!')}
          message={t(
            'forms.disabled.title',
            'The information has been recorded successfully.'
          )}
          id={registeredUserId}
          idLabel={t('registration.caseReferenceId', 'Registration ID:')}
        />
      ) : (
        <motion.form
          onSubmit={handleFormSubmit}
          className="max-w-xl mx-auto bg-white/20 backdrop-blur-lg p-5 sm:p-10 mt-4 sm:mt-6 rounded-2xl shadow-[0_0_30px_5px_rgba(128,0,128,0.5)] border border-white/30 text-white space-y-6 sm:space-y-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">
            {t('forms.disabled.title', 'Accompanying Person Registration')}
          </h2>

          {/* Display form errors */}
          {formErrors.length > 0 && (
            <motion.div
              variants={errorVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={transition}
              className="bg-red-500/20 p-3 rounded-lg border border-red-500/30"
            >
              <ul className="list-disc pl-5">
                {formErrors.map((error, index) => (
                  <li key={index} className="text-red-200">
                    {error}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Sections */}
          {currentSection === 1 && (
            <BasicInfoSection
              formData={formData}
              onInputChange={handleInputChange}
              onNext={nextSection}
            />
          )}

          {currentSection === 2 && (
            <ContactInfoSection
              formData={formData}
              onInputChange={handleInputChange}
              onPrev={prevSection}
              onNext={nextSection}
            />
          )}

          {currentSection === 3 && (
            <DisabilityInfoSection
              formData={formData}
              onInputChange={handleInputChange}
              onPrev={prevSection}
              onNext={nextSection}
            />
          )}

          {currentSection === 4 && (
            <PhotoSection
              formData={formData}
              capturedImage={capturedImage}
              webcamRef={webcamRef as React.RefObject<Webcam>}
              facingMode={facingMode}
              onToggleCamera={handleToggleCamera}
              onToggleFacingMode={toggleCameraFacingMode}
              onCaptureImage={captureImage}
              onRetakePhoto={retakePhoto}
              onFileSelect={handleFileSelect}
              onPrev={prevSection}
              isSubmitting={isSubmitting}
            />
          )}
        </motion.form>
      )}
    </div>
  );
}

export default AddDisabled;
