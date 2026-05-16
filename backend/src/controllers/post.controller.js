const postService = require('../services/post.service');

class PostController {
    // [GET] Danh sách (Khách chỉ thấy bài đã xuất bản, Admin thấy hết)
    async getAll(req, res, next) {
        try {
            // Kiểm tra xem người gọi API có phải admin không (dựa vào header token nếu có)
            const isAdmin = req.user && req.user.role === 'admin';
            const posts = await postService.getAllPosts(isAdmin);
            res.status(200).json({ success: true, data: posts });
        } catch (error) { next(error); }
    }

    // [GET] Chi tiết
    async getBySlug(req, res, next) {
        try {
            const post = await postService.getPostBySlug(req.params.slug);
            if (!post) return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
            res.status(200).json({ success: true, data: post });
        } catch (error) { next(error); }
    }

    // [POST] Thêm bài (Chỉ Admin)
    async create(req, res, next) {
        try {
            if (!req.body.title || !req.body.content) {
                return res.status(400).json({ success: false, message: 'Tiêu đề và nội dung là bắt buộc' });
            }
            // req.user.id được lấy từ middleware verifyToken
            const newPost = await postService.createPost(req.body, req.user.id);
            res.status(201).json({ success: true, message: 'Đăng bài thành công', data: newPost });
        } catch (error) { next(error); }
    }

    // [PUT] Cập nhật
    async update(req, res, next) {
        try {
            const updatedPost = await postService.updatePost(req.params.id, req.body);
            if (!updatedPost) return res.status(404).json({ success: false, message: 'Bài viết không tồn tại' });
            res.status(200).json({ success: true, message: 'Cập nhật thành công', data: updatedPost });
        } catch (error) { next(error); }
    }

    // [DELETE] Xóa
    async delete(req, res, next) {
        try {
            const isDeleted = await postService.deletePost(req.params.id);
            if (!isDeleted) return res.status(404).json({ success: false, message: 'Bài viết không tồn tại' });
            res.status(200).json({ success: true, message: 'Xóa bài viết thành công' });
        } catch (error) { next(error); }
    }
}

module.exports = new PostController();