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
    roles: Role[];
    isLoading: boolean;
    error: string;
}

export interface Response {
    status: boolean;
    message: string;
}

