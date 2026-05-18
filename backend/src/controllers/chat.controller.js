const chatService = require('../services/chat.service');

class ChatController {
    // Gửi tin nhắn mới
    async handleChat(req, res) {
        try {
            const { message } = req.body;
            const userId = req.user?.id || req.user?.user_id;

            if (!userId) return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập để trò chuyện với AI!' });
            if (!message || !message.trim()) return res.status(400).json({ success: false, message: 'Tin nhắn không được trống!' });
            if (!process.env.GEMINI_API_KEY) return res.status(500).json({ success: false, message: 'Chưa cấu hình GEMINI_API_KEY!' });

            // Gọi qua tầng Service
            const result = await chatService.handleChat(userId, message);
            return res.status(200).json(result);

        } catch (error) {
            console.error("Lỗi xử lý AI Chat Controller:", error);
            return res.status(500).json({ success: false, message: 'Hệ thống AI đang bận xử lý, vui lòng gửi lại nhé!' });
        }
    }

    // Lấy danh sách lịch sử
    async getChatHistory(req, res) {
        try {
            const userId = req.user?.id || req.user?.user_id;
            if (!userId) return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập' });

            // Gọi qua tầng Service
            const result = await chatService.getChatHistory(userId);
            return res.status(200).json(result);

        } catch (error) {
            return res.status(500).json({ success: false, message: "Không thể lấy lịch sử chat" });
        }
    }
}

module.exports = new ChatController();