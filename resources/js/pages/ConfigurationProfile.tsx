import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {  Save, AlertCircle, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { users } from '@/routes';
import { User } from '@/types/user';

export default function ConfigurationProfile({ user }: { user: User }) {
  const [formData, setFormData] = useState({
    glucose_target_min: user?.patientProfile?.glucose_target_min || 0,
    glucose_target_max: user?.patientProfile?.glucose_target_max || 0,
    blood_pressure_systolic_target: user?.patientProfile?.blood_pressure_systolic_target || 0,
    blood_pressure_diastolic_target: user?.patientProfile?.blood_pressure_diastolic_target || 0,
    type_diabetes: user?.patientProfile?.type_diabetes || '',
  });

  if (!user) {
    return (
      <AppLayout breadcrumbs={[{ title: 'Configuración de Perfil', href: '#' }]}>
        <Head title="Configuración de Perfil" />
        <div className="p-8">
          <div className="text-center py-12 text-gray-500">
            Usuario no encontrado
          </div>
        </div>
      </AppLayout>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['glucose_target_min', 'glucose_target_max', 'blood_pressure_systolic_target', 'blood_pressure_diastolic_target'].includes(name) 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validar que todos los campos estén completos
    if (
      !formData.glucose_target_min ||
      !formData.glucose_target_max ||
      !formData.blood_pressure_systolic_target ||
      !formData.blood_pressure_diastolic_target ||
      !formData.type_diabetes
    ) {
      toast.error('Por favor, completa todos los campos obligatorios');
      return;
    }

    // Validaciones adicionales
    if (formData.glucose_target_min >= formData.glucose_target_max) {
      toast.error('El límite mínimo de glucosa debe ser menor que el máximo');
      return;
    }

    toast.success('Datos guardados correctamente');
    
    // Aquí irá la lógica para guardar los cambios
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'Configuración de Perfil', href: '#' }]}>
      <Head title="Configuración de Perfil" />
      <div className="p-8">
        <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
                <Button
                    onClick={() => router.visit(users())}
                    className="flex items-center gap-1 cursor-pointer bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 p-0"
                    variant="ghost"
                >
                     <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">Metas de salud: {user.name}</h1>
                    <p className="text-gray-600 dark:text-white">Configura los límites y alertas personalizadas del paciente </p>
                </div>
            </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          {/* Configuración de Objetivos de Salud */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                Rangos de glucosa
              </h2>
            </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Inputs de Glucosa */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                      Límite Mínimo (mg/dL)
                    </label>
                    <Input
                      type="number"
                      name="glucose_target_min"
                      value={formData.glucose_target_min}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                      Límite Máximo (mg/dL)
                    </label>
                    <Input
                      type="number"
                      name="glucose_target_max"
                      value={formData.glucose_target_max}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                {/* Barra Visual de Rango */}
                <div className="space-y-4 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium text-gray-700 dark:text-white">Rango Visual</span>
                    <span className="text-lg font-semibold text-blue-600">
                      {formData.glucose_target_min} - {formData.glucose_target_max} mg/dL
                    </span>
                  </div>

                  {/* Barra de Rango */}
                  <div className="space-y-2">
                    <div className="relative h-16 rounded-lg overflow-hidden border border-gray-300">
                      {/* Fondo dividido en tres secciones */}
                      <div className="absolute inset-0 flex">
                        <div className="flex-1 bg-red-100" style={{ flex: formData.glucose_target_min / 300 }}></div>
                        <div className="flex-1 bg-green-100" style={{ flex: (formData.glucose_target_max - formData.glucose_target_min) / 300 }}></div>
                        <div className="flex-1 bg-red-100" style={{ flex: (300 - formData.glucose_target_max) / 300 }}></div>
                      </div>

                      {/* Líneas verticales de los límites */}
                      <div 
                        className="absolute top-0 bottom-0 w-1 bg-green-600"
                        style={{ left: `${(formData.glucose_target_min / 300) * 100}%` }}
                      ></div>
                      <div 
                        className="absolute top-0 bottom-0 w-1 bg-green-600"
                        style={{ left: `${(formData.glucose_target_max / 300) * 100}%` }}
                      ></div>

                      {/* Etiquetas */}
                      <div className="absolute inset-0 flex items-center justify-between px-4 text-xs sm:text-sm font-medium">
                        <span className="text-red-700">Bajo</span>
                        <span className="text-green-700">Rango Óptimo</span>
                        <span className="text-red-700">Alto</span>
                      </div>
                    </div>

                    {/* Escala de números */}
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 px-1">
                      <span>40</span>
                      <span>100</span>
                      <span>150</span>
                      <span>200</span>
                      <span>300</span>
                    </div>
                  </div>
                </div>

                {/* Presión Arterial */}
                <hr />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Límites de presión arterial</h3>
                  <p className="text-gray-600 dark:text-white">Establece los valores máximos antes de generar alertas</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                      PA Sistólica (mmHg)
                    </label>
                    <Input
                      type="number"
                      name="blood_pressure_systolic_target"
                      value={formData.blood_pressure_systolic_target}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                      PA Diastólica (mmHg)
                    </label>
                    <Input
                      type="number"
                      name="blood_pressure_diastolic_target"
                      value={formData.blood_pressure_diastolic_target}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
               
                {/* Leyenda informativa */}
                <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-100 dark:border-blue-700">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Los valores por encima de estos límites generarán alertas automáticas
                  </p>
                </div>
                 <hr />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Información general</h3>
                  <p className="text-gray-600 dark:text-white"> Datos adicionales del perfil clínico</p>
                </div>
                 <div>
                   {/* Tipo de Diabetes */}
                <div className="space-y-2">
                  <Label htmlFor="diabetesType" className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                    Tipo de Diabetes
                  </Label>
                  <Select value={formData.type_diabetes} onValueChange={(value) => setFormData(prev => ({ ...prev, type_diabetes: value }))}>
                    <SelectTrigger className="rounded-lg border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                      <SelectItem value="Tipo 1" className="cursor-pointer rounded-md">
                        Tipo 1
                      </SelectItem>
                      <SelectItem value="Tipo 2" className="cursor-pointer rounded-md">
                        Tipo 2
                      </SelectItem>
                      <SelectItem value="Gestacional" className="cursor-pointer rounded-md">
                        Gestacional
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                </div>
                {/* Botón de Guardar */}
                <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 text-base cursor-pointer"
                    >
                        <Save className="w-5 h-5 mr-2" />
                        Guardar 
                    </Button>
                </div>
                
              </form>
           
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
