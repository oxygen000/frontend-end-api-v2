// API configuration
export const BASE_API_URL = import.meta.env.VITE_API_BASE_URL || 'https://backend-fast-api-ai.fly.dev';

// Registration categories
export const PERSON_CATEGORIES = {
  MAN: 'male',
  WOMAN: 'female',
  CHILD: 'child',
  DISABLED: 'disabled'
};

// Other constants
export const IMAGE_UPLOAD_MAX_SIZE = 5 * 1024 * 1024; // 5MB
export const SUPPORTED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/jpg'];

