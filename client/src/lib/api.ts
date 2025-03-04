import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_REACT_APP_SERVER_URL || window.location.origin,
    withCredentials: true,
});

export default api;
