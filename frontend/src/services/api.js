import axios from 'axios';
import { Meta } from 'react-router-dom';

const api = axios.create({
    // import.meta.env.VITE_API_URL ||
    baseURL: import.meta.env.VITE_API_URL||'http://localhost:8080/api', 
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;