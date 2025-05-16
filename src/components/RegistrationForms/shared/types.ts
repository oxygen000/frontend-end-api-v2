import type { TelecomCompany } from '../../../config/types';

// Base interface with common properties
export interface BaseFormData {
  name: string;
  dob: string;
  gender: string;
  national_id: string;
  address: string;
  phone_number?: string;
  phone_company: TelecomCompany;
  medical_condition: string;
  additional_notes: string;
  form_type: string;
  image: File | null;
  useCamera: boolean;
}

// Child form data interface
export interface ChildFormData extends BaseFormData {
  // Guardian information
  guardian_name: string;
  guardian_phone: string;
  relationship: string;

  // Disappearance details
  last_seen_time: string;
  last_seen_location: string;
  last_seen_clothes: string;
  physical_description: string;
  additional_data: string;
}

// Disabled person form data interface
export interface DisabledFormData extends BaseFormData {
  // Contact information
  second_phone_number: string;

  // Disability information
  disability_type: string;
  disability_description: string;
  special_needs: string;
  emergency_contact: string;
  emergency_phone: string;

  // Guardian information
  guardian_name: string;
  guardian_phone: string;
  relationship: string;
}

// Man form data interface
export interface ManFormData {
  // Personal information
  name: string;
  nickname: string;
  dob: string;
  national_id: string;
  address: string;
  job: string;

  // Contact information
  phone_number: string;
  phone_company: TelecomCompany;
  second_phone_number?: string;

  // Form type
  category: string;
  form_type: string;

  // Criminal record
  has_criminal_record: boolean;
  case_details: string;
  police_station: string;
  case_number: string;
  judgment: string;
  accusation: string;

  // Vehicle info
  has_motorcycle: boolean;
  license_plate: string;
  vehicle_model: string;
  vehicle_color: string;
  chassis_number: string;
  vehicle_number: string;
  license_expiration: string;
  manufacture_year: string;

  // Travel info
  travel_date: string;
  travel_destination: string;
  arrival_airport: string;
  arrival_date: string;
  flight_number: string;
  return_date: string;

  // Image handling
  image: File | null;
  useCamera: boolean;
}

// Woman form data interface
export interface WomanFormData {
  // Personal information
  name: string;
  nickname: string;
  dob: string;
  national_id: string;
  address: string;
  job: string;

  // Contact information
  phone_number: string;
  phone_company: TelecomCompany;
  second_phone_number?: string;

  // Form type
  category: string;
  form_type: string;

  // Criminal record
  has_criminal_record: boolean;
  case_details: string;
  police_station: string;
  case_number: string;
  judgment: string;
  accusation: string;

  // Vehicle info
  has_motorcycle: boolean;
  license_plate: string;
  vehicle_model: string;
  vehicle_color: string;
  chassis_number: string;
  vehicle_number: string;
  license_expiration: string;

  // Travel info
  travel_date: string;
  travel_destination: string;
  arrival_airport: string;
  arrival_date: string;
  flight_number: string;
  return_date: string;

  // Image handling
  image: File | null;
  useCamera: boolean;
}

// Interface with face_id property
export interface UserWithFaceId {
  id: string;
  name: string;
  face_id?: string;
  image_path?: string;
  created_at?: string;
  form_type?: string;
  [key: string]: unknown;
}
