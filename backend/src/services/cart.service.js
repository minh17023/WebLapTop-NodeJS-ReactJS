const { CartItem, Product, ProductVariant } = require('../models');

class CartService {
    // 1. Lấy giỏ hàng của user kèm thông tin chi tiết Laptop
    async getCart(userId) {
        return await CartItem.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: Product,
                    as: 'product', // Khớp với alias trong models/index.js
                    attributes: ['product_id', 'name', 'main_image', 'slug']
                },
                {
                    model: ProductVariant,
                    as: 'variant'
                }
            ],
            order: [['updated_at', 'DESC']]
        });
    }

    // 2. Thêm vào giỏ (Có rồi thì tăng số lượng, chưa có thì tạo mới)
    async addToCart(userId, productId, variantId, quantity = 1) {
        if (!variantId) throw new Error('Vui lòng chọn cấu hình sản phẩm (variant_id)');

        const existingItem = await CartItem.findOne({
            where: { user_id: userId, product_id: productId, variant_id: variantId }
        });

        if (existingItem) {
            return await existingItem.update({ quantity: existingItem.quantity + quantity });
        }
        return await CartItem.create({ user_id: userId, product_id: productId, variant_id: variantId, quantity });
    }

    // 3. Cập nhật số lượng (Khi bấm nút cộng/trừ ở giao diện)
    async updateQuantity(userId, productId, variantId, quantity) {
        let whereCondition = { user_id: userId, product_id: productId };
        if (variantId) whereCondition.variant_id = variantId;

        return await CartItem.update(
            { quantity },
            { where: whereCondition }
        );
    }

    // 4. Xóa 1 món khỏi giỏ
    async removeItem(userId, productId, variantId) {
        let whereCondition = { user_id: userId, product_id: productId };
        if (variantId) whereCondition.variant_id = variantId;

        return await CartItem.destroy({
            where: whereCondition
        });
    }

    // 5. Xóa sạch giỏ (Dùng sau khi đặt hàng thành công)
    async deleteCart(userId) {
        return await CartItem.destroy({ where: { user_id: userId } });
    }
}

module.exports = new CartService();