import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LogOut, User, Bell } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminHeader = () => {
    const { user, setUser } = useContext(AuthContext) || {};
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        if (typeof setUser === 'function') {
            setUser(null);
        }
        
        toast.success("Đã đăng xuất khỏi tài khoản Quản trị!");
        
        navigate('/admin/login');
    };

    return (
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40 flex-shrink-0">
            {/* Lời chào góc trái */}
            <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Hệ thống quản trị</p>
                <h2 className="text-sm font-bold text-gray-700">Xin chào, <span className="text-blue-600">{user?.full_name || user?.fullName || 'Quản trị viên'}</span> </h2>
            </div>

            {/* Các nút thao tác góc phải */}
            <div className="flex items-center gap-4">
                {/* Nút thông báo
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition relative">
                    <Bell size={18} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full"></span>
                </button> */}

                <div className="h-6 w-px bg-gray-100"></div>

                {/* Khối thông tin Admin & Nút Đăng xuất */}
                <div className="flex items-center gap-3">
                    <div className="bg-blue-50 text-blue-600 p-2 rounded-xl">
                        <User size={16} />
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 px-3 py-2 rounded-xl transition border border-gray-100"
                    >
                        <LogOut size={14} /> Đăng xuất
                    </button>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;