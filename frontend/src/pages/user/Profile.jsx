import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/user/AuthContext';
import { userService } from '../../services/user.service';
import { toast } from 'react-toastify';
import { User, Phone, MapPin, Mail, Save, Edit3, X } from 'lucide-react';

const Profile = () => {
    const { user, setUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const userId = user?.id || user?.user_id;

    // 🌟 ĐÃ ĐỔI THÀNH 'address' ĐỂ KHỚP VỚI MODEL BACKEND CỦA BẠN
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
                    address: res.data.address || '' // 🌟 Lấy đúng trường address từ API trả về
                });
                setUserEmail(res.data.email || '');
            }
        } catch (error) {
            console.error("Lỗi tải thông tin chi tiết user:", error);
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
            toast.error("Số điện thoại phải có đúng 10 số và bắt đầu bằng số 0!");
            return;
        }

        setLoading(true);
        try {
            // 🌟 Gửi formData chứa { full_name, phone, address } lên Backend
            const res = await userService.updateProfile(userId, formData);
            if (res.success) {
                toast.success("Cập nhật thông tin cá nhân thành công!");

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
            toast.error(error.response?.data?.message || "Đã xảy ra lỗi khi cập nhật hồ sơ");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="text-center py-24 text-gray-500 font-medium">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mb-4"></div>
                <p>Đang đồng bộ dữ liệu tài khoản...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-extrabold text-gray-800 mb-8 border-l-4 border-red-600 pl-4">Hồ Sơ Cá Nhân</h1>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-red-600 p-8 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-4 rounded-full">
                                <User size={40} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{formData.full_name || 'Khách hàng'}</h2>
                                <p className="opacity-80 text-sm">{userEmail}</p>
                            </div>
                        </div>

                        {!isEditing && (
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="bg-white text-red-600 font-bold px-5 py-2.5 rounded-xl hover:bg-red-50 transition text-sm flex items-center gap-2 shadow-md"
                            >
                                <Edit3 size={16} /> Chỉnh sửa hồ sơ
                            </button>
                        )}
                    </div>
                </div>

                <form onSubmit={handleUpdate} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center tracking-wider">
                            <User size={14} className="mr-1" /> Họ và tên
                        </label>
                        <input
                            type="text" required
                            disabled={!isEditing}
                            className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition text-sm font-medium ${!isEditing ? 'bg-gray-50 text-gray-700 border-dashed cursor-not-allowed' : 'bg-white'}`}
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center tracking-wider">
                            <Mail size={14} className="mr-1" /> Địa chỉ Email (Cố định)
                        </label>
                        <input
                            type="email" disabled
                            className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-400 text-sm cursor-not-allowed font-medium"
                            value={userEmail}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center tracking-wider">
                            <Phone size={14} className="mr-1" /> Số điện thoại (10 số)
                        </label>
                        <input
                            type="tel" required
                            disabled={!isEditing}
                            placeholder={isEditing ? "Ví dụ: 0338571103" : "Chưa cập nhật số điện thoại"}
                            className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm font-medium ${!isEditing ? 'bg-gray-50 text-gray-700 border-dashed cursor-not-allowed' : 'bg-white'}`}
                            value={formData.phone}
                            onChange={handlePhoneChange}
                        />
                    </div>

                    {/* 🌟 ĐÃ ĐỔI TÊN BIẾN HIỂN THỊ THÀNH formData.address */}
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center tracking-wider">
                            <MapPin size={14} className="mr-1" /> Địa chỉ nhận hàng mặc định
                        </label>
                        <textarea
                            rows="3" required
                            disabled={!isEditing}
                            placeholder={isEditing ? "Nhập chi tiết địa chỉ nhà..." : "Chưa cập nhật địa chỉ nhà"}
                            className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none resize-none text-sm font-medium ${!isEditing ? 'bg-gray-50 text-gray-700 border-dashed cursor-not-allowed' : 'bg-white'}`}
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        ></textarea>
                    </div>

                    {isEditing && (
                        <div className="md:col-span-2 pt-4 flex gap-4">
                            <button
                                type="submit" disabled={loading}
                                className="bg-red-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-red-700 transition flex items-center gap-2 shadow-lg shadow-red-200 uppercase tracking-wider text-xs"
                            >
                                <Save size={16} /> {loading ? 'Đang lưu...' : 'Lưu mọi thay đổi'}
                            </button>

                            <button
                                type="button" onClick={handleCancel}
                                className="bg-white text-gray-600 border border-gray-300 font-bold py-3 px-6 rounded-xl hover:bg-gray-50 transition flex items-center gap-2 uppercase tracking-wider text-xs"
                            >
                                <X size={16} /> Hủy bỏ
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Profile;