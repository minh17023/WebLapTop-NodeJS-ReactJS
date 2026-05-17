import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, FileText, ChevronLeft, ChevronRight, Upload, Filter } from 'lucide-react';
import { toast } from 'react-toastify';
import { postService } from '../../services/post.service';

const ManagePosts = () => {
    // ================= STATE CƠ BẢN =================
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // 🌟 ĐÃ THÊM: State lưu trữ bộ lọc trạng thái
    const [filterStatus, setFilterStatus] = useState('all'); 
    
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 5;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const initialFormState = {
        title: '',
        slug: '',
        thumbnail_url: '',
        summary: '',
        content: '',
        is_published: true
    };
    const [formData, setFormData] = useState(initialFormState);

    // ================= FETCH DATA =================
    const fetchPostsAPI = async (keyword = '') => {
        setLoading(true);
        try {
            let res;
            if (keyword.trim() !== '') {
                res = await postService.search(keyword);
            } else {
                res = await postService.getAll();
            }
            const postList = res?.data || res || [];
            setPosts(Array.isArray(postList) ? postList : []);
            setCurrentPage(1); 
        } catch (error) {
            console.error("Lỗi lấy bài viết:", error);
            toast.error("Không thể tải danh sách bài viết!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchPostsAPI(searchTerm);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // ================= 🌟 LỌC DỮ LIỆU & PHÂN TRANG =================
    // 1. Lọc mảng posts gốc dựa theo filterStatus trước
    const processedPosts = posts.filter(post => {
        if (filterStatus === 'published') return post.is_published === true;
        if (filterStatus === 'draft') return post.is_published === false;
        return true; // Nếu là 'all' thì giữ nguyên
    });

    // 2. Phân trang trên mảng đã lọc
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = processedPosts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(processedPosts.length / postsPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // ================= XỬ LÝ ẢNH BASE64 =================
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.warning("Dung lượng ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, thumbnail_url: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    // ================= XỬ LÝ FORM =================
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'is_published') {
            setFormData(prev => ({ ...prev, [name]: value === 'true' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const openAddModal = () => {
        setEditingId(null);
        setFormData(initialFormState);
        setIsModalOpen(true);
    };

    const openEditModal = (post) => {
        setEditingId(post.post_id || post.id);
        setFormData({
            title: post.title || '',
            slug: post.slug || '',
            thumbnail_url: post.thumbnail_url || '',
            summary: post.summary || '',
            content: post.content || '',
            is_published: post.is_published !== undefined ? post.is_published : true
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData(initialFormState);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = { ...formData };
            if (!payload.slug || payload.slug.trim() === '') {
                delete payload.slug; 
            }

            if (editingId) {
                await postService.update(editingId, payload);
            } else {
                await postService.create(payload);
            }

            toast.success(editingId ? "Cập nhật bài viết thành công!" : "Đã đăng bài viết mới!");
            closeModal();
            fetchPostsAPI(searchTerm); 
        } catch (error) {
            toast.error(error.response?.data?.message || "Có lỗi xảy ra khi lưu bài viết!");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa bài viết "${title}" không?`)) return;
        try {
            await postService.delete(id);
            toast.success("Đã xóa bài viết khỏi hệ thống!");
            fetchPostsAPI(searchTerm);
        } catch (error) {
            toast.error("Không thể xóa bài viết này!");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm gap-4">
                <div>
                    <h1 className="text-xl font-black text-gray-800 uppercase tracking-tight">Quản Lý Bài Viết</h1>
                    <p className="text-xs text-gray-400 mt-1">Quản lý tin tức, khuyến mãi và mẹo vặt công nghệ.</p>
                </div>
                
                {/* 🌟 ĐÃ SỬA: Bổ sung thanh công cụ (Lọc + Tìm kiếm + Thêm mới) */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                    
                    {/* Bộ lọc trạng thái */}
                    <div className="relative w-full sm:w-auto">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <select 
                            value={filterStatus}
                            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                            className="w-full sm:w-44 pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-red-500 outline-none transition cursor-pointer appearance-none"
                        >
                            <option value="all">Tất cả bài viết</option>
                            <option value="published">Đã xuất bản</option>
                            <option value="draft">Bản nháp</option>
                        </select>
                    </div>

                    {/* Ô tìm kiếm */}
                    <div className="relative flex-1 w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input type="text" placeholder="Tìm tiêu đề bài viết..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none transition" />
                    </div>
                    
                    <button onClick={openAddModal} className="w-full sm:w-auto bg-red-600 text-white font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-2 shadow-lg shadow-red-200 whitespace-nowrap">
                        <Plus size={16} /> Viết Bài Mới
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[11px] tracking-wider border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Bài viết</th>
                                <th className="px-6 py-4 text-center">Trạng thái</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-12 text-center text-gray-400 font-medium">Đang tải dữ liệu...</td>
                                </tr>
                            ) : currentPosts.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-12 text-center text-gray-400 font-medium">Không tìm thấy bài viết nào!</td>
                                </tr>
                            ) : (
                                currentPosts.map((post) => (
                                    <tr key={post.post_id || post.id} className="hover:bg-gray-50/50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                {post.thumbnail_url ? (
                                                    <img src={post.thumbnail_url} alt="" className="w-24 h-16 rounded-lg object-cover bg-gray-100 border border-gray-200 flex-shrink-0 shadow-sm" />
                                                ) : (
                                                    <div className="w-24 h-16 rounded-lg bg-gray-50 flex items-center justify-center text-gray-300 border border-gray-200 flex-shrink-0">
                                                        <FileText size={24} />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-gray-800 line-clamp-2 max-w-md">{post.title}</p>
                                                    <p className="text-[11px] text-gray-400 mt-1">Slug: /{post.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {post.is_published ? (
                                                <span className="bg-green-50 text-green-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-green-100">
                                                    Đã xuất bản
                                                </span>
                                            ) : (
                                                <span className="bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200">
                                                    Bản nháp
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => openEditModal(post)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition">
                                                    <Edit size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(post.post_id || post.id, post.title)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && processedPosts.length > postsPerPage && (
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-b-2xl">
                        <p className="text-xs text-gray-500 font-medium">
                            Hiển thị <span className="font-bold text-gray-800">{indexOfFirstPost + 1}</span> - <span className="font-bold text-gray-800">{Math.min(indexOfLastPost, processedPosts.length)}</span> / <span className="font-bold text-gray-800">{processedPosts.length}</span>
                        </p>
                        <div className="flex items-center gap-1">
                            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-white hover:text-red-600 disabled:opacity-50 transition bg-transparent"><ChevronLeft size={16} /></button>
                            {[...Array(totalPages)].map((_, index) => (
                                <button key={index + 1} onClick={() => paginate(index + 1)} className={`w-8 h-8 rounded-lg text-xs font-bold transition border ${currentPage === index + 1 ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-200' : 'bg-transparent text-gray-600 border-gray-200 hover:bg-white hover:text-red-600'}`}>
                                    {index + 1}
                                </button>
                            ))}
                            <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-white hover:text-red-600 disabled:opacity-50 transition bg-transparent"><ChevronRight size={16} /></button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Form giữ nguyên như cũ... */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white rounded-3xl w-full max-w-4xl flex flex-col shadow-2xl overflow-hidden max-h-[95vh]">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight">
                                {editingId ? 'Cập nhật Bài viết' : 'Viết Bài Mới'}
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-red-600 bg-white p-2 rounded-full shadow-sm transition"><X size={20} /></button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            <form id="postForm" onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div className="md:col-span-2">
                                        <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Tiêu đề bài viết <span className="text-red-500">*</span></label>
                                        <input type="text" name="title" required value={formData.title} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm font-medium transition" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Trạng thái <span className="text-red-500">*</span></label>
                                        <select name="is_published" value={formData.is_published} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm font-medium transition cursor-pointer">
                                            <option value={true}>Đã xuất bản</option>
                                            <option value={false}>Lưu nháp</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">
                                        Đường dẫn (Slug) <span className="text-gray-400 normal-case font-normal">- Để trống Backend sẽ tự động tạo từ tiêu đề</span>
                                    </label>
                                    <input type="text" name="slug" placeholder="vd: danh-gia-macbook-pro-m2" value={formData.slug} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm font-medium transition" />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Ảnh bìa (Thumbnail)</label>
                                    <div className="flex items-center gap-4">
                                        <label className="cursor-pointer flex flex-col items-center justify-center w-40 h-24 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl hover:border-red-500 hover:bg-red-50 transition group overflow-hidden">
                                            {formData.thumbnail_url ? (
                                                <img src={formData.thumbnail_url} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <>
                                                    <Upload size={24} className="text-gray-400 group-hover:text-red-500 mb-2" />
                                                    <span className="text-[10px] font-bold text-gray-400 group-hover:text-red-500 uppercase text-center px-2">Chọn file ảnh</span>
                                                </>
                                            )}
                                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                        </label>
                                        <div className="flex-1">
                                            <input type="text" name="thumbnail_url" placeholder="Hoặc nhập Link ảnh trực tiếp..." value={formData.thumbnail_url} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm font-medium transition" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Đoạn tóm tắt (Summary)</label>
                                    <textarea name="summary" rows="2" placeholder="Nhập một đoạn ngắn tóm tắt nội dung bài viết..." value={formData.summary} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm font-medium transition resize-y custom-scrollbar"></textarea>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Nội dung bài viết <span className="text-red-500">*</span></label>
                                    <textarea name="content" required rows="10" placeholder="Viết nội dung tại đây (Hỗ trợ text hoặc thẻ HTML cơ bản)..." value={formData.content} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm font-medium transition resize-y custom-scrollbar"></textarea>
                                </div>
                            </form>
                        </div>

                        <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                            <button type="button" onClick={closeModal} className="px-6 py-3 text-sm font-bold text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition shadow-sm">Hủy bỏ</button>
                            <button type="submit" form="postForm" disabled={isSubmitting} className="px-8 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-lg shadow-red-200 flex items-center gap-2 disabled:bg-gray-400">
                                {isSubmitting ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Đăng bài')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagePosts;