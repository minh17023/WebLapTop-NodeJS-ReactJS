import { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productService } from '../../services/product.service';
import { ShoppingCart, Check, Shield, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import ReviewSection from '../../components/user/ReviewSection';
import { CartContext } from '../../context/CartContext'; // Import CartContext

const ProductDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    // Lấy hàm addToCart từ CartContext cho nút thêm vào giỏ lẻ
    const { addToCart } = useContext(CartContext);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await productService.getBySlug(slug);
                if (res.success) setProduct(res.data);
            } catch (error) {
                toast.error('Không tìm thấy sản phẩm');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [slug]);

    // 🌟 ĐÃ SỬA: Xử lý nút MUA NGAY nhảy thẳng sang trang Checkout
    const handleBuyNow = () => {
        if (!product) return;

        // Đóng gói sản phẩm hiện tại thành cấu trúc mảng phẳng chuẩn mà trang Checkout mong đợi
        const directItem = {
            product_id: product.product_id,
            name: product.name,
            price: product.price,
            discount_price: product.discount_price,
            main_image: product.main_image,
            quantity: 1 // Mua ngay thì mặc định số lượng ban đầu là 1
        };
        
        // Bỏ qua trang giỏ hàng, điều hướng thẳng sang trang thanh toán kèm theo dữ liệu máy này
        navigate('/checkout', { state: { selectedItems: [directItem] } });
    };

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    if (loading) return <div className="text-center mt-20 text-xl font-medium text-gray-600">Đang tải dữ liệu...</div>;
    if (!product) return <div className="text-center mt-20 text-2xl font-bold text-red-500">Sản phẩm không tồn tại hoặc đã ngừng kinh doanh</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            {/* Nút quay lại */}
            <Link to="/products" className="inline-flex items-center text-gray-500 hover:text-red-600 font-medium mb-6 transition">
                <ArrowLeft size={20} className="mr-2" /> Tiếp tục mua sắm
            </Link>

            {/* Thông tin chính của sản phẩm */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row gap-10">

                {/* Cột trái: Ảnh sản phẩm */}
                <div className="md:w-2/5">
                    <img
                        src={product.main_image || "https://via.placeholder.com/600x450?text=No+Image"}
                        alt={product.name}
                        className="w-full rounded-lg border border-gray-100 p-4 object-contain h-96 hover:scale-105 transition duration-300"
                    />
                </div>

                {/* Cột phải: Chi tiết sản phẩm */}
                <div className="md:w-3/5">
                    <h1 className="text-3xl font-extrabold text-gray-800 mb-3 leading-tight">{product.name}</h1>
                    <p className="text-sm text-gray-500 mb-6 pb-4 border-b border-gray-100">
                        Thương hiệu: <span className="font-bold text-red-600 uppercase">{product.brand}</span> |
                        Danh mục: <span className="font-bold text-gray-700 ml-1">{product.Category?.name || 'Đang cập nhật'}</span>
                    </p>

                    {/* Box hiển thị giá */}
                    <div className="bg-red-50 p-5 rounded-xl mb-8 border border-red-100 flex items-center justify-between">
                        <div>
                            {product.discount_price ? (
                                <>
                                    <p className="text-sm text-red-400 font-medium mb-1">
                                        Giá ưu đãi (Đã giảm {Math.round(((product.price - product.discount_price) / product.price) * 100)}%)
                                    </p>
                                    <div className="flex items-end gap-3">
                                        <span className="text-4xl font-extrabold text-red-600">{formatPrice(product.discount_price)}</span>
                                        <span className="text-lg text-gray-400 line-through mb-1">{formatPrice(product.price)}</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="text-sm text-red-400 font-medium mb-1">Giá bán</p>
                                    <span className="text-4xl font-extrabold text-red-600">{formatPrice(product.price)}</span>
                                </>
                            )}
                        </div>
                        <div className="bg-white px-3 py-1 rounded-md shadow-sm border border-red-100 text-red-600 font-bold text-sm hidden sm:block">
                            Trả góp 0%
                        </div>
                    </div>

                    {/* Cấu hình kỹ thuật */}
                    <h3 className="font-bold text-lg mb-4 flex items-center">
                        <span className="w-2 h-6 bg-red-600 mr-2 rounded-sm"></span>
                        Thông số kỹ thuật
                    </h3>
                    <ul className="space-y-3 mb-8 bg-gray-50 p-6 rounded-xl border border-gray-100">
                        {Object.entries(product.specifications || {}).map(([key, value]) => (
                            <li key={key} className="flex border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                                <span className="w-1/3 font-medium text-gray-500 capitalize">{key}</span>
                                <span className="w-2/3 font-semibold text-gray-800">{value}</span>
                            </li>
                        ))}
                    </ul>

                    {/* Nút Mua Hàng */}
                    <div className="flex gap-4">
                        {/* Nút MUA NGAY */}
                        <button
                            onClick={handleBuyNow}
                            className="flex-1 bg-red-600 text-white font-bold py-4 rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-200 flex flex-col items-center justify-center border-none outline-none cursor-pointer"
                        >
                            <span className="text-lg font-black tracking-wide">MUA NGAY</span>
                            <span className="text-xs font-normal mt-1 opacity-90">(Thanh toán trực tiếp nhận máy tận nơi)</span>
                        </button>

                        {/* Nút thêm vào giỏ */}
                        <button
                            onClick={() => addToCart(product)}
                            className="w-20 flex items-center justify-center bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 transition border border-gray-200 hover:border-gray-300 group cursor-pointer outline-none"
                            title="Thêm vào giỏ hàng"
                        >
                            <ShoppingCart size={28} className="group-hover:text-red-600 transition" />
                        </button>
                    </div>

                    {/* Cam kết bán hàng */}
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-6">
                        <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                            <div className="bg-green-100 p-2 rounded-full text-green-600">
                                <Check size={18} />
                            </div>
                            Tình trạng: <span className="text-green-600 font-bold ml-1">Còn hàng</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                            <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                <Shield size={18} />
                            </div>
                            Bảo hành chính hãng 24 tháng
                        </div>
                    </div>
                </div>
            </div>

            {/* Module Đánh giá sản phẩm */}
            <ReviewSection productId={product.product_id} />
        </div>
    );
};

export default ProductDetail;