import api from './api';

export const reviewService = {
    getByProduct: async (productId, page = 1, limit = 10) => {
        const response = await api.get(`/reviews/product/${productId}?page=${page}&limit=${limit}`);
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/reviews', data);
        return response.data;
    },

    getAll: async (page = 1, limit = 10, rating = '') => {
        const response = await api.get(`/reviews?page=${page}&limit=${limit}${rating && rating !== 'all' ? `&rating=${rating}` : ''}`);
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