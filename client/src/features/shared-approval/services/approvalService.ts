import api from '@/lib/api';
import { IAdmin, IUser } from '@/types/user.types';
import { ApprovalService } from '../types';

export class BaseApprovalService implements ApprovalService {
  protected baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getAllUsers(): Promise<{ users: IUser[] }> {
    const response = await api.get(`${this.baseUrl}/all-users`);
    return response.data;
  }

  async toggleUserDisabled(userId: string) {
    const response = await api.post(`${this.baseUrl}/toggle-user-disabled/${userId}`);
    return response.data;
  }

  async approveUser(userId: string, action: 'approve' | 'reject', remarks?: string) {
    const response = await api.post(`${this.baseUrl}/approve-user/${userId}`, { action, remarks });
    return response.data;
  }

  async deleteUser(userId: string) {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  }
}

export class AdminApprovalService extends BaseApprovalService {
  constructor() {
    super('/admin');
  }

  async getAllAdmins(): Promise<{ admins: IAdmin[] }> {
    const response = await api.get(`${this.baseUrl}/all-admins`);
    return response.data;
  }

  async toggleAdminDisabled(adminId: string) {
    const response = await api.post(`${this.baseUrl}/toggle-admin-disabled/${adminId}`);
    return response.data;
  }

  async approveAdmin(adminId: string, action: 'approve' | 'reject', remarks?: string) {
    const response = await api.post(`${this.baseUrl}/approve-admin/${adminId}`, { action, remarks });
    return response.data;
  }
}

export class DHApprovalService extends BaseApprovalService {
  constructor() {
    super('/admin');
  }

  async getAllUsers(): Promise<{ users: IUser[] }> {
    // For DH, we need to get users from their department only
    const response = await api.get(`${this.baseUrl}/department-users`);
    return { users: response.data.users || [] };
  }

  async approveUser(userId: string, action: 'approve' | 'reject', remarks?: string) {
    const response = await api.post(`/auth/approve/department`, { userId, action, remarks });
    return response.data;
  }
} 