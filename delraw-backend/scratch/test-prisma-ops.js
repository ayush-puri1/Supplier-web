const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('Testing Write operation...');
    const newUser = await prisma.user.create({
      data: {
        email: `test_write_${Date.now()}@delraw.com`,
        password: 'dummy_password',
        role: 'SUPPLIER',
      }
    });
    console.log('✅ Write Success! New User ID:', newUser.id);
    
    console.log('Testing Delete operation...');
    await prisma.user.delete({ where: { id: newUser.id } });
    console.log('✅ Delete Success!');

  } catch (error) {
    console.error('❌ Prisma Operation Failed:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
