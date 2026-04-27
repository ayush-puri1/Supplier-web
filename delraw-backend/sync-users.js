
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 10);
  
  const usersToSync = [
    { email: 'sawanpuri9907@gmail.com', role: 'SUPER_ADMIN' },
    { email: 'sawanpuri011@gmail.com', role: 'ADMIN' },
    { email: 'sawanfiver@gmail.com', role: 'SUPPLIER', companyName: 'Delraw' }
  ];

  for (const u of usersToSync) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { 
        role: u.role, 
        password: passwordHash,
        isEmailVerified: true 
      },
      create: {
        email: u.email,
        password: passwordHash,
        role: u.role,
        isEmailVerified: true
      }
    });
    console.log(`Synced user: ${user.email} as ${user.role}`);
    
    // If supplier, ensure profile exists with all required fields
    if (u.role === 'SUPPLIER') {
      await prisma.supplier.upsert({
        where: { userId: user.id },
        update: { companyName: u.companyName },
        create: {
          userId: user.id,
          companyName: u.companyName,
          address: 'Default Address',
          city: 'Default City',
          country: 'India',
          gstNumber: '22AAAAA0000A1Z5', // Dummy GST
          panNumber: 'ABCDE1234F',      // Dummy PAN
          leadTimeDays: 7,
          monthlyCapacity: 1000,
          moq: 1,
          workforceSize: 10,
          yearEstablished: 2024,
          responseTimeHr: 24,
          status: 'VERIFIED'
        }
      });
      console.log(`Ensured supplier profile for: ${user.email}`);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
