export interface PatientProfile {
  id: number;
  user_id: number;
  glucose_min: number;
  glucose_max: number;
  systolic_max: number;
  diastolic_max: number;
  type_diabetes: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role_id: number;
  patient_profile?: PatientProfile;
}