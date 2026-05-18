const sequelize = require('../config/database');

// Import tất cả các Model chuẩn style dự án
const Category = require('./category.model');
const Product = require('./product.model');
const User = require('./user.model');
const Order = require('./order.model');
const OrderItem = require('./order_item.model');
const CartItem = require('./cart_item.model'); // Khai báo model mới
const Post = require('./post.model');
const Review = require('./review.model');
const ChatMessage = require('./chat_message.model');
// ========================================================
// THIẾT LẬP MỐI QUAN HỆ (ASSOCIATIONS)
// ========================================================

// 1. Category - Product (1 - N)
Category.hasMany(Product, { foreignKey: 'category_id' });
Product.belongsTo(Category, { foreignKey: 'category_id' });

// 2. User - Order (1 - N)
User.hasMany(Order, { foreignKey: 'user_id' });
Order.belongsTo(User, { foreignKey: 'user_id' });

// 3. Order - OrderItem (1 - N)
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

// 4. Product - OrderItem (1 - N)
Product.hasMany(OrderItem, { foreignKey: 'product_id' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// 5. User - CartItem (1 - N) - Giỏ hàng hệ thống mới
User.hasMany(CartItem, { foreignKey: 'user_id' });
CartItem.belongsTo(User, { foreignKey: 'user_id' });

// 6. Product - CartItem (1 - N) - Giỏ hàng hệ thống mới
Product.hasMany(CartItem, { foreignKey: 'product_id' });
CartItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// 7. User - Post (1 - N)
User.hasMany(Post, { foreignKey: 'author_id' });
Post.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

// 8. Product - Review (1 - N)
Product.hasMany(Review, { foreignKey: 'product_id' });
Review.belongsTo(Product, { foreignKey: 'product_id' });

// 9. User - Review (1 - N)
User.hasMany(Review, { foreignKey: 'user_id' });
Review.belongsTo(User, { foreignKey: 'user_id', as: 'reviewer' });

// 10. User - ChatMessage (1 - N)
User.hasMany(ChatMessage, { foreignKey: 'user_id' });
ChatMessage.belongsTo(User, { foreignKey: 'user_id' });

// ========================================================
// EXPORT TẤT CẢ MODULES
// ========================================================
module.exports = {
    sequelize,
    Category,
    Product,
    User,
    Order,
    OrderItem,
    CartItem,
    Post,
    Review
};