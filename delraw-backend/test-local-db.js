
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

async function main() {
  console.log('Testing Local Connection...');
  const localUrl = 'postgresql://postgres:postgres@127.0.0.1:5432/delraw?schema=public';
  console.log('Local URL:', localUrl);

  const pool = new Pool({ connectionString: localUrl });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.$connect();
    console.log('✅ Successfully connected to Local PostgreSQL!');

    const userCount = await prisma.user.count();
    const supplierCount = await prisma.supplier.count();
    const productCount = await prisma.product.count();

    console.log('\n--- Local Data Status ---');
    console.log(`Users: ${userCount}`);
    console.log(`Suppliers: ${supplierCount}`);
    console.log(`Products: ${productCount}`);

  } catch (error) {
    console.error('❌ Local connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
