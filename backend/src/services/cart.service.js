const { CartItem, Product } = require('../models');

class CartService {
    // 1. Lấy giỏ hàng của user kèm thông tin chi tiết Laptop
    async getCart(userId) {
        return await CartItem.findAll({
            where: { user_id: userId },
            include: [{
                model: Product,
                as: 'product', // Khớp với alias trong models/index.js
                attributes: ['product_id', 'name', 'main_image', 'price', 'discount_price', 'slug']
            }],
            order: [['updated_at', 'DESC']]
        });
    }

    // 2. Thêm vào giỏ (Có rồi thì tăng số lượng, chưa có thì tạo mới)
    async addToCart(userId, productId, quantity = 1) {
        const existingItem = await CartItem.findOne({
            where: { user_id: userId, product_id: productId }
        });

        if (existingItem) {
            return await existingItem.update({ quantity: existingItem.quantity + quantity });
        }
        return await CartItem.create({ user_id: userId, product_id: productId, quantity });
    }

    // 3. Cập nhật số lượng (Khi bấm nút cộng/trừ ở giao diện)
    async updateQuantity(userId, productId, quantity) {
        return await CartItem.update(
            { quantity },
            { where: { user_id: userId, product_id: productId } }
        );
    }

    // 4. Xóa 1 món khỏi giỏ
    async removeItem(userId, productId) {
        return await CartItem.destroy({
            where: { user_id: userId, product_id: productId }
        });
    }

    // 5. Xóa sạch giỏ (Dùng sau khi đặt hàng thành công)
    async clearCart(userId) {
        return await CartItem.destroy({ where: { user_id: userId } });
    }
}

module.exports = new CartService();