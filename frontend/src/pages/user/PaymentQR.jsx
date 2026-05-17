import { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Loader, QrCode, Home } from 'lucide-react'; 
import { orderService } from '../../services/order.service'; 
import { toast } from 'react-toastify';

const PaymentQR = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Nhận dữ liệu đơn hàng do trang Checkout truyền sang
    const orderData = location.state?.orderData; 

    // ĐỌC CẤU HÌNH NGÂN HÀNG TỪ FILE .ENV CỦA VITE
    const BANK_ID = import.meta.env.VITE_BANK_ID || "MB"; 
    const ACCOUNT_NO = import.meta.env.VITE_ACCOUNT_NO || ""; 
    const ACCOUNT_NAME = import.meta.env.VITE_ACCOUNT_NAME || ""; 

    const [isPaid, setIsPaid] = useState(false);

    // ==========================================
    // 🌟 PHÒNG THỦ 1: XỬ LÝ SỰ KIỆN BẤM NÚT "BACK" CỦA TRÌNH DUYỆT
    // ==========================================
    useEffect(() => {
        window.history.pushState(null, null, window.location.pathname);
        
        const handleBackButton = () => {
            // Khách bấm nút quay lại trên tab/điện thoại -> Ép về Trang chủ luôn
            navigate('/', { replace: true });
        };

        window.addEventListener('popstate', handleBackButton);
        return () => {
            window.removeEventListener('popstate', handleBackButton);
        };
    }, [navigate]);

    // Bắt lỗi: Nếu truy cập link trực tiếp hoặc thiếu data đơn hàng thì đẩy về giỏ hàng
    useEffect(() => {
        if (!orderData) {
            navigate('/cart', { replace: true });
        }
    }, [orderData, navigate]);

    if (!orderData) return null;

    // LẤY CHÍNH XÁC SỐ TIỀN VÀ MÃ ĐƠN TỪ CHECKOUT CHUYỂN SANG
    const amount = orderData.total_amount;
    const transferContent = `HNC${orderData.order_id || orderData.id}`;
    
    // API tạo mã VietQR tự động
    const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${amount}&addInfo=${transferContent}&accountName=${ACCOUNT_NAME}`;

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    // ==========================================
    // 🌟 PHÒNG THỦ 2: TỰ ĐỘNG QUÉT TRẠNG THÁI THANH TOÁN MỖI 5 GIÂY
    // ==========================================
    useEffect(() => {
        if (isPaid) return;

        const checkPaymentStatus = async () => {
            try {
                // Kiểm tra an toàn xem file service đã cập nhật hàm chưa
                if (typeof orderService.getById !== 'function') {
                    console.error("👉 LỖI: Bạn chưa khai báo hàm 'getById' trong file order.service.js ở Frontend!");
                    return;
                }

                const targetId = orderData.order_id || orderData.id;
                const res = await orderService.getById(targetId); 
                
                // Log ra console để dev dễ dàng theo dõi tiến độ quét
                console.log(`[Polling] Đang quét đơn hàng #${targetId} từ Railway...`);

                // Tự động thích ứng cấu trúc trả về (res.data hoặc res thuần)
                const currentOrder = res?.data || res;
                
                // Nếu Backend phản hồi trạng thái thanh toán đã thành 'paid'
                if (currentOrder && currentOrder.payment_status === 'paid') {
                    setIsPaid(true); // Đổi giao diện sang chúc mừng thành công lập tức
                    toast.success("Hệ thống đã xác nhận nhận được tiền thành công!");
                }
            } catch (error) {
                console.error("👉 Lỗi trong quá trình polling đơn hàng:", error);
            }
        };

        // 🌟 ĐÃ SỬA: Thay đổi thời gian quét định kỳ thành 5000ms (5 giây)
        const interval = setInterval(checkPaymentStatus, 5000); 
        return () => clearInterval(interval);
    }, [orderData, isPaid]);

    return (
        <div className="max-w-3xl mx-auto px-4 py-12 text-center animate-fadeIn">
            {!isPaid ? (
                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center">
                    <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4">
                        <QrCode size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-800 mb-2 uppercase tracking-wide">Thanh toán chuyển khoản</h2>
                    <p className="text-gray-500 mb-8 text-sm">Mở ứng dụng ngân hàng và quét mã QR bên dưới để thanh toán. Hệ thống sẽ tự động xác nhận trong vài giây.</p>
                    
                    {/* HÌNH ẢNH MÃ QR */}
                    <div className="border-4 border-red-500 rounded-2xl p-4 mb-8 shadow-[0_0_20px_rgba(239,68,68,0.2)] relative bg-white">
                        <img src={qrUrl} alt="VietQR Payment" className="w-64 h-auto md:w-80 rounded-xl" />
                    </div>

                    {/* CHI TIẾT ĐƠN HÀNG */}
                    <div className="bg-gray-50 w-full md:w-2/3 p-5 rounded-xl space-y-3 text-sm text-left mb-8 border border-gray-100">
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                            <span className="text-gray-500">Mã đơn hàng:</span>
                            <span className="font-bold text-gray-800">#{orderData.order_id || orderData.id}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                            <span className="text-gray-500">Nội dung chuyển khoản:</span>
                            <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">{transferContent}</span>
                        </div>
                        <div className="flex justify-between pt-1">
                            <span className="text-gray-500 font-medium mt-1">Số tiền cần chuyển:</span>
                            <span className="font-black text-red-600 text-xl">{formatPrice(amount)}</span>
                        </div>
                    </div>

                    {/* KHU VỰC TRẠNG THÁI VÀ NÚT ĐIỀU HƯỚNG */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
                        <div className="flex items-center gap-2 text-red-600 font-bold bg-red-50 px-6 py-3 rounded-xl animate-pulse">
                            <Loader className="animate-spin" size={18} />
                            Đang chờ thanh toán
                        </div>
                        
                        <Link 
                            to="/" 
                            className="flex items-center gap-2 text-gray-600 font-bold bg-gray-100 hover:bg-gray-200 px-6 py-3 rounded-xl transition"
                        >
                            <Home size={18} /> Về trang chủ
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="bg-white p-12 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center animate-fadeIn">
                    <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-100">
                        <CheckCircle size={48} />
                    </div>
                    <h2 className="text-3xl font-black text-gray-800 mb-4 tracking-tight">Thanh toán thành công!</h2>
                    <p className="text-gray-500 mb-8 max-w-md">Cảm ơn bạn! Chúng tôi đã nhận được tiền từ SePay. Đơn hàng của bạn đang được hệ thống ưu tiên đóng gói và giao hàng sớm nhất.</p>
                    <Link to="/" className="bg-red-600 text-white font-bold py-4 px-8 rounded-xl hover:bg-red-700 transition flex items-center gap-2 shadow-lg shadow-red-200">
                        Tiếp tục mua sắm <ArrowRight size={20} />
                    </Link>
                </div>
            )}
        </div>
    );
};

export default PaymentQR;