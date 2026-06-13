import { useState, useEffect } from 'react';
import { Trash2, Search, Filter, Star, ChevronLeft, ChevronRight, MessageSquareOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { reviewService } from '../../services/review.service';
import ConfirmModal from '../../components/admin/ConfirmModal';

const ManageReviews = () => {
    // ================= STATE =================
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    
    const [filterRating, setFilterRating] = useState('all'); 
    
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, title: '', message: '' });
    const reviewsPerPage = 6;

    // ================= FETCH DATA CHUẨN API =================
    const fetchReviewsAPI = async (keyword = '', page = 1, rating = 'all') => {
        setLoading(true);
        try {
            let res;
            if (keyword.trim() !== '') {
                res = await reviewService.search(keyword);
                const reviewList = res?.data || res || [];
                setReviews(Array.isArray(reviewList) ? reviewList : []);
                setTotalPages(1);
                setTotalItems(reviewList.length);
            } else {
                res = await reviewService.getAll(page, reviewsPerPage, rating);
                if (res.success) {
                    setReviews(res.data);
                    if (res.pagination) {
                        setTotalPages(res.pagination.totalPages);
                        setTotalItems(res.pagination.totalItems);
                    }
                } else {
                    const reviewList = res?.data || res || [];
                    setReviews(Array.isArray(reviewList) ? reviewList : []);
                    setTotalPages(1);
                    setTotalItems(reviewList.length);
                }
            }
        } catch (error) {
            console.error("Lỗi lấy đánh giá:", error);
            toast.error("Không thể tải danh sách đánh giá!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filterRating]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch]);

    useEffect(() => {
        fetchReviewsAPI(debouncedSearch, currentPage, filterRating);
    }, [currentPage, debouncedSearch, filterRating]);

    // ================= PHÂN TRANG =================
    const indexOfLastReview = currentPage * reviewsPerPage;
    const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
    const currentReviews = reviews;
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleDelete = (id) => {
        setConfirmModal({
            isOpen: true,
            id: id,
            title: 'Xóa Đánh Giá',
            message: `Bạn có chắc chắn muốn xóa đánh giá này không? Hành động này không thể hoàn tác!`
        });
    };

    const confirmDelete = async () => {
        try {
            await reviewService.delete(confirmModal.id);
            toast.success("Đã xóa đánh giá vi phạm!");
            fetchReviewsAPI(searchTerm);
        } catch (error) {
            console.error(error);
            toast.error("Không thể xóa đánh giá này!");
        }
    };

    const renderStars = (rating) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                        key={star} 
                        size={14} 
                        className={star <= rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-100 text-gray-200"} 
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header & Filter */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm gap-4">
                <div>
                    <h1 className="text-xl font-black text-gray-800 uppercase tracking-tight">Quản Lý Đánh Giá</h1>
                    <p className="text-xs text-gray-400 mt-1">Kiểm duyệt phản hồi và điểm số từ khách hàng.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                    {/* Select Lọc Số Sao */}
                    <div className="relative w-full sm:w-auto">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <select 
                            value={filterRating}
                            onChange={(e) => { setFilterRating(e.target.value); setCurrentPage(1); }}
                            className="w-full sm:w-44 pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-yellow-500 outline-none transition cursor-pointer appearance-none"
                        >
                            <option value="all">Tất cả số sao</option>
                            <option value="5">5 Sao (Tuyệt vời)</option>
                            <option value="4">4 Sao (Khá tốt)</option>
                            <option value="3">3 Sao (Trung bình)</option>
                            <option value="2">2 Sao (Kém)</option>
                            <option value="1">1 Sao (Rất tệ)</option>
                        </select>
                    </div>

                    {/* Input Tìm Kiếm */}
                    <div className="relative flex-1 w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input type="text" placeholder="Tìm nội dung đánh giá..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-yellow-500 outline-none transition" />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[11px] tracking-wider border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Khách hàng</th>
                                <th className="px-6 py-4">Mức độ hài lòng</th>
                                <th className="px-6 py-4 w-1/3">Nội dung đánh giá</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400 font-medium">Đang tải dữ liệu...</td>
                                </tr>
                            ) : currentReviews.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400 font-medium flex flex-col items-center justify-center gap-3">
                                        <MessageSquareOff size={32} className="text-gray-300" />
                                        <span>Không tìm thấy đánh giá nào!</span>
                                    </td>
                                </tr>
                            ) : (
                                currentReviews.map((review) => (
                                    <tr key={review.review_id || review.id} className="hover:bg-gray-50/50 transition">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-800">
                                                {/* 🌟 ĐÃ SỬA: Lấy đúng bí danh 'reviewer' từ Backend */}
                                                {review.reviewer?.full_name || review.author_name || `Khách hàng ẩn danh (ID: ${review.user_id})`}
                                            </p>
                                            <p className="text-[11px] text-gray-400 mt-1">
                                                Sản phẩm ID: <span className="font-medium text-gray-600">{review.product_id}</span>
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {renderStars(review.rating)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {/* 🌟 ĐÃ SỬA: Đọc đúng trường 'comment' thay vì 'content' */}
                                            <p className="text-gray-600 text-sm italic line-clamp-3 leading-relaxed">
                                                "{review.comment}"
                                            </p>
                                            <p className="text-[10px] text-gray-400 mt-2 font-medium">
                                                {new Date(review.created_at || review.createdAt).toLocaleDateString('vi-VN')}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleDelete(review.review_id || review.id)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition inline-flex items-center gap-2 text-xs font-bold">
                                                <Trash2 size={16} /> Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-b-2xl">
                        <p className="text-xs text-gray-500 font-medium">
                            Hiển thị <span className="font-bold text-gray-800">{totalItems > 0 ? indexOfFirstReview + 1 : 0}</span> - <span className="font-bold text-gray-800">{Math.min(indexOfLastReview, totalItems)}</span> / <span className="font-bold text-gray-800">{totalItems}</span>
                        </p>
                        <div className="flex items-center gap-1 flex-wrap justify-end">
                            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-white hover:text-yellow-600 disabled:opacity-50 transition bg-transparent"><ChevronLeft size={16} /></button>
                            {(() => {
                                const pages = [];
                                const maxVisiblePages = 5;
                                let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                                let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                                
                                if (endPage - startPage + 1 < maxVisiblePages) {
                                    startPage = Math.max(1, endPage - maxVisiblePages + 1);
                                }

                                if (startPage > 1) {
                                    pages.push(
                                        <button key={1} onClick={() => paginate(1)} className={`w-8 h-8 rounded-lg text-xs font-bold transition border bg-transparent text-gray-600 border-gray-200 hover:bg-white hover:text-yellow-600`}>1</button>
                                    );
                                    if (startPage > 2) {
                                        pages.push(<span key="dots1" className="px-1 text-gray-400">...</span>);
                                    }
                                }

                                for (let i = startPage; i <= endPage; i++) {
                                    pages.push(
                                        <button key={i} onClick={() => paginate(i)} className={`w-8 h-8 rounded-lg text-xs font-bold transition border ${currentPage === i ? 'bg-yellow-500 text-white border-yellow-500 shadow-md shadow-yellow-200' : 'bg-transparent text-gray-600 border-gray-200 hover:bg-white hover:text-yellow-600'}`}>
                                            {i}
                                        </button>
                                    );
                                }

                                if (endPage < totalPages) {
                                    if (endPage < totalPages - 1) {
                                        pages.push(<span key="dots2" className="px-1 text-gray-400">...</span>);
                                    }
                                    pages.push(
                                        <button key={totalPages} onClick={() => paginate(totalPages)} className={`w-8 h-8 rounded-lg text-xs font-bold transition border bg-transparent text-gray-600 border-gray-200 hover:bg-white hover:text-yellow-600`}>{totalPages}</button>
                                    );
                                }
                                return pages;
                            })()}
                            <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-white hover:text-yellow-600 disabled:opacity-50 transition bg-transparent"><ChevronRight size={16} /></button>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmModal 
                isOpen={confirmModal.isOpen} 
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} 
                onConfirm={confirmDelete} 
                title={confirmModal.title} 
                message={confirmModal.message} 
            />
        </div>
    );
};

export default ManageReviews;