
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

async function verify() {
    const prisma = new PrismaClient();
    const email = 'superadmin@delraw.com';
    
    try {
        console.log('--- 1. Verification Start ---');
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.error('Test user not found. Please run seed-test-user.ts first.');
            return;
        }

        const userId = user.id;
        console.log('User found:', email, 'ID:', userId);

        // --- 2. Simulate Token Generation ---
        console.log('\n--- 2. Simulating Token Generation ---');
        const rawRefreshToken = `${userId}.${uuidv4()}-${uuidv4()}`;
        console.log('Raw Refresh Token (sent to client):', rawRefreshToken);

        const refreshTokenHash = await bcrypt.hash(rawRefreshToken, 10);
        const refreshTokenExpiresAt = new Date();
        refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 7);

        await prisma.user.update({
            where: { id: userId },
            data: {
                refreshTokenHash,
                refreshTokenExpiresAt,
            },
        });
        console.log('Hash stored in DB.');

        // --- 3. Verify Database State ---
        const updatedUser = await prisma.user.findUnique({ where: { id: userId } });
        console.log('Stored Hash starts with:', updatedUser?.refreshTokenHash?.substring(0, 7));
        if (updatedUser?.refreshTokenHash?.startsWith('$2b$')) {
            console.log('✅ Hash format is correct (bcrypt).');
        } else {
            console.error('❌ Hash format is incorrect!');
        }

        // --- 4. Verify Validation (Refresh) ---
        console.log('\n--- 4. Verifying Refresh Logic ---');
        const [extractedUserId] = rawRefreshToken.split('.');
        console.log('Extracted UserId from token:', extractedUserId);
        
        if (extractedUserId !== userId) {
            console.error('❌ Extraction failed!');
        } else {
            console.log('✅ Extraction successful.');
        }

        const isValid = await bcrypt.compare(rawRefreshToken, updatedUser?.refreshTokenHash || '');
        if (isValid) {
            console.log('✅ Token comparison successful.');
        } else {
            console.error('❌ Token comparison failed!');
        }

        // --- 5. Verify Logout ---
        console.log('\n--- 5. Verifying Logout ---');
        await prisma.user.update({
            where: { id: userId },
            data: {
                refreshTokenHash: null,
                refreshTokenExpiresAt: null,
            },
        });
        const loggedOutUser = await prisma.user.findUnique({ where: { id: userId } });
        if (loggedOutUser?.refreshTokenHash === null) {
            console.log('✅ Logout successful (hash cleared).');
        } else {
            console.error('❌ Logout failed (hash not cleared)!');
        }

        console.log('\n--- Verification Complete ---');
    } catch (err) {
        console.error('❌ Verification Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

verify();
