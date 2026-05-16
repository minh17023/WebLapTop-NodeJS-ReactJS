const { Post, User } = require('../models');
const slugify = require('slugify');

class PostService {
    // 1. Lấy tất cả bài viết (chỉ lấy bài đã xuất bản - is_published: true)
    async getAllPosts(isAdmin = false) {
        const whereClause = isAdmin ? {} : { is_published: true };
        
        return await Post.findAll({
            where: whereClause,
            include: [{ model: User, as: 'author', attributes: ['full_name'] }],
            order: [['created_at', 'DESC']]
        });
    }

    // 2. Lấy chi tiết bài viết theo Slug
    async getPostBySlug(slug) {
        return await Post.findOne({
            where: { slug, is_published: true },
            include: [{ model: User, as: 'author', attributes: ['full_name'] }]
        });
    }

    // 3. Thêm bài viết mới
    async createPost(data, authorId) {
        const slug = slugify(data.title, { lower: true, locale: 'vi', strict: true });
        return await Post.create({ 
            ...data, 
            slug,
            author_id: authorId // Lấy ID người viết từ Token
        });
    }

    // 4. Cập nhật bài viết
    async updatePost(id, data) {
        const post = await Post.findByPk(id);
        if (!post) return null;

        if (data.title) {
            data.slug = slugify(data.title, { lower: true, locale: 'vi', strict: true });
        }
        
        return await post.update(data);
    }

    // 5. Xóa bài viết
    async deletePost(id) {
        const post = await Post.findByPk(id);
        if (!post) return false;
        await post.destroy();
        return true;
    }
}

module.exports = new PostService();