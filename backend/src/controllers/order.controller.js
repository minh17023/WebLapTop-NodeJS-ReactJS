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
}

module.exports = new OrderController();