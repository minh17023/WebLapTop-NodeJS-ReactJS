import api from './api';

export const categoryService = {
    getAll: async () => {
        const response = await api.get('/categories');
        return response.data;
    },
    getBySlug: async (slug) => {
        const response = await api.get(`/categories/${slug}`);
        return response.data;
    },

    search: async (keyword) => {
        const response = await api.get(`/categories/search?q=${keyword}`);
        return response.data;
    },
    
    // Các API dành cho Admin
    create: async (data) => {
        const response = await api.post('/categories', data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/categories/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/categories/${id}`);
        return response.data;
    }
};