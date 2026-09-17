import { User, Role } from '@/types/user'

export interface RoleAssignResponse {
    status: boolean;
    message : string; 
}

export interface getUsersResponse {
    status: boolean;
    users: User[];
    roles: Role[];
    message: string;
}

export interface TableProps {
    data: User[];
    isLoading: boolean;
}