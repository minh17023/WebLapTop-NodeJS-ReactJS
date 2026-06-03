import api from './api';

export const cartService = {
    getCart: async () => {
        const response = await api.get('/cart');
        return response.data;
    },
    addToCart: async (productId, variantId, quantity = 1) => {
        const response = await api.post('/cart/add', { productId, variantId, quantity });
        return response.data;
    },
    updateQuantity: async (productId, variantId, quantity) => {
        const response = await api.put('/cart/update', { productId, variantId, quantity });
        return response.data;
    },
    removeFromCart: async (productId, variantId) => {
        const url = variantId ? `/cart/${productId}?variantId=${variantId}` : `/cart/${productId}`;
        const response = await api.delete(url);
        return response.data;
    },
    clearCart: async () => {
        const response = await api.delete('/cart');
        return response.data;
    }
};