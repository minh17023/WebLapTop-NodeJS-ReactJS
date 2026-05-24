const express = require('express');
const router = express.Router();
const shippingController = require('../controllers/shipping.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.get('/provinces', verifyToken, shippingController.getProvinces);
router.get('/districts/:provinceId', verifyToken, shippingController.getDistricts);
router.get('/wards/:districtId', verifyToken, shippingController.getWards);
router.post('/fee', verifyToken, shippingController.calculateFee);

module.exports = router;