import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { dashboard, reports, users, pacient} from '@/routes';
import { SharedData, type NavItem } from '@/types';
import { Link , usePage} from '@inertiajs/react';
import { BookOpen, Folder, Users, Shield, FileSpreadsheet, Activity } from 'lucide-react';

const mainNavItems: NavItem[] = [
    {
        title: 'Panel de pacientes',
        href: users(),
        icon: Users
    },
    {
        title: 'Reportes',
        href: reports(),
        icon: FileSpreadsheet
    },
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: Shield
    },{
        title:'Medicion de salud',
        href: pacient(),
        icon: BookOpen
    }
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    
    // Filtrar items según el rol
    const getNavItems = (): NavItem[] => {
        const roleId = auth.user?.role_id;
        
        if (roleId === 1) {
            // Paciente: solo Medicion de salud
            return mainNavItems.filter(item => item.title === 'Medicion de salud');
        } else if (roleId === 2) {
            // Clinician: Panel de pacientes, reportes y medicion de salud
            return mainNavItems.filter(item => 
                item.title === 'Panel de pacientes' || item.title === 'Reportes' || item.title === 'Medicion de salud'
            );
        } else if (roleId === 3) {
            // Admin: todos
            return mainNavItems;
        }
        
        return [];
    };
    
    const navItems = getNavItems();
    const { state } = useSidebar();
    
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <div className="flex items-center">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link href={users()} prefetch className={state === 'collapsed' ? 'justify-center' : ''}>
                                    <div className="w-8 h-8 flex-shrink-0 bg-blue-500 rounded-xl flex items-center justify-center shadow-md">
                                        <Activity className="w-4 h-4 text-white" strokeWidth={2.5} />
                                    </div>
                                    {state === 'expanded' && (
                                        <span className="font-semibold text-blue-900 text-base">App Salud</span>
                                    )}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>
            
            <SidebarFooter>
                {/*<NavFooter items={footerNavItems} className="mt-auto" />*/}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
