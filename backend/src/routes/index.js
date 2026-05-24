const express = require('express');
const router = express.Router();
const productRoute = require('./product.route');
const userRoute = require('./user.route'); 
const categoryRoute = require('./category.route'); 
const postRoute = require('./post.route');
const reviewRoute = require('./review.route');
const orderRoute = require('./order.route');
const cartRoute = require('./cart.route');
const chatRoute = require('./chat.route');
const paymentRoute = require('./payment.route');
const shippingRoutes = require('./shipping.route');

router.use('/products', productRoute);
router.use('/users', userRoute);
router.use('/categories', categoryRoute);
router.use('/posts', postRoute);
router.use('/reviews', reviewRoute); 
router.use('/orders', orderRoute);
router.use('/cart', cartRoute);
router.use('/chat', chatRoute);
router.use('/payment', paymentRoute);
router.use('/shipping', shippingRoutes);

module.exports = router;