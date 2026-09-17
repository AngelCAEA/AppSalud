import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { UserX, UserMinus, Clock, MoreVertical, Power } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Role } from '@/types/user';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import  UserTable  from '@/pages/Admin/UserTable';

import { toast } from 'sonner';
import { getUsers } from '@/hooks/dashboard_admin/useTableUser'

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];


type ApiResponse = {
    status: boolean;
    message: string;
};

export default function Dashboard() {

    const {users, roles, loading, error } = getUsers();
    const page = usePage();
    const csrfToken = (page.props.csrf_token as string) || 
                      document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    


   

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
                        <CardContent>
                            <h1 className="text-black dark:text-white mb-2">Gestión de Usuarios</h1>
                      
                            <div className="rounded-lg border border-gray-200 overflow-hidden">
                                <UserTable
                                    data={users}
                                    isLoading={loading}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
