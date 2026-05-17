const { Review, User } = require('../models');
const { Op } = require('sequelize');

class ReviewService {
    // 🌟 THÊM MỚI: Lấy tất cả đánh giá (Cho Admin)
    async getAll() {
        return await Review.findAll({
            include: [{ 
                model: User, 
                as: 'reviewer', // Đảm bảo đúng alias trong models
                attributes: ['full_name'] 
            }],
            order: [['created_at', 'DESC']]
        });
    }

    // 1. Lấy tất cả đánh giá của một sản phẩm
    async getReviewsByProductId(productId) {
        return await Review.findAll({
            where: { product_id: productId },
            include: [{ 
                model: User, 
                as: 'reviewer', 
                attributes: ['full_name'] 
            }],
            order: [['created_at', 'DESC']]
        });
    }

    async search(keyword) {
        const term = `%${keyword.trim()}%`;
        return await Review.findAll({
            where: {
                comment: {
                    [Op.iLike]: term
                }
            },
            // 🌟 BỔ SUNG: Kéo thêm bảng User để Admin thấy tên người đánh giá
            include: [{ 
                model: User, 
                as: 'reviewer', 
                attributes: ['full_name'] 
            }],
            order: [['created_at', 'DESC']] 
        });
    }

    // 2. Thêm đánh giá mới
    async createReview(userId, reviewData) {
        return await Review.create({
            user_id: userId,
            product_id: reviewData.product_id,
            rating: reviewData.rating,
            comment: reviewData.comment
        });
    }

    // 3. Xóa đánh giá (Dành cho Admin)
    async deleteReview(reviewId) {
        const review = await Review.findByPk(reviewId);
        if (!review) return false;
        await review.destroy();
        return true;
    }
}

module.exports = new ReviewService();