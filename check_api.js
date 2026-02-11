// Native fetch is available in Node.js 18+

// If running in Node 18+, fetch is global. If < 18, install node-fetch
// For this script we assume native fetch or we can use http module, but fetch is easier.
// Since we initialized with npm init -y, we might not have 'type': 'module'.
// safe way is using dynamic import or assuming node 18.
// User said "Backend use Node.js".

const BASE_URL = 'http://localhost:3000/api';

async function testBackend() {
    console.log('Starting Backend Verification...');

    // 1. Signup
    console.log('\n--- Testing Signup ---');
    const timestamp = Date.now();
    const user = {
        name: `Test User ${timestamp}`,
        email: `test${timestamp}@example.com`,
        password: 'password123',
        role: 'Faculty'
    };

    let token = '';

    try {
        const signupRes = await fetch(`${BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });

        const signupData = await signupRes.json();
        console.log('Signup Status:', signupRes.status);
        if (signupRes.ok) {
            console.log('Signup Success:', signupData.email);
        } else {
            console.error('Signup Failed:', signupData);
            return;
        }

        // 2. Login
        console.log('\n--- Testing Login ---');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, password: user.password })
        });

        const loginData = await loginRes.json();
        console.log('Login Status:', loginRes.status);
        if (loginRes.ok) {
            console.log('Login Success. Token received.');
            token = loginData.token;
        } else {
            console.error('Login Failed:', loginData);
            return;
        }

        // 3. Profile
        console.log('\n--- Testing Profile Fetch ---');
        const profileRes = await fetch(`${BASE_URL}/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const profileData = await profileRes.json();
        console.log('Profile Status:', profileRes.status);
        if (profileRes.ok) {
            console.log('Profile Fetched:', profileData.name);
        } else {
            console.error('Profile Fetch Failed:', profileData);
        }

        // 4. Update Profile
        console.log('\n--- Testing Profile Update ---');
        const updateRes = await fetch(`${BASE_URL}/profile/update`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                profileData: { phone: '1234567890' },
                profileComplete: 50
            })
        });
        const updateData = await updateRes.json();
        console.log('Update Status:', updateRes.status);
        if (updateRes.ok) {
            console.log('Profile Updated. Phone:', updateData.profileData.phone);
        }

    } catch (error) {
        console.error('Verification Error:', error.message);
    }
}

testBackend();
