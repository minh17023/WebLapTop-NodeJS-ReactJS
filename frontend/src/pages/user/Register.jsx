import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowRight, Loader2, Mail, Lock, User } from 'lucide-react';
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

        if (!formData.email.endsWith('@gmail.com')) {
            return toast.error('Email phải có định dạng @gmail.com!');
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
        <div className="flex min-h-screen bg-white animate-fade-in">
            {/* CỘT TRÁI - BRANDING */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#0a0a0a] text-white flex-col justify-between p-16 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#0071E3]/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3"></div>
                
                <div className="relative z-10">
                    <Link to="/" className="text-4xl font-black tracking-tighter">
                        HNC<span className="text-[#0071E3]">LAPTOP</span>
                    </Link>
                </div>
                
                <div className="relative z-10 max-w-lg space-y-6">
                    <h1 className="text-5xl font-black leading-tight">Bắt Đầu <br/>Hành Trình Mới.</h1>
                    <p className="text-lg text-gray-400 font-light leading-relaxed">
                        Tạo tài khoản ngay hôm nay để nhận các đặc quyền ưu đãi, quản lý đơn hàng dễ dàng và tham gia cộng đồng công nghệ của chúng tôi.
                    </p>
                </div>
                
                <div className="relative z-10 text-sm text-gray-500 font-medium tracking-wide">
                    &copy; 2026 HNC LAPTOP. All rights reserved.
                </div>
            </div>

            {/* CỘT PHẢI - FORM REGISTER */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <Link to="/" className="lg:hidden text-3xl font-black tracking-tighter mb-8 block">
                            HNC<span className="text-[#0071E3]">LAPTOP</span>
                        </Link>
                        <h2 className="text-3xl font-black text-[#0a0a0a] tracking-tight">Đăng Ký</h2>
                        <p className="text-gray-500 mt-2">Điền thông tin bên dưới để tạo tài khoản mới.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Họ và Tên</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="text" name="full_name" required
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a0a0a] focus:bg-white transition-all text-sm font-medium"
                                    placeholder="Tên của bạn"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="email" name="email" required
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a0a0a] focus:bg-white transition-all text-sm font-medium"
                                    placeholder="name@example.com"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mật khẩu</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="password" name="password" required minLength={6}
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a0a0a] focus:bg-white transition-all text-sm font-medium"
                                    placeholder="••••••••"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Xác nhận Mật khẩu</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="password" name="confirm_password" required minLength={6}
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a0a0a] focus:bg-white transition-all text-sm font-medium"
                                    placeholder="••••••••"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full group relative bg-[#0a0a0a] text-white font-bold py-4 rounded-xl hover:bg-gray-900 transition-all shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:-translate-y-1 flex items-center justify-center gap-2 overflow-hidden mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="relative z-10 flex items-center gap-2 tracking-widest uppercase text-sm">
                                {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Tạo Tài Khoản'}
                                {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                            </span>
                        </button>
                    </form>

                    <p className="text-center text-sm font-medium text-gray-500 pt-6 border-t border-gray-100">
                        Đã có tài khoản?{' '}
                        <Link to="/login" className="text-[#0071E3] hover:text-red-700 font-bold hover:underline underline-offset-4 transition-all">
                            Đăng nhập ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;