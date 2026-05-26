import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Truck, ShieldCheck, CreditCard, Clock, Image as ImageIcon, Sparkles, ArrowRight } from 'lucide-react';
import { productService } from '../../services/product.service';
import { categoryService } from '../../services/category.service';

const slides = [
    {
        id: 1,
        badge: 'Thế hệ mới nhất 2026',
        titlePart1: 'Quyền Năng ',
        titleHighlight: 'Đỉnh Cao.',
        description: 'Khám phá bộ sưu tập laptop cao cấp với thiết kế tinh xảo, hiệu năng vượt trội. Nâng tầm trải nghiệm công việc và giải trí của bạn.',
        image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=1200&auto=format&fit=crop',
        link: '/products',
        buttonText: 'Khám Phá Ngay',
        secondaryLink: '/categories/laptop-gaming',
        secondaryText: 'Laptop Gaming'
    },
    {
        id: 2,
        badge: 'Mỏng nhẹ & Sang trọng',
        titlePart1: 'Trải Nghiệm ',
        titleHighlight: 'Hoàn Hảo.',
        description: 'Laptop mỏng nhẹ, pin siêu trâu, thiết kế nguyên khối. Sẵn sàng đồng hành cùng bạn mọi lúc mọi nơi trong công việc.',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200&auto=format&fit=crop',
        link: '/categories/laptop-van-phong',
        buttonText: 'Xem Văn Phòng',
        secondaryLink: '/products',
        secondaryText: 'Tất cả sản phẩm'
    },
    {
        id: 3,
        badge: 'Hiệu Năng Tối Thượng',
        titlePart1: 'Đột Phá ',
        titleHighlight: 'Giới Hạn.',
        description: 'Cỗ máy chiến game tối thượng. Đồ họa chân thực, tản nhiệt cực mát, sẵn sàng chinh phục mọi tựa game AAA.',
        image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=1200&auto=format&fit=crop',
        link: '/categories/laptop-gaming',
        buttonText: 'Chiến Game Ngay',
        secondaryLink: '/products',
        secondaryText: 'Khám Phá Thêm'
    }
];

const Home = () => {
    const [fetchingProducts, setFetchingProducts] = useState(true);
    const [fetchingCategories, setFetchingCategories] = useState(true);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);

    // Xử lý auto slide
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const catRes = await categoryService.getAll();
                setCategories(catRes.data || catRes || []);

                let prodRes;
                if (typeof productService.getProducts === 'function') {
                    prodRes = await productService.getProducts();
                } else {
                    prodRes = await productService.getAll();
                }
                
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

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    return (
        <div className="bg-white min-h-screen pb-20 animate-fade-in">
            {/* ================= MASSIVE HERO BANNER (SLIDER) ================= */}
            <div className="relative bg-[#0a0a0a] min-h-[600px] flex items-center overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#E30019]/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 opacity-50 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

                {slides.map((slide, index) => (
                    <div 
                        key={slide.id}
                        className={`absolute inset-0 w-full h-full flex items-center transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    >
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative w-full py-20">
                            <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
                                <div className={`lg:w-1/2 space-y-8 text-center lg:text-left transition-all duration-1000 transform ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
                                        <Sparkles size={16} className="text-[#E30019]" />
                                        <span className="text-white text-xs font-bold tracking-widest uppercase">{slide.badge}</span>
                                    </div>
                                    
                                    <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tight">
                                        {slide.titlePart1} <br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E30019] to-red-400">{slide.titleHighlight}</span>
                                    </h1>
                                    
                                    <p className="text-gray-400 text-lg md:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                                        {slide.description}
                                    </p>
                                    
                                    <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4">
                                        <Link 
                                            to={slide.link} 
                                            className="group relative px-8 py-4 bg-[#E30019] text-white font-bold rounded-full overflow-hidden shadow-[0_0_40px_rgba(227,0,25,0.4)] transition-all hover:shadow-[0_0_60px_rgba(227,0,25,0.6)] hover:-translate-y-1"
                                        >
                                            <span className="relative z-10 flex items-center gap-2">
                                                {slide.buttonText} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                            </span>
                                        </Link>
                                        <Link 
                                            to={slide.secondaryLink} 
                                            className="px-8 py-4 bg-transparent text-white font-bold rounded-full border border-white/20 hover:bg-white/10 transition-colors"
                                        >
                                            {slide.secondaryText}
                                        </Link>
                                    </div>
                                </div>
                                
                                <div className={`lg:w-1/2 relative w-full max-w-2xl transition-all duration-1000 transform ${index === currentSlide ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
                                    <div className="absolute inset-0 bg-gradient-to-tr from-[#E30019]/20 to-transparent rounded-full blur-3xl"></div>
                                    <img 
                                        src={slide.image} 
                                        alt={slide.titleHighlight} 
                                        className="relative w-full h-[350px] md:h-[450px] object-cover rounded-2xl shadow-2xl z-10"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Slider Dots */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-12 h-1.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-[#E30019]' : 'bg-white/30 hover:bg-white/50'}`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                {/* ================= FEATURES ================= */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 relative z-20">
                    <div className="bg-white p-6 rounded-2xl shadow-xl shadow-black/5 border border-gray-100 flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#E30019] group-hover:text-white transition-colors duration-300">
                            <Truck size={24} strokeWidth={1.5} />
                        </div>
                        <h4 className="font-bold text-[#0a0a0a]">Giao hàng hỏa tốc</h4>
                        <p className="text-xs text-gray-500 mt-2">Miễn phí toàn quốc</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-xl shadow-black/5 border border-gray-100 flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#E30019] group-hover:text-white transition-colors duration-300">
                            <ShieldCheck size={24} strokeWidth={1.5} />
                        </div>
                        <h4 className="font-bold text-[#0a0a0a]">Bảo hành VIP</h4>
                        <p className="text-xs text-gray-500 mt-2">1 đổi 1 trong 30 ngày</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-xl shadow-black/5 border border-gray-100 flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#E30019] group-hover:text-white transition-colors duration-300">
                            <CreditCard size={24} strokeWidth={1.5} />
                        </div>
                        <h4 className="font-bold text-[#0a0a0a]">Thanh toán dễ dàng</h4>
                        <p className="text-xs text-gray-500 mt-2">Trả góp 0% lãi suất</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-xl shadow-black/5 border border-gray-100 flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#E30019] group-hover:text-white transition-colors duration-300">
                            <Clock size={24} strokeWidth={1.5} />
                        </div>
                        <h4 className="font-bold text-[#0a0a0a]">Hỗ trợ 24/7</h4>
                        <p className="text-xs text-gray-500 mt-2">Đội ngũ chuyên gia</p>
                    </div>
                </div>

                {/* ================= CATEGORIES ================= */}
                <div className="mt-24 space-y-10">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl md:text-4xl font-black text-[#0a0a0a] tracking-tight">Danh Mục Nổi Bật</h2>
                        <div className="w-24 h-1 bg-[#E30019] mx-auto rounded-full"></div>
                    </div>

                    {fetchingCategories ? (
                        <div className="flex justify-center py-10">
                            <div className="w-8 h-8 border-4 border-gray-200 border-t-[#E30019] rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {categories.map((category) => (
                                <Link 
                                    key={category.category_id || category.id} 
                                    to={`/categories/${category.slug}`} 
                                    className="group block relative overflow-hidden rounded-3xl bg-gray-50 border border-gray-100 aspect-square md:aspect-[4/3] flex flex-col items-center justify-center p-6 transition-all duration-500 hover:shadow-2xl hover:border-[#E30019]/30"
                                >
                                    <div className="w-24 h-24 mb-6 flex items-center justify-center z-10 transition-transform duration-500 group-hover:scale-110">
                                        {category.image_url || category.image ? (
                                            <img src={category.image_url || category.image} alt={category.name} className="w-full h-full object-contain mix-blend-multiply drop-shadow-xl" />
                                        ) : (
                                            <ImageIcon size={48} className="text-gray-300 group-hover:text-[#E30019] transition-colors" />
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold text-[#0a0a0a] z-10 group-hover:text-[#E30019] transition-colors text-center">
                                        {category.name}
                                    </h3>
                                    <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* ================= LATEST PRODUCTS ================= */}
                <div className="mt-32 space-y-12">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-gray-200 pb-6">
                        <div className="space-y-4">
                            <h2 className="text-3xl md:text-4xl font-black text-[#0a0a0a] tracking-tight">Tuyệt Tác Công Nghệ</h2>
                            <p className="text-gray-500 font-medium">Những siêu phẩm được săn đón nhất hiện nay.</p>
                        </div>
                        <Link to="/products" className="group flex items-center gap-2 text-sm font-bold text-[#0a0a0a] hover:text-[#E30019] transition-colors">
                            Xem tất cả <span className="bg-gray-100 p-2 rounded-full group-hover:bg-red-50 transition-colors"><ChevronRight size={16} /></span>
                        </Link>
                    </div>

                    {fetchingProducts ? (
                        <div className="flex justify-center py-20">
                            <div className="w-8 h-8 border-4 border-gray-200 border-t-[#E30019] rounded-full animate-spin"></div>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-20 text-gray-500 font-medium bg-gray-50 rounded-3xl">Chưa có sản phẩm nào.</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {products.slice(0, 8).map((product) => {
                                const activePrice = product.discount_price || product.price;
                                const discountPercent = product.discount_price 
                                    ? Math.round(((product.price - product.discount_price) / product.price) * 100) 
                                    : 0;

                                return (
                                    <Link 
                                        key={product.product_id || product.id} 
                                        to={`/product/${product.slug}`} 
                                        className="group flex flex-col bg-white rounded-3xl p-6 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-gray-100 hover:border-gray-200"
                                    >
                                        <div className="relative aspect-square mb-8 bg-gray-50 rounded-2xl p-4 overflow-hidden flex items-center justify-center group-hover:bg-gray-100/50 transition-colors">
                                            {discountPercent > 0 && (
                                                <div className="absolute top-3 left-3 bg-[#E30019] text-white text-[11px] font-black px-3 py-1.5 rounded-full z-10 tracking-widest shadow-lg shadow-red-500/30">
                                                    -{discountPercent}%
                                                </div>
                                            )}
                                            {product.main_image ? (
                                                <img 
                                                    src={product.main_image} 
                                                    alt={product.name} 
                                                    className="w-full h-full object-contain mix-blend-multiply transform group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500 drop-shadow-xl" 
                                                />
                                            ) : (
                                                <ImageIcon size={48} className="text-gray-200" />
                                            )}
                                        </div>

                                        <div className="flex flex-col flex-grow">
                                            <h3 className="text-[15px] font-bold text-[#0a0a0a] group-hover:text-[#E30019] transition-colors line-clamp-2 leading-relaxed mb-4">
                                                {product.name}
                                            </h3>
                                            
                                            <div className="mt-auto flex items-end justify-between">
                                                <div>
                                                    <p className="text-[#E30019] font-black text-xl tracking-tight">
                                                        {formatPrice(activePrice)}
                                                    </p>
                                                    {product.discount_price && (
                                                        <p className="text-gray-400 text-sm font-semibold line-through mt-1">
                                                            {formatPrice(product.price)}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-[#0a0a0a] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                                    <ChevronRight size={20} />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;