import api from '@/lib/api';
import { IAdmin, IUser } from '@/types/user.types';

export const adminService = {
  // Get all users
  getAllUsers: async (): Promise<{ users: IUser[] }> => {
    const response = await api.get('/admin/all-users');
    return response.data;
  },

  // Get all admins
  getAllAdmins: async (): Promise<{ admins: IAdmin[] }> => {
    const response = await api.get('/admin/all-admins');
    return response.data;
  },

  // Approve user (admin)
  toggleUserDisabled: async (userId: string, isApproved: boolean) => {
    const response = await api.post(`/admin/toggle-user-disabled/${userId}`, { isApproved });
    return response.data;
  },

  // Approve admin as system admin
  toggleAdminDisabled: async (adminId: string, isSystemAdmin: boolean) => {
    const response = await api.post(`/admin/toggle-admin-disabled/${adminId}`, { isSystemAdmin });
    return response.data;
  },

  // Admin final approval
  adminApprovalForUser: async (userId: string, action: 'approve' | 'reject', remarks?: string) => {
    const response = await api.post(`/admin/approve-user/${userId}`, { action, remarks });
    return response.data;
  },

  // Admin final approval
  adminApprovalForAdmin: async (userId: string, action: 'approve' | 'reject', remarks?: string) => {
    const response = await api.post(`/admin/approve-admin/${userId}`, { action, remarks });
    return response.data;
  },


};
