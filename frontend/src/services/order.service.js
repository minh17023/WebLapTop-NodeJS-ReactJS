import api from './api';

export const orderService = {
    // 1. DÀNH CHO KHÁCH HÀNG
    create: async (data) => {
        const response = await api.post('/orders', data);
        return response.data;
    },
    getMyOrders: async () => {
        const response = await api.get('/orders/my-orders');
        return response.data;
    },
    // User tự cập nhật trạng thái đơn hàng (Hủy đơn / Đã nhận hàng)
    userUpdateStatus: async (id, status) => {
        const response = await api.put(`/orders/${id}/user-status`, { status });
        return response.data;
    },
    updatePaymentStatus: async (id, paymentStatus) => {
        const response = await api.put(`/orders/${id}/payment-status`, { payment_status: paymentStatus });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/orders/${id}`);
        return response.data;
    },

    // 2. DÀNH CHO ADMIN (Phải có 3 hàm này thì trang ManageOrders mới chạy được)
    getAll: async () => {
        const response = await api.get('/orders');
        return response.data;
    },
    search: async (keyword) => {
        const response = await api.get(`/orders/search?q=${keyword}`);
        return response.data;
    },
    updateStatus: async (id, status) => {
        const response = await api.put(`/orders/${id}/status`, { status });
        return response.data;
    }
};