import api from './api';

export const shippingService = {
    // 1. Lấy danh sách Tỉnh/Thành phố
    getProvinces: async () => {
        const response = await api.get('/shipping/provinces');
        return response.data;
    },

    // 2. Lấy danh sách Quận/Huyện theo ID Tỉnh
    getDistricts: async (provinceId) => {
        const response = await api.get(`/shipping/districts/${provinceId}`);
        return response.data;
    },

    // 3. Lấy danh sách Phường/Xã theo ID Quận
    getWards: async (districtId) => {
        const response = await api.get(`/shipping/wards/${districtId}`);
        return response.data;
    },

    // 4. Tính phí vận chuyển
    calculateFee: async (districtId, wardCode) => {
        const response = await api.post('/shipping/fee', { districtId, wardCode });
        return response.data;
    }
};