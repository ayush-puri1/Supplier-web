import { PrismaClient } from '@prisma/client';

async function main() {
    console.log('Instantiating PrismaClient with log options...');
    try {
        const prisma = new PrismaClient({
            log: ['query'],
        });
        console.log('Connecting...');
        await prisma.$connect();
        console.log('Connected successfully!');
        await prisma.$disconnect();
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

main();
