import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const email = 'sawanfiver@gmail.com';
const password = 'Supplier@123';
const companyName = 'Fiver Imports';

const existing = await prisma.user.findUnique({ where: { email } });
if (existing) {
  console.log('User already exists, updating...');
  await prisma.user.update({ where: { email }, data: { isActive: true, isEmailVerified: true } });
  const sup = await prisma.supplier.findUnique({ where: { userId: existing.id } });
  if (sup) {
    await prisma.supplier.update({ where: { id: sup.id }, data: { status: 'VERIFIED' } });
  }
  console.log('Updated sawanfiver@gmail.com');
} else {
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hash, role: 'SUPPLIER', isEmailVerified: true, isActive: true }
  });
  await prisma.supplier.create({
    data: {
      userId: user.id, companyName, status: 'VERIFIED',
      address: '123 Market St', city: 'Mumbai', country: 'India',
      gstNumber: 'TESTGST001', panNumber: 'TESTPAN001',
      leadTimeDays: 7, monthlyCapacity: 1000, moq: 10,
      responseTimeHr: 24, workforceSize: 50, yearEstablished: 2020
    }
  });
  console.log('Created sawanfiver@gmail.com as SUPPLIER/VERIFIED');
}

await prisma.$disconnect();
