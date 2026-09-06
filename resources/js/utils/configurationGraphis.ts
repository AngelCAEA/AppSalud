/**
 * Configuracion central para graficas clinicas de paciente.
 */
import { formatDate } from '@/utils/helpers';
import type { PatientProfile, Reading } from '@/types/user';
import type {
  GlucoseZoneArea,
  TrendsAnalytics,
} from '@/types/trends';

export const GLUCOSE_RISK_HIGH = 165;
export const GLUCOSE_ATTN_HIGH = 140;
export const GLUCOSE_ATTN_LOW = 90;
export const GLUCOSE_RISK_LOW = 60;

export const GLUCOSE_CHART_Y_MAX = 220;
export const GLUCOSE_CHART_Y_MIN = 50;

export const PRESSURE_CHART_Y_MAX = 170;
export const PRESSURE_CHART_Y_MIN = 60;

export const GLUCOSE_COLOR_RISK = '#ef4444';
export const GLUCOSE_COLOR_ATTN = '#f59e0b';
export const GLUCOSE_COLOR_OK = '#10b981';

export const GLUCOSE_ZONE_AREAS: GlucoseZoneArea[] = [
  { y1: GLUCOSE_RISK_HIGH, y2: GLUCOSE_CHART_Y_MAX, fill: GLUCOSE_COLOR_RISK, fillOpacity: 0.1 },
  { y1: GLUCOSE_ATTN_HIGH, y2: GLUCOSE_RISK_HIGH, fill: GLUCOSE_COLOR_ATTN, fillOpacity: 0.1 },
  { y1: GLUCOSE_ATTN_LOW, y2: GLUCOSE_ATTN_HIGH, fill: GLUCOSE_COLOR_OK, fillOpacity: 0.1 },
  { y1: GLUCOSE_RISK_LOW, y2: GLUCOSE_ATTN_LOW, fill: GLUCOSE_COLOR_ATTN, fillOpacity: 0.1 },
  { y1: GLUCOSE_CHART_Y_MIN, y2: GLUCOSE_RISK_LOW, fill: GLUCOSE_COLOR_RISK, fillOpacity: 0.1 },
];

/**
 * Color del punto de grafica de glucosa segun zona clinica.
 */
export function getGlucoseChartDotColor(value: number): string {
  if (value < GLUCOSE_RISK_LOW || value > GLUCOSE_RISK_HIGH) return GLUCOSE_COLOR_RISK;
  if (value < GLUCOSE_ATTN_LOW || value > GLUCOSE_ATTN_HIGH) return GLUCOSE_COLOR_ATTN;
  return GLUCOSE_COLOR_OK;
}

/**
 * Construye datos de graficas y estadisticas para pantalla de tendencias.
 */
export function buildTrendsAnalytics(
  readings: Reading[],
  patientProfile: PatientProfile | null,
  windowDays = 30,
): TrendsAnalytics {
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - windowDays);

  const glucoseData = readings
    .filter((r) => r.glucose !== null && new Date(r.timestamp) >= fromDate)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map((r) => ({
      date: formatDate(r.timestamp, 'short'),
      glucose: Number(r.glucose),
    }));

  const pressureData = readings
    .filter((r) => r.pressure !== null && new Date(r.timestamp) >= fromDate)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map((r) => ({
      date: formatDate(r.timestamp, 'short'),
      systolic: Number(r.pressure!.systolic),
      diastolic: Number(r.pressure!.diastolic),
    }));

  const hasGlucoseData = glucoseData.length > 0;
  const hasPressureData = pressureData.length > 0;

  const peakGlucose = hasGlucoseData
    ? glucoseData.reduce((mx, d) => (d.glucose > mx.glucose ? d : mx), glucoseData[0])
    : null;

  const glucoseReadings = readings.filter((r) => r.glucose !== null && new Date(r.timestamp) >= fromDate);
  const avgGlucose = glucoseReadings.length > 0
    ? Math.round(glucoseReadings.reduce((sum, r) => sum + Number(r.glucose), 0) / glucoseReadings.length)
    : null;

  const glucoseMin = patientProfile?.glucose_min ?? GLUCOSE_ATTN_LOW;
  const glucoseMax = patientProfile?.glucose_max ?? GLUCOSE_ATTN_HIGH;
  const inRangeCount = glucoseReadings.filter((r) => Number(r.glucose) >= glucoseMin && Number(r.glucose) <= glucoseMax).length;
  const percentInRange = glucoseReadings.length > 0
    ? Math.round((inRangeCount / glucoseReadings.length) * 100)
    : null;

  const pressureReadings = readings.filter((r) => r.pressure !== null && new Date(r.timestamp) >= fromDate);
  const avgSys = pressureReadings.length > 0
    ? Math.round(pressureReadings.reduce((sum, r) => sum + Number(r.pressure!.systolic), 0) / pressureReadings.length)
    : null;
  const avgDia = pressureReadings.length > 0
    ? Math.round(pressureReadings.reduce((sum, r) => sum + Number(r.pressure!.diastolic), 0) / pressureReadings.length)
    : null;

  return {
    glucoseData,
    pressureData,
    hasGlucoseData,
    hasPressureData,
    peakGlucose,
    glucoseMin,
    glucoseMax,
    avgGlucose,
    avgSys,
    avgDia,
    percentInRange,
  };
}
