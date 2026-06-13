const { Review, User } = require('../models');
const { Op } = require('sequelize');

class ReviewService {
    async getAll(page = 1, limit = 10, rating = null) {
        const offset = (page - 1) * limit;
        const whereClause = {};
        if (rating !== null && rating !== undefined && rating !== 'all') {
            whereClause.rating = Number(rating);
        }

        const { rows, count } = await Review.findAndCountAll({
            where: whereClause,
            include: [{ 
                model: User, 
                as: 'reviewer',
                attributes: ['full_name'] 
            }],
            limit: Number(limit),
            offset: Number(offset),
            order: [['created_at', 'DESC']]
        });

        return {
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            limit: Number(limit),
            reviews: rows
        };
    }

    async getReviewsByProductId(productId, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const { rows, count } = await Review.findAndCountAll({
            where: { product_id: productId },
            include: [{ 
                model: User, 
                as: 'reviewer', 
                attributes: ['full_name'] 
            }],
            limit: Number(limit),
            offset: Number(offset),
            order: [['created_at', 'DESC']]
        });

        return {
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            limit: Number(limit),
            reviews: rows
        };
    }

    async search(keyword) {
        const term = `%${keyword.trim()}%`;
        return await Review.findAll({
            where: {
                comment: {
                    [Op.iLike]: term
                }
            },
            include: [{ 
                model: User, 
                as: 'reviewer', 
                attributes: ['full_name'] 
            }],
            order: [['created_at', 'DESC']] 
        });
    }

    async createReview(userId, reviewData) {
        return await Review.create({
            user_id: userId,
            product_id: reviewData.product_id,
            rating: reviewData.rating,
            comment: reviewData.comment
        });
    }

    async deleteReview(reviewId) {
        const review = await Review.findByPk(reviewId);
        if (!review) return false;
        await review.destroy();
        return true;
    }
}

module.exports = new ReviewService();