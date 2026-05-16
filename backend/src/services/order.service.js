const { Order, OrderItem, Product, User, CartItem, sequelize } = require('../models');

class OrderService {
    // 1. Logic Tiến hành Đặt Hàng
    async createOrder(userId, orderData) {
        const t = await sequelize.transaction();
        try {
            // Lấy thông tin họ tên và email của User từ DB để làm hóa đơn
            const user = await User.findByPk(userId);
            if (!user) throw new Error('Tài khoản người dùng không tồn tại');

            // Tính toán tổng tiền từ danh sách sản phẩm Frontend gửi lên
            let totalAmount = 0;
            for (const item of orderData.items) {
                totalAmount += Number(item.price) * Number(item.quantity);
            }

            // Bước A: Tạo hóa đơn chính (Bảng orders)
            const newOrder = await Order.create({
                user_id: userId,
                full_name: user.full_name || user.fullName || 'Khách hàng', // Linh động theo tên cột User của bạn
                email: user.email,
                phone: orderData.phone,
                shipping_address: orderData.shipping_address,
                total_amount: totalAmount,
                payment_method: orderData.payment_method || 'COD',
                status: 'pending',
                order_note: orderData.order_note || null
            }, { transaction: t });

            // Bước B: Chuẩn bị dữ liệu và lưu hàng loạt vào bảng Chi tiết hóa đơn (order_items)
            const orderItemsPayload = orderData.items.map(item => ({
                order_id: newOrder.order_id,
                product_id: item.product_id,
                quantity: item.quantity,
                price_at_purchase: item.price // Khớp 100% với cột price_at_purchase của bạn
            }));

            await OrderItem.bulkCreate(orderItemsPayload, { transaction: t });

            // Bước C: ĐẶC BIỆT QUAN TRỌNG - Xóa sạch giỏ hàng trong DB sau khi đặt hàng thành công
            await CartItem.destroy({
                where: { user_id: userId },
                transaction: t
            });

            // Hoàn tất mọi tiến trình lưu trữ
            await t.commit();
            return newOrder;
        } catch (error) {
            // Nếu có bất kỳ lỗi nào, hoàn nguyên dữ liệu lại từ đầu
            await t.rollback();
            throw error;
        }
    }

    // 2. Logic Xem Lịch sử Đơn hàng (Dành cho trang cá nhân của Khách)
    async getUserOrders(userId) {
        return await Order.findAll({
            where: { user_id: userId },
            include: [{
                model: OrderItem,
                as: 'items', // Khớp với alias thiết lập ở models/index.js
                include: [{
                    model: Product,
                    as: 'product',
                    attributes: ['name', 'main_image', 'slug']
                }]
            }],
            order: [['created_at', 'DESC']] // Đơn hàng mới nhất xếp lên đầu
        });
    }
}

module.exports = new OrderService();