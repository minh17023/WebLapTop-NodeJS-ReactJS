import { useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom'; 
import { ArrowLeft, Phone, MapPin, FileText, CreditCard, ShoppingBag, Truck, Loader2, ShieldCheck } from 'lucide-react';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { userService } from '../../services/user.service';
import { orderService } from '../../services/order.service';
import { shippingService } from '../../services/shipping.service'; 
import { toast } from 'react-toastify';

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const { fetchCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);

    const selectedItems = location.state?.selectedItems || [];

    const [recipientName, setRecipientName] = useState('');
    const [phone, setPhone] = useState('');
    const [orderNote, setOrderNote] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const [selectedProvince, setSelectedProvince] = useState({ id: '', name: '' });
    const [selectedDistrict, setSelectedDistrict] = useState({ id: '', name: '' });
    const [selectedWard, setSelectedWard] = useState({ code: '', name: '' });
    
    const [specificAddress, setSpecificAddress] = useState(''); 
    const [shippingFee, setShippingFee] = useState(0);
    const [isCalculatingFee, setIsCalculatingFee] = useState(false);

    if (selectedItems.length === 0) {
        setTimeout(() => navigate('/cart'), 0);
        return null;
    }

    const itemsTotal = selectedItems.reduce((sum, item) => {
        const activePrice = Number(item.discount_price || item.price || 0);
        return sum + (activePrice * item.quantity);
    }, 0);

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
                setRecipientName(res.data.full_name || '');
                setPhone(res.data.phone || '');
                setSpecificAddress(res.data.address || ''); 
                toast.success("Đã lấy thông tin từ hồ sơ.");
            }
        } catch (error) {
            toast.error("Không thể kết nối lấy dữ liệu hồ sơ cá nhân");
        }
    };

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

    const handleWardChange = async (e) => {
        const wardCode = e.target.value;
        const wardName = e.target.options[e.target.selectedIndex].text;
        setSelectedWard({ code: wardCode, name: wardName });

        if (selectedDistrict.id && wardCode) {
            setIsCalculatingFee(true);
            try {
                // Tính tổng cân nặng đơn hàng. Mặc định 2000g mỗi sản phẩm nếu chưa có weight.
                const totalWeight = selectedItems.reduce((total, item) => {
                    const itemWeight = item.weight || 2000;
                    return total + (itemWeight * item.quantity);
                }, 0);

                const res = await shippingService.calculateFee(selectedDistrict.id, wardCode, totalWeight);
                if (res.success) setShippingFee(res.fee);
            } catch (error) {
                toast.error("Không thể tính phí vận chuyển!");
            } finally {
                setIsCalculatingFee(false);
            }
        }
    };

    const handleCheckoutSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            toast.warning("Vui lòng đăng nhập!");
            navigate('/login');
            return;
        }

        if (!recipientName.trim() || !phone.trim() || !specificAddress.trim() || !selectedProvince.id || !selectedDistrict.id || !selectedWard.code) {
            toast.error("Vui lòng điền đầy đủ Thông tin nhận hàng!");
            return;
        }

        const phoneRegex = /^0[0-9]{9}$/;
        if (!phoneRegex.test(phone)) {
            toast.error("Số điện thoại phải bắt đầu bằng số 0 và có đúng 10 chữ số!");
            return;
        }

        setIsSubmitting(true);
        try {
            const fullAddress = `${recipientName} - ${specificAddress}, ${selectedWard.name}, ${selectedDistrict.name}, ${selectedProvince.name}`;

            const orderPayload = {
                phone: phone,
                shipping_address: fullAddress, 
                district_id: selectedDistrict.id, 
                ward_code: selectedWard.code,     
                shipping_fee: shippingFee,        
                order_note: orderNote || null,
                payment_method: paymentMethod,
                items: selectedItems.map(item => ({
                    product_id: item.product_id,
                    variant_id: item.variant_id,
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
                    navigate('/order-success');
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Đặt hàng thất bại!");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-[#fcfcfc] min-h-screen py-10 animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link to="/cart" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-[#0a0a0a] mb-8 transition-colors">
                    <ArrowLeft size={16} className="mr-2" /> Trở lại giỏ hàng
                </Link>

                <h1 className="text-3xl font-black text-[#0a0a0a] tracking-tight mb-10">
                    Thanh Toán
                </h1>

                <div className="flex flex-col lg:flex-row gap-10">
                    {/* CỘT TRÁI: FORM THÔNG TIN */}
                    <div className="w-full lg:w-2/3">
                        <form id="checkoutForm" onSubmit={handleCheckoutSubmit} className="space-y-8">
                            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-lg font-black text-[#0a0a0a] flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[#0a0a0a]"><MapPin size={16}/></div> 
                                        Thông Tin Giao Hàng
                                    </h2>
                                    {user && (
                                        <button type="button" onClick={handleUseProfileInfo} className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 hover:bg-gray-200 text-[#0a0a0a] px-3 py-1.5 rounded-lg transition-colors">
                                            Dùng thông tin hồ sơ
                                        </button>
                                    )}
                                </div>
                                
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Người nhận *</label>
                                            <input type="text" required placeholder="Họ và tên..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#0a0a0a] focus:border-transparent outline-none transition-all" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Số điện thoại *</label>
                                            <input type="tel" required placeholder="Nhập số điện thoại..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#0a0a0a] focus:border-transparent outline-none transition-all" value={phone} onChange={handlePhoneChange} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tỉnh / Thành *</label>
                                            <select required onChange={handleProvinceChange} value={selectedProvince.id} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#0a0a0a] focus:border-transparent outline-none transition-all">
                                                <option value="">Chọn Tỉnh</option>
                                                {provinces.map(p => (<option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</option>))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Quận / Huyện *</label>
                                            <select required onChange={handleDistrictChange} value={selectedDistrict.id} disabled={!selectedProvince.id} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#0a0a0a] focus:border-transparent outline-none transition-all disabled:opacity-50">
                                                <option value="">Chọn Huyện</option>
                                                {districts.map(d => (<option key={d.DistrictID} value={d.DistrictID}>{d.DistrictName}</option>))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phường / Xã *</label>
                                            <select required onChange={handleWardChange} value={selectedWard.code} disabled={!selectedDistrict.id} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#0a0a0a] focus:border-transparent outline-none transition-all disabled:opacity-50">
                                                <option value="">Chọn Xã</option>
                                                {wards.map(w => (<option key={w.WardCode} value={w.WardCode}>{w.WardName}</option>))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Địa chỉ cụ thể *</label>
                                        <input type="text" required placeholder="Số nhà, ngõ, tên đường..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#0a0a0a] focus:border-transparent outline-none transition-all" value={specificAddress} onChange={(e) => setSpecificAddress(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ghi chú (Tùy chọn)</label>
                                        <textarea rows="2" placeholder="Giao hàng vào giờ hành chính..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#0a0a0a] focus:border-transparent outline-none transition-all resize-none" value={orderNote} onChange={(e) => setOrderNote(e.target.value)}></textarea>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                                <h2 className="text-lg font-black text-[#0a0a0a] flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[#0a0a0a]"><CreditCard size={16}/></div> 
                                    Phương Thức Thanh Toán
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <label className={`relative flex items-center p-4 border rounded-2xl cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-[#0a0a0a] bg-gray-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="w-4 h-4 text-[#0a0a0a] focus:ring-[#0a0a0a] border-gray-300 mr-3" />
                                        <span className="text-sm font-bold text-[#0a0a0a]">Thanh toán khi nhận hàng</span>
                                        {paymentMethod === 'COD' && <div className="absolute top-2 right-2"><ShieldCheck size={16} className="text-[#0a0a0a]"/></div>}
                                    </label>
                                    <label className={`relative flex items-center p-4 border rounded-2xl cursor-pointer transition-all ${paymentMethod === 'BANKING' ? 'border-[#0071E3] bg-blue-50/30 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input type="radio" name="payment" value="BANKING" checked={paymentMethod === 'BANKING'} onChange={() => setPaymentMethod('BANKING')} className="w-4 h-4 text-[#0071E3] focus:ring-[#0071E3] border-gray-300 mr-3" />
                                        <span className="text-sm font-bold text-[#0a0a0a]">Chuyển khoản QR Code</span>
                                        {paymentMethod === 'BANKING' && <div className="absolute top-2 right-2"><ShieldCheck size={16} className="text-[#0071E3]"/></div>}
                                    </label>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
                    <div className="w-full lg:w-1/3">
                        <div className="bg-white border border-gray-100 text-[#0a0a0a] p-8 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.04)] sticky top-28">
                            <h2 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
                                <ShoppingBag size={16} /> Đơn Hàng ({selectedItems.length})
                            </h2>
                            
                            <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar mb-6">
                                {selectedItems.map((item) => (
                                    <div key={item.product_id} className="flex gap-4 py-4 first:pt-0">
                                        <div className="w-16 h-16 bg-gray-50 rounded-xl p-1 flex-shrink-0 border border-gray-100">
                                            <img src={item.main_image} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-[#0a0a0a] truncate leading-relaxed">{item.name}</p>
                                            <p className="text-[10px] text-gray-500 mt-0.5">Cấu hình: {item.ram || 'N/A'} - {item.ssd || 'N/A'}</p>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-xs text-gray-500">SL: {item.quantity}</span>
                                                <span className="text-xs font-bold text-[#E30019]">{formatPrice(Number(item.discount_price || item.price) * item.quantity)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 pt-6 border-t border-gray-100 text-sm">
                                <div className="flex justify-between text-gray-500">
                                    <span>Tạm tính:</span>
                                    <span className="text-[#0a0a0a] font-bold">{formatPrice(itemsTotal)}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-500">
                                    <span className="flex items-center gap-2"><Truck size={14}/> Phí ship:</span>
                                    {isCalculatingFee ? (
                                        <Loader2 className="animate-spin" size={14} />
                                    ) : (
                                        <span className="text-[#0a0a0a] font-bold">{shippingFee > 0 ? formatPrice(shippingFee) : 'Chưa xác định'}</span>
                                    )}
                                </div>
                                <div className="flex justify-between items-end pt-4 border-t border-gray-100">
                                    <span className="font-black text-gray-500 uppercase tracking-widest">Tổng cộng:</span>
                                    <span className="text-3xl font-black text-[#E30019] tracking-tight">{formatPrice(finalTotal)}</span>
                                </div>
                            </div>

                            <button
                                type="submit" form="checkoutForm"
                                disabled={isSubmitting || isCalculatingFee}
                                className="w-full mt-8 bg-[#0071E3] text-white font-black py-4 rounded-xl uppercase tracking-widest text-sm shadow-[0_10px_20px_rgba(0,113,227,0.2)] hover:shadow-[0_15px_30px_rgba(0,113,227,0.3)] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <><Loader2 size={18} className="animate-spin"/> Xử lý...</> : 'Xác Nhận Mua'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;