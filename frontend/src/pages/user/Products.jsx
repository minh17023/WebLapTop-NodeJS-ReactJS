import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/product.service';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'react-toastify';
import ProductFilter from '../../components/user/ProductFilter';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await productService.getAll();
                if (res.success) {
                    setProducts(res.data);
                    setFilteredProducts(res.data);
                }
            } catch (error) {
                toast.error('Lỗi khi tải danh sách sản phẩm');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Logic xử lý khi người dùng chọn bộ lọc
    const handleFilterChange = (filters) => {
        let result = [...products];

        // Lọc theo thương hiệu
        if (filters.brand) {
            result = result.filter(p => p.brand === filters.brand);
        }

        // Lọc theo giá
        if (filters.price) {
            result = result.filter(p => {
                const price = p.discount_price || p.price; // Ưu tiên giá đã giảm
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

    if (loading) return <div className="text-center mt-20 text-xl text-gray-600">Đang tải sản phẩm...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 border-l-4 border-red-600 pl-4">Tất Cả Laptop</h1>

            <div className="flex flex-col md:flex-row gap-8">
                {/* CỘT TRÁI: BỘ LỌC (Chiếm 1/4) */}
                <div className="w-full md:w-1/4">
                    <ProductFilter onFilterChange={handleFilterChange} />
                </div>

                {/* CỘT PHẢI: DANH SÁCH SẢN PHẨM (Chiếm 3/4) */}
                <div className="w-full md:w-3/4">
                    {filteredProducts.length > 0 ? (
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
                                            <p>RAM: {product.specifications?.ram || 'Đang cập nhật'}</p>
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
                                            <button className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white p-2 rounded-full transition">
                                                <ShoppingCart size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
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

export default Products;