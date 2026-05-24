const productService = require('../services/product.service');

class ProductController {
    // Lấy danh sách public (có phân trang)
    async getAll(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 12;

            const result = await productService.getAllProducts(page, limit);
            res.status(200).json({ 
                success: true, 
                pagination: {
                    totalItems: result.totalItems,
                    totalPages: result.totalPages,
                    currentPage: result.currentPage,
                    limit: result.limit
                },
                data: result.products 
            });
        } catch (error) { next(error); }
    }

    // Lấy chi tiết
    async getBySlug(req, res, next) {
        try {
            const product = await productService.getProductBySlug(req.params.slug);
            if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
            res.status(200).json({ success: true, data: product });
        } catch (error) { next(error); }
    }

    // Lấy danh sách sản phẩm theo danh mục (có phân trang)
    async getByCategory(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 12;

            const result = await productService.getProductsByCategorySlug(req.params.slug, page, limit);
            res.status(200).json({ 
                success: true, 
                pagination: {
                    totalItems: result.totalItems,
                    totalPages: result.totalPages,
                    currentPage: result.currentPage,
                    limit: result.limit
                },
                data: result.products 
            });
        } catch (error) { next(error); }
    }

    // Tìm kiếm theo từ khóa
    async search(req, res, next) {
        try {
            const { q } = req.query; // Lấy từ khóa từ url (?q=...)
            if (!q) return res.status(200).json({ success: true, data: [] });
            
            const products = await productService.searchProducts(q);
            res.status(200).json({ success: true, data: products });
        } catch (error) { next(error); }
    }

    // Thêm mới
    async create(req, res, next) {
        try {
            const newProduct = await productService.createProduct(req.body);
            res.status(201).json({ success: true, message: 'Thêm sản phẩm thành công', data: newProduct });
        } catch (error) { next(error); }
    }

    // Cập nhật
    async update(req, res, next) {
        try {
            const updatedProduct = await productService.updateProduct(req.params.id, req.body);
            if (!updatedProduct) return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
            res.status(200).json({ success: true, message: 'Cập nhật thành công', data: updatedProduct });
        } catch (error) { next(error); }
    }

    // Xóa
    async delete(req, res, next) {
        try {
            const isDeleted = await productService.deleteProduct(req.params.id);
            if (!isDeleted) return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
            res.status(200).json({ success: true, message: 'Xóa sản phẩm thành công' });
        } catch (error) { next(error); }
    }
}

module.exports = new ProductController();