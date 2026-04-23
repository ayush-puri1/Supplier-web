const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  
  const hashedPassword = await bcrypt.hash('Password123!', 10);
  
  await prisma.user.update({
    where: { email: 'sawanfiver@gmail.com' },
    data: { password: hashedPassword }
  });
  
  await prisma.user.update({
    where: { email: 'sawanpuri011@gmail.com' },
    data: { password: hashedPassword }
  });
  
  console.log(`Updated passwords for sawanfiver@gmail.com and sawanpuri011@gmail.com to Password123!`);
  
  await prisma.$disconnect();
  await pool.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
