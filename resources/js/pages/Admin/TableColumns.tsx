/** Columnas de la tabla de usuarios del dashboard administrador */
import { ReactNode } from 'react';
import { User, Role } from '@/types/user';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import { toggleUserStatus } from '@/hooks/dashboardAdmin/useActiveUser';
import { assignRol } from '@/hooks/dashboardAdmin/useAssingRole';

interface Column {
    label:      string;
    renderCell: (item: User, csrfToken: string, roles: Role[]) => ReactNode;
}

export const COLUMNS: Column[] = [
    {
        label: 'Nombre',
        renderCell: (item: User) => <span>{item.name}</span>,
    },
    {
        label: 'Correo electrónico',
        renderCell: (item: User) => <span>{item.email}</span>,
    },
    {
        label: 'Fecha de registro',
        renderCell: (item: User) => (
        <div>
            <span>
                {new Date(item.created_at).toLocaleDateString('es-MX', {
                    year:  'numeric',
                    month: 'short',
                    day:   'numeric',
                })}
            </span>
            <br/>
            <span>
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
            <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border ${
                    item.status
                        ? 'bg-[rgba(34,197,94,0.1)] text-[#4ade80] border-[rgba(34,197,94,0.2)]'
                        : 'bg-[rgba(239,68,68,0.1)] text-[#f87171] border-[rgba(239,68,68,0.2)]'
                }`}
            >
                {item.status ? 'Activo' : 'Inactivo'}
            </span>
        )
    },
    {
        label: 'Rol',
        renderCell: (item: User) => <span className="text-[#64748b]">{item.role_name || 'Sin Rol'}</span>
    },
    {
        label: 'Acciones',
        renderCell: (item: User, csrfToken: string, roles:Role[]) => (
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    title={item.status ? 'Desactivar usuario' : 'Activar usuario'}
                    onClick={() => toggleUserStatus({ userId: item.id, status: !item.status, csrfToken })}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                        item.status
                            ? 'bg-[rgba(239,68,68,0.1)] hover:bg-[rgba(239,68,68,0.2)]'
                            : 'bg-[rgba(34,197,94,0.1)] hover:bg-[rgba(34,197,94,0.2)]'
                    }`}
                >
                    {item.status ? (
                        <ToggleRight className="w-4 h-4 text-[#f87171]" />
                    ) : (
                        <ToggleLeft className="w-4 h-4 text-[#4ade80]" />
                    )}
                </button>
                <select 
                    value={item.role_id || ''}
                >
                    <option value="">Sin asignar un rol</option>
                    {roles.map((rol)=>(
                        <option key={rol.id} value={rol.id}>
                            {rol.name}
                        </option>
                    ))}
                </select>
            </div>
        )
    }

]
