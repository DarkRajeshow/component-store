import { UserPreferences, PasswordChangeRequest } from '../types';
import api from '@/lib/api';
import { IAdmin, IUser } from '@/types/user.types';

export const getCurrentUserProfile = async (): Promise<IUser | IAdmin> => {
  const { data } = await api.get('/users/me');
  return data;
};

export const updateCurrentUserProfile = async (profile: Partial<IUser | IAdmin>): Promise<IUser | IAdmin> => {
  const { data } = await api.put('/users/me', profile);
  return data;
};

export const updateUserPreferences = async (preferences: Partial<UserPreferences>): Promise<IUser | IAdmin> => {
  const { data } = await api.put('/users/me', { preferences });
  return data;
};

export const changePassword = async (passwordData: PasswordChangeRequest): Promise<{ success: boolean; message: string }> => {
  const { data } = await api.put('/users/me/password', passwordData);
  return data;
}; 