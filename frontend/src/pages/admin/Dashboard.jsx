import { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, Users, Package, TrendingUp, Calendar, RefreshCcw } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Import các API của bạn
import { orderService } from '../../services/order.service';
import { userService } from '../../services/user.service';
import { productService } from '../../services/product.service';

const Dashboard = () => {
    const [isLoading, setIsLoading] = useState(true);

    // ================= STATE LƯU DỮ LIỆU GỐC TỪ API =================
    const [rawData, setRawData] = useState({
        orders: [],
        users: [],
        products: []
    });

    // ================= STATE BỘ LỌC NGÀY THÁNG =================
    // Mặc định: Từ 7 ngày trước đến Ngày hôm nay
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 6);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => {
        return new Date().toISOString().split('T')[0];
    });

    // ================= STATE KẾT QUẢ THỐNG KÊ SAU LỌC =================
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalProducts: 0,
        revenueData: [],
        orderStatusData: [],
        recentOrders: []
    });

    // 1. Gọi API lấy dữ liệu thô ban đầu (Chỉ chạy 1 lần khi load trang)
    useEffect(() => {
        const fetchRawData = async () => {
            try {
                const [ordersRes, usersRes, productsRes] = await Promise.all([
                    orderService.getAll(),
                    userService.getAll(),
                    productService.getAll()
                ]);

                setRawData({
                    orders: ordersRes.data || ordersRes || [],
                    users: usersRes.data || usersRes || [],
                    products: productsRes.data || productsRes || []
                });
            } catch (error) {
                console.error("Lỗi đồng bộ dữ liệu Dashboard:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRawData();
    }, []);

    // 2. TỰ ĐỘNG TÍNH TOÁN LẠI THỐNG KÊ KHI DỮ LIỆU GỐC HOẶC BỘ LỌC NGÀY THAY ĐỔI
    useEffect(() => {
        if (rawData.orders.length === 0 && rawData.users.length === 0 && rawData.products.length === 0) return;

        // Chuyển đổi ngày từ chuỗi input sang đối tượng Date để so sánh (Đặt mốc giờ chuẩn)
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        // 🌟 BƯỚC LỌC ĐƠN HÀNG THEO KHOẢNG NGÀY CHỌN
        const filteredOrders = rawData.orders.filter(o => {
            const orderDate = new Date(o.created_at || o.createdAt);
            return orderDate >= start && orderDate <= end;
        });

        // 🌟 TÍNH TOÁN SỐ LIỆU DỰA TRÊN MẢNG ĐÃ LỌC
        const totalRevenue = filteredOrders
            .filter(o => o.status !== 'cancelled')
            .reduce((sum, o) => sum + Number(o.total_amount), 0);
        
        const totalOrders = filteredOrders.length;
        const totalCustomers = rawData.users.filter(u => u.role !== 'admin').length; // Giữ nguyên tổng khách
        const totalProducts = rawData.products.length; // Giữ nguyên tổng sp

        // Thống kê trạng thái đơn hàng theo khoảng ngày
        const statusCount = { pending: 0, processing: 0, shipped: 0, delivered: 0 };
        filteredOrders.forEach(o => {
            if (statusCount[o.status] !== undefined) statusCount[o.status]++;
        });
        
        const orderStatusData = [
            { name: 'Chờ xác nhận', count: statusCount.pending, fill: '#EAB308' },
            { name: 'Đang xử lý', count: statusCount.processing, fill: '#3B82F6' },
            { name: 'Đang giao', count: statusCount.shipped, fill: '#A855F7' },
            { name: 'Đã giao', count: statusCount.delivered, fill: '#22C55E' },
        ];

        // 5 Đơn hàng mới nhất trong khoảng ngày này
        const recentOrders = filteredOrders.slice(0, 5).map(o => ({
            id: o.order_id || o.id,
            customer: o.full_name,
            total: o.total_amount,
            status: o.status,
            date: new Date(o.created_at || o.createdAt).toLocaleString('vi-VN')
        }));

        // Dựng trục X cho biểu đồ doanh thu theo các ngày nằm trong khoảng lọc
        const dateList = [];
        let currentLoopDate = new Date(start);
        while (currentLoopDate <= end) {
            dateList.push(currentLoopDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }));
            currentLoopDate.setDate(currentLoopDate.getDate() + 1);
        }

        const revenueByDate = {};
        dateList.forEach(date => revenueByDate[date] = 0);

        filteredOrders.forEach(o => {
            if (o.status !== 'cancelled') {
                const orderDateStr = new Date(o.created_at || o.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
                if (revenueByDate[orderDateStr] !== undefined) {
                    revenueByDate[orderDateStr] += Number(o.total_amount);
                }
            }
        });

        const revenueData = dateList.map(date => ({
            name: date,
            total: revenueByDate[date]
        }));

        // Cập nhật State thống kê
        setStats({
            totalRevenue,
            totalOrders,
            totalCustomers,
            totalProducts,
            orderStatusData,
            recentOrders,
            revenueData
        });

    }, [rawData, startDate, endDate]);

    // Hàm reset ngày về mặc định (7 ngày qua)
    const handleResetFilter = () => {
        const d = new Date();
        d.setDate(d.getDate() - 6);
        setStartDate(d.toISOString().split('T')[0]);
        setEndDate(new Date().toISOString().split('T')[0]);
    };

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': return <span className="bg-yellow-50 text-yellow-600 border border-yellow-200 px-2 py-1 rounded text-[10px] font-bold uppercase">Chờ xác nhận</span>;
            case 'processing': return <span className="bg-blue-50 text-blue-600 border border-blue-200 px-2 py-1 rounded text-[10px] font-bold uppercase">Đang xử lý</span>;
            case 'shipped': return <span className="bg-purple-50 text-purple-600 border border-purple-200 px-2 py-1 rounded text-[10px] font-bold uppercase">Đang giao</span>;
            case 'delivered': return <span className="bg-green-50 text-green-600 border border-green-200 px-2 py-1 rounded text-[10px] font-bold uppercase">Đã giao</span>;
            case 'cancelled': return <span className="bg-red-50 text-red-600 border border-red-200 px-2 py-1 rounded text-[10px] font-bold uppercase">Đã hủy</span>;
            default: return null;
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64 text-gray-500 font-medium">Đang lấy dữ liệu và tính toán báo cáo...</div>;
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            
            {/* Header + Bộ Lọc Ngày Tháng */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm gap-4">
                <div>
                    <h1 className="text-xl font-black text-gray-800 uppercase tracking-tight">Bảng Điều Khiển</h1>
                    <p className="text-xs text-gray-400 mt-1">Hệ thống báo cáo và phân tích số liệu kinh doanh.</p>
                </div>

                {/* Thanh công cụ lọc ngày nâng cao */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto bg-gray-50 p-2 rounded-xl border border-gray-200/60">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-xs font-bold text-gray-500 uppercase whitespace-nowrap pl-2">Từ</span>
                        <input 
                            type="date" 
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)} 
                            max={endDate}
                            className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium outline-none focus:ring-2 focus:ring-red-500 transition cursor-pointer text-gray-700"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Đến</span>
                        <input 
                            type="date" 
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)} 
                            min={startDate}
                            max={new Date().toISOString().split('T')[0]}
                            className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium outline-none focus:ring-2 focus:ring-red-500 transition cursor-pointer text-gray-700"
                        />
                    </div>
                    <button 
                        onClick={handleResetFilter}
                        className="p-2 bg-white text-gray-500 border border-gray-200 rounded-lg hover:text-red-600 hover:border-red-200 transition shadow-sm w-full sm:w-auto flex items-center justify-center"
                        title="Đặt lại bộ lọc (7 ngày gần nhất)"
                    >
                        <RefreshCcw size={16} />
                    </button>
                </div>
            </div>

            {/* Thống kê nhanh (4 Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-300"><DollarSign size={64} className="text-green-600" /></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shadow-inner"><DollarSign size={24} /></div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Doanh Thu Khoảng Lọc</p>
                            <h3 className="text-2xl font-black text-gray-800">{formatPrice(stats.totalRevenue)}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-300"><ShoppingBag size={64} className="text-blue-600" /></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-inner"><ShoppingBag size={24} /></div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Đơn Hàng Đã Đặt</p>
                            <h3 className="text-2xl font-black text-gray-800">{stats.totalOrders} Đơn</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-300"><Users size={64} className="text-purple-600" /></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shadow-inner"><Users size={24} /></div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tổng Số Khách Hàng</p>
                            <h3 className="text-2xl font-black text-gray-800">{stats.totalCustomers}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-300"><Package size={64} className="text-red-600" /></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shadow-inner"><Package size={24} /></div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tổng Số Sản Phẩm</p>
                            <h3 className="text-2xl font-black text-gray-800">{stats.totalProducts}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Khu vực Biểu đồ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Biểu đồ đường biến động doanh thu */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h2 className="text-sm font-black text-gray-800 uppercase mb-6 flex items-center gap-2">
                        <TrendingUp size={18} className="text-red-500" /> Biến động doanh thu theo ngày
                    </h2>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.revenueData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} dy={10} />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                                    tickFormatter={(value) => value >= 1000000 ? `${value / 1000000}tr` : value}
                                />
                                <Tooltip 
                                    formatter={(value) => formatPrice(value)}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line type="monotone" dataKey="total" stroke="#dc2626" strokeWidth={4} dot={{ r: 4, fill: '#dc2626', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Biểu đồ cột trạng thái đơn */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h2 className="text-sm font-black text-gray-800 uppercase mb-6 flex items-center gap-2">
                        <Package size={18} className="text-blue-500" /> Trạng thái đơn trong kỳ lọc
                    </h2>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.orderStatusData} margin={{ top: 5, right: 0, bottom: 5, left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} allowDecimals={false} />
                                <Tooltip 
                                    cursor={{ fill: '#f9fafb' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                    {stats.orderStatusData.map((entry, index) => (
                                        <cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bảng danh sách đơn hàng lọc được */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50">
                    <h2 className="text-sm font-black text-gray-800 uppercase flex items-center gap-2">
                        <ShoppingBag size={18} className="text-purple-500" /> Đơn hàng phát sinh trong khoảng lọc (Tối đa 5 đơn mới nhất)
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[11px] tracking-wider border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Mã ĐH</th>
                                <th className="px-6 py-4">Khách hàng</th>
                                <th className="px-6 py-4">Tổng tiền</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4 text-right">Thời gian đặt</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {stats.recentOrders.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-8 text-gray-400 font-medium">Không có đơn hàng nào phát sinh trong khoảng thời gian này.</td></tr>
                            ) : (
                                stats.recentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50/50 transition">
                                        <td className="px-6 py-4 font-black text-gray-800">#{order.id}</td>
                                        <td className="px-6 py-4 font-bold text-gray-700">{order.customer}</td>
                                        <td className="px-6 py-4 font-bold text-red-600">{formatPrice(order.total)}</td>
                                        <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                                        <td className="px-6 py-4 text-right text-xs text-gray-400 font-medium">{order.date}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;