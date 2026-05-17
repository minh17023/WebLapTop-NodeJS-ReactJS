import api from './api';

export const authService = {
    login: async (email, password) => {
        const response = await api.post('/users/login', { email, password });
        return response.data;
    },
    register: async (full_name, email, password) => {
        const response = await api.post('/users/register', { full_name, email, password });
        return response.data;
    }
};