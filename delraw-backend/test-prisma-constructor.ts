import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
    const url = process.env.DATABASE_URL;
    try {
        const prisma1 = new PrismaClient({ datasourceUrl: url } as any);
        await prisma1.$connect();
        console.log('SUCCESS:datasourceUrl');
        await prisma1.$disconnect();
        return;
    } catch (e: any) {
        console.log('FAIL:datasourceUrl:', e.message?.split('\n')[0]);
    }

    try {
        const prisma2 = new PrismaClient({ datasources: { db: { url } } } as any);
        await prisma2.$connect();
        console.log('SUCCESS:datasources');
        await prisma2.$disconnect();
        return;
    } catch (e: any) {
        console.log('FAIL:datasources:', e.message?.split('\n')[0]);
    }

    try {
        const prisma3 = new PrismaClient({ log: ['info'] });
        await prisma3.$connect();
        console.log('SUCCESS:log');
        await prisma3.$disconnect();
        return;
    } catch (e: any) {
        console.log('FAIL:log:', e.message?.split('\n')[0]);
    }
}

main();
