const { Order } = require('../models');

class PaymentService {
    /**
     * Xử lý dữ liệu webhook từ SePay để tự động xác nhận thanh toán đơn hàng
     * @param {Object} webhookData - Dữ liệu giao dịch từ SePay
     */
    async processSepayWebhook(webhookData) {
        const { transferAmount, content, transferType } = webhookData;

        // 1. Chỉ xử lý khi có dòng tiền VÀO tài khoản (in)
        if (transferType !== 'in') {
            return { success: false, message: "Bỏ qua giao dịch chi tiền (out)" };
        }

        // 2. Tách mã đơn hàng từ nội dung chuyển khoản. Cú pháp: HNC + Mã đơn (VD: HNC15)
        // Dùng Regex tìm chữ HNC (không phân biệt hoa thường) và các con số phía sau
        const orderIdMatch = content.match(/HNC(\d+)/i); 
        if (!orderIdMatch) {
            return { success: false, message: "Nội dung chuyển khoản không có mã đơn hàng hợp lệ (HNCxxx)" };
        }

        const orderId = orderIdMatch[1]; 

        // 3. Tìm đơn hàng trong Database
        const order = await Order.findByPk(orderId);
        if (!order) {
            return { success: false, message: `Không tìm thấy đơn hàng #${orderId}` };
        }

        // 4. Nếu đơn hàng đã được thanh toán rồi thì bỏ qua
        if (order.payment_status !== 'unpaid') {
            return { success: false, message: `Đơn hàng #${orderId} đã ở trạng thái thanh toán: ${order.payment_status}` };
        }

        // 5. Kiểm tra xem khách chuyển đủ tiền hàng chưa
        if (Number(transferAmount) >= Number(order.total_amount)) {
            // Gạch nợ thành công! Cập nhật trạng thái thanh toán & trạng thái đơn hàng
            order.payment_status = 'paid';
            order.status = 'processing'; // Chuyển sang đang chuẩn bị hàng
            await order.save();
            
            console.log(`[SEPAY] Đã tự động xác nhận thanh toán cho đơn #${orderId}`);
            return { success: true, message: `Đã xác nhận thanh toán tự động thành công cho đơn #${orderId}`, data: order };
        } else {
            console.log(`[SEPAY] Đơn #${orderId} chuyển THIẾU tiền (Nhận: ${transferAmount}, Cần: ${order.total_amount})`);
            return { success: false, message: `Giao dịch chuyển thiếu tiền cho đơn #${orderId} (Nhận: ${transferAmount}, Cần: ${order.total_amount})` };
        }
    }
}

module.exports = new PaymentService();
