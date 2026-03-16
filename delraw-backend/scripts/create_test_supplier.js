
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
    const email = 'test_supplier@delraw.com';
    const password = await bcrypt.hash('Password@123', 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            password,
            role: 'SUPPLIER',
            supplier: {
                create: {
                    companyName: 'Test Corp',
                    gstNumber: '22AAAAA0000A1Z5',
                    address: '123 Testing Lane',
                    city: 'Testville',
                    country: 'Testland',
                    yearEstablished: 2020,
                    workforceSize: 10,
                    monthlyCapacity: 1000,
                    moq: 100,
                    leadTimeDays: 7,
                    responseTimeHr: 24
                }
            }
        },
        include: { supplier: true }
    });

    console.log('Supplier user ready:', user.email);
    console.log('Supplier ID:', user.supplier.id);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
