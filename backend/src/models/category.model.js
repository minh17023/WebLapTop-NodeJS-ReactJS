const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
    category_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    slug: { type: DataTypes.STRING(120), unique: true, allowNull: false },
    description: { type: DataTypes.TEXT },
    image_url: {type: DataTypes.STRING(255)}
}, { tableName: 'categories' });

module.exports = Category;