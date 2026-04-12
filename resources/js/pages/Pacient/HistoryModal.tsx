import { X, Droplet, Heart, Filter } from 'lucide-react';
import { useState, useMemo } from 'react';

interface Reading {
  id: string;
  glucose: number | null;
  pressure: { systolic: number; diastolic: number } | null;
  timestamp: string;
  type: 'glucose' | 'pressure' | 'both';
}

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  readings: Reading[];
}

type DateFilter = 'all' | 'today' | 'week' | 'month' | 'custom';

export function HistoryModal({ isOpen, onClose, readings }: HistoryModalProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [appliedStartDate, setAppliedStartDate] = useState('');
  const [appliedEndDate, setAppliedEndDate] = useState('');
  const itemsPerPage = 10;

  // Filter readings based on date range
  const filteredReadings = useMemo(() => {
    if (!appliedStartDate && !appliedEndDate) return readings;

    return readings.filter(reading => {
      const readingDateISO = reading.timestamp.split('T')[0];
      const start = appliedStartDate || '0000-00-00';
      const end = appliedEndDate || '9999-99-99';
      return readingDateISO >= start && readingDateISO <= end;
    });
  }, [readings, appliedStartDate, appliedEndDate]);

  // Pagination
  const totalPages = Math.ceil(filteredReadings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReadings = filteredReadings.slice(startIndex, endIndex);

  const handleFilter = () => {
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getGlucoseColor = (glucose: number) => {
    if (glucose < 70 || glucose > 180) return 'text-red-600';
    if (glucose < 90 || glucose > 140) return 'text-amber-600';
    return 'text-green-600';
  };

  const getPressureColor = (systolic: number, diastolic: number) => {
    if (systolic > 130 || diastolic > 85) return 'text-orange-600';
    return 'text-green-600';
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const timeZone = 'America/Mexico_City';
    return d.toLocaleDateString('es-MX', { timeZone, day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const timeZone = 'America/Mexico_City';
    return d.toLocaleTimeString('es-MX', { timeZone, hour: '2-digit', minute: '2-digit', hour12: true });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-4xl rounded-2xl shadow-2xl max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-blue-600 dark:text-blue-400">Historial de registros</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Filtros de Fecha */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="flex-1 w-full">
              <label className="block text-sm text-black dark:text-white mb-2">Desde</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-sm text-black dark:text-white mb-2">Hasta</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleFilter}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtrar
            </button>
          </div>
          
          {(appliedStartDate || appliedEndDate) && (
            <div className="mt-3 text-sm text-black dark:text-white flex items-center gap-2">
              <span>Mostrando {filteredReadings.length} de {readings.length} registros</span>
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setAppliedStartDate('');
                  setAppliedEndDate('');
                  setCurrentPage(1);
                }}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        {/* Table Content - Scrollable */}
        <div className="overflow-auto flex-1 p-6">
          {/* Mobile View - Cards */}
          <div className="sm:hidden space-y-4">
            {paginatedReadings.map((reading) => (
              <div key={reading.id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-sm text-black dark:text-white">
                  <span>{formatDate(reading.timestamp)}</span>
                  <span className="text-gray-500 dark:text-gray-400">{formatTime(reading.timestamp)}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white dark:bg-gray-600 rounded-lg p-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Presión Arterial</div>
                    {reading.pressure !== null ? (
                      <div className={`text-lg ${getPressureColor(reading.pressure.systolic, reading.pressure.diastolic)}`}>
                        {reading.pressure.systolic}/{reading.pressure.diastolic}
                        <span className="text-xs ml-1">mmHg</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                    )}
                  </div>

                  <div className="bg-white dark:bg-gray-600 rounded-lg p-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Glucosa</div>
                    {reading.glucose !== null ? (
                      <div className={`text-lg ${getGlucoseColor(reading.glucose)}`}>
                        {reading.glucose}
                        <span className="text-xs ml-1">mg/dL</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View - Table */}
          <div className="hidden sm:block">
            <table className="w-full">
              <thead className="border-b-2 border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm text-black dark:text-white">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-sm text-black dark:text-white">
                    Hora
                  </th>
                  <th className="px-4 py-3 text-left text-sm text-black dark:text-white">
                    Presión Arterial
                  </th>
                  <th className="px-4 py-3 text-left text-sm text-black dark:text-white">
                    Glucosa
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {paginatedReadings.map((reading) => (
                  <tr key={reading.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-4 py-4">
                      <div className="text-sm text-black dark:text-white">{formatDate(reading.timestamp)}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{formatTime(reading.timestamp)}</div>
                    </td>
                    <td className="px-4 py-4">
                      {reading.pressure !== null ? (
                        <div className="flex items-center gap-2">
                          <Heart className={`w-4 h-4 ${getPressureColor(reading.pressure.systolic, reading.pressure.diastolic)}`} />
                          <span className={`${getPressureColor(reading.pressure.systolic, reading.pressure.diastolic)}`}>
                            {reading.pressure.systolic}/{reading.pressure.diastolic}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">mmHg</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {reading.glucose !== null ? (
                        <div className="flex items-center gap-2">
                          <Droplet className={`w-4 h-4 ${getGlucoseColor(reading.glucose)}`} />
                          <span className={`${getGlucoseColor(reading.glucose)}`}>
                            {reading.glucose}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">mg/dL</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredReadings.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <p className="text-lg">No hay registros disponibles</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div className="text-sm text-black dark:text-white">
                Página {currentPage} de {totalPages} • Mostrando {startIndex + 1} - {Math.min(endIndex, readings.length)} de {readings.length} registros
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    currentPage === 1
                      ? 'text-gray-300 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 cursor-not-allowed'
                      : 'text-black dark:text-white bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                  }`}
                >
                  Anterior
                </button>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    currentPage === totalPages
                      ? 'text-gray-300 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 cursor-not-allowed'
                      : 'text-black dark:text-white bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                  }`}
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}