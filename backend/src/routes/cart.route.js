const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.get('/', cartController.getCart);
router.post('/add', cartController.creat);
router.put('/update', cartController.update);
router.delete('/:productId', cartController.remove);
router.delete('/', cartController.delete);

module.exports = router;