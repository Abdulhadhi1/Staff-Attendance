const mongoose = require('mongoose');
require('dotenv').config();
const Staff = require('./models/Staff');
const Department = require('./models/Department');
const EmailTemplate = require('./models/EmailTemplate');
const IpWhitelist = require('./models/IpWhitelist');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Create Default Department
        let dept = await Department.findOne({ name: 'IT' });
        if (!dept) {
            dept = await Department.create({ name: 'IT' });
            console.log('Created IT Department');
        }

        // Create Admin User
        const adminEmail = process.env.EMAIL_USER || 'admin@example.com';
        let admin = await Staff.findOne({ email: adminEmail });
        if (!admin) {
            admin = await Staff.create({
                name: 'Super Admin',
                email: adminEmail,
                department: dept._id,
                isAdmin: true,
                isActive: true,
                password: 'admin123' // Default password
            });
            console.log('Created Admin User:', admin.email);
        }

        // Create Default Email Templates
        const templates = [
            {
                key: 'otp_login',
                subject: 'Your Login OTP',
                body: '<p>Hello {{name}},</p><p>Your OTP for login is: <b>{{otp}}</b></p><p>It covers 60 seconds.</p>',
                variables: ['{{name}}', '{{otp}}']
            },
            {
                key: 'missed_clockout',
                subject: 'Missed Clock Out Alert',
                body: '<p>Hello {{name}},</p><p>You forgot to clock out on {{date}}.</p>',
                variables: ['{{name}}', '{{date}}']
            }
        ];

        for (const tmpl of templates) {
            const exists = await EmailTemplate.findOne({ key: tmpl.key });
            if (!exists) {
                await EmailTemplate.create(tmpl);
                console.log(`Created Template: ${tmpl.key}`);
            }
        }

        // Whitelist Localhost
        const localIp = await IpWhitelist.findOne({ ipAddress: '127.0.0.1' });
        if (!localIp) {
            await IpWhitelist.create({ ipAddress: '127.0.0.1', description: 'Localhost' });
            console.log('Whitelisted 127.0.0.1');
        }

        // Also whitelist ::1
        const ipv6Local = await IpWhitelist.findOne({ ipAddress: '::1' });
        if (!ipv6Local) {
            await IpWhitelist.create({ ipAddress: '::1', description: 'Localhost IPv6' });
            console.log('Whitelisted ::1');
        }

        console.log('Seeding Complete');
        process.exit(0);
    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seedData();
