/**
 * Hook que obtiene la lista de usuarios que tiene registrado el sistema para el dashboard de administrador.
 */
import { getUsersResponse } from '@/types/dashboard';
import { User, Role } from '@/types/user';
import { route } from 'ziggy-js';
import { useToken } from '@/hooks/use-csrf'
import { useEffect, useState } from 'react';

export function getUsers(){

    const csrfToken = useToken();
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(''); 

    const handleGetUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch(route('DashboardUsers'), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                'Accept':       'application/json',
            },
        });
            
            if (!response.ok){
                setLoading(false);
                setError('Hubo un error al obtener los datos de los usuarios');
                return;
            }

            const data: getUsersResponse = await response.json(); // ← faltaba esto
            
            if (data.status){
                setUsers(data.users);
                setRoles(data.roles);
            }else{
                setError('Hubo un error al obtener los datos ' + data.message);
            }
        }catch(error){
            setLoading(false);
            setError('Hubo un error al obtener los datos ' + String(error))
        } finally{
            setLoading(false);
        }
    };

    useEffect(() => {
        handleGetUsers();
    }, []);

    return {
        users,
        roles,
        loading,
        error
    }
}