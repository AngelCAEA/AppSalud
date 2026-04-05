import { Clock, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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
  patientProfile : PatientProfile | null;
}

export function HistoryCard({ readings, onViewAll, patientProfile }: HistoryCardProps) {
  const formatDate = (date: string) => {
    const datePart = date.split('T')[0];
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    if (datePart === todayStr) return 'Hoy';
    if (datePart === yesterdayStr) return 'Ayer';
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year}`;
  };

  const getGlucoseColor = (glucose: number) => {
    const value = Math.round(glucose);
    if (patientProfile && value < patientProfile.glucose_min) return 'text-red-600';
    if (patientProfile && value > patientProfile.glucose_max) return 'text-red-600';
    if (value < 90 || value > 140) return 'text-amber-600';
    return 'text-green-600';
  };

  return (
    <Card className="rounded-xl border-2 dark:bg-gray-800">
      <CardContent className='p-6'>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600 dark:text-white" />
            <h3 className="text-gray-700 dark:text-white">Historial Reciente</h3>
          </div>
          <button 
            onClick={onViewAll}
            className="text-gray-600 dark:text-white text-sm flex items-center gap-1 hover:gap-2 transition-all cursor-pointer"
          >
            Ver todo
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {readings.map((reading) => (
            <div key={reading.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-white">{formatDate(reading.timestamp)}</span>
                <span className="text-xs text-gray-400 dark:text-white">
                  {new Date(reading.timestamp).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {reading.glucose !== null && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-white mb-1">Glucosa</div>
                      <div className={`text-xl ${getGlucoseColor(reading.glucose)}`}>
                        {Math.round(reading.glucose)}
                        <span className="text-sm ml-1 opacity-75">mg/dL</span>
                      </div>
                    </div>
                  )}
                  {reading.glucose !== null && reading.pressure !== null && (
                    <div className="w-px h-10 bg-gray-200 dark:bg-gray-600"></div>
                  )}
                  {reading.pressure !== null && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-white mb-1">Presión</div>
                      <div className="text-xl text-black dark:text-white">
                        {reading.pressure.systolic}/{reading.pressure.diastolic}
                        <span className="text-sm ml-1 opacity-75 text-gray-500 dark:text-white">mmHg</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}