import { AxiosResponse } from 'axios';
import api from './api';

export const apiRequest = async <T>(
    method: 'get' | 'post' | 'put' | 'delete' | 'patch',
    endpoint: string,
    data?: unknown
): Promise<T> => {
    try {
        let response: AxiosResponse;

        switch (method) {
            case 'get':
                response = await api.get(endpoint);
                break;
            case 'post':
                response = await api.post(endpoint, data);
                break;
            case 'put':
                response = await api.put(endpoint, data);
                break;
            case 'patch':
                response = await api.patch(endpoint, data);
                break;
            case 'delete':
                response = await api.delete(endpoint, { data });
                break;
            default:
                throw new Error('Invalid HTTP method');
        }

        // Transform the response to match our interface types
        const transformedResponse = {
            success: response.status >= 200 && response.status < 300,
            status: response.statusText,
            ...response.data
        };

        return transformedResponse as T;
    } catch (error: any) {
        // Handle error responses
        const errorResponse = {
            success: false,
            status: error.response?.statusText || 'Error',
            message: error.response?.data?.message || error.message
        };
        return errorResponse as T;
    }
};