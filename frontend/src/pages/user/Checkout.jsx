import { useContext, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom'; 
import { ArrowLeft, Phone, MapPin, FileText, CreditCard, ShoppingBag } from 'lucide-react';
import { CartContext } from '../../context/user/CartContext';
import { AuthContext } from '../../context/user/AuthContext';
import { userService } from '../../services/user.service';
import { orderService } from '../../services/order.service';
import { toast } from 'react-toastify';

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Lấy hàm fetchCart từ Context để load lại giỏ hàng sau khi chốt đơn
    const { fetchCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);

    // Nhận mảng sản phẩm tích chọn phẳng từ trang Cart gửi sang
    const selectedItems = location.state?.selectedItems || [];

    // Các State quản lý form đặt hàng
    const [phone, setPhone] = useState('');
    const [shippingAddress, setShippingAddress] = useState('');
    const [orderNote, setOrderNote] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Bắt lỗi: Nếu load trang mà không có sản phẩm nào được chọn thì đá về giỏ hàng
    if (selectedItems.length === 0) {
        setTimeout(() => navigate('/cart'), 0);
        return null;
    }

    // Đọc trực tiếp item.price/discount_price (Cấu trúc phẳng)
    const totalAmount = selectedItems.reduce((sum, item) => {
        const activePrice = Number(item.discount_price || item.price || 0);
        return sum + (activePrice * item.quantity);
    }, 0);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    // Hàm kiểm soát chỉ cho phép gõ số điện thoại
    const handlePhoneChange = (e) => {
        const value = e.target.value;
        const onlyNums = value.replace(/\D/g, '');
        if (onlyNums.length <= 10) {
            setPhone(onlyNums);
        }
    };

    // Tự động lấy thông tin từ Profile User
    const handleUseProfileInfo = async () => {
        if (!user) return;
        const userId = user.id || user.user_id;
        try {
            const res = await userService.getProfile(userId);
            if (res.success && res.data) {
                setPhone(res.data.phone || '');
                setShippingAddress(res.data.address || '');
                toast.success("Đã tự động điền thông tin tài khoản!");
            } else {
                toast.info("Tài khoản của bạn chưa cập nhật SĐT hoặc địa chỉ.");
            }
        } catch (error) {
            console.error("Lỗi tự động điền thông tin:", error);
            toast.error("Không thể kết nối lấy dữ liệu hồ sơ cá nhân");
        }
    };

    // XỬ LÝ KHI BẤM NÚT XÁC NHẬN ĐẶT HÀNG
    const handleCheckoutSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            toast.warning("Vui lòng đăng nhập tài khoản để tiến hành đặt hàng!");
            navigate('/login');
            return;
        }

        if (!phone.trim() || !shippingAddress.trim()) {
            toast.error("Vui lòng điền đầy đủ Số điện thoại và Địa chỉ nhận hàng!");
            return;
        }

        const phoneRegex = /^0[0-9]{9}$/;
        if (!phoneRegex.test(phone)) {
            toast.error("Số điện thoại nhận hàng phải có đúng 10 số và bắt đầu bằng số 0!");
            return;
        }

        setIsSubmitting(true);
        try {
            const orderPayload = {
                phone: phone,
                shipping_address: shippingAddress,
                order_note: orderNote || null,
                payment_method: paymentMethod,
                // Đọc thuộc tính phẳng chuẩn xác theo CartContext
                items: selectedItems.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price: Number(item.discount_price || item.price || 0)
                }))
            };

            // Dò tìm hàm tạo đơn an toàn trong file service của bạn
            const createOrderFunction = orderService.createOrder || orderService.create;
            if (!createOrderFunction) {
                throw new Error("Không tìm thấy hàm gửi đơn hàng trong orderService!");
            }

            const res = await createOrderFunction(orderPayload);
            
            if (res.success || res) {
                // 1. Kích hoạt đồng bộ tải lại giỏ hàng ngay lập tức để trừ đi các món đã mua
                if (typeof fetchCart === 'function') {
                    await fetchCart(); 
                }
                
                // 2. ĐIỀU HƯỚNG DỰA THEO PHƯƠNG THỨC THANH TOÁN
                if (paymentMethod === 'BANKING') {
                    // Chuyển sang trang quét QR kèm theo dữ liệu đơn hàng (chứa tổng tiền và id đơn)
                    navigate('/payment-qr', { state: { orderData: res.data || res } });
                } else {
                    // COD thì chuyển thẳng sang trang báo thành công
                    toast.success("Đặt hàng thành công!");
                    navigate('/order-success');
                }
            }
        } catch (error) {
            console.error("Lỗi gửi đơn hàng:", error);
            toast.error(error.response?.data?.message || "Đặt hàng thất bại. Vui lòng thử lại!");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-gray-800 animate-fadeIn">
            <div className="mb-6">
                <button onClick={() => navigate('/cart')} className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-600 bg-transparent border-none outline-none flex items-center gap-1 text-sm font-bold">
                    <ArrowLeft size={16} /> Quay lại sửa giỏ hàng
                </button>
            </div>

            <h1 className="text-xl font-black uppercase tracking-tight mb-8 border-l-4 border-red-600 pl-3">
                Thanh Toán Đơn Hàng
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* FORM NHẬP THÔNG TIN */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                        <h3 className="text-base font-extrabold text-gray-800 flex items-center gap-1.5">
                            <MapPin size={18} className="text-red-600" /> Thông tin nhận hàng
                        </h3>
                        {user && (
                            <button
                                type="button"
                                onClick={handleUseProfileInfo}
                                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition border border-blue-100 shadow-sm"
                            >
                                Sử dụng thông tin cá nhân
                            </button>
                        )}
                    </div>

                    <form id="checkoutForm" onSubmit={handleCheckoutSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1 tracking-wider">
                                <Phone size={12} /> Số điện thoại nhận hàng <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel" required
                                placeholder="Nhập số điện thoại nhận hàng..."
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium transition"
                                value={phone}
                                onChange={handlePhoneChange}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1 tracking-wider">
                                <MapPin size={12} /> Địa chỉ giao hàng chi tiết <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                rows="3" required
                                placeholder="Số nhà, ngõ, tên đường, xã, huyện, tỉnh..."
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium resize-none transition"
                                value={shippingAddress}
                                onChange={(e) => setShippingAddress(e.target.value)}
                            ></textarea>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1 tracking-wider">
                                <FileText size={12} /> Ghi chú đơn hàng (Không bắt buộc)
                            </label>
                            <textarea
                                rows="2"
                                placeholder="Ví dụ: Giao vào giờ hành chính..."
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium resize-none transition"
                                value={orderNote}
                                onChange={(e) => setOrderNote(e.target.value)}
                            ></textarea>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1 tracking-wider">
                                <CreditCard size={12} /> Phương thức thanh toán
                            </label>
                            <select
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-sm font-bold text-gray-700 transition cursor-pointer"
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            >
                                <option value="COD">Thanh toán tiền mặt khi nhận hàng (COD)</option>
                                <option value="BANKING">Chuyển khoản ngân hàng qua mã QR</option>
                            </select>
                        </div>
                    </form>
                </div>

                {/* TÓM TẮT SẢN PHẨM CHỐT MUA */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
                    <h3 className="text-sm font-black text-gray-400 uppercase mb-4 flex items-center gap-2 border-b border-gray-50 pb-2">
                        <ShoppingBag size={16} /> Đơn hàng chốt mua ({selectedItems.length} món)
                    </h3>
                    
                    <div className="divide-y divide-gray-50 max-h-60 overflow-y-auto pr-1 custom-scrollbar mb-4">
                        {selectedItems.map((item) => {
                            const activePrice = Number(item.discount_price || item.price || 0);
                            return (
                                <div key={item.product_id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                                    <img src={item.main_image} alt="" className="w-12 h-12 object-contain bg-white border rounded-lg p-1" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-gray-800 truncate">{item.name}</p>
                                        <p className="text-[11px] text-gray-400 mt-0.5">SL: x{item.quantity}</p>
                                    </div>
                                    <p className="text-xs font-bold text-red-600 whitespace-nowrap">
                                        {formatPrice(activePrice * item.quantity)}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    <div className="space-y-3 pt-2 border-t border-gray-100">
                        <div className="flex justify-between text-sm text-gray-500 font-medium">
                            <span>Tạm tính tiền máy:</span>
                            <span className="text-gray-800 font-semibold">{formatPrice(totalAmount)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500 font-medium">
                            <span>Phí vận chuyển:</span>
                            <span className="text-green-600 font-bold uppercase text-xs bg-green-50 px-2 py-0.5 rounded-md">Miễn phí</span>
                        </div>
                        <div className="flex justify-between items-baseline pt-4 border-t border-gray-100">
                            <span className="text-sm font-bold text-gray-800 uppercase tracking-wide">Thành tiền:</span>
                            <span className="text-2xl font-black text-red-600">{formatPrice(totalAmount)}</span>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            form="checkoutForm"
                            disabled={isSubmitting}
                            className="w-full bg-red-600 text-white font-black py-4 px-6 rounded-xl hover:bg-red-700 transition uppercase tracking-wider text-sm shadow-lg shadow-red-500/10 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Đang gửi đơn hàng...' : 'Xác nhận đặt hàng'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;