const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../models');
const { Op } = require('sequelize'); // Cần import Op để thực hiện các truy vấn phức tạp như Like, Nhỏ hơn/Lớn hơn

const Product = db.Product || db.product || db.products;

class ChatController {
    async handleChat(req, res) {
        try {
            const { message } = req.body;

            if (!message || !message.trim()) {
                return res.status(400).json({ success: false, message: 'Tin nhắn không được để trống!' });
            }

            if (!process.env.GEMINI_API_KEY) {
                return res.status(500).json({ success: false, message: 'Chưa cấu hình GEMINI_API_KEY!' });
            }

            // 1. KHỞI TẠO AI
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

            // 2. ĐỊNH NGHĨA CÔNG CỤ TÌM KIẾM CHO AI (Function Calling)
            const tools = [{
                functionDeclarations: [{
                    name: "searchProducts",
                    description: "Tìm kiếm laptop trong cơ sở dữ liệu dựa trên từ khóa, tên hãng, hoặc mức giá tối đa.",
                    parameters: {
                        type: "OBJECT",
                        properties: {
                            keyword: { type: "STRING", description: "Từ khóa tên máy hoặc nhu cầu (ví dụ: gaming, mỏng nhẹ, macbook, dell xps)." },
                            brand: { type: "STRING", description: "Tên hãng laptop (ví dụ: Apple, Dell, Asus, HP). Bỏ trống nếu không rõ." },
                            maxPrice: { type: "NUMBER", description: "Mức giá tối đa mà khách hàng có thể trả (quy ra VNĐ)." }
                        }
                    }
                }]
            }];

            // 3. THIẾT LẬP KỊCH BẢN TƯ VẤN (System Prompt)
            const systemPrompt = `Bạn là nhân viên tư vấn bán máy tính của "HNC Laptop".
QUY TẮC BẮT BUỘC:
1. LUÔN LUÔN DÙNG CÔNG CỤ searchProducts khi khách hỏi mua máy, hỏi giá, hoặc nhờ tư vấn cấu hình.
2. Trả lời CỰC KỲ NGẮN GỌN, thân thiện và đi thẳng vào vấn đề.
3. TUYỆT ĐỐI KHÔNG dùng định dạng Markdown (như các dấu **, _, #). Chỉ dùng văn bản thuần túy.
4. Chia câu trả lời thành từng ý. BẮT BUỘC XUỐNG DÒNG tạo khoảng trống sau mỗi sản phẩm được liệt kê.
5. Nếu công cụ trả về rỗng (không tìm thấy máy), hãy xin lỗi và báo cửa hàng tạm hết mẫu đó.`;

            const model = genAI.getGenerativeModel({
                model: "gemini-2.5-flash",
                tools: tools,
                systemInstruction: systemPrompt // Đẩy lệnh hệ thống vào đúng chuẩn API mới
            });

            // 4. BẮT ĐẦU CUỘC TRÒ CHUYỆN (Gửi câu hỏi của khách cho AI)
            const chatSession = model.startChat();
            const result = await chatSession.sendMessage(message);
            const response = result.response;

            // 5. KIỂM TRA AI CÓ YÊU CẦU GỌI DATABASE KHÔNG?
            if (response.functionCalls && response.functionCalls().length > 0) {
                const call = response.functionCalls()[0];

                if (call.name === "searchProducts") {
                    // Lấy các tham số AI đã tự động bóc tách từ câu hỏi của khách
                    const { keyword, brand, maxPrice } = call.args;

                    // Xây dựng câu lệnh Query cho PostgreSQL thông qua Sequelize
                    let dbQuery = {};

                    if (brand) {
                        // Dùng iLike cho Postgres để tìm không phân biệt hoa thường
                        dbQuery.brand = { [Op.iLike]: `%${brand}%` }; 
                    }
                    if (maxPrice) {
                        // Tìm giá nhỏ hơn hoặc bằng (Ưu tiên cột discount_price nếu có)
                        dbQuery.price = { [Op.lte]: maxPrice }; 
                    }
                    if (keyword) {
                        // Tìm theo tên máy chứa từ khóa
                        dbQuery.name = { [Op.iLike]: `%${keyword}%` };
                    }

                    // Tiến hành chọc vào Database lấy dữ liệu thực tế
                    const foundProducts = await Product.findAll({
                        where: Object.keys(dbQuery).length > 0 ? dbQuery : undefined, // Tránh query lỗi nếu không có điều kiện
                        attributes: ['name', 'price', 'discount_price', 'brand', 'specifications'],
                        limit: 3 // Giới hạn lấy tối đa 3 sản phẩm để text không bị quá dài
                    });

                    // Định dạng lại data cho gọn gàng trước khi ném lại cho AI
                    const formattedProducts = foundProducts.map(p => ({
                        TenMay: p.name,
                        Hang: p.brand,
                        GiaBan: p.discount_price || p.price,
                        CauHinh: p.specifications
                    }));

                    // 6. GỬI KẾT QUẢ TỪ DATABASE NGƯỢC LẠI CHO AI
                    const followUpResult = await chatSession.sendMessage([{
                        functionResponse: {
                            name: "searchProducts",
                            response: { 
                                status: "success",
                                totalFound: formattedProducts.length,
                                products: formattedProducts 
                            }
                        }
                    }]);

                    // Trả kết quả cuối cùng mà AI đã tổng hợp về cho Frontend
                    return res.status(200).json({ success: true, text: followUpResult.response.text() });
                }
            }

            // Nếu khách chỉ hỏi bâng quơ (ví dụ: Chào shop), AI tự trả lời luôn không cần tra DB
            return res.status(200).json({ success: true, text: response.text() });

        } catch (error) {
            console.error("Lỗi xử lý AI Chatbot:", error);
            return res.status(500).json({
                success: false,
                message: 'Hệ thống AI đang bận bảo trì, vui lòng nhắn lại sau ít phút nhé!'
            });
        }
    }
}

module.exports = new ChatController();