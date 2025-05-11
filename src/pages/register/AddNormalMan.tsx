import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import { Link } from 'react-router-dom';
import { FaCamera, FaUpload, FaRedo } from 'react-icons/fa';
import AnimatedFaceIcon from '../../components/AnimatedFaceIcon';
import Webcam from 'react-webcam';
import axios from 'axios';
import { BASE_API_URL, PERSON_CATEGORIES } from '../../config/constants';
import { handleImageUpload } from '../../utils/apiUtils';

type FormDataType = {
  personalInfo: {
    name: string;
    nickname?: string;
    dob: string;
    nationalId: string;
    address: string;
    job: string;
    documentNumber: string;
  };
  contactInfo: {
    phoneNumber: string;
    phoneCompany: string;
    secondPhoneNumber?: string;
  };
  criminalRecord: {
    hasCriminalRecord: boolean;
    arrest: string;
    case: string;
    securityDirectorate: string;
    policeStation: string;
    description: string;
    sentence: string;
    fame: string;
    caseDate: string;
  };
  vehicleInfo: {
    hasMotorcycle: boolean;
    vehicle: string;
    trafficDepartment: string;
    licensePlate: string;
    color: string;
    licenseExpirationDate: string;
    manufactureYear: string;
  };
  image: File | null;
  useCamera: boolean;
};

const initialFormData: FormDataType = {
  personalInfo: {
    name: '',
    nickname: '',
    dob: '',
    nationalId: '',
    address: '',
    job: '',
    documentNumber: '',
  },
  contactInfo: {
    phoneNumber: '',
    phoneCompany: '',
  },
  criminalRecord: {
    hasCriminalRecord: false,
    arrest: '',
    case: '',
    securityDirectorate: '',
    policeStation: '',
    description: '',
    sentence: '',
    fame: '',
    caseDate: '',
  },
  vehicleInfo: {
    hasMotorcycle: false,
    vehicle: '',
    trafficDepartment: '',
    licensePlate: '',
    color: '',
    licenseExpirationDate: '',
    manufactureYear: '',
  },
  image: null,
  useCamera: false,
};

const SectionButtons = ({ 
  onPrev, 
  onNext 
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
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ml-auto"
      >
        Next
      </button>
    )}
    
  </div>
);

const AddNormalMan = () => {
  const [currentSection, setCurrentSection] = useState(1);
  const [formData, setFormData] = useState<FormDataType>(initialFormData);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [, setRegisteredUserId] = useState<string | null>(null);

  // Unified validation function
  const validateForm = () => {
    const errors: string[] = [];
    
    // Validate based on current section
    if (currentSection === 1) {
      if (!formData.personalInfo.name) errors.push("Name is required");
      if (!formData.personalInfo.dob) errors.push("Date of Birth is required");
      if (!formData.personalInfo.nationalId) errors.push("National ID is required");
    } else if (currentSection === 2) {
      if (!formData.personalInfo.address) errors.push("Address is required");
      if (!formData.personalInfo.job) errors.push("Job is required");
    } else if (currentSection === 3) {
      if (!formData.contactInfo.phoneNumber) errors.push("Phone Number is required");
    } else if (currentSection === 4) {
      // Vehicle info validation is optional
    } else if (currentSection === 5) {
      if (!formData.image && !capturedImage) errors.push("Photo is required");
    }
    
    setFormErrors(errors);
    
    // If there are errors, scroll to the error section
    if (errors.length > 0) {
      setTimeout(() => {
        document.querySelector('.bg-red-500\\/20')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
    
    return errors.length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, checked } = e.target as HTMLInputElement;
    
    if (name === 'hasMotorcycle') {
      setFormData((prev) => ({
        ...prev,
        vehicleInfo: {
          ...prev.vehicleInfo,
          hasMotorcycle: checked,
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
        hasCriminalRecord: !prev.criminalRecord.hasCriminalRecord,
      },
    }));
  };

  // Unified next section function
  const nextSection = () => {
    if (validateForm()) {
      setCurrentSection(currentSection + 1);
      // Scroll to top of form when changing sections
      setTimeout(() => {
        document.querySelector('form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  // Unified previous section function
  const prevSection = () => {
    setCurrentSection(currentSection - 1);
    // Scroll to top of form when changing sections
    setTimeout(() => {
      document.querySelector('form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Unified form submission function
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Create a FormData object directly
      const directFormData = new FormData();
      
      // Add the file
      if (formData.image) {
        directFormData.append('file', formData.image);
      }
      
      // Add personal info
      directFormData.append('name', formData.personalInfo.name || '');
      // IMPORTANT: Force a non-empty value for nickname to satisfy the backend requirement
      directFormData.append('nickname', formData.personalInfo.nickname || 'unnamed'); 
      directFormData.append('dob', formData.personalInfo.dob || '');
      directFormData.append('national_id', formData.personalInfo.nationalId || '');
      directFormData.append('address', formData.personalInfo.address || '');
      directFormData.append('job', formData.personalInfo.job || '');
      directFormData.append('document_number', formData.personalInfo.documentNumber || '');
      
      // Add contact info
      directFormData.append('phone_number', formData.contactInfo.phoneNumber || '');
      directFormData.append('phone_company', formData.contactInfo.phoneCompany || '');
      directFormData.append('second_phone_number', formData.contactInfo.secondPhoneNumber || '');
      
      // Add criminal record
      directFormData.append('has_criminal_record', formData.criminalRecord.hasCriminalRecord ? '1' : '0');
      directFormData.append('arrest', formData.criminalRecord.arrest || '');
      directFormData.append('case_details', formData.criminalRecord.case || '');
      directFormData.append('security_directorate', formData.criminalRecord.securityDirectorate || '');
      directFormData.append('police_station', formData.criminalRecord.policeStation || '');
      directFormData.append('description', formData.criminalRecord.description || '');
      directFormData.append('sentence', formData.criminalRecord.sentence || '');
      directFormData.append('fame', formData.criminalRecord.fame || '');
      directFormData.append('case_date', formData.criminalRecord.caseDate || '');
      
      // Add vehicle info
      directFormData.append('has_motorcycle', formData.vehicleInfo.hasMotorcycle ? '1' : '0');
      directFormData.append('vehicle', formData.vehicleInfo.vehicle || '');
      directFormData.append('traffic_department', formData.vehicleInfo.trafficDepartment || '');
      directFormData.append('license_plate', formData.vehicleInfo.licensePlate || '');
      directFormData.append('color', formData.vehicleInfo.color || '');
      directFormData.append('license_expiration_date', formData.vehicleInfo.licenseExpirationDate || '');
      directFormData.append('manufacture_year', formData.vehicleInfo.manufactureYear || '');
      
      // Add processing options
      directFormData.append('bypass_angle_check', '0');
      directFormData.append('train_multiple', '1');
      directFormData.append('category', PERSON_CATEGORIES.MAN);
      
      // Log data being sent
      console.log('Submitting direct form data');
      console.log('Image file:', formData.image);
      console.log('Captured image exists:', !!capturedImage);
      
      // Try direct submission with a completely new approach
      if (formData.image && !capturedImage) {
        try {
          console.log('Trying completely new direct approach');
          
          // Log all form data entries for debugging
          console.log('Direct form data entries:');
          for (const pair of directFormData.entries()) {
            console.log(`${pair[0]}: ${pair[1]}`);
          }
          
          // Try a completely different approach - convert file to base64 and use the base64 endpoint
          const fileReader = new FileReader();
          fileReader.readAsDataURL(formData.image);
          
          fileReader.onload = async () => {
            try {
              const base64Image = fileReader.result?.toString().split(',')[1];
              
              if (!base64Image) {
                throw new Error('Failed to convert image to base64');
              }
              
              // Create a JSON payload with all the form data
              const jsonPayload = {
                name: formData.personalInfo.name || '',
                nickname: formData.personalInfo.nickname || 'unnamed', // Force a non-empty value
                dob: formData.personalInfo.dob || '',
                national_id: formData.personalInfo.nationalId || '',
                address: formData.personalInfo.address || '',
                job: formData.personalInfo.job || '',
                document_number: formData.personalInfo.documentNumber || '',
                
                // Contact info
                phone_number: formData.contactInfo.phoneNumber || '',
                phone_company: formData.contactInfo.phoneCompany || '',
                second_phone_number: formData.contactInfo.secondPhoneNumber || '',
                
                // Criminal record
                has_criminal_record: formData.criminalRecord.hasCriminalRecord ? '1' : '0',
                arrest: formData.criminalRecord.arrest || '',
                case_details: formData.criminalRecord.case || '',
                security_directorate: formData.criminalRecord.securityDirectorate || '',
                police_station: formData.criminalRecord.policeStation || '',
                description: formData.criminalRecord.description || '',
                sentence: formData.criminalRecord.sentence || '',
                fame: formData.criminalRecord.fame || '',
                case_date: formData.criminalRecord.caseDate || '',
                
                // Vehicle info
                has_motorcycle: formData.vehicleInfo.hasMotorcycle ? '1' : '0',
                vehicle: formData.vehicleInfo.vehicle || '',
                traffic_department: formData.vehicleInfo.trafficDepartment || '',
                license_plate: formData.vehicleInfo.licensePlate || '',
                color: formData.vehicleInfo.color || '',
                license_expiration_date: formData.vehicleInfo.licenseExpirationDate || '',
                manufacture_year: formData.vehicleInfo.manufactureYear || '',
                
                // Image data
                image_base64: base64Image,
                
                // Category and processing options
                category: PERSON_CATEGORIES.MAN,
                bypass_angle_check: '0',
                train_multiple: '1'
              };
              
              console.log('Sending JSON payload with base64 image');
              
              // Make the API request to the /api/register endpoint with JSON
              const response = await axios.post(
                `${BASE_API_URL}/api/register`,
                jsonPayload,
                {
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  timeout: 60000
                }
              );
              
              console.log('Registration successful:', response.data);
              
              // Show success message and store the user ID from response
              setSubmitSuccess(true);
              if (response.data && response.data.user_id) {
                setRegisteredUserId(response.data.user_id);
              }
              
              // Reset form after delay
              setTimeout(() => {
                setFormData(initialFormData);
                setCapturedImage(null);
                setCurrentSection(1);
                setFormErrors([]);
                setSubmitSuccess(false);
                setIsSubmitting(false);
              }, 5000);
            } catch (error) {
              console.error('Base64 approach failed:', error);
              setIsSubmitting(false);
              
              // Handle API errors
              if (axios.isAxiosError(error)) {
                if (error.response) {
                  // Server responded with an error
                  const errorMessage = error.response.data?.message || 
                                      error.response.data?.error || 
                                      `Server error: ${error.response.status}`;
                  console.error('Server response:', error.response.data);
                  setFormErrors([errorMessage]);
                } else if (error.request) {
                  // No response received
                  console.error('No response received:', error.request);
                  setFormErrors(['No response from server. Please check your internet connection.']);
                } else {
                  // Request setup error
                  console.error('Request setup error:', error.message);
                  setFormErrors(['Error setting up request. Please try again.']);
                }
              } else {
                // Non-Axios error
                setFormErrors([(error as Error).message || 'An unknown error occurred']);
              }
            }
          };
          
          fileReader.onerror = () => {
            console.error('Error reading file');
            setIsSubmitting(false);
            setFormErrors(['Error reading file. Please try again with a different image.']);
          };
          
          return; // Exit early since we're handling the submission in the FileReader callback
        } catch (error) {
          console.error('Direct form submission failed:', error);
          // Continue to try other methods
        }
      }
      
      // If we have a captured image from webcam, use base64 approach
      if (capturedImage) {
        try {
          console.log('Using captured image with base64 approach');
          
          // Create a JSON payload with all the form data
          const jsonPayload = {
            name: formData.personalInfo.name || '',
            nickname: formData.personalInfo.nickname || 'unnamed', // Force a non-empty value
            dob: formData.personalInfo.dob || '',
            national_id: formData.personalInfo.nationalId || '',
            address: formData.personalInfo.address || '',
            job: formData.personalInfo.job || '',
            document_number: formData.personalInfo.documentNumber || '',
            
            // Contact info
            phone_number: formData.contactInfo.phoneNumber || '',
            phone_company: formData.contactInfo.phoneCompany || '',
            second_phone_number: formData.contactInfo.secondPhoneNumber || '',
            
            // Criminal record
            has_criminal_record: formData.criminalRecord.hasCriminalRecord ? '1' : '0',
            arrest: formData.criminalRecord.arrest || '',
            case_details: formData.criminalRecord.case || '',
            security_directorate: formData.criminalRecord.securityDirectorate || '',
            police_station: formData.criminalRecord.policeStation || '',
            description: formData.criminalRecord.description || '',
            sentence: formData.criminalRecord.sentence || '',
            fame: formData.criminalRecord.fame || '',
            case_date: formData.criminalRecord.caseDate || '',
            
            // Vehicle info
            has_motorcycle: formData.vehicleInfo.hasMotorcycle ? '1' : '0',
            vehicle: formData.vehicleInfo.vehicle || '',
            traffic_department: formData.vehicleInfo.trafficDepartment || '',
            license_plate: formData.vehicleInfo.licensePlate || '',
            color: formData.vehicleInfo.color || '',
            license_expiration_date: formData.vehicleInfo.licenseExpirationDate || '',
            manufacture_year: formData.vehicleInfo.manufactureYear || '',
            
            // Image data - strip data URI prefix if present
            image_base64: capturedImage.startsWith('data:image') ? capturedImage.split(',')[1] : capturedImage,
            
            // Category and processing options
            category: PERSON_CATEGORIES.MAN,
            bypass_angle_check: '0',
            train_multiple: '1'
          };
          
          console.log('Sending JSON payload with captured image');
          
          // Make the API request to the /api/register endpoint with JSON
          const response = await axios.post(
            `${BASE_API_URL}/api/register`,
            jsonPayload,
            {
              headers: {
                'Content-Type': 'application/json'
              },
              timeout: 60000
            }
          );
          
          console.log('Registration successful:', response.data);
          
          // Show success message and store the user ID from response
          setSubmitSuccess(true);
          if (response.data && response.data.user_id) {
            setRegisteredUserId(response.data.user_id);
          }
          
          // Reset form after delay
          setTimeout(() => {
            setFormData(initialFormData);
            setCapturedImage(null);
            setCurrentSection(1);
            setFormErrors([]);
            setSubmitSuccess(false);
            setIsSubmitting(false);
          }, 5000);
          
          return; // Exit early since we've handled the submission
        } catch (error) {
          console.error('Captured image approach failed:', error);
          // Continue to try other methods
        }
      }
      
      // If all direct approaches failed, try the standard method with a non-empty nickname
      const submitData = {
        // Personal info
        name: formData.personalInfo.name,
        nickname: formData.personalInfo.nickname || 'unnamed', // Force a non-empty value
        dob: formData.personalInfo.dob,
        national_id: formData.personalInfo.nationalId,
        address: formData.personalInfo.address,
        job: formData.personalInfo.job,
        document_number: formData.personalInfo.documentNumber,
        
        // Contact info
        phone_number: formData.contactInfo.phoneNumber,
        phone_company: formData.contactInfo.phoneCompany,
        second_phone_number: formData.contactInfo.secondPhoneNumber || '',
        
        // Criminal record
        has_criminal_record: formData.criminalRecord.hasCriminalRecord ? '1' : '0',
        arrest: formData.criminalRecord.arrest || '',
        case_details: formData.criminalRecord.case || '',
        security_directorate: formData.criminalRecord.securityDirectorate || '',
        police_station: formData.criminalRecord.policeStation || '',
        description: formData.criminalRecord.description || '',
        sentence: formData.criminalRecord.sentence || '',
        fame: formData.criminalRecord.fame || '',
        case_date: formData.criminalRecord.caseDate || '',
        
        // Vehicle info
        has_motorcycle: formData.vehicleInfo.hasMotorcycle ? '1' : '0',
        vehicle: formData.vehicleInfo.vehicle || '',
        traffic_department: formData.vehicleInfo.trafficDepartment || '',
        license_plate: formData.vehicleInfo.licensePlate || '',
        color: formData.vehicleInfo.color || '',
        license_expiration_date: formData.vehicleInfo.licenseExpirationDate || '',
        manufacture_year: formData.vehicleInfo.manufactureYear || '',
        
        // Processing options
        bypass_angle_check: '0',
        train_multiple: '1'
      };
      
      // Submit to API using standard method
      const response = await handleImageUpload(
        formData.image, 
        capturedImage, 
        { 
          ...submitData, 
          has_criminal_record: formData.criminalRecord.hasCriminalRecord ? 1 : 0,
          has_motorcycle: formData.vehicleInfo.hasMotorcycle ? 1 : 0,
          category: PERSON_CATEGORIES.MAN 
        },
        PERSON_CATEGORIES.MAN
      );
      
      console.log('Registration successful:', response);
      
      // Show success message and store the user ID from response
      setSubmitSuccess(true);
      if (response && response.user_id) {
        setRegisteredUserId(response.user_id);
      }
      
      // Reset form after delay
      setTimeout(() => {
        setFormData(initialFormData);
        setCapturedImage(null);
        setCurrentSection(1);
        setFormErrors([]);
        setSubmitSuccess(false);
        setIsSubmitting(false);
      }, 5000);
      
    } catch (error) {
      console.error('Error registering man:', error);
      
      // Handle API errors
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with an error
          const errorMessage = error.response.data?.message || 
                              error.response.data?.error || 
                              `Server error: ${error.response.status}`;
          console.error('Server response:', error.response.data);
          setFormErrors([errorMessage]);
        } else if (error.request) {
          // No response received
          console.error('No response received:', error.request);
          setFormErrors(['No response from server. Please check your internet connection.']);
        } else {
          // Request setup error
          console.error('Request setup error:', error.message);
          setFormErrors(['Error setting up request. Please try again.']);
        }
      } else {
        // Non-Axios error
        setFormErrors([(error as Error).message || 'An unknown error occurred']);
      }
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

  return (
    <div className="p-6">
      <Link to="/home"
       className="inline-flex items-center text-white hover:text-blue-300 transition-colors">
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
                  <div className={`h-full ${currentSection >= step ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
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
        <h2 className="text-2xl font-bold text-center mb-6">Male Registration</h2>

        {/* Display form errors */}
        {formErrors.length > 0 && (
          <div className="bg-red-500/20 p-3 rounded-lg border border-red-500/30 mb-4">
            <ul className="list-disc pl-5">
              {formErrors.map((error, index) => (
                <li key={index} className="text-red-200">{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Success message */}
        {submitSuccess && (
          <motion.div
            className="bg-green-500/20 p-4 rounded-lg border border-green-500/30 text-center mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="text-green-200 font-semibold">Registration successful!</p>
          </motion.div>
        )}

        {/* Sections */}
        {currentSection === 1 && (
          <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
            <Input label="Name" name="personalInfo.name" value={formData.personalInfo.name} onChange={handleInputChange} />
            <Input label="Nickname" name="personalInfo.nickname" value={formData.personalInfo.nickname || ''} onChange={handleInputChange} />
            <Input label="Date of Birth" name="personalInfo.dob" type="date" value={formData.personalInfo.dob} onChange={handleInputChange} />

            <Input label="National ID" name="personalInfo.nationalId" value={formData.personalInfo.nationalId} onChange={handleInputChange} />
            <Input label="Address" name="personalInfo.address" value={formData.personalInfo.address} onChange={handleInputChange} />
            <Input label="Job" name="personalInfo.job" value={formData.personalInfo.job} onChange={handleInputChange} />
            <Input label="Document Number" name="personalInfo.documentNumber" value={formData.personalInfo.documentNumber} onChange={handleInputChange} />
            <SectionButtons onNext={nextSection} />
              
          </motion.div>
        )}

        {currentSection === 2 && (
          <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
            <Input label="Phone Number" name="contactInfo.phoneNumber" value={formData.contactInfo.phoneNumber} onChange={handleInputChange} />
            <Input label="Phone Company" name="contactInfo.phoneCompany" value={formData.contactInfo.phoneCompany} onChange={handleInputChange} />
            <Input 
              label="Second Phone Number (Optional)" 
              name="contactInfo.secondPhoneNumber" 
              value={formData.contactInfo.secondPhoneNumber || ''} 
              onChange={handleInputChange} 
            />
            <SectionButtons onPrev={prevSection} onNext={nextSection} />
             
          </motion.div>
        )}

        {currentSection === 3 && (
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-4">
            <div className="flex items-center space-x-4">
              <input
                type="checkbox"
                checked={formData.criminalRecord.hasCriminalRecord}
                onChange={handleToggleCriminalRecord}
                className="h-5 w-5"
              />
              <label>Has Criminal Record</label>
            </div>
            {formData.criminalRecord.hasCriminalRecord && (
              <>
                <Input label="Arrest" name="criminalRecord.arrest" value={formData.criminalRecord.arrest} onChange={handleInputChange} />
                <Input label="Case" name="criminalRecord.case" value={formData.criminalRecord.case} onChange={handleInputChange} />
                <Input 
                  label="Security Directorate" 
                  name="criminalRecord.securityDirectorate" 
                  value={formData.criminalRecord.securityDirectorate} 
                  onChange={handleInputChange} 
                />
                <Input 
                  label="Police Station" 
                  name="criminalRecord.policeStation" 
                  value={formData.criminalRecord.policeStation} 
                  onChange={handleInputChange} 
                />
                <Textarea 
                  label="Description" 
                  name="criminalRecord.description" 
                  value={formData.criminalRecord.description} 
                  onChange={handleInputChange} 
                />
                <Input label="Sentence" name="criminalRecord.sentence" value={formData.criminalRecord.sentence} onChange={handleInputChange} />
                <Input label="Fame" name="criminalRecord.fame" value={formData.criminalRecord.fame} onChange={handleInputChange} />
                <Input 
                  label="Case Date" 
                  type="date" 
                  name="criminalRecord.caseDate" 
                  value={formData.criminalRecord.caseDate} 
                  onChange={handleInputChange} 
                />
              </>
            )}
            <SectionButtons onPrev={prevSection} onNext={nextSection} />
              
          </motion.div>
        )}

        {currentSection === 4 && (
          <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4 ">
            
            <Input label="Vehicle" name="vehicleInfo.vehicle" value={formData.vehicleInfo.vehicle} onChange={handleInputChange} />
            <Input 
              label="Traffic Department" 
              name="vehicleInfo.trafficDepartment" 
              value={formData.vehicleInfo.trafficDepartment} 
              onChange={handleInputChange} 
            />
            <Input 
              label="License Plate" 
              name="vehicleInfo.licensePlate" 
              value={formData.vehicleInfo.licensePlate} 
              onChange={handleInputChange} 
            />
            <Input label="Color" name="vehicleInfo.color" value={formData.vehicleInfo.color} onChange={handleInputChange} />
            <Input 
              label="License Expiration Date" 
              type="date" 
              name="vehicleInfo.licenseExpirationDate" 
              value={formData.vehicleInfo.licenseExpirationDate} 
              onChange={handleInputChange} 
            />
            <Input 
              label="Manufacture Year" 
              name="vehicleInfo.manufactureYear" 
              value={formData.vehicleInfo.manufactureYear} 
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
                <label className="block text-white font-semibold mb-2">Upload Image</label>
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
                          facingMode: "user"
                        }}
                        className="w-full"
                      />
                      <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
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

            <SectionButtons 
              onPrev={prevSection} 
            />
            
            {/* Submit Button */}
            <div className="mt-8 flex flex-col items-center">
              {submitSuccess ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center"
                >
                  <div className="bg-blue-500 text-white p-4 rounded-full mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-white font-medium">Registration Submitted Successfully!</p>
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
                    ${isSubmitting 
                      ? 'bg-blue-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30'}
                    text-white min-w-[200px]
                    relative overflow-hidden
                  `}
                >
                  {isSubmitting && (
                    <motion.div 
                      className="absolute inset-0 bg-blue-500 opacity-30"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1.5 }}
                    />
                  )}
                  
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12l2 2 4-4m6 2a9 9 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </div>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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

export default AddNormalMan;
