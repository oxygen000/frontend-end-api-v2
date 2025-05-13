import React, { useState, useRef } from 'react';
import AnimatedFaceIcon from '../../components/AnimatedFaceIcon';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import { FaCamera, FaUpload, FaRedo } from 'react-icons/fa';
import Webcam from 'react-webcam';
import { BASE_API_URL } from '../../config/constants';
import { toast } from 'react-hot-toast';
import { registrationApi } from '../../services/api';

// Define proper interfaces needed
// This allows user.face_id access without type errors
interface UserWithFaceId {
  id: string;
  name: string;
  face_id?: string;
  // Add other potential properties
  [key: string]: unknown;
}

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
  image?: File;
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
};

function AddDisabled() {
  const [currentSection, setCurrentSection] = useState(1);
  const [useCamera, setUseCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
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
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setCapturedImage(null);
    } else {
      alert('File size exceeds 5MB');
    }
  };

  const handleToggleCamera = () => {
    setUseCamera(!useCamera);
    setSelectedImage(null);
    setPreviewUrl('');
    setCapturedImage(null);
  };

  const captureImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      setSelectedImage(null);
      setPreviewUrl('');
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
      if (!selectedImage && !capturedImage)
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

  const clearForm = () => {
    setPersonDetails(initialFormData);
    setSelectedImage(null);
    setPreviewUrl('');
    setCapturedImage(null);
    setCurrentSection(1);
    setFormErrors([]);
    setSubmitSuccess(false);
  };

  // Enhanced form submission with better error handling and face_id retry
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Debug the form data first
      console.log('Person details being submitted:', personDetails);

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

      // Additional fields that might be required by the backend
      formDataToSend.append('employee_id', '');
      formDataToSend.append('department', '');
      formDataToSend.append('role', '');
      formDataToSend.append('bypass_angle_check', 'false');
      formDataToSend.append('train_multiple', 'true');
      formDataToSend.append('date_of_birth', personDetails.dob); // Duplicate of dob for compatibility

      // Disability-specific fields with exact backend field names
      formDataToSend.append(
        'disability_type',
        personDetails.disability_type || ''
      );
      formDataToSend.append(
        'disability_details',
        personDetails.disability_description || ''
      );
      formDataToSend.append(
        'medical_condition',
        personDetails.medical_condition || ''
      );
      formDataToSend.append('medication', personDetails.special_needs || '');
      formDataToSend.append(
        'caregiver_name',
        personDetails.guardian_name || ''
      );
      formDataToSend.append(
        'caregiver_phone',
        personDetails.guardian_phone || ''
      );
      formDataToSend.append(
        'caregiver_relationship',
        personDetails.relationship || ''
      );

      // Additional important fields
      formDataToSend.append('description', ''); // Empty but required field
      formDataToSend.append('notes', ''); // Empty but required field
      formDataToSend.append('additional_notes', ''); // Empty but required field

      // Create a complete data object and append as JSON
      const disabledData = {
        name: personDetails.name,
        nickname: personDetails.name.split(' ')[0] || '',
        dob: personDetails.dob,
        date_of_birth: personDetails.dob,
        national_id: personDetails.national_id,
        address: personDetails.address || '',
        phone_number: personDetails.phone_number || '',
        phone_company: personDetails.phone_company || '',
        second_phone_number: personDetails.second_phone_number || '',
        category: 'disabled',
        form_type: 'disabled',
        disability_type: personDetails.disability_type || '',
        disability_details: personDetails.disability_description || '',
        medical_condition: personDetails.medical_condition || '',
        medication: personDetails.special_needs || '',
        caregiver_name: personDetails.guardian_name || '',
        caregiver_phone: personDetails.guardian_phone || '',
        caregiver_relationship: personDetails.relationship || '',
        gender: personDetails.gender || '',
        employee_id: '',
        department: '',
        role: '',
      };

      // Append both user_data and disabled_data as JSON
      formDataToSend.append('user_data', JSON.stringify(disabledData));
      formDataToSend.append('disabled_data', JSON.stringify(disabledData));

      // Handle image from file upload or webcam
      let imageFile: File | null = null;

      if (selectedImage) {
        // If image was uploaded from file input
        imageFile = selectedImage;
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

        // For debugging - log all form data entries
        console.log('Form data entries being sent to server:');
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
      console.log('Sending registration with image to API');

      // Use the registration API service
      const responseData = await registrationApi.registerUser(formDataToSend);
      console.log('Registration successful:', responseData);

      // Show success message and store the user ID from response
      setSubmitSuccess(true);

      // Use the ID from the response to identify the user
      const userId = responseData?.user_id;
      const userName = responseData?.user?.name || personDetails.name;
      toast.success(`${userName} registered successfully!`);

      console.log(`User registered with ID: ${userId || 'Not available'}`);
      console.log(
        `Image path: ${responseData?.user?.image_path || 'Not available'}`
      );
      console.log(`Face ID: ${responseData?.face_id || 'Not available'}`);

      // Fix the user verification section
      if (userId) {
        // Try to verify the registration up to 3 times with delays
        let user: UserWithFaceId | null = null;
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries) {
          try {
            const verificationData =
              await registrationApi.verifyRegistration(userId);
            // Cast the user to our interface that includes face_id
            user = verificationData.user as UserWithFaceId;

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
          } catch (error) {
            console.error('Error during verification:', error);
            retryCount++;
            if (retryCount >= maxRetries) break;
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

      // Reset form after success
      setTimeout(() => {
        setPersonDetails(initialFormData);
        setCapturedImage(null);
        setSelectedImage(null);
        setPreviewUrl('');
        setCurrentSection(1);
        setFormErrors([]);
        setSubmitSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error registering disabled person:', error);

      // Display error in form
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An unknown error occurred during registration';

      setFormErrors([errorMessage]);
      toast.error(errorMessage);
    } finally {
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
        </div>
      </div>

      {submitSuccess ? (
        <motion.div
          className="max-w-xl mx-auto bg-purple-500/20 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-purple-300/30 text-white mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold mb-4">
            Accompanying Person Report Submitted
          </h2>
          <p>
            Thank you for submitting this report. The information has been
            recorded successfully.
          </p>
          <p className="mt-4">
            Case reference:{' '}
            {Math.random().toString(36).substring(2, 10).toUpperCase()}
          </p>
          <button
            onClick={clearForm}
            className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Submit Another Report
          </button>
        </motion.div>
      ) : (
        <motion.form
          onSubmit={handleSubmit}
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

              {/* Toggle between upload and camera capture */}
              <div className="flex items-center space-x-4 mb-4">
                <button
                  type="button"
                  onClick={handleToggleCamera}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  {useCamera ? 'Switch to Upload' : 'Switch to Camera'}
                </button>
                <div>
                  {useCamera ? (
                    <FaCamera className="text-white text-2xl" />
                  ) : (
                    <FaUpload className="text-white text-2xl" />
                  )}
                </div>
              </div>

              {/* Upload image option */}
              {!useCamera ? (
                <div className="flex flex-col items-center">
                  <label className="block text-white font-semibold mb-2">
                    Upload Person's Photo
                  </label>
                  <div
                    className="cursor-pointer"
                    onClick={() =>
                      document.getElementById('fileInput')?.click()
                    }
                  >
                    <AnimatedFaceIcon size="md" text="Click to upload" />
                  </div>
                  <input
                    id="fileInput"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="mt-2 w-32 h-32 object-cover rounded-md shadow-md"
                    />
                  )}
                </div>
              ) : (
                // Camera capture section
                <div className="flex flex-col items-center text-white">
                  {!capturedImage ? (
                    <>
                      <div className="relative w-full max-w-md rounded-lg overflow-hidden border-2 border-purple-400">
                        <Webcam
                          audio={false}
                          ref={webcamRef}
                          screenshotFormat="image/jpeg"
                          videoConstraints={{
                            width: 480,
                            height: 480,
                            facingMode: 'user',
                          }}
                        />
                        <button
                          type="button"
                          onClick={captureImage}
                          className="absolute bottom-4 right-4 bg-purple-600 text-white p-2 rounded"
                        >
                          <FaCamera className="text-white text-2xl" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={retakePhoto}
                        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        Retake Photo
                      </button>
                    </>
                  ) : (
                    <div className="w-32 h-32">
                      <img
                        src={capturedImage}
                        alt="Captured"
                        className="object-cover w-full h-full rounded-md shadow-md"
                      />
                      <button
                        type="button"
                        onClick={retakePhoto}
                        className="absolute top-2 right-2 bg-purple-600 text-white p-2 rounded"
                      >
                        <FaRedo className="text-white text-2xl" />
                      </button>
                    </div>
                  )}
                </div>
              )}
              <SectionButtons onPrev={prevSection} />
            </motion.div>
          )}
        </motion.form>
      )}
    </>
  );
}

export default AddDisabled;
