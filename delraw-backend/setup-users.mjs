import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const API_URL = 'http://localhost:5000';

async function registerUser(email, password, companyName, role) {
  console.log(`\n--- Registering ${email} as ${role} ---`);
  try {
    // 1. Send OTP (triggers user creation in DB)
    console.log('Sending OTP...');
    const sendRes = await fetch(`${API_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!sendRes.ok) {
      const errText = await sendRes.text();
      console.warn(`  sendOtp result: ${errText.slice(0, 120)}`);
    }

    // 2. Verify using bypass OTP '000000' (DEV_BYPASS_OTP=true in .env)
    console.log('Verifying with bypass OTP 000000...');
    const verifyRes = await fetch(`${API_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp: '000000', password, companyName })
    });
    if (!verifyRes.ok) {
      const errText = await verifyRes.text();
      console.warn(`  verifyOtp result: ${errText.slice(0, 120)}`);
    } else {
      console.log('OTP verified.');
    }

    // 3. Update role and supplier status directly in DB
    const userDb = await prisma.user.findUnique({ where: { email } });
    if (!userDb) throw new Error('User not found in DB');

    if (role !== 'SUPPLIER') {
      console.log(`Updating role to ${role}...`);
      await prisma.user.update({
        where: { email },
        data: { role, isActive: true, isEmailVerified: true }
      });
    } else {
      await prisma.user.update({ where: { email }, data: { isEmailVerified: true, isActive: true } });
      const supplier = await prisma.supplier.findUnique({ where: { userId: userDb.id } });
      if (supplier) {
        console.log('Setting supplier status to VERIFIED...');
        await prisma.supplier.update({ where: { id: supplier.id }, data: { status: 'VERIFIED' } });
      } else {
        console.warn('  No supplier profile found for this user.');
      }
    }

    console.log(`✅ Done: ${email} → ${role}`);
  } catch (err) {
    console.error(`❌ Failed: ${email}:`, err.message);
  }
}

async function main() {
  const users = [
    { email: 'sawanpuri9907@gmail.com', pass: 'Admin@123',    company: 'Delraw Super',  role: 'SUPER_ADMIN' },
    { email: 'ayush.delraw@gmail.com',  pass: 'Admin@123',    company: 'Delraw Admin',  role: 'ADMIN' },
    { email: 'sawanpuri011@gmail.com',  pass: 'Supplier@123', company: 'Puri Suppliers', role: 'SUPPLIER' },
    { email: 'sawanfiver@gmail.com',    pass: 'Supplier@123', company: 'Fiver Imports',  role: 'SUPPLIER' },
  ];

  for (const u of users) {
    await registerUser(u.email, u.pass, u.company, u.role);
  }

  // Print summary
  console.log('\n=== DB State ===');
  const users_db = await prisma.user.findMany({ select: { email: true, role: true, isActive: true, isEmailVerified: true } });
  console.table(users_db);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
