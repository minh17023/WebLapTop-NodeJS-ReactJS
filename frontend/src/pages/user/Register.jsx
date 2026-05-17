import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../../services/auth.service';

const Register = () => {
    const [formData, setFormData] = useState({ full_name: '', email: '', password: '', confirm_password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirm_password) {
            return toast.error('Mật khẩu xác nhận không khớp!');
        }

        setIsLoading(true);
        try {
            const res = await authService.register(formData.full_name, formData.email, formData.password);
            if (res.success) {
                toast.success('Đăng ký thành công! Hãy đăng nhập.');
                navigate('/login');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-red-600">Tạo Tài Khoản</h2>
                    <p className="text-gray-500 mt-2">Trải nghiệm mua sắm Laptop tốt nhất</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">Họ và Tên</label>
                        <input
                            type="text" name="full_name" required
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">Email</label>
                        <input
                            type="email" name="email" required
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">Mật khẩu</label>
                        <input
                            type="password" name="password" required minLength={6}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">Xác nhận Mật khẩu</label>
                        <input
                            type="password" name="confirm_password" required minLength={6}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            onChange={handleChange}
                        />
                    </div>
                    <button
                        type="submit" disabled={isLoading}
                        className="w-full bg-red-600 text-white font-bold py-3 mt-4 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                    >
                        {isLoading ? 'Đang tạo...' : 'Đăng Ký'}
                    </button>
                </form>
                <p className="text-center text-sm mt-6 text-gray-600">
                    Đã có tài khoản? <Link to="/login" className="text-red-600 hover:text-red-800 font-semibold">Đăng nhập ngay</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;