const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Product, ProductVariant, ChatMessage } = require('../models');

class ChatService {
    async handleChat(userId, message) {
        try {
            const products = await Product.findAll({
                where: { status: 'active' },
                include: [{ model: ProductVariant, as: 'variants' }]
            });

            const productListText = products.map((p, index) => {
                const variants = p.variants || [];
                const defaultVariant = variants[0];
                let currentPrice = 'Đang cập nhật';
                let stock = 'Đã hết hàng';
                
                if (defaultVariant) {
                    currentPrice = defaultVariant.discount_price ? `${defaultVariant.discount_price} VNĐ (Gốc: ${defaultVariant.price} VNĐ)` : `${defaultVariant.price} VNĐ`;
                    const totalStock = variants.reduce((sum, v) => sum + v.stock_quantity, 0);
                    stock = totalStock > 0 ? `Còn hàng (${totalStock} chiếc)` : 'Đã hết hàng';
                }

                const specText = p.specifications ? JSON.stringify(p.specifications) : 'Đang cập nhật';
                const desc = p.description ? p.description.substring(0, 200) + '...' : 'Không có mô tả';

                return `${index + 1}. [Mã SP: ${p.product_id}] ${p.name}
   - Hãng: ${p.brand || 'Chưa rõ'}
   - Kho: ${stock}
   - Giá tham khảo: ${currentPrice}
   - Cấu hình: ${specText}
   - Ưu điểm nổi bật: ${desc}`;
            }).join('\n\n');

            const systemInstruction = `Bạn là chuyên gia tư vấn bán hàng của "HNC Laptop". Khách hàng cần thông tin NHANH, GỌN, CHÍNH XÁC.

Dữ liệu kho hàng hiện tại (CHỈ tư vấn máy có trong danh sách này):
${productListText}

NGUYÊN TẮC TRẢ LỜI BẮT BUỘC (TUYỆT ĐỐI TUÂN THỦ):
1. VÀO THẲNG VẤN ĐỀ: KHÔNG chào hỏi rườm rà. KHÔNG lặp lại câu hỏi. KHÔNG dùng từ ngữ cảm thán dư thừa (như "Tuyệt vời!", "Dạ vâng", "Mình xin tư vấn"). Trả lời đúng trọng tâm ngay câu đầu tiên.
2. SIÊU NGẮN GỌN: Chỉ cung cấp đúng thông tin khách hỏi. Giới hạn câu trả lời tối đa 3-4 câu hoặc 3 gạch đầu dòng.
3. CHỈ MẶT ĐẶT TÊN: Trình bày thông số rõ ràng, luôn in đậm tên máy và các thông số kỹ thuật (VD: **RAM 16GB**, **Core i5**).
4. HIỂU NGỮ CẢNH: Dựa vào lịch sử chat để tự biết khách đang nói về máy nào khi họ dùng từ "nó", "máy đó".
5. XỬ LÝ HẾT HÀNG: Nếu máy khách hỏi báo "Đã hết hàng", trả lời thẳng là hết và đưa ra đúng 1 gợi ý thay thế tốt nhất cùng tầm giá.`;

            const pastMessages = await ChatMessage.findAll({
                where: { user_id: userId },
                order: [['created_at', 'ASC']],
                limit: 20 
            });

            const formattedHistory = pastMessages.map(msg => ({
                role: msg.sender, 
                parts: [{ text: msg.message }]
            }));

            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ 
                model: "gemini-2.5-flash",
                systemInstruction: systemInstruction 
            });

            const chatSession = model.startChat({ history: formattedHistory });
            const result = await chatSession.sendMessage(message);
            const responseText = result.response.text();

            await ChatMessage.bulkCreate([
                { user_id: userId, sender: 'user', message: message },
                { user_id: userId, sender: 'model', message: responseText }
            ]);

            return { success: true, text: responseText };

        } catch (error) {
            console.error("Lỗi tại ChatService.handleChat:", error);
            throw error;
        }
    }

    async getChatHistory(userId) {
        try {
            const messages = await ChatMessage.findAll({
                where: { user_id: userId },
                order: [['created_at', 'ASC']]
            });
            return { success: true, data: messages };
        } catch (error) {
            console.error("Lỗi tại ChatService.getChatHistory:", error);
            throw error;
        }
    }
}

module.exports = new ChatService();