import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Patient } from '@/models/Patient';
import { NFCCard } from '@/models/NFCCard';
import { Report } from '@/models/Report';
import { Prescription } from '@/models/Prescription';
import { TimelineEvent } from '@/models/TimelineEvent';
import { Session } from '@/models/Session';
import { AuditLog } from '@/models/AuditLog';
import { UserRole } from '@/lib/constants/roles';

export async function GET(req: NextRequest) {
  // Only allow seeding in development mode unless explicitly allowed via environment variable
  if (process.env.NODE_ENV !== 'development' && process.env.ALLOW_SEED !== 'true') {
    return NextResponse.json(
      { success: false, message: 'Seeding is only allowed in development mode' },
      { status: 403 }
    );
  }

  try {
    await connectDB();

    // 1. Clean existing database
    await Promise.all([
      User.deleteMany({}),
      Patient.deleteMany({}),
      NFCCard.deleteMany({}),
      Report.deleteMany({}),
      Prescription.deleteMany({}),
      TimelineEvent.deleteMany({}),
      Session.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);

    // 2. Create Patient Users
    const patientUser = await User.create({
      email: 'patient@swasthyatap.com',
      password: 'password123',
      role: UserRole.PATIENT,
      isActive: true,
    });

    const patientUser2 = await User.create({
      email: 'priya@swasthyatap.com',
      password: 'password123',
      role: UserRole.PATIENT,
      isActive: true,
    });

    const patientUser3 = await User.create({
      email: 'rohan@swasthyatap.com',
      password: 'password123',
      role: UserRole.PATIENT,
      isActive: true,
    });

    // 3. Create Doctor User
    await User.create({
      email: 'doctor@swasthyatap.com',
      password: 'password123',
      role: UserRole.DOCTOR,
      isActive: true,
    });

    // 4. Create Patient Profiles
    const patientProfile = await Patient.create({
      userId: patientUser._id,
      publicId: crypto.randomUUID(),
      fullName: 'Aditya Sharma',
      dateOfBirth: new Date('1995-08-15'),
      gender: 'male',
      bloodGroup: 'O+',
      phone: '+91 98765 43210',
      address: '123, Health Avenue, Jaipur, Rajasthan, India',
      criticalAllergies: ['Penicillin', 'Peanuts'],
      medicalConditions: ['Asthma', 'Hypertension'],
      currentMedicines: ['Albuterol Inhaler (1 puff as needed)', 'Lisinopril (10mg daily)'],
      medicalDevices: ['Inhaler'],
      emergencyContacts: [
        { name: 'Rajesh Sharma', relationship: 'father', phone: '+91 98765 43211' },
        { name: 'Priyanka Sharma', relationship: 'mother', phone: '+91 98765 43212' },
      ],
    });

    const patientProfile2 = await Patient.create({
      userId: patientUser2._id,
      publicId: crypto.randomUUID(),
      fullName: 'Priya Patel',
      dateOfBirth: new Date('1990-04-22'),
      gender: 'female',
      bloodGroup: 'B+',
      phone: '+91 99887 76655',
      address: '456, Sector 15, Gandhinagar, Gujarat, India',
      criticalAllergies: ['Sulfonamides'],
      medicalConditions: ['Type 1 Diabetes'],
      currentMedicines: ['Insulin Glargine (15 units nightly)', 'Humalog (rapid insulin before meals)'],
      medicalDevices: ['Continuous Glucose Monitor (CGM)', 'Insulin Pump'],
      emergencyContacts: [
        { name: 'Amit Patel', relationship: 'husband', phone: '+91 99887 76656' },
      ],
    });

    const patientProfile3 = await Patient.create({
      userId: patientUser3._id,
      publicId: crypto.randomUUID(),
      fullName: 'Rohan Malhotra',
      dateOfBirth: new Date('2001-11-05'),
      gender: 'male',
      bloodGroup: 'A-',
      phone: '+91 91234 56789',
      address: '789, Park Lane, Mumbai, Maharashtra, India',
      criticalAllergies: [],
      medicalConditions: ['Epilepsy'],
      currentMedicines: ['Valproic Acid (250mg twice daily)', 'Levetiracetam (500mg twice daily)'],
      medicalDevices: [],
      emergencyContacts: [
        { name: 'Kavita Malhotra', relationship: 'mother', phone: '+91 91234 56780' },
      ],
    });

    // 5. Hash NFC tokens and create NFCCards
    const rawToken = 'test-token-123';
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    await NFCCard.create({
      patientId: patientProfile._id,
      hashedToken,
      publicCardId: crypto.randomUUID(),
      status: 'active',
      isActive: true,
    });

    const rawToken2 = 'card-token-456';
    const hashedToken2 = crypto.createHash('sha256').update(rawToken2).digest('hex');
    await NFCCard.create({
      patientId: patientProfile2._id,
      hashedToken: hashedToken2,
      publicCardId: crypto.randomUUID(),
      status: 'active',
      isActive: true,
    });

    const rawToken3 = 'card-token-789';
    const hashedToken3 = crypto.createHash('sha256').update(rawToken3).digest('hex');
    await NFCCard.create({
      patientId: patientProfile3._id,
      hashedToken: hashedToken3,
      publicCardId: crypto.randomUUID(),
      status: 'active',
      isActive: true,
    });

    // 6. Create Reports
    await Report.create([
      {
        patientId: patientProfile._id,
        publicId: crypto.randomUUID(),
        title: 'Complete Blood Count (CBC)',
        summary: 'All vitals normal. Slight iron deficiency.',
        category: 'lab',
        doctorName: 'Ramesh Gupta',
        hospitalName: 'Jaipur Clinic',
        reportDate: new Date('2026-06-10'),
      },
      {
        patientId: patientProfile._id,
        publicId: crypto.randomUUID(),
        title: 'Chest X-Ray',
        summary: 'Clear lungs. No signs of infection.',
        category: 'imaging',
        doctorName: 'Neha Sen',
        hospitalName: 'City Diagnostics',
        reportDate: new Date('2026-07-01'),
      },
    ]);

    // 7. Create Prescriptions
    await Prescription.create([
      {
        patientId: patientProfile._id,
        publicId: crypto.randomUUID(),
        diagnosis: 'Acute Bronchitis',
        doctorName: 'Ramesh Gupta',
        hospitalName: 'Jaipur Clinic',
        prescribedAt: new Date('2026-07-20'),
        medicines: [
          {
            name: 'Azithromycin (500mg)',
            dosage: '1 tablet daily',
            durationDays: 5,
            morning: true,
            afternoon: false,
            night: false,
            instructions: 'Take after breakfast',
          },
          {
            name: 'Montelukast (10mg)',
            dosage: '1 tablet nightly',
            durationDays: 10,
            morning: false,
            afternoon: false,
            night: true,
            instructions: 'Take before sleeping',
          },
        ],
      },
    ]);

    // 8. Create Timeline Events
    await TimelineEvent.create([
      {
        patientId: patientProfile._id,
        publicId: crypto.randomUUID(),
        title: 'Annual Health Checkup',
        eventType: 'checkup',
        eventDate: new Date('2026-05-15'),
        doctorName: 'Ramesh Gupta',
        hospitalName: 'Jaipur Clinic',
        description: 'General health checkup. Vitals stable. Re-checked asthma condition.',
      },
      {
        patientId: patientProfile._id,
        publicId: crypto.randomUUID(),
        title: 'Asthma Consultation',
        eventType: 'diagnosis',
        eventDate: new Date('2026-07-20'),
        doctorName: 'Ramesh Gupta',
        hospitalName: 'Jaipur Clinic',
        description: 'Consultation due to increased coughing. Prescribed short course of oral bronchodilators.',
      },
    ]);

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        tokens: [rawToken, rawToken2, rawToken3],
        patientUsers: ['patient@swasthyatap.com', 'priya@swasthyatap.com', 'rohan@swasthyatap.com'],
        doctorUser: 'doctor@swasthyatap.com',
        password: 'password123',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to seed database', error: error.message },
      { status: 500 }
    );
  }
}
