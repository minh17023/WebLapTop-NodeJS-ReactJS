import { useState, useEffect, useContext } from 'react';
import { Star, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { reviewService } from '../../services/review.service';
import { AuthContext } from '../../context/AuthContext';

const ReviewSection = ({ productId }) => {
    const { user } = useContext(AuthContext);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch đánh giá khi component render
    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const fetchReviews = async () => {
        try {
            const res = await reviewService.getByProduct(productId);
            if (res.success) setReviews(res.data);
        } catch (error) {
            console.error("Lỗi khi tải đánh giá:", error);
        }
    };

    // Hàm render ngôi sao (vàng/xám)
    const renderStars = (rating, interactive = false) => {
        return [...Array(5)].map((_, index) => (
            <Star
                key={index}
                size={interactive ? 24 : 16}
                fill={index < rating ? "#FFD700" : "none"} // Màu vàng cho sao
                color={index < rating ? "#FFD700" : "#D1D5DB"}
                className={interactive ? "cursor-pointer" : ""}
                onClick={() => interactive && setNewReview({ ...newReview, rating: index + 1 })}
            />
        ));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newReview.comment.trim()) return toast.error("Vui lòng nhập nội dung đánh giá");

        setIsSubmitting(true);
        try {
            const res = await reviewService.create({
                product_id: productId,
                rating: newReview.rating,
                comment: newReview.comment
            });
            if (res.success) {
                toast.success("Đánh giá của bạn đã được gửi!");
                setNewReview({ rating: 5, comment: '' });
                fetchReviews(); // Tải lại danh sách ngay lập tức
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi gửi đánh giá");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mt-0">
            {/* Form viết đánh giá */}
            {user ? (
                <form onSubmit={handleSubmit} className="mb-8 bg-gray-50/80 p-5 rounded-2xl border border-gray-100">
                    <h4 className="font-bold text-[#0a0a0a] text-sm mb-3">Gửi đánh giá của bạn</h4>
                    <div className="flex items-center gap-1 mb-4">
                        <span className="text-sm text-gray-500 mr-2">Chất lượng:</span>
                        {renderStars(newReview.rating, true)}
                    </div>
                    <textarea
                        rows="3"
                        placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-3"
                        value={newReview.comment}
                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    />
                    <button
                        type="submit" disabled={isSubmitting}
                        className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                    >
                        {isSubmitting ? 'Đang gửi...' : 'Gửi Đánh Giá'}
                    </button>
                </form>
            ) : (
                <div className="mb-10 p-4 bg-red-50 text-red-600 rounded-lg text-center font-medium border border-red-100">
                    Vui lòng <a href="/login" className="underline font-bold">đăng nhập</a> để gửi đánh giá.
                </div>
            )}

            {/* Danh sách bình luận */}
            <div className="space-y-6">
                {reviews.length > 0 ? reviews.map((review) => (
                    <div key={review.review_id} className="border-b border-gray-50 pb-6 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="bg-gray-200 p-2 rounded-full"><User size={16} className="text-gray-600" /></div>
                                <div>
                                    <span className="font-bold text-gray-800 block text-sm">{review.reviewer?.full_name || 'Khách hàng'}</span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(review.created_at).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                {renderStars(review.rating)}
                            </div>
                        </div>
                        <p className="text-gray-600 mt-2 ml-10 pl-1">{review.comment}</p>
                    </div>
                )) : (
                    <p className="text-gray-500 text-center italic py-4">Chưa có đánh giá nào cho sản phẩm này.</p>
                )}
            </div>
        </div>
    );
};

export default ReviewSection;