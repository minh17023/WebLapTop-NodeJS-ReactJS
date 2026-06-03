const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
    product_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    category_id: { type: DataTypes.INTEGER },
    name: { type: DataTypes.STRING(255), allowNull: false },
    slug: { type: DataTypes.STRING(255), unique: true, allowNull: false },
    brand: { type: DataTypes.STRING(50), allowNull: false },
    main_image: { type: DataTypes.TEXT },
    description: { type: DataTypes.TEXT },
    specifications: { type: DataTypes.JSONB, defaultValue: {} },
    status: { type: DataTypes.ENUM('active', 'inactive', 'out_of_stock'), defaultValue: 'active' }
}, { tableName: 'products' });

module.exports = Product;