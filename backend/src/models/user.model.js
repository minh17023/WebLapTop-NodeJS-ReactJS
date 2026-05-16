const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    user_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    full_name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(150), unique: true, allowNull: false },
    password_hash: { type: DataTypes.TEXT, allowNull: false },
    phone: { type: DataTypes.STRING(15) },
    address: { type: DataTypes.TEXT },
    role: { type: DataTypes.ENUM('customer', 'admin'), defaultValue: 'customer' }
}, { tableName: 'users' });

module.exports = User;