import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { postService } from '../../services/post.service';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';

const PostDetail = () => {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await postService.getBySlug(slug);
                if (res.success) setPost(res.data);
            } catch (error) {
                toast.error('Không tìm thấy bài viết');
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [slug]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    if (loading) return <div className="text-center mt-20 text-xl">Đang tải nội dung...</div>;
    if (!post) return <div className="text-center mt-20 text-2xl font-bold text-gray-500">Bài viết không tồn tại hoặc đã bị xóa</div>;

    return (
        <div className="bg-white">
            <div className="max-w-4xl mx-auto px-4 py-12">
                <Link to="/posts" className="inline-flex items-center text-gray-500 hover:text-red-600 font-medium mb-8 transition">
                    <ArrowLeft size={20} className="mr-2" /> Quay lại danh sách tin tức
                </Link>

                <article>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
                        {post.title}
                    </h1>

                    <div className="flex items-center text-sm text-gray-500 mb-8 space-x-6 border-b pb-6">
                        <span className="flex items-center bg-gray-100 px-3 py-1 rounded-full"><User size={16} className="mr-2" /> Đăng bởi: <strong className="ml-1 text-gray-800">{post.author?.full_name || 'Admin'}</strong></span>
                        <span className="flex items-center"><Calendar size={16} className="mr-2" /> {formatDate(post.created_at)}</span>
                    </div>

                    {post.thumbnail_url && (
                        <img
                            src={post.thumbnail_url}
                            alt={post.title}
                            className="w-full h-[400px] object-cover rounded-2xl mb-10 shadow-sm"
                        />
                    )}

                    {post.summary && (
                        <div className="text-xl text-gray-600 font-medium italic border-l-4 border-red-500 pl-4 mb-10">
                            {post.summary}
                        </div>
                    )}

                    {/* Vùng hiển thị nội dung chi tiết bài viết (Hỗ trợ HTML Render) */}
                    <div
                        className="prose prose-lg max-w-none text-gray-800"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </article>
            </div>
        </div>
    );
};

export default PostDetail;