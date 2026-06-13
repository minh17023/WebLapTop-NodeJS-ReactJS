import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { postService } from '../../services/post.service';
import { Calendar, User } from 'lucide-react';
import { toast } from 'react-toastify';

const Posts = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 6; 

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const res = await postService.getAll(currentPage, limit);
                if (res.success) {
                    setPosts(res.data);
                    if (res.pagination) {
                        setTotalPages(res.pagination.totalPages);
                    }
                }
            } catch (error) {
                toast.error('Lỗi tải danh sách bài viết');
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [currentPage]);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    if (loading) return <div className="text-center mt-20 text-xl font-medium">Đang tải tin tức...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-l-4 border-red-600 pl-4">Tin Tức Công Nghệ</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.length > 0 ? posts.map((post) => (
                    <article key={post.post_id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition duration-300 flex flex-col">
                        <Link to={`/post/${post.slug}`}>
                            <img
                                src={post.thumbnail_url || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80"}
                                alt={post.title}
                                className="w-full h-56 object-cover hover:scale-105 transition duration-500"
                            />
                        </Link>
                        <div className="p-6 flex flex-col flex-grow">
                            <div className="flex items-center text-xs text-gray-500 mb-3 space-x-4">
                                <span className="flex items-center"><Calendar size={14} className="mr-1" /> {formatDate(post.created_at)}</span>
                                <span className="flex items-center"><User size={14} className="mr-1" /> {post.author?.full_name || 'Admin'}</span>
                            </div>
                            <Link to={`/post/${post.slug}`}>
                                <h2 className="text-xl font-bold text-gray-900 hover:text-blue-600 mb-3 line-clamp-2">
                                    {post.title}
                                </h2>
                            </Link>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                {post.summary || "Đang cập nhật nội dung tóm tắt..."}
                            </p>
                            <div className="mt-auto pt-4 border-t border-gray-50">
                                <Link to={`/post/${post.slug}`} className="text-blue-600 font-semibold hover:text-red-800 text-sm flex items-center">
                                    Đọc tiếp →
                                </Link>
                            </div>
                        </div>
                    </article>
                )) : (
                    <p className="text-gray-500 col-span-full text-center py-10">Chưa có bài viết nào được xuất bản.</p>
                )}
            </div>

            {/* THANH PHÂN TRANG */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12 bg-white p-4 rounded-xl border border-gray-100 shadow-sm w-fit mx-auto">
                    <button 
                        disabled={currentPage === 1}
                        onClick={() => {
                            setCurrentPage(prev => prev - 1);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-blue-600 hover:text-white border border-gray-200 rounded-lg transition disabled:opacity-40 disabled:hover:bg-gray-50 disabled:hover:text-gray-700 disabled:cursor-not-allowed cursor-pointer"
                    >
                        Trước
                    </button>
                    <span className="text-sm font-semibold text-gray-600 bg-blue-50 px-3 py-1.5 rounded-md border border-blue-100">
                        Trang {currentPage} / {totalPages}
                    </span>
                    <button 
                        disabled={currentPage === totalPages}
                        onClick={() => {
                            setCurrentPage(prev => prev + 1);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-blue-600 hover:text-white border border-gray-200 rounded-lg transition disabled:opacity-40 disabled:hover:bg-gray-50 disabled:hover:text-gray-700 disabled:cursor-not-allowed cursor-pointer"
                    >
                        Sau
                    </button>
                </div>
            )}
        </div>
    );
};

export default Posts;