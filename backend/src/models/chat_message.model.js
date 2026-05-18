const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChatMessage = sequelize.define('ChatMessage', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false, comment: 'ID của người dùng đang chat' },
    sender: { type: DataTypes.STRING(10), allowNull: false, comment: 'Chỉ nhận 2 giá trị: "user" hoặc "model"' },
    message: { type: DataTypes.TEXT, allowNull: false }
}, {
    tableName: 'chat_messages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = ChatMessage;