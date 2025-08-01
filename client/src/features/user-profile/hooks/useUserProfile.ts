import { useState, useEffect, useCallback } from 'react';
import { updateCurrentUserProfile, updateUserPreferences, changePassword } from '../services/api';
import { UserPreferences, PasswordChangeRequest } from '../types';
import { authService } from '@/services/authService';
import { IAdmin, IUser } from '@/types/user.types';

export function useUserProfile() {
  const [profile, setProfile] = useState<IUser | IAdmin | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.getCurrentUser();
      console.log(data.user);
      
      setProfile(data.user);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<IUser | IAdmin>) => {
    setLoading(true);
    setError(null);
    try {
      const data = await updateCurrentUserProfile(updates);
      setProfile(data);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePreferences = useCallback(async (preferences: Partial<UserPreferences>) => {
    setLoading(true);
    setError(null);
    try {
      const data = await updateUserPreferences(preferences);
      setProfile(data);
    } catch (err: any) {
      setError(err.message || 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  }, []);

  const changeUserPassword = useCallback(async (passwordData: PasswordChangeRequest) => {
    setLoading(true);
    setError(null);
    try {
      const result = await changePassword(passwordData);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Theme application is now handled centrally in useDarkMode hook
  // Removed the conflicting theme logic from here

  return { 
    profile, 
    loading, 
    error, 
    fetchProfile, 
    updateProfile, 
    updatePreferences, 
    changeUserPassword 
  };
} 