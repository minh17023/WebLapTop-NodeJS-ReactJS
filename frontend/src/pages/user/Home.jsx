import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Truck, ShieldCheck, CreditCard, Clock, Image as ImageIcon } from 'lucide-react';
import { productService } from '../../services/product.service';
import { categoryService } from '../../services/category.service';

const Home = () => {
    const [fetchingProducts, setFetchingProducts] = useState(true);
    const [fetchingCategories, setFetchingCategories] = useState(true);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. LẤY DANH MỤC
                const catRes = await categoryService.getAll();
                setCategories(catRes.data || catRes || []);

                // 2. LẤY SẢN PHẨM (Hỗ trợ cả 2 tên hàm getAll hoặc getProducts tùy file service của bạn)
                let prodRes;
                if (typeof productService.getProducts === 'function') {
                    prodRes = await productService.getProducts();
                } else {
                    prodRes = await productService.getAll();
                }
                
                // Đảm bảo dữ liệu là mảng
                const productList = prodRes?.data || prodRes || [];
                setProducts(Array.isArray(productList) ? productList : []);
                
            } catch (error) {
                console.error("Lỗi tải dữ liệu trang chủ:", error);
            } finally {
                setFetchingCategories(false);
                setFetchingProducts(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-fadeIn">
            
            {/* ================= HERO BANNER ================= */}
            <div className="bg-[#0f172a] rounded-[2rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden shadow-2xl">
                <div className="md:w-1/2 space-y-6 z-10">
                    <span className="inline-block bg-red-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                        Đợt sale khủng nhất năm
                    </span>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.15]">
                        Nâng Tầm Công Việc <br />
                        <span className="text-red-500">Cùng Laptop Mới</span>
                    </h1>
                    <p className="text-slate-300 text-sm md:text-base max-w-md leading-relaxed">
                        Khám phá hàng trăm mẫu laptop cấu hình mạnh mẽ, thiết kế mỏng nhẹ, đáp ứng mọi nhu cầu từ học tập đến chơi game đỉnh cao.
                    </p>
                    
                    <Link 
                        to="/products" 
                        className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-8 rounded-xl transition shadow-lg shadow-red-600/30 text-center"
                    >
                        Mua Ngay Hôm Nay
                    </Link>
                </div>
                
                <div className="md:w-1/2 z-10 relative">
                    <img 
                        src="https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=1000&auto=format&fit=crop" 
                        alt="Laptop Gaming" 
                        className="w-full h-auto rounded-2xl shadow-2xl transform hover:scale-105 transition duration-500" 
                    />
                </div>
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-red-500/20 rounded-full blur-[100px] pointer-events-none"></div>
            </div>

            {/* ================= THANH MENU TIỆN ÍCH ================= */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white border border-gray-100 p-6 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition cursor-pointer">
                    <div className="text-red-500 bg-red-50 p-3.5 rounded-xl"><Truck size={24} /></div>
                    <div>
                        <h4 className="font-bold text-gray-800 text-sm">Miễn phí giao hàng</h4>
                        <p className="text-[11px] text-gray-400 mt-0.5">Toàn quốc cho đơn từ 2tr</p>
                    </div>
                </div>
                <div className="bg-white border border-gray-100 p-6 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition cursor-pointer">
                    <div className="text-red-500 bg-red-50 p-3.5 rounded-xl"><ShieldCheck size={24} /></div>
                    <div>
                        <h4 className="font-bold text-gray-800 text-sm">Bảo hành chính hãng</h4>
                        <p className="text-[11px] text-gray-400 mt-0.5">Lên đến 24 tháng</p>
                    </div>
                </div>
                <div className="bg-white border border-gray-100 p-6 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition cursor-pointer">
                    <div className="text-red-500 bg-red-50 p-3.5 rounded-xl"><CreditCard size={24} /></div>
                    <div>
                        <h4 className="font-bold text-gray-800 text-sm">Thanh toán linh hoạt</h4>
                        <p className="text-[11px] text-gray-400 mt-0.5">Hỗ trợ trả góp 0%</p>
                    </div>
                </div>
                <div className="bg-white border border-gray-100 p-6 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition cursor-pointer">
                    <div className="text-red-500 bg-red-50 p-3.5 rounded-xl"><Clock size={24} /></div>
                    <div>
                        <h4 className="font-bold text-gray-800 text-sm">Đổi trả trong 30 ngày</h4>
                        <p className="text-[11px] text-gray-400 mt-0.5">Nếu có lỗi từ nhà NSX</p>
                    </div>
                </div>
            </div>

            {/* ================= KHU VỰC DANH MỤC (THIẾT KẾ TO RÕ RÀNG) ================= */}
            <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-red-600 rounded-full inline-block"></span> Danh mục nổi bật
                    </h2>
                </div>

                {fetchingCategories ? (
                    <div className="text-center py-8 text-gray-400 text-sm font-medium"><div className="animate-spin inline-block w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full mr-2 align-middle"></div> Đang tải danh mục...</div>
                ) : (
                    // 🌟 ĐÃ SỬA: Chia làm 4 cột thay vì 5/6 cột để Card to hơn, bo góc lớn hơn
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {categories.map((category) => (
                            <Link key={category.category_id || category.id} to={`/categories/${category.slug}`} className="bg-white rounded-3xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm hover:border-red-500 hover:shadow-md transition group">
                                {/* 🌟 ĐÃ SỬA: Tăng kích thước hộp ảnh từ w-12 lên w-16 */}
                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center p-2 flex-shrink-0 border border-gray-100 overflow-hidden">
                                    {/* 🌟 ĐÃ SỬA: Đọc đúng trường image_url từ Backend */}
                                    {category.image_url || category.image ? (
                                        <img src={category.image_url || category.image} alt={category.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition duration-300" />
                                    ) : (
                                        <ImageIcon size={28} className="text-gray-400 group-hover:text-red-500 transition" />
                                    )}
                                </div>
                                <h3 className="text-base font-bold text-gray-800 group-hover:text-red-600 transition line-clamp-2">
                                    {category.name}
                                </h3>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* ================= KHU VỰC 10 SẢN PHẨM MỚI NHẤT (2 HÀNG) ================= */}
            <div className="space-y-6 pt-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-red-600 rounded-full inline-block"></span> Laptop mới nhất
                    </h2>
                    <Link to="/products" className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition flex items-center gap-1">
                        Xem tất cả <ChevronRight size={14} />
                    </Link>
                </div>

                {fetchingProducts ? (
                    <div className="text-center py-12 text-gray-400 text-sm font-medium"><div className="animate-spin inline-block w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full mr-2 align-middle"></div> Đang tải sản phẩm...</div>
                ) : products.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 text-sm font-medium">Chưa có sản phẩm nào.</div>
                ) : (
                    // Lưới grid-cols-5 sẽ ép 10 sản phẩm tự động rớt xuống thành 2 hàng ngang (mỗi hàng 5 cái)
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                        {/* 🌟 ĐÃ SỬA: Dùng slice(0, 10) để bốc đúng 10 sản phẩm đầu tiên */}
                        {products.slice(0, 10).map((product) => {
                            const activePrice = product.discount_price || product.price;
                            return (
                                <Link key={product.product_id || product.id} to={`/product/${product.slug}`} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-xl hover:border-red-200 transition group flex flex-col h-full relative overflow-hidden">
                                    
                                    {/* Nhãn Sale */}
                                    {product.discount_price && (
                                        <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg z-10 shadow-sm">
                                            SALE
                                        </div>
                                    )}

                                    <div className="aspect-square mb-4 p-2 bg-white rounded-xl overflow-hidden relative flex items-center justify-center">
                                        {product.main_image ? (
                                            <img 
                                                src={product.main_image} 
                                                alt={product.name} 
                                                className="w-full h-full object-contain group-hover:scale-110 transition duration-500" 
                                            />
                                        ) : (
                                            <ImageIcon size={40} className="text-gray-200" />
                                        )}
                                    </div>

                                    <div className="flex-1 flex flex-col justify-between">
                                        <h3 className="text-sm font-bold text-gray-800 group-hover:text-red-600 transition line-clamp-2 mb-2 leading-relaxed">
                                            {product.name}
                                        </h3>
                                        <div className="mt-auto">
                                            <p className="text-red-600 font-black text-lg">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(activePrice)}
                                            </p>
                                            {product.discount_price && (
                                                <p className="text-gray-400 text-xs font-semibold line-through mt-0.5">
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

        </div>
    );
};

export default Home;