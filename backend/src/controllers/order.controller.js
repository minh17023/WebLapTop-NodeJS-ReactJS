const orderService = require('../services/order.service');

class OrderController {
    async create(req, res, next) {
        try {
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

    async getById(req, res) {
        try {
            const { id } = req.params; 

            const result = await orderService.getById(id);

            if (!result.success) {
                return res.status(404).json(result);
            }

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

    //Lấy số liệu thống kê KPIs Dashboard
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

    //Lấy biểu đồ doanh thu theo ngày
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

    //Xuất hóa đơn PDF
    async exportInvoice(req, res, next) {
        try {
            const { id } = req.params;
            
            const invoiceData = await orderService.getInvoiceData(id);
            if (!invoiceData) {
                return res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại' });
            }

            const { order, items } = invoiceData;
            
            if (req.user.role !== 'admin' && req.user.id !== order.user_id) {
                return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập hóa đơn này!' });
            }

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=Invoice_#${id}.pdf`);

            const { generateInvoicePDF } = require('../utils/pdf.util');
            generateInvoicePDF(order, items, res);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new OrderController();