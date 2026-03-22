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
} from '@/components/ui/sidebar';
import { dashboard, reports, users, pacient} from '@/routes';
import { SharedData, type NavItem } from '@/types';
import { Link , usePage} from '@inertiajs/react';
import { BookOpen, Folder, Users, Shield, Newspaper, Activity } from 'lucide-react';

const mainNavItems: NavItem[] = [
    {
        title: 'Panel de pacientes',
        href: users(),
        icon: Users
    },
    {
        title: 'Reportes',
        href: reports(),
        icon: Newspaper
    },
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: Shield
    },{
        title:'Paciente',
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
            // Paciente: solo Paciente
            return mainNavItems.filter(item => item.title === 'Paciente');
        } else if (roleId === 2) {
            // Clinician: Panel de pacientes y Reportes
            return mainNavItems.filter(item => 
                item.title === 'Panel de pacientes' || item.title === 'Reportes'
            );
        } else if (roleId === 3) {
            // Admin: todos
            return mainNavItems;
        }
        
        return [];
    };
    
    const navItems = getNavItems();
    
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <div className="flex items-center">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link href={users()} prefetch>
                                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                                        <Activity className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="font-semibold text-blue-900">App Salud</span>
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
