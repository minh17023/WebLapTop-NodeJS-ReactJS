import { Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag, ArrowLeft, PhoneCall } from 'lucide-react';

const OrderSuccess = () => {
    return (
        <div className="bg-[#fcfcfc] min-h-screen py-20 flex items-center justify-center px-4 animate-fade-in">
            <div className="max-w-2xl w-full bg-white p-10 md:p-16 rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col items-center text-center">
                
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-[#0a0a0a] rounded-full blur-2xl opacity-20 animate-pulse"></div>
                    <div className="relative w-24 h-24 bg-[#0a0a0a] text-white rounded-full flex items-center justify-center shadow-xl">
                        <CheckCircle size={48} strokeWidth={1.5} />
                    </div>
                </div>

                <h1 className="text-4xl font-black text-[#0a0a0a] mb-4 tracking-tight">
                    Đặt Hàng Thành Công
                </h1>
                
                <p className="text-xl text-gray-500 font-medium mb-4">
                    Cảm ơn bạn đã lựa chọn <span className="text-[#0071E3] font-black tracking-tight">HNC LAPTOP</span>.
                </p>
                
                <p className="text-base text-gray-500 max-w-lg mb-10 leading-relaxed font-light">
                    Đơn hàng của bạn đã được tiếp nhận. Chuyên viên của chúng tôi sẽ liên hệ với bạn trong ít phút tới để xác nhận thông tin.
                </p>

                <div className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-10 flex items-center justify-center gap-4 text-gray-600">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-[#0a0a0a]">
                        <PhoneCall size={20} />
                    </div>
                    <div className="text-left">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Hotline hỗ trợ (24/7)</p>
                        <p className="text-lg font-black text-[#0a0a0a]">1900.xxxx</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <Link 
                        to="/" 
                        className="flex-1 group inline-flex items-center justify-center bg-[#0a0a0a] text-white font-bold py-4 px-6 rounded-2xl hover:bg-gray-900 transition-all shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:-translate-y-1 gap-2"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Về trang chủ
                    </Link>

                    <Link 
                        to="/my-orders" 
                        className="flex-1 group inline-flex items-center justify-center bg-white text-[#0a0a0a] font-bold py-4 px-6 rounded-2xl hover:bg-gray-50 border border-gray-200 transition-all hover:-translate-y-1 gap-2"
                    >
                        Quản lý đơn hàng <ShoppingBag size={18} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;