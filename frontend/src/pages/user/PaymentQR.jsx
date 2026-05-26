import { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Loader, QrCode, Home, ArrowLeft } from 'lucide-react'; 
import { orderService } from '../../services/order.service'; 
import { toast } from 'react-toastify';

const PaymentQR = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const orderData = location.state?.orderData; 

    const BANK_ID = import.meta.env.VITE_BANK_ID || "MB"; 
    const ACCOUNT_NO = import.meta.env.VITE_ACCOUNT_NO || ""; 
    const ACCOUNT_NAME = import.meta.env.VITE_ACCOUNT_NAME || ""; 

    const [isPaid, setIsPaid] = useState(false);

    useEffect(() => {
        window.history.pushState(null, null, window.location.pathname);
        
        const handleBackButton = () => {
            navigate('/', { replace: true });
        };

        window.addEventListener('popstate', handleBackButton);
        return () => {
            window.removeEventListener('popstate', handleBackButton);
        };
    }, [navigate]);

    useEffect(() => {
        if (!orderData) {
            navigate('/cart', { replace: true });
        }
    }, [orderData, navigate]);

    if (!orderData) return null;

    const amount = orderData.total_amount;
    const transferContent = `HNC${orderData.order_id || orderData.id}`;
    
    const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${amount}&addInfo=${transferContent}&accountName=${ACCOUNT_NAME}`;

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    useEffect(() => {
        if (isPaid) return;

        const checkPaymentStatus = async () => {
            try {
                if (typeof orderService.getById !== 'function') return;

                const targetId = orderData.order_id || orderData.id;
                const res = await orderService.getById(targetId); 
                
                const currentOrder = res?.data || res;
                
                if (currentOrder && currentOrder.payment_status === 'paid') {
                    setIsPaid(true); 
                    toast.success("Hệ thống đã xác nhận nhận được tiền thành công!");
                }
            } catch (error) {
                console.error("Lỗi polling:", error);
            }
        };

        const interval = setInterval(checkPaymentStatus, 5000); 
        return () => clearInterval(interval);
    }, [orderData, isPaid]);

    return (
        <div className="bg-[#fcfcfc] min-h-[90vh] py-10 flex items-center justify-center animate-fade-in px-4">
            <div className="max-w-5xl w-full">
                {!isPaid ? (
                    <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col md:flex-row gap-12 items-center">
                        {/* Cột trái: QR Code */}
                        <div className="w-full md:w-1/2 flex flex-col items-center">
                            <h2 className="text-3xl md:text-4xl font-black text-[#0a0a0a] mb-3 tracking-tight text-center">Thanh toán bảo mật</h2>
                            <p className="text-gray-500 mb-8 text-center">Mở ứng dụng ngân hàng và quét mã QR bên dưới.</p>
                            
                            <div className="border border-gray-100 rounded-3xl p-6 shadow-lg relative bg-white group">
                                <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#0071E3]/20 rounded-3xl transition-colors"></div>
                                <img src={qrUrl} alt="VietQR Payment" className="w-64 h-auto md:w-72 rounded-2xl mx-auto mix-blend-multiply" />
                            </div>
                        </div>

                        {/* Cột phải: Thông tin */}
                        <div className="w-full md:w-1/2 flex flex-col">
                            <div className="hidden md:flex w-16 h-16 bg-[#0a0a0a] text-white rounded-full items-center justify-center mb-8 shadow-xl shadow-black/10">
                                <QrCode size={28} strokeWidth={1.5} />
                            </div>

                            <div className="w-full bg-gray-50 p-6 rounded-2xl space-y-4 text-sm mb-8 border border-gray-100">
                                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                                    <span className="text-gray-500">Mã đơn hàng:</span>
                                    <span className="font-bold text-[#0a0a0a]">#{orderData.order_id || orderData.id}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                                    <span className="text-gray-500">Nội dung CK:</span>
                                    <span className="font-bold text-[#0a0a0a] bg-white px-3 py-1 rounded-md border border-gray-200 uppercase tracking-wider">{transferContent}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-gray-500 font-medium">Tổng thanh toán:</span>
                                    <span className="font-black text-[#0071E3] text-2xl tracking-tight">{formatPrice(amount)}</span>
                                </div>
                            </div>

                            <div className="flex flex-col w-full gap-4">
                                <div className="flex items-center justify-center gap-3 text-[#0a0a0a] font-bold bg-gray-50 px-6 py-4 rounded-xl border border-gray-100">
                                    <Loader className="animate-spin text-[#0071E3]" size={20} />
                                    Hệ thống đang quét giao dịch...
                                </div>
                                
                                <Link to="/" className="flex items-center justify-center gap-2 text-gray-500 font-bold hover:text-[#0a0a0a] transition-colors py-2">
                                    <ArrowLeft size={18} /> Quay lại cửa hàng
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-10 md:p-16 rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col items-center animate-fade-in text-center">
                        <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mb-8 shadow-xl shadow-green-500/20">
                            <CheckCircle size={48} strokeWidth={1.5} />
                        </div>
                        <h2 className="text-4xl font-black text-[#0a0a0a] mb-4 tracking-tight">Thanh toán thành công!</h2>
                        <p className="text-gray-500 mb-10 max-w-md text-lg leading-relaxed">Giao dịch của bạn đã được xác nhận. Chúng tôi đang tiến hành chuẩn bị đơn hàng và sẽ giao đến bạn trong thời gian sớm nhất.</p>
                        <Link to="/" className="group bg-[#0a0a0a] text-white font-bold py-4 px-10 rounded-full hover:bg-gray-900 transition-all flex items-center gap-2 shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:-translate-y-1">
                            Trở về trang chủ <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentQR;