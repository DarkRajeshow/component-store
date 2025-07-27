import { IUser, IAdmin, ApprovalStatus, FinalApprovalStatus } from '@/types/user.types';

export interface ApprovalFilters {
  search: string;
  department: string;
  designation: string;
  role: string;
  dhApprovalStatus: string;
  adminApprovalStatus: string;
  approvalStatus: string;
  dateRange: string;
  isDisabled: string;
}

export interface ApprovalState {
  users: IUser[];
  admins?: IAdmin[]; // Optional for DH dashboard
  loading: boolean;
  error: string;
  selectedUser: IUser | null;
  selectedAdmin?: IAdmin | null; // Optional for DH dashboard
  approvalRemarks: string;
  filters: ApprovalFilters;
}

export interface ApprovalActions {
  setSelectedUser: (user: IUser | null) => void;
  setSelectedAdmin?: (admin: IAdmin | null) => void; // Optional for DH dashboard
  setApprovalRemarks: (remarks: string) => void;
  setFilters: (filters: Partial<ApprovalFilters>) => void;
  fetchData: () => Promise<void>;
  handleToggleUserDisabled: (userId: string) => Promise<void>;
  handleToggleAdminDisabled?: (adminId: string) => Promise<void>; // Optional for DH dashboard
  handleUserApproval: (userId: string, action: 'approve' | 'reject', remarks?: string) => Promise<void>;
  handleAdminApproval?: (adminId: string, action: 'approve' | 'reject', remarks?: string) => Promise<void>; // Optional for DH dashboard
  resetFilters: () => void;
  deleteUser: (userId: string) => Promise<void>;
  setError: (error: string) => void;
}

export interface ApprovalConstants {
  departments: string[];
  designations: string[];
  roles: string[];
  approvalStatuses: string[];
}

export interface ApprovalComputed {
  filteredUsers: IUser[];
  pendingUsers: (IUser | IAdmin)[];
}

export interface ApprovalContext {
  // State
  users: IUser[];
  admins?: IAdmin[];
  loading: boolean;
  error: string;
  selectedUser: IUser | null;
  selectedAdmin?: IAdmin | null;
  approvalRemarks: string;
  filters: ApprovalFilters;

  // Constants
  departments: string[];
  designations: string[];
  roles: string[];
  approvalStatuses: string[];

  // Computed values
  filteredUsers: IUser[];
  pendingUsers: (IUser | IAdmin)[];

  // Actions
  setSelectedUser: (user: IUser | null) => void;
  setSelectedAdmin?: (admin: IAdmin | null) => void;
  setApprovalRemarks: (remarks: string) => void;
  setFilters: (filters: Partial<ApprovalFilters>) => void;
  fetchData: () => Promise<void>;
  handleToggleUserDisabled: (userId: string) => Promise<void>;
  handleToggleAdminDisabled?: (adminId: string) => Promise<void>;
  handleUserApproval: (userId: string, action: 'approve' | 'reject', remarks?: string) => Promise<void>;
  handleAdminApproval?: (adminId: string, action: 'approve' | 'reject', remarks?: string) => Promise<void>;
  resetFilters: () => void;
  deleteUser: (userId: string) => Promise<void>;
  setError: (error: string) => void;
}

export type ApprovalRole = 'admin' | 'department_head';

export interface ApprovalService {
  getAllUsers: () => Promise<{ users: IUser[] }>;
  getAllAdmins?: () => Promise<{ admins: IAdmin[] }>;
  toggleUserDisabled: (userId: string) => Promise<any>;
  toggleAdminDisabled?: (adminId: string) => Promise<any>;
  approveUser: (userId: string, action: 'approve' | 'reject', remarks?: string) => Promise<any>;
  approveAdmin?: (adminId: string, action: 'approve' | 'reject', remarks?: string) => Promise<any>;
  deleteUser: (userId: string) => Promise<any>;
} 