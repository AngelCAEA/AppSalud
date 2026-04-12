import { ArrowLeft, Activity, Heart, Droplet } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

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
  patientProfile : PatientProfile | null;
  onBack: () => void;
}

export function TrendsScreen({ readings, patientProfile, onBack }: TrendsScreenProps) {
 
  const timeZone = 'America/Mexico_City';

  // Prepare glucose data - each reading is a point
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const glucoseData = readings
    .filter(r => r.glucose !== null && new Date(r.timestamp) >= thirtyDaysAgo)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map(r => ({
      date: new Date(r.timestamp).toLocaleDateString('es-MX', { timeZone, day: 'numeric', month: 'short' }),
      fullDate: new Date(r.timestamp),
      glucose: r.glucose,
    }));

  // Prepare pressure data - each reading is a point
  const pressureData = readings
    .filter(r => r.pressure !== null && new Date(r.timestamp) >= thirtyDaysAgo)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map(r => ({
      date: new Date(r.timestamp).toLocaleDateString('es-MX', { timeZone, day: 'numeric', month: 'short' }),
      fullDate: new Date(r.timestamp),
      systolic: r.pressure!.systolic,
      diastolic: r.pressure!.diastolic,
    }));

  // Check if there's enough data to show
  const hasGlucoseData = glucoseData.some(d => d.glucose !== null);
  const hasPressureData = pressureData.some(d => d.systolic !== null && d.diastolic !== null);

  // Custom tooltip for glucose
  const GlucoseTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length && payload[0].value !== null) {
      const value = payload[0].value;
      let status = 'Normal';
      let color = 'text-green-600';
      
      if (patientProfile && (value < patientProfile.glucose_min || value > patientProfile.glucose_max)) {
        status = value < patientProfile.glucose_min ? 'Baja' : 'Alta';
        color = 'text-red-600';
      } else if (value < 90 || value > 140) {
        status = 'Atención';
        color = 'text-amber-600';
      }

      return (
        <div className="bg-white border-2 border-gray-200 rounded-xl shadow-lg p-3">
          <p className="text-sm text-gray-600 mb-1">{payload[0].payload.date}</p>
          <p className={`text-2xl ${color}`}>{value} mg/dL</p>
          <p className={`text-sm ${color}`}>{status}</p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for pressure
  const PressureTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length && payload[0].value !== null) {
      const systolic = payload[0].value;
      const diastolic = payload[1]?.value;
      
      let status = 'Normal';
      let color = 'text-green-600';
      
      if (patientProfile && (systolic > patientProfile.systolic_max || diastolic > patientProfile.diastolic_max)) {
        status = 'Elevada';
        color = 'text-orange-600';
      }

      return (
        <div className="bg-white border-2 border-gray-200 rounded-xl shadow-lg p-3">
          <p className="text-sm text-gray-600 mb-1">{payload[0].payload.date}</p>
          <p className={`text-2xl ${color}`}>{systolic}/{diastolic} mmHg</p>
          <p className={`text-sm ${color}`}>{status}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-6">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center justify-center relative">
          <div className="absolute left-4 flex items-center gap-2">
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <span className="font-semibold text-blue-900">Tendencias</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <h1 className="font-semibold text-blue-900">App Salud</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 space-y-6 max-w-2xl mx-auto">
        {/* Glucose Chart */}
        {hasGlucoseData && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Droplet className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-gray-800">Glucosa</h2>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={glucoseData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  domain={[60, 200]}
                />
                <Tooltip content={<GlucoseTooltip />} />
                
                {/* Reference lines for ranges */}
                <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.3} />
                <ReferenceLine y={90} stroke="#f59e0b" strokeDasharray="3 3" strokeOpacity={0.3} />
                <ReferenceLine y={140} stroke="#f59e0b" strokeDasharray="3 3" strokeOpacity={0.3} />
                <ReferenceLine y={180} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.3} />
                
                <Line 
                  type="monotone" 
                  dataKey="glucose" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={(props: any) => {
                    const { cx, cy, value } = props;
                    if (value === null || value === undefined) return <></>;
                    let fill = '#10b981'; // green
                    if (patientProfile && (value < patientProfile.glucose_min || value > patientProfile.glucose_max)) {
                      fill = '#ef4444'; // red
                    } else if (value < 90 || value > 140) {
                      fill = '#f59e0b'; // amber
                    }
                    return <circle cx={cx} cy={cy} r={4} fill={fill} stroke={fill} strokeWidth={1} />;
                  }}
                  activeDot={{ r: 6 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="mt-6 grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Óptima: {patientProfile?.glucose_min || 0} - {patientProfile?.glucose_max || 0} mg/dL</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                <span className="text-gray-600">Atención</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-600">Fuera de rango</span>
              </div>
            </div>
          </div>
        )}

        {/* Pressure Chart */}
        {hasPressureData && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-gray-800">Presión Arterial</h2>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={pressureData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  domain={[60, 160]}
                />
                <Tooltip content={<PressureTooltip />} />
                
                {/* Reference lines */}
                <ReferenceLine y={130} stroke="#f59e0b" strokeDasharray="3 3" strokeOpacity={0.3} />
                <ReferenceLine y={85} stroke="#f59e0b" strokeDasharray="3 3" strokeOpacity={0.3} />
                
                <Line 
                  type="monotone" 
                  dataKey="systolic" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  dot={{ fill: '#ef4444', r: 4 }}
                  activeDot={{ r: 6 }}
                  connectNulls
                  name="Sistólica"
                />
                <Line 
                  type="monotone" 
                  dataKey="diastolic" 
                  stroke="#ec4899" 
                  strokeWidth={3}
                  dot={{ fill: '#ec4899', r: 4 }}
                  activeDot={{ r: 6 }}
                  connectNulls
                  name="Diastólica"
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="mt-6 grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-600">Sistólica</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                <span className="text-gray-600">Diastólica</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Normal: ≤{patientProfile?.systolic_max || 0}/{patientProfile?.diastolic_max || 0} mmHg
            </p>
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-2xl p-5 shadow-md">
            <div className="text-sm opacity-90 mb-1">Promedio Glucosa</div>
            <div className="text-3xl">
              {(() => {
                const validReadings = readings.filter(r => r.glucose !== null && r.glucose !== undefined);
                if (validReadings.length === 0) return '--';
                const avg = validReadings.reduce((sum, r) => {
                  const glucoseValue = Number(r.glucose);
                  return sum + (isNaN(glucoseValue) ? 0 : glucoseValue);
                }, 0) / validReadings.length;
                return Math.round(avg);
              })()}
            </div>
            <div className="text-xs opacity-75 mt-1">mg/dL</div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-pink-500 text-white rounded-2xl p-5 shadow-md">
            <div className="text-sm opacity-90 mb-1">Promedio Presión</div>
            <div className="text-3xl">
              {(() => {
                const validReadings = readings.filter(r => r.pressure !== null && r.pressure !== undefined);
                if (validReadings.length === 0) return '--/--';
                const avgSys = validReadings.reduce((sum, r) => {
                  const systolic = Number(r.pressure?.systolic);
                  return sum + (isNaN(systolic) ? 0 : systolic);
                }, 0) / validReadings.length;
                const avgDia = validReadings.reduce((sum, r) => {
                  const diastolic = Number(r.pressure?.diastolic);
                  return sum + (isNaN(diastolic) ? 0 : diastolic);
                }, 0) / validReadings.length;
                return `${Math.round(avgSys)}/${Math.round(avgDia)}`;
              })()}
            </div>
            <div className="text-xs opacity-75 mt-1">mmHg</div>
          </div>
        </div>
      </main>
    </div>
  );
}