import api from './api';

export const orderService = {
    create: async (data) => {
        const response = await api.post('/orders', data);
        return response.data;
    },
    getMyOrders: async (page = 1, limit = 10) => {
        const response = await api.get(`/orders/my-orders?page=${page}&limit=${limit}`);
        return response.data;
    },
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

    getAll: async (page = 1, limit = 10) => {
        const response = await api.get(`/orders?page=${page}&limit=${limit}`);
        return response.data;
    },
    search: async (keyword) => {
        const response = await api.get(`/orders/search?q=${keyword}`);
        return response.data;
    },
    updateStatus: async (id, status) => {
        const response = await api.put(`/orders/${id}/status`, { status });
        return response.data;
    },
    getDashboardStats: async (startDate, endDate) => {
        const response = await api.get(`/orders/dashboard/stats?startDate=${startDate}&endDate=${endDate}`);
        return response.data;
    },
    getDashboardRevenueChart: async (startDate, endDate) => {
        const response = await api.get(`/orders/dashboard/revenue-chart?startDate=${startDate}&endDate=${endDate}`);
        return response.data;
    },
    exportInvoice: async (id) => {
        const response = await api.get(`/orders/${id}/invoice`, {
            responseType: 'blob'
        });
        return response.data;
    }
};