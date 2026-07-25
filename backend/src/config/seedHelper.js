const User = require('../models/User');
const Claim = require('../models/Claim');
const fs = require('fs');
const path = require('path');

const autoSeedIfEmpty = async () => {
  try {
    const defaultPassword = 'Test@123';
    const passwordHash = await User.hashPassword(defaultPassword);

    // Ensure Patient 1
    let patient1 = await User.findOne({ email: 'patient1@test.com' });
    if (!patient1) {
      patient1 = await User.create({
        name: 'John Doe',
        email: 'patient1@test.com',
        passwordHash,
        role: 'patient',
      });
    } else {
      patient1.passwordHash = passwordHash;
      await patient1.save();
    }

    // Ensure Patient 2
    let patient2 = await User.findOne({ email: 'patient2@test.com' });
    if (!patient2) {
      patient2 = await User.create({
        name: 'Jane Smith',
        email: 'patient2@test.com',
        passwordHash,
        role: 'patient',
      });
    } else {
      patient2.passwordHash = passwordHash;
      await patient2.save();
    }

    // Ensure Insurer
    let insurer = await User.findOne({ email: 'insurer@test.com' });
    if (!insurer) {
      insurer = await User.create({
        name: 'Sarah Connor (Insurer)',
        email: 'insurer@test.com',
        passwordHash,
        role: 'insurer',
      });
    } else {
      insurer.passwordHash = passwordHash;
      await insurer.save();
    }

    // Ensure uploads directory and sample receipt exist
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const sampleFilePath = path.join(uploadsDir, 'sample-receipt.pdf');
    if (!fs.existsSync(sampleFilePath)) {
      fs.writeFileSync(sampleFilePath, '%PDF-1.4 Mock Receipt Document Content for Claims Testing');
    }

    // Seed sample claims if empty
    const claimCount = await Claim.countDocuments();
    if (claimCount === 0) {
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
          submissionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
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
          submissionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      ]);
    }

    console.log('✅ Seed users synced and verified:');
    console.log('   - patient1@test.com / Test@123');
    console.log('   - patient2@test.com / Test@123');
    console.log('   - insurer@test.com  / Test@123');
  } catch (error) {
    console.error('Auto-seeding error:', error.message);
  }
};

module.exports = autoSeedIfEmpty;
