import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../../services/auth.service';
import { AuthContext } from '../../context/user/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { loginContext } = useContext(AuthContext); // Gọi hàm lưu trạng thái

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await authService.login(formData.email, formData.password);
            if (res.success) {
                // Gọi hàm lưu user vào hệ thống
                loginContext(res.user, res.token);
                toast.success('Đăng nhập thành công!');

                // Phân quyền: Admin vào dashboard, Khách vào trang chủ
                if (res.user.role === 'admin') navigate('/admin');
                else navigate('/');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi kết nối server');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-red-600">HNC Login</h2>
                    <p className="text-gray-500 mt-2">Chào mừng bạn quay trở lại</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">Email</label>
                        <input
                            type="email" name="email" required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                            placeholder="Nhập email của bạn"
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">Mật khẩu</label>
                        <input
                            type="password" name="password" required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                            placeholder="••••••••"
                            onChange={handleChange}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition duration-200 disabled:opacity-50"
                    >
                        {isLoading ? 'Đang xử lý...' : 'Đăng Nhập'}
                    </button>
                </form>
                <p className="text-center text-sm mt-6 text-gray-600">
                    Chưa có tài khoản? <Link to="/register" className="text-red-600 hover:text-red-800 font-semibold">Đăng ký ngay</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;