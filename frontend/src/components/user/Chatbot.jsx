import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import api from '../../services/api'; // Đường dẫn file axios của bạn

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Chào bạn! Mình là AI tư vấn của HNC Laptop. Mình có thể giúp gì cho bạn hôm nay?' }
    ]);
    const [inputMsg, setInputMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Tự động cuộn xuống tin nhắn mới nhất
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(() => { scrollToBottom(); }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMsg.trim()) return;

        // Lưu tin nhắn của khách vào UI
        const userMsg = inputMsg;
        setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
        setInputMsg('');
        setIsLoading(true);

        try {
            // Gọi API Backend vừa viết ở Bước 2
            const res = await api.post('/chat', { message: userMsg });
            
            // Lưu tin nhắn trả lời của Bot vào UI
            setMessages(prev => [...prev, { sender: 'bot', text: res.data.text }]);
        } catch (error) {
            setMessages(prev => [...prev, { sender: 'bot', text: 'Xin lỗi, hệ thống AI đang bảo trì. Vui lòng liên hệ Hotline nhé!' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Nút bấm mở Chatbot */}
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="bg-red-600 text-white p-4 rounded-full shadow-2xl hover:bg-red-700 transition transform hover:scale-110 flex items-center justify-center animate-bounce"
                >
                    <MessageSquare size={24} />
                </button>
            )}

            {/* Cửa sổ Chat */}
            {isOpen && (
                <div className="w-[350px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-100 overflow-hidden animate-fadeIn h-[500px]">
                    {/* Header */}
                    <div className="bg-red-600 text-white p-4 flex justify-between items-center shadow-md">
                        <div className="flex items-center gap-2">
                            <Bot size={24} />
                            <div>
                                <h3 className="font-bold text-sm">HNC AI Assistant</h3>
                                <p className="text-[10px] text-red-100 flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span> Đang hoạt động
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200"><X size={20}/></button>
                    </div>

                    {/* Nội dung chat */}
                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-4 custom-scrollbar">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${msg.sender === 'user' ? 'bg-red-600 text-white rounded-tr-sm' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-100 text-gray-400 p-3 rounded-2xl rounded-tl-sm shadow-sm text-sm flex gap-1 items-center">
                                    <span className="animate-bounce">.</span><span className="animate-bounce delay-100">.</span><span className="animate-bounce delay-200">.</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Ô nhập tin nhắn */}
                    <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2">
                        <input 
                            type="text" 
                            value={inputMsg}
                            onChange={(e) => setInputMsg(e.target.value)}
                            placeholder="Hỏi AI về laptop..." 
                            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full outline-none focus:ring-2 focus:ring-red-500 text-sm transition"
                        />
                        <button type="submit" disabled={isLoading} className="bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-700 disabled:bg-gray-400 transition flex-shrink-0">
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Chatbot;