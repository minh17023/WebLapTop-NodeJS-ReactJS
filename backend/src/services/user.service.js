const { User } = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

class UserService {
    async getUserByEmail(email) {
        return await User.findOne({ where: { email } });
    }

    async createUser(userData) {
        const salt = await bcrypt.genSalt(10);
        userData.password_hash = await bcrypt.hash(userData.password, salt);
        const { password, ...userToSave } = userData;
        return await User.create(userToSave);
    }

    async search(keyword) {
        const term = `%${keyword.trim()}%`;
        return await User.findAll({
            where: {
                [Op.or]: [
                    { full_name: { [Op.iLike]: term } },
                    { email: { [Op.iLike]: term } }
                ]
            },
            attributes: { exclude: ['password_hash'] },
            order: [['created_at', 'DESC']]
        });
    }

    // ================= CRUD API =================

    async getAllUsers(page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const { rows, count } = await User.findAndCountAll({
            attributes: { exclude: ['password_hash'] },
            limit: Number(limit),
            offset: Number(offset),
            order: [['created_at', 'DESC']]
        });

        return {
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            limit: Number(limit),
            users: rows
        };
    }

    async getUserById(id) {
        return await User.findByPk(id, {
            attributes: { exclude: ['password_hash'] }
        });
    }

    async updateUser(id, updateData) {
        const user = await User.findByPk(id);
        if (!user) return null;

        if (updateData.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password_hash = await bcrypt.hash(updateData.password, salt);
            delete updateData.password;
        }

        return await user.update(updateData);
    }

    async deleteUser(id) {
        const user = await User.findByPk(id);
        if (!user) return false;
        await user.destroy();
        return true;
    }
}

module.exports = new UserService();