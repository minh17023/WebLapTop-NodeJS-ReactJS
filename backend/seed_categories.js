const { Category, sequelize } = require('./src/models');
const slugify = require('slugify');

const categories = [
    { name: 'lap gamming' },
    { name: 'lap văn phòng' },
    { name: 'macbook' },
    { name: 'sản phẩm khác' }
];

async function seedCategories() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        for (const cat of categories) {
            const slug = slugify(cat.name, { lower: true, locale: 'vi' });
            
            // Check if exists
            const existing = await Category.findOne({ where: { slug } });
            if (!existing) {
                await Category.create({ name: cat.name, slug });
                console.log(`Created category: ${cat.name}`);
            } else {
                console.log(`Category already exists: ${cat.name}`);
            }
        }
        
        console.log('Seeding completed.');
    } catch (error) {
        console.error('Error seeding categories:', error);
    } finally {
        await sequelize.close();
    }
}

seedCategories();
