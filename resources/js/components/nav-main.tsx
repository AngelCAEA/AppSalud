import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu className="gap-3">
                {items.map((item) => {
                    const href = typeof item.href === "string" ? item.href : item.href.url;
                    const isActive = page.url === href || page.url.startsWith(`${href}/`);

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={isActive}
                                tooltip={{ children: item.title }}
                                className={`rounded-lg transition-colors ${isActive ? 'bg-blue-500 text-white' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
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
