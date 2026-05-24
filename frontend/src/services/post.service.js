import api from './api';

export const postService = {
    // Cho User xem bài viết
    getAll: async (page = 1, limit = 10) => {
        const response = await api.get(`/posts?page=${page}&limit=${limit}`);
        return response.data;
    },
    getBySlug: async (slug) => {
        const response = await api.get(`/posts/${slug}`);
        return response.data;
    },

    // Cho Admin quản lý
    search: async (keyword) => {
        const response = await api.get(`/posts/search?q=${keyword}`);
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/posts', data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/posts/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/posts/${id}`);
        return response.data;
    }
};