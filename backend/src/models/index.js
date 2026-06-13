const sequelize = require('../config/database');

const Category = require('./category.model');
const Product = require('./product.model');
const ProductVariant = require('./product_variant.model');
const User = require('./user.model');
const Order = require('./order.model');
const OrderItem = require('./order_item.model');
const CartItem = require('./cart_item.model');
const Post = require('./post.model');
const Review = require('./review.model');
const ChatMessage = require('./chat_message.model');

Category.hasMany(Product, { foreignKey: 'category_id' });
Product.belongsTo(Category, { foreignKey: 'category_id' });

User.hasMany(Order, { foreignKey: 'user_id' });
Order.belongsTo(User, { foreignKey: 'user_id' });

Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

Product.hasMany(OrderItem, { foreignKey: 'product_id' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

User.hasMany(CartItem, { foreignKey: 'user_id' });
CartItem.belongsTo(User, { foreignKey: 'user_id' });

Product.hasMany(CartItem, { foreignKey: 'product_id' });
CartItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

Product.hasMany(ProductVariant, { foreignKey: 'product_id', as: 'variants' });
ProductVariant.belongsTo(Product, { foreignKey: 'product_id' });

ProductVariant.hasMany(CartItem, { foreignKey: 'variant_id' });
CartItem.belongsTo(ProductVariant, { foreignKey: 'variant_id', as: 'variant' });

ProductVariant.hasMany(OrderItem, { foreignKey: 'variant_id' });
OrderItem.belongsTo(ProductVariant, { foreignKey: 'variant_id', as: 'variant' });

User.hasMany(Post, { foreignKey: 'author_id' });
Post.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

Product.hasMany(Review, { foreignKey: 'product_id' });
Review.belongsTo(Product, { foreignKey: 'product_id' });

User.hasMany(Review, { foreignKey: 'user_id' });
Review.belongsTo(User, { foreignKey: 'user_id', as: 'reviewer' });

User.hasMany(ChatMessage, { foreignKey: 'user_id' });
ChatMessage.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
    sequelize,
    Category,
    Product,
    User,
    Order,
    OrderItem,
    CartItem,
    Post,
    Review,
    ChatMessage,
    ProductVariant
};