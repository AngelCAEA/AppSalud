import type { PatientProfile } from '@/types/user';

const TIME_ZONE = 'America/Mexico_City';
type ColorIntensity = '500' | '600';

function formatClockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-MX', {
    timeZone: TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function zonedDateKey(date: Date): string {
  return date.toLocaleDateString('en-CA', { timeZone: TIME_ZONE });
}

export interface ReadingStatus {
  label: string;
  color: string;
}

export interface PressureRecommendationStatus extends ReadingStatus {
  recommendation: string;
}

function withColorIntensity(colorClass: string, intensity: ColorIntensity): string {
  return colorClass.replace(/-\d{3}$/, `-${intensity}`);
}

/**
 * Formatea la fecha de un timestamp en texto relativo (Hoy / Ayer / fecha)
 * e incluye la hora en formato 24h.
 */
export function formatReadingDate(iso: string): { label: string; time: string } {
  const d = new Date(iso);
  const now = new Date();
  const todayStr = zonedDateKey(now);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = zonedDateKey(yesterday);
  const dateStr = zonedDateKey(d);

  let label: string;
  if (dateStr === todayStr) label = 'Hoy';
  else if (dateStr === yesterdayStr) label = 'Ayer';
  else {
    label = d.toLocaleDateString('es-MX', {
      timeZone: TIME_ZONE,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  const time = formatClockTime(iso);

  return { label, time };
}

/**
 * Calcula el tiempo transcurrido desde un timestamp y devuelve texto legible.
 * Ejemplos: 45 min, 2 h, 1 d 3 h.
 */
export function timeSinceReading(iso: string): string {
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
 * Formatea timestamp como "Hoy, HH:mm" o "DD MMM HH:mm".
 */
export function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const isToday = zonedDateKey(date) === zonedDateKey(new Date());

  if (isToday) return `Hoy, ${formatClockTime(iso)}`;

  const day = date.toLocaleDateString('es-MX', {
    timeZone: TIME_ZONE,
    day: '2-digit',
    month: 'short',
  });

  return `${day} ${formatClockTime(iso)}`;
}

/**
 * Formatea solo la fecha en zona horaria de Mexico.
 */
export function formatDate(iso: string, format: 'full' | 'short' = 'full'): string {
  const date = new Date(iso);

  if (format === 'short') {
    return date.toLocaleDateString('es-MX', {
      timeZone: TIME_ZONE,
      day: 'numeric',
      month: 'short',
    });
  }

  return date.toLocaleDateString('es-MX', {
    timeZone: TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Formatea solo la hora en zona horaria de Mexico.
 */
export function formatTime(iso: string, hour12 = false): string {
  return new Date(iso).toLocaleTimeString('es-MX', {
    timeZone: TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12,
  });
}

/**
 * Devuelve etiqueta y color para glucosa segun rangos del perfil.
 */
export function getGlucoseStatus(
  glucose: number,
  profile: PatientProfile | null,
): ReadingStatus {
  const value = Math.round(glucose);
  const min = profile?.glucose_min ?? 90;
  const max = profile?.glucose_max ?? 140;

  if (value < 70 || value > 180) return { label: 'Alta', color: 'text-red-500' };
  if (value < min || value > max) return { label: 'Atención', color: 'text-amber-500' };
  return { label: 'Óptima', color: 'text-emerald-500' };
}

/**
 * Devuelve clase de color para glucosa reutilizando la logica central de estado.
 */
export function getGlucoseColor(
  glucose: number,
  profile: PatientProfile | null = null,
  intensity: ColorIntensity = '500',
): string {
  return withColorIntensity(getGlucoseStatus(glucose, profile).color, intensity);
}

/**
 * Devuelve etiqueta y color para presion arterial segun limites del perfil.
 */
export function getPressureStatus(
  systolic: number,
  diastolic: number,
  profile: PatientProfile | null,
): ReadingStatus {
  const maxS = profile?.systolic_max ?? 130;
  const maxD = profile?.diastolic_max ?? 85;

  if (systolic > maxS || diastolic > maxD) {
    return { label: 'Elevada', color: 'text-orange-500' };
  }

  return { label: 'Normal', color: 'text-emerald-500' };
}

/**
 * Devuelve clase de color para presion reutilizando la logica central de estado.
 */
export function getPressureColor(
  systolic: number,
  diastolic: number,
  profile: PatientProfile | null = null,
  intensity: ColorIntensity = '500',
): string {
  return withColorIntensity(getPressureStatus(systolic, diastolic, profile).color, intensity);
}

/**
 * Estado de glucosa para analitica de tendencias (rangos y etiquetas medicas).
 */
export function getTrendGlucoseStatus(
  glucose: number,
  profile: PatientProfile | null,
): ReadingStatus {
  const min = profile?.glucose_min ?? 90;
  const max = profile?.glucose_max ?? 140;
  const riskLow = 60;
  const riskHigh = 165;

  if (glucose >= min && glucose <= max) return { label: 'Óptimo', color: 'text-emerald-600' };
  if (glucose < riskLow || glucose > riskHigh) {
    return { label: glucose > riskHigh ? 'Alto' : 'Bajo', color: 'text-red-500' };
  }
  return { label: 'Atención', color: 'text-amber-500' };
}

/**
 * Estado de presion para tendencias con recomendacion breve.
 */
export function getTrendPressureStatus(
  systolic: number,
  diastolic: number,
  profile: PatientProfile | null,
): PressureRecommendationStatus {
  const sysMax = profile?.systolic_max ?? 130;
  const diaMax = profile?.diastolic_max ?? 85;

  if (systolic <= sysMax && diastolic <= diaMax) {
    return {
      label: 'Normal',
      color: 'text-emerald-600',
      recommendation: 'Mantén tu estilo de vida actual',
    };
  }

  if (systolic <= sysMax + 10 && diastolic <= diaMax + 5) {
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
