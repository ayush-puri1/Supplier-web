
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

async function main() {
  console.log('Testing Supabase Connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL);

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.$connect();
    console.log('✅ Successfully connected to Supabase PostgreSQL!');

    const userCount = await prisma.user.count();
    const supplierCount = await prisma.supplier.count();
    const productCount = await prisma.product.count();
    const orderCount = await prisma.order.count();

    console.log('\n--- Data Migration Status ---');
    console.log(`Users: ${userCount}`);
    console.log(`Suppliers: ${supplierCount}`);
    console.log(`Products: ${productCount}`);
    console.log(`Orders: ${orderCount}`);

    if (userCount > 0) {
      const superAdmin = await prisma.user.findFirst({
        where: { role: 'SUPER_ADMIN' }
      });
      console.log(`\nSuper Admin found: ${superAdmin ? 'Yes (' + superAdmin.email + ')' : 'No'}`);
    }

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
