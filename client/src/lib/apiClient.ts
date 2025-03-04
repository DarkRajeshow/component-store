import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_REACT_APP_SERVER_URL || window.location.origin,
    withCredentials: true,
});

export interface ApiRequestOptions extends AxiosRequestConfig {
    headers?: Record<string, string>;
}

export async function apiRequest<T = any>(
    method: string,
    url: string,
    data?: any,
    options?: ApiRequestOptions
): Promise<AxiosResponse<T>> {
    try {
        const response = await api({
            method,
            url,
            data,
            ...options
        });
        return response;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Something went wrong');
    }
}

export default api;