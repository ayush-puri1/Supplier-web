const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

/**
 * Main seeding function to populate the database with initial admin and sample data.
 */
async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Create Super Admin
  const adminEmail = 'superadmin@delraw.com';
  const adminPassword = await bcrypt.hash('Admin@123', 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
        password: adminPassword,
        role: 'SUPER_ADMIN',
        isActive: true,
        isEmailVerified: true,
    },
    create: {
      email: adminEmail,
      password: adminPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
      isEmailVerified: true,
    },
  });
  console.log(`✅ Super Admin created: ${adminEmail} / Admin@123`);

  // 2. Create Sample Suppliers
  const suppliersData = [
    { email: 'supplier1@example.com', name: 'Textile Hub', status: 'VERIFIED' },
    { email: 'supplier2@example.com', name: 'Chemical Corp', status: 'UNDER_REVIEW' },
    { email: 'supplier3@example.com', name: 'Raw Materials Ltd', status: 'SUBMITTED' },
  ];

  for (const s of suppliersData) {
    const hashedPassword = await bcrypt.hash('Supplier@123', 10);
    await prisma.user.upsert({
      where: { email: s.email },
      update: {
          role: 'SUPPLIER',
          isActive: true,
          isEmailVerified: true,
      },
      create: {
        email: s.email,
        password: hashedPassword,
        role: 'SUPPLIER',
        isActive: true,
        isEmailVerified: true,
        supplier: {
          create: {
            companyName: s.name,
            gstNumber: '22AAAAA0000A1Z5',
            address: '123 Business Park',
            city: 'Mumbai',
            country: 'India',
            panNumber: 'ABCDE1234F',
            yearEstablished: 2010,
            workforceSize: 50,
            monthlyCapacity: 10000,
            moq: 100,
            leadTimeDays: 15,
            responseTimeHr: 24,
            status: s.status,
          },
        },
      },
    });
    console.log(`✅ Supplier created: ${s.email} / Supplier@123 (${s.name})`);
  }

  // 3. Create Sample Products for the first supplier
  const supplier1 = await prisma.supplier.findFirst({
    where: { user: { email: 'supplier1@example.com' } },
  });

  if (supplier1) {
    const existingProducts = await prisma.product.count({ where: { supplierId: supplier1.id } });
    
    if (existingProducts === 0) {
        const productsData = [
          {
            name: 'Organic Cotton Fabric',
            category: 'Textiles',
            status: 'LIVE',
            isLive: true,
          },
          {
            name: 'Industrial Polyester',
            category: 'Textiles',
            status: 'PENDING_APPROVAL',
            isLive: false,
          },
        ];

        for (const p of productsData) {
          await prisma.product.create({
            data: {
              name: p.name,
              description: `High quality ${p.name.toLowerCase()} for industrial use.`,
              category: p.category,
              specs: { weight: '200gsm', width: '58 inch' },
              moq: 500,
              leadTime: 20,
              price: 5.5,
              unit: 'meters',
              status: p.status,
              isLive: p.isLive,
              supplierId: supplier1.id,
              variants: {
                create: [
                  { name: 'Red', price: 5.5, stock: 1000 },
                  { name: 'Blue', price: 5.7, stock: 800 },
                ],
              },
            },
          });
        }
        console.log(`✅ Sample products created for ${supplier1.companyName}`);
    } else {
        console.log(`ℹ️ Products already exist for ${supplier1.companyName}, skipping...`);
    }
  }

  console.log('✨ Database seeding successfully complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
