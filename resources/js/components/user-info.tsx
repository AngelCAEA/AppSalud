import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { useSidebar } from '@/components/ui/sidebar';
import { type User } from '@/types';

const roleNames: Record<number, string> = {
    1: 'Paciente',
    2: 'Clínico',
    3: 'Administrador',
};

const roleColors: Record<number, string> = {
    1: 'bg-blue-600',
    2: 'bg-emerald-600',
    3: 'bg-violet-600',
};

export function UserInfo({
    user,
    showEmail = false,
    showRole = false,
    hideNameOnMobile = false,
}: {
    user: User;
    showEmail?: boolean;
    showRole?: boolean;
    hideNameOnMobile?: boolean;
}) {
    const getInitials = useInitials();
    const { state } = useSidebar();
    const roleName = roleNames[user.role_id] ?? 'Usuario';
    const roleColor = roleColors[user.role_id] ?? 'bg-gray-600';
    const avatarSize = state === 'collapsed' ? 'h-6 w-6' : 'h-8 w-8';
    const dotSize  = state === 'collapsed' ? 'h-1.5 w-1.5' : 'h-2 w-2';

    return (
        <>
            <div className="relative flex-shrink-0">
                <Avatar className={`${avatarSize} overflow-hidden rounded-full transition-all duration-200`}>
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className={`rounded-full ${roleColor} text-white font-semibold`}>
                        {getInitials(user.name)}
                    </AvatarFallback>
                </Avatar>
                <span className={`absolute bottom-0 right-0 ${dotSize} rounded-full bg-green-500 ring-2 ring-white transition-all duration-200`} />
            </div>
            <div className={`grid flex-1 text-left text-sm leading-tight ${hideNameOnMobile ? 'hidden md:grid' : ''}`}>
                <span className="truncate font-semibold">{user.name}</span>
                {showRole && (
                    <span className="truncate text-xs text-muted-foreground">
                        {roleName}
                    </span>
                )}
                {showEmail && !showRole && (
                    <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                    </span>
                )}
            </div>
        </>
    );
}
