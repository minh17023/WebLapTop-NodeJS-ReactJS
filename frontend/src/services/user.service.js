import api from './api';

export const userService = {
    // ==========================================
    // 1. CÁC API DÀNH CHO USER (TRANG PROFILE CÁ NHÂN)
    // ==========================================
    
    // Lấy thông tin chi tiết từ DB
    getProfile: async (id) => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },

    // Cập nhật thông tin cá nhân
    updateProfile: async (id, data) => {
        const response = await api.put(`/users/${id}`, data);
        return response.data;
    },

    // ==========================================
    // 2. CÁC API DÀNH CHO ADMIN (TRANG MANAGE USERS)
    // ==========================================

    // Lấy toàn bộ danh sách người dùng
    getAll: async (page = 1, limit = 10) => {
        const response = await api.get(`/users?page=${page}&limit=${limit}`);
        return response.data;
    },

    // Tìm kiếm người dùng theo tên hoặc email
    search: async (keyword) => {
        const response = await api.get(`/users/search?q=${keyword}`);
        return response.data;
    },

    // Thêm mới tài khoản (Chỉ Admin)
    create: async (data) => {
        const response = await api.post('/users', data);
        return response.data;
    },

    // Cập nhật tài khoản (Chỉ Admin - Có thể dùng chung route với updateProfile)
    update: async (id, data) => {
        const response = await api.put(`/users/${id}`, data);
        return response.data;
    },

    // Xóa tài khoản
    delete: async (id) => {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    }
};