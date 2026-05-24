const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
    review_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    product_id: { type: DataTypes.INTEGER },
    user_id: { type: DataTypes.INTEGER },
    rating: { type: DataTypes.INTEGER },
    comment: { type: DataTypes.TEXT }
}, { tableName: 'reviews', updatedAt: false });

module.exports = Review;