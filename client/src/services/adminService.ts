import api from './api';
import { IAdmin, IUser } from '@/types/user.types';

export const adminService = {
  // Get all users
  getAllUsers: async (): Promise<{ users: IUser[] }> => {
    const response = await api.get('/v1/admin/all-users');
    return response.data;
  },

  // Get all admins
  getAllAdmins: async (): Promise<{ admins: IAdmin[] }> => {
    const response = await api.get('/v1/admin/all-admins');
    return response.data;
  },

  // Approve user (admin)
  approveUser: async (userId: string, isApproved: boolean) => {
    const response = await api.patch(`/v1/admin/approve-user/${userId}`, { isApproved });
    return response.data;
  },

  // Admin final approval
  adminApprovalForUser: async (userId: string, action: 'approve' | 'reject', remarks?: string) => {
    const response = await api.post(`/v1/admin/approve-user/${userId}`, { action, remarks });
    return response.data;
  },

  // Admin final approval
  adminApprovalForAdmin: async (userId: string, action: 'approve' | 'reject', remarks?: string) => {
    const response = await api.post(`/v1/admin/approve-admin/${userId}`, { action, remarks });
    return response.data;
  },

  // Approve admin as system admin
  approveAdmin: async (adminId: string, isSystemAdmin: boolean) => {
    const response = await api.patch(`/v1/admin/approve-admin/${adminId}`, { isSystemAdmin });
    return response.data;
  },
};
