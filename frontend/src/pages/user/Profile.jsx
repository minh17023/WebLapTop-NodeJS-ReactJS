import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { userService } from '../../services/user.service';
import { toast } from 'react-toastify';
import { User, Phone, MapPin, Mail, Save, Edit3, X, Shield, Camera } from 'lucide-react';

const Profile = () => {
    const { user, setUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const userId = user?.id || user?.user_id;

    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        address: ''
    });
    const [userEmail, setUserEmail] = useState('');

    const fetchUserProfile = async () => {
        if (!userId) return;
        try {
            setFetching(true);
            const res = await userService.getProfile(userId);
            if (res.success && res.data) {
                setFormData({
                    full_name: res.data.full_name || res.data.fullName || '',
                    phone: res.data.phone || '',
                    address: res.data.address || ''
                });
                setUserEmail(res.data.email || '');
            }
        } catch (error) {
            toast.error("Không thể tải thông tin hồ sơ từ hệ thống");
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, [userId]);

    const handlePhoneChange = (e) => {
        const value = e.target.value;
        const onlyNums = value.replace(/\D/g, '');
        if (onlyNums.length <= 10) {
            setFormData({ ...formData, phone: onlyNums });
        }
    };

    const handleCancel = () => {
        fetchUserProfile();
        setIsEditing(false);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!userId) {
            toast.error("Không tìm thấy mã định danh tài khoản!");
            return;
        }

        const phoneRegex = /^0[0-9]{9}$/;
        if (formData.phone && !phoneRegex.test(formData.phone)) {
            toast.error("Số điện thoại phải bắt đầu bằng số 0 và có đúng 10 chữ số!");
            return;
        }

        setLoading(true);
        try {
            const res = await userService.updateProfile(userId, formData);
            if (res.success) {
                toast.success("Cập nhật thông tin thành công!");

                if (typeof setUser === 'function') {
                    setUser({
                        ...user,
                        ...formData,
                        fullName: formData.full_name,
                        full_name: formData.full_name
                    });
                }
                setIsEditing(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Đã xảy ra lỗi");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fcfcfc]">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-[#0a0a0a] rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="bg-[#fcfcfc] min-h-screen py-12 animate-fade-in">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                    {/* Header Banner */}
                    <div className="h-40 bg-[#0a0a0a] relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] to-gray-900"></div>
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#0071E3]/20 rounded-full blur-[50px]"></div>
                    </div>

                    <div className="p-8 sm:p-12 relative">
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <h1 className="text-3xl font-black text-[#0a0a0a] tracking-tight">{formData.full_name || 'Khách hàng'}</h1>
                                <div className="flex items-center gap-4 mt-2">
                                    <span className="text-gray-500 font-medium">{userEmail}</span>
                                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-600 px-2 py-1 rounded-md">
                                        <Shield size={12} /> Đã xác thực
                                    </span>
                                </div>
                            </div>
                            
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="bg-white border border-gray-200 text-[#0a0a0a] font-bold px-6 py-2.5 rounded-xl hover:border-[#0a0a0a] transition-all text-sm flex items-center gap-2 shadow-sm"
                                >
                                    <Edit3 size={16} /> Chỉnh sửa hồ sơ
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                                    Họ và tên
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User size={16} className={isEditing ? 'text-[#0a0a0a]' : 'text-gray-400'} />
                                    </div>
                                    <input
                                        type="text" required disabled={!isEditing}
                                        className={`w-full pl-10 pr-4 py-3.5 rounded-xl transition-all text-sm font-medium outline-none ${!isEditing ? 'bg-gray-50 border border-transparent text-gray-500 cursor-not-allowed' : 'bg-white border border-gray-200 focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-[#0a0a0a] shadow-sm'}`}
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                                    Số điện thoại
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Phone size={16} className={isEditing ? 'text-[#0a0a0a]' : 'text-gray-400'} />
                                    </div>
                                    <input
                                        type="tel" required disabled={!isEditing}
                                        placeholder="Ví dụ: 0987654321"
                                        className={`w-full pl-10 pr-4 py-3.5 rounded-xl transition-all text-sm font-medium outline-none ${!isEditing ? 'bg-gray-50 border border-transparent text-gray-500 cursor-not-allowed' : 'bg-white border border-gray-200 focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-[#0a0a0a] shadow-sm'}`}
                                        value={formData.phone}
                                        onChange={handlePhoneChange}
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                                    Địa chỉ nhận hàng mặc định
                                </label>
                                <div className="relative">
                                    <div className="absolute top-4 left-0 pl-4 pointer-events-none">
                                        <MapPin size={16} className={isEditing ? 'text-[#0a0a0a]' : 'text-gray-400'} />
                                    </div>
                                    <textarea
                                        rows="3" required disabled={!isEditing}
                                        placeholder="Nhập địa chỉ nhà..."
                                        className={`w-full pl-10 pr-4 py-3.5 rounded-xl transition-all text-sm font-medium outline-none resize-none ${!isEditing ? 'bg-gray-50 border border-transparent text-gray-500 cursor-not-allowed' : 'bg-white border border-gray-200 focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-[#0a0a0a] shadow-sm'}`}
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>

                            {isEditing && (
                                <div className="md:col-span-2 pt-6 flex gap-4 border-t border-gray-100">
                                    <button
                                        type="submit" disabled={loading}
                                        className="bg-[#0a0a0a] text-white font-bold py-3.5 px-8 rounded-xl hover:bg-gray-900 transition-all flex items-center gap-2 shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 text-sm"
                                    >
                                        <Save size={16} /> {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                                    </button>

                                    <button
                                        type="button" onClick={handleCancel}
                                        className="bg-white text-[#0a0a0a] border border-gray-200 font-bold py-3.5 px-8 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 text-sm"
                                    >
                                        <X size={16} /> Hủy Bỏ
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;