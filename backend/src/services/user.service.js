const { User } = require('../models');
const bcrypt = require('bcryptjs');

class UserService {
    // 1. Tìm người dùng theo Email (Dùng cho Login/Register)
    async getUserByEmail(email) {
        return await User.findOne({ where: { email } });
    }

    // 2. Tạo người dùng mới (Register)
    async createUser(userData) {
        const salt = await bcrypt.genSalt(10);
        userData.password_hash = await bcrypt.hash(userData.password, salt);
        const { password, ...userToSave } = userData;
        return await User.create(userToSave);
    }

    // ================= CRUD API =================

    // 3. Lấy danh sách tất cả người dùng (ẩn mật khẩu)
    async getAllUsers() {
        return await User.findAll({
            attributes: { exclude: ['password_hash'] },
            order: [['created_at', 'DESC']]
        });
    }

    // 4. Lấy chi tiết một người dùng
    async getUserById(id) {
        return await User.findByPk(id, {
            attributes: { exclude: ['password_hash'] }
        });
    }

    // 5. Cập nhật thông tin người dùng
    async updateUser(id, updateData) {
        const user = await User.findByPk(id);
        if (!user) return null;

        // Nếu có cập nhật mật khẩu, phải mã hóa lại
        if (updateData.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password_hash = await bcrypt.hash(updateData.password, salt);
            delete updateData.password;
        }

        return await user.update(updateData);
    }

    // 6. Xóa người dùng
    async deleteUser(id) {
        const user = await User.findByPk(id);
        if (!user) return false;
        await user.destroy();
        return true;
    }
}

module.exports = new UserService();