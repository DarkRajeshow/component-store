import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5000/api/v1',
    withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
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
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (
            error.response?.status === 401 &&
            !error.config?.url?.includes('/sign-in') &&
            localStorage.getItem('accessToken')
        ) {
            localStorage.removeItem('accessToken');
            window.location.href = '/sign-in';
        }
        return Promise.reject(error);
    }
);

export default api;
