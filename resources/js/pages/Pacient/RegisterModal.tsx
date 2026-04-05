import { useState, useEffect } from 'react';
import { X, Droplet, Heart, Save, ArrowLeft } from 'lucide-react';

interface MeasurementContext {
  id: number;
  slug: string;
  display_name: string;
  description: string;
}

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (type: 'glucose' | 'blood_pressure', glucose: number | null, systolic: number | null, diastolic: number | null, contextId?: number) => Promise<void>;
}

type RegistrationStep = 'select' | 'glucose' | 'pressure';

interface ContextButtonProps {
  context: MeasurementContext;
  isSelected: boolean;
  onSelect: () => void;
  color: 'green' | 'red';
}

// Componente para los botones de contexto con popover de descripción
function ContextButton({ context, isSelected, onSelect, color }: ContextButtonProps) {
  const [showPopover, setShowPopover] = useState(false);

  const bgColor = color === 'green' ? 'bg-green-600' : 'bg-red-600';

  return (
    <div className="relative group">
      <button
        type="button"
        onMouseEnter={() => setShowPopover(true)}
        onMouseLeave={() => setShowPopover(false)}
        onClick={onSelect}
        className={`w-full py-3 px-3 rounded-xl transition-all text-sm cursor-pointer ${
          isSelected
            ? `${bgColor} text-white shadow-lg scale-105`
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
      >
        {context.display_name}
      </button>
      
      {/* Popover */}
      {showPopover && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 w-48">
          <div className="bg-gray-900 dark:bg-gray-950 text-white text-xs rounded-lg py-2 px-3 shadow-lg">
            {context.description}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-950"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function RegisterModal({ isOpen, onClose, onSubmit }: RegisterModalProps) {
  const [step, setStep] = useState<RegistrationStep>('select');
  const [glucose, setGlucose] = useState('');
  const [selectedContextId, setSelectedContextId] = useState<number | null>(null);
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [measurementContexts, setMeasurementContexts] = useState<MeasurementContext[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchMeasurementContexts();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Función para cargar los contextos de medición desde la API
  const fetchMeasurementContexts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/measurement-contexts');
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setMeasurementContexts(data);
    } catch (error) {
      console.error('Error loading measurement contexts:', error);
      // Fallback: usar datos de ejemplo si la API falla
      setMeasurementContexts([
        {
          id: 1,
          slug: 'fasting',
          display_name: 'En Ayunas',
          description: 'Medición realizada después de 8-12 horas sin comer'
        },
        {
          id: 2,
          slug: 'post_meal',
          display_name: 'Después de Comer',
          description: 'Medición realizada 2 horas después de la comida'
        },
        {
          id: 3,
          slug: 'before_bed',
          display_name: 'Antes de Dormir',
          description: 'Medición realizada antes de acostarse'
        },
        {
          id: 4,
          slug: 'random',
          display_name: 'Aleatorio',
          description: 'Medición realizada en cualquier momento del día'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep('select');
    setGlucose('');
    setSelectedContextId(null);
    setSystolic('');
    setDiastolic('');
    onClose();
  };

  const handleBack = () => {
    setStep('select');
  };

  // Función para manejar el envío del formulario de glucosa
  const handleGlucoseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const glucoseValue = parseInt(glucose);
    if (glucoseValue && selectedContextId) {
      await onSubmit('glucose', glucoseValue, null, null, selectedContextId);
      setGlucose('');
      setSelectedContextId(null);
      handleClose();
    }
  };

  // Función para manejar el envío del formulario de presión arterial
  const handlePressureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const systolicValue = parseInt(systolic);
    const diastolicValue = parseInt(diastolic);
    if (systolicValue && diastolicValue && selectedContextId) {
      await onSubmit('blood_pressure', null, systolicValue, diastolicValue, selectedContextId);
      setSystolic('');
      setDiastolic('');
      setSelectedContextId(null);
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-gray-800 w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300 sm:animate-in sm:zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          {step !== 'select' && (
            <button
              onClick={handleBack}
              className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400 cursor-pointer" />
            </button>
          )}
          <h2 className={`text-blue-600 dark:text-blue-400 ${step === 'select' ? '' : 'ml-auto mr-auto'}`}>
            {step === 'select' && 'Registrar Medición'}
            {step === 'glucose' && 'Glucosa'}
            {step === 'pressure' && 'Presión Arterial'}
          </h2>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400 cursor-pointer" />
          </button>
        </div>

        {/* Selection Step */}
        {step === 'select' && (
          <div className="p-6 space-y-4">
            <p className="text-black dark:text-white text-center mb-6">¿Qué deseas registrar?</p>
            
            <button
              onClick={() => setStep('glucose')}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-2xl p-6 transition-all active:scale-98 shadow-lg hover:shadow-xl"
            >
              <Droplet className="w-12 h-12 mx-auto mb-3" strokeWidth={2.5} />
              <div className="text-2xl mb-1">Registrar Glucosa</div>
              <div className="text-sm opacity-90">Medición de azúcar en sangre</div>
            </button>

            <button
              onClick={() => setStep('pressure')}
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-2xl p-6 transition-all active:scale-98 shadow-lg hover:shadow-xl"
            >
              <Heart className="w-12 h-12 mx-auto mb-3" strokeWidth={2.5} />
              <div className="text-2xl mb-1">Registrar Presión</div>
              <div className="text-sm opacity-90">Medición arterial</div>
            </button>
          </div>
        )}

        {/* Glucose Form */}
        {step === 'glucose' && (
          <form onSubmit={handleGlucoseSubmit} className="p-6 space-y-6">
            <div>
              <label className="text-black dark:text-white mb-3 block">Nivel de Glucosa</label>
              <div className="relative">
                <input
                  type="number"
                  value={glucose}
                  onChange={(e) => setGlucose(e.target.value)}
                  placeholder="110"
                  required
                  autoFocus
                  className="w-full px-6 py-6 text-5xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-2xl focus:border-green-500 focus:outline-none transition-colors text-center"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                />
                <span className="absolute right-6 bottom-6 text-xl text-gray-400 dark:text-gray-500">
                  mg/dL
                </span>
              </div>
            </div>

            {/* Context Chips */}
            <div>
              <label className="text-gray-700 mb-3 block text-sm">Momento de medición</label>
              <div className="grid grid-cols-2 gap-3">
                {isLoading ? (
                  <p className="text-gray-500 text-sm col-span-2">Cargando contextos...</p>
                ) : (
                  measurementContexts.map((context) => (
                    <ContextButton
                      key={context.id}
                      context={context}
                      isSelected={selectedContextId === context.id}
                      onSelect={() => setSelectedContextId(context.id)}
                      color="green"
                    />
                  ))
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!selectedContextId}
              className={`w-full py-5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-98 ${
                selectedContextId
                  ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Save className="w-5 h-5" />
              <span className="text-lg">Guardar Glucosa</span>
            </button>
          </form>
        )}

        {/* Pressure Form */}
        {step === 'pressure' && (
          <form onSubmit={handlePressureSubmit} className="p-6 space-y-6">
            <div>
              <label className="text-black dark:text-white mb-3 block">Presión Arterial</label>
              <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={systolic}
                    onChange={(e) => setSystolic(e.target.value)}
                    placeholder="120"
                    required
                    autoFocus
                    className="w-full px-4 py-5 text-4xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-2xl focus:border-red-500 focus:outline-none transition-colors text-center"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400 text-center block mt-2">
                    Sistólica
                  </span>
                </div>
                <div className="text-3xl text-gray-300 dark:text-gray-600 pb-6">/</div>
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={diastolic}
                    onChange={(e) => setDiastolic(e.target.value)}
                    placeholder="80"
                    required
                    className="w-full px-4 py-5 text-4xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-2xl focus:border-red-500 focus:outline-none transition-colors text-center"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400 text-center block mt-2">
                    Diastólica
                  </span>
                </div>
              </div>
              <div className="text-center mt-2 text-gray-400 dark:text-gray-500">mmHg</div>
            </div>

            {/* Context Chips */}
            <div>
              <label className="text-black dark:text-white mb-3 block text-sm">Momento de medición</label>
              <div className="grid grid-cols-2 gap-3">
                {isLoading ? (
                  <p className="text-black dark:text-white text-sm col-span-2">Cargando contextos...</p>
                ) : (
                  measurementContexts.map((context) => (
                    <ContextButton
                      key={context.id}
                      context={context}
                      isSelected={selectedContextId === context.id}
                      onSelect={() => setSelectedContextId(context.id)}
                      color="red"
                    />
                  ))
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!selectedContextId}
              className={`w-full py-5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-98 ${
                selectedContextId
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Save className="w-5 h-5" />
              <span className="text-lg">Guardar Presión</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}