import { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productService } from '../../services/product.service';
import { ShoppingCart, Check, Shield, ArrowLeft, Zap, CreditCard, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import ReviewSection from '../../components/user/ReviewSection';
import { CartContext } from '../../context/CartContext'; 

const ProductDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [relatedProducts, setRelatedProducts] = useState([]);

    const { addToCart } = useContext(CartContext);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await productService.getBySlug(slug);
                if (res.success) {
                    setProduct(res.data);
                    
                    // Fetch related products
                    let categorySlug = res.data.Category?.slug;
                    if (categorySlug) {
                        const relatedRes = await productService.getByCategory(categorySlug, 1, 5);
                        if (relatedRes.success) {
                            const filtered = (relatedRes.data || []).filter(p => p.product_id !== res.data.product_id);
                            setRelatedProducts(filtered.slice(0, 4));
                        }
                    } else {
                        const allRes = await productService.getAll(1, 5);
                        const list = allRes?.data || allRes || [];
                        const filtered = (Array.isArray(list) ? list : []).filter(p => p.product_id !== res.data.product_id);
                        setRelatedProducts(filtered.slice(0, 4));
                    }
                }
            } catch (error) {
                toast.error('Không tìm thấy sản phẩm');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [slug]);

    const handleBuyNow = () => {
        if (!product) return;
        const directItem = {
            product_id: product.product_id,
            name: product.name,
            price: product.price,
            discount_price: product.discount_price,
            main_image: product.main_image,
            quantity: 1 
        };
        navigate('/checkout', { state: { selectedItems: [directItem] } });
    };

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    if (loading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-[#E30019] rounded-full animate-spin"></div>
        </div>
    );
    
    if (!product) return (
        <div className="text-center py-32">
            <h2 className="text-2xl font-black text-[#0a0a0a]">Sản phẩm không tồn tại</h2>
            <p className="text-gray-500 mt-2">Sản phẩm này có thể đã bị xóa hoặc ngừng kinh doanh.</p>
            <Link to="/products" className="inline-block mt-6 px-6 py-3 bg-[#0a0a0a] text-white rounded-full font-bold">Quay lại cửa hàng</Link>
        </div>
    );

    const activePrice = product.discount_price || product.price;
    const discountPercent = product.discount_price ? Math.round(((product.price - product.discount_price) / product.price) * 100) : 0;

    return (
        <div className="bg-[#fcfcfc] min-h-screen py-8 animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumbs */}
                <div className="flex items-center text-sm text-gray-500 mb-8">
                    <Link to="/" className="hover:text-[#0a0a0a] transition-colors">Trang chủ</Link>
                    <ChevronRight size={14} className="mx-2" />
                    <Link to="/products" className="hover:text-[#0a0a0a] transition-colors">Sản phẩm</Link>
                    <ChevronRight size={14} className="mx-2" />
                    <span className="text-[#0a0a0a] font-medium truncate max-w-xs">{product.name}</span>
                </div>

                <div className="bg-white rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden mb-12">
                    <div className="flex flex-col lg:flex-row">
                        {/* Cột trái: Ảnh sản phẩm */}
                        <div className="lg:w-1/2 p-8 md:p-16 pt-12 md:pt-20 flex items-start justify-center bg-gray-50/50">
                            <div className="relative w-full aspect-square">
                                {discountPercent > 0 && (
                                    <div className="absolute top-0 left-0 bg-[#E30019] text-white text-sm font-black px-4 py-2 rounded-xl z-10 tracking-widest shadow-xl shadow-red-500/20">
                                        -{discountPercent}%
                                    </div>
                                )}
                                <img
                                    src={product.main_image || "https://via.placeholder.com/800x800"}
                                    alt={product.name}
                                    className="w-full h-full object-contain mix-blend-multiply drop-shadow-2xl animate-fade-in-up"
                                />
                            </div>
                        </div>

                        {/* Cột phải: Chi tiết sản phẩm */}
                        <div className="lg:w-1/2 p-8 md:p-12 lg:p-16 border-l border-gray-100">
                            <div className="inline-block px-3 py-1 rounded-full bg-gray-100 text-[#0a0a0a] text-xs font-bold uppercase tracking-wider mb-4 border border-gray-200">
                                {product.brand}
                            </div>
                            
                            <h1 className="text-3xl md:text-4xl font-black text-[#0a0a0a] leading-[1.1] mb-6">
                                {product.name}
                            </h1>

                            <div className="flex flex-col mb-8">
                                {product.discount_price ? (
                                    <div className="flex items-baseline flex-wrap gap-4">
                                        <span className="text-4xl md:text-5xl font-black text-[#E30019] tracking-tight">{formatPrice(product.discount_price)}</span>
                                        <span className="text-xl text-gray-400 line-through font-medium">{formatPrice(product.price)}</span>
                                    </div>
                                ) : (
                                    <span className="text-4xl md:text-5xl font-black text-[#E30019] tracking-tight">{formatPrice(product.price)}</span>
                                )}
                                
                                <div className="mt-4 flex items-center gap-3">
                                    <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold flex items-center gap-1.5 border border-green-100">
                                        <Check size={14} strokeWidth={3} /> Còn hàng
                                    </span>
                                    <span className="text-sm text-gray-500 font-medium">
                                        (Kho: <span className="font-bold text-[#0a0a0a]">{product.stock_quantity || 'Sẵn'}</span> sản phẩm)
                                    </span>
                                </div>
                            </div>

                            {/* Cấu hình kỹ thuật */}
                            <div className="mb-10">
                                <h3 className="text-sm font-bold text-[#0a0a0a] uppercase tracking-wider mb-4 flex items-center">
                                    <span className="w-2 h-2 bg-[#0a0a0a] rounded-full mr-3"></span> Thông số chính
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {Object.entries(product.specifications || {}).map(([key, value]) => (
                                        <div key={key} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{key}</p>
                                            <p className="text-sm font-bold text-[#0a0a0a] truncate" title={value}>{value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Nút Mua Hàng */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                <button
                                    onClick={handleBuyNow}
                                    className="flex-1 group relative bg-[#0a0a0a] hover:bg-gray-900 text-white py-5 rounded-2xl transition-all shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)] overflow-hidden"
                                >
                                    <div className="relative z-10 flex flex-col items-center justify-center">
                                        <span className="text-lg font-black tracking-widest flex items-center gap-2">
                                            <Zap size={20} className="text-[#E30019]" /> MUA NGAY
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-wide">Giao hàng miễn phí toàn quốc</span>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
                                </button>

                                <button
                                    onClick={() => addToCart(product)}
                                    className="sm:w-20 h-[76px] flex items-center justify-center bg-white text-[#0a0a0a] rounded-2xl hover:bg-red-50 hover:text-[#E30019] transition-colors border border-gray-200 hover:border-red-200"
                                    title="Thêm vào giỏ"
                                >
                                    <ShoppingCart size={24} strokeWidth={2.5} />
                                </button>
                            </div>

                            {/* Cam kết bán hàng */}
                            <div className="flex items-center gap-6 pt-6 border-t border-gray-100">
                                <div className="flex items-center gap-2 text-xs font-bold text-[#0a0a0a]">
                                    <Check size={16} className="text-green-500" /> Chính hãng 100%
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-[#0a0a0a]">
                                    <Shield size={16} className="text-blue-500" /> Bảo hành 24T
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-[#0a0a0a]">
                                    <CreditCard size={16} className="text-purple-500" /> Trả góp 0%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Review Section */}
                <div className="bg-white rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-gray-100 p-6 md:p-10 max-w-4xl mx-auto">
                    <h3 className="text-2xl font-black text-[#0a0a0a] mb-6 flex items-center">
                        Đánh Giá & Nhận Xét
                    </h3>
                    <ReviewSection productId={product.product_id} />
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-16">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-[#0a0a0a]">Có Thể Bạn Sẽ Thích</h2>
                            <Link to="/products" className="text-sm font-bold text-gray-500 hover:text-[#E30019] flex items-center gap-1">
                                Xem thêm <ChevronRight size={16} />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map(p => {
                                const activeP = p.discount_price || p.price;
                                const discountP = p.discount_price ? Math.round(((p.price - p.discount_price) / p.price) * 100) : 0;
                                return (
                                    <Link key={p.product_id || p.id} to={`/product/${p.slug}`} className="group flex flex-col bg-white rounded-3xl p-5 transition-all duration-300 hover:shadow-[0_15px_30px_rgba(0,0,0,0.06)] border border-gray-100">
                                        <div className="relative aspect-square mb-6 bg-gray-50 rounded-2xl p-4 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                                            {discountP > 0 && <div className="absolute top-2 left-2 bg-[#E30019] text-white text-[10px] font-black px-2 py-1 rounded-full z-10 shadow-lg">-{discountP}%</div>}
                                            <img src={p.main_image} alt={p.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <h3 className="text-sm font-bold text-[#0a0a0a] group-hover:text-[#E30019] line-clamp-2 mb-3 leading-relaxed">{p.name}</h3>
                                        <div className="mt-auto">
                                            <p className="text-[#E30019] font-black text-lg tracking-tight">{formatPrice(activeP)}</p>
                                            {p.discount_price && <p className="text-gray-400 text-xs font-semibold line-through mt-0.5">{formatPrice(p.price)}</p>}
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetail;