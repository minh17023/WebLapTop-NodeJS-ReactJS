const categoryService = require('../services/category.service');

class CategoryController {
    async getAll(req, res, next) {
        try {
            const categories = await categoryService.getAllCategories();
            res.status(200).json({ success: true, data: categories });
        } catch (error) { next(error); }
    }

    async getBySlug(req, res, next) {
        try {
            const category = await categoryService.getCategoryBySlug(req.params.slug);
            if (!category) return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
            res.status(200).json({ success: true, data: category });
        } catch (error) { next(error); }
    }

    async search(req, res, next) {
        try {
            const keyword = req.query.q || '';
            const categories = await categoryService.search(keyword);
            
            res.status(200).json({ 
                success: true, 
                data: categories 
            });
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            if (!req.body.name) return res.status(400).json({ success: false, message: 'Tên danh mục là bắt buộc' });
            const newCategory = await categoryService.createCategory(req.body);
            res.status(201).json({ success: true, message: 'Thêm danh mục thành công', data: newCategory });
        } catch (error) { next(error); }
    }

    async update(req, res, next) {
        try {
            const updatedCategory = await categoryService.updateCategory(req.params.id, req.body);
            if (!updatedCategory) return res.status(404).json({ success: false, message: 'Danh mục không tồn tại' });
            res.status(200).json({ success: true, message: 'Cập nhật thành công', data: updatedCategory });
        } catch (error) { next(error); }
    }

    async delete(req, res, next) {
        try {
            const isDeleted = await categoryService.deleteCategory(req.params.id);
            if (!isDeleted) return res.status(404).json({ success: false, message: 'Danh mục không tồn tại' });
            res.status(200).json({ success: true, message: 'Xóa danh mục thành công' });
        } catch (error) { next(error); }
    }
}

module.exports = new CategoryController();