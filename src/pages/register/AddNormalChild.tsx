import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import Webcam from 'react-webcam';
import { FaCamera, FaUpload, FaRedo } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import AnimatedFaceIcon from '../../components/AnimatedFaceIcon';
import { BASE_API_URL } from '../../config/constants';
import { registrationApi } from '../../services/api';

// SectionButtons component
const SectionButtons = ({
  onPrev,
  onNext,
  isSubmitting = false,
}: {
  onPrev?: () => void;
  onNext?: () => void;
  isSubmitting?: boolean;
}) => (
  <div className="flex justify-between mt-6">
    {onPrev && (
      <button
        type="button"
        onClick={onPrev}
        disabled={isSubmitting}
        className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
      >
        Previous
      </button>
    )}
    {onNext && (
      <button
        type="button"
        onClick={onNext}
        disabled={isSubmitting}
        className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors ml-auto disabled:opacity-50"
      >
        Next
      </button>
    )}
    {!onNext && (
      <button
        type="submit"
        disabled={isSubmitting}
        className={`px-4 py-2 ${
          isSubmitting ? 'bg-gray-500' : 'bg-blue-600'
        } text-white rounded-md`}
      >
        {isSubmitting ? 'Processing...' : 'Submit'}
      </button>
    )}
  </div>
);

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

  // Disappearance details
  last_seen_time: string;
  last_seen_location: string;
  last_seen_clothes: string;
  physical_description: string;

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
  address: '',
  guardian_name: '',
  guardian_phone: '',
  relationship: '',
  last_seen_time: '',
  last_seen_location: '',
  last_seen_clothes: '',
  physical_description: '',
  additional_notes: '',
  form_type: 'child',
  image: null,
  useCamera: false,
};

function AddNormalChild() {
  const [currentSection, setCurrentSection] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [useCamera, setUseCamera] = useState(false);
  const webcamRef = useRef<Webcam>(null);

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

  // Add state for storing the user ID from response
  const [registeredUserId, setRegisteredUserId] = useState<string | null>(null);

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

  // Enhanced form submission with better error handling and face_id retry
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Debug the form data first
      console.log('Form data being submitted:', formData);

      // Create a FormData object to handle file upload
      const formDataToSend = new FormData();

      // Important: These are all the specific fields that the backend expects
      // Basic user fields - match exactly what the backend expects
      formDataToSend.append('name', formData.name);
      formDataToSend.append('nickname', formData.name.split(' ')[0] || '');
      formDataToSend.append('dob', formData.dob);
      formDataToSend.append('national_id', formData.national_id || '');
      formDataToSend.append('address', formData.address || '');
      formDataToSend.append('category', 'child');
      formDataToSend.append('form_type', 'child');

      // Additional fields that might be required by the backend
      formDataToSend.append('employee_id', ''); // Backend expects this field
      formDataToSend.append('department', '');
      formDataToSend.append('role', '');
      formDataToSend.append('bypass_angle_check', 'true');
      formDataToSend.append('train_multiple', 'true');

      // Child-specific fields - directly append to formData with exact backend field names
      formDataToSend.append('date_of_birth', formData.dob || '');
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
        employee_id: '',
        department: '',
        role: '',
      };

      // Append the complete user data in JSON format
      formDataToSend.append('user_data', JSON.stringify(childData));
      formDataToSend.append('child_data', JSON.stringify(childData));

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

      // Use the registration API service instead of direct fetch
      const responseData = await registrationApi.registerUser(formDataToSend);
      console.log('Response data:', responseData);

      // Handle successful registration
      setSubmitSuccess(true);
      setIsSubmitting(false);

      // Use the ID from the response to navigate to the user profile
      const userId = responseData?.user_id;
      const userName = responseData?.user?.name || formData.name;
      if (userId) {
        setRegisteredUserId(userId);
      }
      toast.success(`${userName} registered successfully!`);

      // Reset form data after animation plays
      setTimeout(() => {
        setFormData(initialFormData);
        setCapturedImage(null);
        setCurrentSection(1);
        setSubmitSuccess(false);
        setIsSubmitting(false);
      }, 3000);

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
          try {
            const verificationData =
              await registrationApi.verifyRegistration(userId);
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

  return (
    <div className="p-6">
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
          Back to Home
        </Link>
      </div>

      {/* Form Progress Indicator */}
      <div className="flex justify-center mt-6">
        <div className="flex items-center space-x-4">
          {[1, 2, 3, 4].map((step, idx) => (
            <React.Fragment key={step}>
              {idx > 0 && (
                <div className="w-16 h-1 bg-gray-300">
                  <div
                    className={`h-full ${currentSection >= step ? 'bg-orange-600' : 'bg-gray-300'}`}
                  ></div>
                </div>
              )}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
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

      {submitSuccess ? (
        <motion.div
          className="max-w-2xl mx-auto bg-orange-500/20 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-orange-300/30 text-white mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4"
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
            Child has been registered successfully.
          </p>
          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
            <motion.div
              className="bg-orange-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 3, ease: 'linear' }}
            />
          </div>
          <p className="text-center mt-4 text-white/70">
            Starting new registration in a moment...
          </p>

          {registeredUserId && (
            <div className="mt-4 p-3 bg-white/10 rounded-lg">
              <p className="text-center font-medium">Case Reference ID:</p>
              <p className="text-center text-xl font-bold">
                {registeredUserId}
              </p>
              <p className="text-center text-sm mt-2">
                Please save this ID for future reference
              </p>
            </div>
          )}
        </motion.div>
      ) : (
        <motion.form
          onSubmit={handleFormSubmit}
          className="max-w-2xl mx-auto bg-white/20 backdrop-blur-lg p-10 mt-6 rounded-2xl shadow-[0_0_30px_5px_rgba(255,165,0,0.3)] text-white border border-white/30 space-y-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-center mb-6">
            Child Registration
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

          {/* Section 1: Basic Information */}
          {currentSection === 1 && (
            <motion.div
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <Input
                label="Child's Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
              <Input
                label="Date of Birth"
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleInputChange}
              />
              <div>
                <label className="block font-medium mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <SectionButtons onNext={nextSection} />
            </motion.div>
          )}

          {/* Section 2: Guardian Information */}
          {currentSection === 2 && (
            <motion.div
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold">Guardian Information</h3>
              <Input
                label="Guardian's Name"
                name="guardian_name"
                value={formData.guardian_name}
                onChange={handleInputChange}
              />
              <Input
                label="Guardian's Phone Number"
                name="guardian_phone"
                value={formData.guardian_phone}
                onChange={handleInputChange}
              />
              <div>
                <label className="block font-medium mb-1">
                  Relationship to Child
                </label>
                <select
                  name="relationship"
                  value={formData.relationship}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Relationship</option>
                  <option value="parent">Parent</option>
                  <option value="grandparent">Grandparent</option>
                  <option value="sibling">Sibling</option>
                  <option value="aunt/uncle">Aunt/Uncle</option>
                  <option value="legalGuardian">Legal Guardian</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <SectionButtons onPrev={prevSection} onNext={nextSection} />
            </motion.div>
          )}

          {/* Section 3: Disappearance Details */}
          {currentSection === 3 && (
            <motion.div
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold">Disappearance Details</h3>
              <Input
                label="Last Seen (Date & Time)"
                name="last_seen_time"
                type="datetime-local"
                value={formData.last_seen_time}
                onChange={handleInputChange}
              />
              <Input
                label="Last Known Location"
                name="last_seen_location"
                value={formData.last_seen_location}
                onChange={handleInputChange}
              />
              <Textarea
                label="Clothes Worn When Last Seen"
                name="last_seen_clothes"
                value={formData.last_seen_clothes}
                onChange={handleInputChange}
              />
              <Textarea
                label="Physical Description"
                name="physical_description"
                value={formData.physical_description}
                onChange={handleInputChange}
              />
              <Textarea
                label="Additional Notes"
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
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold">Child's Photo</h3>
              <p className="text-white/80">
                Please upload a clear photo of the child's face to help with
                identification.
              </p>
              <div className="flex flex-col items-center">
                {/* Toggle between upload and camera capture */}
                <div className="flex items-center space-x-4 mb-4">
                  <button
                    type="button"
                    onClick={handleToggleCamera}
                    className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                  >
                    {formData.useCamera
                      ? 'Switch to Upload'
                      : 'Switch to Camera'}
                  </button>
                  <div>
                    {formData.useCamera ? (
                      <FaCamera className="text-white text-2xl" />
                    ) : (
                      <FaUpload className="text-white text-2xl" />
                    )}
                  </div>
                </div>

                {!formData.useCamera ? (
                  <div className="flex flex-col items-center">
                    <label className="block text-white font-semibold mb-2">
                      Upload Child's Photo
                    </label>
                    <div
                      className="cursor-pointer"
                      onClick={() =>
                        document.getElementById('fileInput')?.click()
                      }
                    >
                      <AnimatedFaceIcon size="md" text="Click to upload" />
                      <input
                        id="fileInput"
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>

                    {formData.image && (
                      <div className="mt-4 flex justify-center">
                        <img
                          src={URL.createObjectURL(formData.image)}
                          alt="Preview"
                          className="max-w-full max-h-64 rounded shadow-md"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  // Camera capture section
                  <div className="flex flex-col items-center text-white">
                    {!capturedImage ? (
                      <>
                        <div className="relative w-full max-w-md rounded-lg overflow-hidden border-2 border-orange-400">
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
                              <div className="w-64 h-64 border-2 border-orange-400 rounded-full opacity-50"></div>
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
                        </div>
                        <button
                          type="button"
                          className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center mx-auto"
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
              </div>
              <SectionButtons onPrev={prevSection}  />


              {/* Submit Button */}
              <div className="mt-8 flex flex-col items-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`
                    px-8 py-3 rounded-lg font-semibold
                    flex items-center justify-center
                    transition-all duration-300
                    ${
                      isSubmitting
                        ? 'bg-orange-400 cursor-not-allowed'
                        : 'bg-orange-600 hover:bg-orange-700 shadow-lg hover:shadow-orange-500/30'
                    }
                    text-white min-w-[200px]
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
              </div>
            </motion.div>
          )}
        </motion.form>
      )}
    </div>
  );
}

export default AddNormalChild;
