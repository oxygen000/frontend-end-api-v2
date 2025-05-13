export type TelecomCompany = 'Orange' | 'Etisalat' | 'Vodafone' | 'WE' | '';

export interface BaseFormData {
  name: string;
  dob: string;
  gender: string;
  national_id: string;
  address: string;
  phone_number: string;
  phone_company: TelecomCompany;
  second_phone_number?: string;
  form_type: string;
}

export interface FormError {
  field: string;
  message: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  user_id?: string;
}

export interface FormSection {
  title: string;
  fields: string[];
  required: string[];
}
