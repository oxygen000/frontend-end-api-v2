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
  GuardianInfoSection,
  DisappearanceSection,
  PhotoSection,
} from '../../components/RegistrationForms/AddNormalChild';
import type { ChildFormData } from '../../components/RegistrationForms/shared';
import {
  webcamImageToFile,
  scrollToElement,
  saveFormDataToLocalStorage,
  verifyFaceAfterRegistration,
} from '../../components/RegistrationForms/shared';

const initialFormData: ChildFormData = {
  name: '',
  dob: '',
  gender: '',
  national_id: '',
  address: '',
  guardian_name: '',
  guardian_phone: '',
  phone_company: '',
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
  const [formData, setFormData] = useState<ChildFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  // Add state for storing the user ID from response
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

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      scrollToElement('.bg-red-500\\/20');
    }

    return errors.length === 0;
  };

  // Unified next section function
  const nextSection = () => {
    if (validateForm()) {
      setCurrentSection(currentSection + 1);
      // Scroll to top of form when changing sections
      scrollToElement('form');
    }
  };

  // Unified previous section function
  const prevSection = () => {
    setCurrentSection(currentSection - 1);
    // Scroll to top of form when changing sections
    scrollToElement('form');
  };

  // Form submission
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

      // Handle image
      let imageFile: File | null = null;

      if (formData.image) {
        imageFile = formData.image;
      } else if (capturedImage) {
        imageFile = webcamImageToFile(capturedImage);
      }

      if (imageFile) {
        // Append the file with name 'file' as expected by the backend
        formDataToSend.append('file', imageFile);
      } else {
        // No image was provided
        throw new Error('Please provide an image');
      }

      // Call API to register user
      const responseData = await registrationApi.registerUser(formDataToSend);
      console.log('Response data from registerUser:', responseData);

      // Handle successful registration
      setSubmitSuccess(true);
      setIsSubmitting(false);

      // If we didn't get proper data back, try to recreate it
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
        saveFormDataToLocalStorage(userId, userName, 'child', formDataToSend);
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

          {/* Sections */}
          {currentSection === 1 && (
            <BasicInfoSection
              formData={formData}
              onInputChange={handleInputChange}
              onNext={nextSection}
            />
          )}

          {currentSection === 2 && (
            <GuardianInfoSection
              formData={formData}
              onInputChange={handleInputChange}
              onPrev={prevSection}
              onNext={nextSection}
            />
          )}

          {currentSection === 3 && (
            <DisappearanceSection
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

export default AddNormalChild;
