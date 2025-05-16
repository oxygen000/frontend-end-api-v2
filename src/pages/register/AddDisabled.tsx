import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import { Link } from 'react-router-dom';
import { FaCamera, FaUpload, FaRedo, FaSync } from 'react-icons/fa';
import AnimatedFaceIcon from '../../components/AnimatedFaceIcon';
import Webcam from 'react-webcam';
import { toast } from 'react-hot-toast';
import { registrationApi } from '../../services/api';
import type { TelecomCompany } from '../../config/types';
import {
  sectionVariants,
  errorVariants,
  transition,
} from '../../config/animations';
import SuccessAnimation from '../../components/SuccessAnimation';
import { useTranslationWithFallback } from '../../hooks/useTranslationWithFallback';

interface FormData {
  // Basic information
  name: string;
  dob: string;
  gender: string;
  national_id: string;
  address: string;

  // Contact information
  phone_number: string;
  phone_company: TelecomCompany;
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
  const { t } = useTranslationWithFallback();
  const [currentSection, setCurrentSection] = useState(1);
  const [useCamera, setUseCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registeredUserId, setRegisteredUserId] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

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
          {t('common.back', 'Previous')}
        </button>
      )}
      {onNext && (
        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors ml-auto"
        >
          {t('common.next', 'Next')}
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

  // Add function to toggle camera facing mode
  const toggleCameraFacingMode = () => {
    setFacingMode((prevMode) => (prevMode === 'user' ? 'environment' : 'user'));
  };

  // Unified validation function
  const validateForm = () => {
    const errors: string[] = [];

    // Validate based on current section
    if (currentSection === 1) {
      if (!personDetails.name)
        errors.push(t('validation.required', "Person's Name is required"));
      if (!personDetails.dob)
        errors.push(t('validation.required', 'Date of Birth is required'));
      if (!personDetails.gender)
        errors.push(t('validation.required', 'Gender is required'));
    } else if (currentSection === 2) {
      if (!personDetails.phone_number)
        errors.push(t('validation.required', 'Phone Number is required'));
      if (!personDetails.address)
        errors.push(t('validation.required', 'Address is required'));
    } else if (currentSection === 3) {
      if (!personDetails.disability_type)
        errors.push(t('validation.required', 'Disability Type is required'));
    } else if (currentSection === 4) {
      if (!personDetails.image && !capturedImage)
        errors.push(t('validation.required', "Person's Photo is required"));
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
      formDataToSend.append('national_id', personDetails.national_id || '');
      formDataToSend.append('address', personDetails.address || '');
      formDataToSend.append('gender', personDetails.gender || '');

      // Ensure these fields are set, as they are required by the backend
      formDataToSend.append('phone_number', personDetails.phone_number || '');
      formDataToSend.append('phone_company', personDetails.phone_company || '');
      formDataToSend.append(
        'second_phone_number',
        personDetails.second_phone_number || ''
      );

      formDataToSend.append('category', 'disabled');
      formDataToSend.append('form_type', 'disabled');

      // Ensure bypass parameters are set to true
      formDataToSend.append('bypass_angle_check', 'true');
      formDataToSend.append('train_multiple', 'true');

      // Disability-specific fields
      formDataToSend.append(
        'disability_type',
        personDetails.disability_type || ''
      );
      formDataToSend.append(
        'disability_details',
        personDetails.disability_description || ''
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

      // Create a complete data object and append as JSON
      const userData = {
        name: personDetails.name,
        nickname: personDetails.name.split(' ')[0] || '',
        dob: personDetails.dob,
        date_of_birth: personDetails.dob,
        national_id: personDetails.national_id || '',
        address: personDetails.address || '',
        category: 'disabled',
        form_type: 'disabled',
        phone_number: personDetails.phone_number || '',
        phone_company: personDetails.phone_company || '',
        second_phone_number: personDetails.second_phone_number || '',
        disability_type: personDetails.disability_type || '',
        disability_details: personDetails.disability_description || '',
        disability_description: personDetails.disability_description || '',
        medical_condition: personDetails.medical_condition || '',
        special_needs: personDetails.special_needs || '',
        emergency_contact: personDetails.emergency_contact || '',
        emergency_phone: personDetails.emergency_phone || '',
        additional_notes: personDetails.additional_notes || '',
        gender: personDetails.gender || '',
        employee_id: '',
        department: '',
        role: '',
      };

      // Append the complete user data in JSON format
      formDataToSend.append('user_data', JSON.stringify(userData));
      formDataToSend.append('disabled_data', JSON.stringify(userData));

      // Log critical form values for debugging
      console.log('Calling registerUser API with form data');
      console.log(`Form data - name: ${personDetails.name}`);
      console.log(`Form data - dob: ${personDetails.dob}`);
      console.log(`Form data - form_type: ${personDetails.form_type}`);
      console.log(`Form data - category: disabled`);
      console.log(
        `Form data - disability_type: ${personDetails.disability_type}`
      );
      console.log(
        `Form data - has image: ${personDetails.image !== null || capturedImage !== null}`
      );

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

      try {
        const responseData = await registrationApi.registerUser(formDataToSend);
        console.log('Response data from registerUser:', responseData);

        // Handle successful registration
        setSubmitSuccess(true);

        // If we didn't get proper data back, try to recreate it
        let userId, userName, userObject;

        // If we have a proper response, use it
        if (responseData?.user_id || responseData?.user?.id) {
          userId = responseData.user_id || responseData.user?.id || '';
          userName = responseData.user?.name || personDetails.name;
          userObject = responseData.user;
        } else {
          // Create a fallback temporary response object
          userId = `temp-${Date.now()}`;
          userName = personDetails.name;

          // Create a minimal user object for display
          userObject = {
            id: userId,
            name: userName,
            face_id: '',
            image_path: '',
            created_at: new Date().toISOString(),
            form_type: 'disabled',
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
                form_type: 'disabled',
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

        console.log(
          `User registered successfully with ID: ${userId || 'Not available'}`
        );
        console.log(`Image path: ${userObject?.image_path || 'Not available'}`);
        console.log(
          `Face ID: ${responseData?.face_id || userObject?.face_id || 'Not available'}`
        );

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
        setLoading(false);
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
      setLoading(false);
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

          {/* Section 1: Basic Information */}
          {currentSection === 1 && (
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={transition}
              className="space-y-4"
            >
              <h3 className="text-base sm:text-lg font-semibold">
                {t('registration.personalInfo', 'Basic Information')}
              </h3>
              <Input
                label={t('registration.fullName', 'Full Name')}
                name="name"
                value={personDetails.name}
                onChange={handleInputChange}
              />
              <Input
                label={t('registration.dateOfBirth', 'Date of Birth')}
                name="dob"
                type="date"
                value={personDetails.dob}
                onChange={handleInputChange}
              />
              <div>
                <label className="block font-medium mb-1">
                  {t('registration.gender', 'Gender')}
                </label>
                <select
                  name="gender"
                  value={personDetails.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white/10 border text-black border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">
                    {t('registration.selectGender', 'Select Gender')}
                  </option>
                  <option value="male">{t('registration.male', 'Male')}</option>
                  <option value="female">
                    {t('registration.female', 'Female')}
                  </option>
                </select>
              </div>
              <Input
                label={t('registration.nationalId', 'National ID')}
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
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={transition}
              className="space-y-4"
            >
              <h3 className="text-base sm:text-lg font-semibold">
                {t('registration.contactInfo', 'Contact Information')}
              </h3>
              <Input
                label={t('registration.phoneNumber', 'Phone Number')}
                name="phone_number"
                value={personDetails.phone_number}
                onChange={handleInputChange}
              />
              <div>
                <label className="block font-medium mb-1">
                  {t('registration.phoneCompany', 'Telecom Company')}
                </label>
                <select
                  name="phone_company"
                  value={personDetails.phone_company}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white/10 text-black border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">
                    {t('common.select', 'Select Company')}
                  </option>
                  <option value="Orange">Orange</option>
                  <option value="Etisalat">Etisalat</option>
                  <option value="Vodafone">Vodafone</option>
                  <option value="WE">WE</option>
                </select>
              </div>
              <Textarea
                label={t('registration.address', 'Address')}
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
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={transition}
              className="space-y-4"
            >
              <h3 className="text-base sm:text-lg font-semibold">
                {t('forms.disabled.disabilityInfo', 'Disability Information')}
              </h3>
              <div>
                <label className="block font-medium mb-1">
                  {t('forms.disabled.disabilityType', 'Disability Type')}
                </label>
                <select
                  name="disability_type"
                  value={personDetails.disability_type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white/10 border text-black border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">
                    {t('common.select', 'Select Disability Type')}
                  </option>
                  <option value="physical">{t('physical', 'Physical')}</option>
                  <option value="visual">{t('visual', 'Visual')}</option>
                  <option value="hearing">{t('hearing', 'Hearing')}</option>
                  <option value="cognitive">
                    {t('cognitive', 'Cognitive')}
                  </option>
                  <option value="multiple">
                    {t('multiple', 'Multiple Disabilities')}
                  </option>
                  <option value="other">{t('common.other', 'Other')}</option>
                </select>
              </div>
              <Textarea
                label={t(
                  'forms.disabled.disabilityDetails',
                  'Disability Details'
                )}
                name="disability_description"
                value={personDetails.disability_description}
                onChange={handleInputChange}
              />
              <Textarea
                label={t(
                  'forms.disabled.medicalConditions',
                  'Medical Conditions (Optional)'
                )}
                name="medical_condition"
                value={personDetails.medical_condition}
                onChange={handleInputChange}
              />
              <Input
                label={t(
                  'forms.disabled.specialNeeds',
                  'Additional Notes (Optional)'
                )}
                name="special_needs"
                value={personDetails.special_needs}
                onChange={handleInputChange}
              />

              <SectionButtons onPrev={prevSection} onNext={nextSection} />
            </motion.div>
          )}

          {currentSection === 4 && (
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={transition}
              className="space-y-4"
            >
              <h3 className="text-base sm:text-lg font-semibold">
                {t('registration.photo', "Person's Photo")}
              </h3>
              <p className="text-white/80 text-sm sm:text-base">
                {t(
                  'registration.photoInstructions',
                  "Please upload a clear photo of the person's face. This will be used for identification purposes."
                )}
              </p>

              {/* Toggle between upload and camera capture */}
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <button
                  type="button"
                  onClick={handleToggleCamera}
                  className="px-3 py-2 sm:px-4 sm:py-2 bg-purple-600 text-white text-sm sm:text-base rounded hover:bg-purple-700"
                >
                  {personDetails.useCamera
                    ? t('registration.switchToUpload', 'Switch to Upload')
                    : t('registration.switchToCamera', 'Switch to Camera')}
                </button>
                <div>
                  {personDetails.useCamera ? (
                    <FaCamera className="text-white text-xl sm:text-2xl" />
                  ) : (
                    <FaUpload className="text-white text-xl sm:text-2xl" />
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
                      text={t('registration.clickToUpload', 'Click to upload')}
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
                <div className="flex flex-col items-center text-white w-full">
                  {!capturedImage ? (
                    <>
                      <div className="relative w-full max-w-xs sm:max-w-md rounded-lg overflow-hidden border-2 border-pink-400">
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
                            <div className="w-48 h-48 sm:w-64 sm:h-64 border-2 border-pink-400 rounded-full opacity-50"></div>
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
                          onClick={toggleCameraFacingMode}
                          className="absolute bottom-2 right-2 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700"
                          aria-label="Switch camera"
                        >
                          <FaSync className="text-sm" />
                        </button>
                      </div>

                      <div className="flex space-x-2 mt-4">
                        <button
                          type="button"
                          className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 flex items-center text-sm sm:text-base"
                          onClick={captureImage}
                        >
                          <FaCamera className="mr-2" />{' '}
                          {t('registration.capturePhoto', 'Capture Photo')}
                        </button>
                        <button
                          type="button"
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center text-sm sm:text-base"
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
                      <div className="relative w-full max-w-xs sm:max-w-md rounded-lg overflow-hidden border-2 border-green-400">
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
                        className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center text-sm sm:text-base"
                        onClick={retakePhoto}
                      >
                        <FaRedo className="mr-2" />{' '}
                        {t('registration.retakePhoto', 'Retake Photo')}
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
                    className="max-w-full max-h-48 sm:max-h-64 rounded shadow-md"
                  />
                </div>
              )}

              <SectionButtons onPrev={prevSection} />

              {/* Submit Button */}
              <div className="mt-6 sm:mt-8 flex flex-col items-center">
                <button
                  type="submit"
                  disabled={loading}
                  className={`
                      w-full sm:w-auto px-6 py-3 rounded-lg font-semibold
                      flex items-center justify-center
                      transition-all duration-300
                      ${
                        loading
                          ? 'bg-pink-400 cursor-not-allowed'
                          : 'bg-pink-600 hover:bg-pink-700 shadow-lg hover:shadow-pink-500/30'
                      }
                      text-white min-w-[180px] sm:min-w-[200px]
                      relative overflow-hidden text-sm sm:text-base
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
                      {t('common.loading', 'Processing...')}
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
                      {t(
                        'registration.submitRegistration',
                        'Submit Registration'
                      )}
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

export default AddDisabled;
