import { User } from '@/types/user';
import { formatReadingDate } from '@/utils/helpers';

export const COLUMNS = [
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
        renderCell: (item: User) => formatReadingDate(item.created_at)
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
        renderCell:() => (
            <span>Asignar Rol</span>
        )
    }

]