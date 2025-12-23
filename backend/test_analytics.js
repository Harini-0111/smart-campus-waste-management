const axios = require('axios');

async function verifyAnalytics() {
    console.log('🔍 Verifying Analytics & ML API...');
    try {
        // 1. Login
        const loginRes = await axios.post('http://localhost:3001/api/v1/auth/login', {
            username: 'admin',
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log('✅ Login successful');

        // 2. Get Prediction
        const predRes = await axios.get('http://localhost:3001/api/v1/analytics/prediction', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('📊 Prediction Results:', JSON.stringify(predRes.data, null, 2));

        if (predRes.data.prediction && predRes.data.risk) {
            console.log('✅ Analytics API is working and returning ML data.');
        } else {
            console.log('❌ Unexpected response format.');
        }

    } catch (err) {
        console.error('❌ Verification failed:', err.response?.data || err.message);
    }
}

verifyAnalytics();
