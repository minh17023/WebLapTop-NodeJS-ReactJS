const userService = require('../services/user.service');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class UserController {
    // Đăng ký
    async register(req, res, next) {
        try {
            const { email } = req.body;
            const existingUser = await userService.getUserByEmail(email);
            if (existingUser) return res.status(400).json({ success: false, message: 'Email đã tồn tại!' });

            const newUser = await userService.createUser(req.body);
            res.status(201).json({ success: true, message: 'Đăng ký thành công', data: { id: newUser.user_id, email: newUser.email } });
        } catch (error) { next(error); }
    }

    // Đăng nhập
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const user = await userService.getUserByEmail(email);
            if (!user) return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });

            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });

            const token = jwt.sign(
                { id: user.user_id, role: user.role },
                process.env.JWT_SECRET || 'your_jwt_secret_key',
                { expiresIn: '1d' }
            );

            res.status(200).json({ success: true, message: 'Đăng nhập thành công', token, user: { id: user.user_id, fullName: user.full_name, role: user.role } });
        } catch (error) { next(error); }
    }

    // ================= CRUD API =================

    // Lấy danh sách (Dành cho Admin)
    async getAll(req, res, next) {
        try {
            const users = await userService.getAllUsers();
            res.status(200).json({ success: true, data: users });
        } catch (error) { next(error); }
    }

    // Lấy chi tiết
    async getById(req, res, next) {
        try {
            const user = await userService.getUserById(req.params.id);
            if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
            res.status(200).json({ success: true, data: user });
        } catch (error) { next(error); }
    }

    // Cập nhật người dùng
    async update(req, res, next) {
        try {
            const updatedUser = await userService.updateUser(req.params.id, req.body);
            if (!updatedUser) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng để cập nhật' });
            
            // Ẩn hash khi trả về
            const userData = updatedUser.toJSON();
            delete userData.password_hash;
            
            res.status(200).json({ success: true, message: 'Cập nhật thành công', data: userData });
        } catch (error) { next(error); }
    }

    // Xóa người dùng
    async delete(req, res, next) {
        try {
            const isDeleted = await userService.deleteUser(req.params.id);
            if (!isDeleted) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng để xóa' });
            res.status(200).json({ success: true, message: 'Xóa người dùng thành công' });
        } catch (error) { next(error); }
    }
}

module.exports = new UserController();