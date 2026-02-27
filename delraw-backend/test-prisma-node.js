const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const fs = require('fs');

async function main() {
    const url = process.env.DATABASE_URL;
    const results = {};

    // Attempt 1: datasourceUrl
    try {
        console.log('Testing datasourceUrl...');
        const prisma = new PrismaClient({ datasourceUrl: url });
        await prisma.$connect();
        results.datasourceUrl = { success: true };
        await prisma.$disconnect();
    } catch (e) {
        results.datasourceUrl = { success: false, error: e.message };
    }

    // Attempt 2: datasources
    try {
        console.log('Testing datasources...');
        const prisma = new PrismaClient({ datasources: { db: { url: url } } });
        await prisma.$connect();
        results.datasources = { success: true };
        await prisma.$disconnect();
    } catch (e) {
        results.datasources = { success: false, error: e.message };
    }

    // Attempt 3: empty
    try {
        console.log('Testing empty...');
        const prisma = new PrismaClient();
        await prisma.$connect();
        results.empty = { success: true };
        await prisma.$disconnect();
    } catch (e) {
        results.empty = { success: false, error: e.message };
    }

    fs.writeFileSync('result.json', JSON.stringify(results, null, 2));
}

main().catch(console.error);
