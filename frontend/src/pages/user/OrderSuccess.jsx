import { Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag, ArrowLeft, PhoneCall } from 'lucide-react';

const OrderSuccess = () => {
    return (
        <div className="max-w-3xl mx-auto px-4 py-16 text-center min-h-[75vh] flex flex-col items-center justify-center">
            {/* Icon tích xanh chuyển động nhẹ tạo cảm giác an tâm */}
            <div className="text-green-500 mb-6 animate-pulse">
                <CheckCircle size={80} strokeWidth={1.5} />
            </div>

            {/* Tiêu đề thông báo */}
            <h1 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">
                Đặt Hàng Thành Công!
            </h1>
            
            <p className="text-lg text-gray-600 font-medium mb-2">
                Cảm ơn bạn đã tin tưởng và mua sắm tại <span className="text-red-600 font-bold">HNC LAPTOP</span>.
            </p>
            
            <p className="text-sm text-gray-500 max-w-md mb-8 leading-relaxed">
                Hệ thống đã ghi nhận đơn hàng của bạn. Nhân viên tư vấn sẽ nhanh chóng gọi điện liên hệ xác nhận thông tin giao hàng trong vòng 15 - 30 phút tới.
            </p>

            {/* Khối thông tin hỗ trợ nhanh */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 w-full max-w-md mb-10 flex items-center justify-center gap-3 text-sm text-gray-600">
                <PhoneCall size={18} className="text-red-500" />
                <span>Hotline hỗ trợ kỹ thuật & giao hàng: <strong className="text-gray-800">1900.xxxx</strong></span>
            </div>

            {/* Điều hướng hành động */}
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                {/* Nút quay lại trang chủ */}
                <Link 
                    to="/" 
                    className="flex-1 inline-flex items-center justify-center bg-red-600 text-white font-bold py-3.5 px-6 rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-500/10 text-sm uppercase tracking-wider gap-2"
                >
                    <ArrowLeft size={18} /> Quay về trang chủ
                </Link>

                {/* Nút đi xem lịch sử đơn hàng */}
                <Link 
                    to="/my-orders" 
                    className="flex-1 inline-flex items-center justify-center bg-white text-gray-700 font-bold py-3.5 px-6 rounded-xl hover:bg-gray-50 border border-gray-200 transition text-sm uppercase tracking-wider gap-2"
                >
                    <ShoppingBag size={18} /> Đơn hàng của tôi
                </Link>
            </div>
        </div>
    );
};

export default OrderSuccess;