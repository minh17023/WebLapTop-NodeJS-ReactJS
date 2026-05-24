const reviewService = require('../services/review.service');

class ReviewController {
    // 🌟 THÊM MỚI: Hàm lấy tất cả cho Admin (có phân trang, lọc theo rating)
    async getAll(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const rating = req.query.rating || null;

            const result = await reviewService.getAll(page, limit, rating);
            res.status(200).json({ 
                success: true, 
                pagination: {
                    totalItems: result.totalItems,
                    totalPages: result.totalPages,
                    currentPage: result.currentPage,
                    limit: result.limit
                },
                data: result.reviews 
            });
        } catch (error) {
            next(error);
        }
    }

    // [GET] Lấy danh sách đánh giá theo ID sản phẩm (có phân trang)
    async getByProduct(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const result = await reviewService.getReviewsByProductId(req.params.productId, page, limit);
            res.status(200).json({ 
                success: true, 
                pagination: {
                    totalItems: result.totalItems,
                    totalPages: result.totalPages,
                    currentPage: result.currentPage,
                    limit: result.limit
                },
                data: result.reviews 
            });
        } catch (error) { next(error); }
    }

    async search(req, res, next) {
        try {
            const keyword = req.query.q || '';
            const reviews = await reviewService.search(keyword);
            
            res.status(200).json({ 
                success: true, 
                data: reviews 
            });
        } catch (error) {
            next(error);
        }
    }

    // [POST] Gửi đánh giá mới (Cần đăng nhập)
    async create(req, res, next) {
        try {
            const { product_id, rating, comment } = req.body;
            if (!product_id || !rating) {
                return res.status(400).json({ success: false, message: 'Thiếu thông tin đánh giá' });
            }

            const newReview = await reviewService.createReview(req.user.id, req.body);
            res.status(201).json({ success: true, message: 'Cảm ơn bạn đã đánh giá!', data: newReview });
        } catch (error) { next(error); }
    }

    // [DELETE] Xóa đánh giá (Chỉ Admin)
    async delete(req, res, next) {
        try {
            const isDeleted = await reviewService.deleteReview(req.params.id);
            if (!isDeleted) return res.status(404).json({ success: false, message: 'Đánh giá không tồn tại' });
            res.status(200).json({ success: true, message: 'Đã xóa đánh giá' });
        } catch (error) { next(error); }
    }
}

module.exports = new ReviewController();