const { Product, Category, ProductVariant } = require('../models');
const slugify = require('slugify');
const { Op } = require('sequelize');

class ProductService {
    async getAllProducts(page = 1, limit = 12) {
        const offset = (page - 1) * limit;
        const { rows, count } = await Product.findAndCountAll({
            include: [
                { model: Category, attributes: ['name', 'slug'] },
                { model: ProductVariant, as: 'variants' }
            ],
            limit: Number(limit),
            offset: Number(offset),
            order: [['created_at', 'DESC']],
            distinct: true
        });

        return {
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            limit: Number(limit),
            products: rows
        };
    }

    async getProductBySlug(slug) {
        return await Product.findOne({
            where: { slug },
            include: [
                { model: Category, attributes: ['name', 'slug'] },
                { model: ProductVariant, as: 'variants' }
            ]
        });
    }

    async getProductsByCategorySlug(categorySlug, page = 1, limit = 12) {
        const offset = (page - 1) * limit;
        const { rows, count } = await Product.findAndCountAll({
            include: [
                { 
                    model: Category, 
                    where: { slug: categorySlug },
                    attributes: ['name', 'slug', 'description'] 
                },
                { model: ProductVariant, as: 'variants' }
            ],
            limit: Number(limit),
            offset: Number(offset),
            order: [['created_at', 'DESC']],
            distinct: true
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
                    { name: { [Op.iLike]: `%${keyword}%` } },
                    { brand: { [Op.iLike]: `%${keyword}%` } }
                ]
            },
            include: [
                { model: Category, attributes: ['name', 'slug'] },
                { model: ProductVariant, as: 'variants' }
            ],
            limit: 5
        });
    }

    async createProduct(data) {
        const { variants, ...productData } = data;
        
        const slug = slugify(productData.name, { lower: true, locale: 'vi', strict: true });
        
        if (typeof productData.specifications === 'string') {
            productData.specifications = JSON.parse(productData.specifications);
        }

        const newProduct = await Product.create({ ...productData, slug });
        
        if (variants && Array.isArray(variants) && variants.length > 0) {
            const variantsPayload = variants.map(v => ({
                product_id: newProduct.product_id,
                sku: v.sku || null,
                ram: v.ram,
                ssd: v.ssd,
                price: v.price,
                discount_price: v.discount_price || null,
                stock_quantity: v.stock_quantity
            }));
            await ProductVariant.bulkCreate(variantsPayload);
        }

        return newProduct;
    }

    async updateProduct(id, data) {
        const product = await Product.findByPk(id);
        if (!product) return null;

        const { variants, ...productData } = data;

        if (productData.name) {
            productData.slug = slugify(productData.name, { lower: true, locale: 'vi', strict: true });
        }
        if (typeof productData.specifications === 'string') {
            productData.specifications = JSON.parse(productData.specifications);
        }

        await product.update(productData);

        if (variants && Array.isArray(variants)) {
            const existingVariants = await ProductVariant.findAll({ where: { product_id: id } });
            
            // Xóa các biến thể cũ không còn trong danh sách gửi lên
            const newVariantIds = variants.map(v => v.variant_id).filter(id => id);
            for (const ev of existingVariants) {
                if (!newVariantIds.includes(ev.variant_id)) {
                    await ev.destroy();
                }
            }

            // Thêm mới hoặc cập nhật
            for (const v of variants) {
                if (v.variant_id) {
                    const ev = existingVariants.find(e => e.variant_id === v.variant_id);
                    if (ev) {
                        await ev.update({
                            sku: v.sku || null,
                            ram: v.ram,
                            ssd: v.ssd,
                            price: v.price,
                            discount_price: v.discount_price || null,
                            stock_quantity: v.stock_quantity
                        });
                    }
                } else {
                    await ProductVariant.create({
                        product_id: id,
                        sku: v.sku || null,
                        ram: v.ram,
                        ssd: v.ssd,
                        price: v.price,
                        discount_price: v.discount_price || null,
                        stock_quantity: v.stock_quantity
                    });
                }
            }
        }

        return product;
    }

    async deleteProduct(id) {
        const product = await Product.findByPk(id);
        if (!product) return false;
        await product.destroy();
        return true;
    }
}

module.exports = new ProductService();