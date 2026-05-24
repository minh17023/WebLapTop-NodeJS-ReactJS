import { useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; 
import { ArrowLeft, Phone, MapPin, FileText, CreditCard, ShoppingBag, Truck, Loader2 } from 'lucide-react';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { userService } from '../../services/user.service';
import { orderService } from '../../services/order.service';
import { shippingService } from '../../services/shipping.service'; // Bổ sung API Giao Hàng Nhanh
import { toast } from 'react-toastify';

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const { fetchCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);

    const selectedItems = location.state?.selectedItems || [];

    // --- STATE QUẢN LÝ THÔNG TIN KHÁCH HÀNG ---
    const [phone, setPhone] = useState('');
    const [orderNote, setOrderNote] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- 🌟 STATE QUẢN LÝ GIAO HÀNG NHANH ---
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const [selectedProvince, setSelectedProvince] = useState({ id: '', name: '' });
    const [selectedDistrict, setSelectedDistrict] = useState({ id: '', name: '' });
    const [selectedWard, setSelectedWard] = useState({ code: '', name: '' });
    
    const [specificAddress, setSpecificAddress] = useState(''); // Số nhà, tên đường
    const [shippingFee, setShippingFee] = useState(0);
    const [isCalculatingFee, setIsCalculatingFee] = useState(false);

    // Bắt lỗi: Không có sản phẩm thì về giỏ hàng
    if (selectedItems.length === 0) {
        setTimeout(() => navigate('/cart'), 0);
        return null;
    }

    // Tính tổng tiền máy
    const itemsTotal = selectedItems.reduce((sum, item) => {
        const activePrice = Number(item.discount_price || item.price || 0);
        return sum + (activePrice * item.quantity);
    }, 0);

    // Tổng tiền cuối cùng = Tiền máy + Tiền ship
    const finalTotal = itemsTotal + shippingFee;

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value;
        const onlyNums = value.replace(/\D/g, '');
        if (onlyNums.length <= 10) setPhone(onlyNums);
    };

    const handleUseProfileInfo = async () => {
        if (!user) return;
        const userId = user.id || user.user_id;
        try {
            const res = await userService.getProfile(userId);
            if (res.success && res.data) {
                setPhone(res.data.phone || '');
                setSpecificAddress(res.data.address || ''); // Điền tạm địa chỉ vào ô số nhà
                toast.success("Đã lấy SĐT từ hồ sơ. Vui lòng chọn lại Tỉnh/Thành phố để tính phí ship!");
            }
        } catch (error) {
            toast.error("Không thể kết nối lấy dữ liệu hồ sơ cá nhân");
        }
    };

    // =======================================================
    // 🌟 LOGIC API GIAO HÀNG NHANH
    // =======================================================

    // 1. Tải danh sách Tỉnh/Thành khi mở trang
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const res = await shippingService.getProvinces();
                if (res.success) setProvinces(res.data);
            } catch (error) {
                console.error("Lỗi tải tỉnh thành:", error);
            }
        };
        fetchProvinces();
    }, []);

    // 2. Chọn Tỉnh ➔ Tải Huyện
    const handleProvinceChange = async (e) => {
        const provId = e.target.value;
        const provName = e.target.options[e.target.selectedIndex].text;
        setSelectedProvince({ id: provId, name: provName });
        
        setSelectedDistrict({ id: '', name: '' });
        setSelectedWard({ code: '', name: '' });
        setDistricts([]);
        setWards([]);
        setShippingFee(0);

        if (provId) {
            const res = await shippingService.getDistricts(provId);
            if (res.success) setDistricts(res.data);
        }
    };

    // 3. Chọn Huyện ➔ Tải Xã
    const handleDistrictChange = async (e) => {
        const distId = e.target.value;
        const distName = e.target.options[e.target.selectedIndex].text;
        setSelectedDistrict({ id: distId, name: distName });

        setSelectedWard({ code: '', name: '' });
        setWards([]);
        setShippingFee(0);

        if (distId) {
            const res = await shippingService.getWards(distId);
            if (res.success) setWards(res.data);
        }
    };

    // 4. Chọn Xã ➔ Tính phí ship
    const handleWardChange = async (e) => {
        const wardCode = e.target.value;
        const wardName = e.target.options[e.target.selectedIndex].text;
        setSelectedWard({ code: wardCode, name: wardName });

        if (selectedDistrict.id && wardCode) {
            setIsCalculatingFee(true);
            try {
                const res = await shippingService.calculateFee(selectedDistrict.id, wardCode);
                if (res.success) setShippingFee(res.fee);
            } catch (error) {
                toast.error("Không thể tính phí vận chuyển!");
            } finally {
                setIsCalculatingFee(false);
            }
        }
    };

    // =======================================================
    // LOGIC SUBMIT FORM
    // =======================================================
    const handleCheckoutSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            toast.warning("Vui lòng đăng nhập tài khoản để tiến hành đặt hàng!");
            navigate('/login');
            return;
        }

        if (!phone.trim() || !specificAddress.trim() || !selectedProvince.id || !selectedDistrict.id || !selectedWard.code) {
            toast.error("Vui lòng điền đầy đủ Địa chỉ nhận hàng!");
            return;
        }

        const phoneRegex = /^0[0-9]{9}$/;
        if (!phoneRegex.test(phone)) {
            toast.error("Số điện thoại nhận hàng phải có đúng 10 số và bắt đầu bằng số 0!");
            return;
        }

        setIsSubmitting(true);
        try {
            // Ghép chuỗi địa chỉ gửi cho shipper
            const fullAddress = `${specificAddress}, ${selectedWard.name}, ${selectedDistrict.name}, ${selectedProvince.name}`;

            const orderPayload = {
                phone: phone,
                shipping_address: fullAddress, // Chuỗi text dễ đọc
                district_id: selectedDistrict.id, // Lưu DB để tạo đơn GHN
                ward_code: selectedWard.code,     // Lưu DB để tạo đơn GHN
                shipping_fee: shippingFee,        // Lưu tiền ship vào DB
                order_note: orderNote || null,
                payment_method: paymentMethod,
                items: selectedItems.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price: Number(item.discount_price || item.price || 0)
                }))
            };

            const createOrderFunction = orderService.createOrder || orderService.create;
            const res = await createOrderFunction(orderPayload);
            
            if (res.success || res) {
                if (typeof fetchCart === 'function') await fetchCart(); 
                
                if (paymentMethod === 'BANKING') {
                    navigate('/payment-qr', { state: { orderData: res.data || res } });
                } else {
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
                                Tự điền SĐT từ hồ sơ
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

                        {/* 🌟 FORM DROPDOWN GIAO HÀNG NHANH */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Tỉnh / Thành <span className="text-red-500">*</span></label>
                                <select required onChange={handleProvinceChange} value={selectedProvince.id} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium transition">
                                    <option value="">Chọn Tỉnh/Thành</option>
                                    {provinces.map(p => (
                                        <option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Quận / Huyện <span className="text-red-500">*</span></label>
                                <select required onChange={handleDistrictChange} value={selectedDistrict.id} disabled={!selectedProvince.id} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium transition disabled:bg-gray-100 disabled:cursor-not-allowed">
                                    <option value="">Chọn Quận/Huyện</option>
                                    {districts.map(d => (
                                        <option key={d.DistrictID} value={d.DistrictID}>{d.DistrictName}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Phường / Xã <span className="text-red-500">*</span></label>
                                <select required onChange={handleWardChange} value={selectedWard.code} disabled={!selectedDistrict.id} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium transition disabled:bg-gray-100 disabled:cursor-not-allowed">
                                    <option value="">Chọn Phường/Xã</option>
                                    {wards.map(w => (
                                        <option key={w.WardCode} value={w.WardCode}>{w.WardName}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1 tracking-wider">
                                <MapPin size={12} /> Địa chỉ giao hàng chi tiết <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text" required
                                placeholder="Số nhà, ngõ, tên đường..."
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium transition"
                                value={specificAddress}
                                onChange={(e) => setSpecificAddress(e.target.value)}
                            />
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
                            <span className="text-gray-800 font-semibold">{formatPrice(itemsTotal)}</span>
                        </div>
                        
                        {/* 🌟 HIỂN THỊ PHÍ SHIP TỰ ĐỘNG TÍNH */}
                        <div className="flex justify-between items-center text-sm text-gray-500 font-medium">
                            <span className="flex items-center gap-1"><Truck size={14}/> Phí vận chuyển:</span>
                            {isCalculatingFee ? (
                                <Loader2 className="animate-spin text-gray-400" size={16} />
                            ) : (
                                <span className={shippingFee > 0 ? "text-gray-800 font-semibold" : "text-green-600 font-bold uppercase text-xs bg-green-50 px-2 py-0.5 rounded-md"}>
                                    {shippingFee > 0 ? formatPrice(shippingFee) : 'Chưa tính'}
                                </span>
                            )}
                        </div>

                        <div className="flex justify-between items-baseline pt-4 border-t border-gray-100">
                            <span className="text-sm font-bold text-gray-800 uppercase tracking-wide">Thành tiền:</span>
                            <span className="text-2xl font-black text-red-600">{formatPrice(finalTotal)}</span>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            form="checkoutForm"
                            disabled={isSubmitting || isCalculatingFee}
                            className="w-full bg-red-600 text-white font-black py-4 px-6 rounded-xl hover:bg-red-700 transition uppercase tracking-wider text-sm shadow-lg shadow-red-500/10 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? <><Loader2 size={18} className="animate-spin"/> Đang gửi đơn...</> : 'Xác nhận đặt hàng'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;