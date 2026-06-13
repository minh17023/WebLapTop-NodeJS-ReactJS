import api from './api';

export const chatService = {
    sendMessage: async (message) => {
        const response = await api.post('/chat', { message });
        return response.data;
    },

    getHistory: async () => {
        const response = await api.get('/chat/history');
        return response.data;
    }
};