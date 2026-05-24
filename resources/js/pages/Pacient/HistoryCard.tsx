import { CheckCircle2, ChevronRight } from 'lucide-react';

// ── Tipos ──────────────────────────────────────────────────────────────────────

interface Reading {
  id: string;
  glucose: number | null;
  pressure: { systolic: number; diastolic: number } | null;
  timestamp: string;
  type: 'glucose' | 'pressure' | 'both';
}

interface PatientProfile {
  glucose_min: number;
  glucose_max: number;
  systolic_max: number;
  diastolic_max: number;
  type_diabetes: string | null;
}

interface HistoryCardProps {
  readings: Reading[];
  onViewAll: () => void;
  patientProfile: PatientProfile | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const TIME_ZONE = 'America/Mexico_City';

/**
 * Formatea la fecha de un timestamp en texto relativo (Hoy / Ayer / fecha).
 * Incluye la hora en formato 24h.
 */
function formatReadingDate(iso: string): { label: string; time: string } {
  const d = new Date(iso);
  const now = new Date();
  const todayStr = now.toLocaleDateString('en-CA', { timeZone: TIME_ZONE });
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toLocaleDateString('en-CA', { timeZone: TIME_ZONE });
  const dateStr = d.toLocaleDateString('en-CA', { timeZone: TIME_ZONE });

  let label: string;
  if (dateStr === todayStr) label = 'Hoy';
  else if (dateStr === yesterdayStr) label = 'Ayer';
  else
    label = d.toLocaleDateString('es-MX', {
      timeZone: TIME_ZONE,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  const time = d.toLocaleTimeString('es-MX', {
    timeZone: TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return { label, time };
}

/**
 * Devuelve la etiqueta de estado de glucosa según rangos del perfil del paciente.
 */
function getGlucoseStatus(
  glucose: number,
  profile: PatientProfile | null,
): { label: string; color: string } {
  const value = Math.round(glucose);
  const min = profile?.glucose_min ?? 90;
  const max = profile?.glucose_max ?? 140;

  if (value < 70 || value > 180) return { label: 'Alta', color: 'text-red-500' };
  if (value < min || value > max) return { label: 'Atención', color: 'text-amber-500' };
  return { label: 'Óptima', color: 'text-emerald-500' };
}

/**
 * Devuelve la etiqueta de estado de presión arterial según límites del perfil.
 */
function getPressureStatus(
  systolic: number,
  diastolic: number,
  profile: PatientProfile | null,
): { label: string; color: string } {
  const maxS = profile?.systolic_max ?? 130;
  const maxD = profile?.diastolic_max ?? 85;
  if (systolic > maxS || diastolic > maxD)
    return { label: 'Elevada', color: 'text-orange-500' };
  return { label: 'Normal', color: 'text-emerald-500' };
}

// ── Componente ────────────────────────────────────────────────────────────────

/**
 * Tarjeta de historial de mediciones recientes del paciente.
 *
 * Cada fila muestra:
 * - Icono de estado (checkmark verde)
 * - Tipo de medición (Glucosa / Presión Arterial) + badge de estado
 * - Fecha y hora relativa
 * - Valor numérico a la derecha
 *
 * Incluye encabezado "Historial de Mediciones Recientes" con botón "Ver Todo".
 */
export function HistoryCard({ readings, onViewAll, patientProfile }: HistoryCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">

      {/* ── Encabezado ── */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <span className="text-sm font-semibold text-gray-800 dark:text-white">
          Historial de Mediciones Recientes
        </span>
        <button
          onClick={onViewAll}
          className="flex items-center gap-0.5 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors cursor-pointer"
        >
          Ver Todo
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* ── Filas de registros ── */}
      <div className="divide-y divide-gray-50 dark:divide-gray-800">
        {readings.length === 0 ? (
          <p className="px-5 py-4 text-sm text-gray-400">Sin registros recientes</p>
        ) : (
          readings.map((reading) => {
            const { label: dateLabel, time } = formatReadingDate(reading.timestamp);

            /* Determina tipo de medición para la etiqueta y el valor */
            const isGlucose = reading.glucose !== null;
            const isPressure = reading.pressure !== null;

            const glucoseInfo = isGlucose
              ? getGlucoseStatus(reading.glucose!, patientProfile)
              : null;
            const pressureInfo =
              isPressure && reading.pressure
                ? getPressureStatus(
                    reading.pressure.systolic,
                    reading.pressure.diastolic,
                    patientProfile,
                  )
                : null;

            return (
              <div key={reading.id} className="flex items-center gap-3 px-5 py-3.5">
                {/* Icono de estado */}
                <div className="shrink-0">
                  <CheckCircle2
                    className={`w-8 h-8 ${
                      (glucoseInfo?.label === 'Óptima' || pressureInfo?.label === 'Normal')
                        ? 'text-emerald-500'
                        : (glucoseInfo?.label === 'Atención' || pressureInfo?.label === 'Elevada')
                        ? 'text-amber-400'
                        : 'text-red-500'
                    }`}
                  />
                </div>

                {/* Tipo + estado + fecha */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {isGlucose && (
                      <span className="text-sm font-medium text-gray-800 dark:text-white">
                        Glucosa
                      </span>
                    )}
                    {isPressure && !isGlucose && (
                      <span className="text-sm font-medium text-gray-800 dark:text-white">
                        Presión Arterial
                      </span>
                    )}
                    {isGlucose && glucoseInfo && (
                      <span className={`text-xs font-medium ${glucoseInfo.color}`}>
                        {glucoseInfo.label}
                      </span>
                    )}
                    {isPressure && !isGlucose && pressureInfo && (
                      <span className={`text-xs font-medium ${pressureInfo.color}`}>
                        {pressureInfo.label}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {dateLabel}, {time}
                  </p>
                </div>

                {/* Valor numérico */}
                <div className="text-right shrink-0">
                  {isGlucose && (
                    <span className="text-base font-bold text-gray-900 dark:text-white">
                      {Math.round(reading.glucose!)}{' '}
                      <span className="text-xs font-normal text-gray-400">mg/dL</span>
                    </span>
                  )}
                  {isPressure && !isGlucose && reading.pressure && (
                    <span className="text-base font-bold text-gray-900 dark:text-white">
                      {reading.pressure.systolic}/{reading.pressure.diastolic}{' '}
                      <span className="text-xs font-normal text-gray-400">mmHg</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}