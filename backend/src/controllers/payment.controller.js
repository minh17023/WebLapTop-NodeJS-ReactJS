const paymentService = require('../services/payment.service');

class PaymentController {
    /**
     * Nhận và xử lý webhook tự động gạch nợ từ SePay
     */
    async sepayWebhook(req, res) {
        try {
            // 0. Xác thực Webhook từ SePay bằng API Key bảo mật trong Header Authorization
            const authHeader = req.headers.authorization;
            const sepayKey = process.env.SEPAY_WEBHOOK_KEY || 'HNC_Laptop_Sepay_Webhook_Secret_2026';
            if (!authHeader || authHeader !== `Bearer ${sepayKey}`) {
                console.warn("[SEPAY] Phát hiện request webhook không có quyền truy cập hợp lệ!");
                return res.status(401).json({ success: false, message: "Không có quyền truy cập!" });
            }

            // 1. Gọi qua tầng Service để xử lý logic gạch nợ đơn hàng
            const result = await paymentService.processSepayWebhook(req.body);

            // 2. Trả về 200 OK để SePay biết bạn đã nhận được tín hiệu (nếu không nó sẽ gửi lại liên tục)
            return res.status(200).json({ success: true, message: result.message });

        } catch (error) {
            console.error("Lỗi xử lý Webhook SePay:", error);
            // Vẫn trả về 200 OK kèm success: false khi gặp lỗi Server để SePay dừng thử lại (retry), tránh nghẽn webhook
            return res.status(200).json({ success: false, message: "Lỗi server xử lý webhook" });
        }
    }
}

module.exports = new PaymentController();