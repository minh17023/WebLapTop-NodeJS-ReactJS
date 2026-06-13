import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, Image as ImageIcon, ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { toast } from 'react-toastify';
import { categoryService } from '../../services/category.service';

const ManageCategories = () => {
    // ================= STATE DỮ LIỆU =================
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // ================= STATE PHÂN TRANG =================
    const [currentPage, setCurrentPage] = useState(1);
    const categoriesPerPage = 5;

    // ================= STATE MODAL =================
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const initialFormState = {
        name: '', 
        slug: '',
        description: '', 
        image_url: '' 
    };
    const [formData, setFormData] = useState(initialFormState);

    // ================= FETCH DANH MỤC API =================
    const fetchCategoriesAPI = async (keyword = '') => {
        setLoading(true);
        try {
            let res;
            if (keyword.trim() !== '') {
                res = await categoryService.search(keyword);
            } else {
                res = await categoryService.getAll();
            }
            const catList = res?.data || res || [];
            setCategories(Array.isArray(catList) ? catList : []);
            setCurrentPage(1); 
        } catch (error) {
            console.error("Lỗi lấy danh mục:", error);
            toast.error("Không thể tải danh sách danh mục!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchCategoriesAPI(searchTerm);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // ================= LOGIC PHÂN TRANG =================
    const indexOfLastCat = currentPage * categoriesPerPage;
    const indexOfFirstCat = indexOfLastCat - categoriesPerPage;
    const currentCategories = categories.slice(indexOfFirstCat, indexOfLastCat);
    const totalPages = Math.ceil(categories.length / categoriesPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // ================= XỬ LÝ CHỌN ẢNH =================
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.warning("Dung lượng ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image_url: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    // ================= XỬ LÝ FORM =================
    const generateSlug = (text) => {
        return text.toString().toLowerCase()
            .replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a')
            .replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e')
            .replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i')
            .replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o')
            .replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u')
            .replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y')
            .replace(/đ/gi, 'd')
            .replace(/\s+/g, '-') 
            .replace(/[^\w\-]+/g, '') 
            .replace(/\-\-+/g, '-') 
            .replace(/^-+/, '') 
            .replace(/-+$/, '');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            if (name === 'name' && !editingId) {
                newData.slug = generateSlug(value);
            }
            return newData;
        });
    };

    const openAddModal = () => {
        setEditingId(null);
        setFormData(initialFormState);
        setIsModalOpen(true);
    };

    const openEditModal = (category) => {
        setEditingId(category.category_id || category.id);
        setFormData({
            name: category.name || '',
            slug: category.slug || '',
            description: category.description || '',
            image_url: category.image_url || category.image || ''
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
            if (editingId) {
                await categoryService.update(editingId, formData);
            } else {
                await categoryService.create(formData);
            }

            toast.success(editingId ? "Cập nhật thành công!" : "Đã thêm danh mục mới!");
            closeModal();
            fetchCategoriesAPI(searchTerm); 
        } catch (error) {
            toast.error(error.response?.data?.message || "Có lỗi xảy ra!");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${name}" không? Các sản phẩm thuộc danh mục này có thể bị ảnh hưởng!`)) return;
        try {
            await categoryService.delete(id);
            toast.success("Đã xóa danh mục khỏi hệ thống!");
            fetchCategoriesAPI(searchTerm);
        } catch (error) {
            toast.error("Không thể xóa danh mục này!");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header & Search */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm gap-4">
                <div>
                    <h1 className="text-xl font-black text-gray-800 uppercase tracking-tight">Quản Lý Danh Mục</h1>
                    <p className="text-xs text-gray-400 mt-1">Phân loại và sắp xếp các dòng sản phẩm.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input type="text" placeholder="Tìm kiếm danh mục..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition" />
                    </div>
                    <button onClick={openAddModal} className="bg-blue-600 text-white font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-xl hover:bg-red-700 transition flex items-center gap-2 shadow-lg shadow-red-200 whitespace-nowrap">
                        <Plus size={16} /> Thêm Danh Mục
                    </button>
                </div>
            </div>

            {/* Bảng Dữ Liệu */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[11px] tracking-wider border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Hình ảnh</th>
                                <th className="px-6 py-4">Tên danh mục</th>
                                <th className="px-6 py-4">Đường dẫn (Slug)</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400 font-medium">Đang tải dữ liệu...</td>
                                </tr>
                            ) : currentCategories.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400 font-medium">Không tìm thấy danh mục nào!</td>
                                </tr>
                            ) : (
                                currentCategories.map((category) => (
                                    <tr key={category.category_id || category.id} className="hover:bg-gray-50/50 transition">
                                        <td className="px-6 py-4">
                                            {category.image_url || category.image ? (
                                                <img src={category.image_url || category.image} alt="" className="w-16 h-16 rounded-xl object-contain bg-white border border-gray-100 p-2 shadow-sm" />
                                            ) : (
                                                <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 border border-gray-200 shadow-sm">
                                                    <ImageIcon size={24} />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-gray-800">{category.name}</span>
                                            {category.description && (
                                                <p className="text-xs text-gray-500 line-clamp-1 mt-1 max-w-xs">{category.description}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-medium">
                                                /{category.slug}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => openEditModal(category)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition">
                                                    <Edit size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(category.category_id || category.id, category.name)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition">
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

                {/* Phân trang */}
                {!loading && categories.length > categoriesPerPage && (
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-b-2xl">
                        <p className="text-xs text-gray-500 font-medium">
                            Hiển thị <span className="font-bold text-gray-800">{indexOfFirstCat + 1}</span> - <span className="font-bold text-gray-800">{Math.min(indexOfLastCat, categories.length)}</span> / <span className="font-bold text-gray-800">{categories.length}</span>
                        </p>
                        <div className="flex items-center gap-1 flex-wrap justify-end">
                            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-white hover:text-blue-600 disabled:opacity-50 transition bg-transparent"><ChevronLeft size={16} /></button>
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
                                        <button key={1} onClick={() => paginate(1)} className={`w-8 h-8 rounded-lg text-xs font-bold transition border bg-transparent text-gray-600 border-gray-200 hover:bg-white hover:text-blue-600`}>1</button>
                                    );
                                    if (startPage > 2) {
                                        pages.push(<span key="dots1" className="px-1 text-gray-400">...</span>);
                                    }
                                }

                                for (let i = startPage; i <= endPage; i++) {
                                    pages.push(
                                        <button key={i} onClick={() => paginate(i)} className={`w-8 h-8 rounded-lg text-xs font-bold transition border ${currentPage === i ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' : 'bg-transparent text-gray-600 border-gray-200 hover:bg-white hover:text-blue-600'}`}>
                                            {i}
                                        </button>
                                    );
                                }

                                if (endPage < totalPages) {
                                    if (endPage < totalPages - 1) {
                                        pages.push(<span key="dots2" className="px-1 text-gray-400">...</span>);
                                    }
                                    pages.push(
                                        <button key={totalPages} onClick={() => paginate(totalPages)} className={`w-8 h-8 rounded-lg text-xs font-bold transition border bg-transparent text-gray-600 border-gray-200 hover:bg-white hover:text-blue-600`}>{totalPages}</button>
                                    );
                                }
                                return pages;
                            })()}
                            <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-white hover:text-blue-600 disabled:opacity-50 transition bg-transparent"><ChevronRight size={16} /></button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Form Thêm/Sửa */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white rounded-3xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden">
                        
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight">
                                {editingId ? 'Cập nhật Danh Mục' : 'Thêm Danh Mục Mới'}
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-blue-600 bg-white p-2 rounded-full shadow-sm transition"><X size={20} /></button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form id="categoryForm" onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Tên danh mục <span className="text-blue-500">*</span></label>
                                        <input type="text" name="name" required placeholder="VD: Laptop Văn Phòng..." value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Đường dẫn (Slug) <span className="text-blue-500">*</span></label>
                                        <input type="text" name="slug" required placeholder="VD: laptop-van-phong..." value={formData.slug} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Hình ảnh danh mục</label>
                                    <div className="flex items-center gap-4">
                                        <label className="cursor-pointer flex flex-col items-center justify-center w-32 h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition group overflow-hidden">
                                            {formData.image_url ? (
                                                <img src={formData.image_url} alt="Preview" className="w-full h-full object-contain p-2 mix-blend-multiply" />
                                            ) : (
                                                <>
                                                    <Upload size={24} className="text-gray-400 group-hover:text-blue-500 mb-2" />
                                                    <span className="text-[10px] font-bold text-gray-400 group-hover:text-blue-500 uppercase text-center px-2">Chọn file ảnh</span>
                                                </>
                                            )}
                                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                        </label>
                                        <div className="flex-1">
                                            <input type="text" name="image_url" placeholder="Nhập Link ảnh hoặc tải lên từ máy..." value={formData.image_url} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Mô tả danh mục</label>
                                    <textarea name="description" rows="3" placeholder="Ghi chú ngắn về danh mục này..." value={formData.description} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition resize-none custom-scrollbar"></textarea>
                                </div>
                            </form>
                        </div>

                        <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                            <button type="button" onClick={closeModal} className="px-6 py-3 text-sm font-bold text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition shadow-sm">Hủy bỏ</button>
                            <button type="submit" form="categoryForm" disabled={isSubmitting} className="px-8 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-red-700 rounded-xl transition shadow-lg shadow-red-200 flex items-center gap-2 disabled:bg-gray-400">
                                {isSubmitting ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Thêm mới')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageCategories;