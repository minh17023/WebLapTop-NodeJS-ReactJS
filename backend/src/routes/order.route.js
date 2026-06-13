const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware'); 

router.get('/', verifyToken, isAdmin, orderController.getAll);
router.get('/search', verifyToken, isAdmin, orderController.search);

router.get('/dashboard/stats', verifyToken, isAdmin, orderController.getDashboardStats);
router.get('/dashboard/revenue-chart', verifyToken, isAdmin, orderController.getDashboardRevenueChart);

router.put('/:id/user-status', verifyToken, orderController.userUpdateStatus);
router.put('/:id/status', verifyToken, isAdmin, orderController.updateStatus);

router.put('/:id/payment-status', verifyToken, isAdmin, orderController.updatePaymentStatus);

router.get('/:id/invoice', verifyToken, orderController.exportInvoice);

router.post('/', verifyToken, orderController.create);
router.get('/my-orders', verifyToken, orderController.getMyOrders);
router.get('/:id', verifyToken, orderController.getById);

module.exports = router;