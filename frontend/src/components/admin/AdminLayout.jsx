import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const AdminLayout = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 text-gray-500 font-medium text-sm">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mb-2"></div>
                <span>Đang kiểm tra quyền truy cập...</span>
            </div>
        );
    }

    if (!user || user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="flex bg-gray-50/50 min-h-screen w-screen overflow-x-hidden">
            {/* 1. Thanh Sidebar bên trái cố định */}
            <AdminSidebar />

            {/* Khối nội dung bên phải */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* 2. Thanh Header trên cùng cố định */}
                <AdminHeader />

                {/* 3. Vùng Content nội dung thay đổi cuộn độc lập */}
                <main className="flex-1 overflow-y-auto p-8 lg:p-10 bg-gray-50/60">
                    <div className="max-w-7xl mx-auto animate-fadeIn">
                        <Outlet /> {/* Các trang Dashboard, Products... sẽ render tại đây */}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;