import { NavUser } from '@/components/nav-user';
import { Activity } from 'lucide-react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from 'sonner';
import { type ReactNode } from 'react';

interface PacientLayoutProps {
    /** Contenido principal de la pantalla */
    children: ReactNode;
    /** Título que se muestra centrado en el header. Por defecto "App Salud" */
    title?: string;
    /**
     * Subtítulo opcional debajo del título.
     * Ejemplo: "Dashboard · Últimos 30 días"
     */
    subtitle?: string;
    /**
     * Slot izquierdo del header para colocar un botón de regreso u otro control.
     * Si no se provee, el espacio queda vacío y el título permanece centrado.
     */
    leftSlot?: ReactNode;
}

/**
 * Layout exclusivo para la vista de paciente.
 *
 * Diseño:
 * - Sin barra lateral (sidebar), ya que el paciente solo accede a esta sección.
 * - Header fijo en la parte superior con el nombre de la app centrado
 *   y el menú de usuario anclado a la esquina superior derecha.
 * - Fondo suave (gris-azulado) en el área de contenido para diferenciarla del header.
 * - Completamente responsivo: el header se adapta a pantallas pequeñas (móvil)
 *   y grandes (tablet / escritorio).
 */
export default function PacientLayout({
    children,
    title = 'App Salud',
    subtitle,
    leftSlot,
}: PacientLayoutProps) {
    return (
        /* SidebarProvider es requerido por el hook useSidebar que utiliza NavUser internamente.
           No renderiza ninguna barra lateral, solo provee el contexto necesario. */
        <SidebarProvider>
        <div className="flex min-h-screen w-full flex-col bg-[#eef2f7] dark:bg-gray-950">
            {/* ── Header superior ───────────────────────────────────────────────
                sticky: permanece visible al hacer scroll
                backdrop-blur: efecto de cristal sobre el contenido que pasa por debajo
                h-14 en móvil / h-16 en sm+ para dar más respiro en pantallas grandes
                leftSlot: si se provee, aparece anclado al extremo izquierdo
                subtitle: si se provee, aparece debajo del título centrado
            ─────────────────────────────────────────────────────────────────── */}
            <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/90 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/90">
                <div className="relative flex h-14 items-center justify-center px-4 sm:h-16">

                    {/* Slot izquierdo — botón de regreso u otro control opcional */}
                    {leftSlot && (
                        <div className="absolute left-4">
                            {leftSlot}
                        </div>
                    )}

                    {/* Título y subtítulo — centrados de forma absoluta */}
                    <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 flex items-center gap-2 text-center">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600">
                            <Activity className="h-4 w-4 text-white" />
                        </div>
                        <div>
                        <span className="block text-base font-bold tracking-tight text-gray-900 dark:text-white sm:text-lg leading-tight">
                            {title}
                        </span>
                        {subtitle && (
                            <span className="block text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                {subtitle}
                            </span>
                        )}
                        </div>
                    </div>

                    {/* Menú de usuario — anclado al extremo derecho.
                        NavUser reutiliza el mismo componente del sidebar (DropdownMenu
                        con UserInfo + UserMenuContent) para consistencia visual. */}
                    <div className="ml-auto">
                        <NavUser />
                    </div>
                </div>
            </header>

            {/* ── Contenido principal ───────────────────────────────────────────
                flex-1 para que ocupe todo el alto restante.
                overflow-y-auto permite scroll dentro de la sección de contenido.
            ─────────────────────────────────────────────────────────────────── */}
            <main className="flex flex-1 flex-col overflow-y-auto">
                {children}
            </main>

            {/* Notificaciones toast globales del layout */}
            <Toaster
                position="bottom-left"
                expand
                richColors
                closeButton
            />
        </div>
        </SidebarProvider>
    );
}
