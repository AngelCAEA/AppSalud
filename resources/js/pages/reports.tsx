import AppLayout from "@/layouts/app-layout";
import { Head, Link, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import  { route }  from "ziggy-js";
import * as XLSX from 'xlsx';
import { Calendar, CheckSquare, Download, FileSpreadsheet, Users, Activity } from "lucide-react";
type ReportType = 'patients' | 'measurements' | 'summary';

export default function Reports(){
    const [reportType, setReportType] = useState<ReportType>('patients');
    const [dateFrom, setDateFrom] = useState('2026-03-18');
    const [dateTo, setDateTo] = useState('2026-04-18');
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

    // Validar que la fecha final no sea menor que la inicial
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

    // Obtener los pacientes asignados desde el backend
    useEffect(() => {
        const fetchPatients = async () => {
            try {
                setLoading(true);
                setError(null);
                
                if (!validateDates(dateFrom, dateTo)) {
                    return;
                }
                
                const response = await fetch(route('reports.patients'));
                
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
    }, [reportType, dateFrom, dateTo]);

    // Obtener las mediciones desde el backend cuando el tipo sea measurements
    useEffect(() => {
        const fetchMeasurements = async () => {
            try {
                setLoading(true);
                setError(null);
                
                if (!validateDates(dateFrom, dateTo)) {
                    return;
                }
                
                const url = `${route('reports.measurements')}?dateFrom=${dateFrom}&dateTo=${dateTo}`;
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
    }, [reportType, dateFrom, dateTo]);

    // Obtener datos de resumen estadístico desde el backend
    useEffect(() => {
        const fetchSummary = async () => {
            try {
                setLoading(true);
                setError(null);
                
                if (!validateDates(dateFrom, dateTo)) {
                    return;
                }
                
                const url = `${route('reports.summary')}?dateFrom=${dateFrom}&dateTo=${dateTo}`;
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }
                
                const data = await response.json();
                if (data.success) {
                    setSummaryData(data.data);
                } else {
                    setError('No se pudieron cargar los datos de resumen');
                }
            } catch (err) {
                console.error('Error fetching summary:', err);
                setError(err instanceof Error ? err.message : 'Error desconocido');
            } finally {
                setLoading(false);
            }
        };

        if (reportType === 'summary') {
            fetchSummary();
        }
    }, [reportType, dateFrom, dateTo]);

    const currentPatientsData = patientsData.length > 0 ? patientsData : [];
    
    // Determinar si hay datos para descargar basado en el tipo de reporte
    const hasData = () => {
        if (dateError) return false;
        if (reportType === 'patients') return currentPatientsData.length > 0;
        if (reportType === 'measurements') return measurementsData.length > 0;
        return summaryData && summaryData.totalPatients > 0; // para summary
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
    } else if (reportType === 'summary' && summaryData) {
      // Prepare summary data from backend
      data = [
        { 'Métrica': 'Total de Pacientes', 'Valor': summaryData.totalPatients },
        { 'Métrica': 'Pacientes Riesgo Alto', 'Valor': summaryData.highRisk },
        { 'Métrica': 'Pacientes Inestables', 'Valor': summaryData.unstable },
        { 'Métrica': 'Pacientes Estables', 'Valor': summaryData.stable },
        { 'Métrica': 'Pacientes Sin Registro', 'Valor': summaryData.noRecord },
        { 'Métrica': 'TIR Promedio (%)', 'Valor': summaryData.avgTIR },
        { 'Métrica': 'Fecha de Reporte', 'Valor': new Date().toLocaleDateString('es-ES') }
      ];
      fileName = `Reporte_Resumen_${new Date().toISOString().split('T')[0]}.xlsx`;
      sheetName = 'Resumen';
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
        <AppLayout breadcrumbs={[{ title: "Reportes", href: "#" }]}> 
            <Head title="Reportes" />
             <div className="p-8">
                <div className="mb-8">
                    <h1 className="text-gray-900 dark:text-gray-100 mb-2">Reportes y Exportación</h1>
                    <p className="text-gray-600 dark:text-gray-300">Descarga datos de pacientes y mediciones en formato Excel</p>
                </div>

                {/* Report Type Selection */}
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <h2 className="text-gray-900 dark:text-gray-100 mb-4">Tipo de Reporte</h2>
                    <div className="grid grid-cols-3 gap-4">
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

                    <button
                        onClick={() => setReportType('summary')}
                        className={`p-6 rounded-lg border-2 transition-all ${
                        reportType === 'summary'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <FileSpreadsheet className={`w-8 h-8 mb-3 mx-auto ${reportType === 'summary' ? 'text-blue-600' : 'text-gray-400'}`} />
                        <div className={reportType === 'summary' ? 'text-blue-600' : 'text-gray-700'}>
                        Resumen Estadístico
                        </div>
                        <p className="text-gray-500 mt-1">
                        Métricas y estadísticas generales
                        </p>
                    </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <h2 className="text-gray-900 dark:text-gray-100 mb-4">Filtros de Fecha</h2>
                    {dateError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                            <div className="text-red-800 text-sm">{dateError}</div>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 mb-2">Fecha Desde</label>
                        <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => handleDateFromChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Fecha Hasta</label>
                        <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                                {reportType === 'summary' && 'Cargando resumen...'}
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
                            <div className="text-gray-500">{reportType === 'measurements' ? 'No hay mediciones registradas' : reportType === 'summary' ? 'No hay datos de resumen' : 'No hay pacientes asignados'}</div>
                        </div>
                    )}
                    
                    {!loading && (currentPatientsData.length > 0 || measurementsData.length > 0 || (reportType === 'summary' && summaryData)) && (
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
                    {reportType === 'summary' && summaryData && (
                        <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="text-gray-600 mb-1">Total de Pacientes</div>
                            <div className="text-gray-900">{summaryData.totalPatients}</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="text-gray-600 mb-1">Pacientes Riesgo Alto</div>
                            <div className="text-gray-900">{summaryData.highRisk}</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="text-gray-600 mb-1">Pacientes Inestables</div>
                            <div className="text-gray-900">{summaryData.unstable}</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="text-gray-600 mb-1">Pacientes Estables</div>
                            <div className="text-gray-900">{summaryData.stable}</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="text-gray-600 mb-1">TIR Promedio</div>
                            <div className="text-gray-900">{summaryData.avgTIR}%</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="text-gray-600 mb-1">Pacientes Sin Registro</div>
                            <div className="text-gray-900">{summaryData.noRecord}</div>
                        </div>
                        </div>
                    )}
                    </div>
                    )}
                    <p className="text-gray-500 mt-4">{hasData() ? 'Mostrando primeros 5 registros de vista previa' : ''}</p>
                </div>

                {/* Download Button */}
                <div className="flex justify-end">
                    <button
                    onClick={handleDownloadExcel}
                    disabled={loading || !hasData()}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                        loading || !hasData()
                            ? 'bg-gray-400 text-white cursor-not-allowed opacity-50'
                            : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                    >
                    <Download className="w-5 h-5" />
                    Descargar Excel
                    </button>
                </div>
                </div>
        </AppLayout>
    );
}