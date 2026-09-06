export interface TrendGlucosePoint {
  date: string;
  glucose: number;
}

export interface TrendPressurePoint {
  date: string;
  systolic: number;
  diastolic: number;
}

export interface TrendsAnalytics {
  glucoseData: TrendGlucosePoint[];
  pressureData: TrendPressurePoint[];
  hasGlucoseData: boolean;
  hasPressureData: boolean;
  peakGlucose: TrendGlucosePoint | null;
  glucoseMin: number;
  glucoseMax: number;
  avgGlucose: number | null;
  avgSys: number | null;
  avgDia: number | null;
  percentInRange: number | null;
}

export interface GlucoseZoneArea {
  y1: number;
  y2: number;
  fill: string;
  fillOpacity: number;
}
