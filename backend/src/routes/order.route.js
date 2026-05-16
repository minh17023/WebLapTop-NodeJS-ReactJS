const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Áp dụng bộ lọc đăng nhập cho toàn bộ các API bên dưới
router.use(verifyToken);

// Đường dẫn tạo đơn hàng mới (POST: http://localhost:8080/api/orders)
router.post('/', orderController.create);

// Đường dẫn lấy lịch sử đơn hàng (GET: http://localhost:8080/api/orders/my-orders)
router.get('/my-orders', orderController.getMyOrders);

module.exports = router;