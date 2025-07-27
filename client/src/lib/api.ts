import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5000/api/v1',
    withCredentials: true,
});

export default api;
