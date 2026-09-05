import { route } from 'ziggy-js';
import { useEffect, useState } from 'react';
import { useRegister } from '@/hooks/pacient/Register';
import type { PatientProfile, Reading } from '@/types/user';
import type {
	ApiHealthRecord,
	PatientProfileResponse,
	UsePacientParams,
	UsePacientResult,
} from '@/types/register';

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

	const { handleAddReading } = useRegister({
		csrfToken,
		patientProfile,
		showSuccess,
		showError,
		onSaved,
		onRefreshReadings: () => loadReadings(false),
	});

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
