const postService = require('../services/post.service');

class PostController {
    async getAll(req, res, next) {
        try {
            const isAdmin = req.user && req.user.role === 'admin';
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const result = await postService.getAllPosts(isAdmin, page, limit);
            res.status(200).json({ 
                success: true, 
                pagination: {
                    totalItems: result.totalItems,
                    totalPages: result.totalPages,
                    currentPage: result.currentPage,
                    limit: result.limit
                },
                data: result.posts 
            });
        } catch (error) { next(error); }
    }

    async search(req, res, next) {
        try {
            const keyword = req.query.q || '';
            const posts = await postService.search(keyword);
            
            res.status(200).json({ 
                success: true, 
                data: posts 
            });
        } catch (error) {
            next(error);
        }
    }

    async getBySlug(req, res, next) {
        try {
            const post = await postService.getPostBySlug(req.params.slug);
            if (!post) return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
            res.status(200).json({ success: true, data: post });
        } catch (error) { next(error); }
    }

    async create(req, res, next) {
        try {
            if (!req.body.title || !req.body.content) {
                return res.status(400).json({ success: false, message: 'Tiêu đề và nội dung là bắt buộc' });
            }
            const newPost = await postService.createPost(req.body, req.user.id);
            res.status(201).json({ success: true, message: 'Đăng bài thành công', data: newPost });
        } catch (error) { next(error); }
    }

    async update(req, res, next) {
        try {
            const updatedPost = await postService.updatePost(req.params.id, req.body);
            if (!updatedPost) return res.status(404).json({ success: false, message: 'Bài viết không tồn tại' });
            res.status(200).json({ success: true, message: 'Cập nhật thành công', data: updatedPost });
        } catch (error) { next(error); }
    }

    async delete(req, res, next) {
        try {
            const isDeleted = await postService.deletePost(req.params.id);
            if (!isDeleted) return res.status(404).json({ success: false, message: 'Bài viết không tồn tại' });
            res.status(200).json({ success: true, message: 'Xóa bài viết thành công' });
        } catch (error) { next(error); }
    }
}

module.exports = new PostController();