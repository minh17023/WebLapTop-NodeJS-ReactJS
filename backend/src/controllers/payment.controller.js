const db = require('../models');
const Order = db.Order || db.order || db.orders;

class PaymentController {
    async sepayWebhook(req, res) {
        try {
            // Lấy dữ liệu SePay bắn về (transferAmount: số tiền, content: nội dung CK, transferType: in/out)
            const { transferAmount, content, transferType } = req.body;

            // 1. Chỉ xử lý khi có dòng tiền VÀO tài khoản (in)
            if (transferType === 'in') {
                
                // 2. Tách mã đơn hàng từ nội dung chuyển khoản. Cú pháp: HNC + Mã đơn (VD: HNC15)
                // Dùng Regex tìm chữ HNC (không phân biệt hoa thường) và các con số phía sau
                const orderIdMatch = content.match(/HNC(\d+)/i); 

                if (orderIdMatch) {
                    const orderId = orderIdMatch[1]; 

                    // 3. Tìm đơn hàng trong Database
                    const order = await Order.findByPk(orderId);

                    // 4. Nếu đơn hàng tồn tại và chưa thanh toán
                    if (order && order.payment_status === 'unpaid') {
                        // Kiểm tra xem khách có chuyển đủ tiền không
                        if (Number(transferAmount) >= Number(order.total_amount)) {
                            
                            // Gạch nợ thành công! Cập nhật trạng thái
                            order.payment_status = 'paid';
                            order.status = 'processing'; // Chuyển sang đang chuẩn bị hàng
                            await order.save();
                            
                            console.log(`[SEPAY] Đã tự động xác nhận thanh toán cho đơn #${orderId}`);
                        } else {
                            console.log(`[SEPAY] Đơn #${orderId} chuyển THIẾU tiền (Nhận: ${transferAmount}, Cần: ${order.total_amount})`);
                        }
                    }
                }
            }

            // Trả về 200 OK để SePay biết bạn đã nhận được tin nhắn (nếu không nó sẽ gửi lại liên tục)
            return res.status(200).json({ success: true, message: "Đã nhận Webhook" });

        } catch (error) {
            console.error("Lỗi xử lý Webhook SePay:", error);
            return res.status(200).json({ success: false, message: "Lỗi server nhưng vẫn báo 200 để SePay ngừng gửi" });
        }
    }
}

module.exports = new PaymentController();