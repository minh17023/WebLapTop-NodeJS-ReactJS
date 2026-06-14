import api from './api';

export const shippingService = {
    getProvinces: async () => {
        const response = await api.get('/shipping/provinces');
        return response.data;
    },

    getDistricts: async (provinceId) => {
        const response = await api.get(`/shipping/districts/${provinceId}`);
        return response.data;
    },

    getWards: async (districtId) => {
        const response = await api.get(`/shipping/wards/${districtId}`);
        return response.data;
    },

    calculateFee: async (districtId, wardCode, weight) => {
        const response = await api.post('/shipping/fee', { districtId, wardCode, weight });
        return response.data;
    }
};