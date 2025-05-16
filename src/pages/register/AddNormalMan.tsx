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
  CriminalRecordSection,
  TravelInfoSection,
  VehicleInfoSection,
  PhotoSection,
} from '../../components/RegistrationForms/AddNormalMan';
import type { ManFormData } from '../../components/RegistrationForms/shared';

const initialFormData: ManFormData = {
  name: '',
  nickname: '',
  dob: '',
  national_id: '',
  address: '',
  phone_number: '',
  job: '',
  phone_company: '',
  second_phone_number: '',
  category: 'male',
  form_type: 'man',
  has_criminal_record: false,
  case_details: '',
  police_station: '',
  case_number: '',
  judgment: '',
  accusation: '',
  has_motorcycle: false,
  license_plate: '',
  vehicle_model: '',
  vehicle_color: '',
  chassis_number: '',
  vehicle_number: '',
  license_expiration: '',
  manufacture_year: '',
  travel_date: '',
  travel_destination: '',
  arrival_airport: '',
  arrival_date: '',
  flight_number: '',
  return_date: '',
  image: null,
  useCamera: false,
};

const AddNormalMan: React.FC = () => {
  const [currentSection, setCurrentSection] = useState(1);
  const [formData, setFormData] = useState<ManFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const [registeredUserId, setRegisteredUserId] = useState<string | null>(null);
  const { t } = useTranslationWithFallback();
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const validateForm = () => {
    const errors: string[] = [];

    // Validate based on current section
    if (currentSection === 1) {
      // Personal Info validation
      if (!formData.name.trim()) {
        errors.push(t('validation.nameRequired', 'Name is required'));
      } else if (formData.name.length < 2) {
        errors.push(
          t('validation.nameLength', 'Name must be at least 2 characters long')
        );
      }

      if (!formData.dob) {
        errors.push(t('validation.dobRequired', 'Date of Birth is required'));
      } else {
        const dob = new Date(formData.dob);
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear();
        if (age < 18) {
          errors.push(
            t('validation.ageMinimum', 'Must be at least 18 years old')
          );
        }
        if (dob > today) {
          errors.push(
            t('validation.dobFuture', 'Date of Birth cannot be in the future')
          );
        }
      }

      if (!formData.national_id.trim()) {
        errors.push(
          t('validation.nationalIdRequired', 'National ID is required')
        );
      } else if (!/^\d{14}$/.test(formData.national_id)) {
        errors.push(
          t('validation.nationalIdDigits', 'National ID must be 14 digits')
        );
      }
    } else if (currentSection === 2) {
      // Contact Info validation
      if (!formData.phone_number.trim()) {
        errors.push(t('validation.phoneRequired', 'Phone Number is required'));
      } else if (!/^\d{11}$/.test(formData.phone_number)) {
        errors.push(
          t('validation.phoneDigits', 'Phone Number must be 11 digits')
        );
      }

      if (!formData.phone_company) {
        errors.push(
          t('validation.phoneCompanyRequired', 'Telecom Company is required')
        );
      }

      if (
        formData.second_phone_number &&
        !/^\d{11}$/.test(formData.second_phone_number)
      ) {
        errors.push(
          t(
            'validation.secondPhoneDigits',
            'Second Phone Number must be 11 digits'
          )
        );
      }
    } else if (currentSection === 3) {
      // Criminal record validation
      if (formData.has_criminal_record) {
        if (!formData.case_details.trim()) {
          errors.push(
            t(
              'validation.caseDetailsRequired',
              'Case Details are required when criminal record exists'
            )
          );
        }
        if (!formData.police_station.trim()) {
          errors.push(
            t(
              'validation.policeStationRequired',
              'Police Station is required when criminal record exists'
            )
          );
        }
        if (!formData.case_number.trim()) {
          errors.push(
            t(
              'validation.caseNumberRequired',
              'Case Number is required when criminal record exists'
            )
          );
        }
      }
    } else if (currentSection === 5) {
      // Vehicle info validation
      if (formData.has_motorcycle) {
        if (!formData.license_plate.trim()) {
          errors.push(
            t(
              'validation.licensePlateRequired',
              'License Plate is required for motorcycle'
            )
          );
        }
        if (!formData.vehicle_model.trim()) {
          errors.push(
            t(
              'validation.vehicleModelRequired',
              'Vehicle Model is required for motorcycle'
            )
          );
        }
        if (!formData.license_expiration) {
          errors.push(
            t(
              'validation.licenseExpirationRequired',
              'License Expiration Date is required for motorcycle'
            )
          );
        } else {
          const expDate = new Date(formData.license_expiration);
          const today = new Date();
          if (expDate < today) {
            errors.push(t('validation.licenseExpired', 'License has expired'));
          }
        }
      }
    } else if (currentSection === 6) {
      // Image validation
      if (!formData.image && !capturedImage) {
        errors.push(t('validation.photoRequired', 'Photo is required'));
      }
    }

    setFormErrors(errors);

    if (errors.length > 0) {
      setTimeout(() => {
        const errorElement = document.querySelector('.bg-red-500\\/20');
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }

    return errors.length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggleCriminalRecord = () => {
    setFormData((prev) => ({
      ...prev,
      has_criminal_record: !prev.has_criminal_record,
    }));
  };

  const handleToggleVehicle = () => {
    setFormData((prev) => ({
      ...prev,
      has_motorcycle: !prev.has_motorcycle,
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

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setFormErrors([
        t('validation.imageSizeLimit', 'Image size should be less than 5MB'),
      ]);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setFormErrors([
        t('validation.imageTypeInvalid', 'Please upload a valid image file'),
      ]);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      image: file,
    }));
  };

  // Capture image from webcam
  const captureImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImage(imageSrc);
      }
    }
  };

  // Toggle camera facing mode
  const toggleCameraFacingMode = () => {
    setFacingMode((prevMode) => (prevMode === 'user' ? 'environment' : 'user'));
  };

  // Toggle between camera and file upload
  const handleToggleCamera = () => {
    setFormData((prevData) => ({
      ...prevData,
      useCamera: !prevData.useCamera,
      image: null,
    }));
    setCapturedImage(null);
  };

  // Retake photo
  const retakePhoto = () => {
    setCapturedImage(null);
  };

  // Form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData object
      const formDataToSend = new FormData();

      // Pass individual form fields as expected by the API
      formDataToSend.append('name', formData.name);
      formDataToSend.append('form_type', 'man');
      formDataToSend.append('bypass_angle_check', 'true');
      formDataToSend.append('train_multiple', 'true');
      formDataToSend.append('category', 'male');

      // Convert boolean values to "1"/"0" strings for proper backend processing
      formDataToSend.append(
        'has_criminal_record',
        formData.has_criminal_record ? '1' : '0'
      );
      formDataToSend.append(
        'has_motorcycle',
        formData.has_motorcycle ? '1' : '0'
      );

      // Create a complete user data object and append as JSON
      const userData = {
        name: formData.name,
        nickname: formData.nickname || formData.name.split(' ')[0] || '',
        dob: formData.dob,
        date_of_birth: formData.dob,
        national_id: formData.national_id,
        address: formData.address || '',
        phone_number: formData.phone_number,
        phone_company: formData.phone_company,
        second_phone_number: formData.second_phone_number || '',
        category: 'male',
        form_type: 'man',
        employee_id: '',
        department: '',
        role: '',
        job: formData.job || '',
        occupation: formData.job || '',
        has_criminal_record: formData.has_criminal_record ? '1' : '0',
        case_details: formData.case_details || '',
        police_station: formData.police_station || '',
        case_number: formData.case_number || '',
        judgment: formData.judgment || '',
        accusation: formData.accusation || '',
        has_motorcycle: formData.has_motorcycle ? '1' : '0',
        license_plate: formData.license_plate || '',
        vehicle_model: formData.vehicle_model || '',
        vehicle_color: formData.vehicle_color || '',
        chassis_number: formData.chassis_number || '',
        vehicle_number: formData.vehicle_number || '',
        license_expiration: formData.license_expiration || '',
        manufacture_year: formData.manufacture_year || '',
        travel_date: formData.travel_date || '',
        travel_destination: formData.travel_destination || '',
        arrival_airport: formData.arrival_airport || '',
        arrival_date: formData.arrival_date || '',
        flight_number: formData.flight_number || '',
        return_date: formData.return_date || '',
      };

      // Append the complete user data as JSON
      formDataToSend.append('user_data', JSON.stringify(userData));

      // Make sure image is handled correctly
      if (formData.image) {
        formDataToSend.append('file', formData.image);
      } else if (capturedImage) {
        // Convert base64 to file if using webcam
        const blob = await (await fetch(capturedImage)).blob();
        const file = new File([blob], 'webcam_image.jpg', {
          type: 'image/jpeg',
        });
        formDataToSend.append('file', file);
      } else {
        throw new Error(
          t('validation.photoRequired', 'Please provide an image')
        );
      }

      const responseData = await registrationApi.registerUser(formDataToSend);

      // Handle successful registration
      setSubmitSuccess(true);
      setRegisteredUserId(
        responseData?.user_id || responseData?.user?.id || null
      );
      const userName = responseData?.user?.name || formData.name;
      toast.success(
        t('registration.successMessage', `${userName} registered successfully!`)
      );

      // Reset form data after animation plays
      setTimeout(() => {
        setFormData(initialFormData);
        setCapturedImage(null);
        setCurrentSection(1);
        setSubmitSuccess(false);
        setIsSubmitting(false);
      }, 3000);
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : t(
              'registration.generalError',
              'An error occurred during registration'
            );
      toast.error(errorMessage);
      setFormErrors([errorMessage]);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <Link
        to="/home"
        className="inline-flex items-center text-white hover:text-blue-300 transition-colors"
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

      {/* Form Progress Indicator - Hide when showing success */}
      {!submitSuccess && (
        <div className="flex justify-center mt-4 sm:mt-6 overflow-x-auto py-2">
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
            {[1, 2, 3, 4, 5, 6].map((step, idx) => (
              <React.Fragment key={step}>
                {idx > 0 && (
                  <div className="w-6 sm:w-10 md:w-16 h-1 bg-gray-300">
                    <div
                      className={`h-full ${currentSection >= step ? 'bg-blue-600' : 'bg-gray-300'}`}
                    ></div>
                  </div>
                )}
                <div
                  className={`w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 text-xs sm:text-sm md:text-base ${
                    currentSection === step
                      ? 'bg-blue-600 text-white scale-110'
                      : currentSection > step
                        ? 'bg-blue-500 text-white'
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
          title={t('registration.success', 'Registration Successful!')}
          message={t(
            'registration.successDescription',
            'User has been registered successfully.'
          )}
          id={registeredUserId}
          idLabel={t('registration.caseReferenceId', 'Registration ID:')}
        />
      ) : (
        <motion.form
          onSubmit={handleFormSubmit}
          className="w-full max-w-2xl mx-auto bg-white/20 backdrop-blur-lg p-4 sm:p-6 md:p-10 mt-4 sm:mt-6 rounded-xl sm:rounded-2xl shadow-[0_0_30px_5px_rgba(0,0,255,0.3)] text-white border border-white/30 space-y-4 sm:space-y-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">
            {t('forms.man.title', 'Male Registration')}
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

          {/* Form Sections */}
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
            <CriminalRecordSection
              formData={formData}
              onInputChange={handleInputChange}
              onToggleCriminalRecord={handleToggleCriminalRecord}
              onPrev={prevSection}
              onNext={nextSection}
            />
          )}

          {currentSection === 4 && (
            <TravelInfoSection
              formData={formData}
              onInputChange={handleInputChange}
              onPrev={prevSection}
              onNext={nextSection}
            />
          )}

          {currentSection === 5 && (
            <VehicleInfoSection
              formData={formData}
              onInputChange={handleInputChange}
              onToggleVehicle={handleToggleVehicle}
              onPrev={prevSection}
              onNext={nextSection}
            />
          )}

          {currentSection === 6 && (
            <PhotoSection
              formData={formData}
              capturedImage={capturedImage}
              webcamRef={webcamRef as React.RefObject<Webcam>}
              facingMode={facingMode}
              onToggleCamera={handleToggleCamera}
              onToggleFacingMode={toggleCameraFacingMode}
              onCaptureImage={captureImage}
              onRetakePhoto={retakePhoto}
              onFileSelect={handleFileChange}
              onPrev={prevSection}
              isSubmitting={isSubmitting}
            />
          )}
        </motion.form>
      )}
    </div>
  );
};

export default AddNormalMan;
