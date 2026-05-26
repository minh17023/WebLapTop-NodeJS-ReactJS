import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, ChevronRight, Globe, MessageCircle, Camera, Video } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gray-50 text-gray-600 pt-16 pb-8 border-t border-gray-200 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <Link to="/" className="inline-block text-3xl font-black tracking-tighter group">
                            <span className="text-[#0a0a0a] group-hover:text-gray-700 transition-colors">HNC</span>
                            <span className="text-[#0071E3]">LAPTOP</span>
                        </Link>
                        <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                            Hệ thống bán lẻ laptop cao cấp. Chúng tôi mang đến trải nghiệm công nghệ đỉnh cao cùng dịch vụ chuyên nghiệp, tận tâm.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center hover:bg-[#0071E3] hover:text-white transition-all duration-300">
                                <Globe size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center hover:bg-[#0071E3] hover:text-white transition-all duration-300">
                                <MessageCircle size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center hover:bg-[#0071E3] hover:text-white transition-all duration-300">
                                <Camera size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center hover:bg-[#0071E3] hover:text-white transition-all duration-300">
                                <Video size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Policy Column */}
                    <div>
                        <h4 className="text-[#0a0a0a] font-bold mb-6 uppercase tracking-widest text-xs">Chính Sách</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link to="#" className="group flex items-center hover:text-[#0071E3] transition-colors"><ChevronRight size={14} className="mr-2 text-gray-400 group-hover:text-[#0071E3] transition-colors" /> Chính sách bảo hành</Link></li>
                            <li><Link to="#" className="group flex items-center hover:text-[#0071E3] transition-colors"><ChevronRight size={14} className="mr-2 text-gray-400 group-hover:text-[#0071E3] transition-colors" /> Chính sách đổi trả</Link></li>
                            <li><Link to="#" className="group flex items-center hover:text-[#0071E3] transition-colors"><ChevronRight size={14} className="mr-2 text-gray-400 group-hover:text-[#0071E3] transition-colors" /> Giao hàng & Lắp đặt</Link></li>
                            <li><Link to="#" className="group flex items-center hover:text-[#0071E3] transition-colors"><ChevronRight size={14} className="mr-2 text-gray-400 group-hover:text-[#0071E3] transition-colors" /> Bảo mật thông tin</Link></li>
                        </ul>
                    </div>

                    {/* Category Column */}
                    <div>
                        <h4 className="text-[#0a0a0a] font-bold mb-6 uppercase tracking-widest text-xs">Danh Mục</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link to="/categories/laptop-gaming" className="group flex items-center hover:text-[#0071E3] transition-colors"><ChevronRight size={14} className="mr-2 text-gray-400 group-hover:text-[#0071E3] transition-colors" /> Laptop Gaming</Link></li>
                            <li><Link to="/categories/laptop-van-phong" className="group flex items-center hover:text-[#0071E3] transition-colors"><ChevronRight size={14} className="mr-2 text-gray-400 group-hover:text-[#0071E3] transition-colors" /> Laptop Văn Phòng</Link></li>
                            <li><Link to="/categories/macbook" className="group flex items-center hover:text-[#0071E3] transition-colors"><ChevronRight size={14} className="mr-2 text-gray-400 group-hover:text-[#0071E3] transition-colors" /> Apple (MacBook)</Link></li>
                            <li><Link to="/products" className="group flex items-center hover:text-[#0071E3] transition-colors"><ChevronRight size={14} className="mr-2 text-gray-400 group-hover:text-[#0071E3] transition-colors" /> Tất Cả Sản Phẩm</Link></li>
                        </ul>
                    </div>

                    {/* Contact Column */}
                    <div>
                        <h4 className="text-[#0a0a0a] font-bold mb-6 uppercase tracking-widest text-xs">Liên Hệ</h4>
                        <ul className="space-y-4 text-sm text-gray-600">
                            <li className="flex items-start">
                                <MapPin size={18} className="mr-3 text-gray-400 flex-shrink-0 mt-0.5" />
                                <span>54 Triều Khúc, Thanh Xuân, Hà Nội</span>
                            </li>
                            <li className="flex items-center">
                                <Phone size={18} className="mr-3 text-gray-400 flex-shrink-0" />
                                <span className="font-semibold text-[#0a0a0a]">1900 xxxx</span>
                            </li>
                            <li className="flex items-center">
                                <Mail size={18} className="mr-3 text-gray-400 flex-shrink-0" />
                                <span>cskh@hnc.vn</span>
                            </li>
                        </ul>
                    </div>
                </div>
                
                {/* Bottom Footer */}
                <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-gray-500 font-medium tracking-wide">
                        &copy; Hà Nội Computer Laptop.
                    </p>
                    <div className="flex space-x-4">
                        <img src="https://www.apple.com/vn/home/globalfooter/logo-local-compliance.png" alt="công thương" className="w-32 h-auto" />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;