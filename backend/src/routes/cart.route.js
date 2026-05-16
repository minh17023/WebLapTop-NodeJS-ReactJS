const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Đăng nhập mới được dùng giỏ hàng hệ thống
router.use(verifyToken);

router.get('/', cartController.getCart);
router.post('/add', cartController.add);
router.put('/update', cartController.update);
router.delete('/:productId', cartController.remove);
router.delete('/', cartController.clear);

module.exports = router;