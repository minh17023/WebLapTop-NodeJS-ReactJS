const { Order, OrderItem, Product, ProductVariant, User, CartItem, sequelize } = require('../models');
const ghnService = require('./shipping.service');
const { Op } = require('sequelize');

class OrderService {
    async createOrder(userId, orderData) {
        const t = await sequelize.transaction();
        try {
            const user = await User.findByPk(userId);
            if (!user) throw new Error('Tài khoản người dùng không tồn tại');

            let itemsAmount = 0;
            for (const item of orderData.items) {
                itemsAmount += Number(item.price) * Number(item.quantity);
            }

            const shippingFee = Number(orderData.shipping_fee) || 0;
            const totalAmount = itemsAmount + shippingFee;

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
                
                shipping_fee: shippingFee,
                district_id: orderData.district_id || null,
                ward_code: orderData.ward_code || null,
                tracking_code: null
            }, { transaction: t });

            const orderItemsPayload = orderData.items.map(item => ({
                order_id: newOrder.order_id,
                product_id: item.product_id,
                variant_id: item.variant_id,
                quantity: item.quantity,
                price_at_purchase: item.price 
            }));

            await OrderItem.bulkCreate(orderItemsPayload, { transaction: t });

            for (const item of orderData.items) {
                if (!item.variant_id) throw new Error('Đơn hàng có sản phẩm thiếu cấu hình (variant_id)');
                const variant = await ProductVariant.findByPk(item.variant_id, { 
                    transaction: t,
                    lock: t.LOCK.UPDATE // Khóa dòng (Row-level lock) để chống Race Condition
                });
                if (!variant) throw new Error(`Không tìm thấy biến thể sản phẩm (ID: ${item.variant_id})`);
                if (variant.stock_quantity < item.quantity) {
                    throw new Error(`Sản phẩm không đủ hàng (Chỉ còn ${variant.stock_quantity} sản phẩm)`);
                }
                variant.stock_quantity -= item.quantity;
                await variant.save({ transaction: t });
            }

            for (const item of orderData.items) {
                await CartItem.destroy({
                    where: { 
                        user_id: userId,
                        product_id: item.product_id,
                        variant_id: item.variant_id
                    },
                    transaction: t
                });
            }

            await t.commit();
            return newOrder;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    async getUserOrders(userId, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const { rows, count } = await Order.findAndCountAll({
            where: { user_id: userId },
            include: [{
                model: OrderItem,
                as: 'items', 
                include: [
                    {
                        model: Product,
                        as: 'product',
                        attributes: ['name', 'main_image', 'slug']
                    },
                    {
                        model: ProductVariant,
                        as: 'variant'
                    }
                ]
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

    async updatePaymentStatus(orderId, payment_status) {
        try {
            const order = await Order.findByPk(orderId);
            
            if (!order) {
                return { success: false, message: 'Không tìm thấy đơn hàng này' };
            }

            order.payment_status = payment_status;

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

    async getAllOrders(page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const { rows, count } = await Order.findAndCountAll({
            include: [{
                model: OrderItem,
                as: 'items',
                include: [
                    {
                        model: Product,
                        as: 'product',
                        attributes: ['name', 'main_image']
                    },
                    {
                        model: ProductVariant,
                        as: 'variant'
                    }
                ]
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
                include: [
                    {
                        model: Product,
                        as: 'product',
                        attributes: ['name', 'main_image']
                    },
                    {
                        model: ProductVariant,
                        as: 'variant'
                    }
                ]
            }],
            order: [['created_at', 'DESC']]
        });
    }

    async updateOrderStatus(orderId, newStatus) {
        const order = await Order.findByPk(orderId, {
            include: [{
                model: OrderItem,
                as: 'items',
                include: [
                    { model: Product, as: 'product' },
                    { model: ProductVariant, as: 'variant' }
                ]
            }]
        });
        
        if (!order) return null;

        if (newStatus === 'shipped' && !order.tracking_code) {
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

            if (maxLength === 0) maxLength = 35;
            if (maxWidth === 0) maxWidth = 25;
            if (totalHeight === 0) totalHeight = 10;
            if (totalWeight === 0) totalWeight = 2000;
            
            const totalAmountInt = Math.round(Number(order.total_amount));
            const codAmount = order.payment_status === 'unpaid' ? totalAmountInt : 0;
            const trackingCode = await ghnService.createShippingOrder({
                customer_name: order.full_name,
                customer_phone: order.phone,
                shipping_address: order.shipping_address,
                ward_code: order.ward_code,
                district_id: order.district_id,
                note: order.order_note,
                cod_amount: codAmount,
                items: ghnItems,
                weight: totalWeight,
                length: maxLength,
                width: maxWidth,
                height: totalHeight,
                insurance_value: Math.min(totalAmountInt, 5000000) 
            });

            order.tracking_code = trackingCode;
        }

        order.status = newStatus;
        await order.save();
        return order;
    }

    async getInvoiceData(orderId) {
        const order = await Order.findByPk(orderId);
        if (!order) return null;

        const items = await OrderItem.findAll({
            where: { order_id: orderId },
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: ['name', 'main_image']
                },
                {
                    model: ProductVariant,
                    as: 'variant'
                }
            ]
        });

        return { order, items };
    }

    async getDashboardStats(startDate, endDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const filteredOrders = await Order.findAll({
            where: {
                created_at: { [Op.between]: [start, end] }
            },
            order: [['created_at', 'DESC']]
        });

        const totalRevenue = filteredOrders
            .filter(o => o.status === 'delivered') // Chỉ tính các đơn đã giao thành công
            .reduce((sum, o) => sum + Number(o.total_amount), 0);

        const totalOrders = filteredOrders.length;

        const totalCustomers = await User.count({
            where: { role: { [Op.ne]: 'admin' } }
        });

        const totalProducts = await Product.count();

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
            if (o.status === 'delivered') { // Chỉ tính các đơn đã giao thành công
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