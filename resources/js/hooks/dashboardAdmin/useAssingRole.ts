/**
 * Hook para asignar el rol a un usuario  del sistema
 */
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { Response } from '@/types/dashboard';

export async function assignRol ({userId, roleId, csrfToken}:{userId:number, roleId:number, csrfToken: string}){
    try {
       
        const response = await fetch(route('assignRole', {user: userId}),{
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken

            },
            body: JSON.stringify({ role_id: roleId }),
        });

        if (!response.ok){
            toast.error('Hubo un error al asignar el Rol');
            return;
        }

        const data:Response = await response.json();

        if (data.status){
            toast.success(data.message);
            window.location.reload();
        }else{
            toast.error(data.message);
        }

    }catch (error) {
        toast.error('Error al asignar el rol al usuario ' + String(error));
    }
}
