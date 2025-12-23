// const axios = require('axios'); 


// Simple test script using fetch (Node 18+)
async function testAuth() {
    const baseUrl = 'http://localhost:3001/api/v1/auth';

    console.log('🧪 Testing Authentication...');

    try {
        // 1. Login as Super Admin
        console.log('\n[1] Logging in as Admin...');
        const loginRes = await fetch(`${baseUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'password123' })
        });

        const loginData = await loginRes.json();

        if (loginRes.ok) {
            console.log('✅ Admin Login Successful');
            console.log('Token:', loginData.token.substring(0, 20) + '...');
            console.log('Role:', loginData.user.role);
        } else {
            console.error('❌ Admin Login Failed:', loginData);
            process.exit(1);
        }

        // 2. Login as Student
        console.log('\n[2] Logging in as Student...');
        const studentRes = await fetch(`${baseUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'student1', password: 'password123' })
        });

        if (studentRes.ok) {
            console.log('✅ Student Login Successful');
        } else {
            console.error('❌ Student Login Failed');
        }

        // 3. Invalid Login
        console.log('\n[3] Testing Invalid Login...');
        const invalidRes = await fetch(`${baseUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'wrongpassword' })
        });

        if (invalidRes.status === 401) {
            console.log('✅ Invalid Login Blocked (401)');
        } else {
            console.error('❌ Invalid Login SHOULD have failed but got:', invalidRes.status);
        }

    } catch (err) {
        console.error('❌ Test Script Error:', err);
    }
}

testAuth();
