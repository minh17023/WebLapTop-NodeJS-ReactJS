const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
    order_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER },
    full_name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false },
    phone: { type: DataTypes.STRING(15), allowNull: false },
    shipping_address: { type: DataTypes.TEXT, allowNull: false },
    tracking_code: { type: DataTypes.STRING(50), allowNull: true, comment: 'Mã vận đơn GHN' },
    shipping_fee: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0, comment: 'Phí vận chuyển' },
    district_id: { type: DataTypes.INTEGER, allowNull: true, comment: 'Mã Quận/Huyện của GHN' },
    ward_code: { type: DataTypes.STRING(20), allowNull: true, comment: 'Mã Phường/Xã của GHN' },
    total_amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    payment_method: { type: DataTypes.STRING(50), defaultValue: 'COD' },
    status: { type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'), defaultValue: 'pending' },
    order_note: { type: DataTypes.TEXT },
    payment_status: { type: DataTypes.STRING,defaultValue: 'unpaid', comment: 'unpaid, paid, refunded'}
}, { tableName: 'orders' });

module.exports = Order;