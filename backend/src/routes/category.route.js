const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

router.get('/', categoryController.getAll);
router.get('/search', categoryController.search);
router.get('/:slug', categoryController.getBySlug);

router.post('/', verifyToken, isAdmin, categoryController.create);
router.put('/:id', verifyToken, isAdmin, categoryController.update);
router.delete('/:id', verifyToken, isAdmin, categoryController.delete);

module.exports = router;