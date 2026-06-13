import api from './api';

export const userService = {
    getProfile: async (id) => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },

    updateProfile: async (id, data) => {
        const response = await api.put(`/users/${id}`, data);
        return response.data;
    },

    getAll: async (page = 1, limit = 10) => {
        const response = await api.get(`/users?page=${page}&limit=${limit}`);
        return response.data;
    },

    search: async (keyword) => {
        const response = await api.get(`/users/search?q=${keyword}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/users', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/users/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    }
};