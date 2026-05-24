const { Product, Category } = require('../models');
const slugify = require('slugify');
const { Op } = require('sequelize');

class ProductService {
    // 1. Lấy tất cả sản phẩm (phân trang, kèm tên danh mục)
    async getAllProducts(page = 1, limit = 12) {
        const offset = (page - 1) * limit;
        const { rows, count } = await Product.findAndCountAll({
            include: [{ model: Category, attributes: ['name', 'slug'] }],
            limit: Number(limit),
            offset: Number(offset),
            order: [['created_at', 'DESC']]
        });

        return {
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            limit: Number(limit),
            products: rows
        };
    }

    // 2. Lấy chi tiết sản phẩm theo Slug
    async getProductBySlug(slug) {
        return await Product.findOne({
            where: { slug },
            include: [{ model: Category, attributes: ['name', 'slug'] }]
        });
    }

    // Lấy sản phẩm theo Slug của danh mục (phân trang)
    async getProductsByCategorySlug(categorySlug, page = 1, limit = 12) {
        const offset = (page - 1) * limit;
        const { rows, count } = await Product.findAndCountAll({
            include: [{ 
                model: Category, 
                where: { slug: categorySlug }, // Lọc theo danh mục
                attributes: ['name', 'slug', 'description'] 
            }],
            limit: Number(limit),
            offset: Number(offset),
            order: [['created_at', 'DESC']]
        });

        return {
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            limit: Number(limit),
            products: rows
        };
    }

    //Tìm kiếm sản phẩm
    async searchProducts(keyword) {
        return await Product.findAll({
            where: {
                [Op.or]: [
                    // Dùng iLike cho PostgreSQL để tìm kiếm KHÔNG phân biệt chữ hoa/thường
                    { name: { [Op.iLike]: `%${keyword}%` } },
                    { brand: { [Op.iLike]: `%${keyword}%` } }
                ]
            },
            include: [{ model: Category, attributes: ['name', 'slug'] }],
            limit: 5 // Chỉ lấy 5 sản phẩm để hiển thị gợi ý nhanh trên Header
        });
    }

    // 3. Thêm sản phẩm mới (Chỉ Admin)
    async createProduct(data) {
        // Tự động tạo slug từ tên laptop
        const slug = slugify(data.name, { lower: true, locale: 'vi', strict: true });
        
        // Đảm bảo specifications là một object JSON (nếu frontend gửi lên dạng chuỗi thì parse ra)
        if (typeof data.specifications === 'string') {
            data.specifications = JSON.parse(data.specifications);
        }

        return await Product.create({ ...data, slug });
    }

    // 4. Cập nhật sản phẩm
    async updateProduct(id, data) {
        const product = await Product.findByPk(id);
        if (!product) return null;

        if (data.name) {
            data.slug = slugify(data.name, { lower: true, locale: 'vi', strict: true });
        }
        if (typeof data.specifications === 'string') {
            data.specifications = JSON.parse(data.specifications);
        }

        return await product.update(data);
    }

    // 5. Xóa sản phẩm
    async deleteProduct(id) {
        const product = await Product.findByPk(id);
        if (!product) return false;
        await product.destroy();
        return true;
    }
}

module.exports = new ProductService();