import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head} from '@inertiajs/react';
import { UserX, UserMinus, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import  UserTable  from '@/pages/Admin/UserTable';
import { getUsers } from '@/hooks/dashboardAdmin/useTableUser'

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {

    const {users, roles, loading, error } = getUsers();
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
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
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl md:min-h-min">
                    {/* Tabla de Gestión de Usuarios */}
                    <Card className="rounded-xl border-gray-200">
                        <CardContent>
                            <h1 className="text-black dark:text-white mb-2">Gestión de Usuarios</h1>
                            <div className="rounded-lg border border-gray-200 overflow-hidden">
                                <UserTable
                                    data={users}
                                    isLoading={loading}
                                    error={error}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
