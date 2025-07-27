import { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import debounce from 'lodash/debounce';
import { searchUsersApi } from '../services/api';

interface UseUserSearchReturn {
    users: User[];
    loading: boolean;
    error: string | null;
    searchUsers: (searchTerm: string) => void;
    clearSearch: () => void;
}

export function useUserSearch(): UseUserSearchReturn {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async (searchTerm: string = '') => {
        setLoading(true);
        setError(null);

        try {
            const response = await searchUsersApi({ search: searchTerm, limit: 5 });
            setUsers(response.users || []);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to fetch users');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce((searchTerm: string) => {
            fetchUsers(searchTerm);
        }, 300),
        [fetchUsers]
    );

    const searchUsers = useCallback((searchTerm: string) => {
        if (searchTerm.trim()) {
            debouncedSearch(searchTerm);
        } else {
            // If search is empty, fetch all users
            fetchUsers();
        }
    }, [debouncedSearch, fetchUsers]);

    const clearSearch = useCallback(() => {
        setUsers([]);
        setError(null);
    }, []);

    // Load initial users when component mounts
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return {
        users,
        loading,
        error,
        searchUsers,
        clearSearch,
    };
} 