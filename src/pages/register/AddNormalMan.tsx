import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Input from '../../components/Input';
import { Link } from 'react-router-dom';
import { FaCamera, FaUpload, FaRedo } from 'react-icons/fa';
import AnimatedFaceIcon from '../../components/AnimatedFaceIcon';
import Webcam from 'react-webcam';
import { toast } from 'react-hot-toast';
import SectionButtons from '../../components/SectionButtons';

interface PersonalInfo {
  name: string;
  nickname: string;
  dob: string;
  national_id: string;
  category: string;
}

interface ContactInfo {
  phone_number: string;
  phone_company: string;
  second_phone_number: string;
}

interface CriminalRecord {
  has_criminal_record: boolean;
  case_details: string;
  police_station: string;
  case_number: string;
  judgment: string;
  accusation: string;
}

interface VehicleInfo {
  has_motorcycle: boolean;
  license_plate: string;
  vehicle_model: string;
  vehicle_color: string;
  chassis_number: string;
  vehicle_number: string;
  license_expiration: string;
}

interface TravelInfo {
  travel_date: string;
  travel_destination: string;
  arrival_airport: string;
  arrival_date: string;
  flight_number: string;
  return_date: string;
}

interface FormData {
  personalInfo: PersonalInfo;
  contactInfo: ContactInfo;
  criminalRecord: CriminalRecord;
  vehicleInfo: VehicleInfo;
  travelInfo: TravelInfo;
  image: File | null;
  useCamera: boolean;
  disability_type?: string;
  disability_description?: string;
  medical_condition?: string;
  special_needs?: string;
  emergency_contact?: string;
  emergency_phone?: string;
}

const initialFormData: FormData = {
  personalInfo: {
    name: '',
    nickname: '',
    dob: '',
    national_id: '',
    category: '',
  },
  contactInfo: {
    phone_number: '',
    phone_company: '',
    second_phone_number: '',
  },
  criminalRecord: {
    has_criminal_record: false,
    case_details: '',
    police_station: '',
    case_number: '',
    judgment: '',
    accusation: '',
  },
  vehicleInfo: {
    has_motorcycle: false,
    license_plate: '',
    vehicle_model: '',
    vehicle_color: '',
    chassis_number: '',
    vehicle_number: '',
    license_expiration: '',
  },
  travelInfo: {
    travel_date: '',
    travel_destination: '',
    arrival_airport: '',
    arrival_date: '',
    flight_number: '',
    return_date: '',
  },
  image: null,
  useCamera: false,
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://backend-fast-api-ai.fly.dev';

const AddNormalMan = () => {
  const [currentSection, setCurrentSection] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [, setUploadedImage] = useState<File | null>(null);
  const [, setUploadedImagePreview] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const validateForm = () => {
    const errors: string[] = [];

    // Validate based on current section
    if (currentSection === 1) {
      // Personal Info validation
      if (!formData.personalInfo.name.trim()) {
        errors.push('Name is required');
      } else if (formData.personalInfo.name.length < 2) {
        errors.push('Name must be at least 2 characters long');
      }

      if (!formData.personalInfo.dob) {
        errors.push('Date of Birth is required');
      } else {
        const dob = new Date(formData.personalInfo.dob);
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear();
        if (age < 18) {
          errors.push('Must be at least 18 years old');
        }
        if (dob > today) {
          errors.push('Date of Birth cannot be in the future');
        }
      }

      if (!formData.personalInfo.national_id.trim()) {
        errors.push('National ID is required');
      } else if (!/^\d{10}$/.test(formData.personalInfo.national_id)) {
        errors.push('National ID must be 10 digits');
      }

      if (!formData.personalInfo.category.trim()) {
        errors.push('Category is required');
      }
    } else if (currentSection === 2) {
      // Contact Info validation
      if (!formData.contactInfo.phone_number.trim()) {
        errors.push('Phone Number is required');
      } else if (!/^\d{10}$/.test(formData.contactInfo.phone_number)) {
        errors.push('Phone Number must be 10 digits');
      }

      if (!formData.contactInfo.phone_company.trim()) {
        errors.push('Phone Company is required');
      }

      if (
        formData.contactInfo.second_phone_number &&
        !/^\d{10}$/.test(formData.contactInfo.second_phone_number)
      ) {
        errors.push('Second Phone Number must be 10 digits');
      }
    } else if (currentSection === 3) {
      // Criminal record validation
      if (formData.criminalRecord.has_criminal_record) {
        if (!formData.criminalRecord.case_details.trim()) {
          errors.push('Case Details are required when criminal record exists');
        }
        if (!formData.criminalRecord.police_station.trim()) {
          errors.push('Police Station is required when criminal record exists');
        }
        if (!formData.criminalRecord.case_number.trim()) {
          errors.push('Case Number is required when criminal record exists');
        }
      }
    } else if (currentSection === 4) {
      // Vehicle info validation
      if (formData.vehicleInfo.has_motorcycle) {
        if (!formData.vehicleInfo.license_plate.trim()) {
          errors.push('License Plate is required for motorcycle');
        }
        if (!formData.vehicleInfo.vehicle_model.trim()) {
          errors.push('Vehicle Model is required for motorcycle');
        }
        if (!formData.vehicleInfo.license_expiration) {
          errors.push('License Expiration Date is required for motorcycle');
        } else {
          const expDate = new Date(formData.vehicleInfo.license_expiration);
          const today = new Date();
          if (expDate < today) {
            errors.push('License has expired');
          }
        }
      }
    } else if (currentSection === 5) {
      // Image validation
      if (!formData.image && !capturedImage) {
        errors.push('Photo is required');
      } else {
        const imageToCheck = formData.image || capturedImage;
        if (imageToCheck instanceof File) {
          if (imageToCheck.size > 5 * 1024 * 1024) {
            errors.push('Image size should be less than 5MB');
          }
          if (
            !['image/jpeg', 'image/png', 'image/jpg'].includes(
              imageToCheck.type
            )
          ) {
            errors.push('Please upload a valid image file (JPEG, PNG)');
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, checked } = e.target as HTMLInputElement;

    if (name === 'hasMotorcycle') {
      setFormData((prev) => ({
        ...prev,
        vehicleInfo: {
          ...prev.vehicleInfo,
          has_motorcycle: checked,
        },
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
      criminalRecord: {
        ...prev.criminalRecord,
        has_criminal_record: !prev.criminalRecord.has_criminal_record,
      },
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
      setFormErrors(['Image size should be less than 5MB']);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setFormErrors(['Please upload a valid image file']);
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
        error instanceof Error ? error.message : 'Failed to process image',
      ]);
      toast.error(
        error instanceof Error ? error.message : 'Failed to process image'
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

  // Enhanced form submission with better error handling
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create FormData for the registration
      const formDataToSend = new FormData();

      // Add image data
      if (formData.image) {
        formDataToSend.append('file', formData.image);
      } else if (capturedImage) {
        const response = await fetch(capturedImage);
        const blob = await response.blob();
        formDataToSend.append('file', blob, 'captured.jpg');
      } else {
        throw new Error('No image provided');
      }

      // Add required fields
      formDataToSend.append('name', formData.personalInfo.name);
      formDataToSend.append('form_type', 'adult');

      // Add contact info
      formDataToSend.append('phone_number', formData.contactInfo.phone_number);
      formDataToSend.append(
        'phone_company',
        formData.contactInfo.phone_company
      );
      if (formData.contactInfo.second_phone_number) {
        formDataToSend.append(
          'second_phone_number',
          formData.contactInfo.second_phone_number
        );
      }

      // Add vehicle info
      if (formData.vehicleInfo.vehicle_model) {
        formDataToSend.append(
          'vehicle_model',
          formData.vehicleInfo.vehicle_model
        );
      }
      if (formData.vehicleInfo.vehicle_number) {
        formDataToSend.append(
          'vehicle_number',
          formData.vehicleInfo.vehicle_number
        );
      }
      if (formData.vehicleInfo.license_plate) {
        formDataToSend.append(
          'license_plate',
          formData.vehicleInfo.license_plate
        );
      }
      if (formData.vehicleInfo.vehicle_color) {
        formDataToSend.append(
          'vehicle_color',
          formData.vehicleInfo.vehicle_color
        );
      }
      if (formData.vehicleInfo.license_expiration) {
        formDataToSend.append(
          'license_expiration',
          formData.vehicleInfo.license_expiration
        );
      }
      if (formData.vehicleInfo.chassis_number) {
        formDataToSend.append(
          'chassis_number',
          formData.vehicleInfo.chassis_number
        );
      }

      // Add criminal record info
      formDataToSend.append(
        'has_criminal_record',
        formData.criminalRecord.has_criminal_record.toString()
      );
      if (formData.criminalRecord.has_criminal_record) {
        if (formData.criminalRecord.case_details) {
          formDataToSend.append(
            'case_details',
            formData.criminalRecord.case_details
          );
        }
        if (formData.criminalRecord.police_station) {
          formDataToSend.append(
            'police_station',
            formData.criminalRecord.police_station
          );
        }
        if (formData.criminalRecord.case_number) {
          formDataToSend.append(
            'case_number',
            formData.criminalRecord.case_number
          );
        }
        if (formData.criminalRecord.judgment) {
          formDataToSend.append('judgment', formData.criminalRecord.judgment);
        }
        if (formData.criminalRecord.accusation) {
          formDataToSend.append(
            'accusation',
            formData.criminalRecord.accusation
          );
        }
      }

      // Add travel info
      if (formData.travelInfo.travel_date) {
        formDataToSend.append('travel_date', formData.travelInfo.travel_date);
      }
      if (formData.travelInfo.travel_destination) {
        formDataToSend.append(
          'travel_destination',
          formData.travelInfo.travel_destination
        );
      }
      if (formData.travelInfo.arrival_airport) {
        formDataToSend.append(
          'arrival_airport',
          formData.travelInfo.arrival_airport
        );
      }
      if (formData.travelInfo.arrival_date) {
        formDataToSend.append('arrival_date', formData.travelInfo.arrival_date);
      }
      if (formData.travelInfo.flight_number) {
        formDataToSend.append(
          'flight_number',
          formData.travelInfo.flight_number
        );
      }
      if (formData.travelInfo.return_date) {
        formDataToSend.append('return_date', formData.travelInfo.return_date);
      }

      // Log the request URL and form data for debugging
      console.log('Sending request to:', `${API_BASE_URL}/api/register/upload`);
      console.log('Form data entries:');
      for (const pair of formDataToSend.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

      // Send registration request
      const response = await fetch(`${API_BASE_URL}/api/register/upload`, {
        method: 'POST',
        body: formDataToSend,
      });

      // Log the response status and headers for debugging
      console.log('Response status:', response.status);
      console.log(
        'Response headers:',
        Object.fromEntries(response.headers.entries())
      );

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(
          data.message || `Registration failed with status ${response.status}`
        );
      }

      if (data.status === 'success') {
        setSubmitSuccess(true);
        toast.success('Registration successful!');

        // Reset form data and state
        setFormData(initialFormData);
        setCapturedImage(null);
        setUploadedImage(null);
        setUploadedImagePreview(null);
        setCurrentSection(1);
        setFormErrors([]);

        // Reset success state after 2 seconds
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 2000);
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'An error occurred during registration';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
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

  return (
    <div className="p-6">
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
                    className={`h-full ${currentSection >= step ? 'bg-blue-600' : 'bg-gray-300'}`}
                  ></div>
                </div>
              )}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
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

      <motion.form
        onSubmit={handleFormSubmit}
        className="max-w-2xl mx-auto bg-white/20 backdrop-blur-lg p-10 mt-6 rounded-2xl shadow-[0_0_30px_5px_rgba(0,0,255,0.3)] text-white border border-white/30 space-y-8"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-center mb-6">
          Male Registration
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
        {submitSuccess && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="bg-white/20 backdrop-blur-lg p-8 rounded-2xl border border-white/30 text-center max-w-md mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <motion.div
                className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
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
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Registration Successful!
              </h3>
              <p className="text-white/80 mb-6">
                Redirecting to user profile...
              </p>
              <div className="w-full bg-white/20 rounded-full h-2">
                <motion.div
                  className="bg-green-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, ease: 'linear' }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Sections */}
        {currentSection === 1 && (
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-4"
          >
            <Input
              label="Name"
              name="personalInfo.name"
              value={formData.personalInfo.name}
              onChange={handleInputChange}
            />
            <Input
              label="Nickname"
              name="personalInfo.nickname"
              value={formData.personalInfo.nickname || ''}
              onChange={handleInputChange}
            />
            <Input
              label="Date of Birth"
              name="personalInfo.dob"
              type="date"
              value={formData.personalInfo.dob}
              onChange={handleInputChange}
            />

            <Input
              label="National ID"
              name="personalInfo.national_id"
              value={formData.personalInfo.national_id}
              onChange={handleInputChange}
            />
            <Input
              label="Category"
              name="personalInfo.category"
              value={formData.personalInfo.category}
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
              name="contactInfo.phone_number"
              value={formData.contactInfo.phone_number}
              onChange={handleInputChange}
            />
            <Input
              label="Phone Company"
              name="contactInfo.phone_company"
              value={formData.contactInfo.phone_company}
              onChange={handleInputChange}
            />
            <Input
              label="Second Phone Number (Optional)"
              name="contactInfo.second_phone_number"
              value={formData.contactInfo.second_phone_number || ''}
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
                checked={formData.criminalRecord.has_criminal_record}
                onChange={handleToggleCriminalRecord}
                className="h-5 w-5"
              />
              <label>Has Criminal Record</label>
            </div>
            {formData.criminalRecord.has_criminal_record && (
              <>
                <Input
                  label="Case Details"
                  name="criminalRecord.case_details"
                  value={formData.criminalRecord.case_details}
                  onChange={handleInputChange}
                />
                <Input
                  label="Police Station"
                  name="criminalRecord.police_station"
                  value={formData.criminalRecord.police_station}
                  onChange={handleInputChange}
                />
                <Input
                  label="Case Number"
                  name="criminalRecord.case_number"
                  value={formData.criminalRecord.case_number}
                  onChange={handleInputChange}
                />
                <Input
                  label="Judgment"
                  name="criminalRecord.judgment"
                  value={formData.criminalRecord.judgment}
                  onChange={handleInputChange}
                />
                <Input
                  label="Accusation"
                  name="criminalRecord.accusation"
                  value={formData.criminalRecord.accusation}
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
            className="space-y-4 "
          >
            <Input
              label="Vehicle"
              name="vehicleInfo.vehicle_model"
              value={formData.vehicleInfo.vehicle_model}
              onChange={handleInputChange}
            />
            <Input
              label="Traffic Department"
              name="vehicleInfo.vehicle_number"
              value={formData.vehicleInfo.vehicle_number}
              onChange={handleInputChange}
            />
            <Input
              label="License Plate"
              name="vehicleInfo.license_plate"
              value={formData.vehicleInfo.license_plate}
              onChange={handleInputChange}
            />
            <Input
              label="Color"
              name="vehicleInfo.vehicle_color"
              value={formData.vehicleInfo.vehicle_color}
              onChange={handleInputChange}
            />
            <Input
              label="License Expiration Date"
              type="date"
              name="vehicleInfo.license_expiration"
              value={formData.vehicleInfo.license_expiration}
              onChange={handleInputChange}
            />
            <Input
              label="Manufacture Year"
              name="vehicleInfo.chassis_number"
              value={formData.vehicleInfo.chassis_number}
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
                  accept="image/jpeg,image/png"
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
                      <div className="absolute inset-0 pointer-events-none">
                        {/* Face alignment guide */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-64 h-64 border-2 border-blue-400 rounded-full opacity-50"></div>
                        </div>
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
                    <div className="mt-4 text-center text-white/80 text-sm">
                      <p className="mb-2 font-semibold">
                        Tips for a good photo:
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Position your face within the circle</li>
                        <li>Look directly at the camera</li>
                        <li>Keep your head level and centered</li>
                        <li>Ensure good lighting on your face</li>
                        <li>Remove any face coverings</li>
                        <li>Make sure your entire face is visible</li>
                        <li>Keep a neutral expression</li>
                      </ul>
                    </div>
                    <button
                      type="button"
                      className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center mx-auto"
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
                  <div className="bg-green-500 text-white p-4 rounded-full mb-2">
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
                  <Link
                    to="/home"
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Return to Home
                  </Link>
                </motion.div>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className={`
                    px-8 py-3 rounded-lg font-semibold
                    flex items-center justify-center
                    transition-all duration-300
                    ${
                      loading
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30'
                    }
                    text-white min-w-[200px]
                    relative overflow-hidden
                  `}
                >
                  {loading && (
                    <motion.div
                      className="absolute inset-0 bg-blue-500 opacity-30"
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
              )}
            </div>
          </motion.div>
        )}

        {/* Error Messages */}
        {error && (
          <div className="bg-red-500/20 p-3 rounded-lg border border-red-500/30 mb-4">
            <p className="text-red-200">{error}</p>
          </div>
        )}
      </motion.form>
    </div>
  );
};

export default AddNormalMan;
