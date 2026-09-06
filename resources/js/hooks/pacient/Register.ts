import { route } from 'ziggy-js';
import { useEffect, useState } from 'react';
import type {
	MeasurementContext,
	ReadingType,
	UseRegisterModalParams,
	UseRegisterModalResult,
	UseRegisterParams,
	UseRegisterResult,
} from '@/types/register';

const FALLBACK_MEASUREMENT_CONTEXTS: MeasurementContext[] = [
	{
		id: 1,
		slug: 'fasting',
		display_name: 'En Ayunas',
		description: 'Medicion realizada despues de 8-12 horas sin comer',
	},
	{
		id: 2,
		slug: 'post_meal',
		display_name: 'Despues de Comer',
		description: 'Medicion realizada 2 horas despues de la comida',
	},
	{
		id: 3,
		slug: 'before_bed',
		display_name: 'Antes de Dormir',
		description: 'Medicion realizada antes de acostarse',
	},
	{
		id: 4,
		slug: 'random',
		display_name: 'Aleatorio',
		description: 'Medicion realizada en cualquier momento del dia',
	},
];

/**
 * Hook de registro de mediciones del paciente.
 * Encapsula validaciones clinicas, armado del payload y guardado remoto.
 */
export function useRegister({
	csrfToken,
	patientProfile,
	showSuccess,
	showError,
	onSaved,
	onRefreshReadings,
}: UseRegisterParams): UseRegisterResult {
	/**
	 * Valida limites del perfil y guarda una nueva lectura de glucosa/presion.
	 */
	const handleAddReading = async (
		type: ReadingType,
		glucose: number | null,
		systolic: number | null,
		diastolic: number | null,
		contextId?: number,
	) => {
		if (patientProfile) {
			if (glucose !== null) {
				if (glucose < patientProfile.glucose_min) {
					showError(`Glucosa baja: ${glucose} mg/dL (minimo recomendado: ${patientProfile.glucose_min})`);
				} else if (glucose > patientProfile.glucose_max) {
					showError(`Glucosa alta: ${glucose} mg/dL (maximo recomendado: ${patientProfile.glucose_max})`);
				}
			}

			if (systolic !== null && systolic > patientProfile.systolic_max) {
				showError(`Presion sistolica elevada: ${systolic} mmHg (maximo recomendado: ${patientProfile.systolic_max})`);
			}

			if (diastolic !== null && diastolic > patientProfile.diastolic_max) {
				showError(`Presion diastolica elevada: ${diastolic} mmHg (maximo recomendado: ${patientProfile.diastolic_max})`);
			}
		}

		try {
			const payload: {
				type: ReadingType;
				context_id: number | null;
				glucose_value?: number;
				systolic?: number;
				diastolic?: number;
			} = {
				type,
				context_id: contextId ?? null,
			};

			if (glucose !== null) payload.glucose_value = glucose;
			if (systolic !== null) payload.systolic = systolic;
			if (diastolic !== null) payload.diastolic = diastolic;

			const response = await fetch(route('health-records.store'), {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
					'X-CSRF-TOKEN': csrfToken,
				},
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				try {
					const errorData = (await response.json()) as { message?: string };
					showError(errorData.message ?? 'Error al guardar el registro');
				} catch {
					showError('Error al guardar el registro. Intenta recargar la pagina.');
				}
				return;
			}

			const data = (await response.json()) as { success?: boolean };

			if (data.success) {
				showSuccess('Registro guardado exitosamente');
				await onRefreshReadings();
				onSaved?.();
				return;
			}

			showError('Error al guardar el registro. Por favor intenta de nuevo.');
		} catch (error) {
			showError('Hubo un error al guardar el registro, contacta al administrador: ' + (error instanceof Error ? error.message : ''));
		}
	};

	return { handleAddReading };
}

/**
 * Hook que encapsula la logica del modal de registro de mediciones.
 * Gestiona estados del formulario, carga de contextos y envio de datos.
 */
export function useRegisterModal({ isOpen, onClose, onSubmit }: UseRegisterModalParams): UseRegisterModalResult {
	const [step, setStep] = useState<'select' | 'glucose' | 'pressure'>('select');
	const [glucose, setGlucose] = useState('');
	const [selectedContextId, setSelectedContextId] = useState<number | null>(null);
	const [systolic, setSystolic] = useState('');
	const [diastolic, setDiastolic] = useState('');
	const [measurementContexts, setMeasurementContexts] = useState<MeasurementContext[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const resetForm = () => {
		setStep('select');
		setGlucose('');
		setSelectedContextId(null);
		setSystolic('');
		setDiastolic('');
	};

	/**
	 * Carga contextos de medicion y aplica fallback local si la API falla.
	 */
	const fetchMeasurementContexts = async () => {
		try {
			setIsLoading(true);
			const response = await fetch(route('measurement-contexts.index'));
			if (!response.ok) throw new Error(`Error: ${response.status}`);
			const data = (await response.json()) as MeasurementContext[];
			setMeasurementContexts(data);
		} catch (error) {
			console.error('Error loading measurement contexts:', error);
			setMeasurementContexts(FALLBACK_MEASUREMENT_CONTEXTS);
		} finally {
			setIsLoading(false);
		}
	};

	const handleClose = () => {
		resetForm();
		onClose();
	};

	const handleBack = () => {
		setStep('select');
	};

	const handleGlucoseSubmit = async () => {
		const glucoseValue = Number.parseInt(glucose, 10);
		if (!Number.isNaN(glucoseValue) && selectedContextId) {
			try {
				await onSubmit('glucose', glucoseValue, null, null, selectedContextId);
			} catch (error) {
				console.error('Error al guardar glucosa:', error);
			}
		}
	};

	const handlePressureSubmit = async () => {
		const systolicValue = Number.parseInt(systolic, 10);
		const diastolicValue = Number.parseInt(diastolic, 10);

		if (!Number.isNaN(systolicValue) && !Number.isNaN(diastolicValue) && selectedContextId) {
			try {
				await onSubmit('blood_pressure', null, systolicValue, diastolicValue, selectedContextId);
			} catch (error) {
				console.error('Error al guardar presion:', error);
			}
		}
	};

	useEffect(() => {
		if (isOpen) {
			fetchMeasurementContexts();
			resetForm();
		}
	}, [isOpen]);

	return {
		step,
		glucose,
		selectedContextId,
		systolic,
		diastolic,
		measurementContexts,
		isLoading,
		setStep,
		setGlucose,
		setSelectedContextId,
		setSystolic,
		setDiastolic,
		handleClose,
		handleBack,
		handleGlucoseSubmit,
		handlePressureSubmit,
	};
}
