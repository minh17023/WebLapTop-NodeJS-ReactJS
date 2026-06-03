const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CartItem = sequelize.define('CartItem', {
    cart_item_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    user_id: { type: DataTypes.INTEGER, allowNull: false},
    product_id: { type: DataTypes.INTEGER, allowNull: false},
    variant_id: { type: DataTypes.INTEGER, allowNull: false},
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1}
}, { tableName: 'cart_items', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at'});

module.exports = CartItem;