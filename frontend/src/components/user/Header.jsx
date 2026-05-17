import { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, User as UserIcon, LogOut, Package, UserCircle } from 'lucide-react';
import { AuthContext } from '../../context/user/AuthContext';
import { CartContext } from '../../context/user/CartContext';
import { productService } from '../../services/product.service';

const Header = () => {
    const { user, logout } = useContext(AuthContext);
    const { cartItems } = useContext(CartContext);
    const navigate = useNavigate();

    const [keyword, setKeyword] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef(null);

    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    // Live Search Logic (Debounce)
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (keyword.trim()) {
                const res = await productService.search(keyword);
                if (res.success) setSearchResults(res.data);
                setShowDropdown(true);
            } else {
                searchResults([]);
                setShowDropdown(false);
            }
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [keyword]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setShowDropdown(false);
        if (keyword.trim()) navigate(`/products?search=${keyword}`);
    };

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    return (
        <header className="sticky top-0 z-50">
            {/* ================= KHỐI TRÊN: MÀU TRẮNG (Logo, Tìm kiếm, User, Giỏ hàng) ================= */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <Link to="/" className="text-3xl font-extrabold text-red-600 tracking-tight flex-shrink-0">
                            HNC<span className="text-gray-800">LAPTOP</span>
                        </Link>

                        {/* Search Bar */}
                        <div className="flex-1 max-w-xl px-8 hidden md:block relative" ref={searchRef}>
                            <form onSubmit={handleSearchSubmit} className="relative">
                                <input
                                    type="text"
                                    placeholder="Bạn cần tìm laptop gì hôm nay?"
                                    className="w-full bg-gray-100 rounded-full py-2 pl-5 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500 border-transparent transition text-sm"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                />
                                <button type="submit" className="absolute right-3 top-2 text-gray-500 hover:text-red-600">
                                    <Search size={18} />
                                </button>
                            </form>

                            {/* Live Search Results */}
                            {showDropdown && searchResults.length > 0 && (
                                <div className="absolute w-full mt-2 left-0 px-8">
                                    <div className="bg-white rounded-lg shadow-2xl border border-gray-100 overflow-hidden">
                                        {searchResults.map(p => (
                                            <Link key={p.product_id} to={`/product/${p.slug}`} className="flex items-center p-3 hover:bg-gray-50 border-b last:border-0" onClick={() => setShowDropdown(false)}>
                                                <img src={p.main_image} className="w-10 h-10 object-contain mr-3" alt="" />
                                                <div>
                                                    <p className="text-xs font-bold text-gray-800 truncate w-48">{p.name}</p>
                                                    <p className="text-xs text-red-600 font-bold">{formatPrice(p.discount_price || p.price)}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-6">
                            <Link to="/cart" className="relative text-gray-600 hover:text-red-600 transition">
                                <ShoppingCart size={26} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>

                            {user ? (
                                <div className="relative group py-4">
                                    <div className="flex items-center space-x-2 cursor-pointer">
                                        <div className="bg-red-50 p-2 rounded-full text-red-600">
                                            <UserIcon size={20} />
                                        </div>
                                        <div className="hidden lg:block text-left">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase leading-none mt-1">Xin chào,</p>
                                            <p className="text-sm font-bold text-gray-800 leading-tight">{user.fullName || user.full_name}</p>
                                        </div>
                                    </div>

                                    {/* Dropdown Menu */}
                                    <div className="absolute right-0 top-full w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-1">
                                        <Link to="/profile" className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition">
                                            <UserCircle size={18} className="mr-3" /> Thông tin cá nhân
                                        </Link>
                                        <Link to="/my-orders" className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition">
                                            <Package size={18} className="mr-3" /> Đơn hàng của tôi
                                        </Link>
                                        {user.role === 'admin' && (
                                            <Link to="/admin" className="flex items-center px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 font-bold border-t border-gray-50">
                                                Quản trị hệ thống
                                            </Link>
                                        )}
                                        <div className="border-t border-gray-100 mt-1">
                                            <button onClick={logout} className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-bold transition">
                                                <LogOut size={18} className="mr-3" /> Đăng xuất
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-3 bg-gray-100 p-1 rounded-full px-4">
                                    <Link to="/login" className="text-xs font-bold text-gray-600 hover:text-red-600 transition">Đăng nhập</Link>
                                    <span className="text-gray-300">|</span>
                                    <Link to="/register" className="text-xs font-bold text-gray-600 hover:text-red-600 transition">Đăng ký</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ================= KHỐI DƯỚI: THANH MENU MÀU ĐỎ ================= */}
            <div className="bg-[#e30019] shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex items-center space-x-8 overflow-x-auto whitespace-nowrap scrollbar-hide py-3">
                        <Link to="/" className="text-white text-[13px] font-bold hover:text-red-200 transition">
                            Trang Chủ
                        </Link>
                        <Link to="/categories/laptop-gaming" className="text-white text-[13px] font-bold hover:text-red-200 transition">
                            Laptop Gaming
                        </Link>
                        <Link to="/categories/laptop-van-phong" className="text-white text-[13px] font-bold hover:text-red-200 transition">
                            Laptop Văn Phòng
                        </Link>
                        <Link to="/categories/macbook" className="text-white text-[13px] font-bold hover:text-red-200 transition">
                            Apple (MacBook)
                        </Link>
                        <Link to="/posts" className="text-white text-[13px] font-bold hover:text-red-200 transition">
                            Tin Tức Công Nghệ
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;