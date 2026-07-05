import AppLayout from "@/layouts/app-layout";
import { Head, Link, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import  { route }  from "ziggy-js";
import * as XLSX from 'xlsx';
import { Calendar, CheckSquare, Download, FileSpreadsheet, Users, Activity, TrendingUp, TrendingDown, AlertCircle, Clock } from "lucide-react";

// ==========================================
// TIPOS Y INTERFACES
// ==========================================
type ReportType = 'patients' | 'measurements';

interface Patient {
    id: number;
    name: string;
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
export default function Reports(){
    // ==========================================
    // ESTADOS PRINCIPALES
    // ==========================================
    const [reportType, setReportType] = useState<ReportType>('patients');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    
    // ==========================================
    // ESTADOS PARA SELECCIÓN DE PACIENTE
    // ==========================================
    /** Lista de todos los pacientes asignados al clínico actual */
    const [patientsList, setPatientsList] = useState<Patient[]>([]);
    /** ID del paciente actualmente seleccionado (null = todos los pacientes) */
    const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
    /** Indica si se está cargando la lista de pacientes */
    const [patientsListLoading, setPatientsListLoading] = useState(true);
    
    // ==========================================
    // ESTADOS PARA DATOS Y COLUMNAS
    // ==========================================
    const [selectedColumns, setSelectedColumns] = useState<string[]>([
        'name',
        'tir',
        'riskLevel',
        'lastGlucose',
        'lastReading'
    ]);
    const [patientsData, setPatientsData] = useState<any[]>([]);
    const [measurementsData, setMeasurementsData] = useState<any[]>([]);
    const [summaryData, setSummaryData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dateError, setDateError] = useState<string | null>(null);

    // ==========================================
    // EFECTOS - CARGA DE LISTA DE PACIENTES
    // ==========================================
    /**
     * Efecto que se ejecuta al montar el componente
     * Obtiene la lista inicial de todos los pacientes asignados al clínico
     */
    useEffect(() => {
        const fetchPatientsList = async () => {
            try {
                setPatientsListLoading(true);
                const response = await fetch(route('reports.patients-list'));
                
                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }
                
                const data = await response.json();
                if (data.success) {
                    setPatientsList(data.data);
                    // Si hay pacientes, seleccionar el primero por defecto
                    if (data.data.length > 0) {
                        setSelectedPatientId(data.data[0].id);
                    }
                } else {
                    console.error('Error cargando lista de pacientes');
                }
            } catch (err) {
                console.error('Error fetching patients list:', err);
            } finally {
                setPatientsListLoading(false);
            }
        };

        fetchPatientsList();
    }, []);

    // ==========================================
    // FUNCIONES AUXILIARES - VALIDACIÓN DE FECHAS
    // ==========================================
    /**
     * Valida que la fecha final no sea menor que la inicial
     * @param from - Fecha inicial en formato YYYY-MM-DD
     * @param to - Fecha final en formato YYYY-MM-DD
     * @returns true si las fechas son válidas, false en caso contrario
     */
    const validateDates = (from: string, to: string): boolean => {
        if (from && to && new Date(to) < new Date(from)) {
            setDateError('La fecha final no puede ser menor que la fecha inicial');
            return false;
        }
        setDateError(null);
        return true;
    };

    const handleDateFromChange = (value: string) => {
        setDateFrom(value);
        validateDates(value, dateTo);
    };

    const handleDateToChange = (value: string) => {
        setDateTo(value);
        validateDates(dateFrom, value);
    };

    /**
     * Maneja el cambio de paciente seleccionado
     * Reestablece los datos para mostrar los del nuevo paciente
     */
    const handlePatientChange = (patientId: number | null) => {
        setSelectedPatientId(patientId);
        setError(null);
    };

    // ==========================================
    // EFECTOS - CARGA DE PACIENTES (LISTA DETALLADA O INDIVIDUAL)
    // ==========================================
    /**
     * Efecto que obtiene la lista de pacientes con sus datos detallados
     * Se ejecuta cuando cambia: reportType, dateFrom, dateTo o selectedPatientId
     * 
     * Si selectedPatientId es null, trae todos los pacientes del clínico
     * Si selectedPatientId tiene valor, trae solo ese paciente
     */
    useEffect(() => {
        const fetchPatients = async () => {
            try {
                setLoading(true);
                setError(null);
                
                if (!validateDates(dateFrom, dateTo)) {
                    return;
                }
                
                // Construir URL con parámetros de filtro
                let url = route('reports.patients');
                if (selectedPatientId) {
                    url += `?patientId=${selectedPatientId}`;
                }
                
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }
                
                const data = await response.json();
                if (data.success) {
                    // Filtrar pacientes por rango de fechas
                    const filteredPatients = data.data.filter((patient: any) => {
                        if (!patient.lastReading) return true; // Incluir pacientes sin registro
                        const readingDate = new Date(patient.lastReading);
                        const fromDate = new Date(dateFrom);
                        const toDate = new Date(dateTo);
                        return readingDate >= fromDate && readingDate <= toDate;
                    });
                    setPatientsData(filteredPatients);
                } else {
                    setError('No se pudieron cargar los datos');
                }
            } catch (err) {
                console.error('Error fetching patients:', err);
                setError(err instanceof Error ? err.message : 'Error desconocido');
            } finally {
                setLoading(false);
            }
        };

        if (reportType === 'patients') {
            fetchPatients();
        }
    }, [reportType, dateFrom, dateTo, selectedPatientId]);

    // Obtener las mediciones desde el backend cuando el tipo sea measurements
    useEffect(() => {
        const fetchMeasurements = async () => {
            try {
                setLoading(true);
                setError(null);
                
                if (!validateDates(dateFrom, dateTo)) {
                    return;
                }
                
                // Construir URL con parámetros de filtro
                let url = `${route('reports.measurements')}?dateFrom=${dateFrom}&dateTo=${dateTo}`;
                if (selectedPatientId) {
                    url += `&patientId=${selectedPatientId}`;
                }
                
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }
                
                const data = await response.json();
                if (data.success) {
                    setMeasurementsData(data.data);
                } else {
                    setError('No se pudieron cargar las mediciones');
                }
            } catch (err) {
                console.error('Error fetching measurements:', err);
                setError(err instanceof Error ? err.message : 'Error desconocido');
            } finally {
                setLoading(false);
            }
        };

        if (reportType === 'measurements') {
            fetchMeasurements();
        }
    }, [reportType, dateFrom, dateTo, selectedPatientId]);

    // Obtener datos de resumen estadístico desde el backend (siempre)
    // Las cards muestran datos globales de TODOS los pacientes, no responden al selector
    useEffect(() => {
        const fetchSummary = async () => {
            try {
                if (!validateDates(dateFrom, dateTo)) {
                    setSummaryData(null);
                    return;
                }
                
                // Construir URL sin filtro de paciente (datos globales)
                const url = `${route('reports.summary')}?dateFrom=${dateFrom}&dateTo=${dateTo}`;
                
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }
                
                const data = await response.json();
                if (data.success) {
                    setSummaryData(data.data);
                } else {
                    setSummaryData(null);
                }
            } catch (err) {
                console.error('Error fetching summary:', err);
                setSummaryData(null);
            }
        };

        fetchSummary();
    }, [dateFrom, dateTo]);

    const currentPatientsData = patientsData.length > 0 ? patientsData : [];
    
    // Determinar si hay datos para descargar basado en el tipo de reporte
    const hasData = () => {
        if (dateError) return false;
        if (reportType === 'patients') return currentPatientsData.length > 0;
        return measurementsData.length > 0;
    };
    const handleDownloadExcel = () => {
    let data: any[] = [];
    let fileName = '';
    let sheetName = '';

    if (reportType === 'patients') {
      // Prepare patients data
      data = currentPatientsData.map(patient => {
        const row: any = {};
        if (selectedColumns.includes('name')) row['Nombre del Paciente'] = patient.name;
        if (selectedColumns.includes('tir')) row['TIR (%)'] = patient.tir;
        if (selectedColumns.includes('riskLevel')) row['Nivel de Riesgo'] = patient.riskLevel;
        if (selectedColumns.includes('lastGlucose')) row['Última Glucosa (mg/dL)'] = patient.lastGlucose || 'Sin dato';
        if (selectedColumns.includes('lastPressure')) row['Última PA (mmHg)'] = patient.lastSystolic && patient.lastDiastolic ? `${patient.lastSystolic}/${patient.lastDiastolic}` : 'Sin dato';
        if (selectedColumns.includes('lastReading')) row['Fecha Última Lectura'] = patient.lastReading;
        if (selectedColumns.includes('daysWithoutRecord')) row['Días Sin Registro'] = patient.daysWithoutRecord;
        return row;
      });
      fileName = `Reporte_Pacientes_${new Date().toISOString().split('T')[0]}.xlsx`;
      sheetName = 'Pacientes';
    } else if (reportType === 'measurements') {
      // Prepare measurements data
      data = measurementsData.map(measurement => ({
        'Paciente': measurement.patientName,
        'Fecha': measurement.date,
        'Hora': measurement.time,
        'Tipo de Medición': measurement.type,
        'Valor': measurement.value,
        'Unidad': measurement.unit,
        'Estado': measurement.status
      }));
      fileName = `Reporte_Mediciones_${new Date().toISOString().split('T')[0]}.xlsx`;
      sheetName = 'Mediciones';
    }

        // Create workbook and worksheet
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        // Generate and download file
        XLSX.writeFile(workbook, fileName);
    };

    const toggleColumn = (column: string) => {
        if (selectedColumns.includes(column)) {
        setSelectedColumns(selectedColumns.filter(col => col !== column));
        } else {
        setSelectedColumns([...selectedColumns, column]);
        }
    };

    const availableColumns = [
        { id: 'name', label: 'Nombre del Paciente' },
        { id: 'tir', label: 'TIR (%)' },
        { id: 'riskLevel', label: 'Nivel de Riesgo' },
        { id: 'lastGlucose', label: 'Última Glucosa' },
        { id: 'lastPressure', label: 'Última Presión Arterial' },
        { id: 'lastReading', label: 'Fecha Última Lectura' },
        { id: 'daysWithoutRecord', label: 'Días Sin Registro' }
    ];

    return (
        <AppLayout breadcrumbs={[{ title: "Resumen estadístico", href: "#" }]}> 
            <Head title="Reportes" />
             <div className="pl-8 pr-8">
                {/* Filters and Download Button */}
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700 p-6 mb-6 flex items-end gap-4">
                    <div className="flex-1">
                        <h2 className="text-gray-600 dark:text-white mb-4">Periodo de análisis</h2>
                        {dateError && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                                <div className="text-red-800 text-sm">{dateError}</div>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-600 dark:text-white font-bold mb-2">Fecha inicial</label>
                            <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-500" />
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => handleDateFromChange(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-600 dark:text-white font-bold mb-2">Fecha final</label>
                            <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-500" />
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => handleDateToChange(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            </div>
                        </div>
                        </div>
                    </div>
                    
                    {/* ==========================================
                        SELECTOR DE PACIENTES
                        ========================================== */}
                    <div className="w-64">
                        <label className="block text-gray-600 dark:text-white font-bold mb-2">Seleccionar Paciente</label>
                        <select
                            value={selectedPatientId || ''}
                            onChange={(e) => handlePatientChange(e.target.value ? parseInt(e.target.value) : null)}
                            disabled={patientsListLoading}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                            <option value="">Seleccionar paciente...</option>
                            {patientsList.map((patient) => (
                                <option key={patient.id} value={patient.id}>
                                    {patient.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <button
                    onClick={handleDownloadExcel}
                    disabled={loading || !hasData()}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors whitespace-nowrap ${
                        loading || !hasData()
                            ? 'bg-gray-400 text-white cursor-not-allowed opacity-50'
                            : 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
                    }`}
                    >
                    <FileSpreadsheet className="w-5 h-5" />
                    Descargar Excel
                    </button>
                </div>

                {/* Summary Cards - Siempre visibles */}
                {summaryData && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {/* Total de Pacientes */}
                        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-blue-600 dark:text-blue-300 text-sm font-medium mb-1">Total de Pacientes</p>
                                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{summaryData.totalPatients}</p>
                                </div>
                                <Users className="w-12 h-12 text-blue-300 dark:text-blue-600" />
                            </div>
                        </div>

                        {/* Riesgo Crítico */}
                        <div className="bg-red-50 dark:bg-red-900 rounded-lg p-6 border border-red-200 dark:border-red-700">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-red-700 dark:text-red-300 text-sm font-medium mb-1">Riesgo Crítico</p>
                                    <p className="text-3xl font-bold text-red-900 dark:text-red-100">{summaryData.highRisk}</p>
                                </div>
                                <AlertCircle className="w-12 h-12 text-red-300 dark:text-red-600" />
                            </div>
                        </div>

                        {/* TIR Promedio */}
                        <div className="bg-green-50 dark:bg-green-900 rounded-lg p-6 border border-green-200 dark:border-green-700">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-green-700 dark:text-green-300 text-sm font-medium mb-1">TIR Promedio</p>
                                    <p className="text-3xl font-bold text-green-900 dark:text-green-100">{summaryData.avgTIR}%</p>
                                </div>
                                <Activity className="w-12 h-12 text-green-300 dark:text-green-600" />
                            </div>
                        </div>

                        {/* Sin Registro */}
                        <div className="bg-orange-50 dark:bg-orange-900 rounded-lg p-6 border border-orange-200 dark:border-orange-700">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-orange-700 dark:text-orange-300 text-sm font-medium mb-1">Sin Registro</p>
                                    <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{summaryData.noRecord}</p>
                                </div>
                                <Clock className="w-12 h-12 text-orange-300 dark:text-orange-600" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Report Type Selection */}
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <h2 className="text-gray-900 dark:text-gray-100 mb-4">Tipo de Reporte</h2>
                    <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setReportType('patients')}
                        className={`p-6 rounded-lg border-2 transition-all ${
                        reportType === 'patients'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <Users className={`w-8 h-8 mb-3 mx-auto ${reportType === 'patients' ? 'text-blue-600' : 'text-gray-400'}`} />
                        <div className={reportType === 'patients' ? 'text-blue-600' : 'text-gray-700'}>
                        Lista de Pacientes
                        </div>
                        <p className="text-gray-500 mt-1">
                        Información general de todos los pacientes
                        </p>
                    </button>

                    <button
                        onClick={() => setReportType('measurements')}
                        className={`p-6 rounded-lg border-2 transition-all ${
                        reportType === 'measurements'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <Activity className={`w-8 h-8 mb-3 mx-auto ${reportType === 'measurements' ? 'text-blue-600' : 'text-gray-400'}`} />
                        <div className={reportType === 'measurements' ? 'text-blue-600' : 'text-gray-700'}>
                        Mediciones Detalladas
                        </div>
                        <p className="text-gray-500 mt-1">
                        Historial completo de mediciones
                        </p>
                    </button>
                    </div>
                </div>

                {/* Column Selection (only for patients report) */}
                {reportType === 'patients' && (
                    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <h2 className="text-gray-900 dark:text-gray-100 mb-4">Columnas a Incluir</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {availableColumns.map(column => (
                        <button
                            key={column.id}
                            onClick={() => toggleColumn(column.id)}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                            selectedColumns.includes(column.id)
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            selectedColumns.includes(column.id)
                                ? 'border-blue-600 bg-blue-600'
                                : 'border-gray-300'
                            }`}>
                            {selectedColumns.includes(column.id) && (
                                <CheckSquare className="w-4 h-4 text-white" />
                            )}
                            </div>
                            <span className={selectedColumns.includes(column.id) ? 'text-blue-600' : 'text-gray-700'}>
                            {column.label}
                            </span>
                        </button>
                        ))}
                    </div>
                    </div>
                )}

                {/* Preview Section */}
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <h2 className="text-gray-900 dark:text-gray-100 mb-4">Vista Previa de Datos</h2>
                    
                    {dateError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <div className="text-red-800">Error: {dateError}</div>
                        </div>
                    )}
                    
                    {loading && (
                        <div className="text-center py-8">
                            <div className="text-gray-500">
                                {reportType === 'patients' && 'Cargando pacientes...'}
                                {reportType === 'measurements' && 'Cargando mediciones...'}
                                
                            </div>
                        </div>
                    )}
                    
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <div className="text-red-800">Error: {error}</div>
                        </div>
                    )}
                    
                    {!loading && currentPatientsData.length === 0 && measurementsData.length === 0 && !summaryData && (
                        <div className="text-center py-8">
                            <div className="text-gray-500">{reportType === 'measurements' ? 'No hay mediciones registradas' : 'No hay pacientes asignados'}</div>
                        </div>
                    )}
                    
                    {!loading && (currentPatientsData.length > 0 || measurementsData.length > 0) && (
                    <div className="overflow-x-auto">
                    {reportType === 'patients' && (
                        <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                            {selectedColumns.includes('name') && <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300">Paciente</th>}
                            {selectedColumns.includes('tir') && <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300">TIR (%)</th>}
                            {selectedColumns.includes('riskLevel') && <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300">Riesgo</th>}
                            {selectedColumns.includes('lastGlucose') && <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300">Glucosa</th>}
                            {selectedColumns.includes('lastPressure') && <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300">Presión Arterial</th>}
                            {selectedColumns.includes('lastReading') && <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300">Última Lectura</th>}
                            {selectedColumns.includes('daysWithoutRecord') && <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300">Días Sin Registro</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {currentPatientsData.slice(0, 5).map((patient) => (
                            <tr key={patient.id}>
                                {selectedColumns.includes('name') && <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{patient.name}</td>}
                                {selectedColumns.includes('tir') && <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{patient.tir}%</td>}
                                {selectedColumns.includes('riskLevel') && <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{patient.riskLevel}</td>}
                                {selectedColumns.includes('lastGlucose') && <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{patient.lastGlucose || 'Sin dato'}</td>}
                                {selectedColumns.includes('lastPressure') && <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{patient.lastSystolic && patient.lastDiastolic ? `${patient.lastSystolic}/${patient.lastDiastolic}` : 'Sin dato'}</td>}
                                {selectedColumns.includes('lastReading') && <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{patient.lastReading}</td>}
                                {selectedColumns.includes('daysWithoutRecord') && <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{patient.daysWithoutRecord}</td>}
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    )}
                    {reportType === 'measurements' && (
                        <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                            <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300">Paciente</th>
                            <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300">Fecha</th>
                            <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300">Tipo</th>
                            <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300">Valor</th>
                            <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {measurementsData.slice(0, 5).map((measurement, index) => (
                            <tr key={index}>
                                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{measurement.patientName}</td>
                                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{measurement.date} {measurement.time}</td>
                                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{measurement.type}</td>
                                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{measurement.value} {measurement.unit}</td>
                                <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded ${
                                    measurement.status === 'Crítico' ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' :
                                    measurement.status === 'Elevado' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' :
                                    'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                                }`}>
                                    {measurement.status}
                                </span>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    )}
                    </div>
                    )}
                    <p className="text-gray-500 mt-4">{hasData() ? 'Mostrando primeros 5 registros de vista previa' : ''}</p>
                </div>
                </div>
        </AppLayout>
    );
}