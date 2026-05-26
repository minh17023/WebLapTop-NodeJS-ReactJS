import { NavLink, Link } from 'react-router-dom';
import { 
    LayoutDashboard, ShoppingBag, Layers, ClipboardList, 
    Users, FileText, MessageSquare, Settings, ArrowLeft, ShieldAlert 
} from 'lucide-react';

const AdminSidebar = () => {
    const navLinkStyle = ({ isActive }) => 
        `flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
            isActive 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
        }`;

    return (
        <aside className="w-64 bg-white border-r border-gray-100 h-screen sticky top-0 flex flex-col justify-between p-4 flex-shrink-0 z-50">
            <div className="overflow-y-auto pr-1 space-y-6">
                {/* Logo phân hệ Admin */}
                <div className="px-4 py-4 border-b border-gray-50 flex items-center gap-2">
                    <ShieldAlert className="text-blue-600 animate-pulse" size={22} />
                    <span className="text-lg font-black text-gray-800 tracking-tight">HNC<span className="text-blue-600">ADMIN</span></span>
                </div>

                {/* HỆ THỐNG NHIỀU DANH MỤC QUẢN LÝ */}
                <nav className="space-y-1">
                    <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Bảng điều khiển</p>
                    <NavLink to="/admin" end className={navLinkStyle}>
                        <LayoutDashboard size={16} /> Tổng quan
                    </NavLink>
                    
                    <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest pt-4 mb-2">Cửa hàng</p>
                    <NavLink to="/admin/products" className={navLinkStyle}>
                        <ShoppingBag size={16} /> Sản phẩm Laptop
                    </NavLink>
                    <NavLink to="/admin/categories" className={navLinkStyle}>
                        <Layers size={16} /> Danh mục máy
                    </NavLink>
                    <NavLink to="/admin/orders" className={navLinkStyle}>
                        <ClipboardList size={16} /> Đơn đặt hàng
                    </NavLink>

                    <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest pt-4 mb-2">Nội dung & Thành viên</p>
                    <NavLink to="/admin/users" className={navLinkStyle}>
                        <Users size={16} /> Tài khoản khách hàng
                    </NavLink>
                    <NavLink to="/admin/posts" className={navLinkStyle}>
                        <FileText size={16} /> Bài viết tin tức
                    </NavLink>
                    <NavLink to="/admin/reviews" className={navLinkStyle}>
                        <MessageSquare size={16} /> Đánh giá bình luận
                    </NavLink>

                    {/* <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest pt-4 mb-2">Hệ thống</p>
                    <NavLink to="/admin/settings" className={navLinkStyle}>
                        <Settings size={16} /> Cấu hình Web
                    </NavLink> */}
                </nav>
            </div>
        </aside>
    );
};

export default AdminSidebar;