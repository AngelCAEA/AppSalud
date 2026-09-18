/**
 * Hook para poder desactivar y activar un usuario en el sistema.
 */
import { route } from 'ziggy-js';
import { useToken } from '@/hooks/use-csrf';
import { toast } from 'sonner';
import { Response } from '@/types/dashboard';

export async function activateUser({ userId }: { userId:number }){
    try {
        const csrfToken = useToken();

        const response = await fetch(route('updateUserStatus', { user: userId }),{
            method: 'PATCH',
            headers: {
                'Content-Type' : 'application/json',
                'X-CSRF-TOKEN' : csrfToken
            },
            body: JSON.stringify({ status: true })
        });

        if (!response.ok){
            toast.error('Hubo un error al Activar/Dsactivar el usuario');
            return;
        }

        const data:Response = await response.json();
        
        if (data.status){
            toast.success(data.message);
            window.location.reload();
        } else {
            toast.error(data.message);
        }

    }catch(error){
        toast.error('Error al activar/Desactivar al usuario ' + String(error));
    }
}