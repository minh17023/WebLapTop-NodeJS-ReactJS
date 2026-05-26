import { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';

const ProductFilter = ({ onFilterChange }) => {
    const [filters, setFilters] = useState({ brand: '', price: '' });

    const brands = ['ASUS', 'Acer', 'Dell', 'HP', 'Apple'];
    
    const priceRanges = [
        { id: 'under15', label: 'Dưới 15 triệu' },
        { id: '15-20', label: 'Từ 15 - 20 triệu' },
        { id: '20-25', label: 'Từ 20 - 25 triệu' },
        { id: 'over25', label: 'Trên 25 triệu' },
    ];

    // Gửi dữ liệu lọc lên trang cha mỗi khi filters thay đổi
    useEffect(() => {
        onFilterChange(filters);
    }, [filters]);

    const handleBrandChange = (brand) => {
        setFilters(prev => ({ ...prev, brand: prev.brand === brand ? '' : brand })); // Click lại thì bỏ chọn
    };

    const handlePriceChange = (priceId) => {
        setFilters(prev => ({ ...prev, price: prev.price === priceId ? '' : priceId }));
    };

    const clearFilters = () => {
        setFilters({ brand: '', price: '' });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                    <Filter size={20} className="mr-2 text-blue-600" /> Bộ Lọc
                </h3>
                {(filters.brand || filters.price) && (
                    <button onClick={clearFilters} className="text-xs text-blue-600 hover:underline font-medium">
                        Xóa lọc
                    </button>
                )}
            </div>

            {/* Lọc theo Hãng */}
            <div className="mb-8">
                <h4 className="font-semibold text-gray-700 mb-4">Thương hiệu</h4>
                <div className="space-y-3">
                    {brands.map((brand) => (
                        <label key={brand} className="flex items-center cursor-pointer group">
                            <input 
                                type="checkbox" 
                                checked={filters.brand === brand}
                                onChange={() => handleBrandChange(brand)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                            />
                            <span className="ml-3 text-sm text-gray-600 group-hover:text-blue-600 transition">{brand}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Lọc theo Giá */}
            <div>
                <h4 className="font-semibold text-gray-700 mb-4">Mức giá</h4>
                <div className="space-y-3">
                    {priceRanges.map((range) => (
                        <label key={range.id} className="flex items-center cursor-pointer group">
                            <input 
                                type="radio" 
                                name="price"
                                checked={filters.price === range.id}
                                onChange={() => handlePriceChange(range.id)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 cursor-pointer"
                            />
                            <span className="ml-3 text-sm text-gray-600 group-hover:text-blue-600 transition">{range.label}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductFilter;