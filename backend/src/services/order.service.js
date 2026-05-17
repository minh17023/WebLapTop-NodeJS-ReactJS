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
            full_name: user.full_name || user.fullName || 'Khách hàng', 
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
            price_at_purchase: item.price 
        }));

        await OrderItem.bulkCreate(orderItemsPayload, { transaction: t });

        // =================================================================
        // 🌟 BƯỚC C ĐÃ SỬA: CHỈ XÓA NHỮNG MÓN ĐÃ ĐƯỢC CHỌN MUA KHỎI GIỎ HÀNG
        // =================================================================
        // Lọc lấy mảng các product_id mà khách hàng thực sự nhấn mua
        const purchasedProductIds = orderData.items.map(item => item.product_id);

        await CartItem.destroy({
            where: { 
                user_id: userId,
                product_id: purchasedProductIds // Chỉ xóa sản phẩm nằm trong danh sách chốt đơn này
            },
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

    async userUpdateOrderStatus(userId, orderId, newStatus) {
        // Chỉ tìm đơn hàng khớp với ID đơn và ID của chính user đó (Bảo mật)
        const order = await Order.findOne({
            where: { order_id: orderId, user_id: userId }
        });
        if (!order) return null;

        // Logic chặn thao tác bậy bạ:
        if (newStatus === 'cancelled' && order.status !== 'pending') {
            throw new Error('Bạn chỉ có thể hủy khi đơn hàng đang chờ xác nhận!');
        }
        if (newStatus === 'delivered' && order.status !== 'shipped') {
            throw new Error('Chỉ có thể xác nhận khi đơn hàng đang được giao!');
        }

        order.status = newStatus;
        await order.save();
        return order;
    }

    // Cập nhật trạng thái thanh toán
    async updatePaymentStatus(orderId, payment_status) {
        try {
            // Đảm bảo bạn đang gọi đúng model Order của bạn
            const order = await Order.findByPk(orderId);
            
            if (!order) {
                return { success: false, message: 'Không tìm thấy đơn hàng này' };
            }

            // Cập nhật trạng thái
            order.payment_status = payment_status;

            // Logic thông minh: Nếu admin set là 'paid' và đơn đang 'pending', tự động chuyển sang 'processing'
            if (payment_status === 'paid' && order.status === 'pending') {
                order.status = 'processing';
            }

            await order.save();
            
            return { 
                success: true, 
                message: 'Cập nhật trạng thái thanh toán thành công', 
                data: order 
            };
        } catch (error) {
            console.error("Lỗi tại OrderService.updatePaymentStatus:", error);
            throw error; // Ném lỗi ra cho Controller bắt
        }
    }

    // ===============================================
    // CÁC HÀM DÀNH CHO ADMIN (QUẢN LÝ ĐƠN HÀNG)
    // ===============================================

    // 1. Lấy toàn bộ danh sách đơn hàng
    async getAllOrders() {
        return await Order.findAll({
            include: [{
                model: OrderItem,
                as: 'items',
                include: [{
                    model: Product,
                    as: 'product',
                    attributes: ['name', 'main_image'] // Admin cần xem ảnh và tên sp trong đơn
                }]
            }],
            order: [['created_at', 'DESC']]
        });
    }

    // 2. Tìm kiếm đơn hàng (Theo tên khách, số điện thoại hoặc mã đơn hàng)
    async searchOrders(keyword) {
        const term = `%${keyword.trim()}%`;
        
        // Kiểm tra xem keyword có phải là một số không (để tìm theo mã ID)
        const isNumeric = !isNaN(keyword) && keyword.trim() !== '';
        
        const whereCondition = {
            [Op.or]: [
                { full_name: { [Op.iLike]: term } },
                { phone: { [Op.iLike]: term } }
            ]
        };

        if (isNumeric) {
            whereCondition[Op.or].push({ order_id: Number(keyword) });
        }

        return await Order.findAll({
            where: whereCondition,
            include: [{
                model: OrderItem,
                as: 'items',
                include: [{
                    model: Product,
                    as: 'product',
                    attributes: ['name', 'main_image']
                }]
            }],
            order: [['created_at', 'DESC']]
        });
    }

    // 3. Cập nhật trạng thái đơn hàng
    async updateOrderStatus(orderId, newStatus) {
        const order = await Order.findByPk(orderId);
        if (!order) return null;

        // Nếu trạng thái là 'cancelled' (Hủy đơn), có thể bạn sẽ muốn viết thêm logic 
        // cộng lại số lượng (stock) cho bảng Product ở đây.

        order.status = newStatus;
        await order.save();
        return order;
    }
}

module.exports = new OrderService();