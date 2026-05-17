import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-300 pt-12 pb-8 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Cột 1 */}
                <div>
                    <h3 className="text-2xl font-bold text-white mb-4">HNC<span className="text-red-500">LAPTOP</span></h3>
                    <p className="text-sm text-gray-400 leading-relaxed mb-4">
                        Hệ thống bán lẻ laptop uy tín hàng đầu. Cam kết sản phẩm chính hãng, giá tốt nhất thị trường cùng dịch vụ bảo hành tận tâm.
                    </p>
                </div>

                {/* Cột 2 */}
                <div>
                    <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Chính Sách</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="#" className="hover:text-red-400 transition">Chính sách bảo hành</Link></li>
                        <li><Link to="#" className="hover:text-red-400 transition">Chính sách đổi trả</Link></li>
                        <li><Link to="#" className="hover:text-red-400 transition">Giao hàng & Lắp đặt</Link></li>
                        <li><Link to="#" className="hover:text-red-400 transition">Bảo mật thông tin</Link></li>
                    </ul>
                </div>

                {/* Cột 3 */}
                <div>
                    <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Danh mục</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="#" className="hover:text-red-400 transition">Laptop Gaming</Link></li>
                        <li><Link to="#" className="hover:text-red-400 transition">Laptop Sinh Viên</Link></li>
                        <li><Link to="#" className="hover:text-red-400 transition">Laptop Doanh Nhân</Link></li>
                        <li><Link to="#" className="hover:text-red-400 transition">Phụ kiện Laptop</Link></li>
                    </ul>
                </div>

                {/* Cột 4 */}
                <div>
                    <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Liên hệ</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li>📍 54 Triều Khúc, Thanh Xuân, Hà Nội</li>
                        <li>📞 Hotline: 1900 xxxx</li>
                        <li>✉️ Email: cskh@hnc.vn</li>
                    </ul>
                </div>
            </div>
            
            <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
                <p>&copy; 2026 Đồ án tốt nghiệp - Lã Thái Minh. Khoa CNTT - Đại học Công nghệ GTVT.</p>
            </div>
        </footer>
    );
};

export default Footer;