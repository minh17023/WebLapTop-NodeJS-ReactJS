const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
// 🌟 Nhớ import thêm isAdmin
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware'); 

// ===============================================
// ROUTE DÀNH CHO ADMIN (Phải có isAdmin)
// ===============================================
// Lấy toàn bộ
router.get('/', verifyToken, isAdmin, orderController.getAll);
// Tìm kiếm
router.get('/search', verifyToken, isAdmin, orderController.search);

// 🌟 BỔ SUNG: Route Thống kê Dashboard dành cho Admin
router.get('/dashboard/stats', verifyToken, isAdmin, orderController.getDashboardStats);
router.get('/dashboard/revenue-chart', verifyToken, isAdmin, orderController.getDashboardRevenueChart);

// [PUT] User tự cập nhật trạng thái đơn hàng (Hủy đơn / Đã nhận hàng)
router.put('/:id/user-status', verifyToken, orderController.userUpdateStatus);
// Cập nhật trạng thái
router.put('/:id/status', verifyToken, isAdmin, orderController.updateStatus);

router.put('/:id/payment-status', verifyToken, isAdmin, orderController.updatePaymentStatus);

//  Route Xuất hóa đơn PDF
router.get('/:id/invoice', verifyToken, orderController.exportInvoice);

router.post('/', verifyToken, orderController.create);
router.get('/my-orders', verifyToken, orderController.getMyOrders);
router.get('/:id', verifyToken, orderController.getById);

module.exports = router;