const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  
  const user = await prisma.user.update({
    where: { email: 'sawanfiver@gmail.com' },
    data: { role: 'ADMIN' }
  });
  console.log(`Updated user ${user.email} to role ${user.role}`);
  
  await prisma.$disconnect();
  await pool.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
