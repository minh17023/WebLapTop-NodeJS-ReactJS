import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, User as UserIcon, ShieldAlert, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { userService } from '../../services/user.service';

const ManageUsers = () => {
    // ================= STATE =================
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const usersPerPage = 5;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const initialFormState = {
        full_name: '',
        email: '',
        password: '',
        phone: '',
        role: 'user'
    };
    const [formData, setFormData] = useState(initialFormState);

    // ================= FETCH DATA =================
    const fetchUsersAPI = async (keyword = '', page = 1) => {
        setLoading(true);
        try {
            let res;
            if (keyword.trim() !== '') {
                res = await userService.search(keyword);
                const userList = res?.data || res || [];
                setUsers(Array.isArray(userList) ? userList : []);
                setTotalPages(1);
                setTotalItems(userList.length);
            } else {
                res = await userService.getAll(page, usersPerPage);
                if (res.success) {
                    setUsers(res.data);
                    if (res.pagination) {
                        setTotalPages(res.pagination.totalPages);
                        setTotalItems(res.pagination.totalItems);
                    }
                }
            }
        } catch (error) {
            console.error("Lỗi lấy danh sách user:", error);
            toast.error("Không thể tải danh sách tài khoản!");
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
        fetchUsersAPI(debouncedSearch, currentPage);
    }, [currentPage, debouncedSearch]);

    // ================= PHÂN TRANG =================
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = users;
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // ================= XỬ LÝ FORM =================
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const openAddModal = () => {
        setEditingId(null);
        setFormData(initialFormState);
        setIsModalOpen(true);
    };

    const openEditModal = (user) => {
        setEditingId(user.user_id || user.id);
        setFormData({
            full_name: user.full_name || user.fullName || '',
            email: user.email || '',
            password: '',
            phone: user.phone || '',
            role: user.role || 'user'
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
            // Xóa trường password khỏi payload nếu đang sửa và người dùng để trống
            if (editingId && !payload.password) {
                delete payload.password;
            }

            if (editingId) {
                await userService.update(editingId, payload);
            } else {
                await userService.create(payload);
            }

            toast.success(editingId ? "Cập nhật tài khoản thành công!" : "Đã tạo tài khoản mới!");
            closeModal();
            fetchUsersAPI(searchTerm); 
        } catch (error) {
            toast.error(error.response?.data?.message || "Có lỗi xảy ra khi lưu!");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id, name, role) => {
        if (role === 'admin') {
            toast.error("Không thể xóa tài khoản Quản trị viên!");
            return;
        }
        if (!window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${name}"? Mọi đơn hàng của họ có thể bị ảnh hưởng!`)) return;
        
        try {
            await userService.delete(id);
            toast.success("Đã xóa tài khoản khỏi hệ thống!");
            fetchUsersAPI(searchTerm);
        } catch (error) {
            toast.error("Không thể xóa tài khoản này!");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm gap-4">
                <div>
                    <h1 className="text-xl font-black text-gray-800 uppercase tracking-tight">Quản Lý Thành Viên</h1>
                    <p className="text-xs text-gray-400 mt-1">Quản lý Khách hàng và cấp quyền Quản trị viên.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input type="text" placeholder="Tìm tên hoặc email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition" />
                    </div>
                    {/* <button onClick={openAddModal} className="bg-blue-600 text-white font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-xl hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-200 whitespace-nowrap">
                        <Plus size={16} /> Thêm Tài Khoản
                    </button> */}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[11px] tracking-wider border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Tài khoản</th>
                                <th className="px-6 py-4">Liên hệ</th>
                                <th className="px-6 py-4">Phân quyền</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400 font-medium">Đang tải dữ liệu...</td>
                                </tr>
                            ) : currentUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400 font-medium">Không tìm thấy người dùng nào!</td>
                                </tr>
                            ) : (
                                currentUsers.map((u) => (
                                    <tr key={u.user_id || u.id} className="hover:bg-gray-50/50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${u.role === 'admin' ? 'bg-blue-100 text-blue-600' : 'bg-blue-50 text-blue-600'}`}>
                                                    {u.full_name ? u.full_name.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800">{u.full_name || u.fullName}</p>
                                                    <p className="text-[11px] text-gray-400 mt-0.5">ID: {u.user_id || u.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-700">{u.email}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{u.phone || 'Chưa cập nhật SĐT'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {u.role === 'admin' ? (
                                                <span className="flex items-center gap-1.5 w-max bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold border border-blue-100">
                                                    <ShieldAlert size={14} /> Quản trị viên
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 w-max bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold border border-gray-200">
                                                    <UserIcon size={14} /> Khách hàng
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => openEditModal(u)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition">
                                                    <Edit size={16} />
                                                </button>
                                                {/* Không hiển thị nút xóa cho tài khoản admin */}
                                                {u.role !== 'admin' && (
                                                    <button onClick={() => handleDelete(u.user_id || u.id, u.full_name || u.fullName, u.role)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition">
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
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
                            Hiển thị <span className="font-bold text-gray-800">{totalItems > 0 ? indexOfFirstUser + 1 : 0}</span> - <span className="font-bold text-gray-800">{Math.min(indexOfLastUser, totalItems)}</span> / <span className="font-bold text-gray-800">{totalItems}</span>
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white rounded-3xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight">
                                {editingId ? 'Cập nhật Tài khoản' : 'Thêm Tài khoản mới'}
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-blue-600 bg-white p-2 rounded-full shadow-sm transition"><X size={20} /></button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form id="userForm" onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Họ và tên <span className="text-blue-500">*</span></label>
                                    <input type="text" name="full_name" required value={formData.full_name} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition" />
                                </div>
                                
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Địa chỉ Email <span className="text-blue-500">*</span></label>
                                    <input type="email" name="email" required value={formData.email} onChange={handleInputChange} disabled={editingId !== null} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed" />
                                </div>

                                {/* <div>
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">
                                        Mật khẩu {editingId ? <span className="text-gray-400 normal-case font-normal">(Bỏ trống nếu không muốn đổi)</span> : <span className="text-blue-500">*</span>}
                                    </label>
                                    <input type="password" name="password" required={!editingId} minLength="6" value={formData.password} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition" />
                                </div> */}

                                <div>
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Số điện thoại</label>
                                    <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition" />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Quyền hạn <span className="text-blue-500">*</span></label>
                                    <select name="role" required value={formData.role} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition cursor-pointer">
                                        <option value="user">Khách hàng (User)</option>
                                        <option value="admin">Quản trị viên (Admin)</option>
                                    </select>
                                </div>
                            </form>
                        </div>

                        <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                            <button type="button" onClick={closeModal} className="px-6 py-3 text-sm font-bold text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition shadow-sm">Hủy bỏ</button>
                            <button type="submit" form="userForm" disabled={isSubmitting} className="px-8 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-lg shadow-blue-200 flex items-center gap-2 disabled:bg-gray-400">
                                {isSubmitting ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Thêm mới')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;