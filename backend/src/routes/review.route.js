const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

router.get('/product/:productId', reviewController.getByProduct);
router.get('/', verifyToken, isAdmin, reviewController.getAll);
router.get('/search', verifyToken, isAdmin, reviewController.search);
router.delete('/:id', verifyToken, isAdmin, reviewController.delete);
router.post('/', verifyToken, reviewController.create);

module.exports = router;