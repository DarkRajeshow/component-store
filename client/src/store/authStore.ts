// src/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FinalApprovalStatus, IUser } from '@/types/user.types';

export interface StatusLog {
    status: string;
    timestamp: string;
    message: string;
    updatedBy?: string;
}

export interface ApprovalStatus {
    dhApproval: 'pending' | 'approved' | 'rejected';
    adminApproval: 'pending' | 'approved' | 'rejected';
    isApproved: FinalApprovalStatus;
    progressPercentage: number;
    currentStage: 'department_head' | 'admin' | 'completed' | 'rejected';
}

interface AuthState {
    user: IUser | null;
    userType: 'user' | 'admin' | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    approvalStatus: ApprovalStatus | null;
    pendingUsers:  IUser[];

    // Actions
    setUser: (user: IUser | null) => void;
    setUserType: (userType: 'user' | 'admin' | null) => void;
    setAuthenticated: (status: boolean) => void;
    setLoading: (status: boolean) => void;
    setApprovalStatus: (status: ApprovalStatus | null) => void;
    setPendingUsers: (users: IUser[]) => void;
    logout: () => void;
    updateUserStatus: (userId: string, status: Partial<ApprovalStatus>) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            userType: null,
            isAuthenticated: false,
            isLoading: false,
            approvalStatus: null,
            pendingUsers: [],

            setUser: (user) => set({ user }),

            setUserType: (userType) => set({ userType }),

            setAuthenticated: (status) => set({ isAuthenticated: status }),

            setLoading: (status) => set({ isLoading: status }),

            setApprovalStatus: (status) => set({ approvalStatus: status }),

            setPendingUsers: (users) => set({ pendingUsers: users }),

            logout: () => set({
                user: null,
                userType: null,
                isAuthenticated: false,
                approvalStatus: null,
                pendingUsers: []
            }),

            updateUserStatus: (userId, statusUpdate) => {
                const { pendingUsers } = get();
                const updatedUsers = pendingUsers.map(user =>
                    user._id === userId
                        ? { ...user, ...statusUpdate }
                        : user
                );
                set({ pendingUsers: updatedUsers });
            }
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                userType: state.userType,
                isAuthenticated: state.isAuthenticated,
                approvalStatus: state.approvalStatus
            })
        }
    )
);
