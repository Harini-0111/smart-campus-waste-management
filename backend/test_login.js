const axios = require('axios');

(async () => {
    try {
        const response = await axios.post('http://localhost:3001/api/v1/auth/login', {
            username: 'supervisor1',
            password: 'password123'
        });
        console.log('✅ Login successful!');
        console.log('Token:', response.data.token.substring(0, 20) + '...');
        console.log('User:', response.data.user);
    } catch (error) {
        console.log('❌ Login failed');
        console.log('Status:', error.response?.status);
        console.log('Error:', error.response?.data || error.message);
    }
})();
