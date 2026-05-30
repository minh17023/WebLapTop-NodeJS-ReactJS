const { Order, OrderItem, Product, User, CartItem, sequelize } = require('../models');
const ghnService = require('./shipping.service');
const { Op } = require('sequelize');

class OrderService {
    // 1. Logic Tiến hành Đặt Hàng
    async createOrder(userId, orderData) {
        const t = await sequelize.transaction();
        try {
            // Lấy thông tin họ tên và email của User từ DB để làm hóa đơn
            const user = await User.findByPk(userId);
            if (!user) throw new Error('Tài khoản người dùng không tồn tại');

            // Tính toán tiền hàng từ danh sách sản phẩm Frontend gửi lên
            let itemsAmount = 0;
            for (const item of orderData.items) {
                itemsAmount += Number(item.price) * Number(item.quantity);
            }

            // 🌟 BỔ SUNG: Tính phí ship và cộng vào tổng tiền cuối cùng
            const shippingFee = Number(orderData.shipping_fee) || 0;
            const totalAmount = itemsAmount + shippingFee;

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
                order_note: orderData.order_note || null,
                
                // 🌟 BỔ SUNG: Lưu thông tin Giao Hàng Nhanh
                shipping_fee: shippingFee,
                district_id: orderData.district_id || null,
                ward_code: orderData.ward_code || null,
                tracking_code: null // Sẽ tự cập nhật sau khi đẩy đơn sang GHN thành công
            }, { transaction: t });

            // Bước B: Chuẩn bị dữ liệu và lưu hàng loạt vào bảng Chi tiết hóa đơn (order_items)
            const orderItemsPayload = orderData.items.map(item => ({
                order_id: newOrder.order_id,
                product_id: item.product_id,
                quantity: item.quantity,
                price_at_purchase: item.price 
            }));

            await OrderItem.bulkCreate(orderItemsPayload, { transaction: t });

            // Bước C: CHỈ XÓA NHỮNG MÓN ĐÃ ĐƯỢC CHỌN MUA KHỎI GIỎ HÀNG
            const purchasedProductIds = orderData.items.map(item => item.product_id);

            await CartItem.destroy({
                where: { 
                    user_id: userId,
                    product_id: purchasedProductIds 
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

    // 2. Logic Xem Lịch sử Đơn hàng (Dành cho trang cá nhân của Khách, có phân trang)
    async getUserOrders(userId, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const { rows, count } = await Order.findAndCountAll({
            where: { user_id: userId },
            include: [{
                model: OrderItem,
                as: 'items', 
                include: [{
                    model: Product,
                    as: 'product',
                    attributes: ['name', 'main_image', 'slug']
                }]
            }],
            limit: Number(limit),
            offset: Number(offset),
            order: [['created_at', 'DESC']]
        });

        return {
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            limit: Number(limit),
            orders: rows
        };
    }

    async getById(orderId) {
        try {
            const order = await Order.findByPk(orderId);
            
            if (!order) {
                return { success: false, message: 'Không tìm thấy đơn hàng này' };
            }

            return { success: true, data: order };
        } catch (error) {
            console.error("Lỗi tại OrderService.getById:", error);
            throw error;
        }
    }

    async userUpdateOrderStatus(userId, orderId, newStatus) {
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
            const order = await Order.findByPk(orderId);
            
            if (!order) {
                return { success: false, message: 'Không tìm thấy đơn hàng này' };
            }

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
            throw error; 
        }
    }

    // ===============================================
    // CÁC HÀM DÀNH CHO ADMIN (QUẢN LÝ ĐƠN HÀNG)
    // ===============================================

    async getAllOrders(page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const { rows, count } = await Order.findAndCountAll({
            include: [{
                model: OrderItem,
                as: 'items',
                include: [{
                    model: Product,
                    as: 'product',
                    attributes: ['name', 'main_image']
                }]
            }],
            limit: Number(limit),
            offset: Number(offset),
            order: [['created_at', 'DESC']]
        });

        return {
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            limit: Number(limit),
            orders: rows
        };
    }

    async searchOrders(keyword) {
        const term = `%${keyword.trim()}%`;
        
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

    async updateOrderStatus(orderId, newStatus) {
        // Tìm đơn hàng kèm theo danh sách sản phẩm bên trong nó
        const order = await Order.findByPk(orderId, {
            include: [{
                model: OrderItem,
                as: 'items',
                include: [{ model: Product, as: 'product' }]
            }]
        });
        
        if (!order) return null;

        if (newStatus === 'shipped' && !order.tracking_code) {
            // 1. Format lại danh sách sản phẩm cho chuẩn với GHN và tính các thông số động
            let totalWeight = 0;
            let maxLength = 0;
            let maxWidth = 0;
            let totalHeight = 0;

            const ghnItems = order.items.map(item => {
                const specs = item.product && item.product.specifications ? item.product.specifications : {};
                const q = item.quantity;
                const w = specs.weight ? Number(specs.weight) : 2000;
                const l = specs.length ? Number(specs.length) : 35;
                const wd = specs.width ? Number(specs.width) : 25;
                const h = specs.height ? Number(specs.height) : 10;

                totalWeight += w * q;
                if (l > maxLength) maxLength = l;
                if (wd > maxWidth) maxWidth = wd;
                totalHeight += h * q;

                return {
                    name: item.product ? item.product.name : 'Laptop HNC',
                    quantity: q,
                    weight: w
                };
            });

            // Nếu kích thước bằng 0 thì dùng mặc định
            if (maxLength === 0) maxLength = 35;
            if (maxWidth === 0) maxWidth = 25;
            if (totalHeight === 0) totalHeight = 10;
            if (totalWeight === 0) totalWeight = 2000;
            
            const totalAmountInt = Math.round(Number(order.total_amount));
            const codAmount = order.payment_status === 'unpaid' ? totalAmountInt : 0;
            // 2. Gọi API tạo đơn sang GHN
            const trackingCode = await ghnService.createShippingOrder({
                customer_name: order.full_name,
                customer_phone: order.phone,
                shipping_address: order.shipping_address,
                ward_code: order.ward_code,
                district_id: order.district_id,
                note: order.order_note,
                cod_amount: codAmount,
                items: ghnItems,
                // Đẩy thông số động
                weight: totalWeight,
                length: maxLength,
                width: maxWidth,
                height: totalHeight,
                insurance_value: Math.min(totalAmountInt, 5000000) // Luôn bảo hiểm 100% giá trị đơn hàng, tối đa 5tr cho môi trường dev!
            });

            // 3. Cập nhật mã vận đơn vừa lấy được vào Database
            order.tracking_code = trackingCode;
        }

        // Cập nhật trạng thái mới và lưu lại
        order.status = newStatus;
        await order.save();
        return order;
    }

    // 🌟 BỔ SUNG: Lấy dữ liệu chi tiết hóa đơn
    async getInvoiceData(orderId) {
        const order = await Order.findByPk(orderId);
        if (!order) return null;

        const items = await OrderItem.findAll({
            where: { order_id: orderId },
            include: [{
                model: Product,
                as: 'product',
                attributes: ['name', 'main_image']
            }]
        });

        return { order, items };
    }

    // 🌟 BỔ SUNG: Tính toán dữ liệu thống kê Dashboard KPIs
    async getDashboardStats(startDate, endDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        // Lấy tất cả đơn hàng trong kỳ lọc
        const filteredOrders = await Order.findAll({
            where: {
                created_at: { [Op.between]: [start, end] }
            },
            order: [['created_at', 'DESC']]
        });

        // 1. Tổng doanh thu (không tính đơn hủy)
        const totalRevenue = filteredOrders
            .filter(o => o.status !== 'cancelled')
            .reduce((sum, o) => sum + Number(o.total_amount), 0);

        // 2. Tổng đơn hàng trong kỳ
        const totalOrders = filteredOrders.length;

        // 3. Tổng số khách hàng
        const totalCustomers = await User.count({
            where: { role: { [Op.ne]: 'admin' } }
        });

        // 4. Tổng số sản phẩm
        const totalProducts = await Product.count();

        // 5. Thống kê trạng thái đơn hàng
        const statusMap = { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
        filteredOrders.forEach(o => {
            if (statusMap[o.status] !== undefined) statusMap[o.status]++;
        });

        const orderStatusData = [
            { name: 'Chờ xác nhận', count: statusMap.pending, fill: '#EAB308' },
            { name: 'Đang xử lý', count: statusMap.processing, fill: '#3B82F6' },
            { name: 'Đang giao', count: statusMap.shipped, fill: '#A855F7' },
            { name: 'Đã giao', count: statusMap.delivered, fill: '#22C55E' },
            { name: 'Đã hủy', count: statusMap.cancelled, fill: '#EF4444' }
        ];

        // 6. Lấy 5 đơn hàng mới nhất
        const recentOrders = filteredOrders.slice(0, 5).map(o => ({
            id: o.order_id || o.id,
            customer: o.full_name,
            total: o.total_amount,
            status: o.status,
            date: new Date(o.created_at || o.createdAt).toLocaleString('vi-VN')
        }));

        return {
            totalRevenue,
            totalOrders,
            totalCustomers,
            totalProducts,
            orderStatusData,
            recentOrders
        };
    }

    // 🌟 BỔ SUNG: Tính toán dữ liệu biểu đồ doanh thu
    async getDashboardRevenueChart(startDate, endDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const filteredOrders = await Order.findAll({
            where: {
                created_at: { [Op.between]: [start, end] }
            }
        });

        const dateList = [];
        let currentLoopDate = new Date(start);
        while (currentLoopDate <= end) {
            dateList.push(currentLoopDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }));
            currentLoopDate.setDate(currentLoopDate.getDate() + 1);
        }

        const revenueMap = {};
        dateList.forEach(d => revenueMap[d] = 0);

        filteredOrders.forEach(o => {
            if (o.status !== 'cancelled') {
                const dateStr = new Date(o.created_at || o.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
                if (revenueMap[dateStr] !== undefined) {
                    revenueMap[dateStr] += Number(o.total_amount);
                }
            }
        });

        const revenueData = dateList.map(date => ({
            name: date,
            total: revenueMap[date]
        }));

        return revenueData;
    }
}

module.exports = new OrderService();