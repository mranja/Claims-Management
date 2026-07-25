const mongoose = require('mongoose');
const autoSeedIfEmpty = require('./seedHelper');

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/claims_management';

  try {
    // Attempt standard connection with 3s server selection timeout
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`✅ MongoDB Connected to external database: ${conn.connection.host}`);
    await autoSeedIfEmpty();
  } catch (error) {
    console.warn(`⚠️ Could not connect to local MongoDB daemon (${error.message}).`);
    console.log(`⚡ Auto-launching MongoMemoryServer in-memory database fallback...`);

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoServer.getUri();

      const conn = await mongoose.connect(inMemoryUri);
      console.log(`🚀 Connected to In-Memory MongoDB Server successfully at ${inMemoryUri}`);

      // Auto-seed in-memory database
      await autoSeedIfEmpty();
    } catch (memError) {
      console.error(`❌ In-memory MongoDB launch error: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
