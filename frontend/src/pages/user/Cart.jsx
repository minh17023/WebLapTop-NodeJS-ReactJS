import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { Trash2, Plus, Minus, ArrowLeft, ArrowRight, ShoppingBag } from 'lucide-react';
import { CartContext } from '../../context/user/CartContext';
import { AuthContext } from '../../context/user/AuthContext';
import { toast } from 'react-toastify';

const Cart = () => {
    const { cartItems, updateQuantity, removeFromCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // 🌟 STATE MỚI: Lưu danh sách product_id được tích chọn mua
    const [selectedIds, setSelectedIds] = useState([]);

    // Hàm định dạng giá tiền VND nhanh của bạn
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    // Xử lý tích chọn / bỏ chọn từng sản phẩm
    const handleCheckItem = (productId) => {
        setSelectedIds(prev => 
            prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
        );
    };

    // Xử lý tích chọn tất cả sản phẩm
    const handleCheckAll = () => {
        if (selectedIds.length === cartItems.length) {
            setSelectedIds([]); // Bỏ chọn tất cả
        } else {
            setSelectedIds(cartItems.map(item => item.product_id)); // Chọn tất cả
        }
    };

    // Lọc ra danh sách sản phẩm thực sự được khách tích chọn mua
    const activeSelectedItems = cartItems.filter(item => 
        selectedIds.includes(item.product_id)
    );

    // Tính tổng tiền động chỉ dựa trên các sản phẩm được tích chọn
    const totalAmount = activeSelectedItems.reduce((sum, item) => {
        const activePrice = item.discount_price || item.price;
        return sum + (activePrice * item.quantity);
    }, 0);

    // Xử lý khi bấm nút mua hàng để chuyển tiếp sang trang Checkout
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
        // Đóng gói danh sách món đã chọn và điều hướng sang trang Checkout qua state của router
        navigate('/checkout', { state: { selectedItems: activeSelectedItems } });
    };

    // Giao diện khi giỏ hàng rỗng
    if (cartItems.length === 0) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-fadeIn">
                <div className="text-gray-300 mb-6 flex justify-center">
                    <div className="border-4 border-dashed border-gray-200 p-6 rounded-full">
                        <ShoppingBag size={64} />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Giỏ hàng trống!</h2>
                <p className="text-gray-500 mb-8">Bạn chưa thêm bất kỳ chiếc laptop nào vào giỏ hàng mua sắm.</p>
                <Link to="/" className="inline-flex items-center gap-2 bg-red-600 text-white font-bold py-3.5 px-8 rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-500/10">
                    <ArrowLeft size={18} /> Quay về trang chủ mua sắm
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-gray-800 animate-fadeIn">
            <h1 className="text-xl font-black uppercase tracking-tight mb-8 border-l-4 border-red-600 pl-3">
                Giỏ Hàng Của Tôi
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* CỘT TRÁI: DANH SÁCH SẢN PHẨM MUA */}
                <div className="lg:col-span-2 space-y-4">
                    
                    {/* Thanh Chọn tất cả */}
                    <div className="bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 text-sm font-bold text-gray-600">
                        <input 
                            type="checkbox" 
                            checked={cartItems.length > 0 && selectedIds.length === cartItems.length}
                            onChange={handleCheckAll}
                            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer accent-red-600"
                        />
                        <span>Chọn tất cả ({cartItems.length} sản phẩm)</span>
                    </div>

                    {/* Danh sách các sản phẩm */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 divide-y divide-gray-100">
                        {cartItems.map((item) => {
                            const activePrice = item.discount_price || item.price;
                            const isChecked = selectedIds.includes(item.product_id);

                            return (
                                <div key={item.product_id} className="grid grid-cols-1 sm:grid-cols-12 items-center py-6 gap-4 first:pt-0 last:pb-0">
                                    {/* Checkbox & Ảnh & Tên máy */}
                                    <div className="col-span-1 sm:col-span-6 flex items-center gap-4">
                                        <input 
                                            type="checkbox" 
                                            checked={isChecked}
                                            onChange={() => handleCheckItem(item.product_id)}
                                            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer accent-red-600 flex-shrink-0"
                                        />
                                        <img src={item.main_image} alt="" className="w-20 h-20 object-contain border border-gray-100 rounded-xl p-2 bg-gray-50/50 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <Link to={`/product/${item.slug}`} className="text-sm font-bold text-gray-800 hover:text-red-600 transition line-clamp-2">
                                                {item.name}
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Đơn giá */}
                                    <div className="col-span-1 sm:col-span-2 text-left sm:text-center text-sm font-semibold text-gray-600">
                                        <span className="sm:hidden text-gray-400 mr-1">Đơn giá:</span>
                                        {formatPrice(activePrice)}
                                    </div>

                                    {/* Tăng giảm số lượng */}
                                    <div className="col-span-1 sm:col-span-2 flex justify-start sm:justify-center">
                                        <div className="flex items-center border border-gray-200 rounded-lg p-1 bg-gray-50">
                                            <button type="button" onClick={() => updateQuantity(item.product_id, item.quantity - 1)} disabled={item.quantity <= 1} className="p-1 hover:text-red-600 transition disabled:opacity-30 bg-transparent border-none outline-none">
                                                <Minus size={14} />
                                            </button>
                                            <span className="px-3 text-sm font-bold text-gray-800 w-8 text-center">{item.quantity}</span>
                                            <button type="button" onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="p-1 hover:text-red-600 transition bg-transparent border-none outline-none">
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Thành tiền & Xóa */}
                                    <div className="col-span-1 sm:col-span-2 flex items-center justify-between sm:justify-end gap-4">
                                        <span className="sm:hidden text-gray-400 mr-1">Tạm tính:</span>
                                        <span className="text-sm font-bold text-red-600">{formatPrice(activePrice * item.quantity)}</span>
                                        <button type="button" onClick={() => removeFromCart(item.product_id)} className="text-gray-400 hover:text-red-600 transition p-1 bg-transparent border-none outline-none">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="pt-2">
                        <Link to="/" className="text-sm font-bold text-red-600 hover:text-red-700 flex items-center gap-2 transition">
                            <ArrowLeft size={16} /> Tiếp tục chọn thêm sản phẩm
                        </Link>
                    </div>
                </div>

                {/* CỘT PHẢI: KHỐI TẠM TÍNH TỔNG TIỀN */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
                    <h2 className="text-base font-extrabold text-gray-800 mb-4 uppercase tracking-wider text-xs text-gray-400">
                        Tóm tắt đơn hàng
                    </h2>
                    <div className="space-y-3 text-sm border-b border-gray-100 pb-4">
                        <div className="flex justify-between text-gray-500 font-medium">
                            <span>Sản phẩm đã chọn:</span>
                            <span className="font-bold text-gray-700">{selectedIds.length} mặt hàng</span>
                        </div>
                        <div className="flex justify-between items-baseline pt-2">
                            <span className="font-bold text-gray-800">Tạm tính tiền máy:</span>
                            <span className="text-xl font-black text-red-600">{formatPrice(totalAmount)}</span>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleGoToCheckout}
                        disabled={selectedIds.length === 0}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 px-6 rounded-xl transition uppercase tracking-wider text-sm shadow-lg shadow-red-500/10 flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
                    >
                        Tiến hành đặt hàng ({selectedIds.length}) <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;