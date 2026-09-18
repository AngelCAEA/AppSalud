import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { UserX, UserMinus, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
            <div className="min-h-full flex-1">
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                    {/* Cards de métricas */}
                    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                        {/* Usuarios sin Rol */}
                        <Card className="rounded-xl border border-[rgba(255,255,255,0.08)] border-l-[3px] border-l-[#ef4444]">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-[#64748b] mb-2">Usuarios sin Rol</p>
                                        <p className="text-4xl font-semibold text-[#ef4444]">{usersWithoutRole}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[rgba(239,68,68,0.15)]">
                                        <UserX className="w-6 h-6 text-[#ef4444]" />
                                    </div>
                                </div>
                                <p className="text-xs text-[#64748b] mt-4">Requieren asignación de rol</p>
                            </CardContent>
                        </Card>

                        {/* Cuentas Inactivas */}
                        <Card className="rounded-xl border border-[rgba(255,255,255,0.08)] border-l-[3px] border-l-[#f59e0b]">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-[#64748b] mb-2">Cuentas Inactivas</p>
                                        <p className="text-4xl font-semibold text-[#f59e0b]">{inactiveAccounts}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[rgba(245,158,11,0.15)]">
                                        <UserMinus className="w-6 h-6 text-[#f59e0b]" />
                                    </div>
                                </div>
                                <p className="text-xs text-[#64748b] mt-4">Usuarios pendientes o desactivados</p>
                            </CardContent>
                        </Card>

                        {/* Registros Recientes */}
                        <Card className="rounded-xl border border-[rgba(255,255,255,0.08)] border-l-[3px] border-l-[#2563eb]">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-[#64748b] mb-2">Registros Recientes</p>
                                        <p className="text-4xl font-semibold text-[#60a5fa]">{recentRegistrations}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[rgba(37,99,235,0.15)]">
                                        <Clock className="w-6 h-6 text-[#60a5fa]" />
                                    </div>
                                </div>
                                <p className="text-xs text-[#64748b] mt-4">Últimos 7 días</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tabla de Gestión de Usuarios */}
                    <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl md:min-h-min">
                        <Card className="rounded-xl border border-[rgba(255,255,255,0.08)]">
                            <CardHeader>
                                <CardTitle>Gestión de Usuarios</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-lg border border-[rgba(255,255,255,0.08)] overflow-hidden">
                                    <UserTable
                                        data={users}
                                        isLoading={loading}
                                        error={error}
                                        roles={roles}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
