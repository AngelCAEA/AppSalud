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
  status: boolean;
  patient_profile?: PatientProfile;
  riskLevel: string;
  tirPercentage: number;
  lastRecord: { value: string | null; date: string | null } | null;
}

export type PatientsFilters = 'all' | 'high' | 'unstable' | 'noRecord';

export interface UsersPage {
  users: {
    data: User[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
  };
  filters: {
    search?: string;
    filter?: PatientsFilters;
  };
  totalPatients: number;
  highRisk: number;
  noRecords: number;
}