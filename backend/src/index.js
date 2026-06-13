const express = require('express');
const cors = require('cors');
require('dotenv').config();
const apiRoutes = require('./routes/index');
const errorHandler = require('./middlewares/error.middleware');
const { sequelize } = require('./models');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true })
    .then(() => {
        console.log('Đã đồng bộ Database thành công!');
        app.listen(PORT, () => {
            console.log(`Server đang chạy tại http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Lỗi đồng bộ Database:', error);
    });