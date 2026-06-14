const ghnService = require('../services/shipping.service');

class ShippingController {
    async getProvinces(req, res) {
        try {
            const provinces = await ghnService.getProvinces();
            return res.status(200).json({ success: true, data: provinces });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async getDistricts(req, res) {
        try {
            const { provinceId } = req.params;
            const districts = await ghnService.getDistricts(provinceId);
            return res.status(200).json({ success: true, data: districts });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async getWards(req, res) {
        try {
            const { districtId } = req.params;
            const wards = await ghnService.getWards(districtId);
            return res.status(200).json({ success: true, data: wards });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async calculateFee(req, res) {
        try {
            const { districtId, wardCode, weight } = req.body;
            if (!districtId || !wardCode) {
                return res.status(400).json({ success: false, message: "Thiếu thông tin địa chỉ!" });
            }
            
            const fee = await ghnService.calculateFee(districtId, wardCode, weight);
            return res.status(200).json({ success: true, fee: fee });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new ShippingController();