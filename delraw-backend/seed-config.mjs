import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Ensure SystemConfig singleton exists (required for product creation)
const cfg = await prisma.systemConfig.findUnique({ where: { id: 'singleton' } });
if (!cfg) {
  await prisma.systemConfig.create({ data: { id: 'singleton' } });
  console.log('✅ Created SystemConfig singleton');
} else {
  console.log('✅ SystemConfig already exists:', JSON.stringify(cfg, null, 2));
}

await prisma.$disconnect();
