import { useState, useEffect, useRef, useContext } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { chatService } from '../../services/chat.service';
import { AuthContext } from '../../context/user/AuthContext';
import { Link } from 'react-router-dom';

const Chatbot = () => {
    const { user } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingHistory, setIsFetchingHistory] = useState(false);
    
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    useEffect(() => {
        setMessages([]); 
        if (!user) {
            setIsOpen(false); 
        }
    }, [user]);

    useEffect(() => {
        if (isOpen && user && messages.length === 0) {
            const fetchHistory = async () => {
                setIsFetchingHistory(true);
                try {
                    const res = await chatService.getHistory();
                    if (res.success && res.data.length > 0) {
                        setMessages(res.data);
                    } else {
                        setMessages([
                            { sender: 'model', message: `Chào ${user.full_name || 'bạn'}! Mình là AI tư vấn của HNC Laptop. Mình có thể giúp gì cho bạn hôm nay?` }
                        ]);
                    }
                } catch (error) {
                    console.error("Lỗi lấy lịch sử chat:", error);
                } finally {
                    setIsFetchingHistory(false);
                }
            };
            fetchHistory();
        }
    }, [isOpen, user, messages.length]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userText = input.trim();
        setInput(''); 
        
        setMessages(prev => [...prev, { sender: 'user', message: userText }]);
        setIsLoading(true);

        try {
            const res = await chatService.sendMessage(userText);
            if (res.success) {
                setMessages(prev => [...prev, { sender: 'model', message: res.text }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { 
                sender: 'model', 
                message: 'Xin lỗi, hệ thống AI đang quá tải. Vui lòng thử lại sau giây lát nhé!' 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    // 🌟 HÀM MỚI: Xử lý ký tự ** thành chữ in đậm
    const formatMessage = (text) => {
        // Tách các đoạn text được bọc bởi dấu **
        return text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
            // Nếu đoạn đó có 2 dấu sao ở đầu và cuối
            if (part.startsWith('**') && part.endsWith('**')) {
                // Cắt bỏ 2 dấu sao đi và bọc vào thẻ <strong> để in đậm
                return <strong key={index} className="text-gray-900 font-black">{part.slice(2, -2)}</strong>;
            }
            // Các đoạn chữ bình thường
            return <span key={index}>{part}</span>;
        });
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 p-4 bg-red-600 text-white rounded-full shadow-2xl hover:bg-red-700 transition-all duration-300 z-50 hover:scale-110 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
            >
                <MessageCircle size={28} />
                <span className="absolute top-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
            </button>

            <div className={`fixed bottom-6 right-6 w-[360px] h-[550px] bg-white rounded-2xl shadow-[0_5px_40px_rgba(0,0,0,0.16)] flex flex-col z-50 transition-all duration-300 transform origin-bottom-right overflow-hidden border border-gray-100 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
                
                <div className="bg-red-600 p-4 text-white flex justify-between items-center shadow-md z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-inner relative">
                            <Bot size={24} className="text-red-600" />
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                        </div>
                        <div>
                            <h3 className="font-black text-sm uppercase tracking-wider">HNC AI Assistant</h3>
                            <p className="text-[11px] text-red-100 font-medium">Sẵn sàng tư vấn 24/7</p>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-white hover:bg-red-500 p-1.5 rounded-xl transition">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-4 custom-scrollbar relative">
                    {!user ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 h-full">
                            <Bot size={48} className="text-gray-300 mb-4" />
                            <p className="text-sm font-bold text-gray-600 mb-2">Chào bạn! Mình là AI của HNC Laptop.</p>
                            <p className="text-xs text-gray-500 mb-6">Vui lòng đăng nhập để mình có thể nhớ lịch sử trò chuyện và hỗ trợ bạn tốt nhất nhé!</p>
                            <Link to="/login" className="bg-red-600 text-white font-bold py-2.5 px-6 rounded-xl text-sm shadow-lg hover:bg-red-700 transition">
                                Đăng nhập ngay
                            </Link>
                        </div>
                    ) : isFetchingHistory ? (
                        <div className="flex justify-center items-center h-full text-gray-400 gap-2">
                            <Loader2 className="animate-spin" size={20} /> <span className="text-xs font-bold uppercase tracking-wider">Đang tải lịch sử...</span>
                        </div>
                    ) : (
                        <>
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.sender === 'model' && (
                                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                                            <Bot size={16} />
                                        </div>
                                    )}
                                    
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed shadow-sm ${
                                        msg.sender === 'user' 
                                            ? 'bg-blue-600 text-white rounded-br-sm' 
                                            : 'bg-white border border-gray-100 text-gray-700 rounded-bl-sm'
                                    }`}>
                                        {/* 🌟 Gọi hàm format để làm đẹp tin nhắn */}
                                        {formatMessage(msg.message)}
                                    </div>

                                    {msg.sender === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                                            <User size={16} />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex gap-3 justify-start">
                                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                                        <Bot size={16} />
                                    </div>
                                    <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-bl-sm shadow-sm flex gap-1.5 items-center">
                                        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {user && (
                    <div className="p-3 bg-white border-t border-gray-100">
                        <form onSubmit={handleSendMessage} className="flex items-end gap-2 relative">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage(e);
                                    }
                                }}
                                placeholder="Hỏi tôi bất cứ điều gì..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-red-400 focus:bg-white transition resize-none custom-scrollbar"
                                rows="1"
                                style={{ minHeight: '46px', maxHeight: '120px' }}
                                disabled={isLoading}
                            />
                            <button 
                                type="submit" 
                                disabled={!input.trim() || isLoading}
                                className="absolute right-2 bottom-1.5 p-2 text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 transition-colors flex items-center justify-center"
                            >
                                <Send size={18} className={isLoading ? 'opacity-50' : ''} />
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </>
    );
};

export default Chatbot;