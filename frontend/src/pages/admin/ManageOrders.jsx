import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Package, Check, X as CloseIcon, CreditCard, Truck, Download } from 'lucide-react'; 
import { toast } from 'react-toastify';
import { orderService } from '../../services/order.service';

const ManageOrders = () => {
    // ================= STATE =================
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); 
    
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const ordersPerPage = 10;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // ================= FETCH DATA =================
    const fetchOrdersAPI = async (keyword = '', page = 1) => {
        setLoading(true);
        try {
            let res;
            if (keyword.trim() !== '') {
                res = await orderService.search(keyword);
                const orderList = res?.data || res || [];
                setOrders(Array.isArray(orderList) ? orderList : []);
                setTotalPages(1);
                setTotalItems(orderList.length);
            } else {
                res = await orderService.getAll(page, ordersPerPage);
                if (res.success) {
                    setOrders(res.data);
                    if (res.pagination) {
                        setTotalPages(res.pagination.totalPages);
                        setTotalItems(res.pagination.totalItems);
                    }
                }
            }
        } catch (error) {
            toast.error("Không thể tải danh sách đơn hàng!");
        } finally {
            setLoading(false);
        }
    };

    // Debounce tìm kiếm
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Khi từ khóa đã debounce thay đổi, reset về trang 1
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch]);

    // Một useEffect duy nhất chịu trách nhiệm fetch dữ liệu khi trang hoặc từ khóa debounce thay đổi
    useEffect(() => {
        fetchOrdersAPI(debouncedSearch, currentPage);
    }, [currentPage, debouncedSearch]);

    // ================= LỌC & PHÂN TRANG =================
    const processedOrders = orders.filter(order => {
        if (filterStatus === 'all') return true;
        return order.status === filterStatus;
    });

    const currentOrders = processedOrders; // Sử dụng danh sách đã được phân trang từ backend

    // ================= LOGIC CHUYỂN TRẠNG THÁI GIAO HÀNG =================
    const handleStatusChange = async (orderId, newStatus) => {
        const actionName = newStatus === 'processing' ? 'Duyệt đơn' :
                           newStatus === 'shipped' ? 'Giao cho ĐVVC' :
                           newStatus === 'delivered' ? 'Xác nhận Đã giao' : 'Hủy đơn';

        if (!window.confirm(`Bạn muốn "${actionName}" cho đơn hàng #${orderId}?`)) return;

        try {
            await orderService.updateStatus(orderId, newStatus);
            toast.success(`${actionName} thành công!`);
            fetchOrdersAPI(searchTerm); // 🌟 Gọi lại API để lấy dữ liệu mới nhất (bao gồm cả tracking_code nếu có)
        } catch (error) {
            toast.error("Lỗi cập nhật trạng thái!");
        }
    };

    // ================= LOGIC CHUYỂN TRẠNG THÁI THANH TOÁN =================
    const handlePaymentStatusChange = async (orderId, newStatus) => {
        const originalOrders = [...orders];
        
        // Cập nhật UI ngay lập tức để tạo cảm giác mượt mà
        setOrders(orders.map(o => (o.order_id === orderId || o.id === orderId) ? { ...o, payment_status: newStatus } : o));
        
        try {
            await orderService.updatePaymentStatus(orderId, newStatus);
            toast.success('Cập nhật trạng thái thanh toán thành công!');
        } catch (error) {
            // Nếu API lỗi thì trả lại dữ liệu cũ
            setOrders(originalOrders);
            toast.error("Lỗi cập nhật thanh toán!");
        }
    };

    // ================= LOGIC XUẤT HÓA ĐƠN PDF =================
    const handleDownloadInvoice = async (orderId) => {
        try {
            toast.info("Đang khởi tạo hóa đơn...");
            const blob = await orderService.exportInvoice(orderId);
            
            // Tạo URL ảo để tự động tải về file PDF
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Invoice_#${orderId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            toast.success("Tải hóa đơn thành công!");
        } catch (error) {
            console.error("Lỗi tải hóa đơn:", error);
            toast.error("Không thể xuất hóa đơn!");
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': return <span className="bg-yellow-50 text-yellow-600 border border-yellow-200 px-2 py-1 rounded text-xs font-bold w-full block text-center">Chờ xác nhận</span>;
            case 'processing': return <span className="bg-blue-50 text-blue-600 border border-blue-200 px-2 py-1 rounded text-xs font-bold w-full block text-center">Đang chuẩn bị</span>;
            case 'shipped': return <span className="bg-purple-50 text-purple-600 border border-purple-200 px-2 py-1 rounded text-xs font-bold w-full block text-center">Đang giao hàng</span>;
            case 'delivered': return <span className="bg-green-50 text-green-600 border border-green-200 px-2 py-1 rounded text-xs font-bold w-full block text-center">Đã giao</span>;
            case 'cancelled': return <span className="bg-blue-50 text-blue-600 border border-blue-200 px-2 py-1 rounded text-xs font-bold w-full block text-center">Đã hủy</span>;
            default: return <span className="bg-gray-50 text-gray-600 border border-gray-200 px-2 py-1 rounded text-xs font-bold w-full block text-center">Không xác định</span>;
        }
    };

    // Render các nút hành động logic theo tiến trình
    const renderActionButtons = (orderId, status) => {
        switch (status) {
            case 'pending':
                return (
                    <div className="flex flex-col gap-1.5">
                        <button onClick={() => handleStatusChange(orderId, 'processing')} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold hover:bg-blue-700 transition w-full text-center shadow-sm">Duyệt Đơn</button>
                        <button onClick={() => handleStatusChange(orderId, 'cancelled')} className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-[11px] font-bold hover:bg-gray-200 transition w-full text-center">Hủy</button>
                    </div>
                );
            case 'processing':
                return (
                    <button onClick={() => handleStatusChange(orderId, 'shipped')} className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold hover:bg-purple-700 transition w-full text-center shadow-sm">Giao Cho ĐVVC</button>
                );
            case 'shipped':
                return (
                    <div className="flex flex-col gap-1.5">
                        <button onClick={() => handleStatusChange(orderId, 'delivered')} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold hover:bg-green-700 transition w-full text-center shadow-sm">Giao Thành Công</button>
                        <button onClick={() => handleStatusChange(orderId, 'cancelled')} className="bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg text-[11px] font-bold hover:bg-blue-100 transition w-full text-center">Giao Thất Bại</button>
                    </div>
                );
            case 'delivered':
            case 'cancelled':
                return <span className="text-[11px] text-gray-400 italic flex justify-center">Hoàn tất quy trình</span>;
            default: return null;
        }
    };

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header & Bộ lọc */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm gap-4">
                <div>
                    <h1 className="text-xl font-black text-gray-800 uppercase tracking-tight">Quản Lý Đơn Hàng</h1>
                    <p className="text-xs text-gray-400 mt-1">Theo dõi, xử lý và cập nhật tiến độ giao hàng.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                    <div className="relative w-full sm:w-auto">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <select 
                            value={filterStatus}
                            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                            className="w-full sm:w-48 pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition cursor-pointer appearance-none"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="pending">Chờ xác nhận</option>
                            <option value="processing">Đang chuẩn bị hàng</option>
                            <option value="shipped">Đang giao hàng</option>
                            <option value="delivered">Đã giao thành công</option>
                            <option value="cancelled">Đã hủy</option>
                        </select>
                    </div>
                    <div className="relative flex-1 w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input type="text" placeholder="Tìm tên, SĐT hoặc Mã đơn..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition" />
                    </div>
                </div>
            </div>

            {/* Bảng Dữ Liệu */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[11px] tracking-wider border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Thông tin đơn</th>
                                <th className="px-6 py-4">Khách hàng</th>
                                <th className="px-6 py-4 text-center">
                                    <CreditCard size={14} className="inline mr-1 mb-0.5" /> Thanh toán
                                </th>
                                <th className="px-6 py-4 text-center">Giao hàng</th>
                                <th className="px-6 py-4 text-center w-32">Thao tác xử lý</th>
                                <th className="px-6 py-4 text-right">Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400 font-medium">Đang tải dữ liệu...</td>
                                </tr>
                            ) : currentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400 font-medium flex flex-col items-center justify-center gap-3">
                                        <Package size={32} className="text-gray-300" />
                                        <span>Không tìm thấy đơn hàng nào!</span>
                                    </td>
                                </tr>
                            ) : (
                                currentOrders.map((order) => {
                                    const orderId = order.order_id || order.id;
                                    return (
                                        <tr key={orderId} className="hover:bg-gray-50/50 transition">
                                            <td className="px-6 py-4">
                                                <p className="font-black text-gray-800">#{orderId}</p>
                                                <p className="text-[11px] text-gray-500 mt-0.5">{new Date(order.created_at || order.createdAt).toLocaleString('vi-VN')}</p>
                                                <p className="font-bold text-blue-600 mt-1">{formatPrice(order.total_amount)}</p>
                                                <span className="text-[10px] uppercase font-bold text-gray-400">{order.payment_method}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-gray-800">{order.full_name}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{order.phone}</p>
                                            </td>

                                            {/* CỘT THANH TOÁN */}
                                            <td className="px-6 py-4 text-center align-middle">
                                                <select
                                                    value={order.payment_status || 'unpaid'}
                                                    onChange={(e) => handlePaymentStatusChange(orderId, e.target.value)}
                                                    className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg outline-none cursor-pointer border transition-colors w-full text-center ${
                                                        order.payment_status === 'paid' 
                                                            ? 'bg-green-50 text-green-700 border-green-200' 
                                                            : order.payment_status === 'refunded'
                                                                ? 'bg-gray-100 text-gray-600 border-gray-200'
                                                                : 'bg-blue-50 text-blue-600 border-blue-200'
                                                    }`}
                                                >
                                                    <option value="unpaid">Chưa thu tiền</option>
                                                    <option value="paid">Đã thanh toán</option>
                                                    <option value="refunded">Đã hoàn tiền</option>
                                                </select>
                                            </td>

                                            {/* 🌟 CỘT GIAO HÀNG (CÓ TRACKING CODE) */}
                                            <td className="px-6 py-4 text-center align-middle">
                                                {getStatusBadge(order.status)}
                                                {order.tracking_code && (
                                                    <div className="mt-2 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 rounded px-2 py-1 uppercase tracking-wider">
                                                        Mã: {order.tracking_code}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 align-middle">
                                                {renderActionButtons(orderId, order.status)}
                                            </td>
                                            <td className="px-6 py-4 text-right align-middle flex justify-end gap-2">
                                                <button onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition inline-flex items-center gap-2 text-xs font-bold">
                                                    <Eye size={16} /> Xem
                                                </button>
                                                <button onClick={() => handleDownloadInvoice(orderId)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition inline-flex items-center gap-2 text-xs font-bold" title="Tải hóa đơn PDF">
                                                    <Download size={16} /> Hóa đơn
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Phân trang */}
                {!loading && totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-b-2xl">
                        <p className="text-xs text-gray-500 font-medium">
                            Hiển thị <span className="font-bold text-gray-800">{totalItems > 0 ? (currentPage - 1) * 10 + 1 : 0}</span> - <span className="font-bold text-gray-800">{Math.min(currentPage * 10, totalItems)}</span> / <span className="font-bold text-gray-800">{totalItems}</span>
                        </p>
                        <div className="flex items-center gap-1 flex-wrap justify-end">
                            <button onClick={() => setCurrentPage(prev => prev - 1)} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-white hover:text-blue-600 disabled:opacity-50 transition bg-transparent"><ChevronLeft size={16} /></button>
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
                                        <button key={1} onClick={() => setCurrentPage(1)} className={`w-8 h-8 rounded-lg text-xs font-bold transition border bg-transparent text-gray-600 border-gray-200 hover:bg-white hover:text-blue-600`}>1</button>
                                    );
                                    if (startPage > 2) {
                                        pages.push(<span key="dots1" className="px-1 text-gray-400">...</span>);
                                    }
                                }

                                for (let i = startPage; i <= endPage; i++) {
                                    pages.push(
                                        <button key={i} onClick={() => setCurrentPage(i)} className={`w-8 h-8 rounded-lg text-xs font-bold transition border ${currentPage === i ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' : 'bg-transparent text-gray-600 border-gray-200 hover:bg-white hover:text-blue-600'}`}>
                                            {i}
                                        </button>
                                    );
                                }

                                if (endPage < totalPages) {
                                    if (endPage < totalPages - 1) {
                                        pages.push(<span key="dots2" className="px-1 text-gray-400">...</span>);
                                    }
                                    pages.push(
                                        <button key={totalPages} onClick={() => setCurrentPage(totalPages)} className={`w-8 h-8 rounded-lg text-xs font-bold transition border bg-transparent text-gray-600 border-gray-200 hover:bg-white hover:text-blue-600`}>{totalPages}</button>
                                    );
                                }
                                return pages;
                            })()}
                            <button onClick={() => setCurrentPage(prev => prev + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-white hover:text-blue-600 disabled:opacity-50 transition bg-transparent"><ChevronRight size={16} /></button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Chi tiết đơn hàng */}
            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white rounded-3xl w-full max-w-3xl flex flex-col shadow-2xl overflow-hidden max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                            <div>
                                <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
                                    Chi tiết đơn hàng #{selectedOrder.order_id || selectedOrder.id}
                                </h2>
                                <p className="text-xs text-gray-500 mt-1">Ngày đặt: {new Date(selectedOrder.created_at || selectedOrder.createdAt).toLocaleString('vi-VN')}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-blue-600 bg-white p-2 rounded-full shadow-sm transition border border-gray-100"><CloseIcon size={20} /></button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 border-b border-gray-200 pb-2">Thông tin người nhận</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div><p className="text-gray-500 mb-1">Khách hàng:</p><p className="font-bold text-gray-800">{selectedOrder.full_name}</p></div>
                                    <div><p className="text-gray-500 mb-1">Số điện thoại:</p><p className="font-bold text-gray-800">{selectedOrder.phone}</p></div>
                                    <div className="sm:col-span-2"><p className="text-gray-500 mb-1">Địa chỉ giao hàng:</p><p className="font-bold text-gray-800 leading-relaxed">{selectedOrder.shipping_address}</p></div>
                                    
                                    {/* 🌟 THÊM KHU VỰC VẬN ĐƠN GHN */}
                                    <div className="sm:col-span-2 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-blue-50/50 p-3.5 rounded-xl border border-blue-100 mt-2 gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Truck size={20} /></div>
                                            <div>
                                                <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">Mã vận đơn GHN</p>
                                                <p className="font-black text-blue-900 text-base">{selectedOrder.tracking_code || <span className="text-gray-400 text-sm italic font-medium">Chưa có mã vận đơn</span>}</p>
                                            </div>
                                        </div>
                                        {selectedOrder.tracking_code && (
                                            <a 
                                                href={`https://tracking.ghn.dev/?order_code=${selectedOrder.tracking_code}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-xs bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-sm w-full sm:w-auto text-center"
                                            >
                                                Tra cứu hành trình
                                            </a>
                                        )}
                                    </div>

                                    {selectedOrder.order_note && (
                                        <div className="sm:col-span-2 bg-yellow-50 p-3 rounded-lg border border-yellow-100 mt-2">
                                            <p className="text-xs text-yellow-800 font-bold mb-1">Ghi chú của khách:</p>
                                            <p className="text-sm text-yellow-700 italic">{selectedOrder.order_note}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 border-b border-gray-100 pb-2">Sản phẩm đã đặt</h3>
                                <div className="space-y-3">
                                    {selectedOrder.items && selectedOrder.items.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition">
                                            <div className="flex items-center gap-4">
                                                <img src={item.product?.main_image || ''} alt="" className="w-16 h-16 object-contain bg-white rounded-lg border border-gray-100 p-1" />
                                                <div>
                                                    <p className="font-bold text-gray-800 text-sm line-clamp-1">{item.product?.name || 'Sản phẩm không xác định'}</p>
                                                    <p className="text-[10px] text-gray-500 mt-0.5">Cấu hình: {item.variant?.ram || 'N/A'} - {item.variant?.ssd || 'N/A'}</p>
                                                    <p className="text-xs text-gray-500 mt-1">Đơn giá: <span className="font-medium text-gray-700">{formatPrice(item.price_at_purchase)}</span></p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500 mb-1">SL: <span className="font-bold text-gray-800 text-sm">x{item.quantity}</span></p>
                                                <p className="font-black text-blue-600 text-sm">{formatPrice(item.price_at_purchase * item.quantity)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* TỔNG KẾT TIỀN */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <div className="flex gap-3 items-center">
                                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                                    selectedOrder.payment_status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' : 
                                    selectedOrder.payment_status === 'refunded' ? 'bg-gray-100 text-gray-600 border-gray-200' : 
                                    'bg-blue-50 text-blue-600 border-blue-200'
                                }`}>
                                    {selectedOrder.payment_status === 'paid' ? 'Đã thu tiền' : selectedOrder.payment_status === 'refunded' ? 'Đã hoàn tiền' : 'Chưa thu tiền'}
                                </span>
                                <button onClick={() => handleDownloadInvoice(selectedOrder.order_id || selectedOrder.id)} className="bg-blue-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm flex items-center gap-1.5">
                                    <Download size={14} /> Xuất Hóa Đơn (PDF)
                                </button>
                            </div>
                            <div className="text-right">
                                {/* 🌟 Hiển thị thêm dòng Phí Ship */}
                                <div className="text-xs font-medium text-gray-500 mb-1 flex justify-end gap-6">
                                    <span>Phí vận chuyển:</span>
                                    <span className="font-bold text-gray-700">{selectedOrder.shipping_fee > 0 ? formatPrice(selectedOrder.shipping_fee) : 'Miễn phí'}</span>
                                </div>
                                <div className="flex justify-end items-end gap-4 mt-2">
                                    <p className="text-xs font-bold text-gray-500 uppercase pb-1">Tổng cộng:</p>
                                    <p className="text-2xl font-black text-blue-600 leading-none">{formatPrice(selectedOrder.total_amount)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageOrders;