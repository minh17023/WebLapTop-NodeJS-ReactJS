const reviewService = require('../services/review.service');

class ReviewController {
    // [GET] Lấy danh sách đánh giá theo ID sản phẩm
    async getByProduct(req, res, next) {
        try {
            const reviews = await reviewService.getReviewsByProductId(req.params.productId);
            res.status(200).json({ success: true, data: reviews });
        } catch (error) { next(error); }
    }

    // [POST] Gửi đánh giá mới (Cần đăng nhập)
    async create(req, res, next) {
        try {
            const { product_id, rating, comment } = req.body;
            if (!product_id || !rating) {
                return res.status(400).json({ success: false, message: 'Thiếu thông tin đánh giá' });
            }

            // req.user.id có được nhờ middleware verifyToken
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