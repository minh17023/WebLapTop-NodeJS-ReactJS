const jwt = require('jsonwebtoken');

// Kiểm tra người dùng đã đăng nhập chưa (có Token không)
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Bạn chưa đăng nhập hoặc token không hợp lệ!' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
        req.user = decoded; // Gắn thông tin user vào request để dùng ở Controller
        next(); // Cho phép đi tiếp
    } catch (error) {
        return res.status(403).json({ success: false, message: 'Token đã hết hạn hoặc không hợp lệ!' });
    }
};

// Kiểm tra quyền Admin
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ success: false, message: 'Truy cập bị từ chối. Bạn không phải Quản trị viên!' });
    }
};

module.exports = { verifyToken, isAdmin };