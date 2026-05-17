import { useState, useEffect } from 'react';
import { Save, Store, Mail, Phone, MapPin, Globe, ShieldAlert, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';
// Import API service của bạn nếu có
// import { settingService } from '../../services/setting.service';

const ManageSettings = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Cấu trúc dữ liệu cài đặt mặc định
    const [formData, setFormData] = useState({
        store_name: 'HNC LAPTOP',
        logo_url: '',
        contact_email: 'support@hnclaptop.com',
        hotline: '1900 1234',
        address: '123 Đường Công Nghệ, Quận 1, TP.HCM',
        seo_description: 'Hệ thống bán lẻ Laptop uy tín hàng đầu Việt Nam.',
        facebook_url: 'https://facebook.com/',
        maintenance_mode: false
    });

    // Mô phỏng Fetch dữ liệu từ API khi vừa vào trang
    useEffect(() => {
        const fetchSettings = async () => {
            setIsLoading(true);
            try {
                // Thay thế bằng API thật của bạn:
                // const res = await settingService.getSettings();
                // if (res.data) setFormData(res.data);
                
                // Giả lập delay tải dữ liệu
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                toast.error("Không thể tải cấu hình hệ thống!");
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    // Xử lý Upload Logo (Base64)
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.warning("Dung lượng logo quá lớn! Vui lòng chọn ảnh dưới 2MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, logo_url: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Thay thế bằng API lưu dữ liệu của bạn:
            // await settingService.updateSettings(formData);
            
            // Giả lập delay lưu dữ liệu
            await new Promise(resolve => setTimeout(resolve, 800));
            toast.success("Đã lưu cấu hình hệ thống thành công!");
        } catch (error) {
            toast.error("Lỗi khi lưu cấu hình!");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64 text-gray-500 font-medium">Đang tải cấu hình hệ thống...</div>;
    }

    return (
        <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm gap-4">
                <div>
                    <h1 className="text-xl font-black text-gray-800 uppercase tracking-tight">Cấu Hình Hệ Thống</h1>
                    <p className="text-xs text-gray-400 mt-1">Quản lý thông tin chung, liên hệ và trạng thái website.</p>
                </div>
                <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-red-600 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl hover:bg-red-700 transition flex items-center gap-2 shadow-lg shadow-red-200 whitespace-nowrap disabled:bg-gray-400"
                >
                    <Save size={16} /> {isSubmitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Cột trái: Thông tin cơ bản */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Khối 1: Cửa hàng */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h2 className="text-sm font-black text-gray-800 uppercase mb-5 flex items-center gap-2 border-b border-gray-50 pb-3">
                                <Store size={18} className="text-red-500" /> Thông tin cửa hàng
                            </h2>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Tên Website / Cửa hàng</label>
                                    <input type="text" name="store_name" value={formData.store_name} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm font-medium transition" />
                                </div>
                                
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Logo Website</label>
                                    <div className="flex items-center gap-4">
                                        <label className="cursor-pointer flex flex-col items-center justify-center w-24 h-24 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl hover:border-red-500 hover:bg-red-50 transition group overflow-hidden">
                                            {formData.logo_url ? (
                                                <img src={formData.logo_url} alt="Logo" className="w-full h-full object-contain p-2" />
                                            ) : (
                                                <>
                                                    <Upload size={20} className="text-gray-400 group-hover:text-red-500 mb-1" />
                                                    <span className="text-[10px] font-bold text-gray-400 group-hover:text-red-500 uppercase text-center px-1">Tải Logo</span>
                                                </>
                                            )}
                                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                        </label>
                                        <div className="flex-1">
                                            <input type="text" name="logo_url" placeholder="Hoặc dán Link ảnh Logo..." value={formData.logo_url} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm font-medium transition" />
                                            <p className="text-[11px] text-gray-400 mt-2">Định dạng khuyên dùng: PNG nền trong suốt, tỉ lệ 3:1.</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Mô tả ngắn (SEO Description)</label>
                                    <textarea name="seo_description" rows="3" value={formData.seo_description} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm font-medium transition resize-none custom-scrollbar"></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Khối 2: Liên hệ */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h2 className="text-sm font-black text-gray-800 uppercase mb-5 flex items-center gap-2 border-b border-gray-50 pb-3">
                                <Globe size={18} className="text-blue-500" /> Thông tin liên hệ
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2 flex items-center gap-1"><Mail size={12}/> Email hỗ trợ</label>
                                    <input type="email" name="contact_email" value={formData.contact_email} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2 flex items-center gap-1"><Phone size={12}/> Hotline / Zalo</label>
                                    <input type="text" name="hotline" value={formData.hotline} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2 flex items-center gap-1"><MapPin size={12}/> Địa chỉ cửa hàng</label>
                                    <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Link Fanpage Facebook</label>
                                    <input type="url" name="facebook_url" value={formData.facebook_url} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cột phải: Cấu hình nâng cao */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-bl-full -z-0"></div>
                            
                            <h2 className="text-sm font-black text-gray-800 uppercase mb-5 flex items-center gap-2 border-b border-gray-50 pb-3 relative z-10">
                                <ShieldAlert size={18} className="text-yellow-500" /> Trạng thái Website
                            </h2>
                            
                            <div className="space-y-4 relative z-10">
                                <label className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition">
                                    <div className="relative flex items-center pt-1">
                                        <input 
                                            type="checkbox" 
                                            name="maintenance_mode" 
                                            checked={formData.maintenance_mode} 
                                            onChange={handleInputChange}
                                            className="sr-only peer" 
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[6px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">Bật chế độ bảo trì</p>
                                        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                                            Khi bật, khách hàng sẽ thấy trang thông báo bảo trì. Chỉ Admin mới có quyền truy cập hệ thống.
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Thẻ hướng dẫn nhỏ */}
                        <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl">
                            <h3 className="text-xs font-bold text-blue-800 uppercase mb-2">💡 Mẹo cấu hình</h3>
                            <p className="text-[11px] text-blue-600/80 leading-relaxed">
                                Thông tin liên hệ và Logo sẽ được tự động đồng bộ xuống khu vực Footer của trang web khách hàng. Đảm bảo bạn nhập chính xác số điện thoại để khách dễ dàng liên lạc nhé!
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ManageSettings;