const { CartItem, Product, ProductVariant } = require('../models');

class CartService {
    async getCart(userId) {
        return await CartItem.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: Product,
                    as: 'product',
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

    async addToCart(userId, productId, variantId, quantity = 1) {
        if (!variantId) throw new Error('Vui lòng chọn cấu hình sản phẩm (variant_id)');

        const variant = await ProductVariant.findByPk(variantId);
        if (!variant) throw new Error('Cấu hình sản phẩm không tồn tại');

        const existingItem = await CartItem.findOne({
            where: { user_id: userId, product_id: productId, variant_id: variantId }
        });

        const currentQuantity = existingItem ? existingItem.quantity : 0;
        const newTotalQuantity = currentQuantity + quantity;

        if (newTotalQuantity > variant.stock_quantity) {
            throw new Error(`Sản phẩm không đủ hàng (Trong kho chỉ còn ${variant.stock_quantity})`);
        }

        if (existingItem) {
            return await existingItem.update({ quantity: newTotalQuantity });
        }
        return await CartItem.create({ user_id: userId, product_id: productId, variant_id: variantId, quantity });
    }

    async updateQuantity(userId, productId, variantId, quantity) {
        if (!variantId) throw new Error('Vui lòng chọn cấu hình sản phẩm (variant_id)');

        const variant = await ProductVariant.findByPk(variantId);
        if (!variant) throw new Error('Cấu hình sản phẩm không tồn tại');

        if (quantity > variant.stock_quantity) {
            throw new Error(`Chỉ có thể mua tối đa ${variant.stock_quantity} sản phẩm`);
        }

        let whereCondition = { user_id: userId, product_id: productId };
        if (variantId) whereCondition.variant_id = variantId;

        return await CartItem.update(
            { quantity },
            { where: whereCondition }
        );
    }

    async removeItem(userId, productId, variantId) {
        let whereCondition = { user_id: userId, product_id: productId };
        if (variantId) whereCondition.variant_id = variantId;

        return await CartItem.destroy({
            where: whereCondition
        });
    }

    async deleteCart(userId) {
        return await CartItem.destroy({ where: { user_id: userId } });
    }
}

module.exports = new CartService();