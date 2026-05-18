const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

const jwtUtil = {
    // 1. Tạo token mới (Sử dụng bên user.controller.js khi khách Login)
    generateToken: (payload, expiresIn = '1d') => {
        return jwt.sign(payload, JWT_SECRET, { expiresIn });
    },

    // 2. Giải mã và xác thực token (Sử dụng bên auth.middleware.js)
    verifyToken: (token) => {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return null; 
        }
    }
};

module.exports = jwtUtil;