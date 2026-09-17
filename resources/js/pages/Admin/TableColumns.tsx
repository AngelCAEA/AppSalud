/** Columnas de la tabla de usuarios del dashboard administrador */
import { ReactNode } from 'react';
import { User } from '@/types/user';

interface Column {
    label:      string;
    renderCell: (item: User) => ReactNode;
}

export const COLUMNS:Column[] = [
    {
        label: 'Nombre',
        renderCell: ( item: User) => item.name,
    },
    {
        label: 'Correo electrónico',
        renderCell: ( item: User ) => item.email
    },
    {
        label: 'Fecha de registro',
        renderCell: (item: User) => ( 
        <div>
            <span className="text-sm">
                {new Date(item.created_at).toLocaleDateString('es-MX', {
                    year:  'numeric',
                    month: 'short',
                    day:   'numeric',
                })}
            </span>
            <span className="text-xs text-gray-500 block">
                {new Date(item.created_at).toLocaleTimeString('es-MX', {
                    hour:   '2-digit',
                    minute: '2-digit',
                })}
            </span>
        </div>)
    },
    {
        label: 'Estatus',
        renderCell: (item: User) => (
              <span className={item.status ? 'text-green-400' : 'text-red-400'}>
                {item.status ? 'Activo' : 'Inactivo'}
            </span>
        )
    },
    {
        label: 'Rol',
        renderCell: (item: User) => item.role_name || "Sin Rol"
    },
    {
        label: 'Acciones',
        renderCell:(_item: User) => (
            <span>Asignar Rol / Activar (Desactivar)</span>
        )
    }

]