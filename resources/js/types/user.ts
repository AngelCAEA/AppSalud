export interface PatientProfile {
  id: number;
  user_id: number;
  glucose_target_min: number;
  glucose_target_max: number;
  blood_pressure_systolic_target: number;
  blood_pressure_diastolic_target: number;
  created_at: string;
  updated_at: string;
  type_diabetes: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role_id: number;
  patientProfile?: PatientProfile;
}