import { Head, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { useState, useEffect } from "react";
import { users } from '@/routes';
import { ArrowLeft, Droplet, TrendingUp, Calendar, Heart } from "lucide-react";
import { LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string;
  address : string;
  municipality: string;
  status: boolean;
}
interface PatientMonitoringProps {
    user: User;
    tirPercentage: number;
    minGlucose: string;
    maxGlucose: string;
    estimatedHbA1c: number;
    latestHbA1c: number;
    chartData30Days: ChartData[];
    chartData7Days: ChartData[];
}

type TimeRange = '7days' | '30days';

interface ChartData {
    day:       string;
    glucose:   number;
    systolic:  number;
    diastolic: number;
}

export default function PatientMonitoring({ user, tirPercentage, minGlucose, maxGlucose, estimatedHbA1c, latestHbA1c, chartData7Days, chartData30Days }: PatientMonitoringProps) {

    const [timeRange, setTimeRange] = useState<TimeRange>('30days');

    const [clinicalNotes, setClinicalNotes] = useState(
        'Paciente muestra mejora en control glucémico. Mantener tratamiento actual y monitorear valores de presión arterial.'
    );

    const chartData = timeRange === '7days' ? chartData7Days : chartData30Days;
    const tir30Days = tirPercentage;
    
    return (
        <AppLayout breadcrumbs={[{ title: "Detalles", href: "#" }]}> 
            <Head title="Detalles" />
            <div className="p-4">
                <div className="mb-4">  
                    <button
                        onClick={() => router.visit(users())}
                        className="flex items-center gap-2 mb-6 cursor-pointer"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Volver al panel de pacientes
                    </button>
                    <h1 className="mb-2">{user.name}</h1>
                    <p className="text-gray-600">Vista de Análisis Individual</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                            <div className="text-gray-600">TIR (30 días)</div>
                            <div className="text-gray-500">Tiempo en Rango</div>
                            </div>
                        </div>
                    <div className="text-gray-900 mb-2">{tir30Days}%</div>
                        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div
                            className={`h-full ${
                                tir30Days >= 70
                                ? 'bg-green-500'
                                : tir30Days >= 50
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${tir30Days}%` }}
                            />
                        </div>
                        <div className="mt-2 text-gray-500">
                            Objetivo: {minGlucose} mg/dL {'<'} {maxGlucose} mg/dL
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Droplet className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                            <div className="text-gray-600">HbA1c Estimada</div>
                            <div className="text-gray-500">Hemoglobina Glicosilada</div>
                            </div>
                        </div>
                        <div className="text-gray-900 mb-2">{latestHbA1c}%</div>
                        <div className="mt-2 text-gray-500">
                            Objetivo: {'>'} {estimatedHbA1c}%
                        </div>
                    </div>
                </div>

                {/* Chart Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-gray-900 mb-1">Gráfico de Tendencia Dual</h2>
                        <p className="text-gray-600">Glucosa y Presión Arterial</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                        onClick={() => setTimeRange('7days')}
                        className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                            timeRange === '7days'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        >
                        <Calendar className="w-4 h-4" />
                        7 Días
                        </button>
                        <button
                        onClick={() => setTimeRange('30days')}
                        className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                            timeRange === '30days'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        >
                        <Calendar className="w-4 h-4" />
                        30 Días
                        </button>
                    </div>
                    </div>

                    {/* Dual Chart */}
                    <div className="mb-6">
                    <ResponsiveContainer width="100%" height={350}>
                        <ComposedChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                            dataKey="day" 
                            stroke="#6b7280"
                            style={{ fontSize: '14px' }}
                        />
                        <YAxis 
                            yAxisId="left"
                            stroke="#6b7280"
                            style={{ fontSize: '14px' }}
                            label={{ value: 'Glucosa (mg/dL)', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
                        />
                        <YAxis 
                            yAxisId="right"
                            orientation="right"
                            stroke="#6b7280"
                            style={{ fontSize: '14px' }}
                            label={{ value: 'Presión (mmHg)', angle: 90, position: 'insideRight', style: { fill: '#6b7280' } }}
                        />
                        <Tooltip 
                            contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                        />
                        <Legend />
                        
                        {/* Glucose Line */}
                        <Line 
                            yAxisId="left"
                            type="monotone" 
                            dataKey="glucose" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            dot={{ fill: '#3b82f6', r: 5 }}
                            name="Glucosa (mg/dL)"
                        />
                        
                        {/* Blood Pressure Scatter Points */}
                        <Scatter 
                            yAxisId="right"
                            dataKey="systolic" 
                            fill="#ef4444"
                            shape="circle"
                            name="Sistólica (mmHg)"
                        />
                        <Scatter 
                            yAxisId="right"
                            dataKey="diastolic" 
                            fill="#f97316"
                            shape="circle"
                            name="Diastólica (mmHg)"
                        />
                        </ComposedChart>
                    </ResponsiveContainer>
                    </div>

                    {/* Chart Legend Info */}
                    <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full" />
                        <span className="text-gray-700">Glucosa (Línea)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full" />
                        <span className="text-gray-700">PA Sistólica (Puntos)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full" />
                        <span className="text-gray-700">PA Diastólica (Puntos)</span>
                    </div>
                    </div>
                </div>
                {/* Clinical Notes Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                    <Heart className="w-5 h-5 text-blue-600" />
                    <h2 className="text-gray-900">Notas Clínicas</h2>
                    </div>
                    <textarea
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Escriba sus notas clínicas aquí..."
                    />
                    <div className="mt-4 flex justify-end gap-2">
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        Cancelar
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Guardar Notas
                    </button>
                    </div>
                </div>
            </div>
            
        </AppLayout>
    );
}