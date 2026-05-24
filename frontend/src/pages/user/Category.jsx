import { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService } from '../../services/product.service';
import { categoryService } from '../../services/category.service';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'react-toastify';
import ProductFilter from '../../components/user/ProductFilter';
import { CartContext } from '../../context/user/CartContext'; // Import CartContext

const Category = () => {
    const { slug } = useParams();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categoryInfo, setCategoryInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 12;

    // Lấy hàm addToCart từ CartContext
    const { addToCart } = useContext(CartContext);

    // Khi thay đổi danh mục (slug) thì đưa số trang về lại 1 và tải danh mục mới
    useEffect(() => {
        setCurrentPage(1);
        const fetchCategory = async () => {
            try {
                const catRes = await categoryService.getBySlug(slug);
                if (catRes.success) setCategoryInfo(catRes.data);
            } catch (error) {
                toast.error('Lỗi khi tải danh mục');
            }
        };
        fetchCategory();
    }, [slug]);

    // Tải danh sách sản phẩm khi thay đổi trang hoặc thương hiệu
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const prodRes = await productService.getByCategory(slug, currentPage, limit);
                if (prodRes.success) {
                    setProducts(prodRes.data);
                    setFilteredProducts(prodRes.data);
                    if (prodRes.pagination) {
                        setTotalPages(prodRes.pagination.totalPages);
                    }
                }
            } catch (error) {
                toast.error('Lỗi khi tải sản phẩm');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [slug, currentPage]);

    const handleFilterChange = (filters) => {
        let result = [...products];
        if (filters.brand) result = result.filter(p => p.brand === filters.brand);
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

    if (loading) return <div className="text-center mt-20 text-xl text-gray-600">Đang tải danh mục...</div>;
    if (!categoryInfo) return <div className="text-center mt-20 text-2xl font-bold text-red-500">Danh mục không tồn tại</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="mb-10 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h1 className="text-3xl font-extrabold text-gray-800 mb-2 border-l-4 border-red-600 pl-4">{categoryInfo.name}</h1>
                <p className="text-gray-500 mt-2 pl-5">{categoryInfo.description}</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* CỘT TRÁI: BỘ LỌC */}
                <div className="w-full md:w-1/4">
                    <ProductFilter onFilterChange={handleFilterChange} />
                </div>

                {/* CỘT PHẢI: SẢN PHẨM */}
                <div className="w-full md:w-3/4">
                    {filteredProducts.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProducts.map((product) => (
                                    <div key={product.product_id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition flex flex-col">
                                        <Link to={`/product/${product.slug}`}>
                                            <img src={product.main_image || "https://via.placeholder.com/400x300"} alt={product.name} className="w-full h-48 object-cover p-4 hover:scale-105 transition duration-300" />
                                        </Link>
                                        <div className="p-4 flex flex-col flex-grow">
                                            <Link to={`/product/${product.slug}`}>
                                                <h3 className="font-bold text-gray-800 hover:text-red-600 line-clamp-2 h-12">{product.name}</h3>
                                            </Link>
                                            <div className="text-xs text-gray-500 mt-2 space-y-1 bg-gray-50 p-2 rounded">
                                                <p>CPU: {product.specifications?.cpu || 'Đang cập nhật'}</p>
                                            </div>
                                            <div className="mt-auto pt-4 flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    {product.discount_price ? (
                                                        <>
                                                            <span className="font-extrabold text-red-600 text-lg">{formatPrice(product.discount_price)}</span>
                                                            <span className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</span>
                                                        </>
                                                    ) : (
                                                        <span className="font-extrabold text-red-600 text-lg">{formatPrice(product.price)}</span>
                                                    )}
                                                </div>

                                                {/* Nút thêm vào giỏ hàng THẬT ĐÃ HOẠT ĐỘNG */}
                                                <button
                                                    onClick={() => addToCart(product)}
                                                    className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white p-2 rounded-full transition"
                                                >
                                                    <ShoppingCart size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* THANH PHÂN TRANG */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-4 mt-12 bg-white p-4 rounded-xl border border-gray-100 shadow-sm w-fit mx-auto">
                                    <button 
                                        disabled={currentPage === 1}
                                        onClick={() => {
                                            setCurrentPage(prev => prev - 1);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-red-600 hover:text-white border border-gray-200 rounded-lg transition disabled:opacity-40 disabled:hover:bg-gray-50 disabled:hover:text-gray-700 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        Trước
                                    </button>
                                    <span className="text-sm font-semibold text-gray-600 bg-red-50 px-3 py-1.5 rounded-md border border-red-100">
                                        Trang {currentPage} / {totalPages}
                                    </span>
                                    <button 
                                        disabled={currentPage === totalPages}
                                        onClick={() => {
                                            setCurrentPage(prev => prev + 1);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-red-600 hover:text-white border border-gray-200 rounded-lg transition disabled:opacity-40 disabled:hover:bg-gray-50 disabled:hover:text-gray-700 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        Sau
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
                            <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào phù hợp với bộ lọc.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Category;