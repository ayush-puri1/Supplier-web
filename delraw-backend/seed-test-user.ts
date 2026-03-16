
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function seed() {
    const prisma = new PrismaClient();
    try {
        const email = 'superadmin@delraw.com';
        const password = 'admin123';
        const hash = await bcrypt.hash(password, 10);

        const user = await prisma.user.upsert({
            where: { email },
            update: { password: hash, isActive: true, role: 'SUPER_ADMIN' },
            create: {
                email,
                password: hash,
                role: 'SUPER_ADMIN',
                isActive: true,
                isEmailVerified: true
            }
        });

        console.log('✅ Test Super Admin seeded:', user.email);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
