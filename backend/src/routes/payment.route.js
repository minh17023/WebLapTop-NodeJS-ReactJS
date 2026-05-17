const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

router.post('/sepay-webhook', paymentController.sepayWebhook);

module.exports = router;