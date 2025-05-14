// API configuration
export const API_URL = 'https://backend-fast-api-ai.fly.dev/api';
export const BASE_API_URL = 'https://backend-fast-api-ai.fly.dev';

// Feature flags
export const ADMIN_FEATURES_ENABLED = true;
export const POLICE_FEATURES_ENABLED = true;
export const DEVICE_DETECTION_ENABLED = true;
export const MOCK_AUTHENTICATION = false;
export const HAS_FACIAL_RECOGNITION = true;

// System configuration
export const TOKEN_EXPIRY_DAYS = 7;
export const PAGE_SIZE = 10;
export const SEARCH_RESULT_LIMIT = 10;

// Cache durations (in milliseconds)
export const CACHE_DURATION = {
  USERS: 5 * 60 * 1000, // 5 minutes
  STATISTICS: 10 * 60 * 1000, // 10 minutes
};

// Directory paths
export const FACE_RECOGNITION_MODELS_PATH = '/models';
export const UPLOAD_DIR = '/uploads';
export const TEMP_DIR = '/tmp';

// Default values
export const DEFAULT_LANGUAGE = 'ar';
export const AVAILABLE_LANGUAGES = ['ar', 'en'];

// Facial recognition parameters
export const FACE_MATCH_THRESHOLD = 0.6;
export const MAX_FACE_CANDIDATES = 5;

// Form constants
export const TELECOM_COMPANIES = ['Vodafone', 'Orange', 'Etisalat', 'WE'];
export const GENDER_OPTIONS = ['male', 'female'];
export const AGE_GROUPS = ['child', 'adult'];
export const DISABILITY_TYPES = [
  'physical',
  'visual',
  'hearing',
  'cognitive',
  'multiple',
];
export const RELATIONSHIP_TYPES = [
  'parent',
  'sibling',
  'child',
  'spouse',
  'relative',
  'friend',
  'caregiver',
  'other',
];

// Role constants
export const USER_ROLES = {
  ADMIN: 'admin',
  POLICE: 'police',
  VOLUNTEER: 'volunteer',
  ANALYST: 'analyst',
  GUEST: 'guest',
};

// UI constants
export const ANIMATION_DURATION = 300;
export const SNACKBAR_DURATION = 5000;
export const TOAST_DURATION = 3000;
export const TOOLTIP_DELAY = 500;
export const MODAL_TRANSITION_DURATION = 200;

// Security
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection and try again.',
  SERVER: 'Server error. Please try again later.',
  AUTHENTICATION: 'Authentication failed. Please check your credentials.',
  PERMISSION: 'You do not have permission to perform this action.',
  VALIDATION: 'Please check the form for errors and try again.',
  NOT_FOUND: 'The requested resource was not found.',
  TIMEOUT: 'Request timed out. Please try again.',
};

// Registration categories
export const PERSON_CATEGORIES = {
  MAN: 'male',
  WOMAN: 'female',
  CHILD: 'child',
  DISABLED: 'disabled',
};

// Other constants
export const IMAGE_UPLOAD_MAX_SIZE = 5 * 1024 * 1024; // 5MB
export const SUPPORTED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/jpg'];
