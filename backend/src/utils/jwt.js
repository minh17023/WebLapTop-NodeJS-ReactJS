const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

const jwtUtil = {
    generateToken: (payload, expiresIn = '1d') => {
        return jwt.sign(payload, JWT_SECRET, { expiresIn });
    },

    verifyToken: (token) => {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return null; 
        }
    }
};

module.exports = jwtUtil;