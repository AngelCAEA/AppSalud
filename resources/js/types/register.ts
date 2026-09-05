import type { PatientProfile, Reading } from '@/types/user';

/**
 * Tipo de lectura que se envia al backend para crear un registro.
 */
export type ReadingType = 'glucose' | 'blood_pressure';

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
 * Parametros requeridos por el hook de la pantalla de paciente.
 */
export interface UsePacientParams {
  csrfToken: string;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  onSaved?: () => void;
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
 * Parametros del hook responsable del registro de lecturas.
 */
export interface UseRegisterParams {
  csrfToken: string;
  patientProfile: PatientProfile | null;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  onSaved?: () => void;
  onRefreshReadings: () => Promise<void>;
}

/**
 * Contrato de salida del hook de registro.
 */
export interface UseRegisterResult {
  handleAddReading: (
    type: ReadingType,
    glucose: number | null,
    systolic: number | null,
    diastolic: number | null,
    contextId?: number,
  ) => Promise<void>;
}

/**
 * Contexto de medicion disponible para registrar glucosa o presion.
 */
export interface MeasurementContext {
  id: number;
  slug: string;
  display_name: string;
  description: string;
}

/**
 * Etapas del flujo visual del modal de registro.
 */
export type RegistrationStep = 'select' | 'glucose' | 'pressure';

/**
 * Firma comun del callback para guardar una medicion desde el modal.
 */
export type RegisterSubmitHandler = (
  type: ReadingType,
  glucose: number | null,
  systolic: number | null,
  diastolic: number | null,
  contextId?: number,
) => Promise<void>;

/**
 * Propiedades del modal de registro de mediciones.
 */
export interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: RegisterSubmitHandler;
}

/**
 * Parametros del hook que encapsula la logica de RegisterModal.
 */
export interface UseRegisterModalParams {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: RegisterSubmitHandler;
}

/**
 * Contrato de salida del hook de RegisterModal.
 */
export interface UseRegisterModalResult {
  step: RegistrationStep;
  glucose: string;
  selectedContextId: number | null;
  systolic: string;
  diastolic: string;
  measurementContexts: MeasurementContext[];
  isLoading: boolean;
  setStep: (step: RegistrationStep) => void;
  setGlucose: (value: string) => void;
  setSelectedContextId: (value: number | null) => void;
  setSystolic: (value: string) => void;
  setDiastolic: (value: string) => void;
  handleClose: () => void;
  handleBack: () => void;
  handleGlucoseSubmit: () => Promise<void>;
  handlePressureSubmit: () => Promise<void>;
}

/**
 * Propiedades de boton para seleccionar contexto de medicion.
 */
export interface ContextButtonProps {
  context: MeasurementContext;
  isSelected: boolean;
  onSelect: () => void;
  color: 'green' | 'red';
}
