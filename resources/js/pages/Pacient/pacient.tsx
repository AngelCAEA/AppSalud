import { GlucoseKPI } from '@/pages/Pacient/CardGlucoseKPI';
import { TrendsScreen } from '@/pages/Pacient/TrendsScreen';
import { HistoryCard } from '@/pages/Pacient/HistoryCard';
import { TrendingUp } from 'lucide-react';
import { FAB } from '@/pages/Pacient/FAB';
import { RegisterModal } from '@/pages/Pacient/RegisterModal';
import { HistoryModal } from '@/pages/Pacient/HistoryModal';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Toast } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import { usePacient } from '@/hooks/pacient/usePacient';
import PacientLayout from '@/layouts/pacient-layout';

export default function Pacient() {
    const page = usePage();
    const { toasts, removeToast, showSuccess, showError } = useToast();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [currentView, setCurrentView] = useState<'dashboard' | 'trends'>('dashboard');
    const csrfToken = (page.props as { csrf_token?: string }).csrf_token ?? '';

    const {
        readings,
        patientProfile,
        isLoading,
        profileLoading,
        latestGlucoseReading,
        latestPressureReading,
        handleAddReading,
    } = usePacient({
        csrfToken,
        showSuccess,
        showError,
        onSaved: () => setIsModalOpen(false),
    });

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