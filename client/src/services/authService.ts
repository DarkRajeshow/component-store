// src/services/authService.ts
import axios from 'axios';
import { authAPI } from '@/features/auth/lib/authAPI';
import { FinalApprovalStatus } from '@/types/user.types';

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance with defaults
const authAPI = axios.create({
    baseURL: `${API_BASE_URL}/auth`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token
authAPI.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
authAPI.interceptors.response.use(
    (response) => response,
    (error) => {
        // Only redirect to login if it's a token expiration (authenticated user losing session)
        // Not for login failures (unauthenticated user with wrong credentials)
        if (error.response?.status === 401 &&
            !error.config?.url?.includes('/sign-in') &&
            localStorage.getItem('accessToken')) {
            // Handle token expiration for authenticated users
            localStorage.removeItem('accessToken');
            window.location.href = '/sign-in';
        }
        return Promise.reject(error);
    }
);

export interface RegisterData {
    name: string;
    email: string;
    mobileNo: string;
    password: string;
    employeeId: string;
    department: string;
    designation: string;
    reportingTo?: string;
    role: 'designer' | 'other';
}

export interface LoginData {
    email: string;
    password: string;
}

export interface ApprovalData {
    userId: string;
    action: 'approve' | 'reject';
    remarks?: string;
}

export const authService = {
    // Register new user
    register: async (data: RegisterData) => {
        const response = await authAPI.post('/sign-up', data);
        return response.data;
    },

    // Login userīI
    login: async (data: LoginData) => {
        const response = await authAPI.post('/sign-in', data);
        
        if (response.data.tokens?.accessToken) {
            localStorage.setItem('accessToken', response.data.tokens.accessToken);
        }
        return response.data;
    },

    // Logout user
    logout: async () => {
        try {
            await authAPI.post('/logout');
        } finally {
            localStorage.removeItem('accessToken');
        }
    },

    // Get current user
    getCurrentUser: async () => {
        const response = await authAPI.get('/me');
        return response.data;
    },

    // Get user status
    getUserStatus: async () => {
        const response = await authAPI.get('/status');
        return response.data;
    },

    // Get department hierarchy
    getDepartmentHierarchy: async (department: string) => {
        const response = await authAPI.get(`/department-hierarchy?department=${department}`);
        return response.data;
    },

    // Department head approval
    departmentHeadApproval: async (data: ApprovalData) => {
        const response = await authAPI.post('/approve/department', data);
        return response.data;
    },

    // Admin approval
    adminApproval: async (data: ApprovalData) => {
        const response = await authAPI.post('/approve/admin', data);
        return response.data;
    },

    // Get pending users for department head
    getPendingUsersForDH: async () => {
        const response = await authAPI.get('/pending-users/department');
        return response.data;
    },

    // Get pending users for admin
    getPendingUsersForAdmin: async () => {
        const response = await authAPI.get('/pending-users/admin');
        return response.data;
    },

    // Create initial admin
    createInitialAdmin: async (data: { name: string; email: string; password: string; setupKey: string }) => {
        const response = await authAPI.post('/setup-admin', data);
        return response.data;
    },

    // Get all users (admin)
    getAllUsers: async () => {
        const response = await authAPI.get('/all-users');
        return response.data;
    },

    // Get all admins
    getAllAdmins: async () => {
        const response = await authAPI.get('/all-admins');
        return response.data;
    },

    // Approve user (admin)
    approveUser: async (userId: string, isApproved: FinalApprovalStatus) => {
        const response = await authAPI.patch(`/approve-user/${userId}`, { isApproved });
        return response.data;
    },

    // Admin final approval
    adminApprovalForUser: async (userId: string, action: 'approve' | 'reject', remarks?: string) => {
        const response = await authAPI.post('/admin-final-approval', { userId, action, remarks });
        return response.data;
    },

    // Approve admin as system admin
    approveAdmin: async (adminId: string, isSystemAdmin: boolean) => {
        const response = await authAPI.patch(`/approve-admin/${adminId}`, { isSystemAdmin });
        return response.data;
    },
};