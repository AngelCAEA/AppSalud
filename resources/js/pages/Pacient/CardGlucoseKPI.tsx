import { TrendingUp } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

// ── Tipos ──────────────────────────────────────────────────────────────────────

/** Un punto de datos para el sparkline de glucosa */
interface GlucosePoint {
  /** Valor de glucosa en mg/dL */
  value: number;
  /** ISO timestamp del registro */
  timestamp: string;
}

interface GlucoseKPIProps {
  /** Último valor de glucosa registrado (mg/dL) */
  value: number;
  /** ISO timestamp del registro */
  timestamp: string;
  /** Presión arterial más reciente del paciente (opcional) */
  latestPressure?: { systolic: number; diastolic: number } | null;
  /** Timestamp del registro de presión (opcional) */
  pressureTimestamp?: string | null;
  /** Perfil del paciente con límites personalizados */
  patientProfile?: {
    glucose_min: number;
    glucose_max: number;
    systolic_max: number;
    diastolic_max: number;
  } | null;
  /**
   * Últimos registros de glucosa para el sparkline (máx. recomendado: 8).
   * Deben llegar en cualquier orden; el componente los ordena cronológicamente.
   * Si no se proveen o hay menos de 2 puntos, el sparkline no se renderiza.
   */
  glucoseHistory?: GlucosePoint[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const TIME_ZONE = 'America/Mexico_City';

/**
 * Devuelve las clases de color del valor de glucosa según rangos clínicos.
 * Si existe perfil del paciente, usa sus límites personalizados.
 */
function getGlucoseColor(
  glucose: number,
  profile?: GlucoseKPIProps['patientProfile'],
): string {
  const min = profile?.glucose_min ?? 90;
  const max = profile?.glucose_max ?? 140;
  if (glucose < 70 || glucose > 180) return 'text-red-500';
  if (glucose < min || glucose > max) return 'text-amber-500';
  return 'text-emerald-500';
}

/**
 * Devuelve la etiqueta de estado según el valor de glucosa.
 */
function getGlucoseStatus(
  glucose: number,
  profile?: GlucoseKPIProps['patientProfile'],
): string {
  const min = profile?.glucose_min ?? 90;
  const max = profile?.glucose_max ?? 140;
  if (glucose < 70) return 'Baja';
  if (glucose > 180) return 'Alta';
  if (glucose < min || glucose > max) return 'Atención';
  return 'Óptima';
}

/**
 * Devuelve la etiqueta de estado de la presión arterial según límites del perfil.
 */
function getPressureStatus(
  systolic: number,
  diastolic: number,
  profile?: GlucoseKPIProps['patientProfile'],
): string {
  const maxS = profile?.systolic_max ?? 130;
  const maxD = profile?.diastolic_max ?? 85;
  if (systolic > maxS || diastolic > maxD) return 'Elevada';
  return 'Normal';
}

/**
 * Calcula el tiempo transcurrido desde un timestamp hasta ahora
 * y devuelve una etiqueta legible para la sección de variación.
 *
 * Ejemplos de salida: "45 min", "2 h", "1 d 3 h", "3 d"
 */
function timeSinceReading(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const totalMinutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;

  if (days > 0) return remHours > 0 ? `${days} d ${remHours} h` : `${days} d`;
  if (hours > 0) return minutes > 0 ? `${hours} h ${minutes} min` : `${hours} h`;
  return `${Math.max(1, minutes)} min`;
}

/**
 * Sparkline de glucosa — gráfica de línea minimalista sin ejes ni tooltips.
 *
 * - Ordena los puntos cronológicamente (más antiguo → más reciente).
 * - El color de la línea refleja el estado actual de glucosa:
 *   verde (óptima), ámbar (atención) o rojo (fuera de rango).
 * - Se oculta si hay menos de 2 puntos (sin suficiente historial).
 *
 * @param points  Array de {value, timestamp} con el historial de glucosa.
 * @param color   Color hex de la línea, derivado del estado actual.
 */
function GlucoseSparkline({
  points,
  color,
}: {
  points: GlucosePoint[];
  color: string;
}) {
  // Necesitamos al menos 2 puntos para dibujar una línea
  if (points.length < 2) return null;

  // Ordenar de más antiguo a más reciente para que la línea fluya correctamente
  const sorted = [...points]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map((p) => ({ v: Math.round(p.value) }));

  return (
    <div className="w-20 h-10">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={sorted} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={2}
            dot={false}          /* Sin puntos en cada dato */
            isAnimationActive    /* Animación suave al montar */
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Formatea un timestamp mostrando solo la hora si es hoy,
 * o fecha + hora si es un día diferente.
 */
function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const isToday =
    date.toLocaleDateString('en-CA', { timeZone: TIME_ZONE }) ===
    now.toLocaleDateString('en-CA', { timeZone: TIME_ZONE });

  const time = date.toLocaleTimeString('es-MX', {
    timeZone: TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  if (isToday) return `Hoy, ${time}`;
  const day = date.toLocaleDateString('es-MX', {
    timeZone: TIME_ZONE,
    day: '2-digit',
    month: 'short',
  });
  return `${day} ${time}`;
}

// ── Componente ────────────────────────────────────────────────────────────────

/**
 * Card de resumen de salud del paciente.
 *
 * Muestra en una sola tarjeta:
 * - Valor principal de glucosa con estado y mini-gráfico indicativo
 * - Sección de presión arterial con estado (si está disponible)
 *
 * El diseño replica el mockup con etiqueta "RESUMEN DE SALUD",
 * valor grande de glucosa a la izquierda y badges de estado a la derecha.
 */
export function GlucoseKPI({
  value,
  timestamp,
  latestPressure,
  pressureTimestamp,
  patientProfile,
  glucoseHistory = [],
}: GlucoseKPIProps) {
  const rounded = Math.round(value);
  const glucoseColor = getGlucoseColor(rounded, patientProfile);
  const glucoseStatus = getGlucoseStatus(rounded, patientProfile);

  const pressureStatus = latestPressure
    ? getPressureStatus(latestPressure.systolic, latestPressure.diastolic, patientProfile)
    : null;

  /**
   * Color hex de la línea del sparkline, sincronizado con el estado de glucosa.
   * Se usa como prop de recharts (que no acepta clases Tailwind directamente).
   */
  const sparklineColor =
    glucoseStatus === 'Óptima' ? '#10b981' :
    glucoseStatus === 'Atención' ? '#f59e0b' : '#ef4444';

  /** Color del badge de estado de glucosa */
  const statusBadgeClass =
    glucoseStatus === 'Óptima'
      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400'
      : glucoseStatus === 'Atención'
      ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400'
      : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400';

  /** Color del badge de presión */
  const pressureBadgeClass =
    pressureStatus === 'Normal'
      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400'
      : 'bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-400';

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">

      {/* ── Encabezado ── */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
          Resumen de Salud
        </span>
        <span className="text-xs text-gray-400">{formatTimestamp(timestamp)}</span>
      </div>

      {/* ── Glucosa ── */}
      <div className="flex items-end justify-between mb-1">
        {/* Valor principal */}
        <div>
          <div
            className={`text-7xl font-bold leading-none ${glucoseColor}`}
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {rounded}
          </div>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
            <span className="font-medium">mg/dL</span>
            <span>·</span>
            <span>Glucosa</span>
          </div>
        </div>

        {/* Badges + mini icono de variación */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusBadgeClass}`}>
              {glucoseStatus}
            </span>
            {pressureStatus && (
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${pressureBadgeClass}`}>
                {pressureStatus}
              </span>
            )}
          </div>
          {/* Indicador visual de variación — tiempo real desde el último registro */}
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Variación ({timeSinceReading(timestamp)})</span>
          </div>

          {/* Sparkline de los últimos registros de glucosa.
              Solo se renderiza si hay ≥2 puntos de historial. */}
          <GlucoseSparkline points={glucoseHistory} color={sparklineColor} />
        </div>
      </div>

      {/* ── Separador ── */}
      {latestPressure && (
        <>
          <div className="border-t border-gray-100 dark:border-gray-800 my-4" />

          {/* ── Presión Arterial ── */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">
                Presión Arterial
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {latestPressure.systolic}/{latestPressure.diastolic}
                </span>
                <span className="text-sm text-gray-400">mmHg</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              {pressureStatus && (
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${pressureBadgeClass}`}>
                  {pressureStatus}
                </span>
              )}
              {pressureTimestamp && (
                <span className="text-xs text-gray-400">
                  {formatTimestamp(pressureTimestamp)}
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}