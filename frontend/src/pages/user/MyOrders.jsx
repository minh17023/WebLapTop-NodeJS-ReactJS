import { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, XCircle, Truck, AlertTriangle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { orderService } from '../../services/order.service';
import { Link } from 'react-router-dom';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 5;

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

    const renderStatusBadge = (status) => {
        switch (status) {
            case 'pending': return <span className="flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-md text-xs font-bold uppercase tracking-wider border border-yellow-200"><Clock size={12}/> Chờ xác nhận</span>;
            case 'processing': return <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-bold uppercase tracking-wider border border-blue-200"><Package size={12}/> Đang chuẩn bị</span>;
            case 'shipped': return <span className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-md text-xs font-bold uppercase tracking-wider border border-purple-200"><Truck size={12}/> Đang giao</span>;
            case 'delivered': return <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-md text-xs font-bold uppercase tracking-wider border border-green-200"><CheckCircle size={12}/> Thành công</span>;
            case 'cancelled': return <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-bold uppercase tracking-wider border border-gray-200"><XCircle size={12}/> Đã hủy</span>;
            default: return null;
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        const actionText = newStatus === 'cancelled' ? 'hủy đơn hàng này' : 'xác nhận đã nhận được hàng';
        if (!window.confirm(`Bạn có chắc chắn muốn ${actionText}?`)) return;

        try {
            await orderService.userUpdateStatus(orderId, newStatus);
            toast.success("Cập nhật đơn hàng thành công!");
            fetchMyOrders(); 
        } catch (error) {
            toast.error(error.response?.data?.message || "Có lỗi xảy ra!");
        }
    };

    const handleReturnRequest = () => {
        toast.info("Vui lòng liên hệ Hotline 1900 xxxx để được hướng dẫn trả/hoàn hàng nhanh nhất!", { autoClose: 5000 });
    };

    return (
        <div className="bg-[#fcfcfc] min-h-screen py-12 animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-10 pb-6 border-b border-gray-200">
                    <div>
                        <h1 className="text-3xl font-black text-[#0a0a0a] tracking-tight">Đơn Hàng Của Tôi</h1>
                        <p className="text-gray-500 mt-2">Quản lý lịch sử mua hàng và theo dõi trạng thái vận chuyển.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#0a0a0a] rounded-full animate-spin"></div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-[2rem] p-16 text-center border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center gap-6">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
                            <Package size={40} className="text-gray-300" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-[#0a0a0a] mb-2">Chưa có đơn hàng nào</h3>
                            <p className="text-gray-500">Bạn chưa thực hiện giao dịch nào. Hãy khám phá sản phẩm của chúng tôi.</p>
                        </div>
                        <Link to="/products" className="bg-[#0a0a0a] text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-900 transition-colors">
                            Mua Sắm Ngay
                        </Link>
                    </div>
                ) : (
                    <div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {orders.map((order) => {
                            const orderId = order.order_id || order.id;
                            return (
                                <div key={orderId} className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden transition-all hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] group">
                                    
                                    <div className="p-6 border-b border-gray-100 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-[#0a0a0a]">
                                                <Package size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Mã đơn hàng</p>
                                                <p className="font-black text-lg text-[#0a0a0a]">#{orderId}</p>
                                            </div>
                                        </div>
                                        <div>
                                            {renderStatusBadge(order.status)}
                                        </div>
                                    </div>

                                    {order.tracking_code && (
                                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 text-sm">
                                                <Truck size={16} className="text-gray-400" />
                                                <span className="font-bold text-gray-500">Mã vận đơn (GHN):</span>
                                                <span className="font-black tracking-widest text-[#0a0a0a] bg-white px-3 py-1 rounded border border-gray-200">
                                                    {order.tracking_code}
                                                </span>
                                            </div>
                                            <a 
                                                href={`https://tracking.ghn.dev/?order_code=${order.tracking_code}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-[11px] font-bold text-white bg-[#0a0a0a] hover:bg-gray-800 px-4 py-2 rounded-lg transition-colors"
                                            >
                                                <Search size={14} /> TRA CỨU HÀNH TRÌNH
                                            </a>
                                        </div>
                                    )}

                                    <div className="p-6 space-y-4">
                                        {order.items && order.items.map((item, index) => (
                                            <div key={index} className="flex items-center gap-6 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                                <div className="w-20 h-20 bg-gray-50 rounded-2xl p-2 border border-gray-100 flex-shrink-0">
                                                    <img 
                                                        src={item.product?.main_image || 'https://via.placeholder.com/80'} 
                                                        alt={item.product?.name} 
                                                        className="w-full h-full object-contain mix-blend-multiply"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <Link to={`/product/${item.product?.slug}`} className="font-bold text-[#0a0a0a] hover:text-[#0071E3] transition-colors line-clamp-1 mb-1">
                                                        {item.product?.name}
                                                    </Link>
                                                    <p className="text-xs text-gray-400 font-medium">SL: x{item.quantity}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-[#E30019]">{formatPrice(item.price_at_purchase)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-6">
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Tổng thanh toán</p>
                                            <p className="text-2xl font-black text-[#E30019] tracking-tight">{formatPrice(order.total_amount)}</p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
                                            {order.status === 'pending' && (
                                                <button onClick={() => handleUpdateStatus(orderId, 'cancelled')} className="px-6 py-2.5 rounded-xl border border-gray-200 bg-white text-[#0a0a0a] font-bold text-sm hover:border-[#0071E3] hover:text-[#0071E3] transition-colors">
                                                    Hủy đơn hàng
                                                </button>
                                            )}

                                            {order.status === 'shipped' && (
                                                <button onClick={() => handleUpdateStatus(orderId, 'delivered')} className="px-6 py-2.5 rounded-xl bg-[#0a0a0a] text-white font-bold text-sm hover:bg-gray-900 shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5">
                                                    Đã nhận hàng
                                                </button>
                                            )}

                                            {order.status === 'delivered' && (
                                                <button onClick={handleReturnRequest} className="px-6 py-2.5 rounded-xl border border-gray-200 bg-white text-[#0a0a0a] font-bold text-sm hover:bg-gray-100 transition-colors flex items-center gap-2">
                                                    <AlertTriangle size={16} className="text-gray-400" /> Hoàn / Trả hàng
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-12">
                                <button 
                                    disabled={currentPage === 1}
                                    onClick={() => {
                                        setCurrentPage(prev => prev - 1);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-gray-200 text-gray-500 hover:border-[#0a0a0a] hover:text-[#0a0a0a] transition-colors disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-500"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                
                                <div className="px-4 py-2 bg-[#0a0a0a] text-white text-sm font-bold rounded-full shadow-md">
                                    {currentPage} / {totalPages}
                                </div>

                                <button 
                                    disabled={currentPage === totalPages}
                                    onClick={() => {
                                        setCurrentPage(prev => prev + 1);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-gray-200 text-gray-500 hover:border-[#0a0a0a] hover:text-[#0a0a0a] transition-colors disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-500"
                                >
                                    <ChevronRight size={20} />
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