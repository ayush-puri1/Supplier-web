const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const users = await prisma.user.findMany({
      include: {
        supplier: true,
        sessions: true,
      }
    });

    console.log('--- USER DATA DEEP DIVE ---');
    users.forEach(u => {
        console.log(`User: ${u.email} | Role: ${u.role} | Verified: ${u.isEmailVerified}`);
        console.log(`  Last Login: ${u.lastLoginAt}`);
        console.log(`  Refresh Token Hash: ${u.refreshTokenHash ? 'PRESENT' : 'MISSING'}`);
        console.log(`  Sessions Count: ${u.sessions.length}`);
        if (u.supplier) {
            console.log(`  Supplier: ${u.supplier.companyName} | Status: ${u.supplier.status}`);
        }
        console.log('---------------------------');
    });

  } catch (error) {
    console.error('Query failed:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
