import { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, User as UserIcon, LogOut, Package, UserCircle } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
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
                setSearchResults([]);
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

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="sticky top-0 z-50 w-full animate-fade-in border-b border-gray-100 bg-white/95 backdrop-blur-md">
            {/* ================= TOP BAR (White) ================= */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link to="/" className="text-3xl font-black tracking-tighter flex-shrink-0 group">
                        <span className="text-[#0a0a0a] group-hover:text-gray-700 transition-colors">HNC</span>
                        <span className="text-[#E30019]">LAPTOP</span>
                    </Link>

                    {/* Search Bar - Sleek & Centered */}
                    <div className="flex-1 max-w-xl mx-8 hidden md:block relative" ref={searchRef}>
                        <form onSubmit={handleSearchSubmit} className="relative group">
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm cao cấp..."
                                className="w-full bg-gray-50 hover:bg-gray-100 focus:bg-white rounded-full py-2.5 pl-6 pr-12 text-sm text-[#0a0a0a] transition-all duration-300 border border-transparent focus:border-gray-200 focus:ring-4 focus:ring-gray-50 focus:outline-none"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                            />
                            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#E30019] transition-colors">
                                <Search size={18} strokeWidth={2.5} />
                            </button>
                        </form>

                        {/* Live Search Results */}
                        {showDropdown && searchResults.length > 0 && (
                            <div className="absolute w-full mt-3 left-0 z-50 animate-fade-in-up">
                                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                                    <div className="p-2 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-50">
                                        Kết quả tìm kiếm
                                    </div>
                                    <div className="max-h-[60vh] overflow-y-auto">
                                        {searchResults.map(p => (
                                            <Link key={p.product_id} to={`/product/${p.slug}`} className="flex items-center p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 group" onClick={() => setShowDropdown(false)}>
                                                <div className="w-12 h-12 bg-white rounded-lg p-1 border border-gray-100 mr-4 flex-shrink-0">
                                                    <img src={p.main_image} className="w-full h-full object-contain group-hover:scale-110 transition-transform" alt="" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-[#0a0a0a] truncate group-hover:text-[#E30019] transition-colors">{p.name}</p>
                                                    <p className="text-sm font-bold text-[#E30019] mt-0.5">{formatPrice(p.discount_price || p.price)}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-6 flex-shrink-0">
                        <Link to="/cart" className="relative text-[#0a0a0a] hover:text-[#E30019] transition-colors group">
                            <div className="p-2 rounded-full hover:bg-red-50 transition-colors">
                                <ShoppingCart size={22} strokeWidth={2.5} />
                            </div>
                            {cartCount > 0 && (
                                <span className="absolute 1 top-0 right-0 bg-[#E30019] text-white text-[10px] font-black rounded-full h-4 w-4 flex items-center justify-center ring-2 ring-white transform group-hover:scale-110 transition-transform">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {user ? (
                            <div className="relative group py-4">
                                <div className="flex items-center space-x-3 cursor-pointer">
                                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-[#0a0a0a] border border-gray-200 group-hover:border-[#E30019] group-hover:text-[#E30019] transition-colors">
                                        <UserIcon size={18} strokeWidth={2.5} />
                                    </div>
                                    <div className="hidden lg:block text-left">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-none">Tài khoản</p>
                                        <p className="text-sm font-bold text-[#0a0a0a] truncate w-24 leading-tight mt-0.5">{user.fullName || user.full_name}</p>
                                    </div>
                                </div>

                                {/* Dropdown Menu */}
                                <div className="absolute right-0 top-full w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right group-hover:scale-100 scale-95 z-50">
                                    <Link to="/profile" className="flex items-center px-4 py-2.5 text-sm font-medium text-[#0a0a0a] hover:bg-gray-50 hover:text-[#E30019] transition-colors">
                                        <UserCircle size={18} className="mr-3" /> Thông tin cá nhân
                                    </Link>
                                    <Link to="/my-orders" className="flex items-center px-4 py-2.5 text-sm font-medium text-[#0a0a0a] hover:bg-gray-50 hover:text-[#E30019] transition-colors">
                                        <Package size={18} className="mr-3" /> Đơn hàng của tôi
                                    </Link>
                                    {user.role === 'admin' && (
                                        <Link to="/admin" className="flex items-center px-4 py-2.5 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors border-t border-gray-100 mt-1">
                                            Quản trị hệ thống
                                        </Link>
                                    )}
                                    <div className="border-t border-gray-100 mt-1">
                                        <button onClick={logout} className="w-full flex items-center px-4 py-2.5 text-sm font-bold text-[#E30019] hover:bg-red-50 transition-colors">
                                            <LogOut size={18} className="mr-3" /> Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link to="/login" className="text-sm font-bold text-[#0a0a0a] hover:text-[#E30019] transition-colors">
                                    Đăng nhập
                                </Link>
                                <Link to="/register" className="text-sm font-bold text-white bg-[#0a0a0a] hover:bg-[#E30019] px-5 py-2 rounded-full transition-colors shadow-lg shadow-black/10 hover:shadow-red-500/20">
                                    Đăng ký
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ================= BOTTOM BAR (Black) ================= */}
            <div className="bg-[#0a0a0a]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex items-center space-x-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
                        <Link to="/" className="text-white text-sm font-bold py-4 border-b-2 border-transparent hover:border-[#E30019] hover:text-[#E30019] transition-all">
                            Trang Chủ
                        </Link>
                        <Link to="/categories/laptop-gaming" className="text-white text-sm font-bold py-4 border-b-2 border-transparent hover:border-[#E30019] hover:text-[#E30019] transition-all">
                            Laptop Gaming
                        </Link>
                        <Link to="/categories/laptop-van-phong" className="text-white text-sm font-bold py-4 border-b-2 border-transparent hover:border-[#E30019] hover:text-[#E30019] transition-all">
                            Laptop Văn Phòng
                        </Link>
                        <Link to="/categories/macbook" className="text-white text-sm font-bold py-4 border-b-2 border-transparent hover:border-[#E30019] hover:text-[#E30019] transition-all">
                            Apple (MacBook)
                        </Link>
                        <Link to="/products" className="text-white text-sm font-bold py-4 border-b-2 border-transparent hover:border-[#E30019] hover:text-[#E30019] transition-all">
                            Tất Cả Sản Phẩm
                        </Link>
                        <Link to="/posts" className="text-white text-sm font-bold py-4 border-b-2 border-transparent hover:border-[#E30019] hover:text-[#E30019] transition-all">
                            Tin Tức
                        </Link>
                        <Link to="/chinh-sach-bao-hanh" className="text-white text-sm font-bold py-4 border-b-2 border-transparent hover:border-[#E30019] hover:text-[#E30019] transition-all">
                            Chính Sách Bảo Hành
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;