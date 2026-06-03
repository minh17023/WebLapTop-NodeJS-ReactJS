const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductVariant = sequelize.define('ProductVariant', {
    variant_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    sku: { type: DataTypes.STRING },
    ram: { type: DataTypes.STRING },
    ssd: { type: DataTypes.STRING },
    price: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    discount_price: { type: DataTypes.DECIMAL(15, 2) },
    stock_quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
}, { tableName: 'product_variants', timestamps: false });

module.exports = ProductVariant;
