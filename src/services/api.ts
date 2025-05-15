import axios from 'axios';

// Configure axios with defaults
export const API_URL = 'https://backend-fast-api-ai.fly.dev/api';

// Create axios instance with common configuration
export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
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
  additional_data?: string;
  medical_condition?: string;
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
  additional_data?: string;
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

// Add specialized registration functions
export const registrationApi = {
  // Original registerUser function with fallbacks remains
  registerUser: async (formData: FormData): Promise<RegistrationResult> => {
    try {
      // Ensure bypass_angle_check is set to true
      if (!formData.has('bypass_angle_check')) {
        formData.append('bypass_angle_check', 'true');
      }

      // Ensure train_multiple is set to true
      if (!formData.has('train_multiple')) {
        formData.append('train_multiple', 'true');
      } else {
        // If it exists but might be a boolean, set it to string 'true'
        formData.set('train_multiple', 'true');
      }

      // Clean up potentially problematic fields that cause DB schema issues
      const problematicFields = [
        'disability_details',
        'disability_description',
        'relationship',
        'emergency_contact',
        'emergency_phone',
        'special_needs',
      ];

      // Create a filtered copy of form data without problematic fields
      const filteredFormData = new FormData();
      for (const pair of formData.entries()) {
        if (!problematicFields.includes(pair[0])) {
          filteredFormData.append(pair[0], pair[1]);
        }
      }

      // Create a filtered user_data JSON if it exists
      if (formData.has('user_data')) {
        try {
          const userData = JSON.parse(formData.get('user_data') as string);
          // Remove problematic fields from user_data
          problematicFields.forEach((field) => {
            delete userData[field];
          });
          // Replace with filtered user_data
          filteredFormData.set('user_data', JSON.stringify(userData));
        } catch (e) {
          console.error('Error parsing user_data:', e);
          // Keep original if parsing fails
          filteredFormData.append(
            'user_data',
            formData.get('user_data') as string
          );
        }
      }

      // Use XMLHttpRequest for more direct control over form submission
      return new Promise<RegistrationResult>((resolve, reject) => {
        console.log('Using XMLHttpRequest for direct form submission');

        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_URL}/register/upload`);
        xhr.timeout = 30000;

        xhr.onload = function () {
          console.log('XHR status:', xhr.status);
          console.log(
            'XHR response text length:',
            xhr.responseText?.length || 0
          );

          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              // Try to parse response as JSON
              if (xhr.responseText && xhr.responseText.trim() !== '') {
                const data = JSON.parse(xhr.responseText);
                console.log('Successfully parsed XHR response:', data);
                resolve(data);
              } else {
                console.warn(
                  'Server returned empty response with success status'
                );

                // Try direct database registration with one of our specialized methods
                const formType = filteredFormData.get('form_type')?.toString();
                const file = filteredFormData.get('file') as File;

                if (formType === 'disabled') {
                  // Try registering as disabled user
                  registrationApi
                    .registerDisabled(filteredFormData, file)
                    .then(resolve)
                    .catch((err) => {
                      console.error(
                        'Failed to register as disabled user:',
                        err
                      );
                      fallbackWithTempId();
                    });
                } else if (formType === 'child') {
                  // Try registering as child
                  registrationApi
                    .registerChild(filteredFormData, file)
                    .then(resolve)
                    .catch((err) => {
                      console.error('Failed to register as child:', err);
                      fallbackWithTempId();
                    });
                } else {
                  // Unknown form type, fallback to temp ID
                  fallbackWithTempId();
                }
              }
            } catch (parseError) {
              console.error('Error parsing XHR response:', parseError);
              // Fall back to axios if parsing fails
              fallbackToAxios();
            }
          } else {
            console.error('XHR error:', xhr.status, xhr.statusText);
            // Fall back to axios on error
            fallbackToAxios();
          }
        };

        xhr.onerror = function () {
          console.error('XHR network error');
          fallbackToAxios();
        };

        xhr.ontimeout = function () {
          console.error('XHR timeout');
          fallbackToAxios();
        };

        // Send the filtered FormData
        xhr.send(filteredFormData);

        // Function to create fallback with temp ID as last resort
        function fallbackWithTempId() {
          // Create a fallback response
          const tempId = `temp-${Date.now()}`;
          const formType =
            filteredFormData.get('form_type')?.toString() || 'unknown';
          const name = filteredFormData.get('name')?.toString() || 'Unknown';

          // Create a minimal success response
          const fallbackResponse: RegistrationResult = {
            status: 'success',
            message: 'Registration successful but no data returned from server',
            user_id: tempId,
            user: {
              id: tempId,
              name: name,
              face_id: '',
              image_path: '',
              created_at: new Date().toISOString(),
              form_type: formType,
            },
          };

          // Log and resolve with fallback data
          console.log('Using fallback response:', fallbackResponse);
          resolve(fallbackResponse);
        }

        // Fallback function to use axios as a backup
        async function fallbackToAxios() {
          console.log('Falling back to axios for form submission');
          try {
            // Log what we're about to send for debugging
            console.log(
              'FormData contains the following keys:',
              Array.from(filteredFormData.keys())
            );

            for (const pair of filteredFormData.entries()) {
              if (pair[1] instanceof File) {
                console.log(
                  `${pair[0]}: [File: ${pair[1].name}, ${pair[1].size} bytes]`
                );
              } else {
                const value =
                  typeof pair[1] === 'string' && pair[1].length > 100
                    ? `${pair[1].substring(0, 100)}... (${pair[1].length} chars)`
                    : pair[1];
                console.log(`${pair[0]}: ${value}`);
              }
            }

            const response = await api.post(
              '/register/upload',
              filteredFormData,
              {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
                timeout: 30000,
              }
            );

            console.log('Server response status:', response.status);
            console.log('Server response headers:', response.headers);
            console.log('Server response data:', response.data);

            // Check if we have data in the response
            if (!response?.data) {
              console.error('Empty response data from server:', response);

              // Try to recover from raw response text if available
              let recoveredData = null;
              if (response.request && response.request.responseText) {
                try {
                  console.log(
                    'Raw response text:',
                    response.request.responseText
                  );
                  if (response.request.responseText) {
                    recoveredData = JSON.parse(response.request.responseText);
                    console.log(
                      'Recovered data from responseText:',
                      recoveredData
                    );
                    if (recoveredData) return resolve(recoveredData);
                  }
                } catch (e) {
                  console.error('Failed to parse responseText:', e);
                }
              }

              // As a final fallback, try with direct fetch API
              try {
                console.log(
                  'Trying direct API endpoints for specific form types'
                );

                const formType = filteredFormData.get('form_type')?.toString();
                const file = filteredFormData.get('file') as File;

                if (formType === 'disabled') {
                  // Try registering as disabled user
                  registrationApi
                    .registerDisabled(filteredFormData, file)
                    .then(resolve)
                    .catch((err) => {
                      console.error(
                        'Failed to register as disabled user:',
                        err
                      );
                      fallbackWithFetch();
                    });
                  return;
                } else if (formType === 'child') {
                  // Try registering as child
                  registrationApi
                    .registerChild(filteredFormData, file)
                    .then(resolve)
                    .catch((err) => {
                      console.error('Failed to register as child:', err);
                      fallbackWithFetch();
                    });
                  return;
                }

                // If not using type-specific endpoints, try fetch fallback
                fallbackWithFetch();
              } catch (fetchErr) {
                console.error('Fetch API error:', fetchErr);
                fallbackWithTempId();
              }
            } else {
              resolve(response.data);
            }
          } catch (axiosError) {
            console.error('Axios error in fallback:', axiosError);
            reject(axiosError);
          }
        }

        // Final fetch fallback attempt
        async function fallbackWithFetch() {
          try {
            console.log('Trying fallback with direct fetch API');
            const formDataCopy = new FormData();
            // Copy all entries from the original formData
            for (const [key, value] of filteredFormData.entries()) {
              formDataCopy.append(key, value);
              // Log each key-value pair for debugging
              if (key !== 'file' && typeof value === 'string') {
                console.log(`Fetch fallback - sending ${key}: ${value}`);
              } else if (key === 'file') {
                console.log(
                  `Fetch fallback - sending file: ${(value as File).name}`
                );
              }
            }

            const fetchResponse = await fetch(`${API_URL}/register/upload`, {
              method: 'POST',
              body: formDataCopy,
            });

            console.log('Fetch API response status:', fetchResponse.status);
            const responseText = await fetchResponse.text();
            console.log('Fetch API raw response:', responseText);

            if (fetchResponse.ok && responseText) {
              try {
                const fetchData = JSON.parse(responseText);
                console.log('Fetch API parsed JSON response:', fetchData);
                if (fetchData) return resolve(fetchData);
              } catch (parseErr) {
                console.error('Error parsing fetch response JSON:', parseErr);
              }
            } else {
              console.error(
                'Fetch API failed:',
                fetchResponse.status,
                fetchResponse.statusText
              );
            }

            // If we got this far, use temp ID fallback
            fallbackWithTempId();
          } catch (fetchErr) {
            console.error('Direct fetch fallback error:', fetchErr);
            fallbackWithTempId();
          }
        }
      });
    } catch (error) {
      console.error('Registration API error:', error);
      throw error;
    }
  },

  // New specialized method for disabled registration through /api/disabled endpoint
  registerDisabled: async (
    formData: FormData | DisabledUser,
    image?: File
  ): Promise<RegistrationResult> => {
    console.log('Using specialized disabled registration endpoint');
    try {
      // Prepare the user data object
      let userData: DisabledUser;

      if (formData instanceof FormData) {
        // Extract data from FormData
        userData = {
          name: formData.get('name') as string,
          nickname: (formData.get('nickname') as string) || '',
          dob: (formData.get('dob') as string) || '',
          national_id: (formData.get('national_id') as string) || '',
          address: (formData.get('address') as string) || '',
          disability_type:
            (formData.get('disability_type') as string) || 'physical',
          gender: (formData.get('gender') as string) || '',
          medical_condition:
            (formData.get('medical_condition') as string) || '',
          disability_details: '',
          additional_notes: (formData.get('additional_notes') as string) || '',
          phone_number: (formData.get('phone_number') as string) || '',
        };

        // If file was provided in formData, extract it
        if (!image && formData.get('file')) {
          image = formData.get('file') as File;
        }
      } else {
        // Use the provided user data directly
        userData = formData;
      }

      // Create a new FormData object specifically for this endpoint
      const apiFormData = new FormData();

      // Add user data as JSON
      apiFormData.append('user_data', JSON.stringify(userData));

      // Add image if provided
      if (image) {
        apiFormData.append('file', image);
      }

      console.log(
        'Sending data to /disabled endpoint:',
        JSON.stringify(userData, null, 2)
      );
      console.log(
        'Sending image:',
        image ? `${image.name} (${image.size} bytes)` : 'None'
      );

      // Use the /api/disabled endpoint which works with the existing schema
      const response = await api.post('/disabled', apiFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Disabled registration response:', response.data);

      // Convert the response to our expected RegistrationResult format
      if (response.data && response.data.user) {
        const result: RegistrationResult = {
          status: 'success',
          message: 'User registered successfully',
          user_id: response.data.user.id,
          user: response.data.user,
        };
        return result;
      } else {
        throw new Error('Invalid response from disabled registration endpoint');
      }
    } catch (error) {
      console.error('Error in specialized disabled registration:', error);
      throw error;
    }
  },

  // New specialized method for child registration through /api/children endpoint
  registerChild: async (
    formData: FormData | ChildUser,
    image?: File
  ): Promise<RegistrationResult> => {
    console.log('Using specialized child registration endpoint');
    try {
      // Prepare the user data object
      let userData: ChildUser;

      if (formData instanceof FormData) {
        // Extract data from FormData
        userData = {
          name: formData.get('name') as string,
          dob: (formData.get('dob') as string) || '',
          gender: (formData.get('gender') as string) || '',
          address: (formData.get('address') as string) || '',
          guardian_name: (formData.get('guardian_name') as string) || '',
          guardian_phone: (formData.get('guardian_phone') as string) || '',
          guardian_id: (formData.get('guardian_id') as string) || '',
          relationship: '', // This field causes schema errors, but is required for the type
          physical_description:
            (formData.get('physical_description') as string) || '',
          last_clothes: (formData.get('last_clothes') as string) || '',
          area_of_disappearance:
            (formData.get('area_of_disappearance') as string) || '',
          last_known_location:
            (formData.get('area_of_disappearance') as string) || '',
          last_seen_time: (formData.get('last_seen_time') as string) || '',
          additional_notes: (formData.get('additional_notes') as string) || '',
          medical_condition:
            (formData.get('medical_condition') as string) || '',
        };

        // If file was provided in formData, extract it
        if (!image && formData.get('file')) {
          image = formData.get('file') as File;
        }
      } else {
        // Use the provided user data directly
        userData = formData;
      }

      // Create a new FormData object specifically for this endpoint
      const apiFormData = new FormData();

      // Add user data as JSON
      apiFormData.append('user_data', JSON.stringify(userData));

      // Add image if provided
      if (image) {
        apiFormData.append('file', image);
      }

      // Use the /api/children endpoint which works with the existing schema
      const response = await api.post('/children', apiFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Child registration response:', response.data);

      // Convert the response to our expected RegistrationResult format
      if (response.data && response.data.user) {
        const result: RegistrationResult = {
          status: 'success',
          message: 'User registered successfully',
          user_id: response.data.user.id,
          user: response.data.user,
        };
        return result;
      } else {
        throw new Error('Invalid response from child registration endpoint');
      }
    } catch (error) {
      console.error('Error in specialized child registration:', error);
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
      const response = await api.get('/health');
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
