import axios from 'axios';

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  'https://backend-fast-api-ai.fly.dev/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
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

// API functions for male users
export const maleApi = {
  create: async (userData: MaleUser, image?: File) => {
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

        formData.append('image', image);
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

  getAll: async (skip = 0, limit = 100) => {
    const response = await api.get('/males', { params: { skip, limit } });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/males/${id}`);
    return response.data;
  },
};

// API functions for female users
export const femaleApi = {
  create: async (userData: FemaleUser, image?: File) => {
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

        formData.append('image', image);
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

  getAll: async (skip = 0, limit = 100) => {
    const response = await api.get('/females', { params: { skip, limit } });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/females/${id}`);
    return response.data;
  },
};

// API functions for child users
export const childApi = {
  create: async (userData: ChildUser, image?: File) => {
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

        formData.append('image', image);
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

  getAll: async (skip = 0, limit = 100) => {
    const response = await api.get('/children', { params: { skip, limit } });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/children/${id}`);
    return response.data;
  },
};

// API functions for disabled users
export const disabledApi = {
  create: async (userData: DisabledUser, image?: File) => {
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

        formData.append('image', image);
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

  getAll: async (skip = 0, limit = 100) => {
    const response = await api.get('/disabled', { params: { skip, limit } });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/disabled/${id}`);
    return response.data;
  },
};

// Common API functions
export const commonApi = {
  search: async (query: string, category?: string) => {
    const response = await api.get('/search', { params: { query, category } });
    return response.data;
  },

  getCount: async (category?: string) => {
    const response = await api.get('/count', { params: { category } });
    return response.data;
  },
};

export default api;
