const { Order } = require('../models');

class PaymentService {
    async processSepayWebhook(webhookData) {
        const { transferAmount, content, transferType } = webhookData;

        if (transferType !== 'in') {
            return { success: false, message: "Bỏ qua giao dịch chi tiền (out)" };
        }

        const orderIdMatch = content.match(/HNC(\d+)/i); 
        if (!orderIdMatch) {
            return { success: false, message: "Nội dung chuyển khoản không có mã đơn hàng hợp lệ (HNCxxx)" };
        }

        const orderId = orderIdMatch[1]; 

        const order = await Order.findByPk(orderId);
        if (!order) {
            return { success: false, message: `Không tìm thấy đơn hàng #${orderId}` };
        }

        if (order.payment_status !== 'unpaid') {
            return { success: false, message: `Đơn hàng #${orderId} đã ở trạng thái thanh toán: ${order.payment_status}` };
        }

        if (Number(transferAmount) >= Number(order.total_amount)) {
            order.payment_status = 'paid';
            order.status = 'processing';
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
