import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    const { state } = useSidebar();
    return (
        <SidebarGroup className={`py-3 ${state === 'collapsed' ? 'px-3' : 'px-2'}`}>
            <SidebarGroupLabel className="text-xs font-semibold tracking-widest uppercase">Plataforma</SidebarGroupLabel>
            <SidebarMenu className="gap-2">
                {items.map((item) => {
                    const href = typeof item.href === "string" ? item.href : item.href.url;
                    const isActive = page.url === href || page.url.startsWith(`${href}/`);

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={isActive}
                                tooltip={{ children: item.title }}
                                className={`h-10 text-sm transition-colors [&>a>svg]:size-[1.15rem] [&>a>svg]:shrink-0 ${
                                    isActive
                                        ? 'bg-blue-50 text-blue-600 border-l-[3px] border-blue-500 rounded-r-lg rounded-l-none'
                                        : 'rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                                }`}
                            >
                                <Link href={item.href} prefetch>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )
            })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
