import AppLayout from '@/layouts/app-layout';
import PacientLayout from '@/layouts/pacient-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { type ReactNode } from 'react';

interface SettingsOuterLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

/**
 * Layout exterior condicional para las páginas de Settings.
 *
 * - role_id === 1 (Paciente): usa PacientLayout (header superior, sin sidebar)
 * - Cualquier otro rol:        usa AppLayout estándar (con sidebar)
 *
 * Reemplaza el uso directo de AppLayout en cada página de settings,
 * centralizando la lógica de selección en un solo lugar.
 */
export default function SettingsOuterLayout({
    children,
    breadcrumbs,
}: SettingsOuterLayoutProps) {
    const { auth } = usePage<SharedData>().props;
    const isPatient = auth.user?.role_id === 1;

    if (isPatient) {
        return <PacientLayout>{children}</PacientLayout>;
    }

    return <AppLayout breadcrumbs={breadcrumbs}>{children}</AppLayout>;
}
