import { Component, Revision, ComponentFilterParams, User } from '../types';
import api from '@/lib/api';

export const createComponent = async (data: any) => {
  // If data is FormData (with file), use it directly
  if (data instanceof FormData) {
    const res = await api.post<{ success: boolean; component: Component }>('/components', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.component;
  }

  // Otherwise, send as JSON
  const res = await api.post<{ success: boolean; component: Component }>('/components', data);
  return res.data.component;
};

export const getComponents = async (params?: ComponentFilterParams) => {
  const res = await api.get<{ success: boolean; components: Component[]; total: number; page: number; limit: number; totalPages: number }>('/components', { params });
  return res.data;
};

export const getComponentDetails = async (id: string) => {
  const res = await api.get<{ success: boolean; component: Component }>(`/components/${id}`);
  return res.data.component;
};

export const updateComponent = async (id: string, data: any) => {
  const res = await api.put<{ success: boolean; component: Component }>(`/components/${id}`, data);
  return res.data.component;
};

export const deleteComponent = async (id: string) => {
  const res = await api.delete<{ success: boolean; message: string }>(`/components/${id}`);
  return res.data;
};

export const searchUsersApi = async (params: { search?: string; limit?: number }) => {
  const res = await api.get<{ success: boolean; users: User[] }>('/users/search', { params });
  return res.data;
};

export const uploadRevision = async (componentId: string, formData: FormData) => {
  const res = await api.post<{ success: boolean; component: Component; revision: Revision }>(`/components/${componentId}/revisions`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
}; 