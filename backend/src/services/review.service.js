const { Review, User } = require('../models');

class ReviewService {
    // 1. Lấy tất cả đánh giá của một sản phẩm
    async getReviewsByProductId(productId) {
        return await Review.findAll({
            where: { product_id: productId },
            include: [{ 
                model: User, 
                as: 'reviewer', // Dùng đúng alias đã thiết lập trong file models/index.js
                attributes: ['full_name'] 
            }],
            order: [['created_at', 'DESC']]
        });
    }

    // 2. Thêm đánh giá mới
    async createReview(userId, reviewData) {
        // reviewData bao gồm: product_id, rating, comment
        return await Review.create({
            user_id: userId,
            product_id: reviewData.product_id,
            rating: reviewData.rating,
            comment: reviewData.comment
        });
    }

    // 3. Xóa đánh giá (Dành cho Admin quản lý bình luận toxic)
    async deleteReview(reviewId) {
        const review = await Review.findByPk(reviewId);
        if (!review) return false;
        await review.destroy();
        return true;
    }
}

module.exports = new ReviewService();