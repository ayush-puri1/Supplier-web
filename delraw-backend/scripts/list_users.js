const { PrismaClient } = require('../node_modules/@prisma/client');
require('dotenv').config();

async function main() {
  const prisma = new PrismaClient();
  
  try {
    // List all users
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true, isActive: true },
      take: 20,
    });
    
    console.log('\n=== All Users ===');
    users.forEach(u => {
      console.log(`  ${u.email}  |  Role: ${u.role}  |  Active: ${u.isActive}  |  ID: ${u.id}`);
    });
    console.log(`\nTotal: ${users.length} users\n`);
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
