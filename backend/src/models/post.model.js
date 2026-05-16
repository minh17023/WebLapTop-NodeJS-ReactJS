const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Post = sequelize.define('Post', {
    post_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    author_id: { type: DataTypes.INTEGER },
    title: { type: DataTypes.STRING(255), allowNull: false },
    slug: { type: DataTypes.STRING(255), unique: true, allowNull: false },
    summary: { type: DataTypes.TEXT },
    content: { type: DataTypes.TEXT, allowNull: false },
    thumbnail_url: { type: DataTypes.TEXT },
    is_published: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'posts' });

module.exports = Post;