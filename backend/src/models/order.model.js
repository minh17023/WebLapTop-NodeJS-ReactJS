const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
    order_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER },
    full_name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false },
    phone: { type: DataTypes.STRING(15), allowNull: false },
    shipping_address: { type: DataTypes.TEXT, allowNull: false },
    total_amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    payment_method: { type: DataTypes.STRING(50), defaultValue: 'COD' },
    status: { 
        type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'), 
        defaultValue: 'pending' 
    },
    order_note: { type: DataTypes.TEXT }
}, { tableName: 'orders' });

module.exports = Order;