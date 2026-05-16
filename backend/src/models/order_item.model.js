const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
    order_item_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    order_id: { type: DataTypes.INTEGER },
    product_id: { type: DataTypes.INTEGER },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    price_at_purchase: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    // Cột total_price được database tự tính (GENERATED ALWAYS), không cần map ở đây để Sequelize bỏ qua khi Insert
}, { tableName: 'order_items', timestamps: false });

module.exports = OrderItem;