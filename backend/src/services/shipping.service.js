const axios = require('axios');

const GHN_API_URL = 'https://dev-online-gateway.ghn.vn/shiip/public-api';

class GHNService {
    constructor() {
        this.headers = {
            'Token': process.env.GHN_TOKEN
        };
    }

    // 1. Lấy danh sách Tỉnh/Thành phố
    async getProvinces() {
        try {
            const response = await axios.get(`${GHN_API_URL}/master-data/province`, { headers: this.headers });
            return response.data.data;
        } catch (error) {
            console.error("Lỗi lấy Tỉnh/Thành phố GHN:", error.message);
            throw new Error("Không thể lấy dữ liệu Tỉnh/Thành phố");
        }
    }

    // 2. Lấy danh sách Quận/Huyện dựa vào Tỉnh
    async getDistricts(provinceId) {
        try {
            const response = await axios.post(`${GHN_API_URL}/master-data/district`, 
                { province_id: parseInt(provinceId) }, 
                { headers: this.headers }
            );
            return response.data.data;
        } catch (error) {
            console.error("Lỗi lấy Quận/Huyện GHN:", error.message);
            throw new Error("Không thể lấy dữ liệu Quận/Huyện");
        }
    }

    // 3. Lấy danh sách Phường/Xã dựa vào Quận
    async getWards(districtId) {
        try {
            const response = await axios.post(`${GHN_API_URL}/master-data/ward`, 
                { district_id: parseInt(districtId) }, 
                { headers: this.headers }
            );
            return response.data.data;
        } catch (error) {
            console.error("Lỗi lấy Phường/Xã GHN:", error.message);
            throw new Error("Không thể lấy dữ liệu Phường/Xã");
        }
    }

    // 4. Tính phí vận chuyển (Gọi lúc khách chọn xong địa chỉ ở giỏ hàng)
    async calculateFee(districtId, wardCode, weight = 2000) {
        try {
            const response = await axios.post(`${GHN_API_URL}/v2/shipping-order/fee`, {
                service_type_id: 2, // 2: Đường bộ
                to_district_id: parseInt(districtId),
                to_ward_code: wardCode,
                weight: weight
            }, {
                headers: { 
                    ...this.headers,
                    'ShopId': process.env.GHN_SHOP_ID 
                }
            });
            return response.data.data.total; 
        } catch (error) {
            console.error("Lỗi tính tiền ship GHN:", error.message);
            return 30000; // Mặc định 30k nếu lỗi API
        }
    }

    // 5. TẠO VẬN ĐƠN SANG GHN (LẤY MÃ TRACKING)
    async createShippingOrder(orderInfo) {
        try {
            const response = await axios.post(`${GHN_API_URL}/v2/shipping-order/create`, {
                service_type_id: 2,
                payment_type_id: 1, // 1: Shop trả phí ship (Vì đã thu tổng tiền của khách rồi)
                note: orderInfo.note || "Hàng điện tử giá trị cao, xin nhẹ tay!",
                required_note: "CHOXEMHANGKHONGTHU", // Luật bắt buộc của GHN
                to_name: orderInfo.customer_name,
                to_phone: orderInfo.customer_phone,
                to_address: orderInfo.shipping_address,
                to_ward_code: orderInfo.ward_code,
                to_district_id: parseInt(orderInfo.district_id),
                // Nhận thông số động từ orderInfo
                weight: orderInfo.weight ? parseInt(orderInfo.weight) : 2000,
                length: orderInfo.length ? parseInt(orderInfo.length) : 35,
                width: orderInfo.width ? parseInt(orderInfo.width) : 25,
                height: orderInfo.height ? parseInt(orderInfo.height) : 10,
                items: orderInfo.items, // Danh sách sản phẩm GHN yêu cầu format: [{name, quantity, weight}]
                cod_amount: parseInt(orderInfo.cod_amount) || 0,
                insurance_value: orderInfo.insurance_value ? parseInt(orderInfo.insurance_value) : 0 
            }, {
                headers: { 
                    ...this.headers,
                    'ShopId': process.env.GHN_SHOP_ID 
                }
            });

            // Trả về Mã vận đơn (Ví dụ: GWH123456)
            return response.data.data.order_code; 
        } catch (error) {
            console.error("Lỗi tạo vận đơn GHN:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || "Không thể đẩy đơn sang Giao Hàng Nhanh");
        }
    }
}

module.exports = new GHNService();