import api from './api';

export const chatService = {
    // Gửi tin nhắn mới cho AI
    sendMessage: async (message) => {
        const response = await api.post('/chat', { message });
        return response.data;
    },

    // Lấy lịch sử trò chuyện cũ
    getHistory: async () => {
        const response = await api.get('/chat/history');
        return response.data;
    }
};