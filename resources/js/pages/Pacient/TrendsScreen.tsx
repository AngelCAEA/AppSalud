/**
 * TrendsScreen — Pantalla de tendencias y análisis médico del paciente.
 *
 * Usa PacientLayout como contenedor base (sin sidebar, header centrado con
 * botón de regreso a la izquierda).
 *
 * Secciones principales:
 * 1. Gráfica de Glucosa (30 días) — con bandas de color por zona de riesgo,
 *    línea de referencia vertical en el pico, y puntos coloreados según estado.
 * 2. Gráfica de Presión Arterial (30 días) — líneas sistólica y diastólica.
 * 3. Cards de estadísticas — promedio glucosa y presión con ícono, valor grande
 *    coloreado, estado calculado sobre los umbrales de patientProfile,
 *    y texto descriptivo secundario.
 *
 * Dependencias: recharts, lucide-react, PacientLayout
 */

import { ArrowLeft, Activity, Heart, Droplet } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import PacientLayout from '@/layouts/pacient-layout';

// ─── Tipos ──────────────────────────────────────────────────────────────────

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

interface TrendsScreenProps {
  readings: Reading[];
  patientProfile: PatientProfile | null;
  onBack: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Umbrales de zona de glucosa utilizados en la gráfica y en las cards.
 * Zona "En Rango" proviene del patientProfile cuando está disponible.
 */
const GLUCOSE_RISK_HIGH  = 165; // mg/dL — umbral riesgo alto
const GLUCOSE_ATTN_HIGH  = 140; // mg/dL — umbral atención alta
const GLUCOSE_ATTN_LOW   = 90;  // mg/dL — umbral atención baja
const GLUCOSE_RISK_LOW   = 60;  // mg/dL — umbral riesgo bajo
const CHART_Y_MAX        = 220;
const CHART_Y_MIN        = 50;

/**
 * Determina el color Tailwind para el valor de glucosa según estado.
 * @param avg   Valor promedio o puntual de glucosa
 * @param prof  PatientProfile (umbrales personalizados)
 */
function glucoseColor(avg: number, prof: PatientProfile | null): string {
  const min = prof?.glucose_min ?? GLUCOSE_ATTN_LOW;
  const max = prof?.glucose_max ?? GLUCOSE_ATTN_HIGH;
  if (avg >= min && avg <= max) return 'text-emerald-600';
  if (avg < GLUCOSE_RISK_LOW || avg > GLUCOSE_RISK_HIGH) return 'text-red-500';
  return 'text-amber-500';
}

/**
 * Etiqueta de estado para la glucosa.
 * @param avg   Valor promedio de glucosa
 * @param prof  PatientProfile
 */
function glucoseStatus(avg: number, prof: PatientProfile | null): { label: string; color: string } {
  const min = prof?.glucose_min ?? GLUCOSE_ATTN_LOW;
  const max = prof?.glucose_max ?? GLUCOSE_ATTN_HIGH;
  if (avg >= min && avg <= max)  return { label: 'Óptimo',   color: 'text-emerald-600' };
  if (avg < GLUCOSE_RISK_LOW || avg > GLUCOSE_RISK_HIGH) return { label: avg > GLUCOSE_RISK_HIGH ? 'Alto' : 'Bajo', color: 'text-red-500' };
  return { label: 'Atención', color: 'text-amber-500' };
}

/**
 * Etiqueta de estado para la presión arterial según patientProfile.
 * Niveles: Normal → Normal Alta → Elevada
 */
function pressureStatus(
  avgSys: number,
  avgDia: number,
  prof: PatientProfile | null,
): { label: string; color: string; recommendation: string } {
  const sysMax = prof?.systolic_max ?? 130;
  const diaMax = prof?.diastolic_max ?? 85;

  if (avgSys <= sysMax && avgDia <= diaMax) {
    return {
      label: 'Normal',
      color: 'text-emerald-600',
      recommendation: 'Mantén tu estilo de vida actual',
    };
  }
  if (avgSys <= sysMax + 10 && avgDia <= diaMax + 5) {
    return {
      label: 'Normal Alta',
      color: 'text-amber-500',
      recommendation: 'Monitorear ingesta de sodio',
    };
  }
  return {
    label: 'Elevada',
    color: 'text-red-500',
    recommendation: 'Consultar con tu médico',
  };
}

// ─── Componente principal ────────────────────────────────────────────────────

export function TrendsScreen({ readings, patientProfile, onBack }: TrendsScreenProps) {
  const timeZone = 'America/Mexico_City';

  // ── Ventana de 30 días ───────────────────────────────────────────────────
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // ── Datos de glucosa ordenados cronológicamente ──────────────────────────
  const glucoseData = readings
    .filter(r => r.glucose !== null && new Date(r.timestamp) >= thirtyDaysAgo)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map(r => ({
      date: new Date(r.timestamp).toLocaleDateString('es-MX', {
        timeZone,
        day: 'numeric',
        month: 'short',
      }),
      glucose: r.glucose,
    }));

  // ── Datos de presión ordenados cronológicamente ──────────────────────────
  const pressureData = readings
    .filter(r => r.pressure !== null && new Date(r.timestamp) >= thirtyDaysAgo)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map(r => ({
      date: new Date(r.timestamp).toLocaleDateString('es-MX', {
        timeZone,
        day: 'numeric',
        month: 'short',
      }),
      systolic: r.pressure!.systolic,
      diastolic: r.pressure!.diastolic,
    }));

  const hasGlucoseData  = glucoseData.length > 0;
  const hasPressureData = pressureData.length > 0;

  // ── Punto pico de glucosa (para la línea de referencia vertical) ─────────
  /** Registro con el valor más alto de glucosa para dibujar la línea de pico */
  const peakGlucose = hasGlucoseData
    ? glucoseData.reduce((mx, d) => (d.glucose ?? 0) > (mx.glucose ?? 0) ? d : mx, glucoseData[0])
    : null;

  // ── Estadísticas de glucosa ──────────────────────────────────────────────
  const glucoseReadings = readings.filter(r => r.glucose !== null && new Date(r.timestamp) >= thirtyDaysAgo);
  const avgGlucose = glucoseReadings.length > 0
    ? Math.round(glucoseReadings.reduce((s, r) => s + Number(r.glucose), 0) / glucoseReadings.length)
    : null;

  /** Porcentaje de lecturas dentro del rango óptimo (patientProfile.glucose_min/max) */
  const glucoseMin = patientProfile?.glucose_min ?? GLUCOSE_ATTN_LOW;
  const glucoseMax = patientProfile?.glucose_max ?? GLUCOSE_ATTN_HIGH;
  const inRangeCount = glucoseReadings.filter(r => Number(r.glucose) >= glucoseMin && Number(r.glucose) <= glucoseMax).length;
  const percentInRange = glucoseReadings.length > 0
    ? Math.round((inRangeCount / glucoseReadings.length) * 100)
    : null;

  // ── Estadísticas de presión ──────────────────────────────────────────────
  const pressureReadings = readings.filter(r => r.pressure !== null && new Date(r.timestamp) >= thirtyDaysAgo);
  const avgSys = pressureReadings.length > 0
    ? Math.round(pressureReadings.reduce((s, r) => s + Number(r.pressure!.systolic), 0) / pressureReadings.length)
    : null;
  const avgDia = pressureReadings.length > 0
    ? Math.round(pressureReadings.reduce((s, r) => s + Number(r.pressure!.diastolic), 0) / pressureReadings.length)
    : null;

  // ── Status calculados ────────────────────────────────────────────────────
  const gStatus = avgGlucose != null ? glucoseStatus(avgGlucose, patientProfile) : null;
  const pStatus = avgSys != null && avgDia != null ? pressureStatus(avgSys, avgDia, patientProfile) : null;
  const gColor  = avgGlucose != null ? glucoseColor(avgGlucose, patientProfile) : 'text-gray-400';

  // ── Tooltip glucosa personalizado ────────────────────────────────────────
  /**
   * Tooltip que aparece al pasar sobre un punto de la gráfica de glucosa.
   * Muestra: fecha, valor en mg/dL y etiqueta de estado coloreada.
   */
  const GlucoseTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length || payload[0].value == null) return null;
    const val = payload[0].value as number;
    const { label, color } = glucoseStatus(val, patientProfile);
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-left">
        <p className="text-xs text-gray-500 mb-1">{payload[0].payload.date}</p>
        <p className={`text-xl font-bold ${color}`}>{val} mg/dL</p>
        <p className={`text-xs font-medium ${color}`}>{label}</p>
      </div>
    );
  };

  // ── Tooltip presión personalizado ────────────────────────────────────────
  /**
   * Tooltip para la gráfica de presión arterial.
   * Muestra fecha, sistólica/diastólica y etiqueta de estado.
   */
  const PressureTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length || payload[0].value == null) return null;
    const sys = payload[0].value as number;
    const dia = payload[1]?.value as number;
    const { label, color } = pressureStatus(sys, dia, patientProfile);
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-left">
        <p className="text-xs text-gray-500 mb-1">{payload[0].payload.date}</p>
        <p className={`text-xl font-bold ${color}`}>{sys}/{dia} mmHg</p>
        <p className={`text-xs font-medium ${color}`}>{label}</p>
      </div>
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <PacientLayout
      title="Análisis Médico"
      subtitle="Dashboard · Últimos 30 días"
      leftSlot={
        /* Botón de regreso — visible solo cuando hay un handler onBack */
        <button
          onClick={onBack}
          aria-label="Regresar"
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      }
    >
      <div className="mx-auto w-full max-w-2xl space-y-5 px-4 py-6 pb-10">

        {/* ── Gráfica de Glucosa ─────────────────────────────────────────── */}
        {hasGlucoseData && (
          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
            {/* Encabezado de la sección de glucosa */}
            <div className="flex items-start gap-3 px-5 pt-5 pb-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 shadow-md">
                <Activity className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-white">Análisis de Glucosa (30 Días)</p>
                <p className="text-xs font-medium text-emerald-600">
                  Rango Meta: {glucoseMin}–{glucoseMax} mg/dL
                </p>
              </div>
            </div>

            {/* Gráfica con bandas de zona */}
            <div className="px-2 pb-2">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={glucoseData} margin={{ top: 6, right: 14, left: -22, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    domain={[CHART_Y_MIN, CHART_Y_MAX]}
                  />
                  <Tooltip content={<GlucoseTooltip />} />

                  {/*
                   * ── Bandas de zona (ReferenceArea) ────────────────────────
                   * Se dibujan ANTES de la línea para que queden detrás.
                   *
                   * Rojo  → riesgo: > GLUCOSE_RISK_HIGH  o  < GLUCOSE_RISK_LOW
                   * Ámbar → atención: 140-165 (alta)   o  60-90 (baja)
                   * Verde → en rango: 90-140 (zona óptima)
                   */}
                  {/* Zona riesgo alto */}
                  <ReferenceArea y1={GLUCOSE_RISK_HIGH} y2={CHART_Y_MAX} fill="#ef4444" fillOpacity={0.10} stroke="none" />
                  {/* Zona atención alta */}
                  <ReferenceArea y1={GLUCOSE_ATTN_HIGH} y2={GLUCOSE_RISK_HIGH} fill="#f59e0b" fillOpacity={0.10} stroke="none" />
                  {/* Zona en rango / óptima */}
                  <ReferenceArea y1={GLUCOSE_ATTN_LOW} y2={GLUCOSE_ATTN_HIGH} fill="#10b981" fillOpacity={0.10} stroke="none" />
                  {/* Zona atención baja */}
                  <ReferenceArea y1={GLUCOSE_RISK_LOW} y2={GLUCOSE_ATTN_LOW} fill="#f59e0b" fillOpacity={0.10} stroke="none" />
                  {/* Zona riesgo bajo */}
                  <ReferenceArea y1={CHART_Y_MIN} y2={GLUCOSE_RISK_LOW} fill="#ef4444" fillOpacity={0.10} stroke="none" />

                  {/* Línea vertical en el pico de glucosa */}
                  {peakGlucose && (
                    <ReferenceLine
                      x={peakGlucose.date}
                      stroke="#10b981"
                      strokeDasharray="5 4"
                      strokeWidth={1.5}
                      label={{
                        value: `Pico: ${peakGlucose.glucose} mg/dL`,
                        position: 'insideTopRight',
                        fontSize: 10,
                        fill: '#10b981',
                        dy: -4,
                      }}
                    />
                  )}

                  {/* Línea de glucosa con puntos coloreados por estado */}
                  <Line
                    type="monotone"
                    dataKey="glucose"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={(props: any) => {
                      const { cx, cy, value } = props;
                      if (value == null) return <></>;
                      const fill =
                        value < GLUCOSE_RISK_LOW || value > GLUCOSE_RISK_HIGH
                          ? '#ef4444'
                          : value < GLUCOSE_ATTN_LOW || value > GLUCOSE_ATTN_HIGH
                          ? '#f59e0b'
                          : '#10b981';
                      return <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={4} fill={fill} stroke="#fff" strokeWidth={1.5} />;
                    }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Leyenda de zonas */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 px-5 pb-5 pt-1 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                En Rango ({glucoseMin}–{glucoseMax})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400" />
                Atención ({'<'}{glucoseMin}, {'>'}{glucoseMax})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-400" />
                Riesgo ({'<'}{GLUCOSE_RISK_LOW}, {'>'}{GLUCOSE_RISK_HIGH})
              </span>
            </div>
          </div>
        )}

        {/* ── Gráfica de Presión Arterial ────────────────────────────────── */}
        {hasPressureData && (
          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
            {/* Encabezado de la sección de presión */}
            <div className="flex items-start gap-3 px-5 pt-5 pb-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-100 shadow-md">
                <Heart className="h-5 w-5 text-rose-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-white">Presión Arterial (30 Días)</p>
                <p className="text-xs font-medium text-rose-500">
                  Referencia: ≤{patientProfile?.systolic_max ?? 130}/{patientProfile?.diastolic_max ?? 85} mmHg
                </p>
              </div>
            </div>

            <div className="px-2 pb-2">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={pressureData} margin={{ top: 6, right: 14, left: -22, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    domain={[60, 170]}
                  />
                  <Tooltip content={<PressureTooltip />} />

                  {/* Líneas de referencia sistólica y diastólica */}
                  <ReferenceLine
                    y={patientProfile?.systolic_max ?? 130}
                    stroke="#ef4444"
                    strokeDasharray="4 3"
                    strokeOpacity={0.4}
                  />
                  <ReferenceLine
                    y={patientProfile?.diastolic_max ?? 85}
                    stroke="#f97316"
                    strokeDasharray="4 3"
                    strokeOpacity={0.4}
                  />

                  <Line
                    type="monotone"
                    dataKey="systolic"
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    dot={{ fill: '#ef4444', r: 4, stroke: '#fff', strokeWidth: 1.5 }}
                    activeDot={{ r: 6 }}
                    connectNulls
                    name="Sistólica"
                  />
                  <Line
                    type="monotone"
                    dataKey="diastolic"
                    stroke="#f97316"
                    strokeWidth={2.5}
                    dot={{ fill: '#f97316', r: 4, stroke: '#fff', strokeWidth: 1.5 }}
                    activeDot={{ r: 6 }}
                    connectNulls
                    name="Diastólica"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex gap-4 px-5 pb-5 pt-1 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
                Sistólica
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-orange-400" />
                Diastólica
              </span>
            </div>
          </div>
        )}

        {/* ── Cards de estadísticas ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          {/* Card — Promedio Glucosa */}
          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-5 py-5 shadow-sm">
            {/* Ícono + etiqueta */}
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                <Droplet className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="leading-tight">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Glucosa Prom.</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">30 Días</p>
              </div>
            </div>

            {/* Valor promedio grande */}
            <p className={`text-4xl font-bold leading-none ${gColor}`}>
              {avgGlucose != null ? `${avgGlucose}` : '—'}
              <span className="ml-1 text-base font-normal text-gray-400">mg/dL</span>
            </p>

            {/* Estado */}
            {gStatus && (
              <p className={`mt-2 text-sm font-semibold ${gStatus.color}`}>
                Estado: {gStatus.label}
              </p>
            )}

            {/* % en rango — calculado sobre las lecturas de los últimos 30 días */}
            <p className="mt-1 text-xs text-gray-400">
              {percentInRange != null
                ? `En Rango el ${percentInRange}% del tiempo`
                : 'Sin datos suficientes'}
            </p>
          </div>

          {/* Card — Promedio Presión */}
          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-5 py-5 shadow-sm">
            {/* Ícono + etiqueta */}
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100">
                <Heart className="h-5 w-5 text-rose-500" />
              </div>
              <div className="leading-tight">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Presión Prom.</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">30 Días</p>
              </div>
            </div>

            {/* Valor promedio grande */}
            <p className={`text-4xl font-bold leading-none ${pStatus?.color ?? 'text-gray-400'}`}>
              {avgSys != null && avgDia != null ? `${avgSys}/${avgDia}` : '—'}
              <span className="ml-1 text-base font-normal text-gray-400">mmHg</span>
            </p>

            {/* Estado */}
            {pStatus && (
              <p className={`mt-2 text-sm font-semibold ${pStatus.color}`}>
                Estado: {pStatus.label}
              </p>
            )}

            {/* Recomendación basada en el estado calculado */}
            <p className="mt-1 text-xs text-gray-400">
              {pStatus?.recommendation ?? 'Sin datos suficientes'}
            </p>
          </div>
        </div>

      </div>
    </PacientLayout>
  );
}

