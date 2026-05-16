const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// API Public (Ai cũng truy cập được)
router.post('/register', userController.register);
router.post('/login', userController.login);

// ================= CRUD API =================

// Xem thông tin chi tiết (Yêu cầu phải đăng nhập)
router.get('/:id', verifyToken, userController.getById);

// Cập nhật thông tin cá nhân (Yêu cầu phải đăng nhập)
router.put('/:id', verifyToken, userController.update);

// API Dành riêng cho Admin
// Lấy danh sách toàn bộ người dùng
router.get('/', verifyToken, isAdmin, userController.getAll);

// Xóa người dùng
router.delete('/:id', verifyToken, isAdmin, userController.delete);

module.exports = router;