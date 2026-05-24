const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Private API (Chỉ Admin mới được quản lý bài viết) - Đưa lên trước để tránh xung đột với :slug
router.get('/search', verifyToken, isAdmin, postController.search);

// Public API
router.get('/', postController.getAll);
router.get('/:slug', postController.getBySlug);

// Private API khác dành cho Admin
router.post('/', verifyToken, isAdmin, postController.create);
router.put('/:id', verifyToken, isAdmin, postController.update);
router.delete('/:id', verifyToken, isAdmin, postController.delete);

module.exports = router;