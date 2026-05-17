const orderService = require('../services/order.service');

class OrderController {
    // Xử lý Request đặt hàng mới
    async create(req, res, next) {
        try {
            // req.user.id lấy từ Middleware verifyToken sau khi giải mã JWT
            const newOrder = await orderService.createOrder(req.user.id, req.body);
            
            res.status(201).json({
                success: true,
                message: 'Đặt hàng thành công!',
                data: newOrder
            });
        } catch (error) {
            next(error);
        }
    }

    // Xử lý Request xem lịch sử đơn hàng của User
    async getMyOrders(req, res, next) {
        try {
            const orders = await orderService.getUserOrders(req.user.id);
            
            res.status(200).json({
                success: true,
                data: orders
            });
        } catch (error) {
            next(error);
        }
    }

    // [PUT] User tự cập nhật trạng thái đơn hàng (Hủy đơn / Đã nhận hàng)
    async userUpdateStatus(req, res, next) {
        try {
            const { status } = req.body;
            const updatedOrder = await orderService.userUpdateOrderStatus(req.user.id, req.params.id, status);
            
            if (!updatedOrder) {
                return res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại hoặc không thuộc về bạn!' });
            }
            res.status(200).json({ success: true, message: 'Cập nhật đơn hàng thành công!', data: updatedOrder });
        } catch (error) {
            // Trả về lỗi 400 nếu vi phạm logic (ví dụ: Hủy đơn đang giao)
            res.status(400).json({ success: false, message: error.message });
        }
    }

    // Bắt request cập nhật thanh toán từ Admin
    async updatePaymentStatus(req, res) {
        try {
            const { id } = req.params;
            const { payment_status } = req.body;

            // Validate dữ liệu đầu vào
            const validPaymentStatuses = ['unpaid', 'paid', 'refunded'];
            if (!validPaymentStatuses.includes(payment_status)) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Trạng thái thanh toán không hợp lệ (Chỉ nhận: unpaid, paid, refunded)" 
                });
            }

            // Gọi sang Service để xử lý Database
            const result = await orderService.updatePaymentStatus(id, payment_status);

            if (!result.success) {
                return res.status(404).json(result);
            }

            return res.status(200).json(result);

        } catch (error) {
            console.error("Lỗi tại OrderController.updatePaymentStatus:", error);
            return res.status(500).json({ success: false, message: "Lỗi Server nội bộ" });
        }
    }

    // ===============================================
    // CÁC HÀM DÀNH CHO ADMIN
    // ===============================================

    // [GET] Lấy toàn bộ đơn hàng
    async getAll(req, res, next) {
        try {
            const orders = await orderService.getAllOrders();
            res.status(200).json({ success: true, data: orders });
        } catch (error) {
            next(error);
        }
    }

    // [GET] Tìm kiếm đơn hàng
    async search(req, res, next) {
        try {
            const keyword = req.query.q || '';
            const orders = await orderService.searchOrders(keyword);
            res.status(200).json({ success: true, data: orders });
        } catch (error) {
            next(error);
        }
    }

    // [PUT] Cập nhật trạng thái đơn hàng
    async updateStatus(req, res, next) {
        try {
            const { status } = req.body;
            if (!status) {
                return res.status(400).json({ success: false, message: 'Vui lòng cung cấp trạng thái mới' });
            }

            const updatedOrder = await orderService.updateOrderStatus(req.params.id, status);
            
            if (!updatedOrder) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
            }

            res.status(200).json({ 
                success: true, 
                message: 'Cập nhật trạng thái thành công', 
                data: updatedOrder 
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new OrderController();