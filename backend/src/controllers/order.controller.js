const orderService = require('../services/order.service');

class OrderController {
    // Xử lý Request đặt hàng mới
    async create(req, res, next) {
        try {
            // req.user.id lấy từ Middleware verifyToken sau khi giải mã JWT
            // Toàn bộ dữ liệu (bao gồm district_id, ward_code, shipping_fee) từ req.body sẽ được ném sang Service
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

    // Xử lý Request xem lịch sử đơn hàng của User (có phân trang)
    async getMyOrders(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const result = await orderService.getUserOrders(req.user.id, page, limit);
            
            res.status(200).json({
                success: true,
                pagination: {
                    totalItems: result.totalItems,
                    totalPages: result.totalPages,
                    currentPage: result.currentPage,
                    limit: result.limit
                },
                data: result.orders
            });
        } catch (error) {
            next(error);
        }
    }

    // API lấy chi tiết 1 đơn hàng: GET /api/orders/:id
    async getById(req, res) {
        try {
            const { id } = req.params; 

            const result = await orderService.getById(id);

            if (!result.success) {
                return res.status(404).json(result);
            }

            // Bảo mật: Chỉ Admin hoặc chính khách hàng mua đơn này mới được phép xem chi tiết
            const order = result.data;
            if (req.user.role !== 'admin' && req.user.id !== order.user_id) {
                return res.status(403).json({ success: false, message: "Bạn không có quyền truy cập đơn hàng này!" });
            }

            return res.status(200).json(result);
        } catch (error) {
            console.error("Lỗi tại OrderController.getById:", error);
            return res.status(500).json({ success: false, message: "Lỗi Server nội bộ" });
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
            res.status(400).json({ success: false, message: error.message });
        }
    }

    // Bắt request cập nhật thanh toán từ Admin
    async updatePaymentStatus(req, res) {
        try {
            const { id } = req.params;
            const { payment_status } = req.body;

            const validPaymentStatuses = ['unpaid', 'paid', 'refunded'];
            if (!validPaymentStatuses.includes(payment_status)) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Trạng thái thanh toán không hợp lệ (Chỉ nhận: unpaid, paid, refunded)" 
                });
            }

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

    async getAll(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const result = await orderService.getAllOrders(page, limit);
            res.status(200).json({ 
                success: true, 
                pagination: {
                    totalItems: result.totalItems,
                    totalPages: result.totalPages,
                    currentPage: result.currentPage,
                    limit: result.limit
                },
                data: result.orders 
            });
        } catch (error) {
            next(error);
        }
    }

    async search(req, res, next) {
        try {
            const keyword = req.query.q || '';
            const orders = await orderService.searchOrders(keyword);
            res.status(200).json({ success: true, data: orders });
        } catch (error) {
            next(error);
        }
    }

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

    // 🌟 BỔ SUNG: Lấy số liệu thống kê KPIs Dashboard
    async getDashboardStats(req, res, next) {
        try {
            const { startDate, endDate } = req.query;
            if (!startDate || !endDate) {
                return res.status(400).json({ success: false, message: 'Vui lòng cung cấp khoảng ngày lọc!' });
            }
            const stats = await orderService.getDashboardStats(startDate, endDate);
            return res.status(200).json({ success: true, data: stats });
        } catch (error) {
            next(error);
        }
    }

    // 🌟 BỔ SUNG: Lấy biểu đồ doanh thu theo ngày
    async getDashboardRevenueChart(req, res, next) {
        try {
            const { startDate, endDate } = req.query;
            if (!startDate || !endDate) {
                return res.status(400).json({ success: false, message: 'Vui lòng cung cấp khoảng ngày lọc!' });
            }
            const chartData = await orderService.getDashboardRevenueChart(startDate, endDate);
            return res.status(200).json({ success: true, data: chartData });
        } catch (error) {
            next(error);
        }
    }

    // 🌟 BỔ SUNG: Xuất hóa đơn PDF
    async exportInvoice(req, res, next) {
        try {
            const { id } = req.params;
            
            // Lấy thông tin chi tiết đơn hàng cùng các món hàng
            const invoiceData = await orderService.getInvoiceData(id);
            if (!invoiceData) {
                return res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại' });
            }

            const { order, items } = invoiceData;
            
            // Bảo mật: Chỉ Admin hoặc chính User mua hàng mới được xuất hóa đơn
            if (req.user.role !== 'admin' && req.user.id !== order.user_id) {
                return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập hóa đơn này!' });
            }

            // Cấu hình header tải về file PDF
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=Invoice_#${id}.pdf`);

            // Gọi tiện ích xuất PDF ghi trực tiếp vào response stream
            const { generateInvoicePDF } = require('../utils/pdf.util');
            generateInvoicePDF(order, items, res);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new OrderController();