import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { UserX, UserMinus, Clock, MoreVertical, Power } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { updateUserStatus, assignRole } from '@/routes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

type User = {
  id: number;
  name: string;
  email: string;
  created_at: string;
  status: boolean | null;
  role_id: number | null;
  role_name: string | null;
};

type Role = {
  id: number;
  name: string;
};

type ApiResponse = {
    status: boolean;
    message: string;
};

export default function Dashboard() {
    const page = usePage();
    const csrfToken = (page.props.csrf_token as string) || 
                      document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);

    // Obtener usuarios y roles de la API
    useEffect(() => {
        fetch('/dashboard/users')
            .then(res => res.json())
            .then(data => {
                setUsers(data.users);
                setRoles(data.roles);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching users:', err);
                setLoading(false);
            });
    }, []);

    // Calcular métricas
    const usersWithoutRole = users.filter((u) => u.role_id === null).length;
    const inactiveAccounts = users.filter((u) => !u.status).length;
    
    // Usuarios registrados en los últimos 7 días
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentRegistrations = users.filter((u) => {
        const regDate = new Date(u.created_at);
        return regDate >= sevenDaysAgo;
    }).length;

    const handleAssignRole = (userId: number, roleId: number) => {
        fetch(`/dashboard/users/${userId}/role`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                'Accept': 'application/json',
            },
            body: JSON.stringify({ role_id: roleId }),
        })
            .then((res) => res.json())
            .then((data: ApiResponse) => {
                if (data.status) {
                    toast.success(data.message);
                    window.location.reload(); // Recargar para actualizar la tabla con el nuevo rol
                } else {
                    toast.error(data.message);
                }
            })
            .catch((err) => {
                console.error('Error:', err);
                toast.error('Error al asignar rol');
            });
    };

    const handleActivateUser = (userId: number) => {
        fetch(`/dashboard/users/${userId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                'Accept': 'application/json',
            },
            body: JSON.stringify({ status: true }),
        })
            .then((res) => res.json())
            .then((data: ApiResponse) => {
                if (data.status) {
                    toast.success(data.message);
                    window.location.reload(); // Recargar para actualizar el estado del usuario
                } else {
                    toast.error(data.message);
                }
            })
            .catch((err) => {
                console.error('Error:', err);
                toast.error('Error al activar usuario');
            });
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getStatusDisplay = (status: boolean | null) => {
        if (status === null) return { text: 'Pendiente', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' };
        if (status === false) return { text: 'Inactivo', color: 'bg-gray-100 text-gray-600 border-gray-200' };
        return { text: 'Activo', color: 'bg-green-50 text-green-700 border-green-200' };
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', { timeZone: 'America/Mexico_City', day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="mb-8">
                    <h1 className="text-black dark:text-white mb-2">Dashboard de Administrador</h1>
                    <p className="text-gray-500">Gestiona usuarios y supervisa la actividad del sistema</p>
                </div>
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative aspect-video overflow-hidden rounded-xl">
                       {/* Usuarios sin Rol */}
                        <Card className="rounded-xl border-gray-200">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-500 mb-2">Usuarios sin Rol</p>
                                <p className="text-4xl font-semibold text-black dark:text-white">{usersWithoutRole}</p>
                            </div>
                            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                                <UserX className="w-6 h-6 text-red-500" />
                            </div>
                            </div>
                            <p className="text-xs text-red-600 mt-4">Requieren asignación de rol</p>
                        </CardContent>
                        </Card>
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl">
                        {/* Cuentas Inactivas */}
                        <Card className="rounded-xl border-gray-200">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-500 mb-2">Cuentas Inactivas</p>
                                <p className="text-4xl font-semibold text-black dark:text-white">{inactiveAccounts}</p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                                <UserMinus className="w-6 h-6 text-yellow-600" />
                            </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-4">Usuarios pendientes o desactivados</p>
                        </CardContent>
                        </Card>
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl">
                       {/* Registros Recientes */}
                        <Card className="rounded-xl border-gray-200">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-500 mb-2">Registros Recientes</p>
                                <p className="text-4xl font-semibold text-black dark:text-white">{recentRegistrations}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                                <Clock className="w-6 h-6 text-blue-600" />
                            </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-4">Últimos 7 días</p>
                        </CardContent>
                        </Card>
                    </div>
                </div>
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    {/* Tabla de Gestión de Usuarios */}
                    <Card className="rounded-xl border-gray-200">
                        <CardContent className="p-6">
                        <div className="mb-6">
                            <h2 className="text-black dark:text-white">Gestión de Usuarios</h2>
                            <p className="text-sm text-gray-500 mt-1">Administra roles y permisos de usuarios</p>
                        </div>

                        <div className="rounded-lg border border-gray-200 overflow-hidden">
                            <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                <TableHead className="text-gray-600">Usuario</TableHead>
                                <TableHead className="text-gray-600">Email</TableHead>
                                <TableHead className="text-gray-600">Fecha de Registro</TableHead>
                                <TableHead className="text-gray-600">Estatus</TableHead>
                                <TableHead className="text-gray-600">Rol</TableHead>
                                <TableHead className="text-gray-600 text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-4">Cargando usuarios...</TableCell>
                                    </TableRow>
                                ) : users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-4">No hay usuarios registrados</TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => {
                                        const statusDisplay = getStatusDisplay(user.status);
                                        return (
                                            <TableRow key={user.id} className="hover:bg-gray-50">
                                                <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="w-10 h-10">
                                                    <AvatarFallback className="bg-blue-100 text-blue-600">
                                                        {getInitials(user.name)}
                                                    </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-gray-900">{user.name}</span>
                                                </div>
                                                </TableCell>
                                                <TableCell className="text-gray-600">{user.email}</TableCell>
                                                <TableCell className="text-gray-600">{formatDate(user.created_at)}</TableCell>
                                                <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={`rounded-full ${statusDisplay.color}`}
                                                >
                                                    {statusDisplay.text}
                                                </Badge>
                                                </TableCell>
                                                <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className="rounded-lg border-gray-200 text-gray-700 hover:bg-gray-50"
                                                    >
                                                        {user.role_name || 'Asignar Rol'}
                                                        <MoreVertical className="w-4 h-4 ml-2" />
                                                    </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="start" className="rounded-lg">
                                                        {roles.map(role => (
                                                            <DropdownMenuItem
                                                                key={role.id}
                                                                onClick={() => handleAssignRole(user.id, role.id)}
                                                                className="rounded-md cursor-pointer"
                                                            >
                                                                {role.name}
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                {user.status === false || user.status === null ? (
                                                    <Button
                                                    onClick={() => handleActivateUser(user.id)}
                                                    className="rounded-lg bg-green-600 hover:bg-green-700 text-white"
                                                    size="sm"
                                                    >
                                                    <Power className="w-4 h-4 mr-2" />
                                                    Activar
                                                    </Button>
                                                ) : null}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                            </Table>
                        </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
