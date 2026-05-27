const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Public API (Gắn .bind() để tránh lỗi mất context của Class)
router.get('/product/:productId', reviewController.getByProduct);

// Private API (Dành cho Admin)
router.get('/', verifyToken, isAdmin, reviewController.getAll);
router.get('/search', verifyToken, isAdmin, reviewController.search);
router.delete('/:id', verifyToken, isAdmin, reviewController.delete);

// Private API (Dành cho User)
router.post('/', verifyToken, reviewController.create);

module.exports = router;