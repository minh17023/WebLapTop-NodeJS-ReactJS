const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        logging: false,
        timezone: '+07:00',
        define: {
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
);

// Test kết nối
sequelize.authenticate()
    .then(() => console.log('Sequelize: Đã kết nối thành công với PostgreSQL!'))
    .catch(err => console.error('Sequelize: Kết nối thất bại:', err));

module.exports = sequelize;