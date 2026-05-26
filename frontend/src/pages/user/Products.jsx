import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/product.service';
import { ShoppingCart, ChevronRight, ChevronLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import ProductFilter from '../../components/user/ProductFilter';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 12;

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const res = await productService.getAll(currentPage, limit);
                if (res.success) {
                    setProducts(res.data);
                    setFilteredProducts(res.data);
                    if (res.pagination) {
                        setTotalPages(res.pagination.totalPages);
                    }
                }
            } catch (error) {
                toast.error('Lỗi khi tải danh sách sản phẩm');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [currentPage]);

    const handleFilterChange = (filters) => {
        let result = [...products];
        if (filters.brand) {
            result = result.filter(p => p.brand === filters.brand);
        }
        if (filters.price) {
            result = result.filter(p => {
                const price = p.discount_price || p.price;
                if (filters.price === 'under15') return price < 15000000;
                if (filters.price === '15-20') return price >= 15000000 && price <= 20000000;
                if (filters.price === '20-25') return price >= 20000000 && price <= 25000000;
                if (filters.price === 'over25') return price > 25000000;
                return true;
            });
        }
        setFilteredProducts(result);
    };

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    return (
        <div className="bg-[#fcfcfc] min-h-screen py-12 animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 pb-6 border-b border-gray-200">
                    <div>
                        <h1 className="text-4xl font-black text-[#0a0a0a] tracking-tight">Tất Cả Sản Phẩm</h1>
                        <p className="text-gray-500 mt-2">Khám phá bộ sưu tập máy tính xách tay cao cấp.</p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-10">
                    {/* CỘT TRÁI: BỘ LỌC */}
                    <div className="w-full lg:w-1/4">
                        <div className="sticky top-28 bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                            <h3 className="font-bold text-[#0a0a0a] mb-6 uppercase tracking-wider text-sm flex items-center">
                                <span className="w-2 h-2 bg-[#E30019] rounded-full mr-2"></span> Bộ Lọc Sản Phẩm
                            </h3>
                            <ProductFilter onFilterChange={handleFilterChange} />
                        </div>
                    </div>

                    {/* CỘT PHẢI: DANH SÁCH SẢN PHẨM */}
                    <div className="w-full lg:w-3/4">
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="w-8 h-8 border-4 border-gray-200 border-t-[#E30019] rounded-full animate-spin"></div>
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredProducts.map((product) => {
                                        const activePrice = product.discount_price || product.price;
                                        const discountPercent = product.discount_price 
                                            ? Math.round(((product.price - product.discount_price) / product.price) * 100) 
                                            : 0;

                                        return (
                                            <div key={product.product_id} className="group flex flex-col bg-white rounded-3xl p-5 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-gray-100 hover:border-gray-200">
                                                <Link to={`/product/${product.slug}`} className="relative aspect-square mb-6 bg-gray-50 rounded-2xl p-4 overflow-hidden flex items-center justify-center group-hover:bg-gray-100/50 transition-colors">
                                                    {discountPercent > 0 && (
                                                        <div className="absolute top-3 left-3 bg-[#E30019] text-white text-[10px] font-black px-2 py-1 rounded-md z-10 tracking-widest shadow-sm">
                                                            -{discountPercent}%
                                                        </div>
                                                    )}
                                                    <img 
                                                        src={product.main_image || "https://via.placeholder.com/400x300"} 
                                                        alt={product.name} 
                                                        className="w-full h-full object-contain mix-blend-multiply transform group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500" 
                                                    />
                                                </Link>
                                                
                                                <div className="flex flex-col flex-grow">
                                                    <Link to={`/product/${product.slug}`}>
                                                        <h3 className="text-sm font-bold text-[#0a0a0a] group-hover:text-[#E30019] transition-colors line-clamp-2 leading-relaxed mb-3">
                                                            {product.name}
                                                        </h3>
                                                    </Link>
                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        <span className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{product.specifications?.cpu || 'CPU'}</span>
                                                        <span className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{product.specifications?.ram || 'RAM'}</span>
                                                    </div>
                                                    
                                                    <div className="mt-auto flex items-end justify-between">
                                                        <div>
                                                            <p className="text-[#E30019] font-black text-lg tracking-tight">
                                                                {formatPrice(activePrice)}
                                                            </p>
                                                            {product.discount_price && (
                                                                <p className="text-gray-400 text-xs font-semibold line-through mt-0.5">
                                                                    {formatPrice(product.price)}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <button className="w-10 h-10 rounded-full bg-gray-50 text-[#0a0a0a] flex items-center justify-center hover:bg-[#E30019] hover:text-white transition-all duration-300 border border-gray-100 hover:border-[#E30019]">
                                                            <ShoppingCart size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* THANH PHÂN TRANG */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center items-center gap-2 mt-16">
                                        <button 
                                            disabled={currentPage === 1}
                                            onClick={() => {
                                                setCurrentPage(prev => prev - 1);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-gray-200 text-gray-500 hover:border-[#0a0a0a] hover:text-[#0a0a0a] transition-colors disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-500"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        
                                        <div className="px-4 py-2 bg-[#0a0a0a] text-white text-sm font-bold rounded-full shadow-lg">
                                            {currentPage} / {totalPages}
                                        </div>

                                        <button 
                                            disabled={currentPage === totalPages}
                                            onClick={() => {
                                                setCurrentPage(prev => prev + 1);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-gray-200 text-gray-500 hover:border-[#0a0a0a] hover:text-[#0a0a0a] transition-colors disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-500"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-32 bg-white rounded-3xl border border-gray-100">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ShoppingCart size={24} className="text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-[#0a0a0a] mb-2">Không tìm thấy sản phẩm</h3>
                                <p className="text-gray-500">Vui lòng thử điều chỉnh lại bộ lọc của bạn.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Products;