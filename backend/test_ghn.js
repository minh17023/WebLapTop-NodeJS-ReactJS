const axios = require('axios');
require('dotenv').config();

const token = process.env.GHN_TOKEN;
console.log("GHN_TOKEN:", token);

async function testDev() {
    const GHN_API_URL = 'https://dev-online-gateway.ghn.vn/shiip/public-api';
    try {
        console.log("\n--- TESTING DEV GATEWAY ---");
        const response = await axios.get(`${GHN_API_URL}/master-data/province`, { 
            headers: { 'Token': token } 
        });
        console.log("Dev Gateway Success! Province count:", response.data.data.length);
    } catch (error) {
        console.error("Dev Gateway Failed:", error.message);
        if (error.response) {
            console.error("Dev Response data:", JSON.stringify(error.response.data));
        }
    }
}

async function testProd() {
    const GHN_API_URL = 'https://online-gateway.ghn.vn/shiip/public-api';
    try {
        console.log("\n--- TESTING PRODUCTION GATEWAY ---");
        const response = await axios.get(`${GHN_API_URL}/master-data/province`, { 
            headers: { 'Token': token } 
        });
        console.log("Production Gateway Success! Province count:", response.data.data.length);
    } catch (error) {
        console.error("Production Gateway Failed:", error.message);
        if (error.response) {
            console.error("Production Response data:", JSON.stringify(error.response.data));
        }
    }
}

async function run() {
    await testDev();
    await testProd();
}

run();
