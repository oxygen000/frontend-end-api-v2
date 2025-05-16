export interface User {
  id: string;
  face_id: string;
  name: string;
  employee_id: string | null;
  department: string | null;
  image_path: string;
  created_at: string;
  updated_at: string | null;
  form_type: string;

  // Common fields for all forms
  nickname: string | null;
  dob: string | null;
  national_id: string | null;
  address: string | null;
  phone_number: string | null;
  phone_company: string | null;
  second_phone_number: string | null;
  category: string | null;

  // Adult form fields
  occupation: string | null;
  license_plate: string | null;
  vehicle_model: string | null;
  vehicle_color: string | null;
  chassis_number: string | null;
  vehicle_number: string | null;
  license_expiration: string | null;
  has_criminal_record: number;
  case_details: string | null;
  police_station: string | null;
  case_number: string | null;
  judgment: string | null;
  accusation: string | null;
  travel_date: string | null;
  travel_destination: string | null;
  arrival_airport: string | null;
  arrival_date: string | null;
  flight_number: string | null;
  return_date: string | null;
  manufacture_year: string | null;

  // Child form fields
  date_of_birth: string | null;
  physical_description: string | null;
  last_clothes: string | null;
  area_of_disappearance: string | null;
  last_seen_time: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  guardian_id: string | null;

  // Disabled person form fields
  disability_type: string | null;
  disability_description: string | null;
  medical_condition: string | null;
  special_needs: string | null;
  emergency_contact: string | null;
  emergency_phone: string | null;

  // Additional fields
  additional_data: string | null;
  brand_affiliation: string | null;
  brand_products: string | null;
  brand_position: string | null;
}

export interface SectionColors {
  gradient: string;
  border: string;
  icon: string;
}

export const SECTION_COLORS: Record<string, SectionColors> = {
  child: {
    gradient: 'from-amber-500/20 to-amber-500/10',
    border: 'border-amber-500/30',
    icon: 'text-amber-400',
  },
  disabled: {
    gradient: 'from-purple-500/20 to-purple-500/10',
    border: 'border-purple-500/30',
    icon: 'text-purple-400',
  },
  man: {
    gradient: 'from-blue-500/20 to-blue-500/10',
    border: 'border-blue-500/30',
    icon: 'text-blue-400',
  },
  woman: {
    gradient: 'from-pink-500/20 to-pink-500/10',
    border: 'border-pink-500/30',
    icon: 'text-pink-400',
  },
};

export interface UserDataProps {
  user: User;
  isRTL: boolean;
  isIdentityRevealed: boolean;
  formatDate: (dateString: string | null) => string;
  maskSensitiveInfo: (text: string | null) => string;
  t: (key: string, fallback: string) => string;
}
