import { useState } from 'react';
// Bỏ useNavigate vì chúng ta sẽ dùng Hard Redirect
import { authService } from '../../services/auth.service'; 
import { toast } from 'react-toastify';
import { ShieldCheck, Lock, Mail, LogIn } from 'lucide-react';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAdminSubmit = async (e) => {
        e.preventDefault();
        
        if (!email.trim() || !password.trim()) {
            toast.error("Vui lòng nhập đầy đủ tài khoản quản trị!");
            return;
        }

        setLoading(true);
        try {
            // 🌟 CHÚ Ý: Truyền email, password tùy theo cách bạn viết trong authService.js
            // Nếu file auth.service.js của bạn nhận (email, password) thì dùng dòng này:
            const res = await authService.login(email, password); 
            
            // Nếu file auth.service.js nhận data object thì đổi thành: authService.login({ email, password })

            if (res && res.success) {
                // Bóc tách dữ liệu chuẩn xác từ cục response
                const userData = res.data?.user || res.data || res.user;
                const userRole = userData?.role;
                
                if (userRole === 'admin') {
                    const token = res.data?.token || res.token;
                    
                    // 1. Tự tay lưu Token và thông tin User vào LocalStorage
                    if (token) {
                        localStorage.setItem('token', token);
                        localStorage.setItem('user', JSON.stringify(userData));
                    }
                    
                    toast.success("Xác thực quản trị viên thành công!");
                    
                    // 2. HARD REDIRECT: Ép trình duyệt tải lại thẳng vào trang admin
                    // Việc này giúp AuthContext khởi tạo lại từ đầu, đọc Token mới lưu và cấp quyền chuẩn xác 100%
                    setTimeout(() => {
                        window.location.href = '/admin';
                    }, 500); // Trễ 0.5s để hiện xong thông báo toast màu xanh
                    
                } else {
                    toast.error("Tài khoản của bạn không có quyền truy cập vùng Quản trị!");
                }
            }
        } catch (error) {
            console.error("Lỗi đăng nhập admin:", error);
            toast.error(error.response?.data?.message || "Sai tài khoản hoặc mật khẩu quản trị!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-screen flex items-center justify-center bg-gray-900 px-4">
            <div className="max-w-md w-full bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700 space-y-6 animate-fadeIn">
                <div className="text-center space-y-2">
                    <div className="inline-flex p-3 bg-blue-500/10 rounded-2xl text-blue-500 mb-2 shadow-inner">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="text-xl font-black text-white tracking-wider uppercase">HNC LAPTOP - CONTROL PANEL</h1>
                    <p className="text-xs text-slate-400 font-medium">Vui lòng xác thực tài khoản tối cao để tiếp tục</p>
                </div>

                <form onSubmit={handleAdminSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Mail size={12} /> Email Quản Trị
                        </label>
                        <input 
                            type="email" required
                            placeholder="admin@hnclaptop.com"
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-white transition placeholder-slate-600"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Lock size={12} /> Mật Mã Bảo Mật
                        </label>
                        <input 
                            type="password" required
                            placeholder="••••••••"
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-white transition placeholder-slate-600"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit" disabled={loading}
                            className="w-full bg-blue-600 hover:bg-red-700 text-white font-black py-3.5 px-6 rounded-xl transition uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
                        >
                            <LogIn size={16} /> {loading ? 'Đang xác minh...' : 'Đăng nhập hệ thống'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;