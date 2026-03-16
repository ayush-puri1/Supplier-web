
async function verifyLogout() {
    const API_URL = 'http://localhost:5000';
    const testEmail = 'superadmin@delraw.com'; 
    const testPass = 'admin123'; 

    console.log('--- JWT Revocation Verification ---');

    try {
        // 1. LOGIN
        console.log('1. Attempting login...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testEmail, password: testPass })
        });

        if (!loginRes.ok) {
            const errData = await loginRes.json();
            throw new Error(`Login failed: ${JSON.stringify(errData)}`);
        }

        const loginData: any = await loginRes.json();
        const token = loginData.access_token;
        console.log('✅ Login successful. Token acquired.');

        // 2. ACCESS PROTECTED ROUTE
        console.log('\n2. Accessing protected /admin/stats...');
        const statsRes = await fetch(`${API_URL}/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (statsRes.ok) {
            console.log('✅ Access granted. Status:', statsRes.status);
        } else {
            console.log('❌ Access denied. Status:', statsRes.status);
            return;
        }

        // 3. LOGOUT
        console.log('\n3. Calling /auth/logout...');
        const logoutRes = await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const logoutData: any = await logoutRes.json();
        console.log('✅ Logout API response:', logoutData.message);

        // 4. VERIFY REJECTION
        console.log('\n4. Accessing protected /admin/stats again with OLD token...');
        const verifyRes = await fetch(`${API_URL}/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (verifyRes.status === 401) {
            const verifyData: any = await verifyRes.json();
            console.log('✅ SUCCESS: Access denied (401 Unauthorized). Token Successfully Revoked!');
            console.log('Reason:', verifyData.message);
        } else if (verifyRes.ok) {
            console.log('❌ ERROR: Access still granted! Token was not revoked.');
        } else {
            console.log('❓ Unexpected status:', verifyRes.status);
        }

    } catch (err: any) {
        console.error('❌ Verification failed early:', err.message);
        console.log('\nNote: Make sure the backend dev server is running on port 5000 and the test user exists.');
    }
}

verifyLogout();
