require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Production seed — creates ONLY the essential platform bootstrap records:
 * 1. Super Admin user account
 * 2. System configuration singleton
 *
 * NO fake suppliers, NO mock products, NO test data.
 * Real suppliers register through the onboarding flow.
 */
async function main() {
  console.log('🌱 Starting database seed...\n');

  // ── 1. Super Admin ──────────────────────────────────────────────
  const adminEmail = 'superadmin@delraw.com';
  const adminPassword = await bcrypt.hash('Admin@123', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: adminPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
      isEmailVerified: true,
      adminPermissions: [
        'MANAGE_SUPPLIERS',
        'MANAGE_PRODUCTS',
        'MANAGE_ADMINS',
        'MANAGE_CONFIG',
        'VIEW_ANALYTICS',
        'VIEW_AUDIT_LOGS',
      ],
    },
    create: {
      email: adminEmail,
      password: adminPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
      isEmailVerified: true,
      adminPermissions: [
        'MANAGE_SUPPLIERS',
        'MANAGE_PRODUCTS',
        'MANAGE_ADMINS',
        'MANAGE_CONFIG',
        'VIEW_ANALYTICS',
        'VIEW_AUDIT_LOGS',
      ],
    },
  });
  console.log(`✅ Super Admin ready`);
  console.log(`   Email    : ${adminEmail}`);
  console.log(`   Password : Admin@123`);
  console.log(`   Role     : SUPER_ADMIN\n`);

  // ── 2. Supplier profile for Super Admin (needed for portal access) ──
  const existingSupplierProfile = await prisma.supplier.findUnique({
    where: { userId: superAdmin.id },
  });
  if (!existingSupplierProfile) {
    await prisma.supplier.create({
      data: {
        userId: superAdmin.id,
        companyName: 'Delraw Platform',
        gstNumber: 'PLATFORM0000000',
        panNumber: 'PLATFORM000P',
        address: 'Platform HQ',
        city: 'New Delhi',
        country: 'India',
        yearEstablished: 2024,
        workforceSize: 1,
        monthlyCapacity: 0,
        moq: 0,
        leadTimeDays: 0,
        responseTimeHr: 0,
        status: 'VERIFIED',
      },
    });
    console.log(`✅ Supplier profile linked to Super Admin\n`);
  } else {
    console.log(`ℹ️  Supplier profile already exists for Super Admin\n`);
  }

  // ── 3. System Config singleton ──────────────────────────────────
  await prisma.systemConfig.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      isMaintenanceMode: false,
      minTrustScore: 30,
      defaultTrustScore: 50,
      maxFailedLogins: 5,
      defaultSupplierStatus: 'DRAFT',
      onboardingEnabled: true,
      productPublishing: true,
      businessCommission: 10.0,
      allowNewRegistrations: true,
      maxProductsPerSupplier: 50,
      platformName: 'Delraw',
      supplierAutoApprove: false,
      supportEmail: 'support@delraw.com',
    },
  });
  console.log(`✅ System config initialized`);
  console.log(`   Commission         : 10%`);
  console.log(`   Max products/supplier: 50`);
  console.log(`   Registrations open : yes`);
  console.log(`   Onboarding enabled : yes\n`);

  console.log('✨ Seed complete — platform is ready.\n');
  console.log('─────────────────────────────────────────────');
  console.log('  Login at http://localhost:3000/login');
  console.log(`  Email    : ${adminEmail}`);
  console.log(`  Password : Admin@123`);
  console.log('─────────────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
