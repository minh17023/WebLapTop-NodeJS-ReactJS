const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

router.get('/', productController.getAll);
router.get('/category/:slug', productController.getByCategory);
router.get('/search', productController.search);
router.get('/:slug', productController.getBySlug);
router.post('/', verifyToken, isAdmin, productController.create);
router.put('/:id', verifyToken, isAdmin, productController.update);
router.delete('/:id', verifyToken, isAdmin, productController.delete);

module.exports = router;