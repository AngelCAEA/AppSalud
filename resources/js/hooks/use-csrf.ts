/** Hook para obtener el token de la autentificacion del usuario logueado. */
import { usePage } from '@inertiajs/react';

export function useToken(): string {
    const { props } = usePage();

    return (
        (props.csrf_token as string) ||
        document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
        ''
    );
}
