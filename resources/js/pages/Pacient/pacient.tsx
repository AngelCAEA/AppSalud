import { GlucoseKPI } from '@/pages/Pacient/CardGlucoseKPI';
import { TrendsScreen } from '@/pages/Pacient/TrendsScreen';
import { HistoryCard } from '@/pages/Pacient/HistoryCard';
import { TrendingUp } from 'lucide-react';
import { FAB } from '@/pages/Pacient/FAB';
import { RegisterModal } from '@/pages/Pacient/RegisterModal';
import { HistoryModal } from '@/pages/Pacient/HistoryModal';
import { Head, usePage, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useState, useEffect } from 'react';
import { Toast } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import { type SharedData } from '@/types';
import PacientLayout from '@/layouts/pacient-layout';

interface Reading {
  id: string;
  glucose: number | null;
  pressure: { systolic: number; diastolic: number } | null;
  timestamp: string;
  type: 'glucose' | 'pressure' | 'both';
  context_id?: number;
}

/**
 * Interfaz para los límites de salud del paciente
 * Define los rangos permitidos de glucosa y presión arterial
 */
interface PatientProfile {
  glucose_min: number;
  glucose_max: number;
  systolic_max: number;
  diastolic_max: number;
  type_diabetes: string | null;
}

export default function Pacient() {
    const page = usePage();
    const { toasts, removeToast, showSuccess, showError } = useToast();
   
    /**
     * Estado para almacenar los registros de salud del paciente
     * Se inicializa como array vacío y se carga desde la API en useEffect
     */
    const [readings, setReadings] = useState<Reading[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [currentView, setCurrentView] = useState<'dashboard' | 'trends'>('dashboard');
    const [isLoading, setIsLoading] = useState(true);
    /**
     * Estado para almacenar el perfil de salud del paciente
     * Contiene los límites personalizados de glucosa y presión
     */
    const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);

    /**
     * Cargar el perfil del paciente autenticado
     * Si no existe un perfil, redirige a la página de welcome
     */
    useEffect(() => {
        const loadPatientProfile = async () => {
            try {
                setProfileLoading(true);
                const response = await fetch('/patient-profile/current');
                
                if (!response.ok) {
                    // Si no encontramos perfil (404), mostramos error
                    if (response.status === 404) {
                        showError('No tienes un perfil de paciente configurado. Por favor contacta con tu médico.');
                        // Redirigir a welcome después de un tiempo
                        setTimeout(() => {
                            window.location.href = '/';
                        }, 2000);
                        return;
                    }
                    throw new Error('Error al cargar el perfil');
                }

                const data = await response.json();
                setPatientProfile(data.data);
            } catch (error) {
                console.error('Error cargando perfil del paciente:', error);
                showError('Error al cargar tu perfil de salud');
            } finally {
                setProfileLoading(false);
            }
        };

        loadPatientProfile();
    }, []);

    /**
     * Carga los registros de salud del paciente autenticado desde la API.
     *
     * Ruta utilizada: GET health-records.index  → /health-records
     * Controlador   : HealthRecordsController@index
     * Autenticación : requerida (middleware auth + verified)
     *
     * Flujo:
     * 1. Activa el indicador de carga solo si showLoading=true (carga inicial).
     *    En recargas post-guardado se omite el skeleton para no interrumpir la UX.
     * 2. Solicita todos los registros del usuario al backend via Ziggy route().
     * 3. Mapea la respuesta JSON al tipo interno Reading:
     *    - glucose_value  → glucose
     *    - systolic/diastolic (si ambos presentes) → pressure { systolic, diastolic }
     *    - type 'blood_pressure' normalizado a 'pressure'
     *    - recorded_at con fallback a created_at como timestamp
     * 4. Almacena el array resultante en el estado readings.
     * 5. Desactiva el indicador de carga en el bloque finally.
     *
     * Para añadir nuevos campos en el futuro:
     *  - Agregar el campo al modelo HealthRecord (fillable + migración).
     *  - Extender la interfaz Reading con el nuevo campo.
     *  - Mapear el campo aquí en mappedReadings.
     *
     * @param showLoading - true en carga inicial, false en refresco post-guardado
     */
    const loadReadings = async (showLoading = true) => {
        try {
            if (showLoading) setIsLoading(true);

            // Ziggy resuelve la ruta nombrada a su URL real, manteniendo
            // consistencia con las rutas definidas en web.php / api.php
            const response = await fetch(route('health-records.index'));
            
            if (!response.ok) {
                throw new Error('Error al cargar los registros');
            }

            const data = await response.json();
            
            // Mapear campos de la API al tipo interno Reading.
            // Nota: glucose_value puede ser null si el registro es solo de presión;
            //       systolic/diastolic pueden ser null si el registro es solo glucosa.
            const mappedReadings: Reading[] = data.map((record: any) => ({
                id: record.id.toString(),
                glucose: record.glucose_value || null,
                pressure: record.systolic && record.diastolic 
                    ? { systolic: record.systolic, diastolic: record.diastolic }
                    : null,
                type: record.type === 'glucose' ? 'glucose' : record.type === 'blood_pressure' ? 'pressure' : 'both',
                timestamp: record.recorded_at || record.created_at,
                context_id: record.context_id || undefined,
            }));

            setReadings(mappedReadings);
        } catch (error) {
            console.error('Error cargando registros:', error);
            // Error silencioso: no interrumpir la UX, las cards mostrarán
            // el estado vacío en lugar de un error bloqueante.
        } finally {
            if (showLoading) setIsLoading(false);
        }
    };

    useEffect(() => {
        loadReadings();
    }, []);
    // Get latest glucose reading
    const latestGlucoseReading = readings.find(r => r.glucose !== null);
    // Get latest pressure reading
    const latestPressureReading = readings.find(r => r.pressure !== null);

    /**
     * Maneja la adición de un nuevo registro de salud (glucosa y/o presión arterial)
     * 
     * @param glucose - Valor de glucosa en mg/dL (default: 100)
     * @param systolic - Presión sistólica en mmHg (default: 120)
     * @param diastolic - Presión diastólica en mmHg (default: 80)
     * @param contextId - ID del contexto de la medición (En ayunas, Post-comida, etc.)
     * 
     * La función determina automáticamente el tipo de registro basándose en los valores:
     * - Si presión = 120/80 (default) → es solo glucosa
     * - Si glucosa = 100 (default) → es solo presión arterial
     * - Si ambos tienen valores reales → es ambos
     * 
     * También valida que los valores estén dentro de los rangos permitidos
     * según el perfil de salud del paciente
     */
    const handleAddReading = async (type: 'glucose' | 'blood_pressure', glucose: number | null, systolic: number | null, diastolic: number | null, contextId?: number) => {
        const glucoseValue = glucose;
        const systolicValue = systolic;
        const diastolicValue = diastolic;

        // Validar contra los límites del perfil del paciente si existen
        if (patientProfile) {
          // Validar glucosa
          if (glucoseValue !== null) {
            if (glucoseValue < patientProfile!.glucose_min) {
              showError(`Glucosa baja: ${glucoseValue} mg/dL (mínimo recomendado: ${patientProfile!.glucose_min})`);
            } else if (glucoseValue > patientProfile!.glucose_max) {
              showError(`Glucosa alta: ${glucoseValue} mg/dL (máximo recomendado: ${patientProfile!.glucose_max})`);
            }
          }

          // Validar presión sistólica
          if (systolicValue !== null) {
            if (systolicValue > patientProfile!.systolic_max) {
              showError(`Presión sistólica elevada: ${systolicValue} mmHg (máximo recomendado: ${patientProfile!.systolic_max})`);
            }
          }

          // Validar presión diastólica
          if (diastolicValue !== null) {
            if (diastolicValue > patientProfile!.diastolic_max) {
              showError(`Presión diastólica elevada: ${diastolicValue} mmHg (máximo recomendado: ${patientProfile!.diastolic_max})`);
            }
          }
        }

        try {
          // Obtener token CSRF de las props de Inertia para seguridad
          const csrfToken = (page.props as any).csrf_token || '';
          
          // Construir el payload Solo con los valores que necesitamos
          const payload: any = {
            type,
            context_id: contextId || null,
          };

          // Agregar valores de glucosa si existen
          if (glucoseValue !== null) {
            payload.glucose_value = glucoseValue;
          }
          
          // Agregar valores de presión sistólica si existen
          if (systolicValue !== null) {
            payload.systolic = systolicValue;
          }
          
          // Agregar valores de presión diastólica si existen
          if (diastolicValue !== null) {
            payload.diastolic = diastolicValue;
          }

          // Realizar petición POST al servidor para guardar el registro
          const response = await fetch(route('health-records.store'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'X-CSRF-TOKEN': csrfToken,
            },
            body: JSON.stringify(payload),
          });

          // Validar respuesta del servidor
          if (!response.ok) {
            try {
              const errorData = await response.json();
              showError(errorData.message || 'Error al guardar el registro');
            } catch {
              showError('Error al guardar el registro. Intenta recargar la página.');
            }
            return;
          }

          // Parsear respuesta JSON del servidor
          const data = await response.json();

          // Cerrar modal antes de recargar para evitar estado inconsistente
          setIsModalOpen(false);

          if (data.success) {
            showSuccess('Registro guardado exitosamente');
            // Re-fetcha los registros directamente para actualizar las cards
            // al instante sin necesidad de un reload completo de página.
            await loadReadings(false);
          } else {
            showError('Error al guardar el registro. Por favor intenta de nuevo.');
          }
          
        } catch (error) {
          // Capturar errores de red o del cliente y mostrar mensaje descriptivo
          showError('Hubo un error al guardar el registro, contacta al administrador: ' + (error instanceof Error ? error.message : ''));
        }
  };
     // Show trends screen
    if (currentView === 'trends') {
        return <TrendsScreen readings={readings} patientProfile={patientProfile} onBack={() => setCurrentView('dashboard')} />;
    }
    return (
        <PacientLayout>
            <Head title="Paciente" />

            {/* Toast Container */}
            <div className="fixed bottom-4 left-4 z-50 space-y-2 pointer-events-none">
              {toasts.map(toast => (
                <div key={toast.id} className="pointer-events-auto">
                  <Toast
                    id={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={removeToast}
                  />
                </div>
              ))}
            </div>

            {/* Main Content — ancho máximo fijo centrado para que las cards
                no se expandan al 100% en pantallas grandes */}
            <div className="w-full max-w-lg mx-auto flex flex-col gap-4 p-4">

                {/* ── Resumen de Salud (Glucosa + Presión en una sola card) ─── */}
                {isLoading || profileLoading ? (
                    /* Skeleton de carga */
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 animate-pulse">
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
                        <div className="h-20 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                        <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded" />
                    </div>
                ) : latestGlucoseReading ? (
                    /* Card con glucosa y presión arterial integradas */
                    <GlucoseKPI
                        value={latestGlucoseReading.glucose!}
                        timestamp={latestGlucoseReading.timestamp}
                        latestPressure={latestPressureReading?.pressure ?? null}
                        pressureTimestamp={latestPressureReading?.timestamp ?? null}
                        patientProfile={patientProfile}
                        /* Últimos 8 registros de glucosa para el sparkline,
                           del más reciente al más antiguo (el componente los ordena) */
                        glucoseHistory={readings
                            .filter(r => r.glucose !== null)
                            .slice(0, 8)
                            .map(r => ({ value: r.glucose!, timestamp: r.timestamp }))}
                    />
                ) : (
                    /* Estado vacío: sin registros de glucosa */
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-blue-100 dark:border-gray-800 p-5">
                        <p className="text-sm text-blue-400 dark:text-blue-400">No hay registros de glucosa aún</p>
                        <p className="text-xs text-blue-300 dark:text-blue-500 mt-1">Registra tu primera medición presionando el botón + abajo</p>
                    </div>
                )}
                {/* ── Botón de Tendencias ── */}
                <button
                    onClick={() => setCurrentView('trends')}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-2xl px-5 py-4 shadow-md hover:shadow-lg transition-all flex items-center gap-4 cursor-pointer"
                >
                    {/* Icono en círculo */}
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <div className="text-left flex-1">
                        <div className="font-semibold text-sm">Ver Tendencias y Gráficos Completos</div>
                        <div className="text-xs opacity-80 mt-0.5">Historial detallado de los últimos 30 días</div>
                    </div>
                    <span className="text-lg opacity-75">→</span>
                </button>

                {/* Historial Reciente */}
                <HistoryCard 
                readings={readings.slice(1, 4)} 
                onViewAll={() => setIsHistoryModalOpen(true)}
                patientProfile={patientProfile}
                />

            </div>
            {/* FAB */}
            <FAB onClick={() => setIsModalOpen(true)} />

            {/* Modal de Registro */}
            <RegisterModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddReading}
            />

            {/* Modal de Historial Completo */}
            <HistoryModal
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                readings={readings}
            />

        </PacientLayout>
    );
}