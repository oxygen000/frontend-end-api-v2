import axios from 'axios';
import { BASE_API_URL } from '../config/constants';

// Replace the local definition with the imported BASE_API_URL
// Make sure to append /api if needed
const API_URL = `${BASE_API_URL}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 second timeout
});

// Add request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || error.message;
      console.error('API Error:', {
        status: error.response?.status,
        message: errorMessage,
        data: error.response?.data,
      });
    }
    return Promise.reject(error);
  }
);

// Types
export interface BaseUser {
  id?: string;
  name: string;
  nickname?: string;
  dob?: string;
  national_id?: string;
  address?: string;
  additional_notes?: string;
}

export interface MaleUser extends BaseUser {
  job?: string;
  document_number?: string;
  employee_id?: string;
  department?: string;
  occupation?: string;
  phone_number?: string;
  phone_company?: string;
  second_phone_number?: string;
  has_criminal_record?: boolean;
  arrest?: string;
  case_details?: string;
  security_directorate?: string;
  police_station?: string;
  description?: string;
  sentence?: string;
  fame?: string;
  case_date?: string;
  case_number?: string;
  judgment?: string;
  accusation?: string;
  has_motorcycle?: boolean;
  vehicle?: string;
  traffic_department?: string;
  license_plate?: string;
  color?: string;
  license_expiration_date?: string;
  manufacture_year?: string;
  chassis_number?: string;
  vehicle_number?: string;
  vehicle_model?: string;
}

// Use MaleUser directly for female users since they share the same properties
export type FemaleUser = MaleUser;

export interface ChildUser extends BaseUser {
  gender?: string;
  age?: number;
  school?: string;
  grade?: string;
  guardian_name: string;
  guardian_phone: string;
  guardian_id: string;
  relationship: string;
  guardian_address?: string;
  guardian_job?: string;
  physical_description?: string;
  last_clothes?: string;
  area_of_disappearance?: string;
  last_known_location?: string;
  last_seen_time?: string;
}

export interface DisabledUser extends BaseUser {
  gender?: string;
  job?: string;
  document_number?: string;
  phone_number?: string;
  secondary_phone?: string;
  disability_type: string;
  disability_details: string;
  medical_condition?: string;
  medication?: string;
  caregiver_name?: string;
  caregiver_phone?: string;
  caregiver_relationship?: string;
  physical_description?: string;
  last_clothes?: string;
  area_of_disappearance?: string;
  last_known_location?: string;
  last_seen_time?: string;
}

// Define types for user data for registration
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
  has_criminal_record: number | string;
  arrest?: string;
  case_number?: string;
  security_directorate?: string;
  police_station?: string;
  description?: string;
  sentence?: string;
  fame?: string;
  case_date?: string;
  judgment?: string;
  accusation?: string;
  case_details?: string;
}

interface VehicleData {
  has_motorcycle: number | string;
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
  relationship?: string;
}

interface DisabledData {
  disability_type?: string;
  disability_details?: string;
  medical_condition?: string;
  special_needs?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  caregiver_name?: string;
  caregiver_phone?: string;
  caregiver_relationship?: string;
}

export type UserData = BaseUserData &
  Partial<CriminalRecordData> &
  Partial<VehicleData> &
  Partial<TravelData> &
  Partial<ChildData> &
  Partial<DisabledData>;

// Add type definition for recognition
export interface RecognitionResult {
  recognized: boolean;
  username?: string;
  user_id?: string;
  message?: string;
  status?: string;
}

export interface VerificationResult {
  user?: MaleUser | FemaleUser | ChildUser | DisabledUser;
  message?: string;
  status?: string;
}

export interface RegistrationResult {
  status: string;
  message: string;
  user_id?: string;
  face_id?: string;
  user?: {
    id: string;
    face_id: string;
    name: string;
    employee_id?: string;
    department?: string;
    role?: string;
    image_path: string;
    created_at: string;
    form_type?: string;
    [key: string]: unknown;
  };
  face_analysis?: {
    pose?: {
      yaw?: number;
      pitch?: number;
      roll?: number;
    };
    alignment_quality?: number;
    pose_recommendation?: string;
    [key: string]: unknown;
  };
  form_data?: Record<string, string | number | boolean | undefined>;
  multi_angle_trained?: boolean;
}

// Unified registration API
export const registrationApi = {
  registerUser: async (formData: FormData): Promise<RegistrationResult> => {
    try {
      // Debug logging to verify form data content
      console.log('Sending registration data to server...');

      // Log all keys in the FormData
      const formDataKeys = Array.from(formData.keys());
      console.log('FormData contains keys:', formDataKeys);

      // Check specifically for user_data
      if (formData.has('user_data')) {
        try {
          const userData = formData.get('user_data');
          if (typeof userData === 'string') {
            const parsedUserData = JSON.parse(userData);
            console.log('user_data content:', parsedUserData);
          } else {
            console.log('user_data is not a string:', userData);
          }
        } catch (parseError) {
          console.error('Error parsing user_data:', parseError);
        }
      } else {
        console.warn('FormData does not contain user_data');
      }

      // Send registration request using axios
      const response = await api.post('/register/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          (error.response?.data?.detail &&
          Array.isArray(error.response?.data?.detail)
            ? error.response?.data?.detail[0]?.msg
            : null) ||
          error.message;
        throw new Error(errorMessage);
      }
      throw error;
    }
  },

  verifyRegistration: async (userId: string): Promise<VerificationResult> => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        throw new Error(errorMessage);
      }
      throw error;
    }
  },

  // Register a person using base64 image
  registerWithBase64: async (
    payload: UserData & { image_base64: string },
    category: string
  ): Promise<RegistrationResult> => {
    try {
      // Ensure required fields are set
      payload.category = category;
      payload.form_type = payload.form_type || 'adult';
      payload.nickname = payload.nickname || 'unnamed';

      // Handle base64 image
      if (
        payload.image_base64 &&
        payload.image_base64.startsWith('data:image')
      ) {
        payload.image_base64 = payload.image_base64.split(',')[1];
      }

      // Validate base64 data
      if (!payload.image_base64) {
        throw new Error('Invalid base64 image data');
      }

      console.log(
        'Sending base64 registration with keys:',
        Object.keys(payload)
      );

      const response = await api.post('/register', payload);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          (error.response?.data?.detail &&
          Array.isArray(error.response?.data?.detail)
            ? error.response?.data?.detail[0]?.msg
            : null) ||
          error.message;
        throw new Error(errorMessage);
      }
      throw error;
    }
  },

  // Recognize a face using file upload
  recognizeFace: async (
    file: File,
    preselectedId?: string
  ): Promise<RecognitionResult> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      if (preselectedId) {
        formData.append('id', preselectedId);
      }

      const response = await api.post('/recognize', formData, {
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
  },

  // Recognize a face using base64 image
  recognizeFaceBase64: async (
    base64Image: string,
    preselectedId?: string
  ): Promise<RecognitionResult> => {
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

      // Create the payload
      const formData = new FormData();
      formData.append('image_base64', formattedBase64);

      if (preselectedId) {
        formData.append('id', preselectedId);
      }

      const response = await api.post('/recognize', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.detail || 'Failed to recognize face'
        );
      }
      throw error;
    }
  },

  // Check API health
  checkApiHealth: async (): Promise<boolean> => {
    try {
      const response = await api.get('/health/ready');
      return response.status === 200;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  },
};

// Define more specific return types
export interface ApiResponse<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UserListResponse {
  users: Array<MaleUser | FemaleUser | ChildUser | DisabledUser>;
  total?: number;
}

export interface UserResponse {
  user: MaleUser | FemaleUser | ChildUser | DisabledUser;
  success: boolean;
}

export interface CountResponse {
  count: number;
  category_counts?: Record<string, number>;
}

// API functions for male users
export const maleApi = {
  create: async (userData: MaleUser, image?: File): Promise<UserResponse> => {
    try {
      const formData = new FormData();

      // Add user data
      formData.append('user_data', JSON.stringify(userData));

      // Add image if provided
      if (image) {
        // Validate file type
        if (!image.type.startsWith('image/')) {
          throw new Error('Invalid file type. Please upload an image file.');
        }

        // Validate file size (max 1MB)
        if (image.size > 1024 * 1024) {
          throw new Error(
            'File size too large. Please upload an image smaller than 1MB.'
          );
        }

        formData.append('file', image);
      }

      const response = await api.post('/males', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        throw new Error(errorMessage);
      }
      throw error;
    }
  },

  getAll: async (skip = 0, limit = 100): Promise<UserListResponse> => {
    const response = await api.get('/males', { params: { skip, limit } });
    return response.data;
  },

  getById: async (id: string): Promise<UserResponse> => {
    const response = await api.get(`/males/${id}`);
    return response.data;
  },
};

// API functions for female users
export const femaleApi = {
  create: async (userData: FemaleUser, image?: File): Promise<UserResponse> => {
    try {
      const formData = new FormData();

      // Add user data
      formData.append('user_data', JSON.stringify(userData));

      // Add image if provided
      if (image) {
        // Validate file type
        if (!image.type.startsWith('image/')) {
          throw new Error('Invalid file type. Please upload an image file.');
        }

        // Validate file size (max 1MB)
        if (image.size > 1024 * 1024) {
          throw new Error(
            'File size too large. Please upload an image smaller than 1MB.'
          );
        }

        formData.append('file', image);
      }

      const response = await api.post('/females', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        throw new Error(errorMessage);
      }
      throw error;
    }
  },

  getAll: async (skip = 0, limit = 100): Promise<UserListResponse> => {
    const response = await api.get('/females', { params: { skip, limit } });
    return response.data;
  },

  getById: async (id: string): Promise<UserResponse> => {
    const response = await api.get(`/females/${id}`);
    return response.data;
  },
};

// API functions for child users
export const childApi = {
  create: async (userData: ChildUser, image?: File): Promise<UserResponse> => {
    try {
      const formData = new FormData();

      // Add user data
      formData.append('user_data', JSON.stringify(userData));

      // Add image if provided
      if (image) {
        // Validate file type
        if (!image.type.startsWith('image/')) {
          throw new Error('Invalid file type. Please upload an image file.');
        }

        // Validate file size (max 1MB)
        if (image.size > 1024 * 1024) {
          throw new Error(
            'File size too large. Please upload an image smaller than 1MB.'
          );
        }

        formData.append('file', image);
      }

      const response = await api.post('/children', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        throw new Error(errorMessage);
      }
      throw error;
    }
  },

  getAll: async (skip = 0, limit = 100): Promise<UserListResponse> => {
    const response = await api.get('/children', { params: { skip, limit } });
    return response.data;
  },

  getById: async (id: string): Promise<UserResponse> => {
    const response = await api.get(`/children/${id}`);
    return response.data;
  },
};

// API functions for disabled users
export const disabledApi = {
  create: async (
    userData: DisabledUser,
    image?: File
  ): Promise<UserResponse> => {
    try {
      const formData = new FormData();

      // Add user data
      formData.append('user_data', JSON.stringify(userData));

      // Add image if provided
      if (image) {
        // Validate file type
        if (!image.type.startsWith('image/')) {
          throw new Error('Invalid file type. Please upload an image file.');
        }

        // Validate file size (max 1MB)
        if (image.size > 1024 * 1024) {
          throw new Error(
            'File size too large. Please upload an image smaller than 1MB.'
          );
        }

        formData.append('file', image);
      }

      const response = await api.post('/disabled', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        throw new Error(errorMessage);
      }
      throw error;
    }
  },

  getAll: async (skip = 0, limit = 100): Promise<UserListResponse> => {
    const response = await api.get('/disabled', { params: { skip, limit } });
    return response.data;
  },

  getById: async (id: string): Promise<UserResponse> => {
    const response = await api.get(`/disabled/${id}`);
    return response.data;
  },
};

// Common API functions
export const commonApi = {
  search: async (
    query: string,
    category?: string
  ): Promise<UserListResponse> => {
    const response = await api.get('/search', { params: { query, category } });
    return response.data;
  },

  getCount: async (category?: string): Promise<CountResponse> => {
    const response = await api.get('/count', { params: { category } });
    return response.data;
  },
};

export default api;
