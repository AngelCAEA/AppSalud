import { TrendingUp } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { formatTimestamp, getGlucoseStatus, getPressureStatus, timeSinceReading } from '@/utils/helpers';
import type { GlucoseKPIProps, GlucosePoint } from '@/types/user';
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
  const glucoseInfo = getGlucoseStatus(rounded, patientProfile ?? null);
  const glucoseColor = glucoseInfo.color;
  const glucoseStatus = glucoseInfo.label === 'Alta' && rounded < 70 ? 'Baja' : glucoseInfo.label;

  const pressureInfo = latestPressure
    ? getPressureStatus(latestPressure.systolic, latestPressure.diastolic, patientProfile ?? null)
    : null;
  const pressureStatus = pressureInfo?.label ?? null;

  /**
   * Color hex de la línea del sparkline, sincronizado con el estado de glucosa.
   * Se usa como prop de recharts (que no acepta clases Tailwind directamente).
   */
  const sparklineColor =
    glucoseColor === 'text-emerald-500' ? '#10b981' :
    glucoseColor === 'text-amber-500' ? '#f59e0b' : '#ef4444';

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