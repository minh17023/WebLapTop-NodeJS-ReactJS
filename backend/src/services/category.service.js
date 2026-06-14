const { Category } = require('../models');
const slugify = require('slugify');
const { Op } = require('sequelize');

class CategoryService {
    async getAllCategories() {
        return await Category.findAll({
            order: [['created_at', 'ASC']]
        });
    }

    async getCategoryBySlug(slug) {
        return await Category.findOne({ where: { slug } });
    }

    async search(keyword) {
        const term = `%${keyword.trim()}%`;
        return await Category.findAll({
            where: {
                name: {
                    [Op.iLike]: term 
                }
            },
            order: [['created_at', 'DESC']]
        });
    }

    async createCategory(data) {
        const slug = slugify(data.name, { lower: true, locale: 'vi', strict: true });
        return await Category.create({ ...data, slug });
    }

    async updateCategory(id, data) {
        const category = await Category.findByPk(id);
        if (!category) return null;

        if (data.name) {
            data.slug = slugify(data.name, { lower: true, locale: 'vi', strict: true });
        }
        return await category.update(data);
    }

    async deleteCategory(id) {
        const category = await Category.findByPk(id);
        if (!category) return false;
        await category.destroy();
        return true;
    }
}

module.exports = new CategoryService();