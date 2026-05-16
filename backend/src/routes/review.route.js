const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Public API
router.get('/product/:productId', reviewController.getByProduct);

// Private API
router.post('/', verifyToken, reviewController.create); // User đăng nhập mới được đánh giá
router.delete('/:id', verifyToken, isAdmin, reviewController.delete); // Admin quản lý

module.exports = router;