const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('./models/User');
const Claim = require('./models/Claim');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/claims_management';
    console.log(`Connecting to database at ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    // Clear existing data
    await User.deleteMany({});
    await Claim.deleteMany({});
    console.log('Cleared existing User and Claim data.');

    const defaultPassword = 'Test@123';
    const passwordHash = await User.hashPassword(defaultPassword);

    // Create 2 mock patients and 1 mock insurer
    const patient1 = await User.create({
      name: 'John Doe',
      email: 'patient1@test.com',
      passwordHash,
      role: 'patient',
    });

    const patient2 = await User.create({
      name: 'Jane Smith',
      email: 'patient2@test.com',
      passwordHash,
      role: 'patient',
    });

    const insurer = await User.create({
      name: 'Sarah Connor (Insurer)',
      email: 'insurer@test.com',
      passwordHash,
      role: 'insurer',
    });

    console.log('Created Seed Users:');
    console.log(` - Patient 1: patient1@test.com / ${defaultPassword}`);
    console.log(` - Patient 2: patient2@test.com / ${defaultPassword}`);
    console.log(` - Insurer:   insurer@test.com / ${defaultPassword}`);

    // Create dummy sample file in uploads if not present
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const sampleFilePath = path.join(uploadsDir, 'sample-receipt.pdf');
    if (!fs.existsSync(sampleFilePath)) {
      fs.writeFileSync(sampleFilePath, '%PDF-1.4 Mock Receipt Document Content for Claims Testing');
    }

    // Seed mock claims
    await Claim.create([
      {
        patientId: patient1._id,
        name: patient1.name,
        email: patient1.email,
        claimAmount: 1250.00,
        approvedAmount: null,
        description: 'Emergency ER Visit & Blood Work Diagnostics',
        documentUrl: '/uploads/sample-receipt.pdf',
        status: 'Pending',
        submissionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        patientId: patient1._id,
        name: patient1.name,
        email: patient1.email,
        claimAmount: 450.50,
        approvedAmount: 450.50,
        description: 'Routine Dental Cleaning & X-Ray Examination',
        documentUrl: '/uploads/sample-receipt.pdf',
        status: 'Approved',
        insurerComments: 'Fully covered under preventive care policy.',
        submissionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        reviewedBy: insurer._id,
        reviewedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        patientId: patient2._id,
        name: patient2.name,
        email: patient2.email,
        claimAmount: 3200.00,
        approvedAmount: null,
        description: 'Outpatient Knee MRI & Physical Therapy Session',
        documentUrl: '/uploads/sample-receipt.pdf',
        status: 'Pending',
        submissionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
    ]);

    console.log('Seeded sample claims successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
