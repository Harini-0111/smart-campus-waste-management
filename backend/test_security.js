const axios = require('axios');

async function testSecurity() {
    const baseUrl = 'http://localhost:3001/api/v1';
    console.log('🔒 Testing Security & RBAC...');

    let adminToken = '';
    let studentToken = '';

    // 1. Get Tokens
    try {
        const adminLogin = await axios.post(`${baseUrl}/auth/login`, { username: 'admin', password: 'password123' });
        adminToken = adminLogin.data.token;
        console.log('✅ Got Admin Token');

        const studentLogin = await axios.post(`${baseUrl}/auth/login`, { username: 'student1', password: 'password123' });
        studentToken = studentLogin.data.token;
        console.log('✅ Got Student Token');
    } catch (err) {
        console.error('❌ Login Failed:', err.message);
        process.exit(1);
    }

    // 2. Test Unprotected Route (Locations)
    try {
        await axios.get(`${baseUrl}/locations`);
        console.log('✅ Public Route (Locations) Accessible');
    } catch (err) {
        console.error('❌ Public Route Failed:', err.message);
    }

    // 3. Test Protected Route without Token (Waste)
    try {
        await axios.post(`${baseUrl}/waste`, { location_id: 'LOC001', waste_type: 'Wet', quantity_kg: 5 });
        console.error('❌ Protected Route (No Token) SHOULD FAIL but succeeded');
    } catch (err) {
        if (err.response && err.response.status === 401) {
            console.log('✅ Protected Route (No Token) Blocked correctly (401)');
        } else {
            console.error('❌ Protected Route Failed with unexpected error:', err.response ? err.response.status : err.message);
        }
    }

    // 4. Test RBAC: Student accessing Admin Dashboard
    try {
        await axios.get(`${baseUrl}/dashboard`, { headers: { Authorization: `Bearer ${studentToken}` } });
        console.error('❌ Student accessing Admin Dashboard SHOULD FAIL but succeeded');
    } catch (err) {
        if (err.response && err.response.status === 403) {
            console.log('✅ Student -> Admin Dashboard Blocked correctly (403)');
        } else {
            console.error('❌ Student -> Admin Dashboard Failed with unexpected error:', err.response ? err.response.status : err.message);
        }
    }

    // 5. Test RBAC: Admin accessing Admin Dashboard
    try {
        await axios.get(`${baseUrl}/dashboard`, { headers: { Authorization: `Bearer ${adminToken}` } });
        console.log('✅ Admin -> Admin Dashboard Allowed correctly');
    } catch (err) {
        console.error('❌ Admin -> Admin Dashboard Failed:', err.response ? err.response.status : err.message);
    }
}

testSecurity();
