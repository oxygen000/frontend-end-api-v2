import axios from 'axios';
import { BASE_API_URL } from '../config/constants';

// Common API URL
const API_URL = BASE_API_URL;

// Define types for user data
interface BaseUserData {
  name: string;
  nickname?: string;
  dob: string;
  national_id: string;
  address: string;
  phone_number: string;
  phone_company: string;
  second_phone_number?: string;
  category: string;
  form_type: string;
}

interface CriminalRecordData {
  has_criminal_record: number;
  arrest?: string;
  case_number?: string;
  security_directorate?: string;
  police_station?: string;
  description?: string;
  sentence?: string;
  fame?: string;
  case_date?: string;
}

interface VehicleData {
  has_motorcycle: number;
  vehicle_model?: string;
  traffic_department?: string;
  license_plate?: string;
  vehicle_color?: string;
  license_expiration?: string;
  manufacture_year?: string;
  chassis_number?: string;
  vehicle_number?: string;
}

interface TravelData {
  travel_date?: string;
  travel_destination?: string;
  arrival_airport?: string;
  arrival_date?: string;
  flight_number?: string;
  return_date?: string;
}

interface ChildData {
  date_of_birth?: string;
  physical_description?: string;
  last_clothes?: string;
  area_of_disappearance?: string;
  last_seen_time?: string;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_id?: string;
}

interface DisabledData {
  disability_type?: string;
  disability_description?: string;
  medical_condition?: string;
  special_needs?: string;
  emergency_contact?: string;
  emergency_phone?: string;
}

type UserData = BaseUserData &
  Partial<CriminalRecordData> &
  Partial<VehicleData> &
  Partial<TravelData> &
  Partial<ChildData> &
  Partial<DisabledData>;

// Add type definition at the top of the file
interface RecognitionResponse {
  recognized: boolean;
  username?: string;
  user_id?: string;
  message?: string;
}

/**
 * Register a person using file upload - direct implementation
 */
export const registerPersonWithFile = async (
  file: File,
  userData: UserData,
  category: string
) => {
  try {
    // Create a new FormData instance
    const formData = new FormData();

    // Add the file
    formData.append('file', file);

    // Add all user data fields
    for (const [key, value] of Object.entries(userData)) {
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    }

    // Ensure required fields are set
    formData.append('category', category);
    formData.append('form_type', userData.form_type || 'adult');
    formData.append('nickname', userData.nickname || 'unnamed');

    // Log all form data entries for debugging
    console.log('Form data entries:');
    for (const pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    // Make the API request
    const response = await axios.post(`${API_URL}/register/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // Increase timeout for large files
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error Details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });

      if (error.response?.data) {
        console.error('Server error response:', error.response.data);
      }
    }
    throw error;
  }
};

/**
 * Register a person using base64 image
 */
export const registerPersonWithBase64 = async (
  payload: UserData & { image_base64: string },
  category: string
) => {
  try {
    // Ensure required fields are set
    payload.category = category;
    payload.form_type = payload.form_type || 'adult';
    payload.nickname = payload.nickname || 'unnamed';

    // Handle base64 image
    if (payload.image_base64 && payload.image_base64.startsWith('data:image')) {
      payload.image_base64 = payload.image_base64.split(',')[1];
    }

    // Validate base64 data
    if (!payload.image_base64) {
      throw new Error('Invalid base64 image data');
    }

    console.log('Sending base64 registration with keys:', Object.keys(payload));

    const response = await axios.post(`${API_URL}/register`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error Details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });

      if (error.response?.data) {
        console.error('Server error response:', error.response.data);
      }
    }
    throw error;
  }
};

/**
 * Recognize a face from an image file
 */
export const recognizeFace = async (file: File, preselectedId?: string) => {
  const formData = new FormData();
  formData.append('file', file);
  if (preselectedId) {
    formData.append('id', preselectedId);
  }

  try {
    const response = await axios.post(`${API_URL}/recognize`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Recognition failed');
    }
    throw error;
  }
};

/**
 * Recognize a face from base64 image
 */
export const recognizeFaceBase64 = async (
  base64Image: string,
  preselectedId?: string
): Promise<RecognitionResponse> => {
  try {
    // Ensure the base64 string is properly formatted
    const formattedBase64 = base64Image.startsWith('data:image')
      ? base64Image.split(',')[1]
      : base64Image;

    if (!formattedBase64) {
      throw new Error(
        'No image provided. Please upload a file or provide base64 data.'
      );
    }

    // Create FormData for multipart/form-data
    const formData = new FormData();
    formData.append(
      'file',
      new Blob([formattedBase64], { type: 'image/jpeg' }),
      'image.jpg'
    );

    if (preselectedId) {
      formData.append('id', preselectedId);
    }

    const response = await axios.post(`${API_URL}/recognize`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error in recognizeFaceBase64:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.detail || 'Failed to recognize face'
      );
    }
    throw error;
  }
};

/**
 * Handle image upload for person registration (supports both file and base64)
 */
export const handleImageUpload = async (
  imageFile: File | null,
  capturedImage: string | null,
  formData: UserData,
  category: string
) => {
  try {
    // First try alternative registration with base64
    if (capturedImage) {
      console.log('Using captured image, size:', capturedImage.length);
      try {
        const base64Data = capturedImage.startsWith('data:image')
          ? capturedImage.split(',')[1]
          : capturedImage;

        if (!base64Data) {
          throw new Error('Invalid base64 image data');
        }

        const result = await registerPersonWithBase64(
          { ...formData, image_base64: base64Data },
          category
        );

        if (result && result.user_id) {
          return result;
        }
      } catch (error) {
        console.error(
          'Alternative registration failed, falling back to standard method:',
          error
        );
      }
    }

    // If alternative registration failed or no captured image, try file upload
    if (imageFile) {
      console.log('Using file upload, file size:', imageFile.size);

      // Validate file type
      if (!imageFile.type.startsWith('image/')) {
        throw new Error('Invalid file type. Please upload an image file.');
      }

      // Validate file size (max 1MB)
      if (imageFile.size > 1024 * 1024) {
        throw new Error(
          'File size too large. Please upload an image smaller than 1MB.'
        );
      }

      // Create a new FormData instance
      const formDataObj = new FormData();
      formDataObj.append('file', imageFile);

      // Add all user data fields
      for (const [key, value] of Object.entries(formData)) {
        if (value !== null && value !== undefined) {
          formDataObj.append(key, String(value));
        }
      }

      // Ensure required fields are set
      formDataObj.append('category', category);
      formDataObj.append('form_type', formData.form_type || 'adult');
      formDataObj.append('nickname', formData.nickname || 'unnamed');

      // Log form data for debugging
      console.log('Form data entries:');
      for (const pair of formDataObj.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

      // Make the API request
      const response = await axios.post(
        `${API_URL}/register/upload`,
        formDataObj,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000, // 60 second timeout
        }
      );

      return response.data;
    }

    throw new Error('No image provided');
  } catch (error) {
    console.error('Error in handleImageUpload:', error);
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(errorMessage);
    }
    throw error;
  }
};

/**
 * Register a man using a different endpoint approach
 */
export const registerManAlternative = async (
  file: File,
  userData: UserData
) => {
  try {
    // Convert file to base64
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onload = async (e) => {
        try {
          if (!e.target || !e.target.result) {
            reject(new Error('Failed to read file'));
            return;
          }

          // Get base64 string
          const base64String = e.target.result.toString().split(',')[1];

          // Create payload with base64 image
          const payload = {
            ...userData,
            image_base64: base64String,
            category: 'male', // Explicitly set category
          };

          // Make sure nickname is present and non-empty
          if (!payload.nickname || payload.nickname === '') {
            payload.nickname = 'unnamed'; // Use a default value instead of space
          }

          console.log(
            'Sending alternative registration with keys:',
            Object.keys(payload)
          );

          // Use the /register endpoint instead
          const response = await axios.post(`${API_URL}/register`, payload, {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 60000,
          });

          resolve(response.data);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };

      // Read file as data URL
      reader.readAsDataURL(file);
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error Details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
    }
    throw error;
  }
};

/**
 * Register a person using the /register/file endpoint
 */
export const registerPersonWithFileEndpoint = async (
  file: File,
  userData: UserData,
  category: string
) => {
  try {
    // Create a new FormData instance
    const formData = new FormData();

    // Add the file
    formData.append('file', file);

    // Add required fields
    formData.append('name', userData.name || '');
    formData.append('category', category);

    // IMPORTANT: Add nickname explicitly with a default value
    formData.append('nickname', userData.nickname || 'unnamed'); // Use a default value instead of empty string

    // Add all other fields
    for (const [key, value] of Object.entries(userData)) {
      if (key !== 'name' && key !== 'category' && key !== 'nickname') {
        formData.append(
          key,
          value === null || value === undefined ? '' : String(value)
        );
      }
    }

    // Log all form data entries for debugging
    console.log('Form data entries for /register/file:');
    for (const pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    // Make the API request to the /register/file endpoint
    const response = await axios.post(`${API_URL}/register/file`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // Increase timeout for large files
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error Details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });

      // Log more detailed error information
      if (error.response?.data) {
        console.error('Server error response:', error.response.data);
      }
    }
    throw error;
  }
};

export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/health/ready`);
    return response.ok;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
};
