const User = require('../models/User');
const Claim = require('../models/Claim');
const PolicyDocument = require('../models/PolicyDocument');
const { ensurePoliciesSeeded } = require('../services/policyRagService');
const claimIntelligence = require('../services/claimIntelligenceService');
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
        policyNumber: 'POL-COMP-PLATINUM',
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
        policyNumber: 'POL-GEN-2026',
      });
    } else {
      patient2.passwordHash = passwordHash;
      await patient2.save();
    }

    // Ensure Insurer
    let insurer = await User.findOne({ email: 'insurer@test.com' });
    if (!insurer) {
      insurer = await User.create({
        name: 'Sarah Connor (Adjudicator)',
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
      fs.writeFileSync(
        sampleFilePath,
        `CITY GENERAL MEDICAL CENTER
Department of Emergency Medicine
INVOICE NUMBER: INV-2026-88192
DATE OF SERVICE: 2026-07-20
PATIENT: John Doe
DIAGNOSIS: Acute Evaluation & Cardiac Monitoring
TOTAL BILLED: $1250.00`
      );
    }

    // Seed policies for RAG
    await ensurePoliciesSeeded();

    // Seed sample claims if empty
    const claimCount = await Claim.countDocuments();
    if (claimCount === 0) {
      const claim1 = new Claim({
        patientId: patient1._id,
        name: patient1.name,
        email: patient1.email,
        hospitalName: 'City General Medical Center',
        policyNumber: 'POL-COMP-PLATINUM',
        claimAmount: 1250.0,
        approvedAmount: null,
        description: 'Emergency ER Visit & Blood Work Diagnostics following acute abdominal pain',
        documentUrl: '/uploads/sample-receipt.pdf',
        status: 'Pending',
        submissionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      });
      const ai1 = await claimIntelligence.analyzeClaim(claim1);
      Object.assign(claim1, ai1);
      await claim1.save();

      const claim2 = new Claim({
        patientId: patient1._id,
        name: patient1.name,
        email: patient1.email,
        hospitalName: 'Metro Health Dental Clinic',
        policyNumber: 'POL-COMP-PLATINUM',
        claimAmount: 450.5,
        approvedAmount: 450.5,
        description: 'Routine Preventive Dental Cleaning & Full Mouth X-Ray Examination',
        documentUrl: '/uploads/sample-receipt.pdf',
        status: 'Approved',
        insurerComments: 'Fully covered under annual preventive care schedule with zero copay.',
        submissionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        reviewedBy: insurer._id,
        reviewedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        adjudicationDecisionType: 'Accepted AI Recommendation',
      });
      const ai2 = await claimIntelligence.analyzeClaim(claim2);
      Object.assign(claim2, ai2);
      await claim2.save();

      const claim3 = new Claim({
        patientId: patient2._id,
        name: patient2.name,
        email: patient2.email,
        hospitalName: 'Apex Orthopedic Hospital',
        policyNumber: 'POL-GEN-2026',
        claimAmount: 3200.0,
        approvedAmount: null,
        description: 'Outpatient Knee MRI & Physical Therapy Rehabilitation Session',
        documentUrl: '/uploads/sample-receipt.pdf',
        status: 'Pending',
        submissionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      });
      const ai3 = await claimIntelligence.analyzeClaim(claim3);
      Object.assign(claim3, ai3);
      await claim3.save();
    }

    console.log('✅ ClaimIQ AI-Powered Platform Seeded Successfully:');
    console.log('   - patient1@test.com / Test@123');
    console.log('   - patient2@test.com / Test@123');
    console.log('   - insurer@test.com  / Test@123');
  } catch (error) {
    console.error('Auto-seeding error:', error.message);
  }
};

module.exports = autoSeedIfEmpty;
