require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('../models');

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/daily-checklist';

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const ADMIN_EMAIL = 'admin@clinic.com';
    const ADMIN_PASSWORD = 'admin123';

    // Admin user
    let admin = await User.findOne({ email: ADMIN_EMAIL });

    if (!admin) {
      await User.create({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        name: 'Admin User',
        role: 'admin',
      });
      console.log('✅ Admin user created');
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    // Staff user
    let staff = await User.findOne({ email: 'staff@clinic.com' });

    if (!staff) {
      await User.create({
        email: 'staff@clinic.com',
        password: 'staff123',
        name: 'Staff User',
        role: 'staff',
      });
      console.log('✅ Staff user created');
    } else {
      console.log('ℹ️ Staff user already exists');
    }

    console.log('\n📌 LOGIN CREDENTIALS');
    console.log('----------------------');
    console.log(`Admin Email    : ${ADMIN_EMAIL}`);
    console.log(`Admin Password : ${ADMIN_PASSWORD}`);
    console.log('----------------------\n');

    console.log('Seeder completed safely (no areas/tasks touched)');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
