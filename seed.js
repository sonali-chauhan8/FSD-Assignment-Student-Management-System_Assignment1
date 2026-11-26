require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/student_management_db';

const sampleStudents = [
  {
    name: 'Aarav Sharma',
    enrollmentNumber: 'BT24CSE001',
    email: 'aarav.sharma@college.edu',
    branch: 'CSE',
    semester: 4,
    section: 'A'
  },
  {
    name: 'Priya Verma',
    enrollmentNumber: 'BT24CSE014',
    email: 'priya.verma@college.edu',
    branch: 'CSE',
    semester: 4,
    section: 'B'
  },
  {
    name: 'Rohan Mehta',
    enrollmentNumber: 'BT23ECE022',
    email: 'rohan.mehta@college.edu',
    branch: 'ECE',
    semester: 6,
    section: 'A'
  },
  {
    name: 'Sneha Patel',
    enrollmentNumber: 'BT24IT009',
    email: 'sneha.patel@college.edu',
    branch: 'IT',
    semester: 4,
    section: 'A'
  },
  {
    name: 'Kabir Nair',
    enrollmentNumber: 'BT22ME031',
    email: 'kabir.nair@college.edu',
    branch: 'ME',
    semester: 8,
    section: 'C'
  },
  {
    name: 'Ananya Gupta',
    enrollmentNumber: 'BT25AIDS005',
    email: 'ananya.gupta@college.edu',
    branch: 'AI & DS',
    semester: 2,
    section: 'B'
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    let insertedCount = 0;
    for (const student of sampleStudents) {
      const exists = await Student.findOne({ enrollmentNumber: student.enrollmentNumber });
      if (!exists) {
        await Student.create(student);
        insertedCount += 1;
      }
    }

    const total = await Student.countDocuments();
    console.log(`Seeding complete. Inserted ${insertedCount} new record(s). Total students in DB: ${total}`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = sampleStudents;
