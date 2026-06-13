import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, Image as ImageIcon, ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { toast } from 'react-toastify';
import { productService } from '../../services/product.service';
import { categoryService } from '../../services/category.service';
import ConfirmModal from '../../components/admin/ConfirmModal';

const ManageProducts = () => {
    // ================= STATE DỮ LIỆU =================
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // ================= STATE PHÂN TRANG =================
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const productsPerPage = 5;

    // ================= STATE MODAL =================
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, title: '', message: '' });

    const initialFormState = {
        name: '', category_id: '', brand: '', main_image: '', description: '',
        spec_cpu: '', spec_gpu: '', spec_screen: '',
        spec_weight: '', spec_length: '', spec_width: '', spec_height: '',
        variants: []
    };
    const [formData, setFormData] = useState(initialFormState);

    // ================= FETCH DANH MỤC =================
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await categoryService.getAll();
                setCategories(res?.data || res || []);
            } catch (error) {
                console.error("Lỗi lấy danh mục:", error);
            }
        };
        fetchCategories();
    }, []);

    // ================= FETCH SẢN PHẨM =================
    const fetchProductsAPI = async (keyword = '', page = 1) => {
        setLoading(true);
        try {
            let res;
            if (keyword.trim() !== '') {
                res = await productService.search(keyword);
                const productList = res?.data || res || [];
                setProducts(Array.isArray(productList) ? productList : []);
                setTotalPages(1);
                setTotalItems(productList.length);
            } else {
                res = await productService.getAll(page, productsPerPage);
                if (res.success) {
                    setProducts(res.data);
                    if (res.pagination) {
                        setTotalPages(res.pagination.totalPages);
                        setTotalItems(res.pagination.totalItems);
                    }
                } else {
                    const productList = res?.data || res || [];
                    setProducts(Array.isArray(productList) ? productList : []);
                    setTotalPages(1);
                    setTotalItems(productList.length);
                }
            }
        } catch (error) {
            console.error("Lỗi lấy sản phẩm:", error);
            toast.error("Không thể tải danh sách sản phẩm!");
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
    }, [debouncedSearch]);

    useEffect(() => {
        fetchProductsAPI(debouncedSearch, currentPage);
    }, [currentPage, debouncedSearch]);

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = products;
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // ================= XỬ LÝ ẢNH =================
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.warning("Dung lượng ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, main_image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const openAddModal = () => {
        setEditingId(null);
        setFormData(initialFormState);
        setIsModalOpen(true);
    };

    const openEditModal = (product) => {
        setEditingId(product.product_id || product.id);
        
        const specs = product.specifications || {};

        setFormData({
            name: product.name,
            category_id: product.category_id,
            brand: product.brand || '',
            main_image: product.main_image || '',
            description: product.description || '',
            variants: product.variants || [],
            spec_cpu: specs.cpu || '',
            spec_gpu: specs.gpu || '',
            spec_screen: specs.screen || '',
            spec_weight: specs.weight || '',
            spec_length: specs.length || '',
            spec_width: specs.width || '',
            spec_height: specs.height || ''
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
            if (formData.variants.length === 0) {
                toast.error("Vui lòng thêm ít nhất một biến thể (Cấu hình)!");
                setIsSubmitting(false);
                return;
            }

            const payload = {
                name: formData.name,
                brand: formData.brand,
                main_image: formData.main_image,
                description: formData.description,
                category_id: Number(formData.category_id),
                variants: formData.variants.map(v => ({
                    ...v,
                    price: Number(v.price),
                    discount_price: v.discount_price ? Number(v.discount_price) : null,
                    stock_quantity: Number(v.stock_quantity)
                })),
                specifications: {
                    cpu: formData.spec_cpu,
                    gpu: formData.spec_gpu,
                    screen: formData.spec_screen,
                    weight: formData.spec_weight ? Number(formData.spec_weight) : 2000,
                    length: formData.spec_length ? Number(formData.spec_length) : 35,
                    width: formData.spec_width ? Number(formData.spec_width) : 25,
                    height: formData.spec_height ? Number(formData.spec_height) : 10
                }
            };

            if (editingId) {
                await productService.updateProduct(editingId, payload);
            } else {
                await productService.createProduct(payload);
            }

            toast.success(editingId ? "Cập nhật thành công!" : "Đã thêm sản phẩm mới!");
            closeModal();
            fetchProductsAPI(searchTerm); 
        } catch (error) {
            toast.error(error.response?.data?.message || "Có lỗi xảy ra!");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (id, name) => {
        setConfirmModal({
            isOpen: true,
            id: id,
            title: 'Xóa Sản Phẩm',
            message: `Bạn có chắc chắn muốn xóa laptop "${name}" không? Hành động này không thể hoàn tác.`
        });
    };

    const confirmDelete = async () => {
        try {
            await productService.deleteProduct(confirmModal.id);
            toast.success("Đã xóa sản phẩm khỏi hệ thống!");
            fetchProductsAPI(searchTerm);
        } catch (error) {
            console.error(error);
            toast.error("Không thể xóa sản phẩm này!");
        }
    };

    const handleAddVariant = () => {
        setFormData(prev => ({
            ...prev,
            variants: [...prev.variants, { variant_id: null, sku: '', ram: '', ssd: '', price: '', discount_price: '', stock_quantity: '' }]
        }));
    };

    const handleRemoveVariant = (index) => {
        setFormData(prev => {
            const newVariants = [...prev.variants];
            newVariants.splice(index, 1);
            return { ...prev, variants: newVariants };
        });
    };

    const handleVariantChange = (index, field, value) => {
        setFormData(prev => {
            const newVariants = [...prev.variants];
            newVariants[index][field] = value;
            return { ...prev, variants: newVariants };
        });
    };

    return (
        <div className="space-y-6">
            {/* Header & Search */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm gap-4">
                <div>
                    <h1 className="text-xl font-black text-gray-800 uppercase tracking-tight">Quản Lý Sản Phẩm</h1>
                    <p className="text-xs text-gray-400 mt-1">Quản lý các sản phẩm máy tính.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input type="text" placeholder="Gõ để tìm kiếm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition" />
                    </div>
                    <button onClick={openAddModal} className="bg-blue-600 text-white font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-xl hover:bg-red-700 transition flex items-center gap-2 shadow-lg shadow-red-200 whitespace-nowrap">
                        <Plus size={16} /> Thêm Laptop
                    </button>
                </div>
            </div>

            {/* Bảng Dữ Liệu */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[11px] tracking-wider border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Sản phẩm</th>
                                <th className="px-6 py-4">Thương hiệu</th>
                                <th className="px-6 py-4">Giá bán</th>
                                <th className="px-6 py-4 text-center">Tồn kho</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-medium">Đang tải dữ liệu...</td>
                                </tr>
                            ) : currentProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-medium">Không tìm thấy sản phẩm nào!</td>
                                </tr>
                            ) : (
                                currentProducts.map((product) => (
                                    <tr key={product.product_id || product.id} className="hover:bg-gray-50/50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                {product.main_image ? (
                                                    <img src={product.main_image} onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/400x300"; }} alt="" className="w-24 h-24 rounded-xl object-contain bg-white border border-gray-100 p-2 shadow-sm flex-shrink-0" />
                                                ) : (
                                                    <div className="w-24 h-24 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 border border-gray-200 shadow-sm flex-shrink-0">
                                                        <ImageIcon size={28} />
                                                    </div>
                                                )}
                                                <p className="font-bold text-gray-800 line-clamp-2 max-w-[200px]">{product.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-gray-600 px-3 py-1 bg-gray-100 rounded-lg text-xs">{product.brand || 'Khác'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-blue-600">
                                                    {product.variants && product.variants.length > 0 
                                                        ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.variants[0].discount_price || product.variants[0].price)
                                                        : 'N/A'
                                                    }
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`font-black text-lg ${(product.variants && product.variants.reduce((sum, v) => sum + v.stock_quantity, 0) > 0) ? 'text-green-500' : 'text-blue-500'}`}>
                                                {product.variants ? product.variants.reduce((sum, v) => sum + v.stock_quantity, 0) : 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => openEditModal(product)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition">
                                                    <Edit size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(product.product_id || product.id, product.name)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition">
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
                {!loading && totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-b-2xl">
                        <p className="text-xs text-gray-500 font-medium">
                            Hiển thị <span className="font-bold text-gray-800">{totalItems > 0 ? indexOfFirstProduct + 1 : 0}</span> - <span className="font-bold text-gray-800">{Math.min(indexOfLastProduct, totalItems)}</span> / <span className="font-bold text-gray-800">{totalItems}</span>
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

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                        
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight">
                                {editingId ? 'Cập nhật Laptop' : 'Thêm Laptop Mới'}
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-blue-600 bg-white p-2 rounded-full shadow-sm transition"><X size={20} /></button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            <form id="productForm" onSubmit={handleSubmit} className="space-y-6">
                                {/* KHỐI 1: THÔNG TIN CƠ BẢN */}
                                <div>
                                    <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Thông tin cơ bản</h3>
                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Tên Laptop <span className="text-blue-500">*</span></label>
                                            <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Danh mục <span className="text-blue-500">*</span></label>
                                                <select name="category_id" required value={formData.category_id} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition cursor-pointer">
                                                    <option value="">-- Chọn danh mục --</option>
                                                    {categories.map(c => (
                                                        <option key={c.category_id || c.id} value={c.category_id || c.id}>{c.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Thương hiệu</label>
                                                <input type="text" name="brand" placeholder="Dell, HP, Asus..." value={formData.brand} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* KHỐI BIẾN THỂ (VARIANTS) */}
                                <div>
                                    <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                                        <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-wider">Cấu hình (RAM/SSD)</h3>
                                        <button type="button" onClick={handleAddVariant} className="text-[10px] font-bold text-white bg-blue-600 px-3 py-1.5 rounded hover:bg-blue-700 transition">
                                            + Thêm cấu hình
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {formData.variants.length === 0 ? (
                                            <p className="text-sm text-gray-500 italic text-center py-4 bg-gray-50 rounded-xl">Chưa có cấu hình nào. Hãy thêm cấu hình!</p>
                                        ) : (
                                            formData.variants.map((variant, index) => (
                                                <div key={index} className="grid grid-cols-12 gap-3 items-end bg-gray-50 p-4 rounded-xl border border-gray-200">
                                                    <div className="col-span-12 sm:col-span-2">
                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Mã SKU</label>
                                                        <input type="text" placeholder="VD: SKU123" value={variant.sku || ''} onChange={(e) => handleVariantChange(index, 'sku', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                                                    </div>
                                                    <div className="col-span-12 sm:col-span-2">
                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">RAM <span className="text-red-500">*</span></label>
                                                        <input type="text" required placeholder="VD: 8GB" value={variant.ram} onChange={(e) => handleVariantChange(index, 'ram', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                                                    </div>
                                                    <div className="col-span-12 sm:col-span-2">
                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">SSD <span className="text-red-500">*</span></label>
                                                        <input type="text" required placeholder="VD: 256GB" value={variant.ssd} onChange={(e) => handleVariantChange(index, 'ssd', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                                                    </div>
                                                    <div className="col-span-12 sm:col-span-2">
                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Giá gốc <span className="text-red-500">*</span></label>
                                                        <input type="number" required min="0" value={variant.price} onChange={(e) => handleVariantChange(index, 'price', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                                                    </div>
                                                    <div className="col-span-12 sm:col-span-2">
                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Giá KM</label>
                                                        <input type="number" min="0" value={variant.discount_price} onChange={(e) => handleVariantChange(index, 'discount_price', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                                                    </div>
                                                    <div className="col-span-12 sm:col-span-1">
                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Tồn kho</label>
                                                        <input type="number" required min="0" value={variant.stock_quantity} onChange={(e) => handleVariantChange(index, 'stock_quantity', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                                                    </div>
                                                    <div className="col-span-12 sm:col-span-1 flex justify-end pb-1">
                                                        <button type="button" onClick={() => handleRemoveVariant(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Xóa cấu hình này">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* 🌟 KHỐI 2: THÔNG SỐ KỸ THUẬT (MAP VÀO JSONB) */}
                                <div className="pt-2">
                                    <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Thông số kỹ thuật</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">CPU</label>
                                            <input type="text" name="spec_cpu" placeholder="VD: Intel Core i5-12500H..." value={formData.spec_cpu} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition" />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Card Đồ Họa (GPU)</label>
                                            <input type="text" name="spec_gpu" placeholder="VD: NVIDIA GeForce RTX 3050Ti..." value={formData.spec_gpu} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Màn hình (Screen)</label>
                                            <input type="text" name="spec_screen" placeholder="VD: 15.6 inch FHD 144Hz IPS..." value={formData.spec_screen} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition" />
                                        </div>

                                    </div>
                                </div>

                                {/* 🌟 KHỐI VẬN CHUYỂN (DÙNG CHO GHN, LƯU VÀO JSONB) */}
                                <div className="pt-2">
                                    <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Thông số đóng gói & Vận chuyển (GHN)</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Cân nặng (gram)</label>
                                            <input type="number" name="spec_weight" placeholder="VD: 2000..." value={formData.spec_weight} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Chiều dài (cm)</label>
                                            <input type="number" name="spec_length" placeholder="VD: 35..." value={formData.spec_length} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Chiều rộng (cm)</label>
                                            <input type="number" name="spec_width" placeholder="VD: 25..." value={formData.spec_width} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Chiều cao (cm)</label>
                                            <input type="number" name="spec_height" placeholder="VD: 10..." value={formData.spec_height} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition" />
                                        </div>
                                    </div>
                                </div>

                                {/* KHỐI 3: HÌNH ẢNH & MÔ TẢ */}
                                <div className="pt-2">
                                    <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Nội dung & Hình ảnh</h3>
                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Hình ảnh chính</label>
                                            <div className="flex items-center gap-4">
                                                <label className="cursor-pointer flex flex-col items-center justify-center w-32 h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition group overflow-hidden">
                                                    {formData.main_image ? (
                                                        <img src={formData.main_image} alt="Preview" className="w-full h-full object-contain p-2" />
                                                    ) : (
                                                        <>
                                                            <Upload size={24} className="text-gray-400 group-hover:text-blue-500 mb-2" />
                                                            <span className="text-[10px] font-bold text-gray-400 group-hover:text-blue-500 uppercase text-center px-2">Chọn ảnh</span>
                                                        </>
                                                    )}
                                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                                </label>
                                                <div className="flex-1">
                                                    <input type="text" name="main_image" placeholder="Hoặc nhập Link ảnh trực tiếp..." value={formData.main_image} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition" />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Mô tả chi tiết</label>
                                            <textarea name="description" rows="4" value={formData.description} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition resize-none custom-scrollbar"></textarea>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                            <button type="button" onClick={closeModal} className="px-6 py-3 text-sm font-bold text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition shadow-sm">Hủy bỏ</button>
                            <button type="submit" form="productForm" disabled={isSubmitting} className="px-8 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-red-700 rounded-xl transition shadow-lg shadow-red-200 flex items-center gap-2 disabled:bg-gray-400">
                                {isSubmitting ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Thêm mới')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

export default ManageProducts;