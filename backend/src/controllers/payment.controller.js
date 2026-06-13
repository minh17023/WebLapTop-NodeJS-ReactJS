const paymentService = require('../services/payment.service');

class PaymentController {
    async sepayWebhook(req, res) {
        try {
            const authHeader = req.headers.authorization;
            const sepayKey = process.env.SEPAY_WEBHOOK_KEY || 'HNC_Laptop_Sepay_Webhook_Secret_2026';
            if (!authHeader || authHeader !== `Bearer ${sepayKey}`) {
                console.warn("[SEPAY] Phát hiện request webhook không có quyền truy cập hợp lệ!");
                return res.status(401).json({ success: false, message: "Không có quyền truy cập!" });
            }

            const result = await paymentService.processSepayWebhook(req.body);

            return res.status(200).json({ success: true, message: result.message });

        } catch (error) {
            console.error("Lỗi xử lý Webhook SePay:", error);
            return res.status(200).json({ success: false, message: "Lỗi server xử lý webhook" });
        }
    }
}

module.exports = new PaymentController();