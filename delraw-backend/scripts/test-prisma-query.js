
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
                supplier: {
                    select: { companyName: true, status: true },
                },
            },
        });
        console.log('✅ Successfully fetched users:', users.length);
        console.log('First user sample:', JSON.stringify(users[0], null, 2));
    } catch (err) {
        console.error('❌ Prisma Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
