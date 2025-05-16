import type { User } from './types';

// Format date function
export const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Calculate age function
export const calculateAge = (dateString: string, yearsOldText: string) => {
  const birthDate = new Date(dateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age + ' ' + yearsOldText;
};

// Function to mask sensitive information
export const maskSensitiveInfo = (
  text: string | null,
  isIdentityRevealed: boolean
) => {
  if (!text) return 'N/A';
  if (!isIdentityRevealed) {
    return '••••••••';
  }
  return text;
};

// Function to get image URL
export const getImageUrl = (
  imagePath: string | null | undefined,
  userName: string
) => {
  if (!imagePath) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`;
  }

  // Check if image_path already contains the full URL
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // If image_path doesn't contain 'uploads/' prefix, add it
  const formattedPath = imagePath.includes('uploads/')
    ? imagePath
    : `uploads/${imagePath}`;

  // Ensure we don't have double slashes in the URL
  return `https://backend-fast-api-ai.fly.dev/${formattedPath.replace(/^\/?/, '')}`;
};

// Check if user has vehicle information
export const hasVehicleInfo = (user: User) =>
  user.vehicle_model ||
  user.license_plate ||
  user.vehicle_color ||
  user.chassis_number ||
  user.vehicle_number ||
  user.license_expiration ||
  user.manufacture_year;

// Check if user has case information
export const hasCaseInfo = (user: User) =>
  user.has_criminal_record === 1 ||
  user.case_details ||
  user.police_station ||
  user.case_number ||
  user.judgment ||
  user.accusation;

// Check if user has travel information
export const hasTravelInfo = (user: User) =>
  user.travel_date ||
  user.travel_destination ||
  user.arrival_airport ||
  user.arrival_date ||
  user.flight_number ||
  user.return_date;
