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
}

type UserData = BaseUserData &
  Partial<CriminalRecordData> &
  Partial<VehicleData>;

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

    // Add required fields
    formData.append('name', userData.name || '');
    formData.append('category', category);

    // IMPORTANT: Add nickname explicitly - this seems to be causing the error
    // Make sure it's a non-empty string with a default value
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
    console.log('Form data entries:');
    for (const pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    // Make the API request
    const response = await axios.post(
      `${API_URL}/api/register/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // Increase timeout for large files
      }
    );

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

/**
 * Register a person using base64 image
 */
export const registerPersonWithBase64 = async (
  payload: UserData & { image_base64: string },
  category: string
) => {
  try {
    // Ensure category is set
    payload.category = category;

    // Ensure nickname is set to a non-empty value
    if (!payload.nickname || payload.nickname === '') {
      payload.nickname = 'unnamed'; // Use a default value instead of empty string
    }

    // Backend expects image_base64 as a string parameter
    // Make sure it doesn't have the data URI prefix
    if (payload.image_base64 && payload.image_base64.startsWith('data:image')) {
      payload.image_base64 = payload.image_base64.split(',')[1];
    }

    console.log('Sending base64 registration with keys:', Object.keys(payload));

    const response = await axios.post(`${API_URL}/api/register`, payload, {
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

      // Log more detailed error information
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
export const recognizeFace = async (imageFile: File, userId?: string) => {
  try {
    const formData = new FormData();
    formData.append('file', imageFile);

    // If userId is provided, add it for specific verification
    if (userId) {
      formData.append('user_id', userId);
    }

    console.log('Sending face recognition request with file');

    const response = await axios.post(`${API_URL}/api/recognize`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Face Recognition Error:', {
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
 * Recognize a face from base64 image
 */
export const recognizeFaceBase64 = async (
  imageBase64: string,
  userId?: string
) => {
  try {
    // Handle data URI format
    if (imageBase64.startsWith('data:image')) {
      imageBase64 = imageBase64.split(',')[1];
    }

    const payload = { image_base64: imageBase64, user_id: userId };

    console.log('Sending face recognition request with base64');

    const response = await axios.post(`${API_URL}/api/recognize`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Face Recognition Base64 Error:', {
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
 * Handle image upload for person registration (supports both file and base64)
 */
export const handleImageUpload = async (
  imageFile: File | null,
  capturedImage: string | null,
  formData: UserData,
  category: string
) => {
  try {
    // If we have a captured image from webcam (base64)
    if (capturedImage) {
      console.log('Using captured image (base64)');

      // Prepare payload for base64 registration
      const payload = {
        ...formData,
        image_base64: capturedImage,
      };

      return await registerPersonWithBase64(payload, category);
    }
    // If we have a file upload
    else if (imageFile) {
      console.log('Using file upload, file size:', imageFile.size);

      // Try the alternative approach for male category
      if (category === 'male') {
        console.log('Using alternative registration approach for male');
        try {
          return await registerManAlternative(imageFile, formData);
        } catch (error) {
          console.error(
            'Alternative registration failed, falling back to standard method:',
            error
          );
          // Fall back to standard method if alternative fails
        }
      }

      // Use the standard implementation
      return await registerPersonWithFile(imageFile, formData, category);
    }

    throw new Error('No image provided');
  } catch (error) {
    console.error('Error in handleImageUpload:', error);
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

          // Use the /api/register endpoint instead
          const response = await axios.post(
            `${API_URL}/api/register`,
            payload,
            {
              headers: {
                'Content-Type': 'application/json',
              },
              timeout: 60000,
            }
          );

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
 * Register a person using the /api/register/file endpoint
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
    console.log('Form data entries for /api/register/file:');
    for (const pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    // Make the API request to the /api/register/file endpoint
    const response = await axios.post(
      `${API_URL}/api/register/file`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // Increase timeout for large files
      }
    );

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
