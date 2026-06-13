import { ShieldCheck, Monitor, Battery, Cpu, Clock, AlertTriangle } from 'lucide-react';

const WarrantyPolicy = () => {
    return (
        <div className="bg-[#fcfcfc] min-h-screen py-16 animate-fade-in">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="w-16 h-16 bg-[#0a0a0a] text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-black/10">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-[#0a0a0a] tracking-tight mb-4">Chính Sách Bảo Hành</h1>
                    <p className="text-gray-500 text-lg">Cam kết chất lượng và dịch vụ hậu mãi tốt nhất tại HNC LAPTOP</p>
                </div>

                <div className="space-y-12">
                    {/* Section 1 */}
                    <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-100">
                        <h2 className="text-2xl font-black text-[#0a0a0a] mb-6 flex items-center gap-3">
                            <span className="w-10 h-10 bg-blue-50 text-[#0071E3] rounded-xl flex items-center justify-center"><Clock size={20} /></span>
                            Thời Gian Bảo Hành
                        </h2>
                        <ul className="space-y-4 text-gray-600 leading-relaxed">
                            <li className="flex items-start gap-3">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#0071E3] flex-shrink-0"></div>
                                <p><strong>Laptop mới 100%:</strong> Bảo hành chính hãng từ 12 - 24 tháng tùy theo quy định của nhà sản xuất (Dell, HP, Asus, Apple, Lenovo...).</p>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#0071E3] flex-shrink-0"></div>
                                <p><strong>Laptop cũ / Like New:</strong> Bảo hành 6 - 12 tháng phần cứng tại HNC LAPTOP.</p>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#0071E3] flex-shrink-0"></div>
                                <p><strong>Phụ kiện (Chuột, Phím, Sạc):</strong> Bảo hành 3 - 6 tháng.</p>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#0071E3] flex-shrink-0"></div>
                                <p><strong>Đặc quyền:</strong> <span className="font-bold text-[#0a0a0a]">1 ĐỔI 1 TRONG 30 NGÀY</span> đầu tiên nếu phát sinh lỗi phần cứng từ nhà sản xuất.</p>
                            </li>
                        </ul>
                    </div>

                    {/* Section 2 */}
                    <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-100">
                        <h2 className="text-2xl font-black text-[#0a0a0a] mb-6 flex items-center gap-3">
                            <span className="w-10 h-10 bg-blue-50 text-[#0071E3] rounded-xl flex items-center justify-center"><Monitor size={20} /></span>
                            Điều Kiện Tiếp Nhận Bảo Hành
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <h3 className="font-bold text-[#0a0a0a] mb-3 flex items-center gap-2"><CheckCircleIcon /> Được bảo hành</h3>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li>• Sản phẩm còn trong thời hạn bảo hành.</li>
                                    <li>• Tem bảo hành, mã vạch, seri number phải còn nguyên vẹn, không có dấu hiệu cạo sửa, chắp vá.</li>
                                    <li>• Sản phẩm bị lỗi kỹ thuật do nhà sản xuất.</li>
                                </ul>
                            </div>
                            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                                <h3 className="font-bold text-[#0071E3] mb-3 flex items-center gap-2"><AlertTriangle size={16} /> Từ chối bảo hành</h3>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li>• Sản phẩm bị hư hỏng do tác động vật lý (rơi rớt, va đập, nứt vỡ).</li>
                                    <li>• Sản phẩm bị vào nước, hóa chất, hoặc do thiên tai, hỏa hoạn.</li>
                                    <li>• Tự ý tháo lắp, sửa chữa tại các cơ sở không thuộc ủy quyền của HNC LAPTOP.</li>
                                    <li>• Lỗi do virus, phần mềm không bản quyền gây ra.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Section 3 */}
                    <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-100">
                        <h2 className="text-2xl font-black text-[#0a0a0a] mb-6 flex items-center gap-3">
                            <span className="w-10 h-10 bg-blue-50 text-[#0071E3] rounded-xl flex items-center justify-center"><Battery size={20} /></span>
                            Quy Định Bảo Hành Linh Kiện Đặc Biệt
                        </h2>
                        <ul className="space-y-6 text-gray-600">
                            <li>
                                <strong className="text-[#0a0a0a] block mb-1">Màn hình (Màn hình hiển thị)</strong>
                                Bảo hành đối với trường hợp có từ 5 điểm chết (Pixel) trở lên. Không bảo hành các trường hợp nứt vỡ, chảy mực, sọc màn hình do va đập, tì đè.
                            </li>
                            <li>
                                <strong className="text-[#0a0a0a] block mb-1">Pin (Battery)</strong>
                                Bảo hành 6 - 12 tháng tùy hãng. Mức độ chai pin dưới 20% trong 6 tháng đầu không được coi là lỗi. Chỉ bảo hành khi pin chết hoàn toàn hoặc phồng rộp.
                            </li>
                            <li>
                                <strong className="text-[#0a0a0a] block mb-1">Bàn phím & Touchpad</strong>
                                Không bảo hành trường hợp bong tróc phím, mòn phím do quá trình sử dụng hoặc đổ chất lỏng.
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="bg-[#0a0a0a] p-10 rounded-[2rem] text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#0071E3]/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
                        <h2 className="text-2xl font-black text-white mb-4 relative z-10">Cần hỗ trợ về bảo hành?</h2>
                        <p className="text-gray-400 mb-8 relative z-10">Đừng ngần ngại liên hệ với chúng tôi để được giải đáp và hỗ trợ nhanh nhất.</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
                            <div className="bg-white/10 px-6 py-3 rounded-xl border border-white/20 text-white font-bold backdrop-blur-md">
                                Hotline: 1900 xxxx
                            </div>
                            <div className="bg-white/10 px-6 py-3 rounded-xl border border-white/20 text-white font-bold backdrop-blur-md">
                                Email: cskh@hnc.vn
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);

export default WarrantyPolicy;
