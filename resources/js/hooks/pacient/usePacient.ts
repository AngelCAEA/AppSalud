import { route } from 'ziggy-js';
import { useEffect, useState } from 'react';
import type {
	ApiHealthRecord,
	PatientProfile,
	PatientProfileResponse,
	Reading,
	ReadingType,
	UsePacientParams,
	UsePacientResult,
} from '@/types/user';

/**
 * Hook principal de la pantalla de paciente.
 * Centraliza la carga del perfil, lectura de registros y guardado de nuevas mediciones.
 */
export function usePacient({ csrfToken, showSuccess, showError, onSaved }: UsePacientParams): UsePacientResult {
	const [readings, setReadings] = useState<Reading[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
	const [profileLoading, setProfileLoading] = useState(true);

	/**
	 * Carga el perfil del paciente autenticado.
	 * Si no existe perfil, muestra mensaje y redirige al inicio.
	 */
	const loadPatientProfile = async () => {
		try {
			setProfileLoading(true);
			const response = await fetch('/patient-profile/current');

			if (!response.ok) {
				if (response.status === 404) {
					showError('No tienes un perfil de paciente configurado. Por favor contacta con tu medico.');
					setTimeout(() => {
						window.location.href = '/';
					}, 2000);
					return;
				}

				throw new Error('Error al cargar el perfil');
			}

			const data = (await response.json()) as PatientProfileResponse;
			setPatientProfile(data.data);
		} catch (error) {
			console.error('Error cargando perfil del paciente:', error);
			showError('Error al cargar tu perfil de salud');
		} finally {
			setProfileLoading(false);
		}
	};

	/**
	 * Carga las lecturas del paciente y mapea la respuesta del backend
	 * al formato interno usado por la UI.
	 */
	const loadReadings = async (showLoading = true) => {
		try {
			if (showLoading) setIsLoading(true);

			const response = await fetch(route('health-records.index'));

			if (!response.ok) {
				throw new Error('Error al cargar los registros');
			}

			const data = (await response.json()) as ApiHealthRecord[];
			const mappedReadings: Reading[] = data.map((record) => ({
				id: record.id.toString(),
				glucose: record.glucose_value ?? null,
				pressure:
					record.systolic !== null && record.diastolic !== null
						? { systolic: record.systolic, diastolic: record.diastolic }
						: null,
				type: record.type === 'glucose' ? 'glucose' : record.type === 'blood_pressure' ? 'pressure' : 'both',
				timestamp: record.recorded_at ?? record.created_at,
				context_id: record.context_id ?? undefined,
			}));

			setReadings(mappedReadings);
		} catch (error) {
			console.error('Error cargando registros:', error);
		} finally {
			if (showLoading) setIsLoading(false);
		}
	};

	/**
	 * Valida y guarda una nueva lectura de glucosa o presion arterial.
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
				await loadReadings(false);
				onSaved?.();
				return;
			}

			showError('Error al guardar el registro. Por favor intenta de nuevo.');
			return;
		} catch (error) {
			showError('Hubo un error al guardar el registro, contacta al administrador: ' + (error instanceof Error ? error.message : ''));
			return;
		}
	};

	useEffect(() => {
		loadPatientProfile();
		loadReadings();
	}, []);

	const latestGlucoseReading = readings.find((r) => r.glucose !== null);
	const latestPressureReading = readings.find((r) => r.pressure !== null);

	return {
		readings,
		patientProfile,
		isLoading,
		profileLoading,
		latestGlucoseReading,
		latestPressureReading,
		loadReadings,
		handleAddReading,
	};
}
