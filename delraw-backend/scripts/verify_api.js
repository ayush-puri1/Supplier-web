
const API_URL = 'http://localhost:5000';

async function test() {
    console.log('--- STARTING COMPREHENSIVE BACKEND TEST ---');

    const credentials = {
        super: { email: 'superadmin@delraw.com', password: 'Password@123' },
        supplier: { email: 'test_supplier@delraw.com', password: 'Password@123', companyName: 'Test Corp' }
    };

    let superToken, supplierToken;

    // 1. Super Admin Login
    console.log('\n[1] testing Super Admin Login...');
    const superLoginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials.super)
    });
    const superLoginData = await superLoginRes.json();
    if (superLoginData.access_token) {
        superToken = superLoginData.access_token;
        console.log('✅ Super Admin Logged In');
    } else {
        console.error('❌ Super Admin Login Failed', superLoginData);
        return;
    }

    // 2. Test System Config (Super Admin)
    console.log('\n[2] testing System Config (Super Admin)...');
    const configRes = await fetch(`${API_URL}/admin/config`, {
        headers: { 'Authorization': `Bearer ${superToken}` }
    });
    const configData = await configRes.json();
    if (configRes.ok) {
        console.log('✅ System Config Retrieved:', configData.id);

        // Test update
        const updateRes = await fetch(`${API_URL}/admin/config`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${superToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ businessCommission: 15 })
        });
        if (updateRes.ok) console.log('✅ System Config Updated');
        else console.error('❌ System Config Update Failed');
    } else {
        console.error('❌ System Config Retrieval Failed');
    }

    // 3. Supplier Registration
    console.log('\n[3] testing Supplier Registration...');
    const regRes = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials.supplier)
    });
    const regData = await regRes.json();
    if (regRes.ok) {
        supplierToken = regData.access_token;
        console.log('✅ Supplier Registered');
    } else if (regData.message === 'Email already exists') {
        console.log('ℹ️ Supplier already exists, logging in...');
        const logRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: credentials.supplier.email, password: credentials.supplier.password })
        });
        const logData = await logRes.json();
        supplierToken = logData.access_token;
        console.log('✅ Supplier Logged In');
    } else {
        console.error('❌ Supplier Registration Failed', regData);
    }

    // 4. Supplier Profile
    console.log('\n[4] testing Supplier Profile...');
    const profileRes = await fetch(`${API_URL}/supplier/me`, {
        headers: { 'Authorization': `Bearer ${supplierToken}` }
    });
    if (profileRes.ok) {
        const profile = await profileRes.json();
        console.log('✅ Supplier Profile Retrieved:', profile.companyName);

        // Update profile
        const updateProfileRes = await fetch(`${API_URL}/supplier/me`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${supplierToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ workforceSize: 50, city: 'London' })
        });
        if (updateProfileRes.ok) console.log('✅ Supplier Profile Updated');
    }

    // 5. Test Supplier Dashboard
    console.log('\n[5] testing Supplier Dashboard Stats...');
    const dashboardRes = await fetch(`${API_URL}/supplier/dashboard`, {
        headers: { 'Authorization': `Bearer ${supplierToken}` }
    });
    if (dashboardRes.ok) {
        const stats = await dashboardRes.json();
        console.log('✅ Dashboard Data Retrieved (Commission):', stats.commission);
    } else {
        console.error('❌ Dashboard Stats Failed');
    }

    // 6. Test Admin Override (Super Admin acting on Supplier)
    console.log('\n[6] testing Super Admin Supplier Override...');
    const usersRes = await fetch(`${API_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${superToken}` }
    });
    if (!usersRes.ok) {
        console.error('❌ Failed to fetch users', await usersRes.text());
        return;
    }
    const users = await usersRes.json();
    const testUser = users.find(u => u.email === credentials.supplier.email);

    if (!testUser) {
        console.error('❌ Could not find test supplier user in user list');
    } else if (!testUser.supplier) {
        console.error('❌ User found but has no supplier profile linked');
    } else {
        const supplierId = testUser.supplier.id;
        console.log('ℹ️ Found supplier ID:', supplierId);

        const overrideRes = await fetch(`${API_URL}/admin/suppliers/${supplierId}/override`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${superToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'VERIFIED', trustScore: 95 })
        });
        if (overrideRes.ok) console.log('✅ Supplier Overridden to VERIFIED');
        else console.error('❌ Supplier Override Failed', await overrideRes.text());
    }

    // 7. Test Product Flow
    console.log('\n[7] testing Product Lifecycle...');
    const createProductRes = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${supplierToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: 'Eco-Friendly T-Shirt',
            description: '100% Organic Cotton',
            price: 499,
            moq: 100,
            category: 'Apparel'
        })
    });
    if (createProductRes.ok) {
        const product = await createProductRes.json();
        console.log('✅ Product Created:', product.name);

        const productId = product.id;
        // Approve as Super Admin
        const approveRes = await fetch(`${API_URL}/admin/products/${productId}/status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${superToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'LIVE' })
        });
        if (approveRes.ok) console.log('✅ Product Approved to LIVE');
        else console.error('❌ Product Approval Failed', await approveRes.text());
    } else {
        console.error('❌ Product Creation Failed', await createProductRes.text());
    }

    console.log('\n--- COMPREHENSIVE TEST FINISHED ---');
}

test();
