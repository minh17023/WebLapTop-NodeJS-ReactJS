const { Category } = require('../models');
const slugify = require('slugify');
const { Op } = require('sequelize');

class CategoryService {
    // 1. Lấy tất cả danh mục
    async getAllCategories() {
        return await Category.findAll({
            order: [['created_at', 'ASC']]
        });
    }

    // 2. Lấy chi tiết theo ID hoặc Slug
    async getCategoryBySlug(slug) {
        return await Category.findOne({ where: { slug } });
    }

    // 6. Tìm kiếm danh mục theo tên (Dùng cho Admin Search)
    async search(keyword) {
        const term = `%${keyword.trim()}%`;
        return await Category.findAll({
            where: {
                name: {
                    [Op.iLike]: term // Tìm kiếm không phân biệt chữ hoa/thường
                }
            },
            order: [['created_at', 'DESC']] // Lưu ý: Nếu DB của bạn dùng camelCase thì đổi thành 'createdAt'
        });
    }

    // 3. Thêm danh mục mới (Tự động tạo slug)
    async createCategory(data) {
        const slug = slugify(data.name, { lower: true, locale: 'vi', strict: true });
        return await Category.create({ ...data, slug });
    }

    // 4. Cập nhật danh mục
    async updateCategory(id, data) {
        const category = await Category.findByPk(id);
        if (!category) return null;

        // Nếu cập nhật tên thì tạo lại slug mới
        if (data.name) {
            data.slug = slugify(data.name, { lower: true, locale: 'vi', strict: true });
        }
        return await category.update(data);
    }

    // 5. Xóa danh mục
    async deleteCategory(id) {
        const category = await Category.findByPk(id);
        if (!category) return false;
        await category.destroy();
        return true;
    }
}

module.exports = new CategoryService();