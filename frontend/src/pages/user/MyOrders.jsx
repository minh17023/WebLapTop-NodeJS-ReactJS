import { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, XCircle, Truck, AlertTriangle, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { orderService } from '../../services/order.service';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 5; // Mỗi trang hiển thị 5 đơn hàng

    const fetchMyOrders = async () => {
        setLoading(true);
        try {
            const res = await orderService.getMyOrders(currentPage, limit);
            if (res.success) {
                setOrders(res.data || []);
                if (res.pagination) {
                    setTotalPages(res.pagination.totalPages);
                }
            }
        } catch (error) {
            toast.error("Không thể tải danh sách đơn hàng!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyOrders();
    }, [currentPage]);

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    // Render badge trạng thái
    const renderStatusBadge = (status) => {
        switch (status) {
            case 'pending': return <span className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-600 rounded-lg text-sm font-bold border border-yellow-100"><Clock size={16}/> Chờ xác nhận</span>;
            case 'processing': return <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold border border-blue-100"><Package size={16}/> Đang chuẩn bị hàng</span>;
            case 'shipped': return <span className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-sm font-bold border border-purple-100"><Truck size={16}/> Đang giao hàng</span>;
            case 'delivered': return <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm font-bold border border-green-100"><CheckCircle size={16}/> Giao thành công</span>;
            case 'cancelled': return <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-bold border border-red-100"><XCircle size={16}/> Đã hủy</span>;
            default: return null;
        }
    };

    // Xử lý Cập nhật trạng thái
    const handleUpdateStatus = async (orderId, newStatus) => {
        const actionText = newStatus === 'cancelled' ? 'hủy đơn hàng này' : 'xác nhận đã nhận được hàng';
        if (!window.confirm(`Bạn có chắc chắn muốn ${actionText}?`)) return;

        try {
            await orderService.userUpdateStatus(orderId, newStatus);
            toast.success("Cập nhật đơn hàng thành công!");
            fetchMyOrders(); // Gọi lại API để load lại dữ liệu mới nhất
        } catch (error) {
            toast.error(error.response?.data?.message || "Có lỗi xảy ra!");
        }
    };

    const handleReturnRequest = () => {
        toast.info("Vui lòng liên hệ Hotline 1900 xxxx để được hướng dẫn trả/hoàn hàng nhanh nhất!", { autoClose: 5000 });
    };

    return (
        <div className="bg-gray-50 min-h-screen py-10">
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex items-center gap-3 mb-8 border-l-4 border-red-600 pl-4">
                    <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Đơn Hàng Của Tôi</h1>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-gray-500 font-medium">Đang tải đơn hàng...</div>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-4">
                        <Package size={48} className="text-gray-300" />
                        <p className="text-gray-500 font-medium">Bạn chưa có đơn hàng nào.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => {
                            const orderId = order.order_id || order.id;
                            return (
                                <div key={orderId} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition hover:shadow-md">
                                    
                                    {/* Header của Đơn hàng */}
                                    <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Mã đơn hàng</p>
                                            <p className="font-black text-lg text-gray-800">#{orderId}</p>
                                        </div>
                                        <div>
                                            {renderStatusBadge(order.status)}
                                        </div>
                                    </div>

                                    {/* 🌟 VÙNG MỚI: HIỂN THỊ MÃ VẬN ĐƠN (NẾU CÓ) */}
                                    {order.tracking_code && (
                                        <div className="px-5 py-3 bg-blue-50/40 border-b border-blue-100 flex flex-wrap items-center justify-between gap-3">
                                            <div className="flex items-center gap-2 text-sm text-blue-800">
                                                <Truck size={16} className="text-blue-600" />
                                                <span className="font-medium">Mã vận đơn GHN:</span>
                                                <span className="font-black tracking-widest text-blue-700 bg-white px-2.5 py-1 rounded-md shadow-sm border border-blue-200">
                                                    {order.tracking_code}
                                                </span>
                                            </div>
                                            <a 
                                                href={`https://donhang.ghn.vn/?order_code=${order.tracking_code}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition shadow-sm shadow-blue-200"
                                            >
                                                <Search size={14} /> Tra cứu hành trình
                                            </a>
                                        </div>
                                    )}

                                    {/* Danh sách sản phẩm trong đơn */}
                                    <div className="p-5 space-y-4">
                                        {order.items && order.items.map((item, index) => (
                                            <div key={index} className="flex items-center gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                                <img 
                                                    src={item.product?.main_image || 'https://via.placeholder.com/80'} 
                                                    alt={item.product?.name} 
                                                    className="w-20 h-20 object-contain bg-white rounded-xl border border-gray-100 p-2"
                                                />
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-gray-800 line-clamp-2">{item.product?.name}</h3>
                                                    <p className="text-sm text-gray-500 mt-1">Số lượng: <span className="font-bold text-gray-700">{item.quantity}</span></p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-red-600">{formatPrice(item.price_at_purchase)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Footer của Đơn hàng: Thông tin tiền & Nút Hành Động */}
                                    <div className="p-5 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-5">
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium mb-1">Ngày đặt: {new Date(order.created_at || order.createdAt).toLocaleDateString('vi-VN')}</p>
                                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mt-2">Tổng thanh toán</p>
                                            <p className="text-xl font-black text-red-600">{formatPrice(order.total_amount)}</p>
                                        </div>

                                        {/* NÚT HÀNH ĐỘNG ẨN/HIỆN THÔNG MINH */}
                                        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
                                            
                                            {/* Nút Hủy Đơn (Chỉ hiện khi pending) */}
                                            {order.status === 'pending' && (
                                                <button onClick={() => handleUpdateStatus(orderId, 'cancelled')} className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:border-red-500 hover:text-red-600 hover:bg-red-50 transition">
                                                    Hủy đơn hàng
                                                </button>
                                            )}

                                            {/* Nút Đã Nhận Hàng (Chỉ hiện khi shipped) */}
                                            {order.status === 'shipped' && (
                                                <button onClick={() => handleUpdateStatus(orderId, 'delivered')} className="px-5 py-2.5 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 shadow-md shadow-green-200 transition">
                                                    Đã nhận được hàng
                                                </button>
                                            )}

                                            {/* Nút Yêu cầu hoàn hàng (Chỉ hiện khi đã nhận hàng thành công) */}
                                            {order.status === 'delivered' && (
                                                <button onClick={handleReturnRequest} className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-100 transition flex items-center gap-2">
                                                    <AlertTriangle size={16} /> Yêu cầu hoàn/trả
                                                </button>
                                            )}

                                        </div>
                                    </div>

                                </div>
                            );
                        })}

                        {/* THANH PHÂN TRANG */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-8 bg-white p-4 rounded-xl border border-gray-100 shadow-sm w-fit mx-auto">
                                <button 
                                    disabled={currentPage === 1}
                                    onClick={() => {
                                        setCurrentPage(prev => prev - 1);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-red-600 hover:text-white border border-gray-200 rounded-lg transition disabled:opacity-40 disabled:hover:bg-gray-50 disabled:hover:text-gray-700 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    Trước
                                </button>
                                <span className="text-sm font-semibold text-gray-600 bg-red-50 px-3 py-1.5 rounded-md border border-red-100">
                                    Trang {currentPage} / {totalPages}
                                </span>
                                <button 
                                    disabled={currentPage === totalPages}
                                    onClick={() => {
                                        setCurrentPage(prev => prev + 1);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-red-600 hover:text-white border border-gray-200 rounded-lg transition disabled:opacity-40 disabled:hover:bg-gray-50 disabled:hover:text-gray-700 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    Sau
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;