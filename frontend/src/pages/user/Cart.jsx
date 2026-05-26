import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { Trash2, Plus, Minus, ArrowLeft, ArrowRight, ShoppingBag, Check } from 'lucide-react';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Cart = () => {
    const { cartItems, updateQuantity, removeFromCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [selectedIds, setSelectedIds] = useState([]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const handleCheckItem = (productId) => {
        setSelectedIds(prev => 
            prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
        );
    };

    const handleCheckAll = () => {
        if (selectedIds.length === cartItems.length) {
            setSelectedIds([]); 
        } else {
            setSelectedIds(cartItems.map(item => item.product_id)); 
        }
    };

    const activeSelectedItems = cartItems.filter(item => selectedIds.includes(item.product_id));

    const totalAmount = activeSelectedItems.reduce((sum, item) => {
        const activePrice = item.discount_price || item.price;
        return sum + (activePrice * item.quantity);
    }, 0);

    const handleGoToCheckout = () => {
        if (!user) {
            toast.warning("Vui lòng đăng nhập tài khoản để tiến hành đặt hàng!");
            navigate('/login');
            return;
        }
        if (activeSelectedItems.length === 0) {
            toast.error("Vui lòng tích chọn ít nhất một sản phẩm cần mua!");
            return;
        }
        navigate('/checkout', { state: { selectedItems: activeSelectedItems } });
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-[#fcfcfc] animate-fade-in">
                <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mb-8 border border-gray-100 shadow-inner">
                    <ShoppingBag size={48} className="text-gray-300" strokeWidth={1.5} />
                </div>
                <h2 className="text-3xl font-black text-[#0a0a0a] mb-3">Giỏ hàng trống</h2>
                <p className="text-gray-500 mb-8 max-w-md text-center">Bộ sưu tập công nghệ của bạn đang chờ được lấp đầy. Hãy khám phá những tuyệt tác mới nhất.</p>
                <Link to="/products" className="group flex items-center gap-2 bg-[#0a0a0a] text-white font-bold py-4 px-8 rounded-full hover:bg-gray-900 transition-all shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:-translate-y-1">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Khám phá ngay
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-[#fcfcfc] min-h-screen py-12 animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-200">
                    <h1 className="text-3xl font-black text-[#0a0a0a] tracking-tight">Giỏ Hàng Của Bạn</h1>
                    <span className="text-sm font-bold text-gray-500 bg-gray-100 px-4 py-2 rounded-full">{cartItems.length} sản phẩm</span>
                </div>

                <div className="flex flex-col lg:flex-row gap-10 items-start">
                    {/* CỘT TRÁI */}
                    <div className="w-full lg:w-2/3 space-y-6">
                        {/* Thanh Chọn tất cả */}
                        <div className="bg-white px-6 py-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:border-gray-200 transition-colors" onClick={handleCheckAll}>
                            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${selectedIds.length === cartItems.length && cartItems.length > 0 ? 'bg-[#0a0a0a] border-[#0a0a0a]' : 'border-gray-300 bg-white'}`}>
                                {selectedIds.length === cartItems.length && cartItems.length > 0 && <Check size={14} className="text-white" strokeWidth={3} />}
                            </div>
                            <span className="text-sm font-bold text-[#0a0a0a] uppercase tracking-wider">Chọn tất cả sản phẩm</span>
                        </div>

                        {/* Danh sách */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6 space-y-6">
                            {cartItems.map((item) => {
                                const activePrice = item.discount_price || item.price;
                                const isChecked = selectedIds.includes(item.product_id);

                                return (
                                    <div key={item.product_id} className="flex flex-col sm:flex-row items-start sm:items-center gap-6 py-6 border-b border-gray-50 last:border-0 last:pb-0 first:pt-0">
                                        <div className="flex items-center gap-4">
                                            <div 
                                                className={`w-6 h-6 rounded border-2 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0 ${isChecked ? 'bg-[#0a0a0a] border-[#0a0a0a]' : 'border-gray-300 bg-white'}`}
                                                onClick={() => handleCheckItem(item.product_id)}
                                            >
                                                {isChecked && <Check size={14} className="text-white" strokeWidth={3} />}
                                            </div>
                                            <div className="w-24 h-24 bg-gray-50 rounded-2xl p-2 border border-gray-100 flex-shrink-0">
                                                <img src={item.main_image} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <Link to={`/product/${item.slug}`} className="text-base font-bold text-[#0a0a0a] hover:text-[#0071E3] transition-colors line-clamp-2 leading-relaxed">
                                                {item.name}
                                            </Link>
                                            <p className="text-sm font-black text-[#E30019] mt-2">{formatPrice(activePrice)}</p>
                                        </div>

                                        <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                                            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1">
                                                <button type="button" onClick={() => updateQuantity(item.product_id, item.quantity - 1)} disabled={item.quantity <= 1} className="w-8 h-8 flex items-center justify-center hover:bg-white hover:text-[#0071E3] rounded-lg transition-colors disabled:opacity-30">
                                                    <Minus size={16} />
                                                </button>
                                                <span className="w-10 text-center text-sm font-bold text-[#0a0a0a]">{item.quantity}</span>
                                                <button type="button" onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white hover:text-[#0071E3] rounded-lg transition-colors">
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className="text-sm font-black text-[#0a0a0a] hidden sm:block">{formatPrice(activePrice * item.quantity)}</span>
                                                <button type="button" onClick={() => removeFromCart(item.product_id)} className="text-gray-400 hover:text-[#0071E3] transition-colors p-2 bg-gray-50 rounded-full hover:bg-blue-50">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* CỘT PHẢI: TẠM TÍNH */}
                    <div className="w-full lg:w-1/3">
                        <div className="bg-white border border-gray-100 text-[#0a0a0a] rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.04)] p-8 sticky top-28">
                            <h2 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
                                <ShoppingBag size={16} /> Tóm Tắt Đơn Hàng
                            </h2>
                            
                            <div className="space-y-4 border-b border-gray-100 pb-6 mb-6">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Đã chọn:</span>
                                    <span className="font-bold">{selectedIds.length} sản phẩm</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="text-sm text-gray-500">Tạm tính:</span>
                                    <span className="text-3xl font-black text-[#E30019] tracking-tight">{formatPrice(totalAmount)}</span>
                                </div>
                            </div>
                            
                            <button 
                                onClick={handleGoToCheckout}
                                disabled={selectedIds.length === 0}
                                className="w-full group relative bg-[#0071E3] text-white font-black py-5 rounded-2xl transition-all shadow-[0_10px_20px_rgba(0,113,227,0.2)] hover:shadow-[0_15px_30px_rgba(0,113,227,0.3)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-2 tracking-widest uppercase text-sm">
                                    Thanh Toán <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </span>
                            </button>

                            <div className="mt-6 flex flex-wrap gap-2 justify-center opacity-80">
                                <div className="px-3 py-1 border border-gray-200 text-gray-500 rounded-md text-[10px] font-bold uppercase tracking-wider">Bảo mật SSL</div>
                                <div className="px-3 py-1 border border-gray-200 text-gray-500 rounded-md text-[10px] font-bold uppercase tracking-wider">Hỗ trợ 24/7</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;