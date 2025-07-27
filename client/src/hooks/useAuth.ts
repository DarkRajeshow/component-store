
// src/hooks/useAuth.ts
import { useEffect, useRef } from 'react';
import { authService, RegisterData } from '@/services/authService';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

export const useAuth = () => {
    const {
        user,
        userType,
        isAuthenticated,
        isLoading,
        approvalStatus,
        setUser,
        setUserType,
        setAuthenticated,
        setLoading,
        setApprovalStatus,
        logout: logoutStore
    } = useAuthStore();

    const initialized = useRef(false);

    // Initialize auth state
    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;
        const initializeAuth = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await authService.getCurrentUser();
                setUser(response.user);
                setUserType(response.userType);
                setAuthenticated(true);

                // Get approval status for non-admin users
                if (response.userType === 'user') {
                    const statusResponse = await authService.getUserStatus();
                    setApprovalStatus(statusResponse.approvalStatus);
                }
            } catch (error) {
                console.error('Auth initialization failed:', error);
                localStorage.removeItem('accessToken');
                logoutStore();
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []); // Only run once on mount

    const login = async (credentials: { email: string; password: string }) => {
        try {
            setLoading(true);
            const response = await authService.login(credentials);

            setUser(response.user);
            setUserType(response.userType);
            setAuthenticated(true);

            if (response.approvalStatus) {
                setApprovalStatus(response.approvalStatus);
            }

            toast.success('Login successful!');
            return response;
        } catch (error: unknown) {
            console.error('Login error:', error);
            let message = 'Login failed';
            if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
                message = (error.response.data as { message?: string }).message || message;
            }
            toast.error(message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData: RegisterData) => {
        try {
            setLoading(true);
            const response = await authService.register(userData);
            toast.success('Registration successful! Awaiting approval.');
            return response;
        } catch (error: unknown) {
            let message = 'Registration failed';
            if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
                message = (error.response.data as { message?: string }).message || message;
            }
            toast.error(message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            logoutStore();
            toast.success('Logged out successfully');
        }
    };

    const refreshUserStatus = async () => {
        if (userType === 'user') {
            try {
                const response = await authService.getUserStatus();
                setApprovalStatus(response.approvalStatus);
                setUser(response.user);
            } catch (error) {
                console.error('Failed to refresh user status:', error);
            }
        }
    };

    return {
        user,
        userType,
        isAuthenticated,
        isLoading,
        approvalStatus,
        login,
        register,
        logout,
        refreshUserStatus
    };
};