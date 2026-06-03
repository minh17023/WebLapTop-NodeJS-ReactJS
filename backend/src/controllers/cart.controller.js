const cartService = require('../services/cart.service');

class CartController {
    async getCart(req, res, next) {
        try {
            const cart = await cartService.getCart(req.user.id);
            res.status(200).json({ success: true, data: cart });
        } catch (error) { next(error); }
    }

    async creat(req, res, next) {
        try {
            const { productId, variantId, quantity } = req.body;
            await cartService.addToCart(req.user.id, productId, variantId, quantity);
            res.status(200).json({ success: true, message: 'Đã thêm vào giỏ hàng hệ thống' });
        } catch (error) { next(error); }
    }

    async update(req, res, next) {
        try {
            const { productId, variantId, quantity } = req.body;
            await cartService.updateQuantity(req.user.id, productId, variantId, quantity);
            res.status(200).json({ success: true });
        } catch (error) { next(error); }
    }

    async remove(req, res, next) {
        try {
            const { variantId } = req.query; // Nhận variantId từ query string nếu gọi xóa
            await cartService.removeItem(req.user.id, req.params.productId, variantId);
            res.status(200).json({ success: true, message: 'Đã xóa khỏi giỏ hàng' });
        } catch (error) { next(error); }
    }

    async delete(req, res, next) {
        try {
            await cartService.deleteCart(req.user.id);
            res.status(200).json({ success: true });
        } catch (error) { next(error); }
    }
}

module.exports = new CartController();