import { X, Activity, Heart, Filter } from 'lucide-react';
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
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex-1" />
          <h2 className="flex-1 text-center text-xl font-bold text-gray-900 dark:text-white">
            Historial de registros
          </h2>
          <div className="flex-1 flex justify-end">
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* ── Filtros de fecha ─────────────────────────────────────────────── */}
        <div className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 px-6 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Desde</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Hasta</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleFilter}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <Filter className="h-4 w-4" />
              Filtrar
            </button>
          </div>

          {(appliedStartDate || appliedEndDate) && (
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>Mostrando {filteredReadings.length} de {readings.length} registros</span>
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setAppliedStartDate('');
                  setAppliedEndDate('');
                  setCurrentPage(1);
                }}
                className="text-blue-500 underline hover:text-blue-400"
              >
                Limpiar
              </button>
            </div>
          )}
        </div>

        {/* ── Lista de registros ───────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {paginatedReadings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
              <p className="text-base">No hay registros disponibles</p>
            </div>
          ) : (
            paginatedReadings.map((reading) => (
              <div
                key={reading.id}
                className="flex items-center gap-4 rounded-2xl bg-gray-50 dark:bg-gray-800 px-5 py-4"
              >
                {/* Fecha y hora */}
                <div className="w-28 shrink-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {formatDate(reading.timestamp)}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {formatTime(reading.timestamp)}
                  </p>
                </div>

                {/* Presión */}
                <div className="flex-1 flex justify-center">
                  {reading.pressure !== null ? (
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-semibold
                      ${getPressureColor(reading.pressure.systolic, reading.pressure.diastolic) === 'text-orange-600'
                        ? 'border-orange-400/40 bg-orange-900/20 text-orange-400 dark:border-orange-500/40 dark:bg-orange-900/30 dark:text-orange-400'
                        : 'border-emerald-400/40 bg-emerald-900/20 text-emerald-600 dark:border-emerald-500/40 dark:bg-emerald-900/30 dark:text-emerald-400'
                      }`}
                    >
                      <Heart className="h-3.5 w-3.5" />
                      {reading.pressure.systolic}/{reading.pressure.diastolic}
                      <span className="text-xs font-normal opacity-75">mmHg</span>
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400 dark:text-gray-500">Sin lectura</span>
                  )}
                </div>

                {/* Glucosa */}
                <div className="flex-1 flex justify-center">
                  {reading.glucose !== null ? (
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-semibold
                      ${getGlucoseColor(reading.glucose) === 'text-red-600'
                        ? 'border-red-400/40 bg-red-900/20 text-red-500 dark:border-red-500/40 dark:bg-red-900/30 dark:text-red-400'
                        : getGlucoseColor(reading.glucose) === 'text-amber-600'
                        ? 'border-amber-400/40 bg-amber-900/20 text-amber-600 dark:border-amber-500/40 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'border-emerald-400/40 bg-emerald-900/20 text-emerald-600 dark:border-emerald-500/40 dark:bg-emerald-900/30 dark:text-emerald-400'
                      }`}
                    >
                      <Activity className="h-3.5 w-3.5" />
                      {reading.glucose}
                      <span className="text-xs font-normal opacity-75">mg/dL</span>
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400 dark:text-gray-500">Sin lectura</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Paginación ───────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 px-6 py-4">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Página {currentPage} de {totalPages} · {startIndex + 1}–{Math.min(endIndex, filteredReadings.length)} de {filteredReadings.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                  currentPage === 1
                    ? 'cursor-not-allowed bg-gray-100 text-gray-300 dark:bg-gray-700 dark:text-gray-600'
                    : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Anterior
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                  currentPage === totalPages
                    ? 'cursor-not-allowed bg-gray-100 text-gray-300 dark:bg-gray-700 dark:text-gray-600'
                    : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
