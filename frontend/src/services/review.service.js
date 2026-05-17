import api from './api';

export const reviewService = {
    // 1. API CHO NGƯỜI DÙNG
    getByProduct: async (productId) => {
        const response = await api.get(`/reviews/product/${productId}`);
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/reviews', data);
        return response.data;
    },

    // 2. API CHO ADMIN
    // 🌟 Sửa lại đường dẫn chuẩn lấy tất cả
    getAll: async () => {
        const response = await api.get('/reviews');
        return response.data;
    },
    search: async (keyword) => {
        const response = await api.get(`/reviews/search?q=${keyword}`);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/reviews/${id}`);
        return response.data;
    }
};