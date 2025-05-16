import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Input from '../../components/Input';
import { Link } from 'react-router-dom';
import { FaCamera, FaUpload, FaRedo, FaSync } from 'react-icons/fa';
import AnimatedFaceIcon from '../../components/AnimatedFaceIcon';
import Webcam from 'react-webcam';
import { toast } from 'react-hot-toast';
import SectionButtons from '../../components/SectionButtons';
import {
  sectionVariants,
  errorVariants,
  transition,
} from '../../config/animations';
import type { TelecomCompany } from '../../config/types';
import { registrationApi } from '../../services/api';
import SuccessAnimation from '../../components/SuccessAnimation';
import { useTranslationWithFallback } from '../../hooks/useTranslationWithFallback';

interface FormData {
  // Common fields for all forms
  name: string;
  nickname: string;
  dob: string;
  national_id: string;
  address: string;
  phone_number: string;
  job: string;
  phone_company: TelecomCompany;
  second_phone_number?: string;
  category: string;
  form_type: string;

  // Criminal record
  has_criminal_record: boolean;
  case_details: string;
  police_station: string;
  case_number: string;
  judgment: string;
  accusation: string;

  // Vehicle info
  has_motorcycle: boolean;
  license_plate: string;
  vehicle_model: string;
  vehicle_color: string;
  chassis_number: string;
  vehicle_number: string;
  license_expiration: string;

  // Travel info
  travel_date: string;
  travel_destination: string;
  arrival_airport: string;
  arrival_date: string;
  flight_number: string;
  return_date: string;

  // Image handling
  image: File | null;
  useCamera: boolean;
}

const initialFormData: FormData = {
  name: '',
  nickname: '',
  dob: '',
  national_id: '',
  address: '',
  phone_number: '',
  job: '',
  phone_company: '',
  second_phone_number: '',
  category: 'female',
  form_type: 'woman',
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
  travel_date: '',
  travel_destination: '',
  arrival_airport: '',
  arrival_date: '',
  flight_number: '',
  return_date: '',
  image: null,
  useCamera: false,
};

const AddNormalWoman = () => {
  const [currentSection, setCurrentSection] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [, setUploadedImage] = useState<File | null>(null);
  const [, setUploadedImagePreview] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
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

      if (!formData.category.trim()) {
        errors.push(t('validation.categoryRequired', 'Category is required'));
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
    } else if (currentSection === 4) {
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
      } else {
        const imageToCheck = formData.image || capturedImage;
        if (imageToCheck instanceof File) {
          if (imageToCheck.size > 6 * 1024 * 1024) {
            errors.push(
              t(
                'validation.imageSizeLimit',
                'Image size should be less than 5MB'
              )
            );
          }
          if (
            !['image/jpeg', 'image/png', 'image/jpg'].includes(
              imageToCheck.type
            )
          ) {
            errors.push(
              t(
                'validation.imageTypeInvalid',
                'Please upload a valid image file (JPEG, PNG)'
              )
            );
          }
        }
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
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...(prev[section as keyof FormData] as unknown as {
            [key: string]: string | number | boolean | null | File;
          }),
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
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

  // Handle file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    try {
      // Create a preview without modifying the image
      const previewUrl = URL.createObjectURL(file);
      setUploadedImage(file);
      setUploadedImagePreview(previewUrl);
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
    } catch (error) {
      console.error('Image processing error:', error);
      setFormErrors([
        error instanceof Error
          ? error.message
          : t('common.generalError', 'Failed to process image'),
      ]);
      toast.error(
        error instanceof Error
          ? error.message
          : t('common.generalError', 'Failed to process image')
      );
    }
  };

  // Capture image from webcam without modification
  const captureImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImage(imageSrc);
        setUploadedImage(null);
        setUploadedImagePreview(null);
      }
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

  const retakePhoto = () => {
    setCapturedImage(null);
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

    setLoading(true);

    try {
      // Create FormData object
      const formDataToSend = new FormData();

      // Pass individual form fields as expected by the API
      formDataToSend.append('name', formData.name);
      formDataToSend.append('form_type', 'woman');
      formDataToSend.append('bypass_angle_check', 'true');
      formDataToSend.append('train_multiple', 'true');
      formDataToSend.append('category', 'female');

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
        category: 'female',
        form_type: 'woman',
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
        travel_date: formData.travel_date || '',
        travel_destination: formData.travel_destination || '',
        arrival_airport: formData.arrival_airport || '',
        arrival_date: formData.arrival_date || '',
        flight_number: formData.flight_number || '',
        return_date: formData.return_date || '',
      };

      // Append the complete user data as JSON and log for debugging
      formDataToSend.append('user_data', JSON.stringify(userData));
      console.log('Complete user_data JSON being sent:', userData);

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
      }, 1000);

      // Additional verification or processing can go here
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
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
                      className={`h-full ${currentSection >= step ? 'bg-pink-600' : 'bg-gray-300'}`}
                    ></div>
                  </div>
                )}
                <div
                  className={`w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 text-xs sm:text-sm md:text-base ${
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
          className="w-full max-w-2xl mx-auto bg-white/20 backdrop-blur-lg p-4 sm:p-6 md:p-10 mt-4 sm:mt-6 rounded-xl sm:rounded-2xl shadow-[0_0_30px_5px_rgba(255,105,180,0.3)] text-white border border-white/30 space-y-4 sm:space-y-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">
            {t('forms.woman.title', 'Female Registration')}
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
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="space-y-3 sm:space-y-4"
            >
              <Input
                label={t('registration.fullName', 'Name')}
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
              <Input
                label={t('registration.nickname', 'Nickname')}
                name="nickname"
                value={formData.nickname}
                onChange={handleInputChange}
              />
              <Input
                label={t('registration.dateOfBirth', 'Date of Birth')}
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleInputChange}
              />
              <Input
                label={t('registration.nationalId', 'National ID')}
                name="national_id"
                value={formData.national_id}
                onChange={handleInputChange}
              />
              <Input
                label={t('registration.address', 'Address')}
                name="address"
                value={formData.address}
                onChange={handleInputChange}
              />
              <Input
                label={t('registration.job', 'Job')}
                name="job"
                value={formData.job}
                onChange={handleInputChange}
              />
              <SectionButtons onNext={nextSection} />
            </motion.div>
          )}

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
                {t('registration.contactInfo', 'Contact Information')}
              </h3>
              <Input
                label={t('registration.phoneNumber', 'Phone Number')}
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
              />
              <div>
                <label className="block font-medium mb-1 text-sm sm:text-base">
                  {t('registration.phoneCompany', 'Telecom Company')}
                </label>
                <select
                  name="phone_company"
                  value={formData.phone_company}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 bg-white/10 text-black border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm sm:text-base"
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
              <Input
                label={t(
                  'registration.secondaryPhone',
                  'Secondary Phone (Optional)'
                )}
                name="second_phone_number"
                value={formData.second_phone_number || ''}
                onChange={handleInputChange}
              />
              <SectionButtons onPrev={prevSection} onNext={nextSection} />
            </motion.div>
          )}

          {currentSection === 3 && (
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="space-y-3 sm:space-y-4"
            >
              <div className="flex items-center space-x-3 sm:space-x-4">
                <input
                  type="checkbox"
                  checked={formData.has_criminal_record}
                  onChange={handleToggleCriminalRecord}
                  className="h-4 w-4 sm:h-5 sm:w-5"
                />
                <label className="text-sm sm:text-base">
                  {t('registration.hasCriminalRecord', 'Has Criminal Record')}
                </label>
              </div>
              {formData.has_criminal_record && (
                <>
                  <Input
                    label={t('registration.caseDetails', 'Case Details')}
                    name="case_details"
                    value={formData.case_details}
                    onChange={handleInputChange}
                  />
                  <Input
                    label={t('registration.policeStation', 'Police Station')}
                    name="police_station"
                    value={formData.police_station}
                    onChange={handleInputChange}
                  />
                  <Input
                    label={t('registration.caseNumber', 'Case Number')}
                    name="case_number"
                    value={formData.case_number}
                    onChange={handleInputChange}
                  />
                  <Input
                    label={t('registration.judgment', 'Judgment')}
                    name="judgment"
                    value={formData.judgment}
                    onChange={handleInputChange}
                  />
                  <Input
                    label={t('registration.accusation', 'Accusation')}
                    name="accusation"
                    value={formData.accusation}
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
              className="space-y-3 sm:space-y-4"
            >
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-4">
                {t('registration.travelInfo', 'Travel Information')}
              </h3>
              <Input
                label={t('registration.travelDate', 'Travel Date')}
                name="travel_date"
                type="date"
                value={formData.travel_date}
                onChange={handleInputChange}
              />
              <Input
                label={t(
                  'registration.travelDestination',
                  'Travel Destination'
                )}
                name="travel_destination"
                value={formData.travel_destination}
                onChange={handleInputChange}
              />
              <Input
                label={t('registration.arrivalAirport', 'Arrival Airport')}
                name="arrival_airport"
                value={formData.arrival_airport}
                onChange={handleInputChange}
              />
              <Input
                label={t('registration.arrivalDate', 'Arrival Date')}
                name="arrival_date"
                type="date"
                value={formData.arrival_date}
                onChange={handleInputChange}
              />
              <Input
                label={t('registration.flightNumber', 'Flight Number')}
                name="flight_number"
                value={formData.flight_number}
                onChange={handleInputChange}
              />
              <Input
                label={t('registration.returnDate', 'Return Date')}
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
              className="space-y-3 sm:space-y-4"
            >
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-4">
                {t('registration.vehicleInfo', 'Vehicle Information')}
              </h3>
              <Input
                label={t('registration.vehicleModel', 'Vehicle Model')}
                name="vehicle_model"
                type="text"
                value={formData.vehicle_model}
                onChange={handleInputChange}
              />
              <Input
                label={t('registration.vehicleColor', 'Vehicle Color')}
                name="vehicle_color"
                value={formData.vehicle_color}
                onChange={handleInputChange}
              />
              <Input
                label={t('registration.chassisNumber', 'Chassis Number')}
                name="chassis_number"
                value={formData.chassis_number}
                onChange={handleInputChange}
              />
              <Input
                label={t('registration.vehicleNumber', 'Vehicle Number')}
                name="vehicle_number"
                type="text"
                value={formData.vehicle_number}
                onChange={handleInputChange}
              />
              <Input
                label={t(
                  'registration.licenseExpiration',
                  'License Expiration'
                )}
                name="license_expiration"
                type="date"
                value={formData.license_expiration}
                onChange={handleInputChange}
              />
              <SectionButtons onPrev={prevSection} onNext={nextSection} />
            </motion.div>
          )}

          {currentSection === 6 && (
            <motion.div
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="space-y-3 sm:space-y-4"
            >
              {/* Toggle between upload and camera capture */}
              <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                <button
                  type="button"
                  onClick={handleToggleCamera}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-pink-600 text-white rounded hover:bg-pink-700 text-sm sm:text-base"
                >
                  {formData.useCamera
                    ? t('registration.switchToUpload', 'Switch to Upload')
                    : t('registration.switchToCapture', 'Switch to Capture')}
                </button>
                <div>
                  {formData.useCamera ? (
                    <FaCamera className="text-white text-xl sm:text-2xl" />
                  ) : (
                    <FaUpload className="text-white text-xl sm:text-2xl" />
                  )}
                </div>
              </div>

              {/* Upload image option */}
              {!formData.useCamera ? (
                <div className="flex flex-col items-center">
                  <label className="block text-white font-semibold mb-2 text-sm sm:text-base">
                    {t('registration.uploadImage', 'Upload Image')}
                  </label>
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
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png"
                    className="hidden"
                  />
                </div>
              ) : (
                // Camera capture section
                <div className="flex flex-col items-center text-white w-full">
                  {!capturedImage ? (
                    <>
                      <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md rounded-lg overflow-hidden border-2 border-pink-400">
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
                            <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 border-2 border-pink-400 rounded-full opacity-50"></div>
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
                          className="absolute bottom-2 right-2 bg-pink-600 text-white p-2 rounded-full hover:bg-pink-700"
                          aria-label="Switch camera"
                        >
                          <FaSync className="text-sm" />
                        </button>
                      </div>

                      <div className="flex space-x-2 mt-3 sm:mt-4">
                        <button
                          type="button"
                          className="px-4 sm:px-6 py-1.5 sm:py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 flex items-center text-sm sm:text-base"
                          onClick={captureImage}
                        >
                          <FaCamera className="mr-2" />{' '}
                          {t('registration.capturePhoto', 'Capture Photo')}
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
                        {t('registration.retakePhoto', 'Retake Photo')}
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Image preview - only show for uploaded images */}
              {formData.image && !formData.useCamera && (
                <div className="mt-3 sm:mt-4 flex justify-center">
                  <img
                    src={URL.createObjectURL(formData.image)}
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
                    px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold
                    flex items-center justify-center
                    transition-all duration-300 text-sm sm:text-base
                    ${
                      loading
                        ? 'bg-pink-400 cursor-not-allowed'
                        : 'bg-pink-600 hover:bg-pink-700 shadow-lg hover:shadow-pink-500/30'
                    }
                    text-white w-full sm:w-auto sm:min-w-[200px]
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
                      {t('common.loading', 'Processing...')}
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
};

export default AddNormalWoman;
