import { GlucoseKPI } from '@/pages/Pacient/CardGlucoseKPI';
import { TrendsScreen } from '@/pages/Pacient/TrendsScreen';
import { HistoryCard } from '@/pages/Pacient/HistoryCard';
import { Activity, TrendingUp } from 'lucide-react';
import { FAB } from '@/pages/Pacient/FAB';
import { RegisterModal } from '@/pages/Pacient/RegisterModal';
import { HistoryModal } from '@/pages/Pacient/HistoryModal';
import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { UserMenu } from '@/pages/Pacient/UserMenu';
import { Toast } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import { type SharedData } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { pacient } from '@/routes';
import { Card, CardContent } from '@/components/ui/card';

const breadcrumbs = [
  { title: 'Paciente', 
    href: pacient().url },
];

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
     * Cargar registros reales de la API cuando el componente se monta
     * Este efecto obtiene todos los registros de salud del usuario autenticado
     */
    useEffect(() => {
        const loadReadings = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/health-records');
                
                if (!response.ok) {
                    throw new Error('Error al cargar los registros');
                }

                const data = await response.json();
                
                // Mapear datos de la API al tipo Reading
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
                console.log('Registros cargados:', mappedReadings);
            } catch (error) {
                console.error('Error cargando registros:', error);
                // Mostrar mensaje de error silenciosamente sin interrumpir la UX
            } finally {
                setIsLoading(false);
            }
        };

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
              showError(`⚠️ Glucosa baja: ${glucoseValue} mg/dL (mínimo recomendado: ${patientProfile!.glucose_min})`);
            } else if (glucoseValue > patientProfile!.glucose_max) {
              showError(`⚠️ Glucosa alta: ${glucoseValue} mg/dL (máximo recomendado: ${patientProfile!.glucose_max})`);
            }
          }

          // Validar presión sistólica
          if (systolicValue !== null) {
            if (systolicValue > patientProfile!.systolic_max) {
              showError(`⚠️ Presión sistólica elevada: ${systolicValue} mmHg (máximo recomendado: ${patientProfile!.systolic_max})`);
            }
          }

          // Validar presión diastólica
          if (diastolicValue !== null) {
            if (diastolicValue > patientProfile!.diastolic_max) {
              showError(`⚠️ Presión diastólica elevada: ${diastolicValue} mmHg (máximo recomendado: ${patientProfile!.diastolic_max})`);
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
          const response = await fetch('/health-records', {
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

          // Crear objeto de lectura para el estado local
          // Esto nos permite mostrar el registro inmediatamente sin recargar
          const newReading: Reading = {
            id: data.data.id.toString(),
            glucose: glucoseValue,
            pressure: systolicValue && diastolicValue ? { systolic: systolicValue, diastolic: diastolicValue } : null,
            type: type === 'glucose' ? 'glucose' : 'pressure',
            timestamp: data.data.created_at || data.data.recorded_at || new Date().toISOString(),
            context_id: contextId,
          };

          // Actualizar lista de registros: agregar el nuevo al inicio
          setReadings([newReading, ...readings]);
          
          // Cerrar modal de registro
          setIsModalOpen(false);

          // Mostrar mensaje de éxito si la respuesta fue satisfactoria
          if (data.success) {
            showSuccess('Registro guardado exitosamente');
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
        <AppLayout breadcrumbs={breadcrumbs}>
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

            {/* Main Content */}
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* KPI Central de Glucosa */}
                {isLoading || profileLoading ? (
                    <Card className="rounded-xl border-2 dark:bg-gray-800">
                        <CardContent className="p-6">
                            <div className="animate-pulse text-gray-600 dark:text-gray-300">Cargando registros...</div>
                        </CardContent>
                    </Card>
                ) : latestGlucoseReading ? (
                    <GlucoseKPI value={latestGlucoseReading.glucose!} timestamp={latestGlucoseReading.timestamp} />
                ) : (
                    <Card className="rounded-xl border-2 dark:border-blue-200 dark:bg-gray-800">
                        <CardContent className="py-6">
                            <div className="text-blue-200 dark:text-blue-400">No hay registros de glucosa aún</div>
                            <div className="text-sm text-blue-200 dark:text-blue-400 mt-2">Registra tu primera medición presionando el botón de + abajo</div>
                        </CardContent>
                    </Card>
                )}
                {/* Botón de Tendencias */}
                <button
                    onClick={() => setCurrentView('trends')}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all active:scale-98 flex items-center justify-between cursor-pointer"
                    >
                    <div className="flex items-center gap-3">
                        <TrendingUp className="w-6 h-6" />
                        <div className="text-left">
                        <div className="text-lg">Ver Tendencias</div>
                        <div className="text-sm opacity-90">Gráficos de los últimos 30 días</div>
                        </div>
                    </div>
                    <div className="text-2xl">→</div>
                </button>

                {/* Presión Arterial */}
                {latestPressureReading && latestPressureReading.pressure && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6">
                    <div className="flex items-center justify-between mb-3">
                    <h2 className="text-black dark:text-white">Presión Arterial</h2>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                        {(() => {
                            const date = new Date(latestPressureReading.timestamp);
                            const now = new Date();
                            const timeZone = 'America/Mexico_City';
                            const isDifferentDay = date.toLocaleDateString('en-CA', { timeZone }) !== now.toLocaleDateString('en-CA', { timeZone });
                            const time = date.toLocaleTimeString('es-MX', { timeZone, hour: '2-digit', minute: '2-digit', hour12: true });
                            if (isDifferentDay) {
                                return date.toLocaleDateString('es-MX', { timeZone, day: '2-digit', month: 'short' }) + ' ' + time;
                            }
                            return time;
                        })()}
                    </span>
                    </div>
                    <div className="flex items-center gap-2">
                    <div className="text-3xl text-black dark:text-white">
                        {latestPressureReading.pressure.systolic}/{latestPressureReading.pressure.diastolic}
                    </div>
                    <div className="text-gray-500">mmHg</div>
                    </div>
                    <div className="mt-2">
                    {patientProfile && latestPressureReading.pressure.systolic <= patientProfile.systolic_max && latestPressureReading.pressure.diastolic <= patientProfile.diastolic_max ? (
                        <span className="text-sm text-green-600">✓ Normal</span>
                    ) : (
                        <span className="text-sm text-orange-600">⚠ Elevada</span>
                    )}
                    </div>
                </div>
                )}

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

        </AppLayout>
    );
}