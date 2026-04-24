
require('dotenv').config();
const mongoose = require('mongoose');

// Define a simple schema just for seeding
const AuditLogSchema = new mongoose.Schema({
    logId: String,
    actorId: String,
    actorEmail: String,
    actorRole: String,
    action: String,
    details: String,
    metadata: Object,
    createdAt: { type: Date, default: Date.now }
}, { collection: 'audit_logs' });

const AuditLog = mongoose.model('AuditLog', AuditLogSchema);

async function seed() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    const sampleLogs = [
        {
            logId: 'LOG-AD1001',
            actorId: '9c4bcb82-e664-4872-9f5a-585e6de6bb03', // Super Admin ID
            actorEmail: 'sawanpuri9907@gmail.com',
            actorRole: 'SUPER_ADMIN',
            action: 'USER_LOGIN',
            details: 'Super Admin successfully logged into the system.',
            metadata: { ip: '127.0.0.1', browser: 'Chrome' }
        },
        {
            logId: 'LOG-SP2002',
            actorId: 'sup-123',
            actorEmail: 'sawanfiver@gmail.com',
            actorRole: 'SUPPLIER',
            action: 'PRODUCT_UPLOAD',
            details: 'Supplier uploaded a new product: "Premium Cotton Tee"',
            metadata: { productId: 'p1', category: 'Apparel' }
        },
        {
            logId: 'LOG-AD1003',
            actorId: 'admin-011',
            actorEmail: 'sawanpuri011@gmail.com',
            actorRole: 'ADMIN',
            action: 'SUPPLIER_VERIFIED',
            details: 'Admin verified supplier account for "Delraw"',
            metadata: { supplierId: 's1' }
        }
    ];

    await AuditLog.insertMany(sampleLogs);
    console.log('Seeded 3 sample audit logs successfully!');
    await mongoose.disconnect();
}

seed().catch(err => console.error(err));
