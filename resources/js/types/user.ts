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
 * Tipo de lectura que se envia al backend para crear un registro.
 */
export type ReadingType = 'glucose' | 'blood_pressure';

/**
 * Parametros requeridos por el hook de la pantalla de paciente.
 */
export interface UsePacientParams {
  csrfToken: string;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  onSaved?: () => void;
}

/**
 * Forma de un registro de salud tal como llega desde la API.
 */
export interface ApiHealthRecord {
  id: number;
  glucose_value: number | null;
  systolic: number | null;
  diastolic: number | null;
  type: 'glucose' | 'blood_pressure' | 'both';
  recorded_at: string | null;
  created_at: string;
  context_id: number | null;
}

/**
 * Respuesta esperada del endpoint del perfil del paciente.
 */
export interface PatientProfileResponse {
  data: PatientProfile;
}

/**
 * Contrato de salida del hook usePacient.
 */
export interface UsePacientResult {
  readings: Reading[];
  patientProfile: PatientProfile | null;
  isLoading: boolean;
  profileLoading: boolean;
  latestGlucoseReading: Reading | undefined;
  latestPressureReading: Reading | undefined;
  loadReadings: (showLoading?: boolean) => Promise<void>;
  handleAddReading: (
    type: ReadingType,
    glucose: number | null,
    systolic: number | null,
    diastolic: number | null,
    contextId?: number,
  ) => Promise<void>;
}

/**
 * Agrupa la distribución de glucosa y presión para reportes.
 */
export interface DistributionData {
  glucose: GlucoseDistribution;
  pressure: PressureDistribution;
}
