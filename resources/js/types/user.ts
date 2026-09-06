/**
 * Perfil clínico del paciente con límites personalizados
 * para evaluar glucosa y presión arterial.
 */
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

/**
 * Usuario del sistema con datos de riesgo y último registro procesado.
 */
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

/**
 * Filtros disponibles para el listado de pacientes.
 */
export type PatientsFilters = 'all' | 'high' | 'unstable' | 'noRecord';

/**
 * Estructura de datos de la página de usuarios/pacientes,
 * incluyendo paginación, filtros activos y métricas resumen.
 */
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

/**
 * Distribución de lecturas de glucosa por nivel de riesgo.
 */
export interface GlucoseDistribution {
  stable: number;
  medium: number;
  high: number;
  total: number;
}

/**
 * Distribución de lecturas de presión arterial por estado.
 */
export interface PressureDistribution {
  normal: number;
  alert: number;
  high: number;
  total: number;
}

/**
 * Lectura individual de salud registrada por el paciente.
 * Puede contener glucosa, presión o ambos valores.
 */
export interface Reading {
  id: string;
  glucose: number | null;
  pressure: { systolic: number; diastolic: number } | null;
  timestamp: string;
  type: 'glucose' | 'pressure' | 'both';
  context_id?: number;
}

/**
 * Agrupa la distribución de glucosa y presión para reportes.
 */
export interface DistributionData {
  glucose: GlucoseDistribution;
  pressure: PressureDistribution;
}

export interface HistoryCardProps {
  readings: Reading[];
  onViewAll: () => void;
  patientProfile: PatientProfile | null;
}

/**
 * Punto de datos para el sparkline de glucosa.
 */
export interface GlucosePoint {
  value: number;
  timestamp: string;
}

/**
 * Props del componente de resumen principal de glucosa/presion.
 */
export interface GlucoseKPIProps {
  value: number;
  timestamp: string;
  latestPressure?: { systolic: number; diastolic: number } | null;
  pressureTimestamp?: string | null;
  patientProfile?: PatientProfile | null;
  glucoseHistory?: GlucosePoint[];
}

export interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  readings: Reading[];
}

export interface TrendsScreenProps {
  readings: Reading[];
  patientProfile: PatientProfile | null;
  onBack: () => void;
}