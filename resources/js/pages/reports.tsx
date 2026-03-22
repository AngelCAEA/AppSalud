import AppLayout from "@/layouts/app-layout";
import { Head, Link, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import  { route }  from "ziggy-js";
import * as XLSX from 'xlsx';
import { Calendar, CheckSquare, Download, FileSpreadsheet, Users, Activity } from "lucide-react";
type ReportType = 'patients' | 'measurements' | 'summary';

const mockPatientsData = [
  {
    id: '1',
    name: 'María González',
    tir: 45,
    riskLevel: 'Riesgo Alto',
    lastGlucose: 280,
    lastSystolic: 142,
    lastDiastolic: 90,
    lastReading: '2024-12-07',
    daysWithoutRecord: 0
  },
  {
    id: '2',
    name: 'Juan Pérez',
    tir: 52,
    riskLevel: 'Riesgo Alto',
    lastGlucose: 195,
    lastSystolic: 165,
    lastDiastolic: 95,
    lastReading: '2024-12-07',
    daysWithoutRecord: 0
  },
  {
    id: '3',
    name: 'Ana Martínez',
    tir: 68,
    riskLevel: 'Inestable',
    lastGlucose: 190,
    lastSystolic: 138,
    lastDiastolic: 88,
    lastReading: '2024-12-06',
    daysWithoutRecord: 0
  },
  {
    id: '4',
    name: 'Carlos Rodríguez',
    tir: 0,
    riskLevel: 'Riesgo Alto',
    lastGlucose: null,
    lastSystolic: null,
    lastDiastolic: null,
    lastReading: '2024-11-30',
    daysWithoutRecord: 7
  },
  {
    id: '5',
    name: 'Laura Sánchez',
    tir: 75,
    riskLevel: 'Inestable',
    lastGlucose: 145,
    lastSystolic: 132,
    lastDiastolic: 85,
    lastReading: '2024-12-05',
    daysWithoutRecord: 0
  },
  {
    id: '6',
    name: 'Pedro Jiménez',
    tir: 0,
    riskLevel: 'Riesgo Alto',
    lastGlucose: null,
    lastSystolic: null,
    lastDiastolic: null,
    lastReading: '2024-12-02',
    daysWithoutRecord: 5
  },
  {
    id: '7',
    name: 'Carmen López',
    tir: 85,
    riskLevel: 'Estable',
    lastGlucose: 122,
    lastSystolic: 125,
    lastDiastolic: 80,
    lastReading: '2024-12-07',
    daysWithoutRecord: 0
  },
  {
    id: '8',
    name: 'Roberto Díaz',
    tir: 82,
    riskLevel: 'Estable',
    lastGlucose: 135,
    lastSystolic: 128,
    lastDiastolic: 82,
    lastReading: '2024-12-07',
    daysWithoutRecord: 0
  },
  {
    id: '9',
    name: 'Isabel Torres',
    tir: 71,
    riskLevel: 'Inestable',
    lastGlucose: 155,
    lastSystolic: 140,
    lastDiastolic: 90,
    lastReading: '2024-12-07',
    daysWithoutRecord: 0
  },
  {
    id: '10',
    name: 'Miguel Ruiz',
    tir: 88,
    riskLevel: 'Estable',
    lastGlucose: 118,
    lastSystolic: 122,
    lastDiastolic: 78,
    lastReading: '2024-12-07',
    daysWithoutRecord: 0
  }
];
const mockMeasurementsData = [
  { patientName: 'María González', date: '2024-12-07', time: '08:30', type: 'Glucosa', value: 280, unit: 'mg/dL', status: 'Crítico' },
  { patientName: 'María González', date: '2024-12-07', time: '14:15', type: 'Presión Arterial', value: '142/90', unit: 'mmHg', status: 'Elevado' },
  { patientName: 'Juan Pérez', date: '2024-12-07', time: '09:00', type: 'Presión Arterial', value: '165/95', unit: 'mmHg', status: 'Crítico' },
  { patientName: 'Ana Martínez', date: '2024-12-06', time: '10:45', type: 'Glucosa', value: 190, unit: 'mg/dL', status: 'Elevado' },
  { patientName: 'Laura Sánchez', date: '2024-12-05', time: '11:20', type: 'Glucosa', value: 145, unit: 'mg/dL', status: 'Normal' },
  { patientName: 'Carmen López', date: '2024-12-07', time: '07:30', type: 'Glucosa', value: 122, unit: 'mg/dL', status: 'Normal' },
  { patientName: 'Roberto Díaz', date: '2024-12-07', time: '08:15', type: 'Presión Arterial', value: '128/82', unit: 'mmHg', status: 'Normal' },
  { patientName: 'Isabel Torres', date: '2024-12-07', time: '09:30', type: 'Glucosa', value: 155, unit: 'mg/dL', status: 'Elevado' },
  { patientName: 'Miguel Ruiz', date: '2024-12-07', time: '07:00', type: 'Glucosa', value: 118, unit: 'mg/dL', status: 'Normal' },
];
export default function Reports(){
    const [reportType, setReportType] = useState<ReportType>('patients');
    const [dateFrom, setDateFrom] = useState('2024-11-07');
    const [dateTo, setDateTo] = useState('2024-12-07');
    const [selectedColumns, setSelectedColumns] = useState<string[]>([
        'name',
        'tir',
        'riskLevel',
        'lastGlucose',
        'lastReading'
    ]);
    const handleDownloadExcel = () => {
    let data: any[] = [];
    let fileName = '';
    let sheetName = '';

    if (reportType === 'patients') {
      // Prepare patients data
      data = mockPatientsData.map(patient => {
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
      data = mockMeasurementsData.map(measurement => ({
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
    } else if (reportType === 'summary') {
      // Prepare summary data
      const totalPatients = mockPatientsData.length;
      const highRisk = mockPatientsData.filter(p => p.riskLevel === 'Riesgo Alto').length;
      const unstable = mockPatientsData.filter(p => p.riskLevel === 'Inestable').length;
      const stable = mockPatientsData.filter(p => p.riskLevel === 'Estable').length;
      const noRecord = mockPatientsData.filter(p => p.daysWithoutRecord > 0).length;
      const avgTIR = (mockPatientsData.reduce((sum, p) => sum + p.tir, 0) / totalPatients).toFixed(1);

    data = [
        { 'Métrica': 'Total de Pacientes', 'Valor': totalPatients },
        { 'Métrica': 'Pacientes Riesgo Alto', 'Valor': highRisk },
        { 'Métrica': 'Pacientes Inestables', 'Valor': unstable },
        { 'Métrica': 'Pacientes Estables', 'Valor': stable },
        { 'Métrica': 'Pacientes Sin Registro', 'Valor': noRecord },
        { 'Métrica': 'TIR Promedio (%)', 'Valor': avgTIR },
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
                    <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 mb-2">Fecha Desde</label>
                        <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
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
                            onChange={(e) => setDateTo(e.target.value)}
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
                    <div className="overflow-x-auto">
                    {reportType === 'patients' && (
                        <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                            {selectedColumns.includes('name') && <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300">Paciente</th>}
                            {selectedColumns.includes('tir') && <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300">TIR (%)</th>}
                            {selectedColumns.includes('riskLevel') && <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300">Riesgo</th>}
                            {selectedColumns.includes('lastGlucose') && <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300">Glucosa</th>}
                            {selectedColumns.includes('lastReading') && <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300">Última Lectura</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {mockPatientsData.slice(0, 5).map((patient) => (
                            <tr key={patient.id}>
                                {selectedColumns.includes('name') && <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{patient.name}</td>}
                                {selectedColumns.includes('tir') && <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{patient.tir}%</td>}
                                {selectedColumns.includes('riskLevel') && <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{patient.riskLevel}</td>}
                                {selectedColumns.includes('lastGlucose') && <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{patient.lastGlucose || 'Sin dato'}</td>}
                                {selectedColumns.includes('lastReading') && <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{patient.lastReading}</td>}
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
                            {mockMeasurementsData.slice(0, 5).map((measurement, index) => (
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
                    {reportType === 'summary' && (
                        <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="text-gray-600 mb-1">Total de Pacientes</div>
                            <div className="text-gray-900">{mockPatientsData.length}</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="text-gray-600 mb-1">Pacientes Riesgo Alto</div>
                            <div className="text-gray-900">{mockPatientsData.filter(p => p.riskLevel === 'Riesgo Alto').length}</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="text-gray-600 mb-1">TIR Promedio</div>
                            <div className="text-gray-900">
                            {(mockPatientsData.reduce((sum, p) => sum + p.tir, 0) / mockPatientsData.length).toFixed(1)}%
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="text-gray-600 mb-1">Pacientes Sin Registro</div>
                            <div className="text-gray-900">{mockPatientsData.filter(p => p.daysWithoutRecord > 0).length}</div>
                        </div>
                        </div>
                    )}
                    </div>
                    <p className="text-gray-500 mt-4">Mostrando primeros 5 registros de vista previa</p>
                </div>

                {/* Download Button */}
                <div className="flex justify-end">
                    <button
                    onClick={handleDownloadExcel}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                    <Download className="w-5 h-5" />
                    Descargar Excel
                    </button>
                </div>
                </div>
        </AppLayout>
    );
}