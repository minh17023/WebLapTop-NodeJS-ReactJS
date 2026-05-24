const express = require('express');
const cors = require('cors');
require('dotenv').config();
const apiRoutes = require('./routes/index');

const app = express();

app.use(cors());
app.use(express.json());

// Sử dụng tất cả các route bắt đầu bằng /api
app.use('/api', apiRoutes);

// Middleware xử lý lỗi tập trung
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Lỗi server nội bộ!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});