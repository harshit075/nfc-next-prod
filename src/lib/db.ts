import mongoose from 'mongoose';
import logger from './utils/logger';
import crypto from 'crypto';
import '@/models/Citizen';
import '@/models/NFCCard';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function runDbUpdate() {
  if ((global as any).hasRunDbUpdateRahul) return;
  (global as any).hasRunDbUpdateRahul = true;

  try {
    const Citizen = mongoose.models.Citizen || mongoose.model('Citizen');
    const NFCCard = mongoose.models.NFCCard || mongoose.model('NFCCard');

    const rawToken = "22ae6ae9f4480c1e28facb8730dcf4ede8c20dbd2f2271a3e8819c41aa34e379";
    const hash = crypto.createHash('sha256').update(rawToken).digest('hex');

    // Look for existing cards
    let card1 = await NFCCard.findOne({ hashedToken: rawToken });
    let card2 = await NFCCard.findOne({ hashedToken: hash });

    let citizenId = card1?.patientId || card2?.patientId;

    const citizenData = {
      fullName: "Rahul Sethi",
      bloodGroup: "A+",
      age: 28,
      address: "742 Evergreen Terrace, Springfield, OR, USA",
      allergies: "Penicillin, Pollen",
      medications: "Cetirizine 10mg (once daily), Albuterol (as needed)",
      chronicConditions: "Mild Asthma",
      specialInstructions: "Keep inhaler handy at all times",
      insuranceCompany: "Star Health Insurance",
      insurancePolicyNumber: "POL-987654-XYZ",
      emergencyContacts: [
        { name: "Rajesh Chhipa", relation: "Father", phone: "+91 9988776655" }
      ],
      phoneNumber: "+91 9876543210",
      email: "aditya.chhipa@example.com",
      isDnr: false,
      isBloodDonor: true,
      donorRadiusKm: 5.0
    };

    if (!citizenId) {
      // Create new citizen
      const citizen = await Citizen.create({
        profileId: crypto.randomUUID(),
        ...citizenData
      });
      citizenId = citizen._id;
      logger.info(`[DB Update] Created new citizen with ID: ${citizenId}`);
    } else {
      // Update existing citizen
      await Citizen.findByIdAndUpdate(citizenId, citizenData);
      logger.info(`[DB Update] Updated existing citizen with ID: ${citizenId}`);
    }

    // Ensure NFCCard exists for rawToken directly
    if (!card1) {
      await NFCCard.create({
        patientId: citizenId,
        hashedToken: rawToken,
        publicCardId: crypto.randomUUID(),
        status: 'active',
        isActive: true,
      });
      logger.info(`[DB Update] Created NFCCard for raw token hash: ${rawToken}`);
    }

    // Ensure NFCCard exists for hashed token
    if (!card2) {
      await NFCCard.create({
        patientId: citizenId,
        hashedToken: hash,
        publicCardId: crypto.randomUUID(),
        status: 'active',
        isActive: true,
      });
      logger.info(`[DB Update] Created NFCCard for double hash: ${hash}`);
    }

    logger.info("[DB Update] Successfully executed DB seeding/update for token!");
  } catch (err: any) {
    logger.error(`[DB Update] Error running DB update: ${err.message}`);
  }
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      autoIndex: true,
    };

    logger.info('Connecting to MongoDB database...');
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongooseInstance) => {
      logger.info('MongoDB connection established successfully.');
      runDbUpdate().catch(() => null);
      return mongooseInstance;
    }).catch((err) => {
      logger.error(`MongoDB connection failed: ${err.message}`);
      cached.promise = null;
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export async function disconnectDB() {
  try {
    await mongoose.connection.close();
    logger.info('Database connection closed gracefully.');
  } catch (error) {
    const err = error as Error;
    logger.error(`Error closing database connection: ${err.message}`);
  }
}
