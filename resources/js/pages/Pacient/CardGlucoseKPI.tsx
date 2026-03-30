import { Card, CardContent } from '@/components/ui/card';
import { Droplet } from 'lucide-react';
interface GlucoseKPIProps {
  value: number;
  timestamp: string;
}

export function GlucoseKPI({ value, timestamp }: GlucoseKPIProps) {
  // Redondear el valor a número entero sin decimales
  const roundedValue = Math.round(value);
  
  const getColorClass = (glucose: number) => {
    if (glucose < 70 || glucose > 180) return 'dark:bg-gray-800 text-red-600 border-red-200';
    if (glucose < 90 || glucose > 140) return 'dark:bg-gray-800 text-amber-600 border-amber-200';
    return 'dark:bg-gray-800 text-green-600 border-green-200';
  };

  const getStatus = (glucose: number) => {
    if (glucose < 70) return 'Baja';
    if (glucose > 180) return 'Alta';
    if (glucose < 90 || glucose > 140) return 'Atención';
    return 'Óptima';
  };

  const colorClass = getColorClass(roundedValue);
  const status = getStatus(roundedValue);

  const timeAgo = () => {
    const timePart = timestamp.split('T')[1]?.substring(0, 5) || '';
    return timePart;
  };

  return (
    <Card className={`rounded-xl border-2 ${colorClass}`}>
      <CardContent className='p-6'>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Droplet className="w-6 h-6" />
          <h2>Glucosa</h2>
        </div>
        <span className="text-sm opacity-75">{timeAgo()}</span>
      </div>

      <div className="text-center mb-4">
        <div className="text-8xl leading-none mb-2" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {roundedValue}
        </div>
        <div className="text-2xl opacity-75">mg/dL</div>
      </div>

      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full">
          <div className="w-2 h-2 rounded-full bg-current  animate-pulse"></div>
          <span>{status}</span>
        </div>
      </div>
      </CardContent>
    </Card>

    
  );
}