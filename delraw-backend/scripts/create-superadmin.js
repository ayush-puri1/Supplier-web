
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    const email = 'superadmin@delraw.com';
    const password = 'Password@123';
    const hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: { role: 'SUPER_ADMIN', isActive: true },
        create: {
            email,
            password: hash,
            role: 'SUPER_ADMIN',
            isActive: true,
        },
    });

    console.log('Super Admin ensuring exists:', user.email);
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
