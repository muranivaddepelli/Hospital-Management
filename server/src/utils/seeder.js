require('dotenv').config();
const mongoose = require('mongoose');
const { User, Area, Task } = require('../models');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/daily-checklist';

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Area.deleteMany({});
    await Task.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user (password will be hashed by the model's pre-save hook)
    const admin = await User.create({
      email: 'admin@clinic.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin'
    });
    console.log('Created admin user: admin@clinic.com / admin123');

    // Create staff user (password will be hashed by the model's pre-save hook)
    await User.create({
      email: 'staff@clinic.com',
      password: 'staff123',
      name: 'Staff User',
      role: 'staff'
    });
    console.log('Created staff user: staff@clinic.com / staff123');

    // Create areas
    const areas = await Area.insertMany([
      {
        name: 'Consultation Chambers',
        code: 'CC',
        description: 'Patient consultation rooms',
        createdBy: admin._id
      },
      {
        name: 'Reception Area',
        code: 'RA',
        description: 'Front desk and waiting area',
        createdBy: admin._id
      },
      {
        name: 'Laboratory',
        code: 'LAB',
        description: 'Medical testing laboratory',
        createdBy: admin._id
      },
      {
        name: 'Pharmacy',
        code: 'PH',
        description: 'Medicine dispensary',
        createdBy: admin._id
      },
      {
        name: 'Emergency Room',
        code: 'ER',
        description: 'Emergency medical services',
        createdBy: admin._id
      }
    ]);
    console.log('Created areas');

    // Create tasks
    const tasks = [];
    
    // Consultation Chambers tasks
    const ccArea = areas.find(a => a.code === 'CC');
    tasks.push(
      { taskId: 'CC1', name: 'General Setup', description: 'Room is clean. Computers are ON. Lights and AC are working properly.', area: ccArea._id, order: 1, createdBy: admin._id },
      { taskId: 'CC2', name: 'Medical Equipment', description: 'BP monitor, stethoscope, thermometer are available and sanitized.', area: ccArea._id, order: 2, createdBy: admin._id },
      { taskId: 'CC3', name: 'Patient Files', description: 'Patient records system is accessible and previous day files are filed.', area: ccArea._id, order: 3, createdBy: admin._id },
      { taskId: 'CC4', name: 'Sanitization', description: 'Examination bed has fresh sheets. Room is sanitized.', area: ccArea._id, order: 4, createdBy: admin._id },
      { taskId: 'CC5', name: 'Supplies Check', description: 'Gloves, cotton, bandages, and basic supplies are stocked.', area: ccArea._id, order: 5, createdBy: admin._id }
    );

    // Reception Area tasks
    const raArea = areas.find(a => a.code === 'RA');
    tasks.push(
      { taskId: 'RA1', name: 'Front Desk Setup', description: 'Computer is ON. Printer has paper. Phone lines are working.', area: raArea._id, order: 1, createdBy: admin._id },
      { taskId: 'RA2', name: 'Waiting Area', description: 'Chairs are arranged. Magazine rack is organized. TV is working.', area: raArea._id, order: 2, createdBy: admin._id },
      { taskId: 'RA3', name: 'Registration Forms', description: 'Adequate patient registration forms available. Clipboards with pens.', area: raArea._id, order: 3, createdBy: admin._id },
      { taskId: 'RA4', name: 'Water Dispenser', description: 'Water dispenser is filled and cups are available.', area: raArea._id, order: 4, createdBy: admin._id }
    );

    // Laboratory tasks
    const labArea = areas.find(a => a.code === 'LAB');
    tasks.push(
      { taskId: 'LAB1', name: 'Equipment Calibration', description: 'All testing equipment is calibrated and ready for use.', area: labArea._id, order: 1, createdBy: admin._id },
      { taskId: 'LAB2', name: 'Sample Containers', description: 'Adequate sample containers, slides, and collection tubes available.', area: labArea._id, order: 2, createdBy: admin._id },
      { taskId: 'LAB3', name: 'Waste Disposal', description: 'Biohazard bins are empty. Sharp disposal containers checked.', area: labArea._id, order: 3, createdBy: admin._id },
      { taskId: 'LAB4', name: 'Refrigerator Check', description: 'Sample storage refrigerator temperature is within range.', area: labArea._id, order: 4, createdBy: admin._id }
    );

    // Pharmacy tasks
    const phArea = areas.find(a => a.code === 'PH');
    tasks.push(
      { taskId: 'PH1', name: 'Stock Verification', description: 'Essential medicines are in stock. No expired medicines on shelf.', area: phArea._id, order: 1, createdBy: admin._id },
      { taskId: 'PH2', name: 'Temperature Control', description: 'AC is working. Temperature-sensitive drugs stored properly.', area: phArea._id, order: 2, createdBy: admin._id },
      { taskId: 'PH3', name: 'Dispensing Counter', description: 'Counter is clean. Labels and packaging materials available.', area: phArea._id, order: 3, createdBy: admin._id }
    );

    // Emergency Room tasks
    const erArea = areas.find(a => a.code === 'ER');
    tasks.push(
      { taskId: 'ER1', name: 'Emergency Kit', description: 'Emergency kit is complete. Defibrillator is charged and functional.', area: erArea._id, order: 1, createdBy: admin._id },
      { taskId: 'ER2', name: 'Oxygen Supply', description: 'Oxygen cylinders are full. Masks and tubing available.', area: erArea._id, order: 2, createdBy: admin._id },
      { taskId: 'ER3', name: 'IV Supplies', description: 'IV stands, fluids, and cannulas are stocked.', area: erArea._id, order: 3, createdBy: admin._id },
      { taskId: 'ER4', name: 'Stretcher & Wheelchair', description: 'Stretcher and wheelchair are clean and accessible.', area: erArea._id, order: 4, createdBy: admin._id }
    );

    await Task.insertMany(tasks);
    console.log('Created tasks');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📌 Login Credentials:');
    console.log('   Admin: admin@clinic.com / admin123');
    console.log('   Staff: staff@clinic.com / staff123');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();

