import Header from './Header';
import Footer from './Footer';
import Chatbot from './Chatbot';

const Layout = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
            <Chatbot /> {/* 🌟 Thêm Chatbot vào đây */}
        </div>
    );
};

export default Layout;