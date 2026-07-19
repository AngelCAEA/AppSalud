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
            <SidebarGroupLabel className="text-xs text-gray-400 font-semibold tracking-widest uppercase">Plataforma</SidebarGroupLabel>
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
                                        ? '!bg-blue-100 text-blue-600 border-l-[3px] border-blue-500 rounded-r-lg rounded-l-none'
                                        : 'rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-500 dark:hover:text-gray-400'
                                }`}
                            >
                                <Link href={item.href} prefetch>
                                    {item.icon && <span className={`[&>svg]:size-[1.15rem] [&>svg]:shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}><item.icon /></span>}
                                    <span className={`${isActive ? 'text-blue-600 font-bold' : 'text-black dark:text-white'}`}>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )
            })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
